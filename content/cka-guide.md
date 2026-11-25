# CKA Beginner Guide (Kubernetes v1.35)

Written for a beginner. Short sentences. Every question has the same layout:

1. **Words first**: the 2 or 3 Kubernetes words you need
2. **PART A. Build the exam**: Killercoda only. One block to paste. In the real exam this already exists.
3. **PART B. The exam starts here**: the question as the exam words it, what it is really saying, what to write down
4. **Opening routine**: the same 2 commands before every question
5. **Steps**: each command, why you run it, what you will see. If YAML is needed: the exact docs page, what to copy, which lines to change.
6. **Closing routine**: verify, then `exit`
7. **If something goes wrong**, and **Mug this up** (the whole answer in a few lines)

Contents:
- Part 1: The words you need
- Part 2: The exam and what to do in it
- Part 3: Everything you type in the exam (commands, and the YAML for things that have no command)
- Part 4: The 40 questions

---

# PART 1: THE WORDS YOU NEED

Read this once. Come back when a word confuses you.

| Word | Plain meaning |
|---|---|
| **Image** | A packaged app (for example your Spring Boot JAR + Java). Read-only. Lives in a registry. |
| **Container** | An image that is running. |
| **Pod** | A wrapper around one or more containers. The smallest thing Kubernetes runs. Has its own IP. |
| **Node** | A machine (server or VM) that runs pods. |
| **Cluster** | All the nodes together, plus the control plane. |
| **Control plane** | The node(s) that manage the cluster. Runs the API server, scheduler, controller-manager and etcd. |
| **API server** | The program every `kubectl` command talks to. |
| **etcd** | The database where the cluster stores everything. |
| **Scheduler** | Decides which node a new pod goes on. |
| **Controller-manager** | Keeps reality equal to what you asked for (3 replicas means 3 pods). |
| **kubelet** | An agent on every node. Starts containers and reports "I am alive". A Linux service, not a pod. |
| **kubectl** (`k`) | The command-line tool you type into. |
| **Namespace** | A named group of objects inside the cluster. `-n app` means "in the namespace app". |
| **Deployment** | A manager for pods. "Keep 3 copies of this image running." |
| **ReplicaSet** | The helper a Deployment uses. You rarely touch it. |
| **Label** | A `key=value` tag on an object, like `app=backend`. |
| **Selector** | A label written inside a Service (or policy). It finds every pod that carries that label. |
| **Service** | A stable address in front of pods. Pods come and go; the service stays. |
| **Endpoints** | The list of pod IPs a service currently sends traffic to. |
| **ConfigMap / Secret** | Settings / passwords kept outside the image. |
| **PV / PVC** | PV = a disk. PVC = a request for a disk. |
| **Static pod** | A pod started from a file in `/etc/kubernetes/manifests/` on a node. The control plane parts are static pods. |

**The chain to remember:**

```
you type kubectl  ->  API server  ->  saved in etcd  ->  controller makes pods
->  scheduler picks a node  ->  kubelet on that node pulls the image and starts the container
```

When something is broken, one link of this chain is broken. Troubleshooting = finding which link.

---

# PART 2: THE EXAM

## The basics

| Thing | Value |
|---|---|
| Time | 2 hours |
| Questions | about 15 to 20 hands-on tasks in a terminal |
| Pass mark | 66% |
| Allowed | kubernetes.io/docs in one browser tab |
| Included in the price | 1 free retake, 2 killer.sh practice sessions |

## The 5 topics (the old file called them A, B, C, D, E)

| Topic | Share | Plain meaning |
|---|---|---|
| Troubleshooting | 30% | Something is broken. Find why. Fix it. |
| Cluster Architecture | 25% | Admin work: permissions, Helm, upgrades, CRDs |
| Services & Networking | 20% | How pods talk to each other and the outside |
| Workloads & Scheduling | 15% | Running apps, their settings, which node they go on |
| Storage | 10% | Disks for pods |

## Do these 5 steps for EVERY question

1. **Run the `ssh` command** at the top of the question. Each question has its own machine.
2. **Read the question twice.** Note the names, the namespace, file paths, numbers.
3. **Solve it.**
4. **Verify it.** Run a `k get` or a test. A fix that does not work scores zero.
5. **Type `exit`** before the next question.

Good habits:
- `k` already means `kubectl`. Do not build other shortcuts. They vanish on every new machine.
- Look at the prompt before you type. `root@controlplane` or `root@node01` tells you where you are.
- `localhost:8080 was refused` means you are on the wrong machine. Type `exit`.
- Always add `-n <namespace>`. "No resources found" usually means you forgot it.
- If a command fails on a flag you know is right, the typo is earlier in the line.

## Time plan

- First 80 minutes: all questions in order. Stuck for more than 8 minutes? Flag it, move on.
- Last 40 minutes: flagged questions, then check everything again.

## The one troubleshooting rule

Never guess. Let Kubernetes tell you.

```
get  ->  describe (read Events at the bottom)  ->  logs  ->  fix the OWNER  ->  verify
```

"Owner": if a Deployment created the pod, fix the Deployment. If you only fix or delete the pod, the Deployment makes a new broken one.

---

# PART 3: EVERYTHING YOU TYPE IN THE EXAM

This part has two halves:

- **3A. Things that have a command.** One line each, grouped by the job they do.
- **3B. Things that have NO command.** For each one: where to find it in the docs, and the YAML written out, with the lines you change marked.

Then **3C** facts to know by heart, **3D** habits, and **3E** how to recognise a question in 15 seconds.

**★ = the core.** Learn the ★ lines first. They solve most of the exam. The lines without ★ are here so you can find them when a question needs them.

**Every kubectl command has one of two shapes, exactly as the official docs write their examples:**
```
k   VERB   TYPE NAME   -n NAMESPACE     # get, describe, delete, label, annotate, patch, expose, autoscale, taint
k   VERB   TYPE/NAME   -n NAMESPACE     # edit, set image|env|resources|selector, rollout ..., scale, logs/exec on a non-pod
```
"**get** the **deployment** called **api** in namespace **app**" → `k get deployment api -n app`
"**change the image** of the **deployment** called **api**" → `k set image deployment/api nginx=nginx:1.27 -n app`

Type names as the docs spell them: `pod` `deployment` `service` `node` `namespace` `configmap` `secret` `serviceaccount` `ingress` `networkpolicy` `storageclass` `priorityclass` `daemonset` `endpoints`. Short names only where the docs use them too: `pv` `pvc` `hpa` `rs` `crd`. A list (no name) is plural: `k get pods`, `k get nodes`, `k get services`, `k get deployments`. Nodes in `label` and `taint`: `k label nodes NODE ...`, `k taint nodes NODE ...`. `-n NS` always goes last (before `--`, `|` or `>`).

---

# 3A. THINGS THAT HAVE A COMMAND

## LOOK. Always start here.

```
★ k get pods -n NS                                # status
★ k get pods -o wide --show-labels -n NS          # + node, IP, labels
★ k describe pod NAME -n NS                       # WHY? Read "Events" at the bottom
★ k logs NAME --previous -n NS                    # what the crashed container printed
★ k get endpoints SVC -n NS                       # does the Service have pods behind it?
  k logs NAME -c CONTAINER -n NS                  # one container of several
  k get pods -A                                   # all namespaces
  k get all -n NS                                 # pods + services + deployments at once
  k get TYPE NAME -o yaml -n NS                   # the full object
  k get events --sort-by=.lastTimestamp -n NS     # events, newest last
  k top pod -A --sort-by=cpu        /  k top node # usage
  k explain pod.spec.tolerations                  # the manual for any field
  k api-resources | grep -i WORD                  # short name + "has a namespace?"
```
`get`, `describe`, `-o wide`, `-o yaml` work on every type.

## MAKE

```
★ k create namespace NAME
★ k create deployment NAME --image=IMAGE --replicas=3 -n NS
★ k run POD --image=IMAGE -n NS                                     # add:  -- sleep 3600   for a command
★ k expose deployment NAME --name=SVC --port=80 --target-port=80 -n NS  # add:  --type=NodePort  if asked
★ k create configmap NAME --from-literal=KEY=VALUE -n NS
★ k create secret generic NAME --from-literal=KEY=VALUE -n NS
★ k create serviceaccount NAME -n NS
★ k create role NAME --verb=get,list --resource=pods -n NS
★ k create rolebinding NAME --role=ROLE --serviceaccount=NS:SA -n NS
  k create clusterrole NAME --verb=get,list --resource=nodes
  k create clusterrolebinding NAME --clusterrole=CR --serviceaccount=NS:SA
  k create rolebinding NAME --clusterrole=CR --user=USER -n NS      # a ClusterRole, limited to one namespace
  k create ingress NAME --class=CLASS --rule="HOST/*=SVC:PORT" -n NS        # with TLS:  ...=SVC:PORT,tls=SECRET
  k create priorityclass NAME --value=1000                          # PriorityClass
  k autoscale deployment NAME --min=2 --max=5 --cpu=70% -n NS       # HPA
  k create secret tls NAME --cert=FILE.crt --key=FILE.key -n NS
★ k run POD --image=IMAGE --dry-run=client -o yaml -n NS > pod.yaml # write the YAML, create nothing
  k create deployment D --image=IMAGE --dry-run=client -o yaml > d.yaml
```

## CHANGE

```
★ k edit deployment/NAME -n NS                      # change ANYTHING. Opens vim. Save = applied.
★ k set image deployment/NAME CONTAINER=IMAGE -n NS
★ k set resources deployment/NAME --requests=cpu=100m,memory=128Mi -n NS    # add --limits=... if asked
★ k scale deployment/NAME --replicas=3 -n NS
★ k rollout undo deployment/NAME -n NS              # back one version.  --to-revision=N for a specific one
★ k rollout restart deployment/NAME -n NS           # new pods (after a ConfigMap change)
  k rollout status deployment/NAME -n NS            # wait until finished
  k rollout history deployment/NAME -n NS
  k set selector service/NAME app=VALUE -n NS       # fix a Service that finds no pods
  k set env deployment/NAME --from=configmap/CM -n NS
★ k apply -f file.yaml                              # create or update from your file
  k apply -k FOLDER                                 # a kustomize folder.  Preview: k kustomize FOLDER
  k label nodes NODE key=value                      # remove:  k label nodes NODE key-
  k taint nodes NODE key=value:NoSchedule           # remove:  same line + "-" at the very end
  k cordon NODE  /  k uncordon NODE
  k drain NODE --ignore-daemonsets --delete-emptydir-data
```
If you forget a `set` command, `k edit` always works.

## DELETE

```
★ k delete TYPE NAME -n NS
  k delete pod NAME --force --grace-period=0 -n NS  # do not wait 30 seconds
  k delete -f file.yaml
  k replace --force -f file.yaml                    # delete + create in one step (for fields that cannot be edited)
```

## TEST. Prove it before you move on.

```
★ k exec POD -n NS -- wget -qO- -T 3 SVC                            # capital O, not zero
★ k auth can-i VERB TYPE --as=system:serviceaccount:NS:SA -n NS
  k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup SVC.NS.svc.cluster.local
  k exec POD -n NS -- env | grep KEY        /  k exec POD -n NS -- ls /path
  curl -s -m 3 NODE:NODEPORT
```

| Test result | Meaning |
|---|---|
| `connection refused` | reached the pod, wrong port |
| `download timed out` | traffic is dropped: NetworkPolicy, or no endpoints |
| `bad address` / `NXDOMAIN` | the name does not resolve: typo, or DNS problem |
| `localhost:8080 was refused` | you are on the wrong machine → `exit` |
| `...:6443 was refused` | the API server is down → `crictl` |

## WRITE TO A FILE

```
★ ANY-COMMAND > /path/file            # k logs X > /opt/x.log      k get crd | grep WORD > /root/crds.txt
  echo SOME-NAME > /path/file
```

## ON A NODE (Linux, not kubectl)

```
★ ssh node01        ...        exit
★ systemctl status kubelet                          # inactive (dead) = stopped.  auto-restart = misconfigured
★ systemctl enable --now kubelet                    # start now + at every boot
★ journalctl -u kubelet -n 30 --no-pager            # WHY it fails
  systemctl cat kubelet                             # which file holds the setting
  systemctl daemon-reload ; systemctl restart kubelet               # after editing a service file
★ crictl ps -a | grep NAME      →     crictl logs ID                # when kubectl does not answer
★ vim /etc/kubernetes/manifests/kube-apiserver.yaml                 # also: kube-scheduler, kube-controller-manager, etcd
                                                    # save, then WAIT up to 60 s. Restart nothing.
  dpkg -i FILE.deb                                  # install a package file
  vim /etc/sysctl.d/k8s.conf ; sysctl --system      # permanent kernel settings
  cp FILE /root/                                    # backup before editing any system file
```

## HELM

```
  helm repo add NAME URL ; helm repo update
  helm show values REPO/CHART | grep -i WORD                        # find the name of a setting
  helm template RELEASE REPO/CHART --version V -n NS --set KEY=VALUE > file.yaml    # YAML only, installs nothing
  helm install  RELEASE REPO/CHART -n NS --create-namespace --set KEY=VALUE
  helm upgrade  RELEASE REPO/CHART -n NS --set KEY=VALUE
  helm history RELEASE -n NS     →     helm rollback RELEASE REVISION -n NS
  helm list -A          /  helm uninstall RELEASE -n NS
```

## CLUSTER UPGRADE (follow the docs page "Upgrading kubeadm clusters"; this is the order)

```
  k drain NODE --ignore-daemonsets --delete-emptydir-data           # from the control plane
  apt-get update ; apt-cache madison kubeadm | head                 # find the exact version text
  apt-mark unhold kubeadm ; apt-get install -y kubeadm=VERSION ; apt-mark hold kubeadm
  kubeadm upgrade plan ; kubeadm upgrade apply vX.Y.Z               # control plane.   WORKER:  kubeadm upgrade node
  apt-mark unhold kubelet kubectl ; apt-get install -y kubelet=VERSION kubectl=VERSION ; apt-mark hold kubelet kubectl
  systemctl daemon-reload ; systemctl restart kubelet
  k uncordon NODE                                                   # from the control plane
```

## ETCD BACKUP / RESTORE

```
  grep -E "trusted-ca-file|cert-file|key-file" /etc/kubernetes/manifests/etcd.yaml
  etcdctl snapshot save /path/backup.db --endpoints=https://127.0.0.1:2379 \
      --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key
  etcdutl snapshot restore /path/backup.db --data-dir=/var/lib/etcd-restored
  vim /etc/kubernetes/manifests/etcd.yaml           # bottom of file, volume "etcd-data":  hostPath path: /var/lib/etcd-restored
```

## CNI

```
  k create -f TIGERA-OPERATOR-URL                   # Calico = supports NetworkPolicy. Flannel does NOT.
  k get pods -l component=kube-controller-manager -o yaml -n kube-system | grep cluster-cidr
  curl -LO CUSTOM-RESOURCES-URL ; vim custom-resources.yaml         # cidr: <that range>
  k apply -f custom-resources.yaml
```

---

# 3B. THINGS THAT HAVE NO COMMAND

There is no `k create pv`, `pvc`, `storageclass`, `networkpolicy`, `gateway`... For these you write a YAML file. **Never from memory.** The routine is always:

```
1. kubernetes.io/docs  →  type the search words  →  open the page  →  copy the example box
2. vim x.yaml  →  i  →  paste  →  change the marked lines, delete what the question did not ask for  →  Esc  :wq
3. k apply -f x.yaml
4. k get ...   to check
```

Below, every item shows: **search words → page → the finished YAML.** Lines marked `# <-` are the ones you change. If you cannot reach the docs, the YAML here is complete.

---

## ★ PersistentVolume (PV)
**Search:** `persistent volume pod` → **Page:** "Configure a Pod to Use a PersistentVolume for Storage" → box `pv-volume.yaml`
```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data                  # <- name.  NO namespace line: a PV has none
spec:
  storageClassName: manual       # <- class
  capacity:
    storage: 1Gi                 # <- size
  accessModes:
    - ReadWriteOnce              # <- mode
  hostPath:
    path: "/mnt/data"            # <- path
```
Check: `k get pv` → `Available`

## ★ PersistentVolumeClaim (PVC)
**Same page** → box `pv-claim.yaml`
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data                 # <- name
  namespace: storage             # <- ADD this line
spec:
  storageClassName: manual       # <- must equal the PV's class.  PV has no class?  write ""
  accessModes:
    - ReadWriteOnce              # <- must equal the PV's mode
  resources:
    requests:
      storage: 500Mi             # <- must be <= the PV's size
```
Check: `k get pvc -n NS` → `Bound`, and VOLUME shows the PV you expect.
Never delete the `storageClassName` line: without it the default class creates a NEW empty disk.

## ★ Pod that uses a PVC
**Same page** → box `pv-pod.yaml`
```
apiVersion: v1
kind: Pod
metadata:
  name: web-store                # <- name
  namespace: storage             # <- ADD. Same namespace as the PVC
spec:
  volumes:
    - name: task-pv-storage      #    a linking name; leave it
      persistentVolumeClaim:
        claimName: pvc-data      # <- the PVC's name
  containers:
    - name: web
      image: nginx:1.27          # <- image
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"    # <- where it appears inside
          name: task-pv-storage  #    same linking name
```
In an existing Deployment file, the only line to change is usually `claimName:`.

## ★ StorageClass
**Search:** `storage classes` → **Page:** "Storage Classes" → first example. Delete the lines for `reclaimPolicy`, `allowVolumeExpansion`, `mountOptions`, `parameters` unless asked.
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast                                                # <- name
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"     # <- "true" = default.  Not asked? delete both lines
provisioner: rancher.io/local-path                          # <- from the question
volumeBindingMode: WaitForFirstConsumer                     # <- or Immediate
```
Take the default mark off the OLD class. **Search:** `change default storage class` → copy the `kubectl patch` command and put in the old class's name.
```
k patch storageclass OLD-NAME -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```
Check: `k get storageclass` → `(default)` next to one name only.

## ★ NetworkPolicy: allow A to reach B
**Search:** `network policies` → **Page:** "Network Policies" → "The NetworkPolicy resource". Delete `- Egress`, the `ipBlock` and `namespaceSelector` blocks, and everything from `egress:` down.
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-client             # <- name
  namespace: web                 # <- namespace
spec:
  podSelector:
    matchLabels:
      app: backend               # <- WHO is protected (the destination)
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          run: client            # <- WHO may come in (the source)
    ports:
    - protocol: TCP
      port: 80                   # <- WHICH port
```
Find the labels first: `k get pods --show-labels -n NS`.
Source in ANOTHER namespace → ONE dash, two selectors (one dash = AND, two dashes = OR):
```
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: frontend      # <- the other namespace's name
      podSelector:
        matchLabels:
          app: api
```

## NetworkPolicy: deny everything, keep DNS
**Same page** → "Default policies" → "Default deny all ingress and all egress traffic". Add the `egress:` block.
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny             # <- name
  namespace: prod                # <- ADD
spec:
  podSelector: {}                #    {} = every pod in the namespace
  policyTypes:
  - Ingress
  - Egress
  egress:                        # <- ADD these 6 lines only if DNS must keep working
  - ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
```
Deny ingress only → keep just `- Ingress` and no `egress:` block.

## ★ Gateway + HTTPRoute (replaces an Ingress)
**Search:** `gateway api` → **Page:** "Gateway API" → examples under "Gateway" and "HTTPRoute".
Read the values from the old Ingress first: `k get ingress NAME -o yaml -n NS` (host, TLS secret, path, service, port) and `k get gatewayclass`.
```
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gw                   # <- name
  namespace: web                 # <- ADD
spec:
  gatewayClassName: nginx        # <- from: k get gatewayclass
  listeners:
  - name: https
    protocol: HTTPS              # <- HTTP if the Ingress had no TLS
    port: 443                    # <- 80 for HTTP
    hostname: shop.example.com   # <- ADD. The Ingress host
    tls:                         # <- ADD these 4 lines only for HTTPS (not in the docs example)
      mode: Terminate
      certificateRefs:
      - name: web-tls            # <- the Ingress's TLS secret
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: web-route                # <- name
  namespace: web                 # <- ADD
spec:
  parentRefs:
  - name: web-gw                 # <- MUST equal the Gateway's name
  hostnames:
  - "shop.example.com"           # <- the Ingress host
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /                 # <- the Ingress path
    backendRefs:
    - name: backend-svc          # <- the Ingress's service
      port: 80                   # <- the Ingress's service port
```
Check: `k get gateway,httproute -n NS`. Delete the Ingress only after both exist.

## ★ Sidecar in an existing Deployment
**Search:** `sidecar containers` → **Page:** "Sidecar Containers" → "Example application".
`k get deployment NAME -o yaml -n NS > d.yaml`, edit, `k apply -f d.yaml`. Add 3 pieces under `spec.template.spec`:
```
    spec:
      volumes:                                   # piece 1: the shared folder (pod level)
      - name: logs
        emptyDir: {}
      initContainers:                            # piece 2: the sidecar (pod level)
      - name: log-shipper                        # <- name
        image: busybox:1.36                      # <- image
        restartPolicy: Always                    #    THIS line makes it a sidecar
        command: ['sh', '-c', 'tail -f /var/log/app.log']     # <- command
        volumeMounts:
        - name: logs
          mountPath: /var/log                    # <- path
      containers:
      - name: main                               #    the existing container: leave as it is, and add:
        image: busybox:1.36
        volumeMounts:                            # piece 3: the same mount in the main container
        - name: logs
          mountPath: /var/log
```
Check: `k get pods -n NS` → `2/2`. `k logs deployment/NAME -c log-shipper -n NS`.

## ★ Toleration + nodeSelector (pod level)
**Search:** `taints tolerations` → **Page:** "Taints and Tolerations" → the `tolerations:` block.
```
spec:
  nodeSelector:
    env: prod                    # <- a label the node has.  SENDS the pod there
  tolerations:
  - key: "env"                   # <- taint key
    operator: "Equal"
    value: "prod"                # <- taint value
    effect: "NoSchedule"         # <- taint effect.   ALLOWS the pod there
  containers:
  - name: x
    image: nginx:1.27
```

## ★ ConfigMap / Secret into a pod
**Search:** `configmap` → "Configure a Pod to Use a ConfigMap". **Search:** `secret volume` → "Distribute Credentials Securely Using Secrets".
```
spec:
  containers:
  - name: api
    image: nginx:1.27
    envFrom:                     # ALL keys as environment variables (container level)
    - configMapRef:
        name: app-cfg            # <- ConfigMap name.    For a Secret:  - secretRef:
    volumeMounts:                # as FILES: part 1 (container level)
    - name: db
      mountPath: /etc/db         # <- folder inside the container
  volumes:                       # as FILES: part 2 (pod level, same column as "containers:")
  - name: db
    secret:
      secretName: db-sec         # <- Secret name.       For a ConfigMap:  configMap: / name: app-cfg
```

## Small blocks you add with `k edit`
```
        ports:                               # container level, same column as "image:"
        - containerPort: 80

      priorityClassName: high-priority       # pod level, one line, just above "containers:"

  behavior:                                  # in an HPA, under "spec:", same column as "maxReplicas:"
    scaleDown:
      stabilizationWindowSeconds: 30

  - nodePort: 30080                          # in a NodePort Service: change the random number
  targetPort: 80                             # in a Service: the port the container listens on
```

## DaemonSet and static pod (tricks, no docs needed)
```
k create deployment agent --image=nginx:1.27 --dry-run=client -o yaml > ds.yaml
vim ds.yaml        # kind: Deployment -> DaemonSet.  Delete the lines "replicas: 1" and "strategy: {}"
k apply -f ds.yaml

ssh node01
kubectl run static-web --image=nginx:1.27 --dry-run=client -o yaml > /etc/kubernetes/manifests/static-web.yaml
exit               # the kubelet starts every file in that folder. To remove the pod: delete the file.
```

## Text you edit inside a ConfigMap
```
k edit configmap/coredns -n kube-system      # inside ".:53 {" add:   rewrite name OLD.NAME SVC.NS.svc.cluster.local
k rollout restart deployment/coredns -n kube-system

k edit configmap/nginx-config -n NS          # ssl_protocols TLSv1.2 TLSv1.3;   ->   ssl_protocols TLSv1.3;
k rollout restart deployment/NAME -n NS
```
Backup first: `k get configmap NAME -o yaml -n NS > /root/backup.yaml`

---

# 3C. FACTS TO KNOW BY HEART

| Ports | | Paths | |
|---|---|---|---|
| `6443` | API server | `/etc/kubernetes/manifests/` | control plane pod files |
| `2379` | etcd | `/etc/kubernetes/pki/etcd/` | etcd certificates |
| `53` | DNS | `/var/lib/kubelet/config.yaml` | kubelet settings |
| `30000-32767` | NodePort range | `/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf` | kubelet service file |

| Name | What |
|---|---|
| `SVC.NS.svc.cluster.local` | full DNS name of a Service |
| `system:serviceaccount:NS:SA` | full name of a ServiceAccount, for `--as=` |
| `run=NAME` / `app=NAME` | label of a pod from `k run` / from `k create deployment` |
| `k8s-app=kube-dns` | label of the CoreDNS pods |
| `100m` | a tenth of a CPU. `100` without `m` = one hundred CPUs |
| `Bound` / `Available` / `Released` | PVC connected / PV free / PV still remembers an old PVC (`k edit pv`, delete `claimRef:`) |

| Status | First command |
|---|---|
| `ImagePullBackOff` | `k describe pods` → `k set image` |
| `CrashLoopBackOff` | `k logs --previous` → `k describe pods` → `k edit deployment` |
| `Pending` with Events | `k describe pods` → fix what Events names |
| `Pending`, Events empty | `k get pods -n kube-system` → fix the scheduler's file |
| Node `NotReady` | `ssh` → `systemctl status kubelet` → `journalctl -u kubelet` |
| Service no answer | `k get endpoints`: `<none>` → `k set selector`. IP there → `k edit service` (targetPort) |
| Service fine, timeout | `k get networkpolicy` → add an allow policy |
| names do not resolve | `k get pods -l k8s-app=kube-dns -n kube-system` |

**vim:** `i` type · `Esc` stop · `:wq` save · `:q!` quit · `dd` delete line · `u` undo · `/word` search · `o` new line below · `O` new line above · `G` end of file · `:set paste` before pasting YAML.
YAML: spaces only, two per level, never Tab.

---

# 3D. HABITS

1. **Always `-n NAMESPACE`.** "No resources found" means you forgot it.
2. **Never guess. `describe`, then read Events.**
3. **Fix the owner.** A pod made by a Deployment → change the Deployment.
4. **Copy, do not type:** names from the output, values from the question, YAML from the docs. Press Tab to complete.
5. **Backup before editing a system file:** `cp FILE /root/`. Never keep backups inside `/etc/kubernetes/manifests/`.
6. **After a ConfigMap change:** `k rollout restart`. **After a service file change:** `systemctl daemon-reload`.
7. **"Do not delete X"** → `edit` / `set` / `patch`. **"Must survive a reboot"** → `enable`, or a file in `/etc/sysctl.d/`. **"The existing class"** → look it up first.
8. **Verify before you move on.** Then look at the prompt, and `exit`.

**Daily warm-up (5 minutes, from memory):**
```
k create namespace drill
k create deployment web --image=nginx:1.27 --replicas=2 -n drill
k get pods -o wide --show-labels -n drill
k expose deployment web --name=web-svc --port=80 --target-port=80 -n drill
k get endpoints web-svc -n drill
k set image deployment/web nginx=nginx:1.28 -n drill
k rollout undo deployment/web -n drill
k scale deployment/web --replicas=3 -n drill
k describe pods -n drill | grep -A5 Events
k delete namespace drill
```

---

# 3E. RECOGNISE THE QUESTION

Read the question once. Find the trigger words. Jump to the row.
The first command is the same every time. Run it before you think further.

**Something is broken**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "ImagePullBackOff", "ErrImagePull", "not Running" | wrong image name or tag | `k describe pod <pod> -n NS` (Events) | 1 |
| "keeps restarting", "CrashLoopBackOff" | the container command fails | `k logs <pod> --previous -n NS` | 2 |
| "Pending", a CPU or memory number | the request does not fit any node | `k describe pod <pod> -n NS` (Events: `Insufficient cpu`) | 3 |
| "Pending", "other pods are fine" | the scheduler is down | `k get pods -n kube-system` | 9 |
| "NotReady", "survive a reboot" | kubelet stopped and disabled | `ssh node01` → `systemctl status kubelet` | 4 |
| "NotReady", no reboot words | kubelet config is wrong | `ssh node01` → `journalctl -u kubelet -n 30` | 5 |
| "kubectl commands fail", "after a configuration change" | API server manifest is broken | `crictl ps -a` (on the control plane) | 8 |
| "cannot reach service", nothing about ports | Service selector is wrong | `k get endpoints SVC -n NS` → `<none>` | 6 |
| "cannot reach service", "listens on port 80" | Service targetPort is wrong | `k get endpoints SVC -n NS` → IP shown, wrong port | 7 |
| "cannot reach", "NetworkPolicy", "ONLY pod X" | a deny policy, no allow policy | `k get networkpolicy -n NS` | 10 |
| "cannot resolve", "by IP still works" | CoreDNS is down | `k get pods -l k8s-app=kube-dns -n kube-system` | 11 |

**Write something to a file**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "logs … to the file", "uses the most CPU" | logs and usage | `k logs api -n app > /opt/api.log` | 12 |
| "list of all … CRDs", "documentation of the field" | read the API | `k get crd` | 18 |
| "temporary pod", "look up the DNS name" | DNS across namespaces | `k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup SVC.NS` | 30 |
| "roll back", "write the image … to" | rollout history | `k rollout undo deployment/web -n shop` | 37 |

**Permissions, packages, cluster admin**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "ServiceAccount", "Role", "RoleBinding", one namespace | namespaced RBAC | `k create serviceaccount NAME -n NS` | 13 |
| "nodes", "ClusterRole", "ClusterRoleBinding" | cluster-wide RBAC | `k create clusterrole NAME --verb=get,list --resource=nodes` | 14 |
| "Helm", "template", "CRDs must NOT" | helm template with a value | `helm show values REPO/CHART --version V` | 15 |
| "Helm", "release", "upgrade", "roll back", "revision" | helm lifecycle | `helm repo add NAME URL` | 16 |
| "Kustomize", "Do not edit deploy.yaml" | change kustomization.yaml only | `cat /root/kust/kustomization.yaml` | 17 |
| ".deb", "kernel parameters", "persist across reboots" | node preparation | `dpkg -i FILE.deb` | 19 |
| "no CNI", "Flannel", "Calico", "NetworkPolicy enforcement" | install Calico | `k create -f <tigera-operator URL>` | 20 |
| "Upgrade … to 1.35.x", "drain" | kubeadm upgrade | `k drain NODE --ignore-daemonsets` | 21 |
| "snapshot", "etcd", "2379", "restore" | etcd backup and restore | `grep file /etc/kubernetes/manifests/etcd.yaml` | 22 |

**Expose an app or control traffic**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "NodePort", "node port 30080" | expose, then set nodePort | `k edit deployment/np -n web` (containerPort) | 23 |
| "Ingress", "host", "path … Prefix" | one imperative line | `k get ingressclass` | 24 |
| "Gateway", "HTTPRoute", "migrate", "Ingress" | rebuild the Ingress as Gateway | `k get ingress web-ing -o yaml -n web` | 25 |
| "accept … ONLY from pods with label", "port" | allow policy | `k get pods --show-labels -n NS` | 26 |
| "blocks all incoming and all outgoing", "DNS … must still work" | default deny + DNS egress | docs "Network Policies" | 27 |

**Configuration**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "TLSv1.3", "ConfigMap", "running pods use the new configuration" | edit cm, restart | `k get configmap nginx-config -o yaml -n nginx-static` | 28 |
| "resolves to the service", "cluster DNS" | CoreDNS rewrite | `k get configmap coredns -o yaml -n kube-system` | 29 |
| "environment variables", "mounted as files", "Secret" | cm + secret in a pod | `k create configmap app-cfg --from-literal=LOG_LEVEL=debug -n app` | 35 |

**Workloads and scheduling**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "sidecar", "shared volume", "tail -f" | add a container | `k get deployment app -o yaml -n work > app.yaml` | 31 |
| "HorizontalPodAutoscaler", "stabilization window" | autoscale, then edit behavior | `k autoscale deployment web --min=2 --max=5 --cpu=70% -n shop` | 32 |
| "PriorityClass", "one less than the highest" | look up, then create | `k get priorityclass` | 33 |
| "share … equally", "headroom", "requests" | resources from node numbers | `k describe node node01` (Allocatable) | 34 |
| "Taint", "tolerates", "scheduled on node01" | taint + label + toleration | `k taint nodes node01 env=prod:NoSchedule` | 36 |
| "update … to image", "roll back to the previous revision" | rollout | `k set image deployment/web nginx=nginx:1.28 -n shop` | 37 |

**Storage**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "PersistentVolume", "hostPath", "mounts the claim" | build PV → PVC → pod | docs "Configure a Pod to Use a PersistentVolume for Storage" | 38 |
| "StorageClass", "default", "WaitForFirstConsumer" | new default class | `k get storageclass` | 39 |
| "deleted by accident", "PersistentVolume still exists", "bind to the existing" | PVC that matches the old PV | `k get pv` | 40 |

**Questions that look the same. One command tells them apart:**

| You read | Run | Result → question |
|---|---|---|
| "cannot reach service" | `k get endpoints SVC -n NS` | `<none>` → Q6 · IP shown → Q7 · IP shown and a NetworkPolicy exists → Q10 |
| "Pending" | `k describe pod <pod> -n NS` | Events say `Insufficient` → Q3 · Events empty → Q9 |
| "NotReady" | `systemctl status kubelet` (on the node) | `inactive (dead)` → Q4 · `activating (auto-restart)` → Q5 |

> Check: `k get endpoints` still works on v1.35, with a warning. Endpoints is deprecated since v1.33. The newer command is `k get endpointslices -l kubernetes.io/service-name=SVC -n NS`.


---

# PART 4: THE 40 QUESTIONS

★ = reported often in 2025-26 exams.

To practise a question: paste its **Part A**, then work through **Part B** without looking at Part A again. To repeat it, paste Part A again; it wipes the old attempt.

---

# TROUBLESHOOTING (30% of the score) — Questions 1 to 12

**Every question in this group is solved the same way:**

```
get  ->  describe (read Events at the bottom)  ->  logs  ->  fix the OWNER  ->  verify
```

"Owner": if a Deployment created the pod, fix the Deployment. If you only fix or delete the pod, the Deployment makes a new broken one.

**The STATUS word tells you where to look:**

| You see | It means | Look with |
|---|---|---|
| `ImagePullBackOff` / `ErrImagePull` | the image cannot be downloaded | `describe` |
| `CrashLoopBackOff` | the container starts, then stops, again and again | `logs --previous` |
| `Pending` | no node accepted the pod | `describe` |
| `CreateContainerConfigError` | a ConfigMap or Secret is missing | `describe` |
| Node `NotReady` | the kubelet on that node is not reporting | `ssh` + `systemctl` |
| Service does not answer | selector or port is wrong | `get endpoints` |
| kubectl itself does not answer | the API server is down | `crictl` |

**Docs:** none of these 12 questions needs the docs. Everything is a command.

---

## 1. ImagePullBackOff

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`, the pod of deployment `api` is not Running. Find the cause and fix it so the pod reaches Running. Do not delete the deployment.

**What the question is really saying:**

The image cannot be downloaded. Fix the image in the deployment.

**Write down from the question:** namespace = `app` · deployment = `api` · do NOT delete the deployment

---

### Think

- **Broken:** the image name or tag does not exist.
- **Look first:** the pod's status, then its Events.
- **Expect:** `ImagePullBackOff`
- **Fix:** a real image in the deployment.
- **Prove:** the rollout finishes.

### Time budget

Target 2 min. Skip at 5.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace app --ignore-not-found
k create namespace app
k create deployment api --image=nginx:doesnotexist -n app
sleep 20
clear
k get pods -n app
```

---

### Step 1. What state is the pod in?

**Why:** the STATUS column names the problem.

```
k get pods -n app
```
You see:
```
api-697db8cc78-hgvdr   0/1   ImagePullBackOff   0   60s   <-- STATUS
```
**Means:** the image cannot be downloaded. `ErrImagePull` means the same.

---

### Step 2. Why can't it download?

**Why:** Kubernetes writes the reason into the pod's Events.

```
k describe pod <pod-name> -n app
```
You see:
```
Warning  Failed  ...  Failed to pull image "nginx:doesnotexist": ... not found   <-- cause
```
**Means:** the tag `doesnotexist` does not exist.

---

### Step 3. What is the container called?

**Why:** `k set image` needs the container name, not the deployment name.

```
k get deployment api -o wide -n app
```
You see:
```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES               SELECTOR
api    0/1     1            0           1m    nginx        nginx:doesnotexist   app=api   <-- CONTAINERS
```
**Means:** the container is `nginx`. The deployment is `api`.

---

### Step 4. Fix the image

**Why:** fix the deployment. It makes a new pod.

```
k set image deployment/api nginx=nginx:1.27 -n app
```
You see:
```
deployment.apps/api image updated
```
**Don't:** write `api=...`. Left of `=` is the container name.

---

### Verify

**Why:** prove the new pod is up.

```
k rollout status deployment/api -n app
```
You see:
```
deployment "api" successfully rolled out
```
**Means:** the new pod is Running. Its name is new. That is correct.

---

### Three words first

- **Tag** = the version after the colon: `nginx:1.27`.
- **ImagePullBackOff** = the download failed. Kubernetes retries, slower each time.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `unable to find container named "api"` | deployment name left of `=` | use the container name (`nginx`) |
| still `ImagePullBackOff` | typo in the new image | run `describe` again, fix the typo |
| Events say `pull access denied` or `repository does not exist` | the image NAME is wrong, not the tag | fix the name, e.g. `ngnix` to `nginx` |
| fixed pod, new pod breaks again | you ran `k edit pod` | fix the deployment with `k set image` |
| old pod shows the error a few seconds | it is being replaced | wait, run `k get pods -n app` again |

---

## 2. CrashLoopBackOff

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`, the pod of deployment `api` keeps restarting. Find the cause and fix it so the pod stays Running. Do not delete the deployment. The container should run `sleep 3600`.

**What the question is really saying:**

The container's command stops at once. Change it to `sleep 3600`.

**Write down from the question:** namespace = `app` · deployment = `api` · correct command = `sleep 3600` · do NOT delete the deployment

---

### Think

- **Broken:** the container starts, then stops.
- **Look first:** the logs, then the command and exit code.
- **Expect:** `CrashLoopBackOff`, RESTARTS going up.
- **Fix:** the command in the deployment.
- **Prove:** `1/1 Running`, RESTARTS stays `0`.

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace app --ignore-not-found
k create namespace app
k create deployment api --image=busybox:1.36 -n app -- sh -c "exit 1"
sleep 30
clear
k get pods -n app
```

---

### Step 1. Is it restarting?

**Why:** a rising RESTARTS count means the container starts, then dies.

```
k get pods -n app
```
You see:
```
api-5d9c7b6f4-x2x9k   0/1   CrashLoopBackOff   3 (20s ago)   70s   <-- RESTARTS
```
**Means:** the image is fine. The container keeps stopping.

---

### Step 2. What did it print before it stopped?

**Why:** an app often prints its error just before it dies.

```
k logs <pod-name> --previous -n app
```
`exit 1` prints nothing, so the log is empty.

You see:
```
(no output)
```
**Means:** no message here. In the exam, a message here is the cause.

---

### Step 3. What command does it run?

**Why:** describe shows the command and how it ended.

```
k describe pod <pod-name> -n app
```
You see:
```
    Command:
      sh
      -c
      exit 1   <-- cmd
    ...
    Last State:     Terminated
      Reason:       Error
      Exit Code: 1  <-- failed
```
**Means:** the command stops at once with an error.

---

### Step 4. Fix the command

**Why:** fix the deployment. It makes a new pod.

```
k edit deployment/api -n app
```
In vim, type `/exit 1`, Enter. Press `C`, type `sleep 3600`, `Esc`, `:wq`.

Only the last line changes, `exit 1` becomes `sleep 3600`:
```yaml
      - command:
        - sh
        - -c
        - sleep 3600
```
You see:
```
deployment.apps/api edited
```
**Don't:** use a command that ends, like `echo hi`. It must keep running.

---

### Verify

**Why:** prove the new pod stays up.

```
k rollout status deployment/api -n app
k get pods -n app
```
You see:
```
deployment "api" successfully rolled out
api-7f9b8c6d5-k4m2p   1/1   Running   0   25s   <-- RESTARTS
```
**Don't:** stop here. Wait 20 s, run `k get pods` again. RESTARTS must stay `0`.

---

### Three words first

- **Exit code** = the number a command returns. `0` = OK. Anything else = error.
- **CrashLoopBackOff** = it starts, stops, restarts. Kubernetes waits longer each time.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `previous terminated container ... not found` | no restart yet | wait 20 s, try again |
| vim reopens with `# Error:` lines | the edit broke the YAML indentation | fix it, or `:q!` and run `k patch deployment api --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/command","value":["sh","-c","sleep 3600"]}]' -n app` |
| `Forbidden: pod updates may not change fields...` | you ran `k edit pod` | `k edit deployment/api -n app` |
| describe says `Reason: OOMKilled` | memory limit too small | `k set resources deployment/api --limits=memory=<value> -n app` |
| `No resources found` | forgot `-n app` | add `-n app` |

---

## 3. Pending pod

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`, a pod of deployment `api` is stuck in Pending. Find the cause and fix it. The container needs `100m` CPU.

**What the question is really saying:**

No node can take the pod. The CPU request is too big.

**Write down from the question:** namespace = `app` · deployment = `api` · correct CPU request = `100m`

---

### Think

- **Broken:** the scheduler finds no node for the new pod.
- **Look first:** the Pending pod's Events.
- **Expect:** `Insufficient cpu`
- **Fix:** CPU request = `100m` in the deployment.
- **Prove:** the rollout finishes.

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace app --ignore-not-found
k create namespace app
k create deployment api --image=nginx:1.27 -n app
k rollout status deployment/api --timeout=120s -n app
k set resources deployment/api --requests=cpu=100 -n app
sleep 5
clear
k get pods -n app
```

---

### Step 1. Which pod is Pending?

**Why:** you need the Pending pod's name, not the Running one.

```
k get pods -n app
```
You see:
```
api-6d4cf56db6-7xk2p   1/1   Running   0   60s
api-7b9c8d5f4-zq8mn    0/1   Pending   0   20s   <-- name
```
**Means:** the old pod stays until the new one works.

---

### Step 2. Why does no node take it?

**Why:** the scheduler writes its reason into the pod's Events.

```
k describe pod <pending-pod-name> -n app
```
You see:
```
Warning  FailedScheduling  ...  0/2 nodes are available: ... Insufficient cpu ...   <-- cause
```
**Means:** no node has enough free CPU. Ignore the taint and `preemption:` parts.

---

### Step 3. How much CPU does it ask for?

**Why:** the deployment holds the request. That is what you fix.

```
k get deployment api -o yaml -n app | grep -A 1 requests
```
You see:
```
          requests:
            cpu: "100"
```
**Means:** `100` is 100 CPUs. The question wants `100m`.

---

### Step 4. Fix the request

**Why:** fix the deployment. It makes a new pod.

```
k set resources deployment/api --requests=cpu=100m -n app
```
You see:
```
deployment.apps/api resource requirements updated
```
**Don't:** forget the `m`. `100m` is a tenth of a CPU.

---

### Verify

**Why:** prove the new pod is up.

```
k rollout status deployment/api -n app
```
You see:
```
deployment "api" successfully rolled out
```
**Means:** the Pending pod is gone. The deployment replaced it.

---

### Three words first

- **Request** = the CPU and memory a pod reserves on a node.
- **Millicores** = CPU in thousandths. `1000m` = 1 CPU. Plain `100` = 100 CPUs.
- **Scheduler** = picks a node for each new pod. Pending = no node picked yet.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| no `FailedScheduling` in describe | you described the Running pod | describe the `Pending` one |
| a new pod is Pending after you deleted one | the deployment re-creates it | fix the deployment, not the pod |
| `must be less than or equal to cpu limit` | you set `--limits`, not `--requests` | use `--requests=cpu=100m` |
| Events: `had untolerated taint` on every node | a taint blocks the pod | question 36 |
| Events: `didn't match Pod's node affinity/selector` | the pod wants a node label none has | fix `nodeSelector:` in `k edit deployment/api -n app` |

---

## 4. Node NotReady: kubelet stopped

### PART B. The exam starts here

**The question, as the exam words it:**

> Node `node01` is in state NotReady. Find the cause and bring the node back to Ready. The fix must survive a reboot. Do not reboot the node.

**What the question is really saying:**

The kubelet on node01 is stopped. Start it and enable it.

**Write down from the question:** node = `node01` · must survive reboot (so: `enable`) · no reboot

---

### Think

- **Broken:** the kubelet on node01 is stopped and disabled.
- **Look first:** the node's Conditions.
- **Expect:** `Kubelet stopped posting node status.`
- **Fix:** on node01, enable and start the kubelet.
- **Prove:** node01 is Ready.

### Time budget

Target 2 min. Skip at 5.

---

### PART A. Build the exam (Killercoda only)

```
ssh node01 'systemctl disable --now kubelet'
for i in $(seq 1 24); do k get node node01 | grep -q NotReady && break; sleep 5; done
clear
k get nodes
```

---

### Step 1. Which node is down?

**Why:** confirm the node before you log in.

```
k get nodes
```
You see:
```
node01   NotReady   <none>   ...   <-- NotReady
```
**Means:** the control plane gets no news from node01.

---

### Step 2. What does the control plane know?

**Why:** the node's Conditions point to the kubelet.

```
k describe node node01
```
You see:
```
  Ready   Unknown   ...   NodeStatusUnknown   Kubelet stopped posting node status.   <-- hint
```
**Means:** `Unknown`, not `False`. The kubelet stopped reporting.

---

### Step 3. Is the kubelet running?

**Why:** the kubelet is a Linux service. kubectl cannot start it.

```
ssh node01
systemctl status kubelet --no-pager
```
You see:
```
     Loaded: loaded (/usr/lib/systemd/system/kubelet.service; disabled; ...)   <-- disabled
     Active: inactive (dead) since ...  <-- stopped
```
**Means:** stopped now, and off after a reboot.
**Don't:** type before you check the prompt says `node01`.

---

### Step 4. Start it and keep it on

**Why:** `enable` = after every reboot. `--now` = also right now.

```
systemctl enable --now kubelet
systemctl is-active kubelet
systemctl is-enabled kubelet
```
You see:
```
Created symlink ... → .../kubelet.service.
active   <-- now
enabled  <-- after reboot
```
**Don't:** use `systemctl start` alone. It does not survive a reboot.

---

### Step 5. Leave the node

**Why:** kubectl works on the control plane, not on node01.

```
exit
```
You see:
```
root@controlplane:~#  <-- back
```
**Means:** you are back where kubectl works.

---

### Verify

**Why:** prove the node is Ready.

```
k wait --for=condition=Ready node/node01 --timeout=60s
```
You see:
```
node/node01 condition met
```

---

### Three words first

- **kubelet** = the service on every node. It starts containers and reports "alive".
- **NotReady** = no report from the kubelet for about 40 to 50 seconds.
- **systemctl** = the Linux command that starts, stops and checks services.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `The connection to the server localhost:8080 was refused` | you ran kubectl on node01 | `exit`, run it again |
| kubelet already `active (running)` before the fix | you are on the control plane | `exit`, then `ssh node01` |
| `Active: activating (auto-restart)` after starting | the kubelet is misconfigured | question 5 |
| kubelet `active (running)`, node stays NotReady | the container runtime is stopped | on node01: `systemctl enable --now containerd` |
| `timed out waiting for the condition` | the kubelet needs more time, or failed | `k get nodes` again; on node01 check `systemctl status kubelet --no-pager` |

---

## 5. Node NotReady: kubelet misconfigured

### PART B. The exam starts here

**The question, as the exam words it:**

> Node `node01` is in state NotReady. Find the cause and bring the node back to Ready. Do not reboot the node.

**What the question is really saying:**

The kubelet on node01 cannot start, because its service file points to a wrong path.

**Write down from the question:** node = `node01` · no reboot

---

### Think

- **Broken:** the kubelet on node01 cannot start.
- **Look first:** the kubelet service status on node01.
- **Expect:** `activating (auto-restart)` and `status=203/EXEC`
- **Fix:** the log names the bad path; correct it in the service file.
- **Prove:** node01 is `Ready` again.

### Time budget

Target 6 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
ssh node01 'f=$(ls /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf /etc/systemd/system/kubelet.service.d/10-kubeadm.conf 2>/dev/null | head -1); sed -i "s#/usr/local/bin/kubelet#/usr/bin/kubelet#" "$f"; sed -i "s#/usr/bin/kubelet#/usr/local/bin/kubelet#" "$f"; systemctl daemon-reload; systemctl restart kubelet'
for i in $(seq 1 24); do k get node node01 | grep -q NotReady && break; sleep 5; done
clear
k get nodes
```

---

### Step 1. Is the kubelet running?

**Why:** a node is NotReady when its kubelet does not run.

```
ssh node01
systemctl status kubelet
```
You see:
```
     Active: activating (auto-restart) (Result: exit-code) since ...   <-- fails
    Process: ... ExecStart=/usr/local/bin/kubelet ... (code=exited, status=203/EXEC)
```
**Means:** it cannot start. `203/EXEC` = the program file could not run.
**Don't:** wait at the screen. Press `q` if it does not return.

---

### Step 2. Why does it fail?

**Why:** the service log names the reason.

```
journalctl -u kubelet -n 30 --no-pager
```
You see:
```
kubelet.service: Failed at step EXEC spawning /usr/local/bin/kubelet: No such file or directory   <-- cause
```
**Means:** the service starts a path that does not exist.

---

### Step 3. Which file holds the wrong path?

**Why:** compare the real program with the path in the service files.

```
which kubelet
systemctl cat kubelet
```
You see:
```
/usr/bin/kubelet  <-- real
...
# /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf  <-- fix this file
ExecStart=
ExecStart=/usr/local/bin/kubelet $KUBELET_KUBECONFIG_ARGS ...  <-- wrong
```
**Means:** the drop-in overrides the base file. Fix the drop-in.
**Don't:** touch the empty `ExecStart=`. It only clears the old value.

---

### Step 4. Fix the path

**Why:** `/usr/local/bin/kubelet` must become `/usr/bin/kubelet`.

```
vim /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf
grep ExecStart= /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf
```
In vim: type `/local`, Enter, `6x`, then `:wq`, Enter.

You see:
```
ExecStart=
ExecStart=/usr/bin/kubelet $KUBELET_KUBECONFIG_ARGS ...   <-- no "local"
```
**Means:** the file is right. Use the path YOUR `systemctl cat` showed.

---

### Step 5. Reload and restart

**Why:** systemd must re-read the changed file.

```
systemctl daemon-reload
systemctl restart kubelet
systemctl status kubelet
```
You see:
```
     Active: active (running) since ...   <-- fixed
```
**Don't:** skip `daemon-reload`. systemd keeps the old path.

---

### Step 6. Leave the node

**Why:** kubectl works on the control plane, not on node01.

```
exit
```
You see:
```
logout
Connection to node01 closed.
```

---

### Verify

**Why:** prove the node is back.

```
k get nodes
```
You see:
```
node01         Ready    <none>          ...   v1.35.0   <-- Ready
```
**Don't:** give up at once. It can take 30 seconds.

---

### Three words first

- **Drop-in** = an extra file that overrides parts of a service file.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `Warning: The unit file ... changed on disk` | no `daemon-reload` | `systemctl daemon-reload`, then restart |
| `inactive (dead)` in Step 1 | kubelet only stopped | question 4: `systemctl start kubelet` |
| log says `failed to load kubelet config file` | bad `/var/lib/kubelet/config.yaml` | fix that file, restart kubelet |
| `localhost:8080 was refused` | you ran `k` on node01 | `exit` first |
| line looks wrong after `6x` | cursor was elsewhere | press `u` to undo |

---

## 6. Service has no endpoints

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, pod `client` cannot reach service `backend-svc` on port 80. The deployment `backend` is Running. Find and fix the issue. Do not delete or recreate the service.

**What the question is really saying:**

The Service's selector does not match the pods' label.

**Write down from the question:** namespace = `web` · service = `backend-svc` · deployment = `backend` · test pod = `client` · do NOT recreate the service

---

### Think

- **Broken:** no pods behind the Service.
- **Look first:** the Service's endpoints.
- **Expect:** `<none>`
- **Fix:** selector = the pods' label.
- **Prove:** the client pod gets the nginx page.

### Time budget

Target 2 min. Skip at 5.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace web --ignore-not-found
k create namespace web
k create deployment backend --image=nginx:1.27 -n web
k create service clusterip backend-svc --tcp=80:80 -n web
k run client --image=busybox:1.36 -n web -- sleep 3600
k rollout status deployment/backend --timeout=120s -n web
k wait --for=condition=Ready pod/client --timeout=120s -n web
clear
k get endpoints backend-svc -n web
```

---

### Step 1. Does the Service find pods?

**Why:** a Service sends traffic to its endpoints, the pods it found.

```
k get endpoints backend-svc -n web
```
You see:
```
Warning: v1 Endpoints is deprecated in v1.33+; ...   <-- ignore
backend-svc   <none>
```
**Means:** no pods: wrong selector, or pods not Ready.

---

### Step 2. What label does the Service want?

**Why:** the selector is the label the Service looks for.

```
k get service backend-svc -o wide -n web
```
You see:
```
backend-svc   ClusterIP   10.96.x.x   <none>   80/TCP   1m   app=backend-svc   <-- SELECTOR
```
**Means:** the Service looks for pods with `app=backend-svc`.

---

### Step 3. What label do the pods have?

**Why:** compare the real label with the selector.

```
k get pods --show-labels -n web
```
You see:
```
backend-...   1/1   Running   app=backend,pod-template-hash=...
```
**Means:** labels differ, pods are fine. The Service is wrong.

---

### Step 4. Fix the selector

**Why:** fix the Service, not the pods.

```
k set selector service/backend-svc app=backend -n web
```
You see:
```
service/backend-svc selector updated
```
**Don't:** add `pod-template-hash`. It changes on every rollout.

---

### Verify

**Why:** prove it works.

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see:
```
<title>Welcome to nginx!</title>
```
**Don't:** use `curl`. The busybox client only has `wget`.

---

### Three words first

- **`-qO-`** = wget: quiet, print to the screen. Capital O, not zero.
- **`-o wide`** = extra columns, here SELECTOR.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| still `<none>` after the fix | typo, or pods not Ready (`0/1`) | compare with `--show-labels`; fix the pods |
| still `<none>` after `k edit service` | you changed `metadata.labels`, not `spec.selector` | use `k set selector` |
| endpoints show an IP, wget fails | wrong port | question 7 |
| `No resources found` | forgot `-n web` | add `-n web` |

---

## 7. Service with the wrong targetPort

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, pod `client` cannot reach service `backend-svc` on port 80. The backend pods are Running and run nginx, which listens on port 80. Fix the issue without recreating the service.

**What the question is really saying:**

The Service finds the pods, but forwards to a port where nothing listens.

**Write down from the question:** namespace = `web` · service = `backend-svc` · app listens on `80` · test pod = `client` · do NOT recreate the service

---

### Think

- **Broken:** the Service forwards to the wrong container port.
- **Look first:** the Service's endpoints.
- **Expect:** a pod IP ending in `:8080`, not `:80`.
- **Fix:** targetPort = the port nginx listens on.
- **Prove:** the client pod gets the nginx page.

### Time budget

Target 2 min. Skip at 5.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace web --ignore-not-found
k create namespace web
k create deployment backend --image=nginx:1.27 -n web
k expose deployment backend --name=backend-svc --port=80 --target-port=8080 -n web
k run client --image=busybox:1.36 -n web -- sleep 3600
k rollout status deployment/backend --timeout=120s -n web
k wait --for=condition=Ready pod/client --timeout=120s -n web
clear
k get endpoints backend-svc -n web
```

---

### Step 1. Does the Service find pods?

**Why:** endpoints show the pods AND the port the Service sends to.

```
k get endpoints backend-svc -n web
```
The pod IP is there, but with port `8080`.

You see:
```
Warning: v1 Endpoints is deprecated in v1.33+; ...   <-- ignore
backend-svc   192.168.1.5:8080   1m
```
**Means:** the selector works. The port is wrong.

---

### Step 2. Does the client get an answer?

**Why:** confirm the symptom before you change anything.

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see:
```
wget: can't connect to remote host (10.96.x.x): Connection refused   <-- cause
command terminated with exit code 1
```
**Means:** traffic reaches the pod, but no program answers there.

---

### Step 3. Which port is wrong?

**Why:** a Service has two ports. Find the wrong one.

```
k describe service backend-svc -n web
```
`Port` 80 is right: clients call 80. `TargetPort` 8080 is wrong: nginx listens on 80.

You see:
```
Port:              <unset>  80/TCP
TargetPort:        8080/TCP
Endpoints:         192.168.1.5:8080
```
**Means:** only `targetPort` must change.

---

### Step 4. Fix the targetPort

**Why:** edit the Service in place. Do not recreate it.

```
k edit service/backend-svc -n web
```
In vim: type `/8080`, Enter, `cw`, type `80`, Esc, `:wq`, Enter.

You see:
```
service/backend-svc edited
```
**Don't:** change `port:`. Clients still call 80.

---

### Verify

**Why:** prove traffic now reaches nginx.

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see:
```
<title>Welcome to nginx!</title>
```

---

### Three words first

- **port** = the Service's port. Clients call this one.
- **targetPort** = the container's port. The Service forwards there.
- **`-T 3`** = wget: give up after 3 seconds.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `wget: download timed out` in Step 2 | your network plug-in drops instead of refuses | same meaning, go on |
| the question does not name the app's port | you must find it | `k describe pod <pod> -n web`, read `Port:` |
| `Edit cancelled, no changes made.` | saved nothing, or quit with `:q!` | run `k edit` again |
| still refused after the fix | you changed `containerPort` in the Deployment | undo it; fix the Service |
| vim gets in the way | you want one command | `k patch service backend-svc -p '{"spec":{"ports":[{"port":80,"targetPort":80}]}}' -n web` |

---

## 8. ★ kube-apiserver is down

### PART B. The exam starts here

**The question, as the exam words it:**

> On the control plane node, `kubectl` commands fail. The cluster was working before a configuration change. Find the cause and fix it so the cluster works again.

**What the question is really saying:**

The API server keeps crashing because its static pod file has a wrong value.

**Write down from the question:** control plane node · kubectl fails

---

### Think

- **Broken:** the kube-apiserver container keeps crashing.
- **Look first:** the containers on the node, not kubectl.
- **Expect:** kube-apiserver `Exited`, with a growing attempt number.
- **Fix:** its log names the bad value; fix it in the manifest file.
- **Prove:** kubectl lists the nodes again.

### Time budget

Target 7 min. Skip at 12.

---

### PART A. Build the exam (Killercoda only)

```
if [ -f /root/apiserver.bak ]; then cp /root/apiserver.bak /etc/kubernetes/manifests/kube-apiserver.yaml; else cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/apiserver.bak; fi
sed -i 's/127.0.0.1:2379/127.0.0.1:2380/' /etc/kubernetes/manifests/kube-apiserver.yaml
for i in $(seq 1 24); do k get nodes >/dev/null 2>&1 || break; sleep 5; done
sleep 30
clear
k get nodes
```

---

### Step 1. Is the API server down?

**Why:** every kubectl command talks to the API server on port 6443.

```
k get nodes
```
You see:
```
The connection to the server 172.30.1.2:6443 was refused - did you specify the right host or port?   <-- 6443
```
**Means:** the API server is down. kubectl cannot help now.

---

### Step 2. Find the API server container

**Why:** crictl talks to the container runtime directly, without the API server.

```
crictl ps -a | grep kube-apiserver
```
You see:
```
3f2a1b9c8d7e6   ...   25 seconds ago   Exited   kube-apiserver   5   ...   <-- copy ID
```
**Means:** it starts and dies again and again.
**Don't:** copy an old line (CREATED hours ago). It has no useful log.

---

### Step 3. Why does it die?

**Why:** the container log names the bad value. Use YOUR ID.

```
crictl logs 3f2a1b9c8d7e6 2>&1 | tail -20
```
You see:
```
... dial tcp 127.0.0.1:2380: connect: connection refused   <-- 2380
```
**Means:** it looks for etcd on 2380. etcd answers on 2379.
**Don't:** drop `2>&1`. The errors go to stderr.

---

### Step 4. Back up, then fix the file

**Why:** the kubelet runs the API server from this file.

```
cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/kube-apiserver.yaml.orig
vim /etc/kubernetes/manifests/kube-apiserver.yaml
grep etcd-servers /etc/kubernetes/manifests/kube-apiserver.yaml
```
In vim: type `/2380`, Enter, `cw`, type `2379`, Esc, `:wq`, Enter.

You see:
```
    - --etcd-servers=https://127.0.0.1:2379  <-- fixed
```
**Don't:** keep the backup in `manifests/`. It would run as a second API server.

---

### Step 5. Wait for the kubelet

**Why:** the kubelet sees the changed file and restarts the pod itself.

```
crictl ps | grep kube-apiserver
```
You see:
```
...   Running   kube-apiserver   ...  <-- up
```
**Means:** no restart needed. It takes up to 60 seconds.

---

### Verify

**Why:** prove kubectl works again.

```
k get nodes
```
You see:
```
controlplane   Ready    control-plane   ...   v1.35.0   <-- works
```

---

### Three words first

- **Static pod** = a pod the kubelet starts from a file in `/etc/kubernetes/manifests/`.
- **etcd** = the cluster database. The API server reaches it on port 2379.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| still `6443 was refused` after 20 s | the kubelet needs time | wait up to 60 s |
| `crictl ps -a` shows no apiserver at all | YAML mistake, the kubelet cannot read the file | `journalctl -u kubelet -n 30 --no-pager \| grep apiserver`; compare with `/root/kube-apiserver.yaml.orig` |
| log says `open /etc/kubernetes/pki/...: no such file or directory` | wrong certificate path | `ls /etc/kubernetes/pki/`, fix the path |
| `localhost:8080 was refused` | wrong machine | `ssh` to the host the question names |
| crictl says `permission denied` | you are not root | `sudo -i` first |

---

## 9. Scheduler is not running

### PART B. The exam starts here

**The question, as the exam words it:**

> A pod named `test` in namespace `default` stays in Pending. Other pods that were already running are fine. Find the cause and fix it so that `test` is Running.

**What the question is really saying:**

Nobody places new pods: the kube-scheduler is broken.

**Write down from the question:** pod = `test` · namespace = `default`

---

### Think

- **Broken:** the kube-scheduler does not run.
- **Look first:** the Events of the Pending pod.
- **Expect:** `Events: <none>`
- **Fix:** read why the scheduler fails; fix its manifest file.
- **Prove:** `test` is `Running`.

### Time budget

Target 5 min. Skip at 9.

---

### PART A. Build the exam (Killercoda only)

```
if [ -f /root/scheduler.bak ]; then cp /root/scheduler.bak /etc/kubernetes/manifests/kube-scheduler.yaml; else cp /etc/kubernetes/manifests/kube-scheduler.yaml /root/scheduler.bak; fi
sed -i 's/- kube-scheduler$/- kube-schedulerx/' /etc/kubernetes/manifests/kube-scheduler.yaml
k delete pod test --ignore-not-found
for i in $(seq 1 24); do k get pod kube-scheduler-controlplane --no-headers -n kube-system 2>/dev/null | grep -q '1/1' || break; sleep 5; done
sleep 10
k run test --image=nginx:1.27
clear
k get pod test
```

---

### Step 1. Why is the pod Pending?

**Why:** the Events show what the scheduler said about the pod.

```
k describe pod test
```
Look at the last line: `Events` is empty.

You see:
```
Node:             <none>
Status:           Pending
...
Events:           <none>
```
**Means:** the scheduler never looked. With a reason in Events, it is question 3.

---

### Step 2. Is the scheduler running?

**Why:** the scheduler is a pod in `kube-system`.

```
k get pods -n kube-system
```
You see:
```
kube-scheduler-controlplane   0/1   CrashLoopBackOff   4 (30s ago)   2m   <-- broken
```
**Means:** its container cannot start. `RunContainerError` means the same.

---

### Step 3. Why does it fail?

**Why:** the Events name the start error.

```
k describe pod kube-scheduler-controlplane -n kube-system
```
You see:
```
Warning  Failed  ...  exec: "kube-schedulerx": executable file not found in $PATH: unknown   <-- cause
```
**Means:** the program name in `command:` is misspelled.
**Don't:** expect `k logs` to help. The program never started.

---

### Step 4. Back up, then fix the file

**Why:** the kubelet runs the scheduler from this file.

```
cp /etc/kubernetes/manifests/kube-scheduler.yaml /root/kube-scheduler.yaml.orig
vim /etc/kubernetes/manifests/kube-scheduler.yaml
grep -A1 command: /etc/kubernetes/manifests/kube-scheduler.yaml
```
In vim: type `/schedulerx`, Enter, `$`, `x`, `:wq`, Enter.

You see:
```
  - command:
    - kube-scheduler  <-- no x
```
**Don't:** keep the backup in `manifests/`. It would run as a second scheduler.

---

### Step 5. Wait for the scheduler

**Why:** the kubelet sees the changed file and restarts the pod itself.

```
k get pods -n kube-system | grep scheduler
```
You see:
```
kube-scheduler-controlplane   1/1   Running   0   30s   <-- running
```
**Means:** no restart needed. It takes about 30 seconds.

---

### Verify

**Why:** prove the waiting pod got a node.

```
k get pod test
```
You see:
```
test   1/1     Running   0          5m
```

---

### Three words first

- **kube-scheduler** = picks a node for every new pod.
- **Static pod** = a pod the kubelet starts from a file in `/etc/kubernetes/manifests/`.
- **Mirror pod** = the read-only copy of a static pod that kubectl shows.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| describe shows no Events for the scheduler | events expired | `crictl ps -a \| grep scheduler`, then `crictl inspect <id> \| grep -i -m3 message` |
| your `k edit pod/kube-scheduler-...` did nothing | that is the mirror pod | edit the file in `manifests/` |
| deleted scheduler pod comes back broken | the kubelet rebuilds it from the file | fix the file |
| scheduler disappears after your edit | YAML broken (Tab or indent) | compare with `/root/kube-scheduler.yaml.orig`; spaces only |
| scaled Deployment makes NO new pods | controller-manager is broken, not the scheduler | same method, `kube-controller-manager.yaml` |

---

## 10. NetworkPolicy is blocking traffic

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, pod `client` cannot reach service `backend-svc` on port 80. The service and its pods are healthy. Do not delete or change any existing NetworkPolicy. Create a NetworkPolicy named `allow-client` so that ONLY pod `client` can reach the backend pods on TCP port 80.

**What the question is really saying:**

A policy blocks everything; add one policy that lets only `client` in on port 80.

**Write down from the question:** namespace = `web` · policy name = `allow-client` · port = TCP `80` · do NOT touch existing policies

---

### Think

- **Broken:** a policy drops all traffic into the backend pods.
- **Look first:** the policies in `web`.
- **Expect:** `deny-all` with POD-SELECTOR `<none>` (= all pods).
- **Fix:** a second policy: protect backend, allow client, port 80.
- **Prove:** the client pod gets the nginx page.

### Time budget

Target 6 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace web --ignore-not-found
rm -f np.yaml
k create namespace web
k create deployment backend --image=nginx:1.27 -n web
k expose deployment backend --name=backend-svc --port=80 -n web
k run client --image=busybox:1.36 -n web -- sleep 3600
cat <<EOF | k apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: web
spec:
  podSelector: {}
  policyTypes:
  - Ingress
EOF
k rollout status deployment/backend --timeout=120s -n web
k wait --for=condition=Ready pod/client --timeout=120s -n web
clear
k exec client -n web -- wget -qO- -T 3 backend-svc
```

---

### Step 1. Which policy blocks the traffic?

**Why:** a timeout, not "refused", usually means a policy drops the traffic.

```
k get networkpolicy -n web
k describe networkpolicy deny-all -n web
```
In the list, `<none>` under POD-SELECTOR means ALL pods.

You see:
```
deny-all   <none>   2m
...
    <none> (Selected pods are isolated for ingress connectivity)   <-- nothing in
```
**Means:** `deny-all` selects every pod and lets nothing in.
**Don't:** edit or delete `deny-all`. The question forbids it. Policies only add up.

---

### Step 2. Collect the two labels

**Why:** the new policy needs the backend label and the client label.

```
k get pods --show-labels -n web
```
You see:
```
backend-...   1/1   Running   0   2m   app=backend,pod-template-hash=...   <-- protect
client        1/1   Running   0   2m   run=client   <-- allow
```
**Means:** protect `app=backend`. Let in `run=client`. Pods made with `k run` get `run=<name>`.

---

### Step 3. Write the policy

**Why:** there is no `k create networkpolicy`. Copy the example from the docs page "Network Policies", section "The NetworkPolicy resource".

```
vim np.yaml
```
The finished file. Only the `# <--` lines differ from the docs:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-client  # <--
  namespace: web  # <--
spec:
  podSelector:
    matchLabels:
      app: backend  # <--
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          run: client  # <--
    ports:
    - protocol: TCP
      port: 80  # <--
```
**Means:** from the docs copy, delete `- Egress`, the `ipBlock` and `namespaceSelector` blocks, and the whole `egress:` part.
**Don't:** keep `- Egress`. With no egress rules it blocks all outgoing traffic.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 4. Apply it

**Why:** the file does nothing until the cluster has it.

```
k apply -f np.yaml
```
You see:
```
networkpolicy.networking.k8s.io/allow-client created
```
**Means:** the policy is in. `deny-all` is still there, untouched.

---

### Verify

**Why:** prove the client now gets through.

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see:
```
<title>Welcome to nginx!</title>
```

---

### Three words first

- **NetworkPolicy** = a rule that says which traffic may reach a pod. Once a policy selects a pod, only allowed traffic gets in.
- **podSelector** = at the top: the pods this policy protects. Under `from:`: the pods allowed in. `{}` = all pods.
- **ingress** = traffic coming IN to the protected pods.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| still a timeout | a label in the file does not match the real label | compare with `--show-labels`, fix `np.yaml`, apply again |
| still a timeout, labels match | the policy landed in `default` | `k get networkpolicy -A`; set `namespace: web`, apply; `k delete networkpolicy allow-client -n default` |
| `error parsing np.yaml` or `unknown field` | indentation broke while deleting lines | compare the spaces with the finished file, line by line |
| Part A's wget already prints the nginx page | the network plugin does not enforce policies | write and apply anyway; the exam cluster enforces them |
| still a timeout, the Service maps 80 to another pod port | a policy matches the pod's port, not the Service port | the policy needs the pod's port: `k get endpoints backend-svc -n web` |

---

## 11. DNS is not working

### PART B. The exam starts here

**The question, as the exam words it:**

> Pods in the cluster cannot resolve service names. Connections by IP address still work. Find the cause and fix it. Two CoreDNS replicas must be running.

**What the question is really saying:**

The network is fine; only CoreDNS, the name lookup, is broken.

**Write down from the question:** namespace = `kube-system` · deployment = `coredns` · replicas = `2`

---

### Think

- **Broken:** no CoreDNS pod answers name lookups.
- **Look first:** the CoreDNS pods, then their Deployment.
- **Expect:** `No resources found`, and the Deployment at `0/0`.
- **Fix:** scale the Deployment back to 2.
- **Prove:** a test pod resolves a Service name.

### Time budget

Target 4 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
k set selector service/kube-dns k8s-app=kube-dns -n kube-system
k scale deployment/coredns --replicas=2 -n kube-system
k rollout status deployment/coredns --timeout=120s -n kube-system
k delete pod t --ignore-not-found
k scale deployment/coredns --replicas=0 -n kube-system
k wait --for=delete pod -l k8s-app=kube-dns --timeout=120s -n kube-system || true
clear
k get deployment coredns -n kube-system
```

---

### Step 1. Does a name lookup fail?

**Why:** see the symptom yourself before you fix anything.

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local
```
You see:
```
;; connection timed out; no servers could be reached   <-- no DNS
```
**Means:** nobody answers on the DNS address.
**Don't:** test a short name like `kubernetes`. busybox can print `NXDOMAIN` even when DNS works.

---

### Step 2. Are the CoreDNS pods there?

**Why:** DNS answers come from the CoreDNS pods.

```
k get pods -l k8s-app=kube-dns -n kube-system
```
You see:
```
No resources found in kube-system namespace.   <-- no pods
```
**Means:** no pod, no answer. Now ask why there are none.

---

### Step 3. What does their Deployment want?

**Why:** the Deployment decides how many pods run.

```
k get deployment coredns -n kube-system
```
You see:
```
coredns   0/0   0   0   30m
```
**Means:** nothing crashed. Someone asked for zero pods.

---

### Step 4. Scale back to 2

**Why:** the question wants two replicas.

```
k scale deployment/coredns --replicas=2 -n kube-system
k rollout status deployment/coredns --timeout=120s -n kube-system
```
You see:
```
deployment.apps/coredns scaled
deployment "coredns" successfully rolled out   <-- ready
```
**Don't:** scale `kube-dns`. That is the Service and the label. The Deployment is `coredns`.

---

### Verify

**Why:** prove a pod can resolve a name again.

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local
```
You see:
```
Name:      kubernetes.default.svc.cluster.local
Address:   10.96.0.1  <-- IP
```
**Don't:** read the first `Address` line. That one is the DNS server itself.

---

### Three words first

- **CoreDNS** = the cluster's DNS program. Deployment `coredns` in `kube-system`.
- **nslookup** = asks DNS for the IP of a name.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `pods "t" already exists` | an old test pod was left behind | `k delete pod t`, test again |
| CoreDNS pods in `CrashLoopBackOff` | a typo in the CoreDNS config | `k logs -l k8s-app=kube-dns -n kube-system`; fix with `k edit configmap/coredns -n kube-system`; `k rollout restart deployment/coredns -n kube-system` |
| pods `1/1 Running`, DNS still fails | the `kube-dns` Service lost its pods | `k get endpoints kube-dns -n kube-system`; if `<none>`: `k set selector service/kube-dns k8s-app=kube-dns -n kube-system` |
| CoreDNS pods `Pending` | a scheduling problem | question 3 |
| `ErrImagePull` on pod `t` | the test image could not be pulled | check the tag `busybox:1.36`, retry |

---

## 12. Logs and usage into a file

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Write the logs of pod `api` in namespace `app` to the file `/opt/api.log`.
> 2. Find the pod that uses the most CPU across all namespaces and write its name to `/opt/top.txt`.

**What the question is really saying:**

Two files: the `api` logs, and only the name of the top CPU pod.

**Write down from the question:** pod = `api` · namespace = `app` · files = `/opt/api.log`, `/opt/top.txt`

---

### Think

- **Wanted:** two files the grader opens and compares.
- **Look first:** all pods, sorted by CPU.
- **Expect:** the highest CPU pod in the first row.
- **Fix:** logs into file 1; the name only into file 2.
- **Prove:** file 2 holds exactly one pod name.

### Time budget

Target 2 min. Skip at 5.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace app --ignore-not-found
rm -f /opt/api.log /opt/top.txt
k create namespace app
k run api --image=nginx:1.27 -n app
mkdir -p /opt
k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.8.0/components.yaml
k get deployment metrics-server -o jsonpath='{.spec.template.spec.containers[0].args}' -n kube-system | grep -q kubelet-insecure-tls || k patch deployment metrics-server --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' -n kube-system
k rollout status deployment/metrics-server --timeout=180s -n kube-system
k wait --for=condition=Ready pod/api --timeout=120s -n app
for i in $(seq 1 24); do k top node >/dev/null 2>&1 && break; sleep 5; done
clear
k top node
```

---

### Step 1. Write the logs into the file

**Why:** `>` sends the output into the file, not to the screen.

```
k logs api -n app > /opt/api.log
head -3 /opt/api.log
```
The file holds nginx's start-up log lines.

You see:
```
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
...
```
**Means:** file 1 is done. The first command prints nothing; that is normal.

---

### Step 2. Which pod uses the most CPU?

**Why:** `k top` shows live usage. Sorting puts the top pod first.

```
k top pod -A --sort-by=cpu
```
You see:
```
NAMESPACE     NAME                          CPU(cores)   MEMORY(bytes)
kube-system   kube-apiserver-controlplane   45m          310Mi   <-- top
...
```
**Means:** the answer is the NAME in the first row. Yours may differ.
**Don't:** forget `-A`. Without it you only see one namespace.

---

### Step 3. Write only the name

**Why:** the grader compares the file with one pod name.

```
echo kube-apiserver-controlplane > /opt/top.txt
cat /opt/top.txt
```
The file holds one name, nothing else.

You see:
```
kube-apiserver-controlplane
```
**Don't:** retype the name. Copy it with the mouse from step 2.

---

### Verify

**Why:** the grader reads the files, so read them too.

```
cat /opt/api.log /opt/top.txt
```
You see:
```
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
...
kube-apiserver-controlplane
```

---

### Three words first

- **`45m`** = 45 millicores = 0.045 of one CPU.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `error: Metrics API not available` | metrics-server missing or still starting | run Part A again, wait 60 s; the exam has it |
| `No such file or directory` on `>` | the folder does not exist | `mkdir -p /opt` |
| `Permission denied` on `>` | you are not root; `/opt` belongs to root | `k logs api -n app | sudo tee /opt/api.log > /dev/null` |
| `Defaulted container "x" out of: x, y` | the pod has 2 containers | if the question names one: `k logs api -c <container> -n app > /opt/api.log` |
| the question wants a crashed container's logs | current logs are empty | add `--previous` |

---

# CLUSTER ARCHITECTURE (25% of the score) — Questions 13 to 22

**What this group is about:** admin work on the cluster itself.

| Topic | Questions | Docs needed? |
|---|---|---|
| RBAC (who may do what) | 13, 14 | no, all commands |
| Helm (install packaged apps) | 15, 16 | no, all commands |
| Kustomize | 17 | no |
| CRDs | 18 | no |
| Preparing a node (cri-dockerd, sysctl) | 19 | no |
| Installing a network plug-in (CNI) | 20 | URLs are given in the question |
| Upgrading the cluster | 21 | yes, follow the docs page |
| etcd backup and restore | 22 | yes, copy the command |

---

## 13. RBAC: ServiceAccount + Role + RoleBinding

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `dev`:
> 1. Create a ServiceAccount named `deploy-bot`.
> 2. Create a Role named `deploy-manager` that allows `get`, `list` and `create` on `deployments`.
> 3. Create a RoleBinding named `deploy-bot-binding` that binds the Role to the ServiceAccount.

**What the question is really saying:**

Three objects, three `k create` commands, no YAML. Then prove it works.

**Write down from the question:** namespace = `dev` · SA = `deploy-bot` · Role = `deploy-manager` · verbs = `get,list,create` · resource = `deployments` · binding = `deploy-bot-binding`

---

### Think

- **Wanted:** the SA may get, list and create deployments in `dev`.
- **Look first:** what the SA may do now.
- **Expect:** `no`
- **Fix:** SA, Role, RoleBinding that joins them.
- **Prove:** ask the API "can this SA create deployments?"

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace dev --ignore-not-found
k create namespace dev
clear
k auth can-i create deployments --as=system:serviceaccount:dev:deploy-bot -n dev
```

---

### Step 1. Create the ServiceAccount

**Why:** the SA is the identity that gets the permissions.

```
k create serviceaccount deploy-bot -n dev
```
You see:
```
serviceaccount/deploy-bot created
```
**Means:** the identity exists. It may do nothing yet.

---

### Step 2. Create the Role

**Why:** the Role lists the allowed verbs on a resource.

```
k create role deploy-manager --verb=get,list,create --resource=deployments -n dev
k describe role deploy-manager -n dev
```
You see:
```
role.rbac.authorization.k8s.io/deploy-manager created
...
  deployments.apps  []   []   [get list create]   <-- verbs
```
**Means:** the Role is right. Kubernetes added the API group `apps` itself.
**Don't:** put spaces after the commas in `--verb`.

---

### Step 3. Create the RoleBinding

**Why:** without a binding, the Role does nothing.

```
k create rolebinding deploy-bot-binding --role=deploy-manager --serviceaccount=dev:deploy-bot -n dev
```
You see:
```
rolebinding.rbac.authorization.k8s.io/deploy-bot-binding created
```
**Don't:** write `--serviceaccount=deploy-bot`. It is always `NAMESPACE:NAME`.

---

### Step 4. Does the binding join the right names?

**Why:** Kubernetes gives no error for a typo in a name.

```
k get rolebinding deploy-bot-binding -o wide -n dev
```
You see:
```
deploy-bot-binding   Role/deploy-manager   ...   dev/deploy-bot   <-- names
```
**Means:** the binding points to the right Role and SA.

---

### Verify

**Why:** ask the API as the SA. One allowed verb, one not allowed.

```
k auth can-i create deployments --as=system:serviceaccount:dev:deploy-bot -n dev
k auth can-i delete deployments --as=system:serviceaccount:dev:deploy-bot -n dev
```
You see:
```
yes   <-- allowed
no    <-- not in the Role
```
**Don't:** forget `-n dev`. Without it, you test the `default` namespace.

---

### Three words first

- **RoleBinding** = gives a Role to an SA or user. The chain: SA ← RoleBinding → Role.
- **`--as=system:serviceaccount:NS:SA`** = "pretend to be this SA" for the test.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| Verify says `no` for create | a typo in a name in the binding | `k describe rolebinding deploy-bot-binding -n dev`; delete it, create it again |
| `error: serviceaccount must be <namespace>:<name>` | `dev:` missing | `--serviceaccount=dev:deploy-bot` |
| `the server doesn't have a resource type "deploymnts"` | resource misspelled | use `deployments` |
| `... already exists` | you ran the create twice | fine if correct; else `k delete` it and create again |
| the question names a USER, not an SA | different flag | binding: `--user=alice`; test: `--as=alice` |

---

## 14. RBAC: ClusterRole

### PART B. The exam starts here

**The question, as the exam words it:**

> Create a ServiceAccount named `node-viewer` in namespace `ops`. It must be able to `get` and `list` nodes. Use a ClusterRole named `node-reader` and a ClusterRoleBinding named `node-viewer-binding`.

**What the question is really saying:**

Same as question 13, but nodes have no namespace: use the "Cluster" versions.

**Write down from the question:** SA = `node-viewer` in `ops` · ClusterRole = `node-reader` · verbs = `get,list` · resource = `nodes` · binding = `node-viewer-binding`

---

### Think

- **Wanted:** the SA may get and list nodes.
- **Look first:** is `nodes` namespaced or cluster-wide?
- **Expect:** NAMESPACED `false`
- **Fix:** SA (with namespace), ClusterRole and ClusterRoleBinding (without).
- **Prove:** ask the API "can this SA list nodes?"

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete clusterrolebinding node-viewer-binding --ignore-not-found
k delete clusterrole node-reader --ignore-not-found
k delete namespace ops --ignore-not-found
k create namespace ops
clear
k auth can-i list nodes --as=system:serviceaccount:ops:node-viewer
```

---

### Step 1. Are nodes cluster-wide?

**Why:** a Role cannot give access to cluster-wide resources.

```
k api-resources | grep -w nodes
```
The 4th column, NAMESPACED, is `false`.

You see:
```
nodes   no   v1   false   Node
```
**Means:** cluster-wide. You need ClusterRole + ClusterRoleBinding.

---

### Step 2. Create the ServiceAccount

**Why:** the SA still lives in a namespace.

```
k create serviceaccount node-viewer -n ops
```
You see:
```
serviceaccount/node-viewer created
```

---

### Step 3. Create the ClusterRole

**Why:** it lists the allowed verbs on nodes, for the whole cluster.

```
k create clusterrole node-reader --verb=get,list --resource=nodes
```
You see:
```
clusterrole.rbac.authorization.k8s.io/node-reader created
```
**Means:** no `-n`. A ClusterRole has no namespace.

---

### Step 4. Create and check the ClusterRoleBinding

**Why:** it gives the ClusterRole to the SA, cluster-wide.

```
k create clusterrolebinding node-viewer-binding --clusterrole=node-reader --serviceaccount=ops:node-viewer
k get clusterrolebinding node-viewer-binding -o wide
```
You see:
```
clusterrolebinding.rbac.authorization.k8s.io/node-viewer-binding created
node-viewer-binding   ClusterRole/node-reader   ...   ops/node-viewer   <-- names
```
**Don't:** write `--role=`. A ClusterRoleBinding needs `--clusterrole=`.

---

### Verify

**Why:** ask the API as the SA. One allowed verb, one not allowed.

```
k auth can-i list nodes --as=system:serviceaccount:ops:node-viewer
k auth can-i delete nodes --as=system:serviceaccount:ops:node-viewer
```
You see:
```
yes   <-- allowed
no    <-- not granted
```
**Means:** no `-n` in the test. Nodes have no namespace.

---

### Three words first

- **Cluster-wide resource** = has no namespace: nodes, PersistentVolumes, namespaces, StorageClasses.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| Verify says `no` for list | you made a Role + RoleBinding | delete them; use the Cluster versions |
| Verify says `no`, objects look fine | a typo in the SA or namespace in the binding | `k describe clusterrolebinding node-viewer-binding`; delete it, create it again |
| `error: serviceaccount must be <namespace>:<name>` | `ops:` missing | `--serviceaccount=ops:node-viewer` |
| question says "existing ClusterRole X, only in namespace Y" | that is a RoleBinding to a ClusterRole | `k create rolebinding NAME --clusterrole=X --user=alice -n Y` |

---

## 15. ★ Helm template (Argo CD without CRDs)

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Add the Helm repository `https://argoproj.github.io/argo-helm` with the name `argocd`.
> 2. Generate a template of the chart `argo-cd`, version `7.7.3`, for namespace `argocd`. The CRDs must NOT be installed by the chart.
> 3. Save the output to `/root/argo-helm.yaml`.

**What the question is really saying:**

Add the repo, find the "CRDs off" setting, write the YAML to a file. Install nothing.

**Write down from the question:** repo name = `argocd` · URL · chart = `argo-cd` · version = `7.7.3` · namespace = `argocd` · CRDs off · file = `/root/argo-helm.yaml`

---

### Think

- **Wanted:** a YAML file with no CRDs in it.
- **Look first:** the chart's values, near `crds`.
- **Expect:** `install: true` under `crds:`
- **Fix:** `helm template` with that setting set to false.
- **Prove:** the file counts zero CRDs.

### Time budget

Target 4 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
helm repo remove argocd 2>/dev/null || true
rm -f /root/argo-helm.yaml
clear
helm repo list
```

---

### Step 1. Add the repo

**Why:** Helm can only find the chart after the repo is added.

```
helm repo add argocd https://argoproj.github.io/argo-helm
helm repo update
```
You see:
```
"argocd" has been added to your repositories   <-- name
...
Update Complete. ⎈Happy Helming!⎈
```

---

### Step 2. Does version 7.7.3 exist?

**Why:** a wrong version text fails later with a vague error.

```
helm search repo argocd/argo-cd --versions | grep 7.7.3
```
You see:
```
argocd/argo-cd   7.7.3   ...   A Helm chart for Argo CD, ...   <-- version
```
**Means:** the version exists. Use `argocd/argo-cd` = repo/chart.

---

### Step 3. Find the CRD setting

**Why:** each chart names its settings differently. Read them.

```
helm show values argocd/argo-cd --version 7.7.3 | grep -A3 "^crds"
```
You see:
```
crds:
  # -- Install and upgrade CRDs
  install: true  <-- this
...
```
**Means:** `install` sits under `crds`. The setting is `crds.install`.

---

### Step 4. Write the file

**Why:** `helm template` prints YAML and installs nothing.

```
helm template my-argo argocd/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > /root/argo-helm.yaml
ls -l /root/argo-helm.yaml
```
The size is a big number, not 0.

You see:
```
-rw-r--r-- 1 root root ... /root/argo-helm.yaml
```
**Means:** `my-argo` is the release name. Any name works if the question gives none.
**Don't:** run `helm install`. The question wants a file only.

---

### Verify

**Why:** the grader counts CRDs in the file.

```
grep -c "kind: CustomResourceDefinition" /root/argo-helm.yaml
```
You see:
```
0   <-- no CRDs
```
**Means:** `0` is the success case. grep exits with code 1 here; that is normal.

---

### Three words first

- **Chart** = a Helm package. It lives in a **repo** (a URL). Its **values** are its settings.
- **CRD** = CustomResourceDefinition: teaches Kubernetes a new object type.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `Error: repo argocd not found` | step 1 skipped, or a typo in the name | `helm repo list` |
| the count is not `0` | wrong setting name for this version | repeat step 3, copy the exact name |
| you used `--skip-crds`, count not `0` | this chart ships CRDs as normal templates | use `--set crds.install=false` |
| `No such file or directory` | the target folder is missing | `mkdir -p <folder>` first |
| you ran `helm install` by mistake | the chart got installed | `helm uninstall my-argo -n argocd` |

---

## 16. Helm install, upgrade, rollback

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Add the Helm repository `https://kubernetes.github.io/ingress-nginx` with the name `ingress-nginx`.
> 2. Install the chart `ingress-nginx` as release `web` in a new namespace `demo`, with `2` controller replicas.
> 3. Upgrade the release to `3` controller replicas.
> 4. Roll the release back to revision `1`.

**What the question is really saying:**

Install with one setting, change it, undo the change.

**Write down from the question:** repo = `ingress-nginx` · release = `web` · namespace = `demo` · replicas 2 → 3 → back to revision 1

---

### Think

- **Wanted:** release `web` back at revision 1's settings.
- **Look first:** the exact name of the replicas setting.
- **Expect:** `replicaCount` under `controller:`
- **Fix:** install, upgrade, rollback, each with `-n demo`.
- **Prove:** revision 3, controller at `2/2`.

### Time budget

Target 5 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
helm uninstall web -n demo 2>/dev/null || true
k delete namespace demo --ignore-not-found
k delete ingressclass nginx --ignore-not-found
k delete validatingwebhookconfiguration web-ingress-nginx-admission --ignore-not-found
k delete clusterrolebinding web-ingress-nginx web-ingress-nginx-admission --ignore-not-found
k delete clusterrole web-ingress-nginx web-ingress-nginx-admission --ignore-not-found
helm repo remove ingress-nginx 2>/dev/null || true
clear
helm list -A
```

---

### Step 1. Add the repo

**Why:** Helm can only find the chart after the repo is added.

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```
You see:
```
"ingress-nginx" has been added to your repositories
...
Update Complete. ⎈Happy Helming!⎈
```

---

### Step 2. Find the replicas setting

**Why:** the chart has two `replicaCount` settings. You need the controller one.

```
helm show values ingress-nginx/ingress-nginx | grep -E "^[a-z]|replicaCount"
```
You see:
```
controller:
...
  replicaCount: 1  <-- use
...
defaultBackend:
...
  replicaCount: 1  <-- skip
```
**Means:** `^[a-z]` adds the top-level keys. So you see each parent.

---

### Step 3. Install with 2 replicas

**Why:** `--set` changes one setting on the command line.

```
helm install web ingress-nginx/ingress-nginx -n demo --create-namespace --set controller.replicaCount=2
k get deployments -n demo
```
You see:
```
STATUS: deployed
REVISION: 1
...
web-ingress-nginx-controller   2/2   2   2   ...   <-- READY
```
**Means:** `--create-namespace` made `demo`. READY `0/2` at first is normal; wait.

---

### Step 4. Upgrade to 3 replicas

**Why:** `helm upgrade` changes a running release and adds a revision.

```
helm upgrade web ingress-nginx/ingress-nginx -n demo --set controller.replicaCount=3
```
You see:
```
Release "web" has been upgraded. Happy Helming!
...
REVISION: 2
```
**Don't:** use `helm install` again. The name `web` is taken.

---

### Step 5. Roll back to revision 1

**Why:** `helm history` shows which revision holds which change.

```
helm history web -n demo
helm rollback web 1 -n demo
```
You see:
```
1   ...   superseded   ingress-nginx-...   ...   Install complete
2   ...   deployed     ingress-nginx-...   ...   Upgrade complete
Rollback was a success! Happy Helming!
```

---

### Verify

**Why:** a rollback is itself a new revision.

```
helm list -n demo
k get deployments -n demo
```
You see:
```
web   demo   3   ...   deployed   ingress-nginx-...   <-- REVISION
web-ingress-nginx-controller   2/2   2   2   ...   <-- READY
```
**Don't:** expect revision 1. Rollback copies revision 1 into a new revision 3.

---

### Three words first

- **Release** = one installed copy of a chart. It has a name and a namespace.
- **Revision** = the version number of a release. Every install, upgrade or rollback adds 1.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `helm list` shows nothing | `-n demo` missing; Helm needs it too | `helm list -A` |
| `cannot re-use a name that is still in use` | the release already exists | use `helm upgrade`, or uninstall first |
| replicas did not change | wrong setting name | repeat step 2 |
| `k get services -n demo` EXTERNAL-IP `<pending>` | no cloud LoadBalancer in a lab | normal, ignore it |
| repo add or install fails | ingress-nginx was retired in March 2026 | practise with repo `https://stefanprodan.github.io/podinfo`, chart `podinfo/podinfo`, setting `replicaCount` |

---

## 17. Kustomize

### PART B. The exam starts here

**The question, as the exam words it:**

> A Kustomize configuration exists in `/root/kust`. Change it so that deployment `kweb` runs with `3` replicas, then apply it. Do not edit `deploy.yaml`.

**What the question is really saying:**

Change `kustomization.yaml`, not `deploy.yaml`, then apply the folder with `-k`.

**Write down from the question:** folder = `/root/kust` · deployment = `kweb` · replicas = `3` · do NOT edit `deploy.yaml`

---

### Think

- **Wanted:** `kweb` with 3 replicas, made by Kustomize.
- **Look first:** the plan file `kustomization.yaml`.
- **Expect:** a `replicas:` block with `count: 2`.
- **Fix:** change the count in the plan file, apply the folder.
- **Prove:** `kweb` shows `3/3` in the namespace the plan sets.

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace kust --ignore-not-found
k delete deployment kweb --ignore-not-found -n default
rm -rf /root/kust
mkdir -p /root/kust
k create deployment kweb --image=nginx:1.27 --dry-run=client -o yaml > /root/kust/deploy.yaml
cat > /root/kust/kustomization.yaml <<EOF
resources:
- deploy.yaml
namespace: kust
replicas:
- name: kweb
  count: 2
EOF
k create namespace kust
clear
cat /root/kust/kustomization.yaml
```

---

### Step 1. What does the plan say?

**Why:** the plan file lists the base files and the changes.

```
cat /root/kust/kustomization.yaml
```
You see:
```
resources:
- deploy.yaml   <-- base
namespace: kust   <-- target
replicas:
- name: kweb
  count: 2   <-- change
```
**Means:** "Take `deploy.yaml`, put it in `kust`, give `kweb` 2 replicas."

---

### Step 2. Change the count

**Why:** the change goes into the plan (docs page: "Declarative Management of Kubernetes Objects Using Kustomize").

```
vim /root/kust/kustomization.yaml
```
The file must end up like this:
```yaml
resources:
- deploy.yaml
namespace: kust
replicas:
- name: kweb
  count: 3   # <-- CHANGE
```
In vim: type `/count`, Enter, `$`, `r3`, then `:wq`, Enter.

```
grep count /root/kust/kustomization.yaml
```
You see:
```
  count: 3   <-- changed
```

---

### Step 3. Preview the result

**Why:** `k kustomize` prints the final YAML and creates nothing.

```
k kustomize /root/kust | grep -E 'namespace|replicas'
```
You see:
```
  namespace: kust
  replicas: 3   <-- worked
```
**Means:** the plan is right. Now apply it.

---

### Step 4. Apply the folder

**Why:** `-k` reads the plan. `-f` would ignore it.

```
k apply -k /root/kust
```
You see:
```
deployment.apps/kweb created
```
**Don't:** use `-f /root/kust`. It applies `deploy.yaml` unchanged into `default`.

---

### Verify

**Why:** prove 3 pods run in the plan's namespace.

```
k get deployment kweb -n kust
```
You see:
```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
kweb   3/3     3            3           20s   <-- READY
```
**Don't:** worry about `1/3` at first. Wait 20 seconds.

---

### Three words first

- **Kustomize** = changes YAML files without editing them. Built into kubectl.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `deployment.apps/kweb created` plus an error with `kind not set` | you used `-f` on the folder | `k delete deployment kweb -n default`, then `k apply -k /root/kust` |
| `No resources found` | wrong namespace | read `namespace:` in the plan; use `-n kust` |
| `namespaces "kust" not found` | Kustomize does not create the namespace | `k create namespace kust`, apply again |
| the question wants a new image tag | different block | add `images:` / `- name: nginx` / `  newTag: "1.28"` |

---

## 18. ★ CRDs

### PART B. The exam starts here

**The question, as the exam words it:**

> cert-manager is installed in the cluster.
> 1. Write a list of all cert-manager CRDs to `/root/crds.txt`.
> 2. Write the documentation of the field `subject` in the `spec` of the `Certificate` resource to `/root/subject.txt`.

**What the question is really saying:**

Two files: one from `k get crd`, one from `k explain`.

**Write down from the question:** files = `/root/crds.txt`, `/root/subject.txt` · kind = `Certificate` · field = `spec.subject`

---

### Think

- **Wanted:** two files the grader opens and compares.
- **Look first:** the CRD list, filtered to cert-manager.
- **Expect:** 6 names ending in `cert-manager.io`.
- **Fix:** list into file 1; field docs into file 2.
- **Prove:** both files hold what the screen showed.

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.crds.yaml
rm -f /root/crds.txt /root/subject.txt
clear
k get crd | grep cert-manager
```

---

### Step 1. Which cert-manager CRDs exist?

**Why:** `grep` keeps only lines with the word cert-manager.

```
k get crd | grep cert-manager
```
You see:
```
certificaterequests.cert-manager.io   2026-...
certificates.cert-manager.io          2026-...   <-- 1 of 6
...
```
**Means:** 6 lines. That is the list the grader wants.

---

### Step 2. The list, into the file

**Why:** same command, `>` sends it into the file.

```
k get crd | grep cert-manager > /root/crds.txt
wc -l /root/crds.txt
```
You see:
```
6 /root/crds.txt   <-- saved
```

---

### Step 3. Read the field docs

**Why:** `k explain` works for new kinds too. The path uses dots.

```
k explain certificate.spec.subject | head -5
```
KIND must say `Certificate`, FIELD must say `subject`.

You see:
```
GROUP:      cert-manager.io
KIND:       Certificate
VERSION:    v1

FIELD: subject <Object>
```
**Means:** the path is right. Now save the full text.

---

### Step 4. The docs, into the file

**Why:** the grader reads the full text, not only the head.

```
k explain certificate.spec.subject > /root/subject.txt
head -2 /root/subject.txt
```
You see:
```
GROUP:      cert-manager.io
KIND:       Certificate
```
**Don't:** keep `| head` in this command. The file would hold 5 lines only.

---

### Verify

**Why:** the grader reads the files, so read them too.

```
cat /root/crds.txt /root/subject.txt
```
You see:
```
certificaterequests.cert-manager.io   2026-...
...
FIELD: subject <Object>
...
DESCRIPTION:
```

---

### Three words first

- **CRD (CustomResourceDefinition)** = adds a NEW kind to Kubernetes, like `Certificate`.
- **k explain** = prints the docs of a kind or one of its fields.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `couldn't find resource for "certificate"` | wrong kind name | `k api-resources | grep cert-manager`; use a name from the first column |
| the question names an output format (e.g. `-o name`) | the grader compares that format | `k get crd -o name | grep cert-manager > /root/crds.txt` |
| the question also asks to CREATE such an object | you need its fields | `k explain certificate.spec`; copy `apiVersion` and `kind`; `k apply -f` |
| no cert-manager pods on Killercoda | Part A installs only the CRDs | normal; this question needs only the CRDs |

---

## 19. ★ cri-dockerd (prepare a node)

### PART B. The exam starts here

**The question, as the exam words it:**

> Prepare this node for Kubernetes:
> 1. Install the package `/root/cri-dockerd.deb`.
> 2. Enable and start the service `cri-docker`.
> 3. Set these kernel parameters so that they persist across reboots:
>    `net.bridge.bridge-nf-call-iptables = 1`
>    `net.ipv6.conf.all.forwarding = 1`
>    `net.ipv4.ip_forward = 1`
>    `net.netfilter.nf_conntrack_max = 131072`

**What the question is really saying:**

Three Linux jobs, no kubectl: install a package, start a service, write settings into a file.

**Write down from the question:** package = `/root/cri-dockerd.deb` · service = `cri-docker` · the 4 parameters (copy, do not retype) · must persist = a file, not `sysctl -w`

---

### Think

- **Wanted:** package installed, service running, 4 settings saved in a file.
- **Look first:** the package path from the question.
- **Expect:** `Setting up cri-dockerd`, then `active`.
- **Fix:** settings into a file in `/etc/sysctl.d/`, then load them.
- **Prove:** `sysctl` prints the 4 values from the question.

### Time budget

Target 4 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
dpkg -r cri-dockerd >/dev/null 2>&1
. /etc/os-release
curl -fsL -o /root/cri-dockerd.deb https://github.com/Mirantis/cri-dockerd/releases/download/v0.4.10/cri-dockerd_0.4.10.3-0.ubuntu-${VERSION_CODENAME}_amd64.deb || curl -fsL -o /root/cri-dockerd.deb https://github.com/Mirantis/cri-dockerd/releases/download/v0.4.10/cri-dockerd_0.4.10.3-0.ubuntu-jammy_amd64.deb
rm -f /etc/sysctl.d/k8s.conf
sysctl -w net.ipv4.ip_forward=0 net.ipv6.conf.all.forwarding=0 net.bridge.bridge-nf-call-iptables=0 >/dev/null
clear
ls -l /root/cri-dockerd.deb && sysctl net.ipv4.ip_forward
```

---

### Step 1. Install the package

**Why:** `dpkg -i` installs a `.deb` file.

```
dpkg -i /root/cri-dockerd.deb
```
You see:
```
Setting up cri-dockerd ...
```
**Don't:** run `apt-get install -f` on Killercoda. It can break the cluster.

---

### Step 2. Enable and start the service

**Why:** `enable` = start at boot. `--now` = start it now too.

```
systemctl enable --now cri-docker
systemctl is-enabled cri-docker
systemctl is-active cri-docker
```
You see:
```
enabled   <-- starts at boot
active    <-- running now
```

---

### Step 3. Write the settings into a file

**Why:** files in `/etc/sysctl.d/` are read at every boot (docs page: "Container Runtimes").

```
vim /etc/sysctl.d/k8s.conf
```
In vim: `:set paste`, Enter, `i`, paste, `Esc`, `:wq`, Enter. The file content:
```
net.bridge.bridge-nf-call-iptables = 1
net.ipv6.conf.all.forwarding = 1
net.ipv4.ip_forward = 1
net.netfilter.nf_conntrack_max = 131072
```
```
cat /etc/sysctl.d/k8s.conf
```
The file shows the 4 lines from the question.

You see:
```
net.bridge.bridge-nf-call-iptables = 1
...
```
**Don't:** use only `sysctl -w`. It is lost at reboot.

---

### Step 4. Load the settings now

**Why:** the file alone waits for a reboot. `--system` loads it now.

```
sysctl --system
```
You see:
```
* Applying /etc/sysctl.d/k8s.conf ...   <-- yours
net.bridge.bridge-nf-call-iptables = 1
...
```

---

### Verify

**Why:** prove all 4 values are live.

```
sysctl net.ipv4.ip_forward net.bridge.bridge-nf-call-iptables net.ipv6.conf.all.forwarding net.netfilter.nf_conntrack_max
```
You see:
```
net.ipv4.ip_forward = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv6.conf.all.forwarding = 1
net.netfilter.nf_conntrack_max = 131072
```

---

### Three words first

- **cri-dockerd** = an adapter so Kubernetes can use Docker to run containers.
- **sysctl** = a kernel setting, `name = value`.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| Killercoda: `dependency problems` or `Cannot connect to the Docker daemon` | the playground has no Docker | expected; go on to Step 3; never install Docker there |
| `cannot stat /proc/sys/net/bridge/...` | bridge module not loaded | `modprobe br_netfilter`, then `sysctl --system` |
| `cannot stat /proc/sys/net/netfilter/...` | conntrack module not loaded | `modprobe nf_conntrack`, then `sysctl --system` |
| `requires superuser privilege` | you are not root | `sudo -i`, then repeat the step |
| `Unit cri-docker.service not found` | package not installed | repeat Step 1; read its errors |
| Killercoda: pods stop talking after Part A | Part A set `ip_forward=0` | finish Step 3 (`sysctl --system`) |

---

## 20. ★ Install a CNI (network plug-in)

### PART B. The exam starts here

**The question, as the exam words it:**

> The cluster has no CNI installed. Install ONE of the following, from the given manifest:
> - Flannel: `<URL 1>`
> - Calico: `<URL 2>` (tigera-operator) and `<URL 3>` (custom-resources)
>
> The CNI must let pods communicate AND must support NetworkPolicy enforcement.

**What the question is really saying:**

NetworkPolicy support means Calico. (Killercoda already has a CNI: never run Steps 1 and 4 there.)

**Write down from the question:** the URLs · requirement = NetworkPolicy support → **Calico**

---

### Think

- **Wanted:** a CNI that enforces NetworkPolicy: Calico, not Flannel.
- **Look first:** the nodes are `NotReady`; find the cluster's pod range.
- **Expect:** a range like `10.244.0.0/16`.
- **Fix:** install the operator, put the range in the settings file, apply it.
- **Prove:** calico pods Running, all nodes `Ready`.

### Time budget

Target 7 min. Skip at 12.

---

### PART A. Build the exam (Killercoda only)

```
cd /root
rm -f custom-resources.yaml
clear
k get nodes
```

The playground nodes are already `Ready`: it has a CNI. Rehearse Steps 2 and 3 only. The full task needs a cluster without a CNI (killer.sh, or your own VMs).

---

### Step 1. Install the Calico operator

**Why:** the operator installs and runs Calico for you. Use the URL from the question.

```
k create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.1/manifests/tigera-operator.yaml
```
You see:
```
...
deployment.apps/tigera-operator created   <-- last
```
**Don't:** use `apply`. The file is too big: `metadata.annotations: Too long`.

---

### Step 2. Find the cluster's pod range

**Why:** Calico must give pods IPs from the same range as the cluster.

```
k get pods -l component=kube-controller-manager -o yaml -n kube-system | grep cluster-cidr
```
Write this range down.

You see:
```
    - --cluster-cidr=10.244.0.0/16
```
**Means:** pods get IPs from `10.244.0.0/16`. Yours may differ.

---

### Step 3. Put the range in the settings file

**Why:** the file's default `cidr:` is `192.168.0.0/16`. It must match Step 2.

```
curl -LO https://raw.githubusercontent.com/projectcalico/calico/v3.29.1/manifests/custom-resources.yaml
vim custom-resources.yaml
grep cidr custom-resources.yaml
```
In vim: type `/cidr`, Enter, `w` `w`, `C`, type `10.244.0.0/16`, Esc, `:wq`, Enter.

The file now holds your range.

You see:
```
      cidr: 10.244.0.0/16
```

---

### Step 4. Apply the settings

**Why:** this tells the operator to start Calico with your range.

```
k apply -f custom-resources.yaml
```
You see:
```
installation.operator.tigera.io/default created
apiserver.operator.tigera.io/default created
```

---

### Verify

**Why:** prove pods get a network. Give it 1 to 2 minutes.

```
k get pods -A | grep -i -E "calico|tigera"
k get nodes
```
You see:
```
calico-system   calico-node-...   1/1   Running   ...   <-- Running
controlplane    Ready    control-plane   ...   <-- Ready
```

---

### Three words first

- **CNI** = the network plug-in. It gives every pod an IP. Without it, nodes stay `NotReady`.
- **Flannel / Calico** = two CNIs. Only Calico enforces NetworkPolicy.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `no matches for kind "Installation"` | the operator is still registering its types | wait 20 s, apply again |
| Step 2 prints nothing | kubeadm ran without a pod range | `k get configmap kubeadm-config -o yaml -n kube-system | grep -i podSubnet`; still empty: keep `192.168.0.0/16` |
| calico Running, other pods stay `ContainerCreating` | `cidr:` is not the cluster's range | fix the file, apply again |
| the question does NOT mention NetworkPolicy | either CNI is fine | Flannel is one command: `k apply -f <flannel URL>` |

---

## 21. kubeadm upgrade

### PART B. The exam starts here

**The question, as the exam words it:**

> Upgrade the control plane node to Kubernetes `1.35.2`. Then upgrade the worker node `node01` to the same version. Drain each node before upgrading it and make it schedulable again afterwards.

**What the question is really saying:**

Same routine twice; only `kubeadm upgrade apply` (control plane) becomes `kubeadm upgrade node` (worker).

**Write down from the question:** target version = `1.35.2` · nodes = `controlplane`, `node01` · drain before, uncordon after

---

### Think

- **Wanted:** both nodes on `v1.35.2`, both schedulable.
- **Look first:** the VERSION column, and the exact apt version text.
- **Expect:** a package text like `1.35.2-1.1`.
- **Fix:** follow the docs page "Upgrading kubeadm clusters" in order: kubeadm, upgrade, drain, kubelet, uncordon.
- **Prove:** `v1.35.2` on both nodes, no `SchedulingDisabled`.

### Time budget

Target 12 min. Skip at 18. Do it late in the exam.

---

### PART A. Build the exam (Killercoda only)

```
apt-get update -qq
clear
k get nodes; apt-cache madison kubeadm | head -3
```

Compare the node VERSION with the top madison line.
Newer patch of the same minor? Practise, using that version instead of `1.35.2`.
Same version? This playground cannot build the task. Read the steps; practise on killer.sh.

---

### Step 1. Which version can apt install?

**Why:** apt needs the full package text, not just `1.35.2`.

```
cat /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-cache madison kubeadm | head -3
```
The source line must say `v1.35`. Copy the version text `1.35.2-1.1`.

You see:
```
deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /
   kubeadm | 1.35.2-1.1 | https://pkgs.k8s.io/core:/stable:/v1.35/deb  Packages
```
**Means:** kubeadm, kubelet and kubectl all use `1.35.2-1.1`.
**Don't:** forget the source file on a minor upgrade. `v1.34` there? `vim` it to `v1.35`, then `apt-get update` again.

---

### Step 2. New kubeadm, then check the plan

**Why:** kubeadm does the upgrade, so it goes first. `plan` changes nothing.

```
apt-mark unhold kubeadm
apt-get install -y kubeadm=1.35.2-1.1
apt-mark hold kubeadm
kubeadm version -o short
kubeadm upgrade plan
```
You see:
```
kubeadm set on hold.
v1.35.2
...
You can now apply the upgrade by executing the following command:

	kubeadm upgrade apply v1.35.2
```

---

### Step 3. Upgrade the control plane

**Why:** this upgrades the API server, controller manager, scheduler and etcd. Not the kubelet.

```
kubeadm upgrade apply v1.35.2
```
At `Are you sure you want to proceed? [y/N]`, type `y`, Enter. It takes minutes.

You see:
```
... SUCCESS! ... upgraded to "v1.35.2" ...   <-- done
```

---

### Step 4. Drain, new kubelet and kubectl, uncordon

**Why:** pods leave the node while its kubelet is replaced.

```
k drain controlplane --ignore-daemonsets --delete-emptydir-data
apt-mark unhold kubelet kubectl
apt-get install -y kubelet=1.35.2-1.1 kubectl=1.35.2-1.1
apt-mark hold kubelet kubectl
systemctl daemon-reload
systemctl restart kubelet
k uncordon controlplane
```
You see:
```
node/controlplane drained
...
kubectl set on hold.
node/controlplane uncordoned
```
**Don't:** skip `restart kubelet`. The old kubelet keeps running, VERSION stays old.

---

### Step 5. The same on node01

**Why:** every machine has its own packages. The worker runs `kubeadm upgrade node`.

On node01:
```
ssh node01
cat /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-mark unhold kubeadm
apt-get install -y kubeadm=1.35.2-1.1
apt-mark hold kubeadm
kubeadm upgrade node
exit
```
Back on the control plane (drain needs kubectl):
```
k drain node01 --ignore-daemonsets --delete-emptydir-data
```
On node01 again:
```
ssh node01
apt-mark unhold kubelet kubectl
apt-get install -y kubelet=1.35.2-1.1 kubectl=1.35.2-1.1
apt-mark hold kubelet kubectl
systemctl daemon-reload
systemctl restart kubelet
exit
```
You see:
```
... The configuration for this node was successfully updated!
node/node01 drained
kubectl set on hold.
```
**Don't:** type `kubeadm upgrade apply` on node01. A worker has no control plane.

---

### Step 6. Uncordon node01

**Why:** `uncordon` is a kubectl command. It runs on the control plane.

```
k uncordon node01
```
You see:
```
node/node01 uncordoned
```

---

### Verify

**Why:** prove both nodes run the new version and take pods.

```
k get nodes
```
No node shows `SchedulingDisabled`.

You see:
```
controlplane   Ready    control-plane   ...   v1.35.2   <-- new
node01         Ready    <none>          ...   v1.35.2   <-- new
```

---

### Three words first

- **drain** = moves the pods off a node and closes it. **uncordon** opens it again.
- **apt-mark hold** = locks a package against updates. Unhold, install, hold again.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `Version '1.35.2' not found` | apt needs the full text | copy it from `apt-cache madison kubeadm` |
| madison does not list `1.35.2` | no `apt-get update`, or the source still says the old minor | Step 1 |
| drain refuses: "cannot delete Pods with local storage" | missing flag | add `--delete-emptydir-data` |
| drain refuses: pods "not managed by a controller" | a bare pod is on the node | add `--force` |
| `localhost:8080 was refused` | you ran `k` on node01 | `exit` first |

---

## 22. etcd backup and restore (lower priority)

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a snapshot of etcd, which runs at `https://127.0.0.1:2379`, and save it to `/opt/etcd-backup.db`.
> 2. Restore the snapshot into the directory `/var/lib/etcd-restored` and configure etcd to use it.

**What the question is really saying:**

Save with `etcdctl`, restore with `etcdutl`, then change one path in `etcd.yaml`.

**Write down from the question:** endpoint = `https://127.0.0.1:2379` · backup file = `/opt/etcd-backup.db` · restore folder = `/var/lib/etcd-restored`

---

### Think

- **Wanted:** a backup file, then etcd running from the restored folder.
- **Look first:** the three certificate paths in `etcd.yaml`.
- **Expect:** files under `/etc/kubernetes/pki/etcd/`.
- **Fix:** save, restore into a NEW folder, point the `etcd-data` hostPath at it.
- **Prove:** etcd Running, kubectl answers.

### Time budget

Target 10 min. Skip at 15.

---

### PART A. Build the exam (Killercoda only)

```
if grep -q etcd-restored /etc/kubernetes/manifests/etcd.yaml; then sed -i 's#/var/lib/etcd-restored#/var/lib/etcd#' /etc/kubernetes/manifests/etcd.yaml; sleep 30; fi
for i in $(seq 1 24); do k get nodes >/dev/null 2>&1 && break; sleep 5; done
rm -f /opt/etcd-backup.db
rm -rf /var/lib/etcd-restored
clear
k get nodes
```

The backup is safe. The restore changes the cluster: use a playground you can throw away.

---

### Step 1. Tools and certificate paths

**Why:** etcd only talks to clients with its certificates. Docs page: "Operating etcd clusters for Kubernetes".

```
which etcdctl etcdutl
grep -E "trusted-ca-file|cert-file|key-file" /etc/kubernetes/manifests/etcd.yaml
```
`cert-file` goes to `--cert`, `key-file` to `--key`, `trusted-ca-file` to `--cacert`.

You see:
```
.../etcdctl
.../etcdutl
    - --cert-file=/etc/kubernetes/pki/etcd/server.crt
    - --key-file=/etc/kubernetes/pki/etcd/server.key
    - --peer-cert-file=/etc/kubernetes/pki/etcd/peer.crt
    ...
    - --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt
```
**Means:** use the three lines without `peer`.

---

### Step 2. Take the snapshot

**Why:** `etcdctl` talks to the running etcd.

```
etcdctl snapshot save /opt/etcd-backup.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key
```
You see:
```
Snapshot saved at /opt/etcd-backup.db
```
**Means:** backup-only question? You are finished.

---

### Step 3. Restore into a new folder

**Why:** `etcdutl` works on files only. No certificates needed.

```
etcdutl snapshot restore /opt/etcd-backup.db --data-dir=/var/lib/etcd-restored
ls /var/lib/etcd-restored
```
You see:
```
member   <-- restored data
```
**Don't:** use `etcdctl snapshot restore`. etcd 3.6 (Kubernetes v1.35) removed it.

---

### Step 4. Point etcd at the new folder

**Why:** the kubelet runs etcd from this file. Change only the `etcd-data` hostPath.

```
cp /etc/kubernetes/manifests/etcd.yaml /root/etcd.yaml.bak
vim /etc/kubernetes/manifests/etcd.yaml
grep etcd-restored /etc/kubernetes/manifests/etcd.yaml
```
In vim: press `G` to reach the end. Only the `path:` of the `etcd-data` hostPath changes, to `/var/lib/etcd-restored`:
```
  volumes:
  - hostPath:
      path: /etc/kubernetes/pki/etcd
      type: DirectoryOrCreate
    name: etcd-certs
  - hostPath:
      path: /var/lib/etcd-restored
      type: DirectoryOrCreate
    name: etcd-data
```
After saving, `grep` must find exactly 1 line.

You see:
```
      path: /var/lib/etcd-restored
```
**Don't:** change `--data-dir` or `mountPath`. Inside the container it is still `/var/lib/etcd`.

---

### Step 5. Wait for etcd

**Why:** the kubelet sees the changed file and restarts etcd itself.

```
crictl ps | grep etcd
```
You see:
```
...   Running   etcd   ...
```
**Means:** kubectl may not answer for up to 60 seconds. That is normal.

---

### Verify

**Why:** prove the cluster works on the restored data.

```
k get pods -n kube-system | grep etcd
```
You see:
```
etcd-controlplane   1/1   Running   ...
```

---

### Three words first

- **etcd** = the cluster database. Runs as a static pod from `etcd.yaml`.
- **Snapshot** = a backup file of that database.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| save hangs or `context deadline exceeded` | wrong certificate path or endpoint | compare with Step 1 |
| kubectl still dead after 2 minutes | typo in `etcd.yaml` | `crictl ps -a \| grep etcd`, `crictl logs <id>`; or `cp /root/etcd.yaml.bak /etc/kubernetes/manifests/etcd.yaml` |
| restore says the data dir exists | the folder is already there | `rm -rf` it, or pick a new name |
| `etcdutl: command not found` (playground) | not installed there | read the version: `k get pod etcd-controlplane -o jsonpath='{..image}' -n kube-system` (e.g. `3.6.5-0`); `curl -sLo /tmp/etcd.tgz https://github.com/etcd-io/etcd/releases/download/v3.6.5/etcd-v3.6.5-linux-amd64.tar.gz`; `tar xzf /tmp/etcd.tgz -C /tmp`; run `/tmp/etcd-v3.6.5-linux-amd64/etcdutl` |

---

# SERVICES & NETWORKING (20% of the score) — Questions 23 to 30

**What this group is about:** how traffic reaches pods.

| Object | What it does |
|---|---|
| **Service, type ClusterIP** | a fixed address for a group of pods. Reachable only inside the cluster. |
| **Service, type NodePort** | the same, plus a port (30000 to 32767) on every node. Reachable from outside. |
| **Ingress** | a rule for HTTP traffic: "requests for this hostname and path go to that Service". Needs an ingress controller. |
| **Gateway + HTTPRoute** | the newer replacement for Ingress, split into two objects. |
| **NetworkPolicy** | decides which traffic may reach a pod. |
| **CoreDNS** | turns Service names into IPs. Full name of a Service: `SERVICE.NAMESPACE.svc.cluster.local` |

| Questions | Docs needed? |
|---|---|
| 23 NodePort, 24 Ingress, 30 DNS names | no, all commands |
| 25 Gateway, 26 and 27 NetworkPolicy | yes, copy the example |
| 28 TLS ConfigMap, 29 CoreDNS | no, `k edit` |

---

## 23. ★ NodePort

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`:
> 1. Edit deployment `np` so that the container declares port `80` (TCP).
> 2. Create a Service named `np-svc` of type `NodePort` that exposes the deployment on port `80`, using node port `30080`.

**What the question is really saying:**

Add a port to the Deployment, expose it, then fix the node port to 30080.

**Write down from the question:** namespace = `web` · deployment = `np` · containerPort = `80` · Service = `np-svc` · port = `80` · nodePort = `30080`

---

### Think

- **Wanted:** the pod declares port 80; a NodePort Service on 30080.
- **Look first:** the container section of the Deployment.
- **Expect:** no `ports:` under the container.
- **Fix:** add the port, expose as NodePort, set the node port.
- **Prove:** `80:30080/TCP`, and a node answers on 30080.

### Time budget

Target 4 min. Skip at 7.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace web --ignore-not-found
k create namespace web
k create deployment np --image=nginx:1.27 -n web
k rollout status deployment/np --timeout=120s -n web
clear
k get deployments,services -n web
```

---

### Step 1. Add the container port

**Why:** `containerPort` tells Kubernetes which port the container listens on.

```
k edit deployment/np -n web
```
Type `/image:` and Enter. Add the last three lines, under `name: nginx`:
```
      containers:
      - image: nginx:1.27
        imagePullPolicy: IfNotPresent
        name: nginx
        ports:
        - containerPort: 80
          protocol: TCP
```
Save with `Esc`, `:wq`.
You see:
```
deployment.apps/np edited
```
**Don't:** start `ports:` under the `-` of `- image:`. It lines up with `name:`.

---

### Step 2. Expose it as NodePort

**Why:** `k expose` copies the Deployment's labels into the selector.

```
k expose deployment np --name=np-svc --port=80 --target-port=80 --type=NodePort -n web
```
You see:
```
service/np-svc exposed
```
**Means:** the Service exists, but with a random node port.

---

### Step 3. Set the node port

**Why:** there is no flag for it; patch the Service.

```
k patch service np-svc -p '{"spec":{"ports":[{"port":80,"nodePort":30080}]}}' -n web
```
You see:
```
service/np-svc patched
```
**Means:** the port with `port: 80` now uses node port 30080.

---

### Step 4. Does the Service find the pod?

**Why:** no endpoints means no traffic, whatever the ports say.

```
k get endpointslices -l kubernetes.io/service-name=np-svc -n web
```
ENDPOINTS must show a pod IP.

You see:
```
np-svc-...   IPv4   80   192.168.x.x   1m
```
**Means:** selector and target port are right.

---

### Verify

**Why:** prove the node port answers.

```
k get service np-svc -n web
curl -s -m 3 node01:30080 | grep title
```
You see:
```
np-svc   NodePort   10.x.x.x   <none>   80:30080/TCP   2m
<title>Welcome to nginx!</title>
```

---

### Three words first

- **NodePort Service** = a Service that also opens one port on every node (30000 to 32767).
- **port / targetPort / nodePort** = the Service's port / the container's port / the port on every node.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| vim reopens with an error at the top | wrong indentation, or a Tab | spaces only; `ports:` lines up with `name:` |
| the Service is called `np` | forgot `--name=np-svc` | `k delete service np -n web`, run step 2 again |
| `provided port is already allocated` | another Service uses 30080 | `k get services -A`, find 30080; ask, never delete it |
| `provided port is not in the valid range` | node port outside 30000 to 32767 | use the number from the question |
| curl fails, endpoints are fine | `node01` does not resolve | `k get nodes -o wide`, curl the INTERNAL-IP |

---

## 24. Ingress

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, create an Ingress named `web-ing` that uses the existing IngressClass. Requests for host `shop.example.com` with path `/` (type Prefix) must go to service `backend-svc` on port `80`.

**What the question is really saying:**

One Ingress, made with one command. Only the class name must be looked up.

**Write down from the question:** namespace = `web` · Ingress = `web-ing` · host = `shop.example.com` · path = `/` Prefix · Service = `backend-svc` · port = `80` · class = "the existing one" (look it up)

---

### Think

- **Wanted:** host + path `/` → `backend-svc:80`.
- **Look first:** the IngressClass name, and the Service port.
- **Expect:** one class, `nginx`.
- **Fix:** `k create ingress` with `--class` and `--rule`.
- **Prove:** describe shows the backend with a pod IP.

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace web --ignore-not-found
k create namespace web
k create deployment backend --image=nginx:1.27 -n web
k expose deployment backend --name=backend-svc --port=80 -n web
cat <<EOF | k apply -f -
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
EOF
k rollout status deployment/backend --timeout=120s -n web
clear
k get ingressclass,services,ingress -n web
```

---

### Step 1. Which class exists?

**Why:** an Ingress without the right class is ignored.

```
k get ingressclass
```
You see:
```
nginx   k8s.io/ingress-nginx   <none>   1m
```
**Means:** the class is `nginx`.

---

### Step 2. Which port does the Service have?

**Why:** the rule needs the Service port, not the pod port.

```
k get service backend-svc -n web
```
You see:
```
backend-svc   ClusterIP   10.x.x.x   <none>   80/TCP   1m
```
**Means:** `backend-svc:80` is a real target.

---

### Step 3. Create the Ingress

**Why:** `k create ingress` writes the whole object; no YAML.

```
k create ingress web-ing --class=nginx --rule="shop.example.com/*=backend-svc:80" -n web
```
You see:
```
ingress.networking.k8s.io/web-ing created
```
**Means:** rule = `HOST/PATH=SERVICE:PORT`. The `*` makes the path type `Prefix`.
**Don't:** drop the `*`. Without it the path type is `Exact`.

---

### Step 4. Check the summary line

**Why:** one line shows class and host.

```
k get ingress web-ing -n web
```
You see:
```
web-ing   nginx   shop.example.com   80   10s
```
**Means:** ADDRESS stays empty here. The playground has no ingress controller.

---

### Verify

**Why:** prove the backend resolves to a real pod.

```
k describe ingress web-ing -n web
```
The IP in brackets must be a pod IP.

You see:
```
Ingress Class:    nginx
...
  shop.example.com
                    /   backend-svc:80 (192.168.x.x:80)
```

---

### Three words first

- **Ingress** = a rule for incoming web traffic: host + path → Service + port.
- **IngressClass** = names the controller that carries out the rules.
- **pathType: Prefix** = matches the path and everything below it. `/` matches every request.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `<error: services "..." not found>` | Service name typo | `k delete ingress web-ing -n web`, create again |
| empty brackets `()`, no pod IP | wrong Service port, or pods not Ready | check PORT(S) in step 2; delete and create again |
| `Ingress Class: <none>` | forgot `--class` | delete and create again |
| the question asks for TLS with secret `web-tls` | add it to the rule | `--rule="shop.example.com/*=backend-svc:80,tls=web-tls"` |
| the question asks for an annotation | add a flag | `--annotation nginx.ingress.kubernetes.io/rewrite-target=/` |

---

## 25. ★ Gateway API (replace an Ingress)

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, an Ingress named `web-ing` exposes an application over HTTPS. Migrate it to the Gateway API:
> 1. Create a Gateway named `web-gw` that uses the existing GatewayClass and keeps the same hostname and TLS configuration as the Ingress.
> 2. Create an HTTPRoute named `web-route` that keeps the same routing rules as the Ingress.
> 3. Delete the Ingress.

**What the question is really saying:**

Copy 5 values out of the Ingress into a Gateway and an HTTPRoute, then delete it.

**Write down from the question:** namespace = `web` · Gateway = `web-gw` · HTTPRoute = `web-route` · source = Ingress `web-ing`

---

### Think

- **Wanted:** Gateway (host + TLS) and HTTPRoute (path → Service).
- **Look first:** the Ingress, and the GatewayClass name.
- **Expect:** host, TLS secret, path, Service, port.
- **Fix:** docs examples, with those values filled in.
- **Prove:** both objects exist, the route is attached, the Ingress is gone.

### Time budget

Target 8 min. Skip at 12.

---

### PART A. Build the exam (Killercoda only)

```
k get crd gateways.gateway.networking.k8s.io >/dev/null 2>&1 || k apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml
k wait --for=condition=Established crd/gateways.gateway.networking.k8s.io crd/httproutes.gateway.networking.k8s.io --timeout=60s
k delete namespace web --ignore-not-found
rm -f gw.yaml route.yaml
k create namespace web
k create deployment backend --image=nginx:1.27 -n web
k expose deployment backend --name=backend-svc --port=80 -n web
openssl req -x509 -nodes -newkey rsa:2048 -days 30 -subj "/CN=shop.example.com" -keyout /tmp/t.key -out /tmp/t.crt 2>/dev/null
k create secret tls web-tls --cert=/tmp/t.crt --key=/tmp/t.key -n web
cat <<EOF | k apply -f -
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: nginx
spec:
  controllerName: gateway.nginx.org/nginx-gateway-controller
EOF
k create ingress web-ing --class=nginx --rule="shop.example.com/*=backend-svc:80,tls=web-tls" -n web
k rollout status deployment/backend --timeout=120s -n web
clear
k get ingress,gatewayclass -n web
```
(No gateway controller here: no `Accepted`/`Programmed`, no traffic. Check the objects and values only.)

---

### Step 1. Read the values from the Ingress

**Why:** the question gives no values. They are in the Ingress.

```
k describe ingress web-ing -n web
k get gatewayclass
```
Under `TLS:`: secret and hostname. Under the host: path, Service, port. Last line: the class.

You see:
```
TLS:
  web-tls terminates shop.example.com
...
  shop.example.com
                    /   backend-svc:80 (192.168.x.x:80)
nginx   gateway.nginx.org/nginx-gateway-controller   ...
```
**Means:** host `shop.example.com`, secret `web-tls`, path `/`, `backend-svc:80`, class `nginx`.

---

### Step 2. Write the Gateway

**Why:** copy the "Gateway" example from the docs page "Gateway API".

```
vim gw.yaml
```
The finished file. Only `apiVersion`, `kind` and `allowedRoutes` stay as in the docs. Every other value is yours, and the `tls:` block is new:
```
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gw
  namespace: web
spec:
  gatewayClassName: nginx
  listeners:
  - name: https
    protocol: HTTPS
    port: 443
    hostname: "shop.example.com"
    tls:
      mode: Terminate
      certificateRefs:
      - name: web-tls
    allowedRoutes:
      namespaces:
        from: Same
```
```
k apply -f gw.yaml
```
You see:
```
gateway.gateway.networking.k8s.io/web-gw created
```
**Don't:** forget the `tls:` block. It is not in the docs; `k explain gateway.spec.listeners.tls` shows it.

---

### Step 3. Write the HTTPRoute

**Why:** copy the "HTTPRoute" example from the same docs page.

```
vim route.yaml
```
The finished file. Yours: `name`, `namespace`, the `parentRefs` name, the hostname, the path `value`, and the backend `name` and `port`:
```
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: web-route
  namespace: web
spec:
  parentRefs:
  - name: web-gw
  hostnames:
  - "shop.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /
    backendRefs:
    - name: backend-svc
      port: 80
```
```
k apply -f route.yaml
```
You see:
```
httproute.gateway.networking.k8s.io/web-route created
```
**Means:** `parentRefs` links the route to the Gateway. `PathPrefix` = Ingress `Prefix`.

---

### Step 4. Test both objects

**Why:** delete the Ingress only when the new objects are right.

```
k get gateway,httproute -n web
```
You see:
```
gateway.gateway.networking.k8s.io/web-gw   nginx   ...
httproute.gateway.networking.k8s.io/web-route   ["shop.example.com"]   ...
```
**Means:** in the exam, `k describe httproute web-route -n web` must show `Accepted` `True`. PROGRAMMED on the Gateway must be `True`.

---

### Step 5. Delete the Ingress

**Why:** the question says so, as the last job.

```
k delete ingress web-ing -n web
```
You see:
```
ingress.networking.k8s.io "web-ing" deleted ...
```

---

### Verify

**Why:** prove the Ingress is gone and the route has the values.

```
k get ingress -n web
k get httproute web-route -o yaml -n web | grep -E "name: web-gw|value: /|backend-svc|port: 80"
```
You see:
```
No resources found in web namespace.
```
then the four route lines. If the question gives a `curl`, run it.

---

### Three words first

- **Gateway** = the entry point: port, protocol, hostname, TLS. It names a **GatewayClass** (the controller).
- **HTTPRoute** = which host and path go to which Service and port.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `no matches for kind "Gateway"` | wrong `apiVersion`, or no CRDs | `gateway.networking.k8s.io/v1`; Part A line 1 |
| route not `Accepted`, curl 404 | `parentRefs` name or hostname differs from the Gateway | make them identical |
| Gateway listener `ResolvedRefs` `False` | wrong secret name in `certificateRefs` | use the secret from step 1 |
| the Ingress had no TLS | plain HTTP | `protocol: HTTP`, `port: 80`, no `tls:` block |

---

## 26. ★ NetworkPolicy: allow one app to reach another

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `prod`, create a NetworkPolicy named `db-policy`. Pods with label `app=db` must accept incoming traffic ONLY from pods with label `app=api` in the same namespace, and only on TCP port `80`.

**What the question is really saying:**

Protect `app=db`; let only `app=api` in, on TCP 80.

**Write down from the question:** namespace = `prod` · policy = `db-policy` · protected = `app=db` · allowed source = `app=api` · port = TCP `80`

---

### Think

- **Wanted:** only `api` reaches `db` on port 80.
- **Look first:** the real pod labels.
- **Expect:** `app=db`, `app=api`, `app=other`.
- **Fix:** one policy: protect db, allow api, port 80.
- **Prove:** `api` gets the page, `other` times out.

### Time budget

Target 6 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace prod --ignore-not-found
rm -f np.yaml
k create namespace prod
k run db --image=nginx:1.27 --labels=app=db -n prod
k run api --image=busybox:1.36 --labels=app=api -n prod -- sleep 3600
k run other --image=busybox:1.36 --labels=app=other -n prod -- sleep 3600
k expose pod db --name=db-svc --port=80 -n prod
k wait --for=condition=Ready pod/db pod/api pod/other --timeout=120s -n prod
clear
k get pods,networkpolicy -n prod
```
(nginx on port 80 plays the database.)

---

### Step 1. Check the labels

**Why:** the policy matches labels, so they must be exact.

```
k get pods --show-labels -n prod
```
`api` may come in, `db` is protected, `other` must be blocked.

You see:
```
api     1/1   Running   0   1m   app=api
db      1/1   Running   0   1m   app=db
other   1/1   Running   0   1m   app=other
```
**Means:** the labels match the question.

---

### Step 2. Write the policy

**Why:** there is no `k create networkpolicy`. Copy the example from the docs page "Network Policies", section "The NetworkPolicy resource".

```
vim np.yaml
```
The finished file. Yours: `name`, `namespace`, the two `app:` labels and the `port`:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api
    ports:
    - protocol: TCP
      port: 80
```
**Means:** from the docs copy, delete `- Egress`, the `ipBlock` and `namespaceSelector` items, and the whole `egress:` part.
**Don't:** keep `- Egress`. With no egress rules, db can send nothing out.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 3. Apply it

**Why:** the file does nothing until the cluster has it.

```
k apply -f np.yaml
```
You see:
```
networkpolicy.networking.k8s.io/db-policy created
```

---

### Step 4. Read it back

**Why:** describe shows what the cluster understood.

```
k describe networkpolicy db-policy -n prod
```
You see:
```
  PodSelector:     app=db
  Allowing ingress traffic:
    To Port: 80/TCP
    From:
      PodSelector: app=api
```
**Means:** one source, one port. A `NamespaceSelector` line means a docs item was left in.

---

### Verify

**Why:** prove `api` gets in and `other` does not.

```
k exec api -n prod -- wget -qO- -T 3 db-svc | grep title
k exec other -n prod -- wget -qO- -T 3 db-svc
```
You see:
```
<title>Welcome to nginx!</title>
wget: download timed out
```

---

### Three words first

- **podSelector (top)** = the pods this policy protects. Under `from:`: the pods allowed in.
- **AND / OR in `from`** = two selectors under ONE `-` must both match. Each new `-` is another allowed source.
- **CNI enforcement** = the network plugin applies policies. Without support, they are silently ignored.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `other` still gets the page | the network plugin does not enforce policies | check with `k describe networkpolicy`; the exam cluster enforces them |
| `api` also times out | wrong label in `from`, or `ports:` under the wrong item | compare with the finished file and `--show-labels` |
| `did not find expected key` | indentation broke while deleting lines | `- podSelector:` starts 4 spaces in, under `- from:` |
| `api` lives in another namespace | `from` needs a namespace too | add `namespaceSelector` with `kubernetes.io/metadata.name: <ns>` under the SAME `-` |
| asked to pick the least permissive file | do not edit files | apply the one with exactly these labels and the port |

---

## 27. Default deny, but keep DNS

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `prod`, create a NetworkPolicy named `default-deny` that blocks all incoming and all outgoing traffic for every pod in the namespace. DNS lookups (port 53, UDP and TCP) must still work.

**What the question is really saying:**

One policy for all pods: nothing in, only port 53 out.

**Write down from the question:** namespace = `prod` · policy = `default-deny` · both directions · exception = port 53 UDP + TCP

---

### Think

- **Wanted:** every pod in `prod` cut off, except DNS going out.
- **Look first:** traffic flows now, and no policy exists yet.
- **Expect:** `No resources found`, and `wget` gets the nginx page.
- **Fix:** the docs "default deny all" policy plus an egress rule for port 53.
- **Prove:** a name lookup works, a download times out.

### Time budget

Target 4 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace prod --ignore-not-found
rm -f deny.yaml
k create namespace prod
k run app --image=busybox:1.36 -n prod -- sleep 3600
k run web --image=nginx:1.27 --port=80 --expose -n prod
k wait --for=condition=Ready pod/app pod/web --timeout=120s -n prod
clear
k get networkpolicy -n prod
```

---

### Step 1. Does traffic flow now?

**Why:** test once before the policy. After it, the same line must fail.

```
k exec app -n prod -- wget -qO- -T 3 web
```
You see:
```
<title>Welcome to nginx!</title>
```
**Means:** nothing blocks traffic yet. Remember this line for the end.

---

### Step 2. Write the policy

**Why:** there is no `k create networkpolicy`. Copy from the docs page "Network Policies", section "Default policies", box "Default deny all ingress and all egress traffic".

```
vim deny.yaml
```
The finished file. Yours: `name`, `namespace` and the whole `egress:` part:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  egress:
  - ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
```
**Means:** no `ingress:` part, so nothing comes in. Out, only port 53.
**Don't:** add `to:` under `egress`. Without `to:`, port 53 is open to any DNS server.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 3. Apply it

**Why:** the file does nothing until the cluster has it.

```
k apply -f deny.yaml
```
You see:
```
networkpolicy.networking.k8s.io/default-deny created
```
**Means:** the policy is in namespace `prod`.

---

### Step 4. Read it back

**Why:** describe shows what the policy really allows.

```
k describe networkpolicy default-deny -n prod
```
Look for three things: `PodSelector: <none>` = all pods. Ingress `<none>` = nothing comes in. `Policy Types` = both directions.

You see:
```
  PodSelector:     <none> (Allowing the specific traffic to all pods in this namespace)
  Allowing ingress traffic:
    <none> (Selected pods are isolated for ingress connectivity)
  Allowing egress traffic:
    To Port: 53/UDP
    To Port: 53/TCP
    To: <any> (traffic not restricted by destination)
  Policy Types: Ingress, Egress
```
**Means:** exactly what the question asks.

---

### Verify

**Why:** prove DNS works and everything else is blocked.

```
k exec app -n prod -- nslookup web.prod.svc.cluster.local
k exec app -n prod -- wget -qO- -T 3 web
```
`nslookup` answers, so DNS works. `wget` times out, so other traffic is blocked.

You see:
```
Name:	web.prod.svc.cluster.local
...
wget: download timed out
command terminated with exit code 1
```

---

### Three words first

- **Egress** = traffic going OUT of the selected pods.
- **Default deny** = a policy with `podSelector: {}`. It selects all pods and allows nothing.
- **Port 53** = the DNS port, on UDP and TCP.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| the Verify `wget` still prints the nginx page | the network plugin does not enforce policies | trust the describe output; the exam cluster enforces them |
| `nslookup` times out too | the egress block is missing or mis-indented | `egress:` starts in the same column as `policyTypes:`; apply again |
| `k get networkpolicy -n prod` shows nothing | the policy landed in `default` | add `namespace: prod`, apply; `k delete networkpolicy default-deny -n default` |
| `error parsing deny.yaml` | tabs or broken spaces from the paste | use `:set paste`, retype the spaces |

---

## 28. ★ TLS settings in a ConfigMap

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `nginx-static`, deployment `nginx-static` gets its configuration from ConfigMap `nginx-config`. The server currently accepts TLSv1.2 and TLSv1.3. Change the configuration so that ONLY TLSv1.3 is accepted, and make sure the running pods use the new configuration.

**What the question is really saying:**

Delete `TLSv1.2` from one line of the ConfigMap, then restart the pods.

**Write down from the question:** namespace = `nginx-static` · ConfigMap = `nginx-config` · deployment = `nginx-static` · keep only `TLSv1.3`

---

### Think

- **Wanted:** nginx accepts only TLSv1.3.
- **Look first:** the `ssl_protocols` line in the ConfigMap.
- **Expect:** `ssl_protocols TLSv1.2 TLSv1.3;`
- **Fix:** remove `TLSv1.2`, then restart the Deployment.
- **Prove:** a TLSv1.2 handshake fails, a TLSv1.3 handshake works.

### Time budget

Target 4 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace nginx-static --ignore-not-found
rm -f /root/cm-backup.yaml
k create namespace nginx-static
openssl req -x509 -nodes -newkey rsa:2048 -days 30 -subj "/CN=nginx-static" -keyout /tmp/tls.key -out /tmp/tls.crt 2>/dev/null
k create secret tls nginx-tls --cert=/tmp/tls.crt --key=/tmp/tls.key -n nginx-static
cat <<'EOF' > /tmp/nginx.conf
events {}
http {
  server {
    listen 443 ssl;
    ssl_certificate     /etc/nginx/tls/tls.crt;
    ssl_certificate_key /etc/nginx/tls/tls.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    location / { return 200 "hello\n"; }
  }
}
EOF
k create configmap nginx-config --from-file=nginx.conf=/tmp/nginx.conf -n nginx-static
cat <<EOF | k apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-static
  namespace: nginx-static
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-static
  template:
    metadata:
      labels:
        app: nginx-static
    spec:
      containers:
      - name: nginx
        image: nginx:1.27
        ports:
        - containerPort: 443
        volumeMounts:
        - name: config
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
        - name: tls
          mountPath: /etc/nginx/tls
      volumes:
      - name: config
        configMap:
          name: nginx-config
      - name: tls
        secret:
          secretName: nginx-tls
EOF
k expose deployment nginx-static --port=443 -n nginx-static
k rollout status deployment/nginx-static --timeout=120s -n nginx-static
clear
k get configmap nginx-config -o yaml -n nginx-static | grep ssl_protocols
```

---

### Step 1. Back up the ConfigMap

**Why:** one wrong character breaks nginx. A backup lets you start over.

```
k get configmap nginx-config -o yaml -n nginx-static > /root/cm-backup.yaml
grep ssl_protocols /root/cm-backup.yaml
```
This is the line to change: `TLSv1.2` must go.

You see:
```
    ssl_protocols TLSv1.2 TLSv1.3;
```
**Means:** the backup holds the old line. Now change the real one.

---

### Step 2. How do the pods get the file?

**Why:** the mount decides whether the pods ever see a change.

```
k get deployment nginx-static -o yaml -n nginx-static | grep subPath
```
You see:
```
          subPath: nginx.conf
```
**Means:** a `subPath` file never updates. The pods need a restart.

---

### Step 3. Remove TLSv1.2

**Why:** the setting lives inside the ConfigMap's `nginx.conf` text.

```
k edit configmap/nginx-config -n nginx-static
```
In vim: type `/ssl_protocols`, Enter. Then type `:s/TLSv1.2 //`, Enter. Save with `:wq`.

You see:
```
configmap/nginx-config edited
```
**Means:** the line is now `ssl_protocols TLSv1.3;`.
**Don't:** delete the `;` at the end. nginx then fails to start.

---

### Step 4. Restart the pods

**Why:** nginx reads its config only when it starts.

```
k rollout restart deployment/nginx-static -n nginx-static
k rollout status deployment/nginx-static -n nginx-static
```
The restart makes a new pod, and the new pod reads the new config.

You see:
```
deployment.apps/nginx-static restarted
deployment "nginx-static" successfully rolled out
```

---

### Verify

**Why:** prove the server refuses TLSv1.2 and accepts TLSv1.3.

```
IP=$(k get service nginx-static -o jsonpath='{.spec.clusterIP}' -n nginx-static)
openssl s_client -connect $IP:443 -tls1_2 </dev/null 2>&1 | grep -E 'alert|New,'
openssl s_client -connect $IP:443 -tls1_3 </dev/null 2>&1 | grep -E 'alert|New,'
```
`alert protocol version` = TLSv1.2 refused. `New, TLSv1.3` = TLSv1.3 works.

You see:
```
...:tlsv1 alert protocol version:...
New, (NONE), Cipher is (NONE)
New, TLSv1.3, Cipher is ...
```
**Don't:** test before Step 4. The old pod still accepts TLSv1.2.

---

### Three words first

- **ssl_protocols** = the nginx line that lists the TLS versions it accepts.
- **openssl s_client** = opens a TLS connection. `-tls1_2` forces version 1.2.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| the edit is refused: `field is immutable` | the ConfigMap has `immutable: true` | fix the line in `vim /root/cm-backup.yaml`; `k replace --force -f /root/cm-backup.yaml`; then Step 4 |
| new pod in `CrashLoopBackOff` | nginx syntax broken, often a missing `;` | `k logs -l app=nginx-static -n nginx-static` names the line; fix the ConfigMap, restart again |
| `rollout status` waits forever | the new pod cannot start | `k get pods -n nginx-static`, then `k describe` the new pod |

---

## 29. CoreDNS config

### PART B. The exam starts here

**The question, as the exam words it:**

> Configure cluster DNS so that the name `api.example.com` resolves to the service `backend-svc` in namespace `web`, for all pods in the cluster. Make sure CoreDNS uses the new configuration.

**What the question is really saying:**

Add one `rewrite` line to the Corefile, then restart CoreDNS.

**Write down from the question:** name = `api.example.com` · target = `backend-svc.web.svc.cluster.local`

---

### Think

- **Wanted:** `api.example.com` answers with the IP of `backend-svc`.
- **Look first:** the Service's CLUSTER-IP, then the Corefile.
- **Expect:** no `rewrite` line in the Corefile yet.
- **Fix:** backup, add `rewrite name A B`, restart CoreDNS.
- **Prove:** a test pod resolves `api.example.com` to the CLUSTER-IP.

### Time budget

Target 5 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace web --ignore-not-found
k delete pod t --ignore-not-found
[ -f /root/coredns-backup.yaml ] && k replace --force -f /root/coredns-backup.yaml
k get configmap coredns -o yaml -n kube-system | sed '/rewrite name api.example.com/d' | k replace -f -
rm -f /root/coredns-backup.yaml
k scale deployment/coredns --replicas=2 -n kube-system
k rollout restart deployment/coredns -n kube-system
k rollout status deployment/coredns --timeout=120s -n kube-system
k create namespace web
k create deployment backend --image=nginx:1.27 -n web
k expose deployment backend --name=backend-svc --port=80 -n web
k rollout status deployment/backend --timeout=120s -n web
clear
k get configmap coredns -o jsonpath='{.data.Corefile}' -n kube-system
```

---

### Step 1. Back up the Corefile

**Why:** one typo breaks DNS for the whole cluster. The backup is your way back.

```
k get configmap coredns -o yaml -n kube-system > /root/coredns-backup.yaml
ls /root/coredns-backup.yaml
```
You see:
```
/root/coredns-backup.yaml
```
**Means:** you can always restore the original.

---

### Step 2. Which IP should the name give?

**Why:** you need it to judge the test at the end.

```
k get service backend-svc -n web
```
Note the CLUSTER-IP.

You see:
```
backend-svc   ClusterIP   10.x.x.x   <none>   80/TCP   1m
```
**Means:** the full target name is `backend-svc.web.svc.cluster.local`.

---

### Step 3. Add the rewrite line

**Why:** the Corefile lives in ConfigMap `coredns`. The docs page "Customizing DNS Service" shows it.

```
k edit configmap/coredns -n kube-system
```
Put the cursor on `ready`. Press `o`. Add the `rewrite` line with that same indent:
```
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        ready
        rewrite name api.example.com backend-svc.web.svc.cluster.local
        kubernetes cluster.local in-addr.arpa ip6.arpa {
```
Save with `Esc`, `:wq`.

You see:
```
configmap/coredns edited
```
**Don't:** put the line outside `.:53 { }`. CoreDNS then ignores it or crashes.

---

### Step 4. Restart CoreDNS

**Why:** new pods load the new Corefile at once.

```
k rollout restart deployment/coredns -n kube-system
k rollout status deployment/coredns -n kube-system
```
You see:
```
deployment.apps/coredns restarted
deployment "coredns" successfully rolled out
```
**Means:** CoreDNS runs with your line.

---

### Verify

**Why:** prove a normal pod gets the Service IP for the new name.

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup api.example.com
```
You see:
```
...
Address: 10.x.x.x  <-- Step 2
```
**Don't:** read the first `Address` line. That one is the DNS server itself.

---

### Three words first

- **Corefile** = the CoreDNS config text, in ConfigMap `coredns`, namespace `kube-system`.
- **`.:53 { }`** = the main block of the Corefile. Each line inside is a plugin.
- **rewrite name A B** = a question for name A is answered as if it asked for B.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| CoreDNS pods in `CrashLoopBackOff` | a typo in the Corefile | `k replace --force -f /root/coredns-backup.yaml`; restart CoreDNS; do Step 3 again |
| `NXDOMAIN` for `api.example.com` | the line is outside `.:53 { }`, or a typo in the target | `k edit configmap/coredns -n kube-system`, check the line, restart |
| the question wants a whole domain sent to another DNS server | that needs a new block, not `rewrite` | docs "Customizing DNS Service": `example.org:53 { forward . 10.0.0.53 }` |
| `pods "t" already exists` | an old test pod was left behind | `k delete pod t`, test again |

---

## 30. DNS names across namespaces

### PART B. The exam starts here

**The question, as the exam words it:**

> From a temporary pod in namespace `default` (image `busybox:1.36`), look up the DNS name of service `backend-svc` that lives in namespace `web`. Save the output of the lookup to `/root/dns.txt`.

**What the question is really saying:**

Look up the Service's full name from `default`, and save the output to a file.

**Write down from the question:** Service = `backend-svc` · its namespace = `web` · image = `busybox:1.36` · file = `/root/dns.txt`

---

### Think

- **Wanted:** the lookup output for `backend-svc`, saved in a file.
- **Look first:** which namespace the Service is in, and its IP.
- **Expect:** `web`, different from the test pod's `default`.
- **Fix:** use the full name `backend-svc.web.svc.cluster.local`.
- **Prove:** the IP in the file is the Service's CLUSTER-IP.

### Time budget

Target 2 min. Skip at 5.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace web --ignore-not-found
k delete pod t --ignore-not-found
rm -f /root/dns.txt
k create namespace web
k create deployment backend --image=nginx:1.27 -n web
k expose deployment backend --name=backend-svc --port=80 -n web
k rollout status deployment/backend --timeout=120s -n web
clear
k get services -n web
```

---

### Step 1. Where does the Service live?

**Why:** a short name only works from the same namespace.

```
k get services -A | grep backend-svc
```
The first column is the namespace. Note the CLUSTER-IP too.

You see:
```
web   backend-svc   ClusterIP   10.x.x.x   <none>   80/TCP   1m
```
**Means:** from `default`, add the namespace and `svc.cluster.local`: `backend-svc.web.svc.cluster.local`.

---

### Step 2. Test the name on screen

**Why:** see a good answer before you write the file.

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup backend-svc.web.svc.cluster.local
```
You see:
```
Name:	backend-svc.web.svc.cluster.local
Address: 10.x.x.x  <-- Step 1
```
**Means:** the name is right. Now save it.
**Don't:** use only `backend-svc`. From `default` that name is not found.

---

### Step 3. Save the lookup to the file

**Why:** `>` sends the output into the file instead of the screen.

```
k run t --image=busybox:1.36 --rm -i --restart=Never -- nslookup backend-svc.web.svc.cluster.local > /root/dns.txt
cat /root/dns.txt
```
The first `Address` is the DNS server. The answer is the one under `Name:`.

You see:
```
Server:		10.96.0.10
Address:	10.96.0.10:53

Name:	backend-svc.web.svc.cluster.local
Address: 10.x.x.x  <-- answer
```
**Don't:** use `-it` here. A terminal is not needed when the output goes into a file.

---

### Verify

**Why:** prove the file's IP is the Service's IP.

```
k get service backend-svc -o jsonpath='{.spec.clusterIP}{"\n"}' -n web
```
You see:
```
10.x.x.x  <-- same as file
```

---

### Three words first

- **FQDN** = the full name: Service, namespace, then `svc.cluster.local`. It works from every namespace.
- **`--rm -i`** = run once, pass the output back, then delete the pod.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `NXDOMAIN` / `can't find` | a typo, or the wrong namespace in the name | rebuild the name from Step 1 |
| `pods "t" already exists` | an older test pod is still there | `k delete pod t`, run it again |
| the file also holds `pod "t" deleted` | that line comes from kubectl | usually accepted; or run without `--rm`, then `k logs t > /root/dns.txt`, `k delete pod t` |
| `*** Can't find ...: No answer` | busybox also asks for IPv6; there is none | normal, ignore it |
| every name fails | DNS itself is broken | question 11 |

---

# WORKLOADS & SCHEDULING (15% of the score) — Questions 31 to 37

**What this group is about:** how pods are defined, and which node they land on.

**Where things go in a pod definition.**
Most mistakes in this group are a line at the wrong level.

```
spec:                        <- POD level
  nodeSelector:              <- pod level
  tolerations:               <- pod level
  priorityClassName:         <- pod level
  volumes:                   <- pod level       (which storage exists)
  initContainers:            <- pod level
  containers:                <- pod level
  - name: app                <- CONTAINER level starts here
    image:
    ports:                   <- container level
    env: / envFrom:          <- container level
    resources:               <- container level
    volumeMounts:            <- container level  (where that storage appears inside)
```
In a Deployment, all of this sits deeper, under `spec.template.spec`.

| Questions | Docs needed? |
|---|---|
| 32 HPA, 33 PriorityClass, 34 resources, 37 rollout | no, commands + one small edit |
| 31 sidecar, 35 ConfigMap/Secret, 36 toleration | yes, copy a few lines |

---

## 31. ★ Sidecar container

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `work`, deployment `app` writes its log to `/var/log/app.log`. Add a sidecar container named `log-shipper` with image `busybox:1.36` that runs `tail -f /var/log/app.log`. Use a shared volume named `logs` mounted at `/var/log` in both containers. Do not change the existing container's image or command.

**What the question is really saying:**

One volume, mounted in the old container and in a new one.

**Write down from the question:** namespace = `work` · deployment = `app` · sidecar = `log-shipper`, `busybox:1.36`, `tail -f /var/log/app.log` · volume = `logs` · mount path = `/var/log`

---

### Think

- **Wanted:** a second container reading the main one's log.
- **Look first:** the Deployment's YAML, saved to a file.
- **Expect:** one container, named `busybox`, no volumes.
- **Fix:** volume, mount in main, sidecar with the same mount.
- **Prove:** READY `2/2`; the sidecar logs dates.

### Time budget

Target 8 min. Skip at 12.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace work --ignore-not-found
rm -f app.yaml app-backup.yaml
k create namespace work
k create deployment app --image=busybox:1.36 -n work -- sh -c "while true; do date >> /var/log/app.log; sleep 2; done"
k rollout status deployment/app --timeout=120s -n work
clear
k get pods -n work
```

---

### Step 1. Save the Deployment to a file

**Why:** a long edit is safer in a file, with a backup.

```
k get deployment app -o yaml -n work > app.yaml
cp app.yaml app-backup.yaml
grep -A8 "containers:" app.yaml
```
You see:
```
      containers:
      - command:
        - sh
        - -c
        - while true; do date >> /var/log/app.log; sleep 2; done
        image: busybox:1.36
        imagePullPolicy: IfNotPresent
        name: busybox  <-- main
        resources: {}
```
**Means:** one container, no volume yet.

---

### Step 2. Add the three pieces

**Why:** containers share files only through a volume. Docs page: "Communicate Between Containers in the Same Pod Using a Shared Volume".

```
vim app.yaml
```
The pod template's `spec:`, finished. New: `volumeMounts` in `busybox`, the whole `log-shipper` container, and `volumes` at the end:
```
    spec:
      containers:
      - command:
        - sh
        - -c
        - while true; do date >> /var/log/app.log; sleep 2; done
        image: busybox:1.36
        imagePullPolicy: IfNotPresent
        name: busybox
        resources: {}
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
        volumeMounts:
        - name: logs
          mountPath: /var/log
      - name: log-shipper
        image: busybox:1.36
        command: ["tail", "-f", "/var/log/app.log"]
        volumeMounts:
        - name: logs
          mountPath: /var/log
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      schedulerName: default-scheduler
      securityContext: {}
      terminationGracePeriodSeconds: 30
      volumes:
      - name: logs
        emptyDir: {}
```
**Means:** `volumes:` starts in the same column as `containers:`.
**Don't:** put the sidecar above `busybox`. The log file must exist first.

Vim: `:set paste` before pasting. Save with `:wq`.

---

### Step 3. Apply it

**Why:** the file does nothing until the cluster has it.

```
k apply -f app.yaml
```
The `Warning` line is harmless.

You see:
```
Warning: resource deployments/app is missing the kubectl.kubernetes.io/last-applied-configuration annotation ...
deployment.apps/app configured
```

---

### Step 4. Does the new pod run both containers?

**Why:** the change makes a new pod.

```
k rollout status deployment/app -n work
k get pods -n work
```
`2/2` = the main container and the sidecar.

You see:
```
deployment "app" successfully rolled out
app-...   2/2   Running   0   20s
```

---

### Verify

**Why:** prove the sidecar reads the main container's file.

```
k logs deployment/app -c log-shipper --tail=3 -n work
```
Date lines. Your dates differ.

You see:
```
Tue Nov 24 10:00:01 UTC 2026
...
```

---

### Three words first

- **Sidecar** = a helper container in the same pod.
- **emptyDir** = an empty folder owned by the pod, shared by its mounts.
- **volumeMounts** = where a volume appears inside one container.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `error converting YAML` | wrong indentation, or a Tab | spaces only; compare with Step 2 |
| `Init:CrashLoopBackOff` | native sidecar (`initContainers:` + `restartPolicy: Always`) starts first; `tail -f` quits, no file yet | move it under `containers:`, after `busybox` |
| sidecar log: `tail: can't open '/var/log/app.log'` | main container lacks the mount, or names differ | `name: logs` in all 3 places |
| RESTARTS `1` | the sidecar beat the file by a moment | nothing; it restarted fine |
| the file is a mess | many edits went wrong | `cp app-backup.yaml app.yaml`, redo Step 2 |

---

## 32. ★ HPA (autoscaling)

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `shop`, create a HorizontalPodAutoscaler named `web` for deployment `web`: minimum `2` replicas, maximum `5` replicas, target average CPU utilization `70`%. Set the scale-down stabilization window to `30` seconds.

**What the question is really saying:**

Create the HPA, then edit in the scale-down window.

**Write down from the question:** namespace = `shop` · HPA = `web` · deployment = `web` · min `2` · max `5` · CPU `70`% · scale-down window `30` s

---

### Think

- **Wanted:** an HPA: min, max, CPU target, scale-down window.
- **Look first:** does the Deployment have a CPU request?
- **Expect:** `cpu: 100m` under requests.
- **Fix:** `k autoscale`, then add `behavior` with `k edit`.
- **Prove:** TARGETS shows a number; the window reads `30`.

### Time budget

Target 4 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace shop --ignore-not-found
k create namespace shop
k create deployment web --image=nginx:1.27 -n shop
k set resources deployment/web --requests=cpu=100m -n shop
k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.8.0/components.yaml
k get deployment metrics-server -o jsonpath='{.spec.template.spec.containers[0].args}' -n kube-system | grep -q kubelet-insecure-tls || k patch deployment metrics-server --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' -n kube-system
k rollout status deployment/metrics-server --timeout=180s -n kube-system
k rollout status deployment/web --timeout=120s -n shop
for i in $(seq 1 24); do k top node >/dev/null 2>&1 && break; sleep 5; done
clear
k get hpa -n shop
```

---

### Step 1. Does the Deployment request CPU?

**Why:** 70% means 70% of the CPU request. No request, no percentage.

```
k get deployment web -o jsonpath='{.spec.template.spec.containers[0].resources}' -n shop
```
You see:
```
{"requests":{"cpu":"100m"}}
```
**Means:** a CPU request exists. The HPA can calculate.

---

### Step 2. Create the HPA

**Why:** one command sets min, max and the CPU target.

```
k autoscale deployment web --min=2 --max=5 --cpu=70% -n shop
```
You see:
```
horizontalpodautoscaler.autoscaling/web autoscaled
```
**Means:** the HPA is named after the Deployment: `web`.
**Don't:** use `--cpu-percent=70`. It is deprecated since v1.34; `--cpu=70%` is the current flag.

---

### Step 3. Add the scale-down window

**Why:** `k autoscale` has no flag for it. Docs page: "Horizontal Pod Autoscaling", heading "Stabilization window".

```
k edit hpa/web -n shop
```
The `spec:` part, finished. New: the 3 `behavior:` lines at the top:
```
spec:
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 30
  maxReplicas: 5
  metrics:
  - resource:
      name: cpu
      target:
        averageUtilization: 70
        type: Utilization
    type: Resource
  minReplicas: 2
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
```
You see:
```
horizontalpodautoscaler.autoscaling/web edited
```
**Means:** `behavior:` starts in the same column as `maxReplicas:`.

---

### Step 4. Does the HPA see CPU numbers?

**Why:** a number in TARGETS proves metrics reach the HPA.

```
k get hpa web -n shop
```
Columns: TARGETS `cpu: 0%/70%`, MINPODS `2`, MAXPODS `5`, REPLICAS `2`.

You see:
```
web   Deployment/web   cpu: 0%/70%   2   5   2   1m
```
**Means:** `<unknown>` in the first minute is normal. Run it again.

---

### Verify

**Why:** prove the window is saved.

```
k get hpa web -o jsonpath='{.spec.behavior.scaleDown.stabilizationWindowSeconds}' -n shop
```
You see:
```
30
```

---

### Three words first

- **HPA** = HorizontalPodAutoscaler. Sets the replica count by CPU use.
- **metrics-server** = the add-on that measures pod CPU.
- **Stabilization window** = how long the HPA waits before it removes pods.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `AlreadyExists` | an HPA `web` exists | fix it with `k edit hpa/web -n shop` |
| `<unknown>` after 2 min; `k top pod -n shop` fails | metrics-server missing or starting | run Part A again; the exam has it |
| vim reopens, error comment on top | a Tab or wrong indent | fix the 3 lines, `:wq` again |
| the question wants another HPA name | named after the Deployment | add `--name=<name>` in Step 2 |

---

## 33. ★ PriorityClass

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a PriorityClass named `high-priority` whose value is exactly ONE LESS than the highest existing user-defined PriorityClass.
> 2. Configure deployment `web` in namespace `shop` to use this PriorityClass.

**What the question is really saying:**

Highest non-system value minus 1; then name the class in the Deployment.

**Write down from the question:** class = `high-priority` · value = highest user-defined minus 1 · deployment = `web` in `shop`

---

### Think

- **Wanted:** a new class one below the top, used by `web`.
- **Look first:** the existing classes and values.
- **Expect:** two `system-` classes plus user-defined ones.
- **Fix:** create the class; set `priorityClassName`.
- **Prove:** new pods show the class and number.

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace shop --ignore-not-found
k delete priorityclass high-priority mid-prio low-prio --ignore-not-found
k create namespace shop
k create deployment web --image=nginx:1.27 -n shop
k create priorityclass mid-prio --value=1000
k create priorityclass low-prio --value=100
k rollout status deployment/web --timeout=120s -n shop
clear
k get priorityclass
```

---

### Step 1. Which user-defined class is highest?

**Why:** the new value depends on it. Classes have no namespace.

```
k get priorityclass
```
You see:
```
low-prio                  100          false   1m   ...
mid-prio                  1000         false   1m   ...   <-- highest
system-cluster-critical   2000000000   false   5h   ...   <-- ignore
system-node-critical      2000001000   false   5h   ...   <-- ignore
```
**Means:** highest user-defined = `1000`. One less = `999`.
**Don't:** count the `system-` classes.

---

### Step 2. Create the class

**Why:** the Deployment can only name a class that exists.

```
k create priorityclass high-priority --value=999
```
You see:
```
priorityclass.scheduling.k8s.io/high-priority created
```

---

### Step 3. Name the class in the Deployment

**Why:** the class goes in the pod template. Docs page: "Pod Priority and Preemption".

```
k edit deployment/web -n shop
```
The pod template's `spec:`, finished. New: the `priorityClassName:` line:
```
    spec:
      priorityClassName: high-priority
      containers:
      - image: nginx:1.27
        imagePullPolicy: IfNotPresent
        name: nginx
```
You see:
```
deployment.apps/web edited
```
**Means:** `priorityClassName:` starts in the same column as `containers:`.
**Don't:** use the first `spec:`. Use the second one.

---

### Step 4. Wait for the new pods

**Why:** priority is set at pod creation; pods are replaced.

```
k rollout status deployment/web -n shop
```
You see:
```
deployment "web" successfully rolled out
```

---

### Verify

**Why:** prove the pods carry the class.

```
k get pods -o custom-columns=NAME:.metadata.name,CLASS:.spec.priorityClassName,PRIO:.spec.priority -n shop
```
You see:
```
NAME      CLASS           PRIO
web-...   high-priority   999
```
**Means:** a `Terminating` pod may show `<none>`. Run it again.

---

### Three words first

- **PriorityClass** = an object holding a number. Higher is scheduled first.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| value `1999999999` | counted a `system-` class | `k delete priorityclass high-priority`, create again |
| no new pods; `k describe rs -n shop`: `no PriorityClass with name ...` | typo in the name | fix it in `k edit deployment/web -n shop` |
| the value cannot be changed | it is immutable | delete and create again |
| other pods got evicted | higher priority pushes out lower | expected |

---

## 34. ★ Share a node's resources between pods

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `shop`, deployment `web` runs `3` replicas, all on node `node01`. Set CPU and memory requests so that the three pods share the node's available resources equally. Leave roughly 10% headroom so the node stays stable. All 3 pods must be Running afterwards.

**What the question is really saying:**

Request per pod = free resources × 0.9 ÷ 3, for CPU and for memory.

**Write down from the question:** namespace = `shop` · deployment = `web` · 3 replicas · node = `node01` · 10% headroom

---

### Think

- **Wanted:** three equal requests, 10% left free.
- **Look first:** the node's Allocatable and Allocated resources.
- **Expect:** other pods already reserve some.
- **Fix:** free × 0.9 ÷ 3, rounded down.
- **Prove:** 3 pods Running; node near 90%.

### Time budget

Target 6 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace shop --ignore-not-found
k create namespace shop
cat <<EOF | k apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: shop
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      nodeSelector:
        kubernetes.io/hostname: node01
      containers:
      - name: nginx
        image: nginx:1.27
EOF
k rollout status deployment/web --timeout=120s -n shop
clear
k get pods -o wide -n shop
```

---

### Step 1. Take `web` out of the numbers

**Why:** then the node shows only OTHER pods' requests.

```
k scale deployment/web --replicas=0 -n shop
```
You see:
```
deployment.apps/web scaled
```

---

### Step 2. Read the node's two numbers

**Why:** free = offered minus reserved.

```
k describe node node01 | grep -A7 "Allocatable:"
k describe node node01 | grep -A6 "Allocated resources:"
```
Read `cpu` and `memory` twice: under Allocatable (offered) and in the Requests column (reserved). This is an example; your numbers differ.

You see:
```
Allocatable:
  cpu:                1
  ...
  memory:             1843756Ki
...
  Resource           Requests     Limits
  --------           --------     ------
  cpu                250m (25%)   0 (0%)
  memory             200Mi (11%)  0 (0%)
```
**Means:** CPU 1000m − 250m. Memory 1843756Ki − 200Mi.
**Don't:** take the Limits column. Use Requests.

---

### Step 3. Calculate

**Why:** the shell does the maths. `$(( ))` always rounds down.

```
echo $(( 1843756 / 1024 ))
echo $(( (1000 - 250) * 9 / 10 / 3 ))
echo $(( (1800 - 200) * 9 / 10 / 3 ))
```
You see:
```
1800  <-- memory Mi
225   <-- CPU/pod (m)
480   <-- mem/pod (Mi)
```
**Means:** CPU 750m × 0.9 ÷ 3 = 225m. Memory 1600Mi × 0.9 ÷ 3 = 480Mi.
**Don't:** copy these numbers. Use your own from Step 2.

---

### Step 4. Set the requests, bring the pods back

**Why:** the requests apply to every new pod.

```
k set resources deployment/web --requests=cpu=225m,memory=480Mi -n shop
k scale deployment/web --replicas=3 -n shop
```
You see:
```
deployment.apps/web resource requirements updated
deployment.apps/web scaled
```

---

### Verify

**Why:** prove all 3 fit, near 90%.

```
k get pods -o wide -n shop
k describe node node01 | grep -A6 "Allocated resources:"
```
Three pod lines like the first one, all on `node01`.

You see:
```
web-...   1/1   Running   0   20s   ...   node01
...
  cpu                925m (92%)    0 (0%)
  memory             1640Mi (91%)  0 (0%)
```

---

### Three words first

- **Allocatable** = the CPU and memory a node offers to pods in total.
- **Allocated resources** = what running pods already requested.
- **Request** = what one pod reserves.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| one pod `Pending`, Events: `Insufficient cpu` (or memory) | requests slightly too big | lower them 10%, repeat Step 4 |
| 2 containers per pod | `set resources` sets EVERY container | divide by 6, or name one container with `-c <name>` |
| the pod has init containers | the bigger of init or app requests counts | keep init requests at or below app requests |

---

## 35. ConfigMap and Secret in a pod

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`:
> 1. Create a ConfigMap named `app-cfg` with the key `LOG_LEVEL` and value `debug`.
> 2. Create a Secret named `db-sec` with the key `password` and value `s3cret`.
> 3. Create a pod named `api` with image `nginx:1.27`. All keys of the ConfigMap must be available as environment variables. The Secret must be mounted as files under `/etc/db`.

**What the question is really saying:**

Two one-line creates, then a pod YAML with `envFrom` and a Secret volume.

**Write down from the question:** namespace = `app` · ConfigMap = `app-cfg` (`LOG_LEVEL=debug`) · Secret = `db-sec` (`password=s3cret`) · pod = `api`, `nginx:1.27` · mount path = `/etc/db`

---

### Think

- **Wanted:** a ConfigMap, a Secret, and a pod that uses both.
- **Look first:** what already exists in `app`.
- **Expect:** only `kube-root-ca.crt` (every namespace has it).
- **Fix:** create both imperatively; pod YAML from dry-run plus two blocks.
- **Prove:** the variable and the file exist inside the pod.

### Time budget

Target 6 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace app --ignore-not-found
rm -f pod.yaml
k create namespace app
clear
k get configmaps,secrets -n app
```

---

### Step 1. Create the ConfigMap and the Secret

**Why:** both have a one-line create command. No YAML needed.

```
k create configmap app-cfg --from-literal=LOG_LEVEL=debug -n app
k create secret generic db-sec --from-literal=password=s3cret -n app
```
You see:
```
configmap/app-cfg created
secret/db-sec created
```
**Don't:** forget `generic`. `k create secret` alone needs a type.

---

### Step 2. Generate the pod YAML

**Why:** `--dry-run=client -o yaml` prints the YAML and creates nothing.

```
k run api --image=nginx:1.27 --dry-run=client -o yaml -n app > pod.yaml
cat pod.yaml
```
`resources:` shows the container level (4 spaces in). `dnsPolicy:` shows the pod level (2 spaces in).

You see:
```
...
spec:
  containers:
  - image: nginx:1.27
    name: api
    resources: {}
  dnsPolicy: ClusterFirst
...
```

---

### Step 3. Add envFrom and the Secret volume

**Why:** copy the blocks from the docs pages "Configure a Pod to Use a ConfigMap" and "Secrets".

```
vim pod.yaml
```
The finished file. New: the `envFrom:`, `volumeMounts:` and `volumes:` blocks:
```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: api
  name: api
  namespace: app
spec:
  containers:
  - image: nginx:1.27
    name: api
    resources: {}
    envFrom:
    - configMapRef:
        name: app-cfg
    volumeMounts:
    - name: db
      mountPath: /etc/db
  volumes:
  - name: db
    secret:
      secretName: db-sec
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```
**Means:** `envFrom` and `volumeMounts` sit at container level. `volumes` sits at pod level. The name `db` links them.
**Don't:** delete other lines your file has, like `status: {}`. They do no harm.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 4. Create the pod

**Why:** the file does nothing until the cluster has it.

```
k apply -f pod.yaml
k get pod api -n app
```
You see:
```
pod/api created
api   1/1   Running   0   10s
```

---

### Verify

**Why:** prove the variable and the file are inside the container.

```
k exec api -n app -- env | grep LOG_LEVEL
k exec api -n app -- cat /etc/db/password
```
The file has no newline at the end, so your prompt may follow `s3cret` on the same line.

You see:
```
LOG_LEVEL=debug
s3cret
```

---

### Three words first

- **ConfigMap** = plain settings stored as `KEY=VALUE`.
- **Secret** = the same, for sensitive values like passwords.
- **envFrom** = turns every key of a ConfigMap into an environment variable.
- **volumes + volumeMounts** = `volumes` names the storage; `volumeMounts` shows it at a path. Each key becomes a file.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| STATUS `CreateContainerConfigError` | the ConfigMap name in `envFrom` does not exist | `k describe pod api -n app` names it; delete the pod, fix, apply again |
| STATUS stays `ContainerCreating` | the Secret name in `volumes` does not exist | read Events in `k describe pod api -n app`; fix `secretName:` |
| `unknown field "spec.containers[0].volumes"` | `volumes:` is indented under the container | move it to the column of `containers:` |
| `Forbidden: pod updates may not change fields other than ...` | a pod's env and volumes cannot change | `k delete pod api -n app`, then apply again |
| the question wants ONE key only | different block | `env:` with `valueFrom:` / `configMapKeyRef:` (same docs page) |

---

## 36. ★ Taint, toleration, nodeSelector

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Taint node `node01` with `env=prod:NoSchedule`.
> 2. Label node `node01` with `env=prod`.
> 3. Create a pod named `x` with image `nginx:1.27` in namespace `default` that tolerates the taint and is scheduled on `node01`.

**What the question is really saying:**

Mark the node twice, then a pod YAML with a toleration and a nodeSelector.

**Write down from the question:** node = `node01` · taint = `env=prod:NoSchedule` · label = `env=prod` · pod = `x`, `nginx:1.27` · namespace = `default`

---

### Think

- **Wanted:** pod `x` running on the tainted `node01`.
- **Look first:** the taints on `node01`.
- **Expect:** `<none>` before you start.
- **Fix:** toleration (allowed there) + nodeSelector (sent there).
- **Prove:** the pod's NODE column says `node01`.

### Time budget

Target 5 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
k delete pod x --ignore-not-found
rm -f x.yaml
k taint nodes node01 env=prod:NoSchedule- || true
k label nodes node01 env-
clear
k describe node node01 | grep -i taints
```

---

### Step 1. Taint and label the node

**Why:** the taint keeps pods away; the label lets a pod pick this node.

```
k taint nodes node01 env=prod:NoSchedule
k label nodes node01 env=prod
```
You see:
```
node/node01 tainted
node/node01 labeled
```

---

### Step 2. Check both marks

**Why:** a typo here breaks the pod later.

```
k describe node node01 | grep -i taints
k get node node01 -L env
```
You see:
```
Taints:             env=prod:NoSchedule   <-- taint
NAME     STATUS   ROLES    AGE   VERSION   ENV
node01   Ready    <none>   ...   v1.35.x   prod   <-- label
```
**Means:** the node is ready for the pod.

---

### Step 3. Generate the pod YAML

**Why:** `--dry-run=client -o yaml` prints the YAML and creates nothing.

```
k run x --image=nginx:1.27 --dry-run=client -o yaml > x.yaml
grep -n containers x.yaml
```
The new blocks go above `containers:`, in the same column.

You see:
```
...  containers:
```

---

### Step 4. Add the toleration and the nodeSelector

**Why:** copy from the docs pages "Taints and Tolerations" and "Assign Pods to Nodes".

```
vim x.yaml
```
The finished file. New: the `nodeSelector:` and `tolerations:` blocks:
```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: x
  name: x
spec:
  nodeSelector:
    env: prod
  tolerations:
  - key: "env"
    operator: "Equal"
    value: "prod"
    effect: "NoSchedule"
  containers:
  - image: nginx:1.27
    name: x
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```
**Means:** the docs say `key1` and `value1`. Use the taint's `env` and `prod`.
**Don't:** skip `nodeSelector`. A toleration only allows; it does not send.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 5. Create the pod

**Why:** the file does nothing until the cluster has it.

```
k apply -f x.yaml
```
You see:
```
pod/x created
```

---

### Verify

**Why:** prove the pod runs on `node01`.

```
k get pod x -o wide
```
You see:
```
x   1/1   Running   0   15s   192.168.x.x   node01   ...   <-- NODE
```

---

### Three words first

- **Taint** = a mark on a node, `key=value:effect`. `NoSchedule`: no new pods, unless they tolerate it.
- **nodeSelector** = pod lines: "only put me on a node with this label".

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `Pending`, Events: `had untolerated taint {env: prod}` | key, value or effect differ from the taint | `k delete pod x`, fix `x.yaml`, apply again |
| `Pending`, Events: `didn't match Pod's node affinity/selector` | the node label is missing or different | `k label nodes node01 env=prod` |
| `already has env taint(s) with same effect(s)` | the taint is already there | nothing to do; check with Step 2 |
| `'env' already has a value` | the label is already there | add `--overwrite` only if the value is wrong |
| `unknown field "spec.containers[0].tolerations"` | the blocks are indented under the container | move them to the column of `containers:` |

---

## 37. Rolling update and rollback

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `shop`:
> 1. Update deployment `web` to image `nginx:1.28` and wait until the rollout is complete.
> 2. Then roll the deployment back to the previous revision.
> 3. Write the image that is in use after the rollback to `/root/image.txt`.

**What the question is really saying:**

Change the image, wait, undo, then save the current image to a file.

**Write down from the question:** namespace = `shop` · deployment = `web` · new image = `nginx:1.28` · file = `/root/image.txt`

---

### Think

- **Wanted:** update, roll back, then the image in a file.
- **Look first:** the container name and the current image.
- **Expect:** container `nginx`, image `nginx:1.27`.
- **Fix:** `set image`, `rollout status`, `rollout undo`, jsonpath into the file.
- **Prove:** the file says `nginx:1.27`.

### Time budget

Target 3 min. Skip at 6.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace shop --ignore-not-found
rm -f /root/image.txt
k create namespace shop
k create deployment web --image=nginx:1.27 --replicas=3 -n shop
k rollout status deployment/web --timeout=120s -n shop
clear
k get deployment web -o wide -n shop
```

---

### Step 1. What is the container called?

**Why:** `set image` needs the container name, not the deployment name.

```
k get deployment web -o wide -n shop
```
You see:
```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES       SELECTOR
web    3/3     3            3           1m    nginx        nginx:1.27   app=web   <-- nginx
```
**Means:** the container is `nginx`. The old image is `nginx:1.27`.

---

### Step 2. Update the image and wait

**Why:** `rollout status` waits until all new pods are ready.

```
k set image deployment/web nginx=nginx:1.28 -n shop
k rollout status deployment/web -n shop
```
You see:
```
deployment.apps/web image updated
Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...
...
deployment "web" successfully rolled out
```
**Don't:** write `web=nginx:1.28`. Left of `=` is the container name.

---

### Step 3. Roll back

**Why:** `undo` goes back to the previous revision.

```
k rollout history deployment/web -n shop
k rollout undo deployment/web -n shop
k rollout status deployment/web -n shop
```
You see:
```
REVISION  CHANGE-CAUSE
1         <none>
2         <none>  <-- 1.28
deployment.apps/web rolled back
deployment "web" successfully rolled out
```
**Don't:** run `undo` twice. The second one goes back to `nginx:1.28`.

---

### Step 4. Write the image into the file

**Why:** jsonpath prints one field and nothing else.

```
k get deployment web -o jsonpath='{.spec.template.spec.containers[0].image}' -n shop > /root/image.txt
cat /root/image.txt
```
Your prompt may follow on the same line.

You see:
```
nginx:1.27
```
**Means:** the rollback worked, and the file holds the answer.

---

### Verify

**Why:** prove all pods run the old image again.

```
k get deployment web -o wide -n shop
```
You see:
```
web    3/3     3            3           3m    nginx        nginx:1.27   app=web   <-- 1.27
```

---

### Three words first

- **Rolling update** = new pods replace old ones a few at a time. The app stays up.
- **Revision** = each change of the pod template gets a new number. Old ones are kept.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `rollout status` never finishes | the new image does not exist (typo) | `Ctrl+C`, check the tag, `k set image` again |
| `unable to find container named "web"` | deployment name left of `=` | use the CONTAINERS column from Step 1 |
| `/root/image.txt` is empty | a typo in the jsonpath | run it without `> /root/image.txt` first |
| the question wants revision 1 exactly | more than one step back | `k rollout undo deployment/web --to-revision=1 -n shop` |

---

# STORAGE (10% of the score) — Questions 38 to 40

**What this group is about:** giving pods storage that survives when the pod is deleted.

| Object | What it is |
|---|---|
| **PV (PersistentVolume)** | a disk. Belongs to the whole cluster; has NO namespace. |
| **PVC (PersistentVolumeClaim)** | a request for a disk. Lives in a namespace. A pod uses the PVC, never the PV directly. |
| **StorageClass** | a template that creates PVs automatically when a PVC asks. |

The chain is always: **Pod → PVC → PV**

A PVC is connected ("Bound") to a PV only if three values fit:
**storageClassName** the same.
**accessModes** the same.
The PV **at least as big** as the request.

All three questions need the docs.
There is no `k create pv`, `k create pvc` or `k create storageclass`.

---

## 38. PV + PVC + Pod (build the whole chain)

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a PersistentVolume named `pv-data`: capacity `1Gi`, access mode `ReadWriteOnce`, hostPath `/mnt/data`, storage class `manual`.
> 2. In namespace `storage`, create a PersistentVolumeClaim named `pvc-data` that requests `500Mi`, access mode `ReadWriteOnce`, storage class `manual`.
> 3. In namespace `storage`, create a pod named `web-store` with image `nginx:1.27` that mounts the claim at `/usr/share/nginx/html`.

**What the question is really saying:**

Build the chain Pod → PVC → PV, starting with the disk.

**Write down from the question:** PV = `pv-data`, 1Gi, `/mnt/data` · PVC = `pvc-data`, 500Mi · pod = `web-store`, `nginx:1.27`, `/usr/share/nginx/html` · namespace = `storage` · class = `manual` · mode = `ReadWriteOnce`

---

### Think

- **Wanted:** a pod that uses a claim that uses a disk.
- **Look first:** one docs page has all three files.
- **Expect:** the PVC shows `Bound` to `pv-data`.
- **Fix:** build right to left: PV, then PVC, then pod.
- **Prove:** pod Running; the PV is Bound to `storage/pvc-data`.

### Time budget

Target 8 min. Skip at 12.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace storage --ignore-not-found
k delete pv pv-data --ignore-not-found
rm -f pv.yaml pvc.yaml pod.yaml
k create namespace storage
clear
k get pv,pvc -n storage
```

---

### Step 1. Make the disk (PV)

**Why:** there is no `k create pv`. Copy `pv-volume.yaml` from the docs page "Configure a Pod to Use a PersistentVolume for Storage".

```
vim pv.yaml
```
The finished file. Only `name: pv-data` and `storage: 1Gi` differ from the docs:
```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  storageClassName: manual
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
```
```
k apply -f pv.yaml
k get pv
```
You see:
```
NAME      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   ...
pv-data   1Gi        RWO            Retain           Available           manual         ...   <-- free
```
**Means:** the disk exists. Also delete the docs' `labels:` and `type: local` lines.
**Don't:** add `namespace:`. A PV belongs to the whole cluster.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 2. Ask for the disk (PVC)

**Why:** a pod cannot use a PV directly. Copy `pv-claim.yaml` from the same page.

```
vim pvc.yaml
```
The finished file. Only `name:`, `namespace:` and `storage: 500Mi` differ from the docs:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
  namespace: storage
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
```
```
k apply -f pvc.yaml
k get pvc -n storage
```
You see:
```
NAME       STATUS   VOLUME    CAPACITY   ACCESS MODES   STORAGECLASS   ...
pvc-data   Bound    pv-data   1Gi        RWO            manual         ...   <-- Bound
```
**Means:** class and mode match, and 1Gi fits 500Mi. CAPACITY `1Gi` is correct: the claim gets the whole disk.
**Don't:** go on before you see `Bound`.

---

### Step 3. Give the claim to a pod

**Why:** copy `pv-pod.yaml` from the same page.

```
vim pod.yaml
```
The finished file. Only `name:`, `namespace:`, `claimName:` and `image:` differ from the docs:
```
apiVersion: v1
kind: Pod
metadata:
  name: web-store
  namespace: storage
spec:
  volumes:
    - name: task-pv-storage
      persistentVolumeClaim:
        claimName: pvc-data
  containers:
    - name: task-pv-container
      image: nginx:1.27
      ports:
        - containerPort: 80
          name: "http-server"
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: task-pv-storage
```
```
k apply -f pod.yaml
```
You see:
```
pod/web-store created
```
**Means:** `claimName` is the PVC's name. `task-pv-storage` only links `volumes` to `volumeMounts`.
**Don't:** rename `task-pv-storage` in one place only. Both must match.

---

### Verify

**Why:** prove the whole chain is connected.

```
k get pod web-store -n storage
k get pv pv-data
```
You see:
```
web-store   1/1   Running   0   30s
pv-data   1Gi   RWO   Retain   Bound   storage/pvc-data   manual   ...   <-- in use
```
**Don't:** panic at `ContainerCreating`. Wait a few seconds, run it again.

---

### Three words first

- **PV** = PersistentVolume, a disk for the whole cluster. No namespace.
- **PVC** = PersistentVolumeClaim, a request for a disk. It lives in a namespace.
- **storageClassName** = a group name. PV and PVC must have the same one to connect.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| PVC `Pending` | class or access mode differ, or the PVC asks for more than 1Gi | `k describe pvc pvc-data -n storage`; delete the PVC, fix `pvc.yaml`, apply again |
| PVC `Pending`, `pv-data` still `Available`; later Bound to `pvc-3f2a...` | `pvc.yaml` lost its `storageClassName` line, so the default class made a new disk | delete the pod and PVC, add `storageClassName: manual`, apply both |
| Pod `Pending`, Events: `persistentvolumeclaim "..." not found` | typo in `claimName`, or pod in another namespace | `k delete pod web-store -n storage`, fix `pod.yaml`, apply again |
| `manual` vs `Manual` | class names are case-sensitive | make them identical |
| re-apply fails with `Forbidden` | most PVC and pod fields cannot change after creation | delete the object, fix the file, apply again |

---

## 39. ★ StorageClass (create one and make it the default)

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a StorageClass named `fast` with provisioner `rancher.io/local-path` and volume binding mode `WaitForFirstConsumer`.
> 2. Make `fast` the default StorageClass.
> 3. No other StorageClass may be marked as default. Do not delete or modify anything else.

**What the question is really saying:**

Make `fast`, move the "default" mark to it, and take the mark off the old default.

**Write down from the question:** name = `fast` · provisioner = `rancher.io/local-path` · mode = `WaitForFirstConsumer` · must be the ONLY default

---

### Think

- **Wanted:** exactly one `(default)`, on `fast`.
- **Look first:** which class is the default now.
- **Expect:** `local-path (default)`.
- **Fix:** create `fast` with the mark "true"; patch the old one to "false".
- **Prove:** `k get storageclass` shows `(default)` next to `fast` only.

### Time budget

Target 5 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
k delete storageclass fast standard --ignore-not-found
rm -f sc.yaml
k patch storageclass local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
clear
k get storageclass
```

---

### Step 1. Who is the default now?

**Why:** you must take the mark off this class later.

```
k get storageclass
```
You see:
```
NAME                   PROVISIONER             ...
local-path (default)   rancher.io/local-path   ...   <-- old default
```
**Means:** the old default is `local-path`. A StorageClass has no namespace, so no `-n`.

---

### Step 2. Write the StorageClass

**Why:** there is no `k create storageclass`. Copy the example under "StorageClass objects" on the docs page "Storage Classes".

```
vim sc.yaml
```
The finished file. Only `name: fast`, the `is-default-class` annotation and `provisioner:` differ from the docs:
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: rancher.io/local-path
volumeBindingMode: WaitForFirstConsumer
```
**Means:** also delete `reclaimPolicy`, `allowVolumeExpansion`, `mountOptions` and `parameters`. The question did not ask for them.
**Don't:** drop the quotes around `"true"`. Annotation values must be text.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 3. Create it

**Why:** the file does nothing until the cluster has it.

```
k apply -f sc.yaml
k get storageclass
```
You see:
```
storageclass.storage.k8s.io/fast created
fast (default)         rancher.io/local-path   ...
local-path (default)   rancher.io/local-path   ...   <-- two defaults
```
**Means:** jobs 1 and 2 are done. Job 3 is still open.

---

### Step 4. Take the mark off the old default

**Why:** copy the patch from the docs page "Change the default StorageClass". Change only the class name.

```
k patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```
You see:
```
storageclass.storage.k8s.io/local-path patched
```
**Means:** only that one annotation changed. Nothing else on `local-path` was touched.
**Don't:** delete `local-path` to remove its mark. The question forbids it.

---

### Verify

**Why:** prove `fast` is the only default.

```
k get storageclass
```
You see:
```
NAME             PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ...
fast (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   ...   <-- only default
local-path       rancher.io/local-path   ...
```

---

### Three words first

- **StorageClass** = a template. A PVC asks, and Kubernetes makes a new PV from it.
- **provisioner** = the program that makes the disk. Copy it from the question.
- **WaitForFirstConsumer** = make the disk only when a pod uses the PVC. `Immediate` = make it at once.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| re-apply fails with `Forbidden` after a typo | `provisioner` and `volumeBindingMode` cannot change after creation | `k delete storageclass fast`, fix `sc.yaml`, apply again |
| `cannot unmarshal bool ... of type string` | `is-default-class: true` without quotes | write `"true"` |
| a test PVC stays `Pending` | normal with `WaitForFirstConsumer`: it waits for a pod | do not "fix" it |
| no `(default)` at all | you patched `fast` instead of the old class | patch `fast` back to `"true"` |
| you finished and want the playground as it was | `fast` is still the default | `k delete storageclass fast standard --ignore-not-found`, then `k patch storageclass local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'` |

---

## 40. ★ Reuse an existing PV (the MariaDB question)

### PART B. The exam starts here

**The question, as the exam words it:**

> A MariaDB deployment in namespace `mariadb` was deleted by accident. Its PersistentVolume still exists and holds the data.
> 1. Create a PersistentVolumeClaim named `mariadb` in namespace `mariadb`, with access mode `ReadWriteOnce` and `250Mi` of storage. It must bind to the existing PersistentVolume.
> 2. Edit `/root/mariadb-deploy.yaml` so the deployment uses this PVC.
> 3. Apply the file and make sure the deployment is running.

**What the question is really saying:**

Write a PVC that matches the old disk, then point the app at it.

**Write down from the question:** PVC name = `mariadb` · namespace = `mariadb` · mode = `ReadWriteOnce` · size = `250Mi` · file = `/root/mariadb-deploy.yaml`

---

### Think

- **Wanted:** Pod → new PVC → the OLD PV.
- **Look first:** the PV's size, access mode and class.
- **Expect:** `Available`, `250Mi`, `RWO`, empty class.
- **Fix:** a PVC with the same three values; `claimName: mariadb` in the file.
- **Prove:** pod Running; the PV is Bound to `mariadb/mariadb`.

### Time budget

Target 7 min. Skip at 10.

---

### PART A. Build the exam (Killercoda only)

```
k delete namespace mariadb --ignore-not-found
k delete pv mariadb-pv --ignore-not-found
rm -f pvc.yaml
k create namespace mariadb
cat <<EOF | k apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mariadb-pv
spec:
  capacity:
    storage: 250Mi
  accessModes:
  - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: ""
  hostPath:
    path: /mnt/mariadb
EOF
cat > /root/mariadb-deploy.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mariadb
  namespace: mariadb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mariadb
  template:
    metadata:
      labels:
        app: mariadb
    spec:
      containers:
      - name: mariadb
        image: mariadb:11
        env:
        - name: MARIADB_ROOT_PASSWORD
          value: secret
        volumeMounts:
        - name: data
          mountPath: /var/lib/mysql
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: ""
EOF
clear
k get pv mariadb-pv
```

---

### Step 1. Read the old disk

**Why:** a PVC never names the disk. It binds to a PV with the same class, mode and enough size.

```
k get pv
```
You see:
```
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   ...
mariadb-pv   250Mi      RWO            Retain           Available                          ...   <-- no class
```
**Means:** 250Mi, ReadWriteOnce, free, and no class. Your PVC must repeat these.

---

### Step 2. Write the PVC and bind it

**Why:** there is no `k create pvc`. Copy `pv-claim.yaml` from the docs page "Configure a Pod to Use a PersistentVolume for Storage".

```
vim pvc.yaml
```
The finished file. Only `name:`, `namespace:`, `storageClassName: ""` and `storage: 250Mi` differ from the docs:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mariadb
  namespace: mariadb
spec:
  storageClassName: ""
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 250Mi
```
```
k apply -f pvc.yaml
k get pvc -n mariadb
```
You see:
```
NAME      STATUS   VOLUME       CAPACITY   ACCESS MODES   ...
mariadb   Bound    mariadb-pv   250Mi      RWO            ...   <-- old disk
```
**Means:** `""` means "no class", exactly like the old disk.
**Don't:** delete the `storageClassName` line. The default class would make a new EMPTY disk.

Vim tip: type `:set paste` before you press `i` and paste. Save with `:wq`.

---

### Step 3. Point the app at the PVC

**Why:** `claimName` is the PVC's name. It is empty now.

```
vim /root/mariadb-deploy.yaml
```
Type `/claimName`, press Enter. Change `claimName: ""` to `claimName: mariadb`. Save.

```
grep claimName /root/mariadb-deploy.yaml
```
You see:
```
          claimName: mariadb
```
**Means:** one word changed. Touch nothing else in this file.

---

### Step 4. Start the app

**Why:** the deployment does not exist until you apply the file.

```
k apply -f /root/mariadb-deploy.yaml
```
You see:
```
deployment.apps/mariadb created
```

---

### Verify

**Why:** prove the app runs on the old disk.

```
k get pods -n mariadb
k get pv mariadb-pv
```
You see:
```
mariadb-...   1/1   Running   0   1m
mariadb-pv   250Mi   RWO   Retain   Bound   mariadb/mariadb   ...   <-- in use
```
**Don't:** panic at `ContainerCreating`. The image download can take a minute.

---

### Three words first

- **PV** = PersistentVolume, a disk for the whole cluster. Here it holds the database.
- **PVC** = PersistentVolumeClaim, a request for a disk. A pod uses a PVC, never a PV.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| PV STATUS `Released`, not `Available` | the PV still remembers its deleted PVC (`claimRef`) | `k patch pv mariadb-pv -p '{"spec":{"claimRef":null}}'`, then step 2 |
| PVC `Pending` | class, mode or size does not match the PV | `k describe pvc mariadb -n mariadb`; delete the PVC, fix `pvc.yaml`, apply again |
| VOLUME is a long name like `pvc-3f2a...` | `storageClassName: ""` was missing; a new empty disk was made | delete the PVC, fix the file, apply again |
| the PV's STORAGECLASS shows a name, e.g. `local-path` | the exam's disk has a class | use that exact name instead of `""` |
| pod `Pending`, `persistentvolumeclaim "..." not found` | typo in `claimName` | fix the file, apply again |

---

# READ ONCE, DO NOT DRILL

- **StatefulSet:** like a Deployment, but pods get fixed names (`db-0`, `db-1`). Each gets its own disk.
- **HA control plane:** several control plane nodes behind a load balancer.
- **Pod Security:** `k label namespace secure pod-security.kubernetes.io/enforce=restricted`
- **kubectl debug:** `k debug node/node01 -it --image=busybox:1.36` gives a shell on a node.
- **Quota:** `k create quota q --hard=pods=10,requests.cpu=2 -n NS`
- **Certificates:** `kubeadm certs check-expiration`, `kubeadm certs renew all`
- **Join a node:** on the control plane `kubeadm token create --print-join-command`; paste the output on the new node.
