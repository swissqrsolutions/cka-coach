// Generates C:/code/cka-coach/content/mocks.json
const fs = require('fs');
const TS = 'TROUBLESHOOTING', CA = 'CLUSTER ARCHITECTURE', SN = 'SERVICES & NETWORKING', WS = 'WORKLOADS & SCHEDULING', ST = 'STORAGE';
const ap = y => "cat <<'EOF' | kubectl apply -f -\n" + y.trim() + "\nEOF";
const ns = n => `kubectl create namespace ${n} --dry-run=client -o yaml | kubectl apply -f -`;
const HELM = 'command -v helm >/dev/null || curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash';
const GWCRD = 'kubectl get crd gateways.gateway.networking.k8s.io >/dev/null 2>&1 || kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml';
const LOCALPATH = 'kubectl get deploy -A | grep -q local-path-provisioner || kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.30/deploy/local-path-storage.yaml';
const CMCRD = 'kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.crds.yaml';
const ETCDCTL = 'command -v etcdctl >/dev/null || (apt-get update -qq && apt-get install -y -qq etcd-client)';
const tls = (n, name, cn) => `openssl req -x509 -nodes -newkey rsa:2048 -days 365 -subj "/CN=${cn}" -keyout /tmp/${name}.key -out /tmp/${name}.crt 2>/dev/null\nkubectl -n ${n} create secret tls ${name} --cert=/tmp/${name}.crt --key=/tmp/${name}.key --dry-run=client -o yaml | kubectl apply -f -`;
const setup = (...l) => l.join('\n') + '\nclear';
const s = (title, cmds, see, why) => ({ title, cmds: [].concat(cmds), see, why });
const T = (topic, weight, title, reported, question, keys, setupStr, steps, verify, docs, beginner) =>
  ({ topic, weight, title, reported, question, keys, setup: setupStr, steps, verify, docs, beginner });

const ETCD_FLAGS = '--endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key';

/* ===================== MOCK 1 (easiest) ===================== */
const m1 = [
T(TS, 7, 'Node NotReady: kubelet stopped', 'very common 2025-26 (node/kubelet troubleshooting)',
`ssh cka01001
The worker node node01 is reported as NotReady. Investigate the cause and bring node01 back to the Ready state. Your fix must survive a reboot of node01.`,
['node = node01', 'fix must survive reboot (enable the service)', 'do NOT reinstall Kubernetes'],
setup("ssh node01 'systemctl stop kubelet; systemctl disable kubelet' 2>/dev/null", 'sleep 45'),
[ s('See which node is sick', 'kubectl get nodes', 'node01   NotReady', 'NotReady usually means the kubelet on that node is not talking.'),
  s('Log in to node01', 'ssh node01', '', 'The kubelet runs on the node itself, not as a pod.'),
  s('Check the kubelet service', 'systemctl status kubelet --no-pager', 'Active: inactive (dead) ... disabled', 'Shows the kubelet is stopped and will not start at boot.'),
  s('Start it and enable it at boot', ['systemctl enable --now kubelet', 'systemctl is-enabled kubelet'], 'enabled', 'enable = survives reboot, --now = start right away.'),
  s('Go back and check', ['exit', 'kubectl get nodes'], 'node01   Ready', 'Wait up to 30s for the node to report Ready.') ],
['kubectl get nodes', 'ssh node01 systemctl is-enabled kubelet'],
'', 'The kubelet program on node01 is switched off; turn it on and make it start automatically.'),

T(TS, 6, 'Service has no endpoints', 'common 2025-26 (service/endpoint troubleshooting)',
`ssh cka01002
In namespace shop the Service cart does not forward traffic to the Pods of Deployment cart. Fix the Service so that it routes to the Deployment's Pods. Do not modify the Deployment.`,
['namespace = shop', 'service = cart', 'do NOT change deployment cart'],
setup(ns('shop'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: cart, namespace: shop}
spec:
  replicas: 2
  selector: {matchLabels: {app: cart}}
  template:
    metadata: {labels: {app: cart}}
    spec:
      containers:
      - {name: nginx, image: nginx:1.27-alpine, ports: [{containerPort: 80}]}
---
apiVersion: v1
kind: Service
metadata: {name: cart, namespace: shop}
spec:
  selector: {app: carts}
  ports: [{port: 80, targetPort: 80}]`)),
[ s('See the empty endpoints', 'kubectl -n shop get endpointslices -l kubernetes.io/service-name=cart', 'ENDPOINTS   <unset>', 'No endpoints = the Service selector matches no Pod.'),
  s('Compare labels and selector', ['kubectl -n shop get pods --show-labels', 'kubectl -n shop get svc cart -o wide'], 'pods app=cart, selector app=carts', 'One letter typo in the selector.'),
  s('Fix the selector', `kubectl -n shop patch svc cart -p '{"spec":{"selector":{"app":"cart"}}}'`, 'service/cart patched', 'Point the Service at the real Pod label.'),
  s('Test from inside the cluster', 'kubectl -n shop run tmp --rm -it --restart=Never --image=busybox:1.36 -- wget -qO- -T3 cart', '<title>Welcome to nginx!</title>', 'A real request proves traffic flows.') ],
['kubectl -n shop get endpointslices -l kubernetes.io/service-name=cart'],
'', 'The Service is looking for the wrong Pod label; correct its selector.'),

T(TS, 5, 'Pods stuck Pending (requests too big)', 'common 2025-26 (Pending pod is the classic)',
`ssh cka01003
The Pods of Deployment reporter in namespace batch stay Pending. Find the reason and fix it so that all replicas are Running. Set the memory request of the container to 128Mi. Keep the number of replicas unchanged.`,
['namespace = batch', 'deployment = reporter', 'memory request = 128Mi', 'keep replicas'],
setup(ns('batch'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: reporter, namespace: batch}
spec:
  replicas: 2
  selector: {matchLabels: {app: reporter}}
  template:
    metadata: {labels: {app: reporter}}
    spec:
      containers:
      - name: reporter
        image: busybox:1.36
        command: ["sh","-c","sleep 3600"]
        resources: {requests: {memory: 64Gi}}`)),
[ s('See Pending pods', 'kubectl -n batch get pods', 'reporter-xxx   0/1   Pending', 'Pending = scheduler cannot find a node.'),
  s('Read the reason', 'kubectl -n batch describe pod -l app=reporter | grep -A3 Events', 'Insufficient memory', 'Events always tell why a pod is not scheduled.'),
  s('Lower the request', 'kubectl -n batch set resources deploy reporter --requests=memory=128Mi', 'deployment.apps/reporter resource requirements updated', 'Asks for less memory so a node fits.'),
  s('Check', 'kubectl -n batch get pods', '2 pods Running', 'New pods replace the old Pending ones.') ],
['kubectl -n batch get deploy reporter -o jsonpath="{.spec.template.spec.containers[0].resources}"', 'kubectl -n batch get pods'],
'', 'The pods ask for more memory than any node has; ask for less.'),

T(TS, 6, 'CrashLoop / restarts: wrong liveness probe', 'common 2025-26',
`ssh cka01004
Deployment api in namespace web keeps restarting its Pods. Identify the cause and fix it. The nginx container listens on port 80. Do not delete the Deployment.`,
['namespace = web', 'deployment = api', 'container port = 80', 'do NOT delete the deployment'],
setup(ns('web'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: api, namespace: web}
spec:
  replicas: 1
  selector: {matchLabels: {app: api}}
  template:
    metadata: {labels: {app: api}}
    spec:
      containers:
      - name: nginx
        image: nginx:1.27-alpine
        ports: [{containerPort: 80}]
        livenessProbe:
          httpGet: {path: /, port: 8080}
          initialDelaySeconds: 3
          periodSeconds: 3
          failureThreshold: 2`)),
[ s('See restarts', 'kubectl -n web get pods', 'RESTARTS 3 (or CrashLoopBackOff)', 'Growing RESTARTS = something kills the container.'),
  s('Read events', 'kubectl -n web describe pod -l app=api | grep -i -A2 liveness', 'Liveness probe failed: ... :8080 ... connection refused', 'Probe checks port 8080 but nginx uses 80.'),
  s('Fix the probe port', `kubectl -n web patch deploy api --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/livenessProbe/httpGet/port","value":80}]'`, 'deployment.apps/api patched', 'Probe now checks the right port.'),
  s('Check', ['kubectl -n web rollout status deploy api', 'kubectl -n web get pods'], 'RESTARTS 0', 'New pod stays healthy.') ],
['kubectl -n web get deploy api -o jsonpath="{.spec.template.spec.containers[0].livenessProbe.httpGet.port}"'],
'Configure Liveness, Readiness and Startup Probes (search: livenessProbe httpGet)', 'The health check knocks on the wrong door (8080) so Kubernetes keeps restarting the pod.'),

T(TS, 6, 'Extract error lines from pod logs', 'occasional 2025-26',
`ssh cka01005
Pod legacy-app in namespace ops writes log lines to stdout. Write all log lines that contain the string ERROR into the file /opt/course/5/errors.txt on the controlplane node.`,
['namespace = ops', 'pod = legacy-app', 'file = /opt/course/5/errors.txt', 'only lines with ERROR'],
setup(ns('ops'), ap(`
apiVersion: v1
kind: Pod
metadata: {name: legacy-app, namespace: ops}
spec:
  containers:
  - name: app
    image: busybox:1.36
    command: ["sh","-c","i=0; while true; do echo \\"INFO tick $i\\"; [ $((i%3)) -eq 0 ] && echo \\"ERROR disk slow $i\\"; i=$((i+1)); sleep 2; done"]`)),
[ s('Look at the logs', 'kubectl -n ops logs legacy-app --tail=6', 'INFO tick 4\nERROR disk slow 3', 'See what the lines look like.'),
  s('Save only ERROR lines', ['mkdir -p /opt/course/5', 'kubectl -n ops logs legacy-app | grep ERROR > /opt/course/5/errors.txt'], '', 'grep keeps only matching lines.'),
  s('Check the file', 'head -3 /opt/course/5/errors.txt', 'ERROR disk slow 0', 'File must hold only ERROR lines.') ],
['grep -vc ERROR /opt/course/5/errors.txt  # should print 0'],
'', 'Copy the error lines from a pod log into a file.'),

T(CA, 7, 'Helm: template Argo CD without CRDs', 'very common 2025-26',
`ssh cka01006
Install Argo CD in the cluster using Helm:
- Add the official Argo CD Helm repository with the name argocd (https://argoproj.github.io/argo-helm).
- Generate a Helm template of the Argo CD chart version 7.7.3 for namespace argocd and save it to /root/argo-helm.yaml. Configure the chart so that it does NOT install CRDs (the CRDs are already installed in the cluster).
- Install Argo CD with Helm as release argocd, same version and configuration, in namespace argocd.`,
['repo name = argocd', 'chart version = 7.7.3', 'namespace = argocd', 'file = /root/argo-helm.yaml', 'CRDs NOT installed (crds.install=false)'],
setup(HELM, 'kubectl apply -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.13.2"', ns('argocd')),
[ s('Add the repo', ['helm repo add argocd https://argoproj.github.io/argo-helm', 'helm repo update'], '"argocd" has been added', 'Tells Helm where the chart lives.'),
  s('Find the chart and version', 'helm search repo argocd/argo-cd --versions | head -5', 'argocd/argo-cd  7.7.3 ...', 'Confirm the exact version exists.'),
  s('Find the CRD switch', 'helm show values argocd/argo-cd --version 7.7.3 | grep -A3 "^crds"', 'crds:\n  install: true', 'The chart value that controls CRDs.'),
  s('Write the template', 'helm template argocd argocd/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > /root/argo-helm.yaml', '', 'template = render YAML only, nothing installed.'),
  s('Prove no CRDs inside', 'grep -c "kind: CustomResourceDefinition" /root/argo-helm.yaml', '0', 'Zero CRDs means the switch worked.'),
  s('Install the release', ['helm install argocd argocd/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false', 'helm -n argocd list'], 'argocd  argocd  1  deployed  argo-cd-7.7.3', 'Real install with the same settings.') ],
['helm -n argocd list', 'grep -c "kind: CustomResourceDefinition" /root/argo-helm.yaml', 'kubectl -n argocd get pods'],
'helm.sh docs: helm template / helm install (search: helm template --set); kubernetes.io not needed',
'Use Helm to print Argo CD YAML into a file and install it, telling the chart not to add CRDs.'),

T(CA, 6, 'Install cri-dockerd + kernel sysctl', 'very common 2025-26',
`ssh cka01007
Prepare this node for a Docker-based container runtime:
- Install the Debian package /root/cri-dockerd.deb using dpkg.
- Enable and start the cri-docker service.
- Configure these kernel parameters so they persist across reboots (file /etc/sysctl.d/k8s.conf):
  net.bridge.bridge-nf-call-iptables = 1
  net.ipv4.ip_forward = 1
  net.ipv6.conf.all.forwarding = 1
  net.netfilter.nf_conntrack_max = 131072`,
['package = /root/cri-dockerd.deb', 'use dpkg', 'service = cri-docker', 'persistent sysctl file /etc/sysctl.d/k8s.conf'],
setup('test -f /root/cri-dockerd.deb || curl -fsSLo /root/cri-dockerd.deb https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.16/cri-dockerd_0.3.16.3-0.ubuntu-jammy_amd64.deb || echo "download failed - check release page"'),
[ s('Install the package', 'dpkg -i /root/cri-dockerd.deb', 'Setting up cri-dockerd ...', 'dpkg installs a local .deb file.'),
  s('Enable and start the service', ['systemctl enable --now cri-docker.service', 'systemctl status cri-docker --no-pager | head -5'], 'Loaded: ... enabled', 'enable = at boot, --now = start now.'),
  s('Write the sysctl file', "cat <<'EOF' > /etc/sysctl.d/k8s.conf\nnet.bridge.bridge-nf-call-iptables = 1\nnet.ipv4.ip_forward = 1\nnet.ipv6.conf.all.forwarding = 1\nnet.netfilter.nf_conntrack_max = 131072\nEOF", '', 'Files in /etc/sysctl.d survive reboots.'),
  s('Load the settings now', ['modprobe br_netfilter', 'sysctl --system | grep -E "bridge-nf-call-iptables|ip_forward|all.forwarding|conntrack_max"'], 'net.ipv4.ip_forward = 1 ...', 'Applies the file without rebooting.') ],
['dpkg -l | grep cri-dockerd', 'systemctl is-enabled cri-docker', 'sysctl net.ipv4.ip_forward net.netfilter.nf_conntrack_max'],
'kubernetes.io: Container Runtimes (search: cri-dockerd, sysctl ip_forward)',
'Install a runtime package and turn on 4 Linux network settings permanently. On Killercoda Docker is absent, so cri-docker may not stay "active"; dpkg, enable and sysctl still practise.'),

T(CA, 6, 'CRDs: list cert-manager CRDs + explain a field', 'very common 2025-26',
`ssh cka01008
cert-manager CRDs are installed in the cluster.
- Create a list of all cert-manager Custom Resource Definitions and save it to /root/resources.yaml. Use kubectl's default output format; do not set an output format.
- Using kubectl, extract the documentation for the subject specification field of the Certificate custom resource and save it to /root/subject.yaml.`,
['file1 = /root/resources.yaml (default output)', 'file2 = /root/subject.yaml', 'field = Certificate spec.subject'],
setup(CMCRD),
[ s('List cert-manager CRDs', 'kubectl get crd | grep cert-manager', 'certificates.cert-manager.io ...', 'Default output = plain table, no -o flag.'),
  s('Save the list', 'kubectl get crd | grep cert-manager > /root/resources.yaml', '', 'Redirect the same output into the file.'),
  s('Save the field docs', 'kubectl explain certificate.spec.subject > /root/subject.yaml', '', 'explain prints built-in docs for any field.'),
  s('Check', 'head -5 /root/subject.yaml', 'GROUP: cert-manager.io  KIND: Certificate  FIELD: subject', 'Confirms the right field was saved.') ],
['wc -l /root/resources.yaml', 'grep -i subject /root/subject.yaml | head -2'],
'', 'Show installed custom resource types in a file, and save the help text for one field.'),

T(CA, 6, 'RBAC: ServiceAccount, Role, RoleBinding', 'common 2025-26',
`ssh cka01009
In namespace finance create a ServiceAccount named reporter. Create a Role named pod-reader that allows only get, list and watch on pods. Bind the Role to the ServiceAccount with a RoleBinding named reporter-binding.`,
['namespace = finance', 'sa = reporter', 'role = pod-reader (get,list,watch pods)', 'rolebinding = reporter-binding'],
setup(ns('finance')),
[ s('Create the ServiceAccount', 'kubectl -n finance create serviceaccount reporter', 'serviceaccount/reporter created', 'An identity for pods/tools.'),
  s('Create the Role', 'kubectl -n finance create role pod-reader --verb=get,list,watch --resource=pods', 'role.rbac.authorization.k8s.io/pod-reader created', 'Role = list of allowed actions.'),
  s('Bind it', 'kubectl -n finance create rolebinding reporter-binding --role=pod-reader --serviceaccount=finance:reporter', 'rolebinding... created', 'Binding gives the role to the account.'),
  s('Test permissions', ['kubectl -n finance auth can-i list pods --as=system:serviceaccount:finance:reporter', 'kubectl -n finance auth can-i delete pods --as=system:serviceaccount:finance:reporter'], 'yes\nno', 'Allowed actions yes, everything else no.') ],
['kubectl -n finance auth can-i watch pods --as=system:serviceaccount:finance:reporter'],
'', 'Give a robot account read-only access to pods in one namespace.'),

T(SN, 6, 'Expose container port + NodePort Service', 'very common 2025-26',
`ssh cka01010
Reconfigure the existing Deployment front-end in namespace front: add a port specification named http exposing port 80/tcp of the existing container nginx.
Create a new Service named front-end-svc of type NodePort exposing the container port http, with nodePort 30080. The Service must reach the Pods of the Deployment.`,
['namespace = front', 'deployment = front-end', 'port name = http, 80/TCP', 'service = front-end-svc, NodePort 30080'],
setup(ns('front'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: front-end, namespace: front}
spec:
  replicas: 2
  selector: {matchLabels: {app: front-end}}
  template:
    metadata: {labels: {app: front-end}}
    spec:
      containers:
      - {name: nginx, image: nginx:1.27-alpine}`)),
[ s('Add the container port', `kubectl -n front patch deploy front-end --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/ports","value":[{"name":"http","containerPort":80,"protocol":"TCP"}]}]'`, 'deployment.apps/front-end patched', 'Names port 80 "http" on the container.'),
  s('Create the NodePort Service', ap(`
apiVersion: v1
kind: Service
metadata: {name: front-end-svc, namespace: front}
spec:
  type: NodePort
  selector: {app: front-end}
  ports:
  - {name: http, port: 80, targetPort: http, protocol: TCP, nodePort: 30080}`), 'service/front-end-svc created', 'NodePort opens the same port on every node.'),
  s('Test from outside the pod network', 'curl -s http://$(kubectl get node node01 -o jsonpath="{.status.addresses[0].address}"):30080 | head -4', '<title>Welcome to nginx!</title>', 'Node IP + 30080 reaches the pods.') ],
['kubectl -n front get svc front-end-svc', 'kubectl -n front get endpointslices -l kubernetes.io/service-name=front-end-svc'],
'kubernetes.io: Service (search: type NodePort nodePort)', 'Name the container port and open it to the outside on port 30080 of every node.'),

T(SN, 8, 'Gateway API: migrate Ingress to Gateway + HTTPRoute', 'very common 2025-26',
`ssh cka01011
Migrate the existing Ingress web in namespace web-app to the Gateway API, keeping HTTPS:
- Create a Gateway named web-gateway using GatewayClass nginx, with an HTTPS listener on port 443 for hostname gateway.web.example. Use the TLS Secret web-tls already referenced by the Ingress.
- Create an HTTPRoute named web-route bound to web-gateway that sends all paths (/) for gateway.web.example to Service web on port 80.
- Delete the Ingress web when done.`,
['namespace = web-app', 'gateway = web-gateway, class nginx', 'listener HTTPS 443, host gateway.web.example, secret web-tls', 'route = web-route -> svc web:80', 'delete ingress web at the end'],
setup(GWCRD, ns('web-app'), tls('web-app', 'web-tls', 'gateway.web.example'), ap(`
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata: {name: nginx}
spec: {controllerName: example.net/gateway-controller}
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: web, namespace: web-app}
spec:
  replicas: 1
  selector: {matchLabels: {app: web}}
  template:
    metadata: {labels: {app: web}}
    spec:
      containers: [{name: nginx, image: nginx:1.27-alpine, ports: [{containerPort: 80}]}]
---
apiVersion: v1
kind: Service
metadata: {name: web, namespace: web-app}
spec: {selector: {app: web}, ports: [{port: 80, targetPort: 80}]}
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: {name: web, namespace: web-app}
spec:
  tls: [{hosts: [gateway.web.example], secretName: web-tls}]
  rules:
  - host: gateway.web.example
    http:
      paths:
      - {path: /, pathType: Prefix, backend: {service: {name: web, port: {number: 80}}}}`)),
[ s('Read the Ingress you must copy', 'kubectl -n web-app get ingress web -o yaml | grep -A12 "^spec"', 'host gateway.web.example, secretName web-tls', 'Host, TLS secret and backend move to the new objects.'),
  s('Check the GatewayClass', 'kubectl get gatewayclass', 'nginx  example.net/gateway-controller', 'Gateway must use an existing class.'),
  s('Create the Gateway', ap(`
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata: {name: web-gateway, namespace: web-app}
spec:
  gatewayClassName: nginx
  listeners:
  - name: https
    protocol: HTTPS
    port: 443
    hostname: gateway.web.example
    tls:
      mode: Terminate
      certificateRefs:
      - {kind: Secret, name: web-tls}`), 'gateway.../web-gateway created', 'Gateway = the entry door with TLS.'),
  s('Create the HTTPRoute', ap(`
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: {name: web-route, namespace: web-app}
spec:
  parentRefs: [{name: web-gateway}]
  hostnames: [gateway.web.example]
  rules:
  - matches: [{path: {type: PathPrefix, value: /}}]
    backendRefs: [{name: web, port: 80}]`), 'httproute.../web-route created', 'Route = which traffic goes to which Service.'),
  s('Delete the old Ingress', ['kubectl -n web-app delete ingress web', 'kubectl -n web-app get gateway,httproute'], 'web-gateway  nginx ... / web-route', 'Migration done; old object removed.') ],
['kubectl -n web-app get gateway web-gateway -o yaml | grep -A8 listeners', 'kubectl -n web-app get httproute web-route -o yaml | grep -A6 rules', 'kubectl -n web-app get ingress'],
'kubernetes.io: Gateway API (search: HTTPRoute, Gateway listener tls certificateRefs); gateway-api.sigs.k8s.io HTTPS guide',
'Rebuild the HTTPS Ingress as a Gateway (door + certificate) and an HTTPRoute (path to service). No Gateway controller runs on Killercoda, so status stays Unknown - that is fine.'),

T(SN, 6, 'NetworkPolicy: choose the least permissive', 'very common 2025-26',
`ssh cka01012
Pods of Deployment frontend (namespace frontend) must be able to reach Pods of Deployment backend (namespace backend) on port 80. A deny-all policy already exists in namespace backend.
Review the NetworkPolicy files in /root/netpol/ and apply the ONE that allows this traffic with the least permissions. Do not delete or modify the existing policies.`,
['source = frontend ns, app=frontend', 'target = backend ns, app=backend, TCP 80', 'apply exactly one file from /root/netpol/', 'do NOT touch default-deny'],
setup(ns('frontend'), ns('backend'), 'mkdir -p /root/netpol', ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: frontend, namespace: frontend}
spec:
  selector: {matchLabels: {app: frontend}}
  template:
    metadata: {labels: {app: frontend}}
    spec: {containers: [{name: c, image: nginx:1.27-alpine}]}
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: backend, namespace: backend}
spec:
  selector: {matchLabels: {app: backend}}
  template:
    metadata: {labels: {app: backend}}
    spec: {containers: [{name: c, image: nginx:1.27-alpine, ports: [{containerPort: 80}]}]}
---
apiVersion: v1
kind: Service
metadata: {name: backend, namespace: backend}
spec: {selector: {app: backend}, ports: [{port: 80}]}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: default-deny, namespace: backend}
spec: {podSelector: {}, policyTypes: [Ingress]}`),
"cat <<'EOF' > /root/netpol/policy-1.yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: {name: allow-all-in, namespace: backend}\nspec:\n  podSelector: {}\n  ingress: [{}]\nEOF",
"cat <<'EOF' > /root/netpol/policy-2.yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: {name: allow-frontend, namespace: backend}\nspec:\n  podSelector: {matchLabels: {app: backend}}\n  policyTypes: [Ingress]\n  ingress:\n  - from:\n    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: frontend}}\n      podSelector: {matchLabels: {app: frontend}}\n    ports: [{protocol: TCP, port: 80}]\nEOF",
"cat <<'EOF' > /root/netpol/policy-3.yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: {name: allow-any-ns, namespace: backend}\nspec:\n  podSelector: {matchLabels: {app: backend}}\n  ingress:\n  - from:\n    - namespaceSelector: {}\nEOF"),
[ s('Prove traffic is blocked now', 'kubectl -n frontend exec deploy/frontend -- wget -qO- -T2 backend.backend', 'download timed out', 'Deny-all is in effect.'),
  s('Read all three files', 'cat /root/netpol/*.yaml', '', '1 opens everything, 3 opens all namespaces, 2 is exact.'),
  s('Apply the strictest correct one', 'kubectl apply -f /root/netpol/policy-2.yaml', 'networkpolicy.../allow-frontend created', 'Only frontend pods, only port 80.'),
  s('Test again', 'kubectl -n frontend exec deploy/frontend -- wget -qO- -T2 backend.backend | head -4', '<title>Welcome to nginx!</title>', 'Traffic now allowed.') ],
['kubectl -n backend get networkpolicy'],
'kubernetes.io: Network Policies (search: namespaceSelector podSelector)', 'Pick the rule file that opens only the needed door, nothing more.'),

T(WS, 7, 'PriorityClass one below the highest', 'very common 2025-26',
`ssh cka01013
Create a new PriorityClass named urgent for user workloads. Its value must be exactly one less than the highest existing user-defined PriorityClass value (ignore the system-* classes).
Patch the existing Deployment busybox-logger in namespace priority to use PriorityClass urgent. Ensure the Deployment rolls out successfully.`,
['priorityclass = urgent', 'value = highest user-defined - 1', 'deployment = busybox-logger (ns priority)'],
setup(ns('priority'), ap(`
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: {name: low-priority}
value: 1000
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: {name: high-priority}
value: 5000
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: busybox-logger, namespace: priority}
spec:
  selector: {matchLabels: {app: busybox-logger}}
  template:
    metadata: {labels: {app: busybox-logger}}
    spec: {containers: [{name: c, image: busybox:1.36, command: [sh, -c, "while true; do date; sleep 5; done"]}]}`)),
[ s('List priority classes', 'kubectl get priorityclass', 'high-priority 5000, low-priority 1000, system-... 2000000000', 'Highest user-defined is 5000.'),
  s('Create urgent = 4999', 'kubectl create priorityclass urgent --value=4999 --description="user workloads"', 'priorityclass.scheduling.k8s.io/urgent created', 'One less than 5000.'),
  s('Use it in the Deployment', `kubectl -n priority patch deploy busybox-logger -p '{"spec":{"template":{"spec":{"priorityClassName":"urgent"}}}}'`, 'deployment.apps/busybox-logger patched', 'Pod template now carries the class.'),
  s('Check rollout', ['kubectl -n priority rollout status deploy busybox-logger', 'kubectl -n priority get pod -o jsonpath="{.items[*].spec.priority}"'], '4999', 'Running pod has the new priority.') ],
['kubectl get pc urgent', 'kubectl -n priority get deploy busybox-logger -o jsonpath="{.spec.template.spec.priorityClassName}"'],
'kubernetes.io: Pod Priority and Preemption (search: PriorityClass value)', 'Make a new priority level just under the top one and give it to a deployment.'),

T(WS, 8, 'HPA with scale-down behavior', 'very common 2025-26',
`ssh cka01014
Create a HorizontalPodAutoscaler named apache-server in namespace autoscale for the existing Deployment apache-server. It must target 50% CPU utilisation per Pod, with a minimum of 1 and a maximum of 4 replicas. Set the scale-down stabilization window to 30 seconds.`,
['namespace = autoscale', 'hpa = apache-server -> deployment apache-server', 'cpu 50%, min 1, max 4', 'scaleDown stabilizationWindowSeconds = 30'],
setup(ns('autoscale'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: apache-server, namespace: autoscale}
spec:
  selector: {matchLabels: {app: apache-server}}
  template:
    metadata: {labels: {app: apache-server}}
    spec:
      containers:
      - {name: httpd, image: httpd:2.4-alpine, resources: {requests: {cpu: 100m}}}`)),
[ s('Create the HPA (autoscaling/v2)', ap(`
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: {name: apache-server, namespace: autoscale}
spec:
  scaleTargetRef: {apiVersion: apps/v1, kind: Deployment, name: apache-server}
  minReplicas: 1
  maxReplicas: 4
  metrics:
  - type: Resource
    resource: {name: cpu, target: {type: Utilization, averageUtilization: 50}}
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 30`), 'horizontalpodautoscaler.../apache-server created', 'behavior only exists in v2 YAML.'),
  s('Check it', 'kubectl -n autoscale get hpa apache-server', 'TARGETS cpu: <unknown>/50%  MINPODS 1  MAXPODS 4', '<unknown> just means no metrics-server; fine.'),
  s('Check the window', 'kubectl -n autoscale get hpa apache-server -o jsonpath="{.spec.behavior.scaleDown}"', '{"stabilizationWindowSeconds":30...}', 'Proves behavior was saved.') ],
['kubectl -n autoscale get hpa apache-server -o yaml | grep -A4 behavior'],
'kubernetes.io: Horizontal Pod Autoscaling (search: stabilizationWindowSeconds behavior)', 'Auto-add pods when CPU > 50%, and wait 30 s before removing them.'),

T(ST, 5, 'Default StorageClass with WaitForFirstConsumer', 'very common 2025-26',
`ssh cka01015
Create a StorageClass named local-fast with provisioner rancher.io/local-path and volume binding mode WaitForFirstConsumer. Make it the default StorageClass; it must be the ONLY default. Do not modify existing PersistentVolumeClaims.`,
['storageclass = local-fast', 'provisioner = rancher.io/local-path', 'volumeBindingMode = WaitForFirstConsumer', 'only one default'],
setup(LOCALPATH),
[ s('See current classes', 'kubectl get storageclass', 'local-path (default) ...', '"(default)" marks the current default.'),
  s('Create the new class', ap(`
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-fast
  annotations: {storageclass.kubernetes.io/is-default-class: "true"}
provisioner: rancher.io/local-path
volumeBindingMode: WaitForFirstConsumer`), 'storageclass.../local-fast created', 'Annotation makes it default.'),
  s('Remove default from the others', `for sc in $(kubectl get sc -o name | grep -v local-fast); do kubectl patch $sc -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'; done`, 'patched', 'Two defaults confuse new PVCs.'),
  s('Check', 'kubectl get storageclass', 'local-fast (default) only', 'Exactly one "(default)".') ],
['kubectl get sc'],
'kubernetes.io: Change the default StorageClass; Storage Classes (search: is-default-class)', 'Add a storage type and make it the only automatic choice.'),

T(ST, 5, 'Reuse a retained PV for MariaDB', 'very common 2025-26',
`ssh cka01016
A MariaDB Deployment in namespace mariadb was deleted by mistake, but its PersistentVolume mariadb-pv was kept.
- Create a PersistentVolumeClaim named mariadb in namespace mariadb: access mode ReadWriteOnce, storage 250Mi, so that it binds to the existing PV.
- Edit /root/mariadb-deploy.yaml so the Deployment uses this PVC, then apply it. Ensure the Pod is Running.`,
['namespace = mariadb', 'pvc = mariadb, RWO, 250Mi', 'must bind to PV mariadb-pv', 'file = /root/mariadb-deploy.yaml'],
setup(ns('mariadb'), ap(`
apiVersion: v1
kind: PersistentVolume
metadata: {name: mariadb-pv}
spec:
  capacity: {storage: 250Mi}
  accessModes: [ReadWriteOnce]
  persistentVolumeReclaimPolicy: Retain
  storageClassName: ""
  hostPath: {path: /mnt/data/mariadb, type: DirectoryOrCreate}`),
"cat <<'EOF' > /root/mariadb-deploy.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata: {name: mariadb, namespace: mariadb}\nspec:\n  selector: {matchLabels: {app: mariadb}}\n  template:\n    metadata: {labels: {app: mariadb}}\n    spec:\n      containers:\n      - name: mariadb\n        image: mariadb:11\n        env: [{name: MARIADB_ROOT_PASSWORD, value: cka}]\n        volumeMounts: [{name: data, mountPath: /var/lib/mysql}]\n      volumes:\n      - name: data\n        persistentVolumeClaim:\n          claimName: \"\"\nEOF"),
[ s('Look at the PV', 'kubectl get pv mariadb-pv', 'mariadb-pv  250Mi  RWO  Retain  Available', 'Note size, mode and empty class.'),
  s('Create the matching PVC', ap(`
apiVersion: v1
kind: PersistentVolumeClaim
metadata: {name: mariadb, namespace: mariadb}
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: ""
  resources: {requests: {storage: 250Mi}}`), 'persistentvolumeclaim/mariadb created', 'Empty class "" stops the default class grabbing it.'),
  s('Check it is Bound', 'kubectl -n mariadb get pvc mariadb', 'Bound   mariadb-pv', 'Bound to the old PV = old data kept.'),
  s('Point the Deployment to the PVC', ['sed -i \'s/claimName: ""/claimName: mariadb/\' /root/mariadb-deploy.yaml', 'kubectl apply -f /root/mariadb-deploy.yaml'], 'deployment.apps/mariadb created', 'Fill in the claim name and apply.'),
  s('Check the Pod', 'kubectl -n mariadb get pods', 'mariadb-xxx  1/1  Running', 'Database runs on the kept disk.') ],
['kubectl -n mariadb get pvc mariadb', 'kubectl -n mariadb get pods'],
'kubernetes.io: Configure a Pod to Use a PersistentVolume for Storage (search: PersistentVolumeClaim storageClassName)',
'Make a storage claim that grabs the old disk, then plug it into the database deployment.')
];

/* ===================== MOCK 2 (medium) ===================== */
const m2 = [
T(TS, 7, 'Kubelet fails: broken systemd drop-in', 'very common 2025-26',
`ssh cka02001
Node node01 is NotReady after a maintenance change. Find out why the kubelet does not start on node01 and fix it. Do not reinstall any packages.`,
['node = node01', 'do NOT reinstall packages'],
setup(`ssh node01 "sed -i 's#/usr/bin/kubelet #/usr/local/bin/kubelet #' /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf /etc/systemd/system/kubelet.service.d/10-kubeadm.conf 2>/dev/null; systemctl daemon-reload; systemctl restart kubelet"`, 'sleep 45'),
[ s('See the node', 'kubectl get nodes', 'node01 NotReady', 'Start from the symptom.'),
  s('Log in and check kubelet', ['ssh node01', 'systemctl status kubelet --no-pager | head -12'], 'activating (auto-restart) ... status=203/EXEC', '203/EXEC = binary path not found.'),
  s('Read the logs', 'journalctl -u kubelet --no-pager | tail -5', 'Failed at step EXEC ... /usr/local/bin/kubelet: No such file', 'Logs show the wrong path.'),
  s('Find the real binary and the config', ['which kubelet', 'systemctl cat kubelet | grep ExecStart='], '/usr/bin/kubelet', 'Drop-in file points to the wrong place.'),
  s('Fix the drop-in and restart', ["sed -i 's#/usr/local/bin/kubelet #/usr/bin/kubelet #' $(systemctl cat kubelet | grep -o '^# /.*10-kubeadm.conf' | cut -c3-)", 'systemctl daemon-reload', 'systemctl restart kubelet', 'exit'], '', 'daemon-reload re-reads unit files.'),
  s('Check', 'kubectl get nodes', 'node01 Ready', 'Allow ~30s.') ],
['kubectl get nodes', 'ssh node01 systemctl is-active kubelet'],
'', 'The kubelet service file points to a program path that does not exist; correct it.'),

T(TS, 7, 'Scheduler down: Pods stay Pending', 'common 2025-26 (control plane troubleshooting)',
`ssh cka02002
A new Pod named stuck in namespace default stays Pending, even though nodes have free resources. Diagnose and repair the cluster component responsible so that the Pod is scheduled.`,
['pod = stuck (default ns)', 'fix the control plane component, not the pod'],
setup(`sed -i 's#^    - kube-scheduler$#    - kube-schedulerr#' /etc/kubernetes/manifests/kube-scheduler.yaml`, 'sleep 20', 'kubectl run stuck --image=nginx:1.27-alpine --dry-run=client -o yaml | kubectl apply -f -'),
[ s('See the pod has no node', 'kubectl get pod stuck -o wide', 'Pending   <none>', 'No events at all = nobody is scheduling.'),
  s('Check the scheduler pod', 'kubectl -n kube-system get pods | grep scheduler', 'kube-scheduler-controlplane  0/1  CrashLoopBackOff', 'Scheduler is a static pod on controlplane.'),
  s('Read its container log', ['crictl ps -a | grep scheduler', 'crictl logs $(crictl ps -a --name kube-scheduler -q | head -1) 2>&1 | tail -3'], 'exec: "kube-schedulerr": executable file not found', 'Typo in the command.'),
  s('Fix the static pod manifest', ["sed -i 's#- kube-schedulerr$#- kube-scheduler#' /etc/kubernetes/manifests/kube-scheduler.yaml", 'grep -n "kube-scheduler$" /etc/kubernetes/manifests/kube-scheduler.yaml'], '    - kube-scheduler', 'kubelet restarts it when the file changes.'),
  s('Check', ['kubectl -n kube-system get pods | grep scheduler', 'kubectl get pod stuck -o wide'], 'Running ... node01', 'Pod gets a node once scheduler is back.') ],
['kubectl get pod stuck -o wide'],
'kubernetes.io: Troubleshooting Clusters; Static Pods (search: /etc/kubernetes/manifests)', 'The scheduler program is broken by a typo in its file; fix the file.'),

T(TS, 5, 'DNS not resolving: CoreDNS down', 'common 2025-26',
`ssh cka02003
Pods can no longer resolve Service names. Fix cluster DNS so that, from Pod dns-test in namespace lookup, the name kubernetes.default resolves. Save the output of that nslookup to /root/dns.txt.`,
['pod = dns-test (ns lookup)', 'file = /root/dns.txt', 'fix DNS, do not edit the pod'],
setup('kubectl -n kube-system scale deploy coredns --replicas=0', ns('lookup'), 'kubectl -n lookup run dns-test --image=busybox:1.36 --restart=Never --dry-run=client -o yaml -- sleep 36000 | kubectl apply -f -'),
[ s('Try a lookup', 'kubectl -n lookup exec dns-test -- nslookup -timeout=2 kubernetes.default', 'connection timed out; no servers could be reached', 'DNS service does not answer.'),
  s('Check CoreDNS', 'kubectl -n kube-system get deploy coredns', 'READY 0/0', 'Somebody scaled it to zero.'),
  s('Scale it back', ['kubectl -n kube-system scale deploy coredns --replicas=2', 'kubectl -n kube-system rollout status deploy coredns'], 'successfully rolled out', 'Two DNS pods again.'),
  s('Save the lookup', 'kubectl -n lookup exec dns-test -- nslookup kubernetes.default > /root/dns.txt; cat /root/dns.txt', 'Name: kubernetes.default.svc.cluster.local  Address: 10.96.0.1', 'Proves DNS works.') ],
['cat /root/dns.txt'],
'kubernetes.io: Debugging DNS Resolution', 'Cluster DNS was switched off; switch it on and prove it works.'),

T(TS, 5, 'Pending: nodeSelector matches no node', 'common 2025-26',
`ssh cka02004
Pods of Deployment analytics in namespace data are Pending. Make them run on node01 WITHOUT changing the Deployment.`,
['namespace = data', 'deployment = analytics', 'do NOT edit the deployment', 'target node = node01'],
setup(ns('data'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: analytics, namespace: data}
spec:
  replicas: 2
  selector: {matchLabels: {app: analytics}}
  template:
    metadata: {labels: {app: analytics}}
    spec:
      nodeSelector: {disktype: ssd}
      containers: [{name: c, image: busybox:1.36, command: [sleep, "3600"]}]`)),
[ s('Read the reason', 'kubectl -n data describe pod -l app=analytics | grep -A3 Events', "didn't match Pod's node affinity/selector", 'Pod wants a label no node has.'),
  s('See the required label', 'kubectl -n data get deploy analytics -o jsonpath="{.spec.template.spec.nodeSelector}"', '{"disktype":"ssd"}', 'This is the label to add.'),
  s('Label node01', 'kubectl label node node01 disktype=ssd --overwrite', 'node/node01 labeled', 'Now node01 matches.'),
  s('Check', 'kubectl -n data get pods -o wide', 'Running ... node01', 'Pending pods get scheduled automatically.') ],
['kubectl get node node01 --show-labels | grep -o disktype=ssd', 'kubectl -n data get pods -o wide'],
'kubernetes.io: Assign Pods to Nodes (search: nodeSelector)', 'Pods want a node with a sticker "disktype=ssd"; put that sticker on node01.'),

T(TS, 6, 'Init container blocked by missing ConfigMap', 'occasional 2025-26',
`ssh cka02005
Deployment inventory in namespace stock never becomes ready. Investigate and fix it. The application expects a ConfigMap named inventory-config with key ready and value yes. Do not modify the Deployment.`,
['namespace = stock', 'deployment = inventory', 'configmap = inventory-config, ready=yes', 'do NOT edit deployment'],
setup(ns('stock'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: inventory, namespace: stock}
spec:
  selector: {matchLabels: {app: inventory}}
  template:
    metadata: {labels: {app: inventory}}
    spec:
      initContainers:
      - {name: wait-config, image: busybox:1.36, command: [sh, -c, "test -f /config/ready"], volumeMounts: [{name: cfg, mountPath: /config}]}
      containers:
      - {name: app, image: nginx:1.27-alpine}
      volumes:
      - {name: cfg, configMap: {name: inventory-config}}`)),
[ s('See the status', 'kubectl -n stock get pods', 'Init:0/1 (or ContainerCreating)', 'Stuck before the main container starts.'),
  s('Read events', 'kubectl -n stock describe pod -l app=inventory | tail -5', 'configmap "inventory-config" not found', 'Volume source is missing.'),
  s('Create the ConfigMap', 'kubectl -n stock create configmap inventory-config --from-literal=ready=yes', 'configmap/inventory-config created', 'Key "ready" becomes file /config/ready.'),
  s('Check', 'kubectl -n stock rollout status deploy inventory --timeout=120s', 'successfully rolled out', 'Kubelet retries and the init container passes.') ],
['kubectl -n stock get deploy inventory'],
'kubernetes.io: Configure a Pod to Use a ConfigMap', 'The pod waits for a config file that was never created; create it.'),

T(CA, 7, 'Install Calico CNI with the tigera operator', 'very common 2025-26',
`ssh cka02006
Install and configure a CNI of your choice that supports NetworkPolicy enforcement. Use Calico v3.29.2:
- Operator manifest: https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml
- Custom resources: https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml
The Pod CIDR must match the cluster's configured pod subnet.`,
['calico v3.29.2', 'operator via kubectl create (not apply)', 'pod CIDR = cluster podSubnet'],
'',
[ s('Find the cluster pod CIDR', 'kubectl -n kube-system get cm kubeadm-config -o yaml | grep podSubnet', 'podSubnet: 192.168.0.0/16 (example)', 'Calico must use the same range.'),
  s('Install the operator', 'kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/tigera-operator.yaml', 'namespace/tigera-operator created ...', 'create, because the CRDs are too big for apply.'),
  s('Download and set the CIDR', ['curl -fsSLO https://raw.githubusercontent.com/projectcalico/calico/v3.29.2/manifests/custom-resources.yaml', 'grep cidr custom-resources.yaml', 'sed -i "s#cidr: 192.168.0.0/16#cidr: <YOUR-podSubnet>#" custom-resources.yaml'], 'cidr: 192.168.0.0/16', 'Change only if your podSubnet differs.'),
  s('Create the Installation', ['kubectl create -f custom-resources.yaml', 'kubectl get tigerastatus'], 'calico  True', 'Wait a few minutes for calico pods.') ],
['kubectl get pods -n calico-system', 'kubectl get nodes'],
'docs.tigera.io: Quickstart for Calico on Kubernetes (kubernetes.io: Network Plugins)',
'Install a network plugin that understands NetworkPolicies. Killercoda already has a CNI, so DO NOT run this there (setup empty) - only rehearse reading podSubnet and the commands.'),

T(CA, 6, 'etcd snapshot backup', 'common 2025-26',
`ssh cka02007
Create a snapshot of the etcd instance running at https://127.0.0.1:2379 and save it to /opt/backup/etcd-snap.db.
Use: CA /etc/kubernetes/pki/etcd/ca.crt, cert /etc/kubernetes/pki/etcd/server.crt, key /etc/kubernetes/pki/etcd/server.key.`,
['file = /opt/backup/etcd-snap.db', 'endpoint https://127.0.0.1:2379', 'use the given certs'],
setup(ETCDCTL, 'mkdir -p /opt/backup'),
[ s('Confirm cert paths in the etcd manifest', 'grep -E "cert-file|key-file|trusted-ca|listen-client" /etc/kubernetes/manifests/etcd.yaml', '--cert-file=/etc/kubernetes/pki/etcd/server.crt ...', 'Never guess paths; read them.'),
  s('Take the snapshot', `ETCDCTL_API=3 etcdctl ${ETCD_FLAGS} snapshot save /opt/backup/etcd-snap.db`, 'Snapshot saved at /opt/backup/etcd-snap.db', 'Copies the whole cluster state.'),
  s('Check the file', 'ETCDCTL_API=3 etcdctl --write-out=table snapshot status /opt/backup/etcd-snap.db', 'HASH | REVISION | TOTAL KEYS | SIZE', 'A table means the file is valid.') ],
['ls -l /opt/backup/etcd-snap.db'],
'kubernetes.io: Operating etcd clusters for Kubernetes (search: snapshot save)', 'Save a backup copy of the cluster database into a file.'),

T(CA, 6, 'Kustomize overlay', 'common 2025-26',
`ssh cka02008
A Kustomize base exists in /root/shop-kustomize/base. Create an overlay in /root/shop-kustomize/overlays/prod that:
- uses the base,
- puts all resources in namespace shop-prod,
- adds the name prefix prod-,
- sets the replicas of Deployment shop to 3.
Apply the overlay with kubectl.`,
['overlay dir = /root/shop-kustomize/overlays/prod', 'namespace = shop-prod', 'namePrefix = prod-', 'replicas shop = 3'],
setup('mkdir -p /root/shop-kustomize/base',
"cat <<'EOF' > /root/shop-kustomize/base/deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata: {name: shop}\nspec:\n  replicas: 1\n  selector: {matchLabels: {app: shop}}\n  template:\n    metadata: {labels: {app: shop}}\n    spec: {containers: [{name: shop, image: nginx:1.27-alpine}]}\nEOF",
"cat <<'EOF' > /root/shop-kustomize/base/kustomization.yaml\nresources:\n- deployment.yaml\nEOF"),
[ s('Look at the base', 'cat /root/shop-kustomize/base/*.yaml', '', 'Know what you are changing.'),
  s('Write the overlay', ['mkdir -p /root/shop-kustomize/overlays/prod', "cat <<'EOF' > /root/shop-kustomize/overlays/prod/kustomization.yaml\nresources:\n- ../../base\nnamespace: shop-prod\nnamePrefix: prod-\nreplicas:\n- name: shop\n  count: 3\nEOF"], '', 'replicas uses the ORIGINAL name, without prefix.'),
  s('Preview', 'kubectl kustomize /root/shop-kustomize/overlays/prod', 'name: prod-shop  namespace: shop-prod  replicas: 3', 'Check output before applying.'),
  s('Apply', ['kubectl create namespace shop-prod', 'kubectl apply -k /root/shop-kustomize/overlays/prod', 'kubectl -n shop-prod get deploy'], 'prod-shop  3/3', '-k = apply a kustomization folder.') ],
['kubectl -n shop-prod get deploy prod-shop'],
'kubernetes.io: Declarative Management of Kubernetes Objects Using Kustomize (search: namePrefix replicas)', 'Make a "prod" version of some YAML with a different namespace, name prefix and replica count.'),

T(CA, 6, 'Helm install + upgrade with values', 'common 2025-26',
`ssh cka02009
Add the Helm repository podinfo (https://stefanprodan.github.io/podinfo). Install chart podinfo/podinfo version 6.7.1 as release web in namespace helm-web (create it) with 2 replicas.
Then upgrade the release, keeping the same chart version, so that the UI message is "hello cka" (value ui.message). Write the current revision number of the release to /root/helm-rev.txt.`,
['repo = podinfo', 'release = web, ns helm-web', 'version 6.7.1, replicaCount=2', 'upgrade: ui.message="hello cka"', 'file = /root/helm-rev.txt'],
setup(HELM),
[ s('Add the repo', ['helm repo add podinfo https://stefanprodan.github.io/podinfo', 'helm repo update'], '"podinfo" has been added', 'Repo = chart catalogue.'),
  s('Install', 'helm install web podinfo/podinfo --version 6.7.1 -n helm-web --create-namespace --set replicaCount=2', 'STATUS: deployed  REVISION: 1', '--create-namespace makes helm-web.'),
  s('Upgrade with a new value', 'helm upgrade web podinfo/podinfo --version 6.7.1 -n helm-web --reuse-values --set ui.message="hello cka"', 'REVISION: 2', '--reuse-values keeps replicaCount=2.'),
  s('Save revision', ['helm -n helm-web list', "helm -n helm-web list -o json | grep -o '\"revision\":\"[0-9]*\"' | grep -o '[0-9]*' > /root/helm-rev.txt; cat /root/helm-rev.txt"], '2', 'Revision counts installs + upgrades.') ],
['helm -n helm-web get values web', 'kubectl -n helm-web get deploy'],
'helm.sh docs: helm upgrade (search: --reuse-values --set)', 'Install an app from a Helm chart, then change one setting with an upgrade.'),

T(SN, 6, 'Create an Ingress with path routing', 'common 2025-26',
`ssh cka02010
Create an Ingress named echo in namespace echo-sound that exposes Service echo on port 8080 at http://example.org/echo using ingressClassName nginx and pathType Prefix.`,
['namespace = echo-sound', 'ingress = echo', 'host example.org, path /echo, Prefix', 'backend echo:8080', 'ingressClassName nginx'],
setup(ns('echo-sound'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: echo, namespace: echo-sound}
spec:
  selector: {matchLabels: {app: echo}}
  template:
    metadata: {labels: {app: echo}}
    spec: {containers: [{name: c, image: nginx:1.27-alpine}]}
---
apiVersion: v1
kind: Service
metadata: {name: echo, namespace: echo-sound}
spec: {selector: {app: echo}, ports: [{port: 8080, targetPort: 80}]}`)),
[ s('Check the Service port', 'kubectl -n echo-sound get svc echo', '8080/TCP', 'Ingress must use the Service port, not the pod port.'),
  s('Create the Ingress', 'kubectl -n echo-sound create ingress echo --class=nginx --rule="example.org/echo*=echo:8080"', 'ingress.networking.k8s.io/echo created', 'The * at the end means pathType Prefix.'),
  s('Check', 'kubectl -n echo-sound describe ingress echo | grep -A3 Rules', 'example.org  /echo  echo:8080', 'Host, path and backend are right.') ],
['kubectl -n echo-sound get ingress echo -o jsonpath="{.spec.rules[0].http.paths[0].pathType}"'],
'kubernetes.io: Ingress (search: pathType Prefix ingressClassName)', 'Publish a service under the web address example.org/echo. No ingress controller on Killercoda, so ADDRESS stays empty.'),

T(SN, 7, 'TLS ConfigMap: allow only TLSv1.3', 'very common 2025-26',
`ssh cka02011
Deployment nginx-static in namespace nginx-static serves HTTPS using configuration from ConfigMap nginx-config. It currently allows TLSv1.2 and TLSv1.3.
Change the configuration so that ONLY TLSv1.3 is accepted, then make the ConfigMap immutable. Make sure the running Pods use the new configuration.`,
['namespace = nginx-static', 'configmap = nginx-config', 'only TLSv1.3', 'configmap immutable', 'pods must pick up the change'],
setup(ns('nginx-static'), tls('nginx-static', 'nginx-tls', 'web.example.com'),
`kubectl -n nginx-static get cm nginx-config -o jsonpath='{.immutable}' 2>/dev/null | grep -q true && kubectl -n nginx-static delete cm nginx-config`,
ap(`
apiVersion: v1
kind: ConfigMap
metadata: {name: nginx-config, namespace: nginx-static}
data:
  nginx.conf: |
    events {}
    http {
      server {
        listen 443 ssl;
        server_name web.example.com;
        ssl_certificate /etc/nginx/tls/tls.crt;
        ssl_certificate_key /etc/nginx/tls/tls.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        location / { return 200 "ok\\n"; }
      }
    }
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: nginx-static, namespace: nginx-static}
spec:
  selector: {matchLabels: {app: nginx-static}}
  template:
    metadata: {labels: {app: nginx-static}}
    spec:
      containers:
      - name: nginx
        image: nginx:1.27-alpine
        volumeMounts:
        - {name: conf, mountPath: /etc/nginx/nginx.conf, subPath: nginx.conf}
        - {name: tls, mountPath: /etc/nginx/tls}
      volumes:
      - {name: conf, configMap: {name: nginx-config}}
      - {name: tls, secret: {secretName: nginx-tls}}
---
apiVersion: v1
kind: Service
metadata: {name: nginx-static, namespace: nginx-static}
spec: {selector: {app: nginx-static}, ports: [{port: 443}]}`)),
[ s('Test TLS 1.2 works now', 'curl -sk --tls-max 1.2 https://$(kubectl -n nginx-static get svc nginx-static -o jsonpath="{.spec.clusterIP}")', 'ok', 'Baseline: 1.2 still accepted.'),
  s('Edit the ConfigMap', ["kubectl -n nginx-static get cm nginx-config -o yaml > /root/nginx-config.yaml", "sed -i 's/ssl_protocols TLSv1.2 TLSv1.3;/ssl_protocols TLSv1.3;/' /root/nginx-config.yaml", 'kubectl apply -f /root/nginx-config.yaml'], 'configmap/nginx-config configured', 'Change content BEFORE making it immutable.'),
  s('Make it immutable', `kubectl -n nginx-static patch cm nginx-config -p '{"immutable":true}'`, 'configmap/nginx-config patched', 'Immutable = no more edits allowed.'),
  s('Restart the pods', 'kubectl -n nginx-static rollout restart deploy nginx-static && kubectl -n nginx-static rollout status deploy nginx-static', 'successfully rolled out', 'subPath files only change on pod restart.'),
  s('Prove 1.2 is refused', 'curl -sk --tls-max 1.2 https://$(kubectl -n nginx-static get svc nginx-static -o jsonpath="{.spec.clusterIP}") || echo refused', 'refused', 'Only TLS 1.3 clients get in now.') ],
['kubectl -n nginx-static get cm nginx-config -o jsonpath="{.immutable}"', 'kubectl -n nginx-static get cm nginx-config -o yaml | grep ssl_protocols'],
'kubernetes.io: ConfigMaps (search: immutable)', 'Edit nginx settings stored in a ConfigMap to allow only TLS 1.3, lock the ConfigMap, restart nginx.'),

T(SN, 7, 'Write a NetworkPolicy: namespace AND pod selector', 'very common 2025-26',
`ssh cka02012
In namespace db create a NetworkPolicy named db-allow-api that allows incoming traffic to Pods labelled app=db ONLY from Pods labelled role=api in namespace api, on TCP port 80. All other incoming traffic to app=db Pods must be denied.`,
['namespace = db', 'policy = db-allow-api', 'from: ns api AND role=api', 'port TCP 80'],
setup(ns('db'), ns('api'), ap(`
apiVersion: v1
kind: Pod
metadata: {name: db, namespace: db, labels: {app: db}}
spec: {containers: [{name: c, image: nginx:1.27-alpine}]}
---
apiVersion: v1
kind: Service
metadata: {name: db, namespace: db}
spec: {selector: {app: db}, ports: [{port: 80}]}
---
apiVersion: v1
kind: Pod
metadata: {name: api, namespace: api, labels: {role: api}}
spec: {containers: [{name: c, image: busybox:1.36, command: [sleep, "36000"]}]}
---
apiVersion: v1
kind: Pod
metadata: {name: web, namespace: api, labels: {role: web}}
spec: {containers: [{name: c, image: busybox:1.36, command: [sleep, "36000"]}]}`)),
[ s('Create the policy', ap(`
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: db-allow-api, namespace: db}
spec:
  podSelector: {matchLabels: {app: db}}
  policyTypes: [Ingress]
  ingress:
  - from:
    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: api}}
      podSelector: {matchLabels: {role: api}}
    ports: [{protocol: TCP, port: 80}]`), 'networkpolicy.../db-allow-api created', 'Same list item (no 2nd dash) = AND.'),
  s('Allowed pod works', 'kubectl -n api exec api -- wget -qO- -T2 db.db | head -2', '<!DOCTYPE html>', 'role=api in ns api passes.'),
  s('Other pod is blocked', 'kubectl -n api exec web -- wget -qO- -T2 db.db', 'download timed out', 'role=web is denied.') ],
['kubectl -n db describe networkpolicy db-allow-api'],
'kubernetes.io: Network Policies (search: namespaceSelector and podSelector)', 'Let only the api pods from the api namespace talk to the database on port 80.'),

T(WS, 8, 'Native sidecar container (restartPolicy Always)', 'very common 2025-26',
`ssh cka02013
Update Deployment order-app in namespace logging: add a sidecar container named log-shipper using image busybox:1.36 that runs: tail -n+1 -F /var/log/order.log
Use the native sidecar pattern (an init container with restartPolicy: Always). Share the log directory using a volume named logs mounted at /var/log in both containers. Do not change the existing container's command.`,
['namespace = logging', 'deployment = order-app', 'sidecar = log-shipper, busybox:1.36', 'initContainer + restartPolicy: Always', 'volume logs at /var/log'],
setup(ns('logging'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: order-app, namespace: logging}
spec:
  selector: {matchLabels: {app: order-app}}
  template:
    metadata: {labels: {app: order-app}}
    spec:
      containers:
      - name: app
        image: busybox:1.36
        command: [sh, -c, "while true; do echo order $(date) >> /var/log/order.log; sleep 3; done"]`)),
[ s('Save the current YAML', 'kubectl -n logging get deploy order-app -o yaml > /root/order-app.yaml', '', 'Backup before big edits.'),
  s('Apply the new spec', ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: order-app, namespace: logging}
spec:
  selector: {matchLabels: {app: order-app}}
  template:
    metadata: {labels: {app: order-app}}
    spec:
      initContainers:
      - name: log-shipper
        image: busybox:1.36
        restartPolicy: Always
        command: [sh, -c, "tail -n+1 -F /var/log/order.log"]
        volumeMounts: [{name: logs, mountPath: /var/log}]
      containers:
      - name: app
        image: busybox:1.36
        command: [sh, -c, "while true; do echo order $(date) >> /var/log/order.log; sleep 3; done"]
        volumeMounts: [{name: logs, mountPath: /var/log}]
      volumes:
      - {name: logs, emptyDir: {}}`), 'deployment.apps/order-app configured', 'restartPolicy Always turns the init container into a sidecar.'),
  s('Check both run', 'kubectl -n logging get pods', '2/2 Running', 'Sidecar counts as a running container.'),
  s('Read sidecar logs', 'kubectl -n logging logs deploy/order-app -c log-shipper --tail=3', 'order Sat Nov ...', 'Sidecar sees the app log file.') ],
['kubectl -n logging get deploy order-app -o jsonpath="{.spec.template.spec.initContainers[0].restartPolicy}"'],
'kubernetes.io: Sidecar Containers (search: initContainers restartPolicy Always)', 'Add a helper container that keeps reading the app log file through a shared folder.'),

T(WS, 7, 'Split node resources evenly across replicas', 'very common 2025-26',
`ssh cka02014
Deployment wordpress in namespace wp runs 3 replicas on node01 (it has an init container). Some Pods cannot start.
Scale the Deployment to 0. Then give each Pod an equal share of node01's remaining CPU and memory: take node01's allocatable minus what is already requested by other Pods, keep 10% as headroom, and divide the rest by 3. Use identical requests for the init container and the main container. Scale back to 3 and ensure all Pods are Running.`,
['namespace = wp', 'deployment = wordpress', 'scale 0 -> edit -> 3', 'init + main same requests', 'all 3 pods Running on node01'],
setup(ns('wp'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: wordpress, namespace: wp}
spec:
  replicas: 3
  selector: {matchLabels: {app: wordpress}}
  template:
    metadata: {labels: {app: wordpress}}
    spec:
      nodeSelector: {kubernetes.io/hostname: node01}
      initContainers:
      - {name: init, image: busybox:1.36, command: [sh, -c, "sleep 2"], resources: {requests: {cpu: "1", memory: 1Gi}}}
      containers:
      - {name: wordpress, image: nginx:1.27-alpine, resources: {requests: {cpu: "1", memory: 1Gi}}}`)),
[ s('Scale to 0', 'kubectl -n wp scale deploy wordpress --replicas=0', 'deployment.apps/wordpress scaled', 'Free the node while you calculate.'),
  s('Read node01 numbers', ['kubectl describe node node01 | grep -A6 Allocatable', 'kubectl describe node node01 | grep -A5 "Allocated resources"'], 'cpu 1 / memory ~1.9Gi; requests cpu 250m ...', 'Allocatable minus already requested = free.'),
  s('Calculate (example)', 'echo "free cpu 1000m-250m=750m, *0.9=675m, /3=225m; free mem 1900Mi-150Mi=1750Mi, *0.9=1575Mi, /3=525Mi"', '', 'Use YOUR numbers; round down.'),
  s('Set requests on both containers', ['kubectl -n wp set resources deploy wordpress -c init --requests=cpu=225m,memory=525Mi', 'kubectl -n wp set resources deploy wordpress -c wordpress --requests=cpu=225m,memory=525Mi'], 'resource requirements updated', '-c picks the container (init too).'),
  s('Scale back and check', ['kubectl -n wp scale deploy wordpress --replicas=3', 'kubectl -n wp get pods -o wide'], '3 x Running on node01', 'All three fit now.') ],
['kubectl -n wp get deploy wordpress', 'kubectl -n wp get deploy wordpress -o jsonpath="{.spec.template.spec.initContainers[0].resources}"', 'kubectl -n wp get deploy wordpress -o jsonpath="{.spec.template.spec.containers[0].resources}"'],
'kubernetes.io: Resource Management for Pods and Containers (search: requests init containers)', 'Share what is free on node01 fairly between 3 pods so all of them fit.'),

T(ST, 5, 'PVC Pending: wrong StorageClass', 'common 2025-26',
`ssh cka02015
PVC logs-pvc in namespace storage-fix stays Pending and Pod log-writer cannot start. Fix it so the PVC is Bound using StorageClass local-path (same name, size 200Mi, ReadWriteOnce) and the Pod is Running.`,
['namespace = storage-fix', 'pvc = logs-pvc, 200Mi, RWO', 'storageclass = local-path', 'pod log-writer Running'],
setup(LOCALPATH, ns('storage-fix'), ap(`
apiVersion: v1
kind: PersistentVolumeClaim
metadata: {name: logs-pvc, namespace: storage-fix}
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: fast-ssd
  resources: {requests: {storage: 200Mi}}
---
apiVersion: v1
kind: Pod
metadata: {name: log-writer, namespace: storage-fix}
spec:
  containers:
  - {name: c, image: busybox:1.36, command: [sh, -c, "while true; do date >> /data/log; sleep 5; done"], volumeMounts: [{name: d, mountPath: /data}]}
  volumes: [{name: d, persistentVolumeClaim: {claimName: logs-pvc}}]`)),
[ s('Read the reason', 'kubectl -n storage-fix describe pvc logs-pvc | tail -3', 'storageclass.storage.k8s.io "fast-ssd" not found', 'The class does not exist.'),
  s('Save, delete, recreate the PVC', ['kubectl -n storage-fix get pvc logs-pvc -o yaml > /root/logs-pvc.yaml', 'kubectl -n storage-fix delete pod log-writer --force --grace-period=0', 'kubectl -n storage-fix delete pvc logs-pvc'], '', 'storageClassName cannot be edited on a PVC.'),
  s('Create the fixed PVC', ap(`
apiVersion: v1
kind: PersistentVolumeClaim
metadata: {name: logs-pvc, namespace: storage-fix}
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: local-path
  resources: {requests: {storage: 200Mi}}`), 'persistentvolumeclaim/logs-pvc created', 'Same name, right class.'),
  s('Recreate the Pod', ['kubectl -n storage-fix run log-writer --image=busybox:1.36 --dry-run=client -o yaml -- sh -c "sleep 1" >/dev/null', 'echo "re-run the setup Pod part, or: kubectl apply -f with the pod YAML from setup"'], '', 'Pod spec is unchanged; just recreate it.'),
  s('Check', 'kubectl -n storage-fix get pvc,pod', 'Bound / Running', 'local-path binds when the pod starts.') ],
['kubectl -n storage-fix get pvc logs-pvc', 'kubectl -n storage-fix get pod log-writer'],
'kubernetes.io: Persistent Volumes (search: storageClassName Pending)', 'The storage request names a storage type that does not exist; recreate it with the right type.'),

T(ST, 5, 'Static PV + PVC + Pod (hostPath)', 'common 2025-26',
`ssh cka02016
Create a PersistentVolume app-pv: 1Gi, ReadWriteOnce, hostPath /srv/app-data, storageClassName manual.
Create a PersistentVolumeClaim app-pvc in namespace app-store requesting 500Mi from class manual.
Create a Pod app-writer (image busybox:1.36, command sleep 3600) in namespace app-store mounting the claim at /data.`,
['pv = app-pv 1Gi RWO hostPath /srv/app-data', 'pvc = app-pvc 500Mi class manual (ns app-store)', 'pod = app-writer mount /data'],
setup(ns('app-store')),
[ s('Create PV, PVC and Pod', ap(`
apiVersion: v1
kind: PersistentVolume
metadata: {name: app-pv}
spec:
  capacity: {storage: 1Gi}
  accessModes: [ReadWriteOnce]
  storageClassName: manual
  hostPath: {path: /srv/app-data}
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata: {name: app-pvc, namespace: app-store}
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: manual
  resources: {requests: {storage: 500Mi}}
---
apiVersion: v1
kind: Pod
metadata: {name: app-writer, namespace: app-store}
spec:
  containers:
  - {name: c, image: busybox:1.36, command: [sleep, "3600"], volumeMounts: [{name: d, mountPath: /data}]}
  volumes: [{name: d, persistentVolumeClaim: {claimName: app-pvc}}]`), 'created x3', 'PV = disk, PVC = request, Pod = user.'),
  s('Check binding', 'kubectl get pv app-pv; kubectl -n app-store get pvc,pod', 'Bound ... app-store/app-pvc; Running', 'PVC gets the 1Gi PV (bigger is OK).'),
  s('Write a test file', 'kubectl -n app-store exec app-writer -- sh -c "echo hi > /data/t && cat /data/t"', 'hi', 'Proves the mount is writable.') ],
['kubectl get pv app-pv', 'kubectl -n app-store get pvc app-pvc'],
'kubernetes.io: Configure a Pod to Use a PersistentVolume for Storage', 'Make a disk, request it, and mount it into a pod.')
];

/* fix: mock2 storage-fix recreate pod step - give real YAML */
m2[14].steps[3] = s('Recreate the Pod', ap(`
apiVersion: v1
kind: Pod
metadata: {name: log-writer, namespace: storage-fix}
spec:
  containers:
  - {name: c, image: busybox:1.36, command: [sh, -c, "while true; do date >> /data/log; sleep 5; done"], volumeMounts: [{name: d, mountPath: /data}]}
  volumes: [{name: d, persistentVolumeClaim: {claimName: logs-pvc}}]`), 'pod/log-writer created', 'Same pod spec as before.');

/* ===================== MOCK 3 (hardest) ===================== */
const m3 = [
T(TS, 8, 'API server down after etcd change', 'very common 2025-26',
`ssh cka03001
After a migration, kubectl on the controlplane can no longer reach the cluster ("connection refused"). The kube-apiserver is configured incorrectly. Find the problem and repair the cluster. Do not restore any backup.`,
['component = kube-apiserver (static pod)', 'etcd client port is 2379 (peer port is 2380)', 'do NOT restore etcd'],
setup('sed -i "s#--etcd-servers=https://127.0.0.1:2379#--etcd-servers=https://127.0.0.1:2380#" /etc/kubernetes/manifests/kube-apiserver.yaml', 'sleep 30'),
[ s('See the symptom', 'kubectl get nodes', 'connection to the server ... refused', 'API server is down; use crictl instead.'),
  s('Find the apiserver container', 'crictl ps -a | grep kube-apiserver', 'Exited ... kube-apiserver', 'kubelet keeps restarting it.'),
  s('Read its logs', 'crictl logs $(crictl ps -a --name kube-apiserver -q | head -1) 2>&1 | tail -5', 'dial tcp 127.0.0.1:2380 ... / context deadline exceeded', 'It talks to the etcd PEER port.'),
  s('Compare with etcd', ['grep -E "listen-client-urls|listen-peer-urls" /etc/kubernetes/manifests/etcd.yaml', 'grep etcd-servers /etc/kubernetes/manifests/kube-apiserver.yaml'], 'client :2379, peer :2380; apiserver uses :2380', '2379 is for clients like the apiserver.'),
  s('Fix the manifest', "sed -i 's#--etcd-servers=https://127.0.0.1:2380#--etcd-servers=https://127.0.0.1:2379#' /etc/kubernetes/manifests/kube-apiserver.yaml", '', 'kubelet notices the change and restarts the pod.'),
  s('Wait and check', ['watch -n3 crictl ps --name kube-apiserver', 'kubectl get nodes'], 'Running ... / Ready', 'Takes ~1 minute.') ],
['kubectl get nodes', 'kubectl -n kube-system get pods'],
'kubernetes.io: Troubleshooting Clusters (search: crictl logs static pod)', 'The API server dials the wrong etcd port; change 2380 back to 2379.'),

T(TS, 6, 'Controller-manager broken: Deployment does not scale', 'common 2025-26',
`ssh cka03002
Deployment scale-test in namespace cm-test was scaled to 3 replicas, but only 1 Pod exists and no new ReplicaSet activity happens. Find the responsible control plane component and fix it.`,
['namespace = cm-test', 'deployment = scale-test must reach 3/3', 'fix the component, not the deployment'],
setup(ns('cm-test'), 'kubectl -n cm-test create deployment scale-test --image=nginx:1.27-alpine --dry-run=client -o yaml | kubectl apply -f -', 'sleep 5', 'sed -i "s#--kubeconfig=/etc/kubernetes/controller-manager.conf#--kubeconfig=/etc/kubernetes/controller-manager.cfg#" /etc/kubernetes/manifests/kube-controller-manager.yaml', 'sleep 20', 'kubectl -n cm-test scale deploy scale-test --replicas=3'),
[ s('See the symptom', 'kubectl -n cm-test get deploy scale-test', 'READY 1/3', 'Nothing creates the missing pods.'),
  s('Check the controller-manager', 'kubectl -n kube-system get pods | grep controller-manager', 'CrashLoopBackOff', 'Controllers create pods for Deployments.'),
  s('Read logs', 'kubectl -n kube-system logs kube-controller-manager-controlplane | tail -3', 'stat /etc/kubernetes/controller-manager.cfg: no such file', 'Wrong kubeconfig file name.'),
  s('Fix the manifest', ["sed -i 's#controller-manager.cfg#controller-manager.conf#' /etc/kubernetes/manifests/kube-controller-manager.yaml", 'ls /etc/kubernetes/*.conf'], 'controller-manager.conf exists', 'Point to the file that really exists.'),
  s('Check', 'kubectl -n cm-test get deploy scale-test', 'READY 3/3', 'Controller catches up automatically.') ],
['kubectl -n cm-test get deploy scale-test', 'kubectl -n kube-system get pods | grep controller-manager'],
'kubernetes.io: kube-controller-manager; Troubleshooting Clusters', 'The program that creates pods for deployments has a wrong file path; correct it.'),

T(TS, 6, 'Kubelet config: wrong client CA file', 'common 2025-26',
`ssh cka03003
node01 is NotReady. The kubelet service fails to start. Repair the kubelet configuration on node01 so that the node becomes Ready. Do not re-join the node.`,
['node = node01', 'config = /var/lib/kubelet/config.yaml', 'do NOT kubeadm reset/join'],
setup(`ssh node01 "sed -i 's#clientCAFile: /etc/kubernetes/pki/ca.crt#clientCAFile: /etc/kubernetes/pki/ca-wrong.crt#' /var/lib/kubelet/config.yaml; systemctl restart kubelet"`, 'sleep 45'),
[ s('Log in and check status', ['ssh node01', 'systemctl status kubelet --no-pager | head -5'], 'activating (auto-restart)', 'Starts then crashes.'),
  s('Read the error', 'journalctl -u kubelet --no-pager | grep -i -m2 "ca-wrong\\|client-ca\\|error"', 'unable to load client CA file /etc/kubernetes/pki/ca-wrong.crt', 'File does not exist.'),
  s('Find the right file', ['ls /etc/kubernetes/pki/', 'grep clientCAFile /var/lib/kubelet/config.yaml'], 'ca.crt', 'Worker nodes have only ca.crt.'),
  s('Fix and restart', ["sed -i 's#ca-wrong.crt#ca.crt#' /var/lib/kubelet/config.yaml", 'systemctl restart kubelet', 'systemctl is-active kubelet', 'exit'], 'active', 'kubelet reads config.yaml at start.'),
  s('Check', 'kubectl get nodes', 'node01 Ready', 'Allow ~30s.') ],
['kubectl get nodes', 'ssh node01 grep clientCAFile /var/lib/kubelet/config.yaml'],
'kubernetes.io: Set Kubelet Parameters Via A Configuration File', 'The kubelet settings file names a certificate that does not exist; fix the name.'),

T(TS, 5, 'NetworkPolicy blocks DNS egress', 'occasional 2025-26',
`ssh cka03004
In namespace secure, Pod client can reach Service backend by IP but not by name. Existing NetworkPolicies must stay unchanged. Create an additional NetworkPolicy named allow-dns in namespace secure that allows all Pods in the namespace to send DNS queries (UDP and TCP 53) to the cluster DNS Pods in kube-system.`,
['namespace = secure', 'new policy = allow-dns', 'egress UDP+TCP 53 to kube-system k8s-app=kube-dns', 'do NOT edit/delete existing policies'],
setup(ns('secure'), ap(`
apiVersion: v1
kind: Pod
metadata: {name: backend, namespace: secure, labels: {app: backend}}
spec: {containers: [{name: c, image: nginx:1.27-alpine}]}
---
apiVersion: v1
kind: Service
metadata: {name: backend, namespace: secure}
spec: {selector: {app: backend}, ports: [{port: 80}]}
---
apiVersion: v1
kind: Pod
metadata: {name: client, namespace: secure, labels: {app: client}}
spec: {containers: [{name: c, image: busybox:1.36, command: [sleep, "36000"]}]}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: default-deny-egress, namespace: secure}
spec: {podSelector: {}, policyTypes: [Egress]}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: allow-backend, namespace: secure}
spec:
  podSelector: {}
  policyTypes: [Egress]
  egress: [{to: [{podSelector: {matchLabels: {app: backend}}}], ports: [{protocol: TCP, port: 80}]}]`)),
[ s('Name fails, IP works', ['kubectl -n secure exec client -- wget -qO- -T2 backend', 'kubectl -n secure exec client -- wget -qO- -T2 $(kubectl -n secure get pod backend -o jsonpath="{.status.podIP}") | head -2'], 'bad address \'backend\' / <!DOCTYPE html>', 'Classic sign: DNS (port 53) is blocked.'),
  s('Check DNS pod labels', 'kubectl -n kube-system get pods -l k8s-app=kube-dns --show-labels', 'coredns-... k8s-app=kube-dns', 'Target for the new rule.'),
  s('Create allow-dns', ap(`
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: allow-dns, namespace: secure}
spec:
  podSelector: {}
  policyTypes: [Egress]
  egress:
  - to:
    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: kube-system}}
      podSelector: {matchLabels: {k8s-app: kube-dns}}
    ports:
    - {protocol: UDP, port: 53}
    - {protocol: TCP, port: 53}`), 'networkpolicy.../allow-dns created', 'Policies add up; this opens only DNS.'),
  s('Test by name', 'kubectl -n secure exec client -- wget -qO- -T3 backend | head -2', '<!DOCTYPE html>', 'Name resolves and connects.') ],
['kubectl -n secure get networkpolicy'],
'kubernetes.io: Network Policies (search: egress port 53)', 'A firewall rule blocks name lookups; add a rule that allows DNS only.'),

T(TS, 5, 'Bad rollout: roll back and record image', 'common 2025-26',
`ssh cka03005
A recent update of Deployment checkout in namespace release left it unavailable. Roll the Deployment back to the last working revision. Then write the image used by the running Pods to /root/checkout-image.txt.`,
['namespace = release', 'deployment = checkout', 'roll back (do not recreate)', 'file = /root/checkout-image.txt'],
setup(ns('release'), 'kubectl -n release create deployment checkout --image=nginx:1.27-alpine --replicas=2 --dry-run=client -o yaml | kubectl apply -f -', 'kubectl -n release rollout status deploy checkout --timeout=90s', 'kubectl -n release set image deploy/checkout nginx=nginx:1.27-doesnotexist'),
[ s('See the problem', 'kubectl -n release get pods', 'ImagePullBackOff', 'New image tag does not exist.'),
  s('See history', 'kubectl -n release rollout history deploy checkout', 'REVISION 1, 2', 'Revision 1 was healthy.'),
  s('Roll back', ['kubectl -n release rollout undo deploy checkout', 'kubectl -n release rollout status deploy checkout'], 'successfully rolled out', 'undo = go to previous revision.'),
  s('Save the image', ['kubectl -n release get deploy checkout -o jsonpath="{.spec.template.spec.containers[0].image}" > /root/checkout-image.txt', 'cat /root/checkout-image.txt'], 'nginx:1.27-alpine', 'jsonpath pulls one field.') ],
['kubectl -n release get deploy checkout', 'cat /root/checkout-image.txt'],
'kubernetes.io: Deployments (search: rollout undo)', 'An update broke the app; undo it and note which image works.'),

T(CA, 6, 'cri-dockerd + sysctl (persist + verify)', 'very common 2025-26',
`ssh cka03006
Set up cri-dockerd on this node:
- Install /root/cri-dockerd.deb with dpkg.
- Enable and start the cri-docker socket and service so they start on boot.
- Persist these kernel settings in /etc/sysctl.d/99-cri.conf and load them now:
  net.bridge.bridge-nf-call-iptables = 1, net.ipv6.conf.all.forwarding = 1, net.ipv4.ip_forward = 1, net.netfilter.nf_conntrack_max = 131072
- Make sure the br_netfilter module is loaded at boot (/etc/modules-load.d/cri.conf).`,
['dpkg -i', 'cri-docker.socket + cri-docker.service enabled', 'file /etc/sysctl.d/99-cri.conf', 'br_netfilter in /etc/modules-load.d/cri.conf'],
setup('test -f /root/cri-dockerd.deb || curl -fsSLo /root/cri-dockerd.deb https://github.com/Mirantis/cri-dockerd/releases/download/v0.3.16/cri-dockerd_0.3.16.3-0.ubuntu-jammy_amd64.deb || echo "download failed - check release page"'),
[ s('Install', 'dpkg -i /root/cri-dockerd.deb', 'Setting up cri-dockerd', 'Local package install.'),
  s('Enable socket and service', ['systemctl daemon-reload', 'systemctl enable --now cri-docker.socket cri-docker.service', 'systemctl is-enabled cri-docker.socket cri-docker.service'], 'enabled\nenabled', 'Both units start on boot.'),
  s('Module at boot', ['echo br_netfilter > /etc/modules-load.d/cri.conf', 'modprobe br_netfilter'], '', 'bridge sysctl needs this module.'),
  s('Persist sysctl', "cat <<'EOF' > /etc/sysctl.d/99-cri.conf\nnet.bridge.bridge-nf-call-iptables = 1\nnet.ipv6.conf.all.forwarding = 1\nnet.ipv4.ip_forward = 1\nnet.netfilter.nf_conntrack_max = 131072\nEOF", '', 'One setting per line.'),
  s('Load and verify', ['sysctl --system >/dev/null', 'sysctl net.bridge.bridge-nf-call-iptables net.ipv6.conf.all.forwarding net.ipv4.ip_forward net.netfilter.nf_conntrack_max'], '= 1, = 1, = 1, = 131072', 'Values active now and after reboot.') ],
['dpkg -s cri-dockerd | grep Status', 'sysctl net.netfilter.nf_conntrack_max'],
'kubernetes.io: Container Runtimes (search: Forwarding IPv4 and letting iptables see bridged traffic)',
'Install a runtime package, make it start at boot, and set 4 kernel network switches permanently. Docker is absent on Killercoda, so the service may fail to stay active; the rest still practises.'),

T(CA, 7, 'Helm template Argo CD and apply with kubectl', 'very common 2025-26',
`ssh cka03007
Using the Helm repository argocd (https://argoproj.github.io/argo-helm), render chart argo-cd version 7.7.3 as release argo for namespace gitops:
- CRDs must NOT be part of the output (they are pre-installed).
- The argocd-server Service must be of type NodePort.
Save the rendered manifests to /root/argocd-template.yaml and deploy them with kubectl (not helm install) into namespace gitops.`,
['repo = argocd', 'chart argo-cd 7.7.3, release argo', 'ns = gitops', 'no CRDs, server.service.type=NodePort', 'file = /root/argocd-template.yaml', 'deploy with kubectl apply'],
setup(HELM, 'kubectl apply -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.13.2"'),
[ s('Add repo', ['helm repo add argocd https://argoproj.github.io/argo-helm', 'helm repo update'], '', 'Same repo as the docs.'),
  s('Find value names', 'helm show values argocd/argo-cd --version 7.7.3 | grep -n -A3 -E "^crds:|^  service:" | head -20', 'crds.install / server.service.type', 'Look up keys, never guess.'),
  s('Render', 'helm template argo argocd/argo-cd --version 7.7.3 --namespace gitops --set crds.install=false --set server.service.type=NodePort > /root/argocd-template.yaml', '', 'Render only; nothing is installed.'),
  s('Check content', ['grep -c "kind: CustomResourceDefinition" /root/argocd-template.yaml', 'grep -B2 -A3 "type: NodePort" /root/argocd-template.yaml | head'], '0 / type: NodePort', 'Both requirements visible in the file.'),
  s('Apply with kubectl', ['kubectl create namespace gitops', 'kubectl apply -n gitops -f /root/argocd-template.yaml', 'kubectl -n gitops get svc argo-argocd-server'], 'TYPE NodePort', 'kubectl applies the rendered YAML.') ],
['kubectl -n gitops get pods', 'kubectl -n gitops get svc'],
'helm.sh docs: helm template (search: --set --namespace)', 'Print Argo CD YAML with Helm using two settings, save it, and apply it with kubectl.'),

T(CA, 6, 'CRDs: filter by group + create a custom resource', 'common 2025-26',
`ssh cka03008
cert-manager CRDs are installed.
- Write the names of all CRDs belonging to API group cert-manager.io, one per line and sorted, to /root/cm-crds.txt.
- Create a ClusterIssuer named selfsigned of kind cert-manager.io/v1 that uses the selfSigned issuer type.
- Save the output of kubectl explain for clusterissuer.spec.selfSigned to /root/selfsigned.txt.`,
['file1 = /root/cm-crds.txt (names only, sorted)', 'clusterissuer = selfsigned (selfSigned: {})', 'file2 = /root/selfsigned.txt'],
setup(CMCRD),
[ s('Names in group cert-manager.io', "kubectl get crd -o custom-columns=NAME:.metadata.name,GROUP:.spec.group --no-headers | awk '$2==\"cert-manager.io\"{print $1}' | sort > /root/cm-crds.txt; cat /root/cm-crds.txt", 'certificaterequests.cert-manager.io ...', 'acme.cert-manager.io items are a different group.'),
  s('Check the kind exists', 'kubectl api-resources --api-group=cert-manager.io', 'clusterissuers  cert-manager.io/v1  false  ClusterIssuer', 'NAMESPACED false = cluster-wide.'),
  s('Create the ClusterIssuer', ap(`
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata: {name: selfsigned}
spec:
  selfSigned: {}`), 'clusterissuer.cert-manager.io/selfsigned created', 'A CRD lets you store new object kinds.'),
  s('Save the field docs', 'kubectl explain clusterissuer.spec.selfSigned > /root/selfsigned.txt', '', 'Docs come from the CRD schema.') ],
['cat /root/cm-crds.txt', 'kubectl get clusterissuer selfsigned'],
'kubernetes.io: Extend the Kubernetes API with CustomResourceDefinitions', 'List custom types from one group, create one custom object, save its field help.'),

T(CA, 6, 'kubeadm: cert expiry, renew, join command', 'occasional 2025-26',
`ssh cka03009
On the controlplane:
- Save the certificate expiration overview of the cluster to /root/cert-expiry.txt.
- Renew ONLY the kube-apiserver serving certificate and make the API server use it.
- Save a complete kubeadm join command for a new worker node to /root/join.sh.`,
['file1 = /root/cert-expiry.txt', 'renew only apiserver cert', 'file2 = /root/join.sh'],
'',
[ s('Save expiry overview', 'kubeadm certs check-expiration > /root/cert-expiry.txt; head -8 /root/cert-expiry.txt', 'CERTIFICATE  EXPIRES  RESIDUAL TIME ...', 'kubeadm reads all certs for you.'),
  s('Renew apiserver cert', 'kubeadm certs renew apiserver', 'certificate for serving the Kubernetes API renewed', 'Only this one, as asked.'),
  s('Restart the API server', ['mv /etc/kubernetes/manifests/kube-apiserver.yaml /root/', 'sleep 20', 'mv /root/kube-apiserver.yaml /etc/kubernetes/manifests/', 'sleep 40; kubectl get nodes'], 'Ready', 'Static pod restarts and loads the new cert.'),
  s('Create the join command', ['kubeadm token create --print-join-command > /root/join.sh', 'cat /root/join.sh'], 'kubeadm join 172.30.1.2:6443 --token ... --discovery-token-ca-cert-hash sha256:...', 'New token + CA hash in one line.') ],
['openssl x509 -in /etc/kubernetes/pki/apiserver.crt -noout -enddate', 'cat /root/join.sh'],
'kubernetes.io: Certificate Management with kubeadm (search: certs renew check-expiration)', 'Check certificate dates, renew the API server certificate, and print the command a new node would use to join. No setup needed: the cluster already has these.'),

T(SN, 7, 'Gateway API: header match + weighted split', 'common 2025-26',
`ssh cka03010
In namespace shop-gw a Gateway shop-gw (HTTP, port 80) and Services shop-v1 and shop-v2 exist.
Create an HTTPRoute named shop-route attached to shop-gw for hostname shop.example.com:
- Requests with header x-version: v2 go 100% to shop-v2.
- All other requests are split 80% shop-v1 and 20% shop-v2.
Both Services listen on port 80.`,
['namespace = shop-gw', 'route = shop-route -> gateway shop-gw', 'host shop.example.com', 'header x-version=v2 -> shop-v2', 'else 80/20 v1/v2'],
setup(GWCRD, ns('shop-gw'), ap(`
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata: {name: nginx}
spec: {controllerName: example.net/gateway-controller}
---
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata: {name: shop-gw, namespace: shop-gw}
spec:
  gatewayClassName: nginx
  listeners: [{name: http, protocol: HTTP, port: 80}]
---
apiVersion: v1
kind: Service
metadata: {name: shop-v1, namespace: shop-gw}
spec: {selector: {app: shop, v: "1"}, ports: [{port: 80}]}
---
apiVersion: v1
kind: Service
metadata: {name: shop-v2, namespace: shop-gw}
spec: {selector: {app: shop, v: "2"}, ports: [{port: 80}]}`)),
[ s('Check the Gateway', 'kubectl -n shop-gw get gateway shop-gw -o yaml | grep -A3 listeners', 'name: http  port: 80', 'Route will attach to this.'),
  s('Create the HTTPRoute', ap(`
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: {name: shop-route, namespace: shop-gw}
spec:
  parentRefs: [{name: shop-gw}]
  hostnames: [shop.example.com]
  rules:
  - matches:
    - headers: [{name: x-version, value: v2}]
    backendRefs: [{name: shop-v2, port: 80}]
  - matches:
    - path: {type: PathPrefix, value: /}
    backendRefs:
    - {name: shop-v1, port: 80, weight: 80}
    - {name: shop-v2, port: 80, weight: 20}`), 'httproute.../shop-route created', 'Header rule is more specific, so it wins.'),
  s('Check', 'kubectl -n shop-gw describe httproute shop-route | grep -A20 Rules', 'Weight: 80 / Weight: 20 / x-version', 'Both rules stored correctly.') ],
['kubectl -n shop-gw get httproute shop-route -o yaml'],
'kubernetes.io: Gateway API; gateway-api.sigs.k8s.io: HTTP traffic splitting / header matching', 'Send testers (header v2) to version 2 and split everyone else 80/20.'),

T(SN, 6, 'NetworkPolicy pick: AND vs OR trap', 'very common 2025-26',
`ssh cka03011
Pods labelled app=api in namespace payments must accept traffic ONLY from Pods labelled app=gateway in namespace edge, on TCP port 80. A default deny-ingress policy exists in payments.
Several candidate policies are in /root/netpols-ex/. Apply the single file that meets the requirement with the least privilege. Do not modify any file or existing policy.`,
['target = payments app=api', 'source = ns edge AND app=gateway', 'port TCP 80', 'apply one file only'],
setup(ns('payments'), ns('edge'), 'mkdir -p /root/netpols-ex', ap(`
apiVersion: v1
kind: Pod
metadata: {name: api, namespace: payments, labels: {app: api}}
spec: {containers: [{name: c, image: nginx:1.27-alpine}]}
---
apiVersion: v1
kind: Service
metadata: {name: api, namespace: payments}
spec: {selector: {app: api}, ports: [{port: 80}]}
---
apiVersion: v1
kind: Pod
metadata: {name: gateway, namespace: edge, labels: {app: gateway}}
spec: {containers: [{name: c, image: busybox:1.36, command: [sleep, "36000"]}]}
---
apiVersion: v1
kind: Pod
metadata: {name: intruder, namespace: edge, labels: {app: other}}
spec: {containers: [{name: c, image: busybox:1.36, command: [sleep, "36000"]}]}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: {name: deny-in, namespace: payments}
spec: {podSelector: {}, policyTypes: [Ingress]}`),
"cat <<'EOF' > /root/netpols-ex/a.yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: {name: np-a, namespace: payments}\nspec:\n  podSelector: {matchLabels: {app: api}}\n  ingress:\n  - from:\n    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: edge}}\n    - podSelector: {matchLabels: {app: gateway}}\n    ports: [{protocol: TCP, port: 80}]\nEOF",
"cat <<'EOF' > /root/netpols-ex/b.yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: {name: np-b, namespace: payments}\nspec:\n  podSelector: {matchLabels: {app: api}}\n  ingress:\n  - from:\n    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: edge}}\n      podSelector: {matchLabels: {app: gateway}}\n    ports: [{protocol: TCP, port: 80}]\nEOF",
"cat <<'EOF' > /root/netpols-ex/c.yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: {name: np-c, namespace: payments}\nspec:\n  podSelector: {matchLabels: {app: api}}\n  ingress:\n  - from:\n    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: edge}}\n      podSelector: {matchLabels: {app: gateway}}\nEOF",
"cat <<'EOF' > /root/netpols-ex/d.yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: {name: np-d, namespace: payments}\nspec:\n  podSelector: {}\n  ingress:\n  - from:\n    - namespaceSelector: {matchLabels: {kubernetes.io/metadata.name: edge}}\n    ports: [{protocol: TCP, port: 80}]\nEOF"),
[ s('Read every file carefully', 'for f in /root/netpols-ex/*.yaml; do echo "== $f"; cat $f; done', '', 'Look at dashes: each "-" under from is a separate OR.'),
  s('Decide', 'echo "a=OR (any edge pod OR any gateway pod anywhere), b=AND+port, c=no port limit, d=all edge pods+all targets -> b"', '', 'b is the only exact match.'),
  s('Apply b', 'kubectl apply -f /root/netpols-ex/b.yaml', 'networkpolicy.../np-b created', 'One file, no edits.'),
  s('Test allowed and blocked', ['kubectl -n edge exec gateway -- wget -qO- -T2 api.payments | head -2', 'kubectl -n edge exec intruder -- wget -qO- -T2 api.payments'], '<!DOCTYPE html> / download timed out', 'Only the gateway pod gets in.') ],
['kubectl -n payments get networkpolicy'],
'kubernetes.io: Network Policies (search: behavior of to and from selectors)', 'Pick the rule where namespace AND pod label must both match, on port 80 only.'),

T(SN, 7, 'ClusterIP + headless Service and DNS records', 'common 2025-26',
`ssh cka03012
In namespace dns-lab, Deployment catalog (2 replicas, nginx on port 80) exists.
- Expose it with a ClusterIP Service catalog-svc on port 8080 targeting port 80.
- Create a headless Service catalog-headless for the same Pods on port 80.
- From a temporary busybox:1.36 Pod, save the nslookup output of catalog-svc.dns-lab.svc.cluster.local to /root/svc-dns.txt, and of catalog-headless.dns-lab.svc.cluster.local to /root/headless-dns.txt.`,
['namespace = dns-lab', 'svc catalog-svc 8080->80', 'svc catalog-headless clusterIP None', 'files /root/svc-dns.txt, /root/headless-dns.txt'],
setup(ns('dns-lab'), 'kubectl -n dns-lab create deployment catalog --image=nginx:1.27-alpine --replicas=2 --port=80 --dry-run=client -o yaml | kubectl apply -f -'),
[ s('ClusterIP Service', 'kubectl -n dns-lab expose deploy catalog --name=catalog-svc --port=8080 --target-port=80', 'service/catalog-svc exposed', 'One virtual IP for both pods.'),
  s('Headless Service', 'kubectl -n dns-lab expose deploy catalog --name=catalog-headless --port=80 --cluster-ip=None', 'service/catalog-headless exposed', 'clusterIP None = DNS returns pod IPs.'),
  s('Lookups into files', ['kubectl -n dns-lab run dnsq --rm -i --restart=Never --image=busybox:1.36 -- nslookup catalog-svc.dns-lab.svc.cluster.local > /root/svc-dns.txt', 'kubectl -n dns-lab run dnsq --rm -i --restart=Never --image=busybox:1.36 -- nslookup catalog-headless.dns-lab.svc.cluster.local > /root/headless-dns.txt'], '', '--rm -i prints output then deletes the pod.'),
  s('Compare', 'cat /root/svc-dns.txt /root/headless-dns.txt', 'svc: 1 address; headless: 2 addresses', 'Headless shows each pod.') ],
['kubectl -n dns-lab get svc', 'grep -c Address /root/headless-dns.txt'],
'kubernetes.io: DNS for Services and Pods (search: headless service A records)', 'Make a normal and a "headless" service and record what DNS answers for each.'),

T(WS, 7, 'HPA: CPU + memory, scaleUp and scaleDown behavior', 'very common 2025-26',
`ssh cka03013
Create a HorizontalPodAutoscaler named worker-hpa in namespace metrics-app for Deployment worker:
- min 2, max 6 replicas,
- target 60% average CPU utilisation AND 70% average memory utilisation,
- scale up by at most 2 Pods per 60 seconds,
- scale-down stabilization window of 120 seconds.`,
['namespace = metrics-app', 'hpa = worker-hpa -> deploy worker', 'min 2 max 6', 'cpu 60%, memory 70%', 'scaleUp Pods 2 / 60s', 'scaleDown window 120s'],
setup(ns('metrics-app'), ap(`
apiVersion: apps/v1
kind: Deployment
metadata: {name: worker, namespace: metrics-app}
spec:
  selector: {matchLabels: {app: worker}}
  template:
    metadata: {labels: {app: worker}}
    spec:
      containers:
      - {name: worker, image: nginx:1.27-alpine, resources: {requests: {cpu: 100m, memory: 64Mi}}}`)),
[ s('Create the HPA', ap(`
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: {name: worker-hpa, namespace: metrics-app}
spec:
  scaleTargetRef: {apiVersion: apps/v1, kind: Deployment, name: worker}
  minReplicas: 2
  maxReplicas: 6
  metrics:
  - type: Resource
    resource: {name: cpu, target: {type: Utilization, averageUtilization: 60}}
  - type: Resource
    resource: {name: memory, target: {type: Utilization, averageUtilization: 70}}
  behavior:
    scaleUp:
      policies:
      - {type: Pods, value: 2, periodSeconds: 60}
    scaleDown:
      stabilizationWindowSeconds: 120`), 'horizontalpodautoscaler.../worker-hpa created', 'Two metrics: HPA uses the higher demand.'),
  s('Check', 'kubectl -n metrics-app get hpa worker-hpa', 'cpu: <unknown>/60%, memory: <unknown>/70%  2  6', '<unknown> = no metrics-server; config is still right.'),
  s('Check deployment followed min', 'kubectl -n metrics-app get deploy worker', 'READY 2/2 (once metrics exist)', 'Without metrics the HPA may wait.') ],
['kubectl -n metrics-app get hpa worker-hpa -o yaml | grep -A12 behavior'],
'kubernetes.io: Horizontal Pod Autoscaling (search: scaling policies behavior scaleUp)', 'Autoscale on CPU and memory, add at most 2 pods a minute, remove pods only after 2 calm minutes.'),

T(WS, 8, 'PriorityClass with preemption policy', 'very common 2025-26',
`ssh cka03014
Create a PriorityClass named critical-jobs:
- value exactly one less than the highest existing user-defined PriorityClass (ignore system-*),
- preemptionPolicy PreemptLowerPriority, not the global default,
- description "critical batch".
Patch Deployment payments-api in namespace prio to use it, and verify that the running Pods have the new priority value.`,
['pc = critical-jobs', 'value = max user-defined - 1', 'preemptionPolicy PreemptLowerPriority, globalDefault false', 'deployment payments-api (ns prio)'],
setup(ns('prio'), ap(`
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: {name: batch-low}
value: 100
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: {name: team-a}
value: 3000
---
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: {name: team-b}
value: 7000
preemptionPolicy: Never
---
apiVersion: apps/v1
kind: Deployment
metadata: {name: payments-api, namespace: prio}
spec:
  replicas: 2
  selector: {matchLabels: {app: payments-api}}
  template:
    metadata: {labels: {app: payments-api}}
    spec:
      priorityClassName: batch-low
      containers: [{name: c, image: nginx:1.27-alpine}]`)),
[ s('Find the highest user value', "kubectl get pc --sort-by=.value -o custom-columns=NAME:.metadata.name,VALUE:.value | grep -v system-", 'team-b 7000 (highest)', 'Ignore system-* classes.'),
  s('Create critical-jobs = 6999', ap(`
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata: {name: critical-jobs}
value: 6999
globalDefault: false
preemptionPolicy: PreemptLowerPriority
description: "critical batch"`), 'priorityclass.../critical-jobs created', 'YAML lets you set every field.'),
  s('Patch the Deployment', `kubectl -n prio patch deploy payments-api -p '{"spec":{"template":{"spec":{"priorityClassName":"critical-jobs"}}}}'`, 'patched', 'Replaces batch-low.'),
  s('Verify pods', ['kubectl -n prio rollout status deploy payments-api', 'kubectl -n prio get pods -o custom-columns=NAME:.metadata.name,PRIO:.spec.priority,CLASS:.spec.priorityClassName'], '6999  critical-jobs', 'Priority is copied into each new pod.') ],
['kubectl get pc critical-jobs -o yaml | grep -E "value|preemption|globalDefault"'],
'kubernetes.io: Pod Priority and Preemption (search: preemptionPolicy)', 'Create a priority just under the top one, allowed to push others out, and give it to a deployment.'),

T(ST, 5, 'StorageClass (Retain, expandable) + StatefulSet claims', 'common 2025-26',
`ssh cka03015
Create a StorageClass named retain-local: provisioner rancher.io/local-path, reclaimPolicy Retain, volumeBindingMode WaitForFirstConsumer, allowVolumeExpansion true. It must NOT be the default.
In namespace cache create a StatefulSet cache (2 replicas, image redis:7-alpine, headless Service cache) with a volumeClaimTemplate named data requesting 100Mi from retain-local, mounted at /data.`,
['sc = retain-local (Retain, WFFC, expandable, not default)', 'ns = cache', 'statefulset cache 2 replicas, redis:7-alpine', 'claim template data 100Mi -> /data'],
setup(LOCALPATH, ns('cache')),
[ s('Create the StorageClass', ap(`
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: {name: retain-local}
provisioner: rancher.io/local-path
reclaimPolicy: Retain
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true`), 'storageclass.../retain-local created', 'No default annotation = not default.'),
  s('Create Service + StatefulSet', ap(`
apiVersion: v1
kind: Service
metadata: {name: cache, namespace: cache}
spec: {clusterIP: None, selector: {app: cache}, ports: [{port: 6379}]}
---
apiVersion: apps/v1
kind: StatefulSet
metadata: {name: cache, namespace: cache}
spec:
  serviceName: cache
  replicas: 2
  selector: {matchLabels: {app: cache}}
  template:
    metadata: {labels: {app: cache}}
    spec:
      containers:
      - {name: redis, image: redis:7-alpine, volumeMounts: [{name: data, mountPath: /data}]}
  volumeClaimTemplates:
  - metadata: {name: data}
    spec:
      accessModes: [ReadWriteOnce]
      storageClassName: retain-local
      resources: {requests: {storage: 100Mi}}`), 'service/cache created, statefulset.apps/cache created', 'Each replica gets its own PVC.'),
  s('Check', ['kubectl -n cache get pods,pvc', 'kubectl get pv | grep retain-local'], 'data-cache-0 / data-cache-1 Bound; RECLAIM Retain', 'PVs keep the Retain policy.') ],
['kubectl get sc retain-local', 'kubectl -n cache get pvc'],
'kubernetes.io: Storage Classes; StatefulSets (search: volumeClaimTemplates)', 'Make a storage type that keeps disks after delete, and a 2-pod database that gets one disk each.'),

T(ST, 5, 'Re-bind a Released PV (clear claimRef)', 'very common 2025-26 (PV reuse variant)',
`ssh cka03016
The PostgreSQL data PersistentVolume pg-data-pv still holds data, but it is in Released state after its old claim was deleted.
- Make the PV available again WITHOUT deleting it or its data.
- Create PVC pg-data in namespace postgres (1Gi, ReadWriteOnce, storageClassName manual) that binds to it.
- Deploy /root/pg-deploy.yaml (already uses claim pg-data) and make sure the Pod is Running.`,
['pv = pg-data-pv (do NOT delete)', 'pvc = pg-data 1Gi RWO manual (ns postgres)', 'file = /root/pg-deploy.yaml'],
setup(ns('postgres'),
'kubectl get pv pg-data-pv >/dev/null 2>&1 || ' + "cat <<'EOF' | kubectl apply -f -\napiVersion: v1\nkind: PersistentVolume\nmetadata: {name: pg-data-pv}\nspec:\n  capacity: {storage: 1Gi}\n  accessModes: [ReadWriteOnce]\n  persistentVolumeReclaimPolicy: Retain\n  storageClassName: manual\n  hostPath: {path: /mnt/pg-data, type: DirectoryOrCreate}\n  claimRef: {namespace: postgres, name: old-pg-claim, uid: 00000000-0000-0000-0000-000000000001}\nEOF",
"cat <<'EOF' > /root/pg-deploy.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata: {name: postgres, namespace: postgres}\nspec:\n  selector: {matchLabels: {app: postgres}}\n  template:\n    metadata: {labels: {app: postgres}}\n    spec:\n      containers:\n      - name: postgres\n        image: postgres:17-alpine\n        env:\n        - {name: POSTGRES_PASSWORD, value: cka}\n        - {name: PGDATA, value: /var/lib/postgresql/data/pgdata}\n        volumeMounts: [{name: data, mountPath: /var/lib/postgresql/data}]\n      volumes:\n      - {name: data, persistentVolumeClaim: {claimName: pg-data}}\nEOF", 'sleep 5'),
[ s('See the PV state', 'kubectl get pv pg-data-pv', 'Released   postgres/old-pg-claim', 'Released PVs never bind again by themselves.'),
  s('Remove the old claimRef', `kubectl patch pv pg-data-pv --type=json -p='[{"op":"remove","path":"/spec/claimRef"}]'`, 'persistentvolume/pg-data-pv patched', 'Frees the PV; data stays on disk.'),
  s('Check Available', 'kubectl get pv pg-data-pv', 'Available', 'Ready for a new claim.'),
  s('Create the PVC', ap(`
apiVersion: v1
kind: PersistentVolumeClaim
metadata: {name: pg-data, namespace: postgres}
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: manual
  resources: {requests: {storage: 1Gi}}`), 'persistentvolumeclaim/pg-data created', 'Class + size + mode match the PV.'),
  s('Deploy and check', ['kubectl apply -f /root/pg-deploy.yaml', 'kubectl -n postgres get pvc,pods'], 'Bound pg-data-pv / Running', 'Database runs on the old disk.') ],
['kubectl get pv pg-data-pv', 'kubectl -n postgres get pods'],
'kubernetes.io: Persistent Volumes (search: Retain reclaim policy Released claimRef)', 'An old disk is "locked" to a deleted claim; unlock it, claim it again, start the database.')
];

const out = {
  generated: '2026-11-22',
  sources: [
    'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/',
    'https://github.com/cncf/curriculum',
    'https://blog.prateekjain.dev/cka-exam-experience-2026-how-i-passed-with-88-770d3c473af7',
    'https://www.reddit.com/r/devops/comments/1v9n87e/passed_cka_with_88_sharing_my_prep_notes_and_exam/',
    'https://dev.to/suzuki0430/cka-certified-kubernetes-administrator-exam-report-2026-dont-rely-on-old-guides-mastering-the-534m',
    'https://medium.com/@m0hamed.nass01r0/how-to-pass-the-cka-2025-exam-questions-tips-18dc90edd65c',
    'https://github.com/techwithmohamed/CKA-Certified-Kubernetes-Administrator',
    'https://kodekloud.com/community/t/cka-2025-exam-syllabus-tips-and-feedback-request/474245',
    'https://kodekloud.com/community/t/cka-exam-2025-few-thoughts-after-taking-killer-sh-exams/482003',
    'https://kodekloud.com/community/t/just-took-the-latest-version-of-the-cka-exam-failed-miserably-need-some-advice/474751',
    'https://aws.plainenglish.io/cka-2025-isnt-harder-here-s-my-3-attempt-story-to-prove-it-44a0a04757b3',
    'https://www.sailor.sh/blog/cka-exam-changes-2025-2026',
    'https://killercoda.com/playgrounds/scenario/cka'
  ],
  mocks: [{ n: 1, tasks: m1 }, { n: 2, tasks: m2 }, { n: 3, tasks: m3 }]
};

const topics = [TS, CA, SN, WS, ST];
for (const m of out.mocks) {
  const sum = m.tasks.reduce((a, t) => a + t.weight, 0);
  const by = {}; m.tasks.forEach(t => by[t.topic] = (by[t.topic] || 0) + t.weight);
  m.tasks.forEach((t, i) => { if (!topics.includes(t.topic)) throw Error('topic ' + t.title); for (const st of t.steps) if (st.why.split(/\s+/).length > 14) console.warn('long why', m.n, i + 1, st.why); });
  console.log('mock', m.n, 'tasks', m.tasks.length, 'sum', sum, JSON.stringify(by));
  if (sum !== 100 || m.tasks.length !== 16) throw Error('bad mock ' + m.n);
}
fs.mkdirSync('C:/code/cka-coach/content', { recursive: true });
fs.writeFileSync('C:/code/cka-coach/content/mocks.json', JSON.stringify(out, null, 1), 'utf8');
JSON.parse(fs.readFileSync('C:/code/cka-coach/content/mocks.json', 'utf8'));
console.log('ok', fs.statSync('C:/code/cka-coach/content/mocks.json').size, 'bytes');
