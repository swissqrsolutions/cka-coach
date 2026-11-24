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

**Every kubectl command has the same shape:**
```
k   VERB   TYPE   NAME   -n NAMESPACE
```
"**get** the **pod** called **api** in namespace **app**" → `k get pod api -n app`

Short type names: `po` `deploy` `svc` `ns` `no`(node) `cm` `sa` `pv` `pvc` `sc` `netpol` `ing` `hpa` `pc` `ds` `crd` `ep`(endpoints)

---

# 3A. THINGS THAT HAVE A COMMAND

## LOOK. Always start here.

```
★ k get po -n NS                                  # status
★ k get po -n NS -o wide --show-labels            # + node, IP, labels
★ k describe po NAME -n NS                        # WHY? Read "Events" at the bottom
★ k logs NAME -n NS --previous                    # what the crashed container printed
★ k get ep SVC -n NS                              # does the Service have pods behind it?
  k logs NAME -c CONTAINER -n NS                  # one container of several
  k get po -A                                     # all namespaces
  k get all -n NS                                 # pods + services + deployments at once
  k get TYPE NAME -n NS -o yaml                   # the full object
  k get ev -n NS --sort-by=.lastTimestamp         # events, newest last
  k top po -A --sort-by=cpu        /  k top nodes # usage
  k explain pod.spec.tolerations                  # the manual for any field
  k api-resources | grep -i WORD                  # short name + "has a namespace?"
```
`get`, `describe`, `-o wide`, `-o yaml` work on every type.

## MAKE

```
★ k create ns NAME
★ k create deploy NAME --image=IMAGE --replicas=3 -n NS
★ k run POD --image=IMAGE -n NS                                     # add:  -- sleep 3600   for a command
★ k expose deploy NAME --name=SVC --port=80 --target-port=80 -n NS  # add:  --type=NodePort  if asked
★ k create cm NAME --from-literal=KEY=VALUE -n NS
★ k create secret generic NAME --from-literal=KEY=VALUE -n NS
★ k create sa NAME -n NS
★ k create role NAME --verb=get,list --resource=pods -n NS
★ k create rolebinding NAME --role=ROLE --serviceaccount=NS:SA -n NS
  k create clusterrole NAME --verb=get,list --resource=nodes
  k create clusterrolebinding NAME --clusterrole=CR --serviceaccount=NS:SA
  k create rolebinding NAME --clusterrole=CR --user=USER -n NS      # a ClusterRole, limited to one namespace
  k create ingress NAME --class=CLASS --rule="HOST/*=SVC:PORT" -n NS        # with TLS:  ...=SVC:PORT,tls=SECRET
  k create pc NAME --value=1000                                     # PriorityClass
  k autoscale deploy NAME --min=2 --max=5 --cpu-percent=70 -n NS    # HPA
  k create secret tls NAME --cert=FILE.crt --key=FILE.key -n NS
★ k run POD --image=IMAGE -n NS --dry-run=client -o yaml > pod.yaml # write the YAML, create nothing
  k create deploy D --image=IMAGE --dry-run=client -o yaml > d.yaml
```

## CHANGE

```
★ k edit deploy NAME -n NS                          # change ANYTHING. Opens vim. Save = applied.
★ k set image deploy/NAME CONTAINER=IMAGE -n NS
★ k set resources deploy NAME --requests=cpu=100m,memory=128Mi -n NS        # add --limits=... if asked
★ k scale deploy NAME --replicas=3 -n NS
★ k rollout undo deploy/NAME -n NS                  # back one version.  --to-revision=N for a specific one
★ k rollout restart deploy/NAME -n NS               # new pods (after a ConfigMap change)
  k rollout status deploy/NAME -n NS                # wait until finished
  k rollout history deploy/NAME -n NS
  k set selector svc NAME app=VALUE -n NS           # fix a Service that finds no pods
  k set env deploy/NAME --from=configmap/CM -n NS
★ k apply -f file.yaml                              # create or update from your file
  k apply -k FOLDER                                 # a kustomize folder.  Preview: k kustomize FOLDER
  k label node NODE key=value                       # remove:  k label node NODE key-
  k taint node NODE key=value:NoSchedule            # remove:  same line + "-" at the very end
  k cordon NODE  /  k uncordon NODE
  k drain NODE --ignore-daemonsets --delete-emptydir-data
```
If you forget a `set` command, `k edit` always works.

## DELETE

```
★ k delete TYPE NAME -n NS
  k delete po NAME -n NS --force --grace-period=0   # do not wait 30 seconds
  k delete -f file.yaml
  k replace --force -f file.yaml                    # delete + create in one step (for fields that cannot be edited)
```

## TEST. Prove it before you move on.

```
★ k exec POD -n NS -- wget -qO- -T 3 SVC                            # capital O, not zero
★ k auth can-i VERB TYPE -n NS --as=system:serviceaccount:NS:SA
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
  k -n kube-system get pod -l component=kube-controller-manager -o yaml | grep cluster-cidr
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
Check: `k get sc` → `(default)` next to one name only.

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
Find the labels first: `k get po -n NS --show-labels`.
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
Read the values from the old Ingress first: `k get ing NAME -n NS -o yaml` (host, TLS secret, path, service, port) and `k get gatewayclass`.
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
`k get deploy NAME -n NS -o yaml > d.yaml`, edit, `k apply -f d.yaml`. Add 3 pieces under `spec.template.spec`:
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
Check: `k get po -n NS` → `2/2`. `k logs deploy/NAME -c log-shipper -n NS`.

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
k create deploy agent --image=nginx:1.27 --dry-run=client -o yaml > ds.yaml
vim ds.yaml        # kind: Deployment -> DaemonSet.  Delete the lines "replicas: 1" and "strategy: {}"
k apply -f ds.yaml

ssh node01
kubectl run static-web --image=nginx:1.27 --dry-run=client -o yaml > /etc/kubernetes/manifests/static-web.yaml
exit               # the kubelet starts every file in that folder. To remove the pod: delete the file.
```

## Text you edit inside a ConfigMap
```
k edit cm coredns -n kube-system             # inside ".:53 {" add:   rewrite name OLD.NAME SVC.NS.svc.cluster.local
k rollout restart deploy coredns -n kube-system

k edit cm nginx-config -n NS                 # ssl_protocols TLSv1.2 TLSv1.3;   ->   ssl_protocols TLSv1.3;
k rollout restart deploy NAME -n NS
```
Backup first: `k get cm NAME -n NS -o yaml > /root/backup.yaml`

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
| `run=NAME` / `app=NAME` | label of a pod from `k run` / from `k create deploy` |
| `k8s-app=kube-dns` | label of the CoreDNS pods |
| `100m` | a tenth of a CPU. `100` without `m` = one hundred CPUs |
| `Bound` / `Available` / `Released` | PVC connected / PV free / PV still remembers an old PVC (`k edit pv`, delete `claimRef:`) |

| Status | First command |
|---|---|
| `ImagePullBackOff` | `k describe po` → `k set image` |
| `CrashLoopBackOff` | `k logs --previous` → `k describe po` → `k edit deploy` |
| `Pending` with Events | `k describe po` → fix what Events names |
| `Pending`, Events empty | `k get po -n kube-system` → fix the scheduler's file |
| Node `NotReady` | `ssh` → `systemctl status kubelet` → `journalctl -u kubelet` |
| Service no answer | `k get ep`: `<none>` → `k set selector`. IP there → `k edit svc` (targetPort) |
| Service fine, timeout | `k get netpol` → add an allow policy |
| names do not resolve | `k get po -n kube-system -l k8s-app=kube-dns` |

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
k create ns drill
k create deploy web --image=nginx:1.27 --replicas=2 -n drill
k get po -n drill -o wide --show-labels
k expose deploy web --name=web-svc --port=80 --target-port=80 -n drill
k get ep web-svc -n drill
k set image deploy/web nginx=nginx:1.28 -n drill
k rollout undo deploy/web -n drill
k scale deploy web --replicas=3 -n drill
k describe po -n drill | grep -A5 Events
k delete ns drill
```

---

# 3E. RECOGNISE THE QUESTION

Read the question once. Find the trigger words. Jump to the row.
The first command is the same every time. Run it before you think further.

**Something is broken**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "ImagePullBackOff", "ErrImagePull", "not Running" | wrong image name or tag | `k describe po <pod> -n NS` (Events) | 1 |
| "keeps restarting", "CrashLoopBackOff" | the container command fails | `k logs <pod> -n NS --previous` | 2 |
| "Pending", a CPU or memory number | the request does not fit any node | `k describe po <pod> -n NS` (Events: `Insufficient cpu`) | 3 |
| "Pending", "other pods are fine" | the scheduler is down | `k get po -n kube-system` | 9 |
| "NotReady", "survive a reboot" | kubelet stopped and disabled | `ssh node01` → `systemctl status kubelet` | 4 |
| "NotReady", no reboot words | kubelet config is wrong | `ssh node01` → `journalctl -u kubelet -n 30` | 5 |
| "kubectl commands fail", "after a configuration change" | API server manifest is broken | `crictl ps -a` (on the control plane) | 8 |
| "cannot reach service", nothing about ports | Service selector is wrong | `k get ep SVC -n NS` → `<none>` | 6 |
| "cannot reach service", "listens on port 80" | Service targetPort is wrong | `k get ep SVC -n NS` → IP shown, wrong port | 7 |
| "cannot reach", "NetworkPolicy", "ONLY pod X" | a deny policy, no allow policy | `k get netpol -n NS` | 10 |
| "cannot resolve", "by IP still works" | CoreDNS is down | `k get po -n kube-system -l k8s-app=kube-dns` | 11 |

**Write something to a file**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "logs … to the file", "uses the most CPU" | logs and usage | `k logs api -n app > /opt/api.log` | 12 |
| "list of all … CRDs", "documentation of the field" | read the API | `k get crd` | 18 |
| "temporary pod", "look up the DNS name" | DNS across namespaces | `k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup SVC.NS` | 30 |
| "roll back", "write the image … to" | rollout history | `k rollout undo deploy/web -n shop` | 37 |

**Permissions, packages, cluster admin**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "ServiceAccount", "Role", "RoleBinding", one namespace | namespaced RBAC | `k create sa NAME -n NS` | 13 |
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
| "NodePort", "node port 30080" | expose, then set nodePort | `k edit deploy np -n web` (containerPort) | 23 |
| "Ingress", "host", "path … Prefix" | one imperative line | `k get ingressclass` | 24 |
| "Gateway", "HTTPRoute", "migrate", "Ingress" | rebuild the Ingress as Gateway | `k get ing web-ing -n web -o yaml` | 25 |
| "accept … ONLY from pods with label", "port" | allow policy | `k get po -n NS --show-labels` | 26 |
| "blocks all incoming and all outgoing", "DNS … must still work" | default deny + DNS egress | docs "Network Policies" | 27 |

**Configuration**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "TLSv1.3", "ConfigMap", "running pods use the new configuration" | edit cm, restart | `k get cm nginx-config -n nginx-static -o yaml` | 28 |
| "resolves to the service", "cluster DNS" | CoreDNS rewrite | `k get cm coredns -n kube-system -o yaml` | 29 |
| "environment variables", "mounted as files", "Secret" | cm + secret in a pod | `k create cm app-cfg --from-literal=LOG_LEVEL=debug -n app` | 35 |

**Workloads and scheduling**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "sidecar", "shared volume", "tail -f" | add a container | `k get deploy app -n work -o yaml > app.yaml` | 31 |
| "HorizontalPodAutoscaler", "stabilization window" | autoscale, then edit behavior | `k autoscale deploy web --min=2 --max=5 --cpu-percent=70 -n shop` | 32 |
| "PriorityClass", "one less than the highest" | look up, then create | `k get pc` | 33 |
| "share … equally", "headroom", "requests" | resources from node numbers | `k describe node node01` (Allocatable) | 34 |
| "Taint", "tolerates", "scheduled on node01" | taint + label + toleration | `k taint node node01 env=prod:NoSchedule` | 36 |
| "update … to image", "roll back to the previous revision" | rollout | `k set image deploy/web nginx=nginx:1.28 -n shop` | 37 |

**Storage**

| Trigger words in the question | Pattern | First command | Q |
|---|---|---|---|
| "PersistentVolume", "hostPath", "mounts the claim" | build PV → PVC → pod | docs "Configure a Pod to Use a PersistentVolume for Storage" | 38 |
| "StorageClass", "default", "WaitForFirstConsumer" | new default class | `k get sc` | 39 |
| "deleted by accident", "PersistentVolume still exists", "bind to the existing" | PVC that matches the old PV | `k get pv` | 40 |

**Questions that look the same. One command tells them apart:**

| You read | Run | Result → question |
|---|---|---|
| "cannot reach service" | `k get ep SVC -n NS` | `<none>` → Q6 · IP shown → Q7 · IP shown and a NetworkPolicy exists → Q10 |
| "Pending" | `k describe po <pod> -n NS` | Events say `Insufficient` → Q3 · Events empty → Q9 |
| "NotReady" | `systemctl status kubelet` (on the node) | `inactive (dead)` → Q4 · `activating (auto-restart)` → Q5 |

> Check: `k get ep` still works on v1.35, with a warning. Endpoints is deprecated since v1.33. The newer command is `k get endpointslices -n NS -l kubernetes.io/service-name=SVC`.


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
k delete ns app --ignore-not-found
k create ns app
k create deploy api --image=nginx:doesnotexist -n app
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
Warning  Failed  ...  Failed to pull image "nginx:doesnotexist": ... not found   <-- the cause
```
**Means:** the tag `doesnotexist` does not exist.

---

### Step 3. What is the container called?

**Why:** `k set image` needs the container name, not the deployment name.

```
k get deploy api -n app -o wide
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
k set image deploy/api nginx=nginx:1.27 -n app
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
k rollout status deploy/api -n app
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
- **Container name** = the name inside the pod. Not the deployment name.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|u|n|a|b|l|e| |t|o| |f|i|n|d| |c|o|n|t|a|i|n|e|r| |n|a|m|e|d| |"|a|p|i|"|`| ||| |d|e|p|l|o|y|m|e|n|t| |n|a|m|e| |l|e|f|t| |o|f| |`|=|`| ||| |u|s|e| |t|h|e| |c|o|n|t|a|i|n|e|r| |n|a|m|e| |(|`|n|g|i|n|x|`|)| |||
||| |s|t|i|l|l| |`|I|m|a|g|e|P|u|l|l|B|a|c|k|O|f|f|`| ||| |t|y|p|o| |i|n| |t|h|e| |n|e|w| |i|m|a|g|e| ||| |r|u|n| |`|d|e|s|c|r|i|b|e|`| |a|g|a|i|n|,| |f|i|x| |t|h|e| |t|y|p|o| |||
||| |E|v|e|n|t|s| |s|a|y| |`|p|u|l|l| |a|c|c|e|s|s| |d|e|n|i|e|d|`| |o|r| |`|r|e|p|o|s|i|t|o|r|y| |d|o|e|s| |n|o|t| |e|x|i|s|t|`| ||| |t|h|e| |i|m|a|g|e| |N|A|M|E| |i|s| |w|r|o|n|g|,| |n|o|t| |t|h|e| |t|a|g| ||| |f|i|x| |t|h|e| |n|a|m|e|,| |e|.|g|.| |`|n|g|n|i|x|`| |t|o| |`|n|g|i|n|x|`| |||
||| |f|i|x|e|d| |p|o|d|,| |n|e|w| |p|o|d| |b|r|e|a|k|s| |a|g|a|i|n| ||| |y|o|u| |r|a|n| |`|k| |e|d|i|t| |p|o|d|`| ||| |f|i|x| |t|h|e| |d|e|p|l|o|y|m|e|n|t| |w|i|t|h| |`|k| |s|e|t| |i|m|a|g|e|`| |||
||| |o|l|d| |p|o|d| |s|h|o|w|s| |t|h|e| |e|r|r|o|r| |a| |f|e|w| |s|e|c|o|n|d|s| ||| |i|t| |i|s| |b|e|i|n|g| |r|e|p|l|a|c|e|d| ||| |w|a|i|t|,| |r|u|n| |`|k| |g|e|t| |p|o|d|s| |-|n| |a|p|p|`| |a|g|a|i|n| |||

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
k delete ns app --ignore-not-found
k create ns app
k create deploy api --image=busybox:1.36 -n app -- sh -c "exit 1"
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
k logs <pod-name> -n app --previous
```
You see:
```
(no output)      <-- exit 1 prints nothing
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
      exit 1             <-- the command
    ...
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1    <-- non-zero = failed
```
**Means:** the command stops at once with an error.

---

### Step 4. Fix the command

**Why:** fix the deployment. It makes a new pod.

```
k edit deploy api -n app
```
In vim, type `/exit 1`, Enter. Press `C`, type `sleep 3600`, `Esc`, `:wq`.

```yaml
      - command:
        - sh
        - -c
        - sleep 3600      # <-- CHANGE
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
k rollout status deploy/api -n app
k get pods -n app
```
You see:
```
deployment "api" successfully rolled out
api-7f9b8c6d5-k4m2p   1/1   Running   0   25s   <-- RESTARTS 0
```
**Don't:** stop here. Wait 20 s, run `k get pods` again. RESTARTS must stay `0`.

---

### Three words first

- **Exit code** = the number a command returns. `0` = OK. Anything else = error.
- **CrashLoopBackOff** = it starts, stops, restarts. Kubernetes waits longer each time.
- **`--previous`** = logs of the container that just stopped.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|p|r|e|v|i|o|u|s| |t|e|r|m|i|n|a|t|e|d| |c|o|n|t|a|i|n|e|r| |.|.|.| |n|o|t| |f|o|u|n|d|`| ||| |n|o| |r|e|s|t|a|r|t| |y|e|t| ||| |w|a|i|t| |2|0| |s|,| |t|r|y| |a|g|a|i|n| |||
||| |v|i|m| |r|e|o|p|e|n|s| |w|i|t|h| |`|#| |E|r|r|o|r|:|`| |l|i|n|e|s| ||| |t|h|e| |e|d|i|t| |b|r|o|k|e| |t|h|e| |Y|A|M|L| |i|n|d|e|n|t|a|t|i|o|n| ||| |f|i|x| |i|t|,| |o|r| |`|:|q|!|`| |a|n|d| |r|u|n| |`|k| |p|a|t|c|h| |d|e|p|l|o|y| |a|p|i| |-|n| |a|p|p| |-|-|t|y|p|e|=|j|s|o|n| |-|p|=|'|[|{|"|o|p|"|:|"|r|e|p|l|a|c|e|"|,|"|p|a|t|h|"|:|"|/|s|p|e|c|/|t|e|m|p|l|a|t|e|/|s|p|e|c|/|c|o|n|t|a|i|n|e|r|s|/|0|/|c|o|m|m|a|n|d|"|,|"|v|a|l|u|e|"|:|[|"|s|h|"|,|"|-|c|"|,|"|s|l|e|e|p| |3|6|0|0|"|]|}|]|'|`| |||
||| |`|F|o|r|b|i|d|d|e|n|:| |p|o|d| |u|p|d|a|t|e|s| |m|a|y| |n|o|t| |c|h|a|n|g|e| |f|i|e|l|d|s|.|.|.|`| ||| |y|o|u| |r|a|n| |`|k| |e|d|i|t| |p|o|d|`| ||| |`|k| |e|d|i|t| |d|e|p|l|o|y| |a|p|i| |-|n| |a|p|p|`| |||
||| |d|e|s|c|r|i|b|e| |s|a|y|s| |`|R|e|a|s|o|n|:| |O|O|M|K|i|l|l|e|d|`| ||| |m|e|m|o|r|y| |l|i|m|i|t| |t|o|o| |s|m|a|l|l| ||| |`|k| |s|e|t| |r|e|s|o|u|r|c|e|s| |d|e|p|l|o|y| |a|p|i| |-|n| |a|p|p| |-|-|l|i|m|i|t|s|=|m|e|m|o|r|y|=|<|v|a|l|u|e|>|`| |||
||| |`|N|o| |r|e|s|o|u|r|c|e|s| |f|o|u|n|d|`| ||| |f|o|r|g|o|t| |`|-|n| |a|p|p|`| ||| |a|d|d| |`|-|n| |a|p|p|`| |||

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
k delete ns app --ignore-not-found
k create ns app
k create deploy api --image=nginx:1.27 -n app
k rollout status deploy/api -n app --timeout=120s
k set resources deploy api -n app --requests=cpu=100
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
api-7b9c8d5f4-zq8mn    0/1   Pending   0   20s   <-- copy this name
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
Warning  FailedScheduling  ...  0/2 nodes are available: ... Insufficient cpu ...   <-- the cause
```
**Means:** no node has enough free CPU. Ignore the taint and `preemption:` parts.

---

### Step 3. How much CPU does it ask for?

**Why:** the deployment holds the request. That is what you fix.

```
k get deploy api -n app -o yaml | grep -A 1 requests
```
You see:
```
          requests:
            cpu: "100"   <-- 100 whole CPUs
```
**Means:** `100` is 100 CPUs. The question wants `100m`.

---

### Step 4. Fix the request

**Why:** fix the deployment. It makes a new pod.

```
k set resources deploy api -n app --requests=cpu=100m
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
k rollout status deploy/api -n app
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |n|o| |`|F|a|i|l|e|d|S|c|h|e|d|u|l|i|n|g|`| |i|n| |d|e|s|c|r|i|b|e| ||| |y|o|u| |d|e|s|c|r|i|b|e|d| |t|h|e| |R|u|n|n|i|n|g| |p|o|d| ||| |d|e|s|c|r|i|b|e| |t|h|e| |`|P|e|n|d|i|n|g|`| |o|n|e| |||
||| |a| |n|e|w| |p|o|d| |i|s| |P|e|n|d|i|n|g| |a|f|t|e|r| |y|o|u| |d|e|l|e|t|e|d| |o|n|e| ||| |t|h|e| |d|e|p|l|o|y|m|e|n|t| |r|e|-|c|r|e|a|t|e|s| |i|t| ||| |f|i|x| |t|h|e| |d|e|p|l|o|y|m|e|n|t|,| |n|o|t| |t|h|e| |p|o|d| |||
||| |`|m|u|s|t| |b|e| |l|e|s|s| |t|h|a|n| |o|r| |e|q|u|a|l| |t|o| |c|p|u| |l|i|m|i|t|`| ||| |y|o|u| |s|e|t| |`|-|-|l|i|m|i|t|s|`|,| |n|o|t| |`|-|-|r|e|q|u|e|s|t|s|`| ||| |u|s|e| |`|-|-|r|e|q|u|e|s|t|s|=|c|p|u|=|1|0|0|m|`| |||
||| |E|v|e|n|t|s|:| |`|h|a|d| |u|n|t|o|l|e|r|a|t|e|d| |t|a|i|n|t|`| |o|n| |e|v|e|r|y| |n|o|d|e| ||| |a| |t|a|i|n|t| |b|l|o|c|k|s| |t|h|e| |p|o|d| ||| |q|u|e|s|t|i|o|n| |3|6| |||
||| |E|v|e|n|t|s|:| |`|d|i|d|n|'|t| |m|a|t|c|h| |P|o|d|'|s| |n|o|d|e| |a|f|f|i|n|i|t|y|/|s|e|l|e|c|t|o|r|`| ||| |t|h|e| |p|o|d| |w|a|n|t|s| |a| |n|o|d|e| |l|a|b|e|l| |n|o|n|e| |h|a|s| ||| |f|i|x| |`|n|o|d|e|S|e|l|e|c|t|o|r|:|`| |i|n| |`|k| |e|d|i|t| |d|e|p|l|o|y| |a|p|i| |-|n| |a|p|p|`| |||

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
  Ready   Unknown   ...   NodeStatusUnknown   Kubelet stopped posting node status.   <-- the hint
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
     Active: inactive (dead) since ...                                         <-- stopped
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
active      <-- running now
enabled     <-- survives a reboot
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
root@controlplane:~#   <-- back
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|T|h|e| |c|o|n|n|e|c|t|i|o|n| |t|o| |t|h|e| |s|e|r|v|e|r| |l|o|c|a|l|h|o|s|t|:|8|0|8|0| |w|a|s| |r|e|f|u|s|e|d|`| ||| |y|o|u| |r|a|n| |k|u|b|e|c|t|l| |o|n| |n|o|d|e|0|1| ||| |`|e|x|i|t|`|,| |r|u|n| |i|t| |a|g|a|i|n| |||
||| |k|u|b|e|l|e|t| |a|l|r|e|a|d|y| |`|a|c|t|i|v|e| |(|r|u|n|n|i|n|g|)|`| |b|e|f|o|r|e| |t|h|e| |f|i|x| ||| |y|o|u| |a|r|e| |o|n| |t|h|e| |c|o|n|t|r|o|l| |p|l|a|n|e| ||| |`|e|x|i|t|`|,| |t|h|e|n| |`|s|s|h| |n|o|d|e|0|1|`| |||
||| |`|A|c|t|i|v|e|:| |a|c|t|i|v|a|t|i|n|g| |(|a|u|t|o|-|r|e|s|t|a|r|t|)|`| |a|f|t|e|r| |s|t|a|r|t|i|n|g| ||| |t|h|e| |k|u|b|e|l|e|t| |i|s| |m|i|s|c|o|n|f|i|g|u|r|e|d| ||| |q|u|e|s|t|i|o|n| |5| |||
||| |k|u|b|e|l|e|t| |`|a|c|t|i|v|e| |(|r|u|n|n|i|n|g|)|`|,| |n|o|d|e| |s|t|a|y|s| |N|o|t|R|e|a|d|y| ||| |t|h|e| |c|o|n|t|a|i|n|e|r| |r|u|n|t|i|m|e| |i|s| |s|t|o|p|p|e|d| ||| |o|n| |n|o|d|e|0|1|:| |`|s|y|s|t|e|m|c|t|l| |e|n|a|b|l|e| |-|-|n|o|w| |c|o|n|t|a|i|n|e|r|d|`| |||
||| |`|t|i|m|e|d| |o|u|t| |w|a|i|t|i|n|g| |f|o|r| |t|h|e| |c|o|n|d|i|t|i|o|n|`| ||| |t|h|e| |k|u|b|e|l|e|t| |n|e|e|d|s| |m|o|r|e| |t|i|m|e|,| |o|r| |f|a|i|l|e|d| ||| |`|k| |g|e|t| |n|o|d|e|s|`| |a|g|a|i|n|;| |o|n| |n|o|d|e|0|1| |c|h|e|c|k| |`|s|y|s|t|e|m|c|t|l| |s|t|a|t|u|s| |k|u|b|e|l|e|t| |-|-|n|o|-|p|a|g|e|r|`| |||

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
     Active: activating (auto-restart) (Result: exit-code) since ...   <-- starts, fails, again
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
kubelet.service: Failed at step EXEC spawning /usr/local/bin/kubelet: No such file or directory   <-- the cause
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
/usr/bin/kubelet                                                    <-- the real program
...
# /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf         <-- the file to fix
ExecStart=
ExecStart=/usr/local/bin/kubelet $KUBELET_KUBECONFIG_ARGS ...       <-- wrong path
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
- **journalctl** = shows a service's log: WHY it fails.
- **daemon-reload** = tells systemd to read changed service files again.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|W|a|r|n|i|n|g|:| |T|h|e| |u|n|i|t| |f|i|l|e| |.|.|.| |c|h|a|n|g|e|d| |o|n| |d|i|s|k|`| ||| |n|o| |`|d|a|e|m|o|n|-|r|e|l|o|a|d|`| ||| |`|s|y|s|t|e|m|c|t|l| |d|a|e|m|o|n|-|r|e|l|o|a|d|`|,| |t|h|e|n| |r|e|s|t|a|r|t| |||
||| |`|i|n|a|c|t|i|v|e| |(|d|e|a|d|)|`| |i|n| |S|t|e|p| |1| ||| |k|u|b|e|l|e|t| |o|n|l|y| |s|t|o|p|p|e|d| ||| |q|u|e|s|t|i|o|n| |4|:| |`|s|y|s|t|e|m|c|t|l| |s|t|a|r|t| |k|u|b|e|l|e|t|`| |||
||| |l|o|g| |s|a|y|s| |`|f|a|i|l|e|d| |t|o| |l|o|a|d| |k|u|b|e|l|e|t| |c|o|n|f|i|g| |f|i|l|e|`| ||| |b|a|d| |`|/|v|a|r|/|l|i|b|/|k|u|b|e|l|e|t|/|c|o|n|f|i|g|.|y|a|m|l|`| ||| |f|i|x| |t|h|a|t| |f|i|l|e|,| |r|e|s|t|a|r|t| |k|u|b|e|l|e|t| |||
||| |`|l|o|c|a|l|h|o|s|t|:|8|0|8|0| |w|a|s| |r|e|f|u|s|e|d|`| ||| |y|o|u| |r|a|n| |`|k|`| |o|n| |n|o|d|e|0|1| ||| |`|e|x|i|t|`| |f|i|r|s|t| |||
||| |l|i|n|e| |l|o|o|k|s| |w|r|o|n|g| |a|f|t|e|r| |`|6|x|`| ||| |c|u|r|s|o|r| |w|a|s| |e|l|s|e|w|h|e|r|e| ||| |p|r|e|s|s| |`|u|`| |t|o| |u|n|d|o| |||

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
k delete ns web --ignore-not-found
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k create svc clusterip backend-svc --tcp=80:80 -n web
k run client --image=busybox:1.36 -n web -- sleep 3600
k rollout status deploy/backend -n web --timeout=120s
k wait --for=condition=Ready pod/client -n web --timeout=120s
clear
k get endpoints backend-svc -n web
```

---

### Step 1. Does the Service find pods?

**Why:** a Service sends traffic to its endpoints, the pods it found.

```
k get ep backend-svc -n web
```
You see:
```
Warning: v1 Endpoints is deprecated in v1.33+; ...   <-- normal, ignore
backend-svc   <none>
```
**Means:** no pods: wrong selector, or pods not Ready.

---

### Step 2. What label does the Service want?

**Why:** the selector is the label the Service looks for.

```
k get svc backend-svc -n web -o wide
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
k get po -n web --show-labels
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
k set selector svc backend-svc app=backend -n web
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
| still `<none>` after `k edit svc` | you changed `metadata.labels`, not `spec.selector` | use `k set selector` |
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
k delete ns web --ignore-not-found
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 --target-port=8080 -n web
k run client --image=busybox:1.36 -n web -- sleep 3600
k rollout status deploy/backend -n web --timeout=120s
k wait --for=condition=Ready pod/client -n web --timeout=120s
clear
k get endpoints backend-svc -n web
```

---

### Step 1. Does the Service find pods?

**Why:** endpoints show the pods AND the port the Service sends to.

```
k get ep backend-svc -n web
```
You see:
```
Warning: v1 Endpoints is deprecated in v1.33+; ...   <-- normal, ignore
backend-svc   192.168.1.5:8080   1m                   <-- IP is there, port 8080
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
wget: can't connect to remote host (10.96.x.x): Connection refused   <-- nobody on 8080
command terminated with exit code 1
```
**Means:** traffic reaches the pod, but no program answers there.

---

### Step 3. Which port is wrong?

**Why:** a Service has two ports. Find the wrong one.

```
k describe svc backend-svc -n web
```
You see:
```
Port:              <unset>  80/TCP     <-- correct, clients call 80
TargetPort:        8080/TCP            <-- wrong, nginx listens on 80
Endpoints:         192.168.1.5:8080
```
**Means:** only `targetPort` must change.

---

### Step 4. Fix the targetPort

**Why:** edit the Service in place. Do not recreate it.

```
k edit svc backend-svc -n web
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|w|g|e|t|:| |d|o|w|n|l|o|a|d| |t|i|m|e|d| |o|u|t|`| |i|n| |S|t|e|p| |2| ||| |y|o|u|r| |n|e|t|w|o|r|k| |p|l|u|g|-|i|n| |d|r|o|p|s| |i|n|s|t|e|a|d| |o|f| |r|e|f|u|s|e|s| ||| |s|a|m|e| |m|e|a|n|i|n|g|,| |g|o| |o|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |d|o|e|s| |n|o|t| |n|a|m|e| |t|h|e| |a|p|p|'|s| |p|o|r|t| ||| |y|o|u| |m|u|s|t| |f|i|n|d| |i|t| ||| |`|k| |d|e|s|c|r|i|b|e| |p|o|d| |<|p|o|d|>| |-|n| |w|e|b|`|,| |r|e|a|d| |`|P|o|r|t|:|`| |||
||| |`|E|d|i|t| |c|a|n|c|e|l|l|e|d|,| |n|o| |c|h|a|n|g|e|s| |m|a|d|e|.|`| ||| |s|a|v|e|d| |n|o|t|h|i|n|g|,| |o|r| |q|u|i|t| |w|i|t|h| |`|:|q|!|`| ||| |r|u|n| |`|k| |e|d|i|t|`| |a|g|a|i|n| |||
||| |s|t|i|l|l| |r|e|f|u|s|e|d| |a|f|t|e|r| |t|h|e| |f|i|x| ||| |y|o|u| |c|h|a|n|g|e|d| |`|c|o|n|t|a|i|n|e|r|P|o|r|t|`| |i|n| |t|h|e| |D|e|p|l|o|y|m|e|n|t| ||| |u|n|d|o| |i|t|;| |f|i|x| |t|h|e| |S|e|r|v|i|c|e| |||
||| |v|i|m| |g|e|t|s| |i|n| |t|h|e| |w|a|y| ||| |y|o|u| |w|a|n|t| |o|n|e| |c|o|m|m|a|n|d| ||| |`|k| |p|a|t|c|h| |s|v|c| |b|a|c|k|e|n|d|-|s|v|c| |-|n| |w|e|b| |-|p| |'|{|"|s|p|e|c|"|:|{|"|p|o|r|t|s|"|:|[|{|"|p|o|r|t|"|:|8|0|,|"|t|a|r|g|e|t|P|o|r|t|"|:|8|0|}|]|}|}|'|`| |||

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
3f2a1b9c8d7e6   ...   25 seconds ago   Exited   kube-apiserver   5   ...   <-- newest, copy the ID
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
    - --etcd-servers=https://127.0.0.1:2379   <-- 2379 now
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
...   Running   kube-apiserver   ...   <-- up again
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
controlplane   Ready    control-plane   ...   v1.35.0   <-- kubectl answers
```

---

### Three words first

- **Static pod** = a pod the kubelet starts from a file in `/etc/kubernetes/manifests/`.
- **crictl** = lists containers and logs on the node. Works without the API server.
- **etcd** = the cluster database. The API server reaches it on port 2379.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |s|t|i|l|l| |`|6|4|4|3| |w|a|s| |r|e|f|u|s|e|d|`| |a|f|t|e|r| |2|0| |s| ||| |t|h|e| |k|u|b|e|l|e|t| |n|e|e|d|s| |t|i|m|e| ||| |w|a|i|t| |u|p| |t|o| |6|0| |s| |||
||| |`|c|r|i|c|t|l| |p|s| |-|a|`| |s|h|o|w|s| |n|o| |a|p|i|s|e|r|v|e|r| |a|t| |a|l|l| ||| |Y|A|M|L| |m|i|s|t|a|k|e|,| |t|h|e| |k|u|b|e|l|e|t| |c|a|n|n|o|t| |r|e|a|d| |t|h|e| |f|i|l|e| ||| |`|j|o|u|r|n|a|l|c|t|l| |-|u| |k|u|b|e|l|e|t| |-|n| |3|0| |-|-|n|o|-|p|a|g|e|r| |||| |g|r|e|p| |a|p|i|s|e|r|v|e|r|`|;| |c|o|m|p|a|r|e| |w|i|t|h| |`|/|r|o|o|t|/|k|u|b|e|-|a|p|i|s|e|r|v|e|r|.|y|a|m|l|.|o|r|i|g|`| |||
||| |l|o|g| |s|a|y|s| |`|o|p|e|n| |/|e|t|c|/|k|u|b|e|r|n|e|t|e|s|/|p|k|i|/|.|.|.|:| |n|o| |s|u|c|h| |f|i|l|e| |o|r| |d|i|r|e|c|t|o|r|y|`| ||| |w|r|o|n|g| |c|e|r|t|i|f|i|c|a|t|e| |p|a|t|h| ||| |`|l|s| |/|e|t|c|/|k|u|b|e|r|n|e|t|e|s|/|p|k|i|/|`|,| |f|i|x| |t|h|e| |p|a|t|h| |||
||| |`|l|o|c|a|l|h|o|s|t|:|8|0|8|0| |w|a|s| |r|e|f|u|s|e|d|`| ||| |w|r|o|n|g| |m|a|c|h|i|n|e| ||| |`|s|s|h|`| |t|o| |t|h|e| |h|o|s|t| |t|h|e| |q|u|e|s|t|i|o|n| |n|a|m|e|s| |||
||| |c|r|i|c|t|l| |s|a|y|s| |`|p|e|r|m|i|s|s|i|o|n| |d|e|n|i|e|d|`| ||| |y|o|u| |a|r|e| |n|o|t| |r|o|o|t| ||| |`|s|u|d|o| |-|i|`| |f|i|r|s|t| |||

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
for i in $(seq 1 24); do k get pod kube-scheduler-controlplane -n kube-system --no-headers 2>/dev/null | grep -q '1/1' || break; sleep 5; done
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
You see:
```
Node:             <none>
Status:           Pending
...
Events:           <none>   <-- nobody tried to place it
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
Warning  Failed  ...  exec: "kube-schedulerx": executable file not found in $PATH: unknown   <-- the cause
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
    - kube-scheduler   <-- no x
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |d|e|s|c|r|i|b|e| |s|h|o|w|s| |n|o| |E|v|e|n|t|s| |f|o|r| |t|h|e| |s|c|h|e|d|u|l|e|r| ||| |e|v|e|n|t|s| |e|x|p|i|r|e|d| ||| |`|c|r|i|c|t|l| |p|s| |-|a| |||| |g|r|e|p| |s|c|h|e|d|u|l|e|r|`|,| |t|h|e|n| |`|c|r|i|c|t|l| |i|n|s|p|e|c|t| |<|i|d|>| |||| |g|r|e|p| |-|i| |-|m|3| |m|e|s|s|a|g|e|`| |||
||| |y|o|u|r| |`|k| |e|d|i|t| |p|o|d| |k|u|b|e|-|s|c|h|e|d|u|l|e|r|-|.|.|.|`| |d|i|d| |n|o|t|h|i|n|g| ||| |t|h|a|t| |i|s| |t|h|e| |m|i|r|r|o|r| |p|o|d| ||| |e|d|i|t| |t|h|e| |f|i|l|e| |i|n| |`|m|a|n|i|f|e|s|t|s|/|`| |||
||| |d|e|l|e|t|e|d| |s|c|h|e|d|u|l|e|r| |p|o|d| |c|o|m|e|s| |b|a|c|k| |b|r|o|k|e|n| ||| |t|h|e| |k|u|b|e|l|e|t| |r|e|b|u|i|l|d|s| |i|t| |f|r|o|m| |t|h|e| |f|i|l|e| ||| |f|i|x| |t|h|e| |f|i|l|e| |||
||| |s|c|h|e|d|u|l|e|r| |d|i|s|a|p|p|e|a|r|s| |a|f|t|e|r| |y|o|u|r| |e|d|i|t| ||| |Y|A|M|L| |b|r|o|k|e|n| |(|T|a|b| |o|r| |i|n|d|e|n|t|)| ||| |c|o|m|p|a|r|e| |w|i|t|h| |`|/|r|o|o|t|/|k|u|b|e|-|s|c|h|e|d|u|l|e|r|.|y|a|m|l|.|o|r|i|g|`|;| |s|p|a|c|e|s| |o|n|l|y| |||
||| |s|c|a|l|e|d| |D|e|p|l|o|y|m|e|n|t| |m|a|k|e|s| |N|O| |n|e|w| |p|o|d|s| ||| |c|o|n|t|r|o|l|l|e|r|-|m|a|n|a|g|e|r| |i|s| |b|r|o|k|e|n|,| |n|o|t| |t|h|e| |s|c|h|e|d|u|l|e|r| ||| |s|a|m|e| |m|e|t|h|o|d|,| |`|k|u|b|e|-|c|o|n|t|r|o|l|l|e|r|-|m|a|n|a|g|e|r|.|y|a|m|l|`| |||

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
k delete ns web --ignore-not-found
rm -f np.yaml
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 -n web
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
k rollout status deploy/backend -n web --timeout=120s
k wait --for=condition=Ready pod/client -n web --timeout=120s
clear
k exec client -n web -- wget -qO- -T 3 backend-svc
```

---

### Step 1. Which policy blocks the traffic?

**Why:** a timeout, not "refused", usually means a policy drops the traffic.

```
k get netpol -n web
k describe netpol deny-all -n web
```
You see:
```
deny-all   <none>   2m   <-- <none> = ALL pods
...
    <none> (Selected pods are isolated for ingress connectivity)   <-- nothing allowed in
```
**Means:** `deny-all` selects every pod and lets nothing in.
**Don't:** edit or delete `deny-all`. The question forbids it. Policies only add up.

---

### Step 2. Collect the two labels

**Why:** the new policy needs the backend label and the client label.

```
k get po -n web --show-labels
```
You see:
```
backend-...   1/1   Running   0   2m   app=backend,pod-template-hash=...   <-- protected
client        1/1   Running   0   2m   run=client                          <-- may come in
```
**Means:** protect `app=backend`. Let in `run=client`. Pods made with `k run` get `run=<name>`.

---

### Step 3. Write the policy

**Why:** there is no `k create netpol`. Copy the example from the docs page "Network Policies", section "The NetworkPolicy resource".

```
vim np.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-client          # <-- CHANGE
  namespace: web              # <-- CHANGE
spec:
  podSelector:
    matchLabels:
      app: backend            # <-- CHANGE
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          run: client         # <-- CHANGE
    ports:
    - protocol: TCP
      port: 80                # <-- CHANGE
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |s|t|i|l|l| |a| |t|i|m|e|o|u|t| ||| |a| |l|a|b|e|l| |i|n| |t|h|e| |f|i|l|e| |d|o|e|s| |n|o|t| |m|a|t|c|h| |t|h|e| |r|e|a|l| |l|a|b|e|l| ||| |c|o|m|p|a|r|e| |w|i|t|h| |`|-|-|s|h|o|w|-|l|a|b|e|l|s|`|,| |f|i|x| |`|n|p|.|y|a|m|l|`|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |s|t|i|l|l| |a| |t|i|m|e|o|u|t|,| |l|a|b|e|l|s| |m|a|t|c|h| ||| |t|h|e| |p|o|l|i|c|y| |l|a|n|d|e|d| |i|n| |`|d|e|f|a|u|l|t|`| ||| |`|k| |g|e|t| |n|e|t|p|o|l| |-|A|`|;| |s|e|t| |`|n|a|m|e|s|p|a|c|e|:| |w|e|b|`|,| |a|p|p|l|y|;| |`|k| |d|e|l|e|t|e| |n|e|t|p|o|l| |a|l|l|o|w|-|c|l|i|e|n|t| |-|n| |d|e|f|a|u|l|t|`| |||
||| |`|e|r|r|o|r| |p|a|r|s|i|n|g| |n|p|.|y|a|m|l|`| |o|r| |`|u|n|k|n|o|w|n| |f|i|e|l|d|`| ||| |i|n|d|e|n|t|a|t|i|o|n| |b|r|o|k|e| |w|h|i|l|e| |d|e|l|e|t|i|n|g| |l|i|n|e|s| ||| |c|o|m|p|a|r|e| |t|h|e| |s|p|a|c|e|s| |w|i|t|h| |t|h|e| |f|i|n|i|s|h|e|d| |f|i|l|e|,| |l|i|n|e| |b|y| |l|i|n|e| |||
||| |P|a|r|t| |A|'|s| |w|g|e|t| |a|l|r|e|a|d|y| |p|r|i|n|t|s| |t|h|e| |n|g|i|n|x| |p|a|g|e| ||| |t|h|e| |n|e|t|w|o|r|k| |p|l|u|g|i|n| |d|o|e|s| |n|o|t| |e|n|f|o|r|c|e| |p|o|l|i|c|i|e|s| ||| |w|r|i|t|e| |a|n|d| |a|p|p|l|y| |a|n|y|w|a|y|;| |t|h|e| |e|x|a|m| |c|l|u|s|t|e|r| |e|n|f|o|r|c|e|s| |t|h|e|m| |||
||| |s|t|i|l|l| |a| |t|i|m|e|o|u|t|,| |t|h|e| |S|e|r|v|i|c|e| |m|a|p|s| |8|0| |t|o| |a|n|o|t|h|e|r| |p|o|d| |p|o|r|t| ||| |a| |p|o|l|i|c|y| |m|a|t|c|h|e|s| |t|h|e| |p|o|d|'|s| |p|o|r|t|,| |n|o|t| |t|h|e| |S|e|r|v|i|c|e| |p|o|r|t| ||| |t|h|e| |p|o|l|i|c|y| |n|e|e|d|s| |t|h|e| |p|o|d|'|s| |p|o|r|t|:| |`|k| |g|e|t| |e|p| |b|a|c|k|e|n|d|-|s|v|c| |-|n| |w|e|b|`| |||

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
k set selector svc kube-dns k8s-app=kube-dns -n kube-system
k scale deploy coredns -n kube-system --replicas=2
k rollout status deploy/coredns -n kube-system --timeout=120s
k delete pod t --ignore-not-found
k scale deploy coredns -n kube-system --replicas=0
k wait --for=delete pod -l k8s-app=kube-dns -n kube-system --timeout=120s || true
clear
k get deploy coredns -n kube-system
```

---

### Step 1. Does a name lookup fail?

**Why:** see the symptom yourself before you fix anything.

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local
```
You see:
```
;; connection timed out; no servers could be reached   <-- DNS does not answer
```
**Means:** nobody answers on the DNS address.
**Don't:** test a short name like `kubernetes`. busybox can print `NXDOMAIN` even when DNS works.

---

### Step 2. Are the CoreDNS pods there?

**Why:** DNS answers come from the CoreDNS pods.

```
k get po -n kube-system -l k8s-app=kube-dns
```
You see:
```
No resources found in kube-system namespace.   <-- no DNS pods at all
```
**Means:** no pod, no answer. Now ask why there are none.

---

### Step 3. What does their Deployment want?

**Why:** the Deployment decides how many pods run.

```
k get deploy coredns -n kube-system
```
You see:
```
coredns   0/0   0   0   30m   <-- 0/0: scaled to zero
```
**Means:** nothing crashed. Someone asked for zero pods.

---

### Step 4. Scale back to 2

**Why:** the question wants two replicas.

```
k scale deploy coredns -n kube-system --replicas=2
k rollout status deploy/coredns -n kube-system --timeout=120s
```
You see:
```
deployment.apps/coredns scaled
deployment "coredns" successfully rolled out   <-- both pods ready
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
Address:   10.96.0.1   <-- the answer
```
**Don't:** read the first `Address` line. That one is the DNS server itself.

---

### Three words first

- **CoreDNS** = the cluster's DNS program. Deployment `coredns` in `kube-system`.
- **kube-dns** = the old name. Still the pod label `k8s-app=kube-dns` and the Service name.
- **nslookup** = asks DNS for the IP of a name.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|p|o|d|s| |"|t|"| |a|l|r|e|a|d|y| |e|x|i|s|t|s|`| ||| |a|n| |o|l|d| |t|e|s|t| |p|o|d| |w|a|s| |l|e|f|t| |b|e|h|i|n|d| ||| |`|k| |d|e|l|e|t|e| |p|o|d| |t|`|,| |t|e|s|t| |a|g|a|i|n| |||
||| |C|o|r|e|D|N|S| |p|o|d|s| |i|n| |`|C|r|a|s|h|L|o|o|p|B|a|c|k|O|f|f|`| ||| |a| |t|y|p|o| |i|n| |t|h|e| |C|o|r|e|D|N|S| |c|o|n|f|i|g| ||| |`|k| |l|o|g|s| |-|n| |k|u|b|e|-|s|y|s|t|e|m| |-|l| |k|8|s|-|a|p|p|=|k|u|b|e|-|d|n|s|`|;| |f|i|x| |w|i|t|h| |`|k| |e|d|i|t| |c|m| |c|o|r|e|d|n|s| |-|n| |k|u|b|e|-|s|y|s|t|e|m|`|;| |`|k| |r|o|l|l|o|u|t| |r|e|s|t|a|r|t| |d|e|p|l|o|y| |c|o|r|e|d|n|s| |-|n| |k|u|b|e|-|s|y|s|t|e|m|`| |||
||| |p|o|d|s| |`|1|/|1| |R|u|n|n|i|n|g|`|,| |D|N|S| |s|t|i|l|l| |f|a|i|l|s| ||| |t|h|e| |`|k|u|b|e|-|d|n|s|`| |S|e|r|v|i|c|e| |l|o|s|t| |i|t|s| |p|o|d|s| ||| |`|k| |g|e|t| |e|p| |k|u|b|e|-|d|n|s| |-|n| |k|u|b|e|-|s|y|s|t|e|m|`|;| |i|f| |`|<|n|o|n|e|>|`|:| |`|k| |s|e|t| |s|e|l|e|c|t|o|r| |s|v|c| |k|u|b|e|-|d|n|s| |k|8|s|-|a|p|p|=|k|u|b|e|-|d|n|s| |-|n| |k|u|b|e|-|s|y|s|t|e|m|`| |||
||| |C|o|r|e|D|N|S| |p|o|d|s| |`|P|e|n|d|i|n|g|`| ||| |a| |s|c|h|e|d|u|l|i|n|g| |p|r|o|b|l|e|m| ||| |q|u|e|s|t|i|o|n| |3| |||
||| |`|E|r|r|I|m|a|g|e|P|u|l|l|`| |o|n| |p|o|d| |`|t|`| ||| |t|h|e| |t|e|s|t| |i|m|a|g|e| |c|o|u|l|d| |n|o|t| |b|e| |p|u|l|l|e|d| ||| |c|h|e|c|k| |t|h|e| |t|a|g| |`|b|u|s|y|b|o|x|:|1|.|3|6|`|,| |r|e|t|r|y| |||

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
k delete ns app --ignore-not-found
rm -f /opt/api.log /opt/top.txt
k create ns app
k run api --image=nginx:1.27 -n app
mkdir -p /opt
k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.8.0/components.yaml
k get deploy metrics-server -n kube-system -o jsonpath='{.spec.template.spec.containers[0].args}' | grep -q kubelet-insecure-tls || k patch deploy metrics-server -n kube-system --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
k -n kube-system rollout status deploy metrics-server --timeout=180s
k wait --for=condition=Ready pod/api -n app --timeout=120s
for i in $(seq 1 24); do k top nodes >/dev/null 2>&1 && break; sleep 5; done
clear
k top nodes
```

---

### Step 1. Write the logs into the file

**Why:** `>` sends the output into the file, not to the screen.

```
k logs api -n app > /opt/api.log
head -3 /opt/api.log
```
You see:
```
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration   <-- log lines
...
```
**Means:** file 1 is done. The first command prints nothing; that is normal.

---

### Step 2. Which pod uses the most CPU?

**Why:** `k top` shows live usage. Sorting puts the top pod first.

```
k top pods -A --sort-by=cpu
```
You see:
```
NAMESPACE     NAME                          CPU(cores)   MEMORY(bytes)
kube-system   kube-apiserver-controlplane   45m          310Mi   <-- first row = the answer
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
You see:
```
kube-apiserver-controlplane   <-- one name, nothing else
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

- **`>`** = write a command's output into a file. Replaces the old content. `>>` adds instead.
- **k top** = live CPU and memory of pods or nodes. Needs metrics-server.
- **`45m`** = 45 millicores = 0.045 of one CPU.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|e|r|r|o|r|:| |M|e|t|r|i|c|s| |A|P|I| |n|o|t| |a|v|a|i|l|a|b|l|e|`| ||| |m|e|t|r|i|c|s|-|s|e|r|v|e|r| |m|i|s|s|i|n|g| |o|r| |s|t|i|l|l| |s|t|a|r|t|i|n|g| ||| |r|u|n| |P|a|r|t| |A| |a|g|a|i|n|,| |w|a|i|t| |6|0| |s|;| |t|h|e| |e|x|a|m| |h|a|s| |i|t| |||
||| |`|N|o| |s|u|c|h| |f|i|l|e| |o|r| |d|i|r|e|c|t|o|r|y|`| |o|n| |`|>|`| ||| |t|h|e| |f|o|l|d|e|r| |d|o|e|s| |n|o|t| |e|x|i|s|t| ||| |`|m|k|d|i|r| |-|p| |/|o|p|t|`| |||
||| |`|P|e|r|m|i|s|s|i|o|n| |d|e|n|i|e|d|`| |o|n| |`|>|`| ||| |y|o|u| |a|r|e| |n|o|t| |r|o|o|t|;| |`|/|o|p|t|`| |b|e|l|o|n|g|s| |t|o| |r|o|o|t| ||| |`|k| |l|o|g|s| |a|p|i| |-|n| |a|p|p| |||| |s|u|d|o| |t|e|e| |/|o|p|t|/|a|p|i|.|l|o|g| |>| |/|d|e|v|/|n|u|l|l|`| |||
||| |`|D|e|f|a|u|l|t|e|d| |c|o|n|t|a|i|n|e|r| |"|x|"| |o|u|t| |o|f|:| |x|,| |y|`| ||| |t|h|e| |p|o|d| |h|a|s| |2| |c|o|n|t|a|i|n|e|r|s| ||| |i|f| |t|h|e| |q|u|e|s|t|i|o|n| |n|a|m|e|s| |o|n|e|:| |`|k| |l|o|g|s| |a|p|i| |-|c| |<|c|o|n|t|a|i|n|e|r|>| |-|n| |a|p|p| |>| |/|o|p|t|/|a|p|i|.|l|o|g|`| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |w|a|n|t|s| |a| |c|r|a|s|h|e|d| |c|o|n|t|a|i|n|e|r|'|s| |l|o|g|s| ||| |c|u|r|r|e|n|t| |l|o|g|s| |a|r|e| |e|m|p|t|y| ||| |a|d|d| |`|-|-|p|r|e|v|i|o|u|s|`| |||

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
k delete ns dev --ignore-not-found
k create ns dev
clear
k auth can-i create deployments -n dev --as=system:serviceaccount:dev:deploy-bot
```

---

### Step 1. Create the ServiceAccount

**Why:** the SA is the identity that gets the permissions.

```
k create sa deploy-bot -n dev
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
  deployments.apps  []   []   [get list create]   <-- resource + verbs
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
k get rolebinding deploy-bot-binding -n dev -o wide
```
You see:
```
deploy-bot-binding   Role/deploy-manager   ...   dev/deploy-bot   <-- Role and SA
```
**Means:** the binding points to the right Role and SA.

---

### Verify

**Why:** ask the API as the SA. One allowed verb, one not allowed.

```
k auth can-i create deployments -n dev --as=system:serviceaccount:dev:deploy-bot
k auth can-i delete deployments -n dev --as=system:serviceaccount:dev:deploy-bot
```
You see:
```
yes   <-- allowed
no    <-- not in the Role
```
**Don't:** forget `-n dev`. Without it, you test the `default` namespace.

---

### Three words first

- **ServiceAccount (SA)** = an identity for a program in the cluster.
- **Role** = allowed verbs on resources, inside ONE namespace.
- **RoleBinding** = gives a Role to an SA or user. The chain: SA ← RoleBinding → Role.
- **`--as=system:serviceaccount:NS:SA`** = "pretend to be this SA" for the test.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |V|e|r|i|f|y| |s|a|y|s| |`|n|o|`| |f|o|r| |c|r|e|a|t|e| ||| |a| |t|y|p|o| |i|n| |a| |n|a|m|e| |i|n| |t|h|e| |b|i|n|d|i|n|g| ||| |`|k| |d|e|s|c|r|i|b|e| |r|o|l|e|b|i|n|d|i|n|g| |d|e|p|l|o|y|-|b|o|t|-|b|i|n|d|i|n|g| |-|n| |d|e|v|`|;| |d|e|l|e|t|e| |i|t|,| |c|r|e|a|t|e| |i|t| |a|g|a|i|n| |||
||| |`|e|r|r|o|r|:| |s|e|r|v|i|c|e|a|c|c|o|u|n|t| |m|u|s|t| |b|e| |<|n|a|m|e|s|p|a|c|e|>|:|<|n|a|m|e|>|`| ||| |`|d|e|v|:|`| |m|i|s|s|i|n|g| ||| |`|-|-|s|e|r|v|i|c|e|a|c|c|o|u|n|t|=|d|e|v|:|d|e|p|l|o|y|-|b|o|t|`| |||
||| |`|t|h|e| |s|e|r|v|e|r| |d|o|e|s|n|'|t| |h|a|v|e| |a| |r|e|s|o|u|r|c|e| |t|y|p|e| |"|d|e|p|l|o|y|m|n|t|s|"|`| ||| |r|e|s|o|u|r|c|e| |m|i|s|s|p|e|l|l|e|d| ||| |u|s|e| |`|d|e|p|l|o|y|m|e|n|t|s|`| |||
||| |`|.|.|.| |a|l|r|e|a|d|y| |e|x|i|s|t|s|`| ||| |y|o|u| |r|a|n| |t|h|e| |c|r|e|a|t|e| |t|w|i|c|e| ||| |f|i|n|e| |i|f| |c|o|r|r|e|c|t|;| |e|l|s|e| |`|k| |d|e|l|e|t|e|`| |i|t| |a|n|d| |c|r|e|a|t|e| |a|g|a|i|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |n|a|m|e|s| |a| |U|S|E|R|,| |n|o|t| |a|n| |S|A| ||| |d|i|f|f|e|r|e|n|t| |f|l|a|g| ||| |b|i|n|d|i|n|g|:| |`|-|-|u|s|e|r|=|a|l|i|c|e|`|;| |t|e|s|t|:| |`|-|-|a|s|=|a|l|i|c|e|`| |||

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
k delete ns ops --ignore-not-found
k create ns ops
clear
k auth can-i list nodes --as=system:serviceaccount:ops:node-viewer
```

---

### Step 1. Is `nodes` cluster-wide?

**Why:** a Role cannot give access to cluster-wide resources.

```
k api-resources | grep -w nodes
```
You see:
```
nodes   no   v1   false   Node   <-- NAMESPACED = false
```
**Means:** cluster-wide. You need ClusterRole + ClusterRoleBinding.

---

### Step 2. Create the ServiceAccount

**Why:** the SA still lives in a namespace.

```
k create sa node-viewer -n ops
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
node-viewer-binding   ClusterRole/node-reader   ...   ops/node-viewer   <-- ClusterRole and SA
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
no    <-- not in the ClusterRole
```
**Means:** no `-n` in the test. Nodes have no namespace.

---

### Three words first

- **Cluster-wide resource** = has no namespace: nodes, PersistentVolumes, namespaces, StorageClasses.
- **ClusterRole** = a Role for the whole cluster. It can cover cluster-wide resources.
- **ClusterRoleBinding** = gives a ClusterRole to an SA or user, in all namespaces.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |V|e|r|i|f|y| |s|a|y|s| |`|n|o|`| |f|o|r| |l|i|s|t| ||| |y|o|u| |m|a|d|e| |a| |R|o|l|e| |+| |R|o|l|e|B|i|n|d|i|n|g| ||| |d|e|l|e|t|e| |t|h|e|m|;| |u|s|e| |t|h|e| |C|l|u|s|t|e|r| |v|e|r|s|i|o|n|s| |||
||| |V|e|r|i|f|y| |s|a|y|s| |`|n|o|`|,| |o|b|j|e|c|t|s| |l|o|o|k| |f|i|n|e| ||| |a| |t|y|p|o| |i|n| |t|h|e| |S|A| |o|r| |n|a|m|e|s|p|a|c|e| |i|n| |t|h|e| |b|i|n|d|i|n|g| ||| |`|k| |d|e|s|c|r|i|b|e| |c|l|u|s|t|e|r|r|o|l|e|b|i|n|d|i|n|g| |n|o|d|e|-|v|i|e|w|e|r|-|b|i|n|d|i|n|g|`|;| |d|e|l|e|t|e| |i|t|,| |c|r|e|a|t|e| |i|t| |a|g|a|i|n| |||
||| |`|e|r|r|o|r|:| |s|e|r|v|i|c|e|a|c|c|o|u|n|t| |m|u|s|t| |b|e| |<|n|a|m|e|s|p|a|c|e|>|:|<|n|a|m|e|>|`| ||| |`|o|p|s|:|`| |m|i|s|s|i|n|g| ||| |`|-|-|s|e|r|v|i|c|e|a|c|c|o|u|n|t|=|o|p|s|:|n|o|d|e|-|v|i|e|w|e|r|`| |||
||| |q|u|e|s|t|i|o|n| |s|a|y|s| |"|e|x|i|s|t|i|n|g| |C|l|u|s|t|e|r|R|o|l|e| |X|,| |o|n|l|y| |i|n| |n|a|m|e|s|p|a|c|e| |Y|"| ||| |t|h|a|t| |i|s| |a| |R|o|l|e|B|i|n|d|i|n|g| |t|o| |a| |C|l|u|s|t|e|r|R|o|l|e| ||| |`|k| |c|r|e|a|t|e| |r|o|l|e|b|i|n|d|i|n|g| |N|A|M|E| |-|-|c|l|u|s|t|e|r|r|o|l|e|=|X| |-|-|u|s|e|r|=|a|l|i|c|e| |-|n| |Y|`| |||

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
"argocd" has been added to your repositories   <-- repo name argocd
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
argocd/argo-cd   7.7.3   ...   A Helm chart for Argo CD, ...   <-- CHART VERSION
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
  install: true   <-- crds.install
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
You see:
```
-rw-r--r-- 1 root root ... /root/argo-helm.yaml   <-- size is a big number, not 0
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
- **helm template** = print the YAML a chart would create. Nothing is installed.
- **CRD** = CustomResourceDefinition: teaches Kubernetes a new object type.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|E|r|r|o|r|:| |r|e|p|o| |a|r|g|o|c|d| |n|o|t| |f|o|u|n|d|`| ||| |s|t|e|p| |1| |s|k|i|p|p|e|d|,| |o|r| |a| |t|y|p|o| |i|n| |t|h|e| |n|a|m|e| ||| |`|h|e|l|m| |r|e|p|o| |l|i|s|t|`| |||
||| |t|h|e| |c|o|u|n|t| |i|s| |n|o|t| |`|0|`| ||| |w|r|o|n|g| |s|e|t|t|i|n|g| |n|a|m|e| |f|o|r| |t|h|i|s| |v|e|r|s|i|o|n| ||| |r|e|p|e|a|t| |s|t|e|p| |3|,| |c|o|p|y| |t|h|e| |e|x|a|c|t| |n|a|m|e| |||
||| |y|o|u| |u|s|e|d| |`|-|-|s|k|i|p|-|c|r|d|s|`|,| |c|o|u|n|t| |n|o|t| |`|0|`| ||| |t|h|i|s| |c|h|a|r|t| |s|h|i|p|s| |C|R|D|s| |a|s| |n|o|r|m|a|l| |t|e|m|p|l|a|t|e|s| ||| |u|s|e| |`|-|-|s|e|t| |c|r|d|s|.|i|n|s|t|a|l|l|=|f|a|l|s|e|`| |||
||| |`|N|o| |s|u|c|h| |f|i|l|e| |o|r| |d|i|r|e|c|t|o|r|y|`| ||| |t|h|e| |t|a|r|g|e|t| |f|o|l|d|e|r| |i|s| |m|i|s|s|i|n|g| ||| |`|m|k|d|i|r| |-|p| |<|f|o|l|d|e|r|>|`| |f|i|r|s|t| |||
||| |y|o|u| |r|a|n| |`|h|e|l|m| |i|n|s|t|a|l|l|`| |b|y| |m|i|s|t|a|k|e| ||| |t|h|e| |c|h|a|r|t| |g|o|t| |i|n|s|t|a|l|l|e|d| ||| |`|h|e|l|m| |u|n|i|n|s|t|a|l|l| |m|y|-|a|r|g|o| |-|n| |a|r|g|o|c|d|`| |||

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
k delete ns demo --ignore-not-found
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
  replicaCount: 1   <-- controller.replicaCount
...
defaultBackend:
...
  replicaCount: 1   <-- not this one
```
**Means:** `^[a-z]` adds the top-level keys. So you see each parent.

---

### Step 3. Install with 2 replicas

**Why:** `--set` changes one setting on the command line.

```
helm install web ingress-nginx/ingress-nginx -n demo --create-namespace --set controller.replicaCount=2
k get deploy -n demo
```
You see:
```
STATUS: deployed
REVISION: 1
...
web-ingress-nginx-controller   2/2   2   2   ...   <-- 2 replicas
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
Rollback was a success! Happy Helming!   <-- done
```

---

### Verify

**Why:** a rollback is itself a new revision.

```
helm list -n demo
k get deploy -n demo
```
You see:
```
web   demo   3   ...   deployed   ingress-nginx-...   <-- REVISION 3
web-ingress-nginx-controller   2/2   2   2   ...   <-- back to 2
```
**Don't:** expect revision 1. Rollback copies revision 1 into a new revision 3.

---

### Three words first

- **Release** = one installed copy of a chart. It has a name and a namespace.
- **Revision** = the version number of a release. Every install, upgrade or rollback adds 1.
- **`--set key=value`** = change one chart setting. Dots go down the tree: `controller.replicaCount`.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|h|e|l|m| |l|i|s|t|`| |s|h|o|w|s| |n|o|t|h|i|n|g| ||| |`|-|n| |d|e|m|o|`| |m|i|s|s|i|n|g|;| |H|e|l|m| |n|e|e|d|s| |i|t| |t|o|o| ||| |`|h|e|l|m| |l|i|s|t| |-|A|`| |||
||| |`|c|a|n|n|o|t| |r|e|-|u|s|e| |a| |n|a|m|e| |t|h|a|t| |i|s| |s|t|i|l|l| |i|n| |u|s|e|`| ||| |t|h|e| |r|e|l|e|a|s|e| |a|l|r|e|a|d|y| |e|x|i|s|t|s| ||| |u|s|e| |`|h|e|l|m| |u|p|g|r|a|d|e|`|,| |o|r| |u|n|i|n|s|t|a|l|l| |f|i|r|s|t| |||
||| |r|e|p|l|i|c|a|s| |d|i|d| |n|o|t| |c|h|a|n|g|e| ||| |w|r|o|n|g| |s|e|t|t|i|n|g| |n|a|m|e| ||| |r|e|p|e|a|t| |s|t|e|p| |2| |||
||| |`|k| |g|e|t| |s|v|c| |-|n| |d|e|m|o|`| |E|X|T|E|R|N|A|L|-|I|P| |`|<|p|e|n|d|i|n|g|>|`| ||| |n|o| |c|l|o|u|d| |L|o|a|d|B|a|l|a|n|c|e|r| |i|n| |a| |l|a|b| ||| |n|o|r|m|a|l|,| |i|g|n|o|r|e| |i|t| |||
||| |r|e|p|o| |a|d|d| |o|r| |i|n|s|t|a|l|l| |f|a|i|l|s| ||| |i|n|g|r|e|s|s|-|n|g|i|n|x| |w|a|s| |r|e|t|i|r|e|d| |i|n| |M|a|r|c|h| |2|0|2|6| ||| |p|r|a|c|t|i|s|e| |w|i|t|h| |r|e|p|o| |`|h|t|t|p|s|:|/|/|s|t|e|f|a|n|p|r|o|d|a|n|.|g|i|t|h|u|b|.|i|o|/|p|o|d|i|n|f|o|`|,| |c|h|a|r|t| |`|p|o|d|i|n|f|o|/|p|o|d|i|n|f|o|`|,| |s|e|t|t|i|n|g| |`|r|e|p|l|i|c|a|C|o|u|n|t|`| |||

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
k delete ns kust --ignore-not-found
k delete deploy kweb -n default --ignore-not-found
rm -rf /root/kust
mkdir -p /root/kust
k create deploy kweb --image=nginx:1.27 --dry-run=client -o yaml > /root/kust/deploy.yaml
cat > /root/kust/kustomization.yaml <<EOF
resources:
- deploy.yaml
namespace: kust
replicas:
- name: kweb
  count: 2
EOF
k create ns kust
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
- deploy.yaml        <-- the base, do not touch
namespace: kust      <-- everything goes here
replicas:
- name: kweb
  count: 2           <-- change this
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
  replicas: 3   <-- the plan worked
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
k get deploy kweb -n kust
```
You see:
```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
kweb   3/3     3            3           20s   <-- 3/3
```
**Don't:** worry about `1/3` at first. Wait 20 seconds.

---

### Three words first

- **Kustomize** = changes YAML files without editing them. Built into kubectl.
- **kustomization.yaml** = the plan: `resources:` lists the files, the rest lists changes.
- **`-k <folder>`** = apply a folder that holds a `kustomization.yaml`.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|d|e|p|l|o|y|m|e|n|t|.|a|p|p|s|/|k|w|e|b| |c|r|e|a|t|e|d|`| |p|l|u|s| |a|n| |e|r|r|o|r| |w|i|t|h| |`|k|i|n|d| |n|o|t| |s|e|t|`| ||| |y|o|u| |u|s|e|d| |`|-|f|`| |o|n| |t|h|e| |f|o|l|d|e|r| ||| |`|k| |d|e|l|e|t|e| |d|e|p|l|o|y| |k|w|e|b| |-|n| |d|e|f|a|u|l|t|`|,| |t|h|e|n| |`|k| |a|p|p|l|y| |-|k| |/|r|o|o|t|/|k|u|s|t|`| |||
||| |`|N|o| |r|e|s|o|u|r|c|e|s| |f|o|u|n|d|`| ||| |w|r|o|n|g| |n|a|m|e|s|p|a|c|e| ||| |r|e|a|d| |`|n|a|m|e|s|p|a|c|e|:|`| |i|n| |t|h|e| |p|l|a|n|;| |u|s|e| |`|-|n| |k|u|s|t|`| |||
||| |`|n|a|m|e|s|p|a|c|e|s| |"|k|u|s|t|"| |n|o|t| |f|o|u|n|d|`| ||| |K|u|s|t|o|m|i|z|e| |d|o|e|s| |n|o|t| |c|r|e|a|t|e| |t|h|e| |n|a|m|e|s|p|a|c|e| ||| |`|k| |c|r|e|a|t|e| |n|s| |k|u|s|t|`|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |w|a|n|t|s| |a| |n|e|w| |i|m|a|g|e| |t|a|g| ||| |d|i|f|f|e|r|e|n|t| |b|l|o|c|k| ||| |a|d|d| |`|i|m|a|g|e|s|:|`| |/| |`|-| |n|a|m|e|:| |n|g|i|n|x|`| |/| |`| | |n|e|w|T|a|g|:| |"|1|.|2|8|"|`| |||

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
certificates.cert-manager.io          2026-...   <-- one of 6 lines
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
6 /root/crds.txt   <-- 6 lines saved
```

---

### Step 3. Read the field docs

**Why:** `k explain` works for new kinds too. The path uses dots.

```
k explain certificate.spec.subject | head -5
```
You see:
```
GROUP:      cert-manager.io
KIND:       Certificate          <-- right kind
VERSION:    v1

FIELD: subject <Object>          <-- right field
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
- **`| grep word`** = keep only the lines that contain `word`.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|c|o|u|l|d|n|'|t| |f|i|n|d| |r|e|s|o|u|r|c|e| |f|o|r| |"|c|e|r|t|i|f|i|c|a|t|e|"|`| ||| |w|r|o|n|g| |k|i|n|d| |n|a|m|e| ||| |`|k| |a|p|i|-|r|e|s|o|u|r|c|e|s| |||| |g|r|e|p| |c|e|r|t|-|m|a|n|a|g|e|r|`|;| |u|s|e| |a| |n|a|m|e| |f|r|o|m| |t|h|e| |f|i|r|s|t| |c|o|l|u|m|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |n|a|m|e|s| |a|n| |o|u|t|p|u|t| |f|o|r|m|a|t| |(|e|.|g|.| |`|-|o| |n|a|m|e|`|)| ||| |t|h|e| |g|r|a|d|e|r| |c|o|m|p|a|r|e|s| |t|h|a|t| |f|o|r|m|a|t| ||| |`|k| |g|e|t| |c|r|d| |-|o| |n|a|m|e| |||| |g|r|e|p| |c|e|r|t|-|m|a|n|a|g|e|r| |>| |/|r|o|o|t|/|c|r|d|s|.|t|x|t|`| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |a|l|s|o| |a|s|k|s| |t|o| |C|R|E|A|T|E| |s|u|c|h| |a|n| |o|b|j|e|c|t| ||| |y|o|u| |n|e|e|d| |i|t|s| |f|i|e|l|d|s| ||| |`|k| |e|x|p|l|a|i|n| |c|e|r|t|i|f|i|c|a|t|e|.|s|p|e|c|`|;| |c|o|p|y| |`|a|p|i|V|e|r|s|i|o|n|`| |a|n|d| |`|k|i|n|d|`|;| |`|k| |a|p|p|l|y| |-|f|`| |||
||| |n|o| |c|e|r|t|-|m|a|n|a|g|e|r| |p|o|d|s| |o|n| |K|i|l|l|e|r|c|o|d|a| ||| |P|a|r|t| |A| |i|n|s|t|a|l|l|s| |o|n|l|y| |t|h|e| |C|R|D|s| ||| |n|o|r|m|a|l|;| |t|h|i|s| |q|u|e|s|t|i|o|n| |n|e|e|d|s| |o|n|l|y| |t|h|e| |C|R|D|s| |||

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
Setting up cri-dockerd ...   <-- installed
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
You see:
```
net.bridge.bridge-nf-call-iptables = 1   <-- 4 lines, as in the question
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
* Applying /etc/sysctl.d/k8s.conf ...   <-- your file
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
- **`.deb` file** = an Ubuntu installer package. `dpkg -i` installs it.
- **sysctl** = a kernel setting, `name = value`.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |K|i|l|l|e|r|c|o|d|a|:| |`|d|e|p|e|n|d|e|n|c|y| |p|r|o|b|l|e|m|s|`| |o|r| |`|C|a|n|n|o|t| |c|o|n|n|e|c|t| |t|o| |t|h|e| |D|o|c|k|e|r| |d|a|e|m|o|n|`| ||| |t|h|e| |p|l|a|y|g|r|o|u|n|d| |h|a|s| |n|o| |D|o|c|k|e|r| ||| |e|x|p|e|c|t|e|d|;| |g|o| |o|n| |t|o| |S|t|e|p| |3|;| |n|e|v|e|r| |i|n|s|t|a|l|l| |D|o|c|k|e|r| |t|h|e|r|e| |||
||| |`|c|a|n|n|o|t| |s|t|a|t| |/|p|r|o|c|/|s|y|s|/|n|e|t|/|b|r|i|d|g|e|/|.|.|.|`| ||| |b|r|i|d|g|e| |m|o|d|u|l|e| |n|o|t| |l|o|a|d|e|d| ||| |`|m|o|d|p|r|o|b|e| |b|r|_|n|e|t|f|i|l|t|e|r|`|,| |t|h|e|n| |`|s|y|s|c|t|l| |-|-|s|y|s|t|e|m|`| |||
||| |`|c|a|n|n|o|t| |s|t|a|t| |/|p|r|o|c|/|s|y|s|/|n|e|t|/|n|e|t|f|i|l|t|e|r|/|.|.|.|`| ||| |c|o|n|n|t|r|a|c|k| |m|o|d|u|l|e| |n|o|t| |l|o|a|d|e|d| ||| |`|m|o|d|p|r|o|b|e| |n|f|_|c|o|n|n|t|r|a|c|k|`|,| |t|h|e|n| |`|s|y|s|c|t|l| |-|-|s|y|s|t|e|m|`| |||
||| |`|r|e|q|u|i|r|e|s| |s|u|p|e|r|u|s|e|r| |p|r|i|v|i|l|e|g|e|`| ||| |y|o|u| |a|r|e| |n|o|t| |r|o|o|t| ||| |`|s|u|d|o| |-|i|`|,| |t|h|e|n| |r|e|p|e|a|t| |t|h|e| |s|t|e|p| |||
||| |`|U|n|i|t| |c|r|i|-|d|o|c|k|e|r|.|s|e|r|v|i|c|e| |n|o|t| |f|o|u|n|d|`| ||| |p|a|c|k|a|g|e| |n|o|t| |i|n|s|t|a|l|l|e|d| ||| |r|e|p|e|a|t| |S|t|e|p| |1|;| |r|e|a|d| |i|t|s| |e|r|r|o|r|s| |||
||| |K|i|l|l|e|r|c|o|d|a|:| |p|o|d|s| |s|t|o|p| |t|a|l|k|i|n|g| |a|f|t|e|r| |P|a|r|t| |A| ||| |P|a|r|t| |A| |s|e|t| |`|i|p|_|f|o|r|w|a|r|d|=|0|`| ||| |f|i|n|i|s|h| |S|t|e|p| |3| |(|`|s|y|s|c|t|l| |-|-|s|y|s|t|e|m|`|)| |||

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
deployment.apps/tigera-operator created   <-- last line
```
**Don't:** use `apply`. The file is too big: `metadata.annotations: Too long`.

---

### Step 2. Find the cluster's pod range

**Why:** Calico must give pods IPs from the same range as the cluster.

```
k -n kube-system get pod -l component=kube-controller-manager -o yaml | grep cluster-cidr
```
You see:
```
    - --cluster-cidr=10.244.0.0/16   <-- write it down
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

You see:
```
      cidr: 10.244.0.0/16   <-- your range now
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
calico-system   calico-node-...   1/1   Running   ...   <-- all Running
controlplane    Ready    control-plane   ...   <-- Ready now
```

---

### Three words first

- **CNI** = the network plug-in. It gives every pod an IP. Without it, nodes stay `NotReady`.
- **Flannel / Calico** = two CNIs. Only Calico enforces NetworkPolicy.
- **Pod CIDR** = the IP range for pods, e.g. `10.244.0.0/16`.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|n|o| |m|a|t|c|h|e|s| |f|o|r| |k|i|n|d| |"|I|n|s|t|a|l|l|a|t|i|o|n|"|`| ||| |t|h|e| |o|p|e|r|a|t|o|r| |i|s| |s|t|i|l|l| |r|e|g|i|s|t|e|r|i|n|g| |i|t|s| |t|y|p|e|s| ||| |w|a|i|t| |2|0| |s|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |S|t|e|p| |2| |p|r|i|n|t|s| |n|o|t|h|i|n|g| ||| |k|u|b|e|a|d|m| |r|a|n| |w|i|t|h|o|u|t| |a| |p|o|d| |r|a|n|g|e| ||| |`|k| |-|n| |k|u|b|e|-|s|y|s|t|e|m| |g|e|t| |c|m| |k|u|b|e|a|d|m|-|c|o|n|f|i|g| |-|o| |y|a|m|l| |||| |g|r|e|p| |-|i| |p|o|d|S|u|b|n|e|t|`|;| |s|t|i|l|l| |e|m|p|t|y|:| |k|e|e|p| |`|1|9|2|.|1|6|8|.|0|.|0|/|1|6|`| |||
||| |c|a|l|i|c|o| |R|u|n|n|i|n|g|,| |o|t|h|e|r| |p|o|d|s| |s|t|a|y| |`|C|o|n|t|a|i|n|e|r|C|r|e|a|t|i|n|g|`| ||| |`|c|i|d|r|:|`| |i|s| |n|o|t| |t|h|e| |c|l|u|s|t|e|r|'|s| |r|a|n|g|e| ||| |f|i|x| |t|h|e| |f|i|l|e|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |d|o|e|s| |N|O|T| |m|e|n|t|i|o|n| |N|e|t|w|o|r|k|P|o|l|i|c|y| ||| |e|i|t|h|e|r| |C|N|I| |i|s| |f|i|n|e| ||| |F|l|a|n|n|e|l| |i|s| |o|n|e| |c|o|m|m|a|n|d|:| |`|k| |a|p|p|l|y| |-|f| |<|f|l|a|n|n|e|l| |U|R|L|>|`| |||

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
You see:
```
deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /   <-- v1.35
   kubeadm | 1.35.2-1.1 | https://pkgs.k8s.io/core:/stable:/v1.35/deb  Packages   <-- copy this
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

	kubeadm upgrade apply v1.35.2   <-- the next command
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
... The configuration for this node was successfully updated!   <-- after upgrade node
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
You see:
```
controlplane   Ready    control-plane   ...   v1.35.2   <-- new
node01         Ready    <none>          ...   v1.35.2   <-- new, no SchedulingDisabled
```

---

### Three words first

- **drain** = moves the pods off a node and closes it. **uncordon** opens it again.
- **apt-mark hold** = locks a package against updates. Unhold, install, hold again.
- **`1.35.2-1.1`** = the apt package text for Kubernetes `1.35.2`.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|V|e|r|s|i|o|n| |'|1|.|3|5|.|2|'| |n|o|t| |f|o|u|n|d|`| ||| |a|p|t| |n|e|e|d|s| |t|h|e| |f|u|l|l| |t|e|x|t| ||| |c|o|p|y| |i|t| |f|r|o|m| |`|a|p|t|-|c|a|c|h|e| |m|a|d|i|s|o|n| |k|u|b|e|a|d|m|`| |||
||| |m|a|d|i|s|o|n| |d|o|e|s| |n|o|t| |l|i|s|t| |`|1|.|3|5|.|2|`| ||| |n|o| |`|a|p|t|-|g|e|t| |u|p|d|a|t|e|`|,| |o|r| |t|h|e| |s|o|u|r|c|e| |s|t|i|l|l| |s|a|y|s| |t|h|e| |o|l|d| |m|i|n|o|r| ||| |S|t|e|p| |1| |||
||| |d|r|a|i|n| |r|e|f|u|s|e|s|:| |"|c|a|n|n|o|t| |d|e|l|e|t|e| |P|o|d|s| |w|i|t|h| |l|o|c|a|l| |s|t|o|r|a|g|e|"| ||| |m|i|s|s|i|n|g| |f|l|a|g| ||| |a|d|d| |`|-|-|d|e|l|e|t|e|-|e|m|p|t|y|d|i|r|-|d|a|t|a|`| |||
||| |d|r|a|i|n| |r|e|f|u|s|e|s|:| |p|o|d|s| |"|n|o|t| |m|a|n|a|g|e|d| |b|y| |a| |c|o|n|t|r|o|l|l|e|r|"| ||| |a| |b|a|r|e| |p|o|d| |i|s| |o|n| |t|h|e| |n|o|d|e| ||| |a|d|d| |`|-|-|f|o|r|c|e|`| |||
||| |`|l|o|c|a|l|h|o|s|t|:|8|0|8|0| |w|a|s| |r|e|f|u|s|e|d|`| ||| |y|o|u| |r|a|n| |`|k|`| |o|n| |n|o|d|e|0|1| ||| |`|e|x|i|t|`| |f|i|r|s|t| |||

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
You see:
```
.../etcdctl
.../etcdutl
    - --cert-file=/etc/kubernetes/pki/etcd/server.crt   <-- --cert
    - --key-file=/etc/kubernetes/pki/etcd/server.key    <-- --key
    - --peer-cert-file=/etc/kubernetes/pki/etcd/peer.crt
    ...
    - --trusted-ca-file=/etc/kubernetes/pki/etcd/ca.crt   <-- --cacert
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
Snapshot saved at /opt/etcd-backup.db   <-- backup done
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
member   <-- the restored database
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
In vim: press `G` to reach the end. Change the path in the `etcd-data` block:
```
  volumes:
  - hostPath:
      path: /etc/kubernetes/pki/etcd
      type: DirectoryOrCreate
    name: etcd-certs
  - hostPath:
      path: /var/lib/etcd-restored   # <-- CHANGE
      type: DirectoryOrCreate
    name: etcd-data
```
You see:
```
      path: /var/lib/etcd-restored   <-- exactly 1 line
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
...   Running   etcd   ...   <-- up again
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
etcd-controlplane   1/1   Running   ...   <-- etcd is back
```

---

### Three words first

- **etcd** = the cluster database. Runs as a static pod from `etcd.yaml`.
- **Snapshot** = a backup file of that database.
- **etcdctl / etcdutl** = `etcdctl` talks to running etcd (save). `etcdutl` works on files (restore).

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |s|a|v|e| |h|a|n|g|s| |o|r| |`|c|o|n|t|e|x|t| |d|e|a|d|l|i|n|e| |e|x|c|e|e|d|e|d|`| ||| |w|r|o|n|g| |c|e|r|t|i|f|i|c|a|t|e| |p|a|t|h| |o|r| |e|n|d|p|o|i|n|t| ||| |c|o|m|p|a|r|e| |w|i|t|h| |S|t|e|p| |1| |||
||| |k|u|b|e|c|t|l| |s|t|i|l|l| |d|e|a|d| |a|f|t|e|r| |2| |m|i|n|u|t|e|s| ||| |t|y|p|o| |i|n| |`|e|t|c|d|.|y|a|m|l|`| ||| |`|c|r|i|c|t|l| |p|s| |-|a| |||| |g|r|e|p| |e|t|c|d|`|,| |`|c|r|i|c|t|l| |l|o|g|s| |<|i|d|>|`|;| |o|r| |`|c|p| |/|r|o|o|t|/|e|t|c|d|.|y|a|m|l|.|b|a|k| |/|e|t|c|/|k|u|b|e|r|n|e|t|e|s|/|m|a|n|i|f|e|s|t|s|/|e|t|c|d|.|y|a|m|l|`| |||
||| |r|e|s|t|o|r|e| |s|a|y|s| |t|h|e| |d|a|t|a| |d|i|r| |e|x|i|s|t|s| ||| |t|h|e| |f|o|l|d|e|r| |i|s| |a|l|r|e|a|d|y| |t|h|e|r|e| ||| |`|r|m| |-|r|f|`| |i|t|,| |o|r| |p|i|c|k| |a| |n|e|w| |n|a|m|e| |||
||| |`|e|t|c|d|u|t|l|:| |c|o|m|m|a|n|d| |n|o|t| |f|o|u|n|d|`| |(|p|l|a|y|g|r|o|u|n|d|)| ||| |n|o|t| |i|n|s|t|a|l|l|e|d| |t|h|e|r|e| ||| |r|e|a|d| |t|h|e| |v|e|r|s|i|o|n|:| |`|k| |-|n| |k|u|b|e|-|s|y|s|t|e|m| |g|e|t| |p|o|d| |e|t|c|d|-|c|o|n|t|r|o|l|p|l|a|n|e| |-|o| |j|s|o|n|p|a|t|h|=|'|{|.|.|i|m|a|g|e|}|'|`| |(|e|.|g|.| |`|3|.|6|.|5|-|0|`|)|;| |`|c|u|r|l| |-|s|L|o| |/|t|m|p|/|e|t|c|d|.|t|g|z| |h|t|t|p|s|:|/|/|g|i|t|h|u|b|.|c|o|m|/|e|t|c|d|-|i|o|/|e|t|c|d|/|r|e|l|e|a|s|e|s|/|d|o|w|n|l|o|a|d|/|v|3|.|6|.|5|/|e|t|c|d|-|v|3|.|6|.|5|-|l|i|n|u|x|-|a|m|d|6|4|.|t|a|r|.|g|z|`|;| |`|t|a|r| |x|z|f| |/|t|m|p|/|e|t|c|d|.|t|g|z| |-|C| |/|t|m|p|`|;| |r|u|n| |`|/|t|m|p|/|e|t|c|d|-|v|3|.|6|.|5|-|l|i|n|u|x|-|a|m|d|6|4|/|e|t|c|d|u|t|l|`| |||

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
k delete ns web --ignore-not-found
k create ns web
k create deploy np --image=nginx:1.27 -n web
k rollout status deploy/np -n web --timeout=120s
clear
k get deploy,svc -n web
```

---

### Step 1. Add the container port

**Why:** `containerPort` tells Kubernetes which port the container listens on.

```
k edit deploy np -n web
```
Type `/image:` and Enter. Add the three marked lines under `name: nginx`:
```
      containers:
      - image: nginx:1.27
        imagePullPolicy: IfNotPresent
        name: nginx
        ports:                  # <-- CHANGE
        - containerPort: 80     # <-- CHANGE
          protocol: TCP         # <-- CHANGE
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
k expose deploy np --name=np-svc --port=80 --target-port=80 --type=NodePort -n web
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
k patch svc np-svc -n web -p '{"spec":{"ports":[{"port":80,"nodePort":30080}]}}'
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
k get endpointslices -n web -l kubernetes.io/service-name=np-svc
```
You see:
```
np-svc-...   IPv4   80   192.168.x.x   1m   <-- a pod IP
```
**Means:** selector and target port are right.

---

### Verify

**Why:** prove the node port answers.

```
k get svc np-svc -n web
curl -s -m 3 node01:30080 | grep title
```
You see:
```
np-svc   NodePort   10.x.x.x   <none>   80:30080/TCP   2m   <-- port:nodePort
<title>Welcome to nginx!</title>
```

---

### Three words first

- **containerPort** = the port the container listens on, written in the pod template.
- **NodePort Service** = a Service that also opens one port on every node (30000 to 32767).
- **port / targetPort / nodePort** = the Service's port / the container's port / the port on every node.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |v|i|m| |r|e|o|p|e|n|s| |w|i|t|h| |a|n| |e|r|r|o|r| |a|t| |t|h|e| |t|o|p| ||| |w|r|o|n|g| |i|n|d|e|n|t|a|t|i|o|n|,| |o|r| |a| |T|a|b| ||| |s|p|a|c|e|s| |o|n|l|y|;| |`|p|o|r|t|s|:|`| |l|i|n|e|s| |u|p| |w|i|t|h| |`|n|a|m|e|:|`| |||
||| |t|h|e| |S|e|r|v|i|c|e| |i|s| |c|a|l|l|e|d| |`|n|p|`| ||| |f|o|r|g|o|t| |`|-|-|n|a|m|e|=|n|p|-|s|v|c|`| ||| |`|k| |d|e|l|e|t|e| |s|v|c| |n|p| |-|n| |w|e|b|`|,| |r|u|n| |s|t|e|p| |2| |a|g|a|i|n| |||
||| |`|p|r|o|v|i|d|e|d| |p|o|r|t| |i|s| |a|l|r|e|a|d|y| |a|l|l|o|c|a|t|e|d|`| ||| |a|n|o|t|h|e|r| |S|e|r|v|i|c|e| |u|s|e|s| |3|0|0|8|0| ||| |`|k| |g|e|t| |s|v|c| |-|A|`|,| |f|i|n|d| |3|0|0|8|0|;| |a|s|k|,| |n|e|v|e|r| |d|e|l|e|t|e| |i|t| |||
||| |`|p|r|o|v|i|d|e|d| |p|o|r|t| |i|s| |n|o|t| |i|n| |t|h|e| |v|a|l|i|d| |r|a|n|g|e|`| ||| |n|o|d|e| |p|o|r|t| |o|u|t|s|i|d|e| |3|0|0|0|0| |t|o| |3|2|7|6|7| ||| |u|s|e| |t|h|e| |n|u|m|b|e|r| |f|r|o|m| |t|h|e| |q|u|e|s|t|i|o|n| |||
||| |c|u|r|l| |f|a|i|l|s|,| |e|n|d|p|o|i|n|t|s| |a|r|e| |f|i|n|e| ||| |`|n|o|d|e|0|1|`| |d|o|e|s| |n|o|t| |r|e|s|o|l|v|e| ||| |`|k| |g|e|t| |n|o|d|e|s| |-|o| |w|i|d|e|`|,| |c|u|r|l| |t|h|e| |I|N|T|E|R|N|A|L|-|I|P| |||

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
k delete ns web --ignore-not-found
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 -n web
cat <<EOF | k apply -f -
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  name: nginx
spec:
  controller: k8s.io/ingress-nginx
EOF
k rollout status deploy/backend -n web --timeout=120s
clear
k get ingressclass,svc,ing -n web
```

---

### Step 1. Which class exists?

**Why:** an Ingress without the right class is ignored.

```
k get ingressclass
```
You see:
```
nginx   k8s.io/ingress-nginx   <none>   1m   <-- NAME
```
**Means:** the class is `nginx`.

---

### Step 2. Which port does the Service have?

**Why:** the rule needs the Service port, not the pod port.

```
k get svc backend-svc -n web
```
You see:
```
backend-svc   ClusterIP   10.x.x.x   <none>   80/TCP   1m   <-- port 80
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
k get ing web-ing -n web
```
You see:
```
web-ing   nginx   shop.example.com   80   10s   <-- CLASS, HOSTS
```
**Means:** ADDRESS stays empty here. The playground has no ingress controller.

---

### Verify

**Why:** prove the backend resolves to a real pod.

```
k describe ing web-ing -n web
```
You see:
```
Ingress Class:    nginx
...
  shop.example.com
                    /   backend-svc:80 (192.168.x.x:80)   <-- a pod IP
```

---

### Three words first

- **Ingress** = a rule for incoming web traffic: host + path → Service + port.
- **IngressClass** = names the controller that carries out the rules.
- **pathType: Prefix** = matches the path and everything below it. `/` matches every request.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|<|e|r|r|o|r|:| |s|e|r|v|i|c|e|s| |"|.|.|.|"| |n|o|t| |f|o|u|n|d|>|`| ||| |S|e|r|v|i|c|e| |n|a|m|e| |t|y|p|o| ||| |`|k| |d|e|l|e|t|e| |i|n|g| |w|e|b|-|i|n|g| |-|n| |w|e|b|`|,| |c|r|e|a|t|e| |a|g|a|i|n| |||
||| |e|m|p|t|y| |b|r|a|c|k|e|t|s| |`|(|)|`|,| |n|o| |p|o|d| |I|P| ||| |w|r|o|n|g| |S|e|r|v|i|c|e| |p|o|r|t|,| |o|r| |p|o|d|s| |n|o|t| |R|e|a|d|y| ||| |c|h|e|c|k| |P|O|R|T|(|S|)| |i|n| |s|t|e|p| |2|;| |d|e|l|e|t|e| |a|n|d| |c|r|e|a|t|e| |a|g|a|i|n| |||
||| |`|I|n|g|r|e|s|s| |C|l|a|s|s|:| |<|n|o|n|e|>|`| ||| |f|o|r|g|o|t| |`|-|-|c|l|a|s|s|`| ||| |d|e|l|e|t|e| |a|n|d| |c|r|e|a|t|e| |a|g|a|i|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |a|s|k|s| |f|o|r| |T|L|S| |w|i|t|h| |s|e|c|r|e|t| |`|w|e|b|-|t|l|s|`| ||| |a|d|d| |i|t| |t|o| |t|h|e| |r|u|l|e| ||| |`|-|-|r|u|l|e|=|"|s|h|o|p|.|e|x|a|m|p|l|e|.|c|o|m|/|*|=|b|a|c|k|e|n|d|-|s|v|c|:|8|0|,|t|l|s|=|w|e|b|-|t|l|s|"|`| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |a|s|k|s| |f|o|r| |a|n| |a|n|n|o|t|a|t|i|o|n| ||| |a|d|d| |a| |f|l|a|g| ||| |`|-|-|a|n|n|o|t|a|t|i|o|n| |n|g|i|n|x|.|i|n|g|r|e|s|s|.|k|u|b|e|r|n|e|t|e|s|.|i|o|/|r|e|w|r|i|t|e|-|t|a|r|g|e|t|=|/|`| |||

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
k delete ns web --ignore-not-found
rm -f gw.yaml route.yaml
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 -n web
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
k rollout status deploy/backend -n web --timeout=120s
clear
k get ing,gatewayclass -n web
```
(No gateway controller here: no `Accepted`/`Programmed`, no traffic. Check the objects and values only.)

---

### Step 1. Read the values from the Ingress

**Why:** the question gives no values. They are in the Ingress.

```
k describe ing web-ing -n web
k get gatewayclass
```
You see:
```
TLS:
  web-tls terminates shop.example.com              <-- secret, hostname
...
  shop.example.com
                    /   backend-svc:80 (192.168.x.x:80)   <-- path, Service, port
nginx   gateway.nginx.org/nginx-gateway-controller   ...   <-- class
```
**Means:** host `shop.example.com`, secret `web-tls`, path `/`, `backend-svc:80`, class `nginx`.

---

### Step 2. Write the Gateway

**Why:** copy the "Gateway" example from the docs page "Gateway API".

```
vim gw.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: web-gw                  # <-- CHANGE
  namespace: web                # <-- CHANGE
spec:
  gatewayClassName: nginx       # <-- CHANGE
  listeners:
  - name: https                 # <-- CHANGE
    protocol: HTTPS             # <-- CHANGE
    port: 443                   # <-- CHANGE
    hostname: "shop.example.com"   # <-- CHANGE
    tls:                        # <-- CHANGE
      mode: Terminate           # <-- CHANGE
      certificateRefs:          # <-- CHANGE
      - name: web-tls           # <-- CHANGE
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
The finished file:
```
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: web-route               # <-- CHANGE
  namespace: web                # <-- CHANGE
spec:
  parentRefs:
  - name: web-gw                # <-- CHANGE
  hostnames:
  - "shop.example.com"          # <-- CHANGE
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /                # <-- CHANGE
    backendRefs:
    - name: backend-svc         # <-- CHANGE
      port: 80                  # <-- CHANGE
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
k delete ing web-ing -n web
```
You see:
```
ingress.networking.k8s.io "web-ing" deleted ...
```

---

### Verify

**Why:** prove the Ingress is gone and the route has the values.

```
k get ing -n web
k get httproute web-route -n web -o yaml | grep -E "name: web-gw|value: /|backend-svc|port: 80"
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
- **parentRefs** = the Gateway this route attaches to.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|n|o| |m|a|t|c|h|e|s| |f|o|r| |k|i|n|d| |"|G|a|t|e|w|a|y|"|`| ||| |w|r|o|n|g| |`|a|p|i|V|e|r|s|i|o|n|`|,| |o|r| |n|o| |C|R|D|s| ||| |`|g|a|t|e|w|a|y|.|n|e|t|w|o|r|k|i|n|g|.|k|8|s|.|i|o|/|v|1|`|;| |P|a|r|t| |A| |l|i|n|e| |1| |||
||| |r|o|u|t|e| |n|o|t| |`|A|c|c|e|p|t|e|d|`|,| |c|u|r|l| |4|0|4| ||| |`|p|a|r|e|n|t|R|e|f|s|`| |n|a|m|e| |o|r| |h|o|s|t|n|a|m|e| |d|i|f|f|e|r|s| |f|r|o|m| |t|h|e| |G|a|t|e|w|a|y| ||| |m|a|k|e| |t|h|e|m| |i|d|e|n|t|i|c|a|l| |||
||| |G|a|t|e|w|a|y| |l|i|s|t|e|n|e|r| |`|R|e|s|o|l|v|e|d|R|e|f|s|`| |`|F|a|l|s|e|`| ||| |w|r|o|n|g| |s|e|c|r|e|t| |n|a|m|e| |i|n| |`|c|e|r|t|i|f|i|c|a|t|e|R|e|f|s|`| ||| |u|s|e| |t|h|e| |s|e|c|r|e|t| |f|r|o|m| |s|t|e|p| |1| |||
||| |t|h|e| |I|n|g|r|e|s|s| |h|a|d| |n|o| |T|L|S| ||| |p|l|a|i|n| |H|T|T|P| ||| |`|p|r|o|t|o|c|o|l|:| |H|T|T|P|`|,| |`|p|o|r|t|:| |8|0|`|,| |n|o| |`|t|l|s|:|`| |b|l|o|c|k| |||

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
k delete ns prod --ignore-not-found
rm -f np.yaml
k create ns prod
k run db --image=nginx:1.27 -n prod --labels=app=db
k run api --image=busybox:1.36 -n prod --labels=app=api -- sleep 3600
k run other --image=busybox:1.36 -n prod --labels=app=other -- sleep 3600
k expose pod db --name=db-svc --port=80 -n prod
k wait --for=condition=Ready pod/db pod/api pod/other -n prod --timeout=120s
clear
k get po,netpol -n prod
```
(nginx on port 80 plays the database.)

---

### Step 1. Check the labels

**Why:** the policy matches labels, so they must be exact.

```
k get po -n prod --show-labels
```
You see:
```
api     1/1   Running   0   1m   app=api     <-- may come in
db      1/1   Running   0   1m   app=db      <-- protected
other   1/1   Running   0   1m   app=other   <-- must be blocked
```
**Means:** the labels match the question.

---

### Step 2. Write the policy

**Why:** there is no `k create netpol`. Copy the example from the docs page "Network Policies", section "The NetworkPolicy resource".

```
vim np.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-policy           # <-- CHANGE
  namespace: prod           # <-- CHANGE
spec:
  podSelector:
    matchLabels:
      app: db               # <-- CHANGE
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api          # <-- CHANGE
    ports:
    - protocol: TCP
      port: 80              # <-- CHANGE
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
k describe netpol db-policy -n prod
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
wget: download timed out   <-- other is blocked
```

---

### Three words first

- **podSelector (top)** = the pods this policy protects. Under `from:`: the pods allowed in.
- **AND / OR in `from`** = two selectors under ONE `-` must both match. Each new `-` is another allowed source.
- **CNI enforcement** = the network plugin applies policies. Without support, they are silently ignored.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|o|t|h|e|r|`| |s|t|i|l|l| |g|e|t|s| |t|h|e| |p|a|g|e| ||| |t|h|e| |n|e|t|w|o|r|k| |p|l|u|g|i|n| |d|o|e|s| |n|o|t| |e|n|f|o|r|c|e| |p|o|l|i|c|i|e|s| ||| |c|h|e|c|k| |w|i|t|h| |`|k| |d|e|s|c|r|i|b|e| |n|e|t|p|o|l|`|;| |t|h|e| |e|x|a|m| |c|l|u|s|t|e|r| |e|n|f|o|r|c|e|s| |t|h|e|m| |||
||| |`|a|p|i|`| |a|l|s|o| |t|i|m|e|s| |o|u|t| ||| |w|r|o|n|g| |l|a|b|e|l| |i|n| |`|f|r|o|m|`|,| |o|r| |`|p|o|r|t|s|:|`| |u|n|d|e|r| |t|h|e| |w|r|o|n|g| |i|t|e|m| ||| |c|o|m|p|a|r|e| |w|i|t|h| |t|h|e| |f|i|n|i|s|h|e|d| |f|i|l|e| |a|n|d| |`|-|-|s|h|o|w|-|l|a|b|e|l|s|`| |||
||| |`|d|i|d| |n|o|t| |f|i|n|d| |e|x|p|e|c|t|e|d| |k|e|y|`| ||| |i|n|d|e|n|t|a|t|i|o|n| |b|r|o|k|e| |w|h|i|l|e| |d|e|l|e|t|i|n|g| |l|i|n|e|s| ||| |`|-| |p|o|d|S|e|l|e|c|t|o|r|:|`| |s|t|a|r|t|s| |4| |s|p|a|c|e|s| |i|n|,| |u|n|d|e|r| |`|-| |f|r|o|m|:|`| |||
||| |`|a|p|i|`| |l|i|v|e|s| |i|n| |a|n|o|t|h|e|r| |n|a|m|e|s|p|a|c|e| ||| |`|f|r|o|m|`| |n|e|e|d|s| |a| |n|a|m|e|s|p|a|c|e| |t|o|o| ||| |a|d|d| |`|n|a|m|e|s|p|a|c|e|S|e|l|e|c|t|o|r|`| |w|i|t|h| |`|k|u|b|e|r|n|e|t|e|s|.|i|o|/|m|e|t|a|d|a|t|a|.|n|a|m|e|:| |<|n|s|>|`| |u|n|d|e|r| |t|h|e| |S|A|M|E| |`|-|`| |||
||| |a|s|k|e|d| |t|o| |p|i|c|k| |t|h|e| |l|e|a|s|t| |p|e|r|m|i|s|s|i|v|e| |f|i|l|e| ||| |d|o| |n|o|t| |e|d|i|t| |f|i|l|e|s| ||| |a|p|p|l|y| |t|h|e| |o|n|e| |w|i|t|h| |e|x|a|c|t|l|y| |t|h|e|s|e| |l|a|b|e|l|s| |a|n|d| |t|h|e| |p|o|r|t| |||

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
k delete ns prod --ignore-not-found
rm -f deny.yaml
k create ns prod
k run app --image=busybox:1.36 -n prod -- sleep 3600
k run web --image=nginx:1.27 -n prod --port=80 --expose
k wait --for=condition=Ready pod/app pod/web -n prod --timeout=120s
clear
k get netpol -n prod
```

---

### Step 1. Does traffic flow now?

**Why:** test once before the policy. After it, the same line must fail.

```
k exec app -n prod -- wget -qO- -T 3 web
```
You see:
```
<title>Welcome to nginx!</title>   <-- open today
```
**Means:** nothing blocks traffic yet. Remember this line for the end.

---

### Step 2. Write the policy

**Why:** there is no `k create netpol`. Copy from the docs page "Network Policies", section "Default policies", box "Default deny all ingress and all egress traffic".

```
vim deny.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny          # <-- CHANGE
  namespace: prod             # <-- CHANGE
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  egress:                     # <-- CHANGE
  - ports:                    # <-- CHANGE
    - protocol: UDP           # <-- CHANGE
      port: 53                # <-- CHANGE
    - protocol: TCP           # <-- CHANGE
      port: 53                # <-- CHANGE
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
k describe netpol default-deny -n prod
```
You see:
```
  PodSelector:     <none> (Allowing the specific traffic to all pods in this namespace)   <-- all pods
  Allowing ingress traffic:
    <none> (Selected pods are isolated for ingress connectivity)   <-- nothing in
  Allowing egress traffic:
    To Port: 53/UDP
    To Port: 53/TCP
    To: <any> (traffic not restricted by destination)
  Policy Types: Ingress, Egress   <-- both directions
```
**Means:** exactly what the question asks.

---

### Verify

**Why:** prove DNS works and everything else is blocked.

```
k exec app -n prod -- nslookup web.prod.svc.cluster.local
k exec app -n prod -- wget -qO- -T 3 web
```
You see:
```
Name:	web.prod.svc.cluster.local   <-- DNS still works
...
wget: download timed out   <-- traffic blocked
command terminated with exit code 1
```

---

### Three words first

- **Egress** = traffic going OUT of the selected pods.
- **Default deny** = a policy with `podSelector: {}`. It selects all pods and allows nothing.
- **Port 53** = the DNS port, on UDP and TCP.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |t|h|e| |V|e|r|i|f|y| |`|w|g|e|t|`| |s|t|i|l|l| |p|r|i|n|t|s| |t|h|e| |n|g|i|n|x| |p|a|g|e| ||| |t|h|e| |n|e|t|w|o|r|k| |p|l|u|g|i|n| |d|o|e|s| |n|o|t| |e|n|f|o|r|c|e| |p|o|l|i|c|i|e|s| ||| |t|r|u|s|t| |t|h|e| |d|e|s|c|r|i|b|e| |o|u|t|p|u|t|;| |t|h|e| |e|x|a|m| |c|l|u|s|t|e|r| |e|n|f|o|r|c|e|s| |t|h|e|m| |||
||| |`|n|s|l|o|o|k|u|p|`| |t|i|m|e|s| |o|u|t| |t|o|o| ||| |t|h|e| |e|g|r|e|s|s| |b|l|o|c|k| |i|s| |m|i|s|s|i|n|g| |o|r| |m|i|s|-|i|n|d|e|n|t|e|d| ||| |`|e|g|r|e|s|s|:|`| |s|t|a|r|t|s| |i|n| |t|h|e| |s|a|m|e| |c|o|l|u|m|n| |a|s| |`|p|o|l|i|c|y|T|y|p|e|s|:|`|;| |a|p|p|l|y| |a|g|a|i|n| |||
||| |`|k| |g|e|t| |n|e|t|p|o|l| |-|n| |p|r|o|d|`| |s|h|o|w|s| |n|o|t|h|i|n|g| ||| |t|h|e| |p|o|l|i|c|y| |l|a|n|d|e|d| |i|n| |`|d|e|f|a|u|l|t|`| ||| |a|d|d| |`|n|a|m|e|s|p|a|c|e|:| |p|r|o|d|`|,| |a|p|p|l|y|;| |`|k| |d|e|l|e|t|e| |n|e|t|p|o|l| |d|e|f|a|u|l|t|-|d|e|n|y| |-|n| |d|e|f|a|u|l|t|`| |||
||| |`|e|r|r|o|r| |p|a|r|s|i|n|g| |d|e|n|y|.|y|a|m|l|`| ||| |t|a|b|s| |o|r| |b|r|o|k|e|n| |s|p|a|c|e|s| |f|r|o|m| |t|h|e| |p|a|s|t|e| ||| |u|s|e| |`|:|s|e|t| |p|a|s|t|e|`|,| |r|e|t|y|p|e| |t|h|e| |s|p|a|c|e|s| |||

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
k delete ns nginx-static --ignore-not-found
rm -f /root/cm-backup.yaml
k create ns nginx-static
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
k create cm nginx-config -n nginx-static --from-file=nginx.conf=/tmp/nginx.conf
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
k expose deploy nginx-static --port=443 -n nginx-static
k rollout status deploy/nginx-static -n nginx-static --timeout=120s
clear
k get cm nginx-config -n nginx-static -o yaml | grep ssl_protocols
```

---

### Step 1. Back up the ConfigMap

**Why:** one wrong character breaks nginx. A backup lets you start over.

```
k get cm nginx-config -n nginx-static -o yaml > /root/cm-backup.yaml
grep ssl_protocols /root/cm-backup.yaml
```
You see:
```
    ssl_protocols TLSv1.2 TLSv1.3;   <-- TLSv1.2 must go
```
**Means:** the backup holds the old line. Now change the real one.

---

### Step 2. How do the pods get the file?

**Why:** the mount decides whether the pods ever see a change.

```
k get deploy nginx-static -n nginx-static -o yaml | grep subPath
```
You see:
```
          subPath: nginx.conf   <-- copied once, at pod start
```
**Means:** a `subPath` file never updates. The pods need a restart.

---

### Step 3. Remove TLSv1.2

**Why:** the setting lives inside the ConfigMap's `nginx.conf` text.

```
k edit cm nginx-config -n nginx-static
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
k rollout restart deploy nginx-static -n nginx-static
k rollout status deploy nginx-static -n nginx-static
```
You see:
```
deployment.apps/nginx-static restarted
deployment "nginx-static" successfully rolled out   <-- new pod, new config
```

---

### Verify

**Why:** prove the server refuses TLSv1.2 and accepts TLSv1.3.

```
IP=$(k get svc nginx-static -n nginx-static -o jsonpath='{.spec.clusterIP}')
openssl s_client -connect $IP:443 -tls1_2 </dev/null 2>&1 | grep -E 'alert|New,'
openssl s_client -connect $IP:443 -tls1_3 </dev/null 2>&1 | grep -E 'alert|New,'
```
You see:
```
...:tlsv1 alert protocol version:...   <-- TLSv1.2 refused
New, (NONE), Cipher is (NONE)
New, TLSv1.3, Cipher is ...            <-- TLSv1.3 works
```
**Don't:** test before Step 4. The old pod still accepts TLSv1.2.

---

### Three words first

- **ssl_protocols** = the nginx line that lists the TLS versions it accepts.
- **subPath** = mounts one file from a ConfigMap. It never updates by itself.
- **openssl s_client** = opens a TLS connection. `-tls1_2` forces version 1.2.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |t|h|e| |e|d|i|t| |i|s| |r|e|f|u|s|e|d|:| |`|f|i|e|l|d| |i|s| |i|m|m|u|t|a|b|l|e|`| ||| |t|h|e| |C|o|n|f|i|g|M|a|p| |h|a|s| |`|i|m|m|u|t|a|b|l|e|:| |t|r|u|e|`| ||| |f|i|x| |t|h|e| |l|i|n|e| |i|n| |`|v|i|m| |/|r|o|o|t|/|c|m|-|b|a|c|k|u|p|.|y|a|m|l|`|;| |`|k| |r|e|p|l|a|c|e| |-|-|f|o|r|c|e| |-|f| |/|r|o|o|t|/|c|m|-|b|a|c|k|u|p|.|y|a|m|l|`|;| |t|h|e|n| |S|t|e|p| |4| |||
||| |n|e|w| |p|o|d| |i|n| |`|C|r|a|s|h|L|o|o|p|B|a|c|k|O|f|f|`| ||| |n|g|i|n|x| |s|y|n|t|a|x| |b|r|o|k|e|n|,| |o|f|t|e|n| |a| |m|i|s|s|i|n|g| |`|;|`| ||| |`|k| |l|o|g|s| |-|n| |n|g|i|n|x|-|s|t|a|t|i|c| |-|l| |a|p|p|=|n|g|i|n|x|-|s|t|a|t|i|c|`| |n|a|m|e|s| |t|h|e| |l|i|n|e|;| |f|i|x| |t|h|e| |C|o|n|f|i|g|M|a|p|,| |r|e|s|t|a|r|t| |a|g|a|i|n| |||
||| |`|r|o|l|l|o|u|t| |s|t|a|t|u|s|`| |w|a|i|t|s| |f|o|r|e|v|e|r| ||| |t|h|e| |n|e|w| |p|o|d| |c|a|n|n|o|t| |s|t|a|r|t| ||| |`|k| |g|e|t| |p|o| |-|n| |n|g|i|n|x|-|s|t|a|t|i|c|`|,| |t|h|e|n| |`|k| |d|e|s|c|r|i|b|e|`| |t|h|e| |n|e|w| |p|o|d| |||

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
k delete ns web --ignore-not-found
k delete pod t --ignore-not-found
[ -f /root/coredns-backup.yaml ] && k replace --force -f /root/coredns-backup.yaml
k get cm coredns -n kube-system -o yaml | sed '/rewrite name api.example.com/d' | k replace -f -
rm -f /root/coredns-backup.yaml
k scale deploy coredns -n kube-system --replicas=2
k rollout restart deploy coredns -n kube-system
k rollout status deploy coredns -n kube-system --timeout=120s
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 -n web
k rollout status deploy/backend -n web --timeout=120s
clear
k get cm coredns -n kube-system -o jsonpath='{.data.Corefile}'
```

---

### Step 1. Back up the Corefile

**Why:** one typo breaks DNS for the whole cluster. The backup is your way back.

```
k get cm coredns -n kube-system -o yaml > /root/coredns-backup.yaml
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
k get svc backend-svc -n web
```
You see:
```
backend-svc   ClusterIP   10.x.x.x   <none>   80/TCP   1m   <-- note this CLUSTER-IP
```
**Means:** the full target name is `backend-svc.web.svc.cluster.local`.

---

### Step 3. Add the rewrite line

**Why:** the Corefile lives in ConfigMap `coredns`. The docs page "Customizing DNS Service" shows it.

```
k edit cm coredns -n kube-system
```
Put the cursor on `ready`. Press `o`. Type the marked line, same indent as `ready`:
```
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        ready
        rewrite name api.example.com backend-svc.web.svc.cluster.local   # <-- CHANGE
        kubernetes cluster.local in-addr.arpa ip6.arpa {
```
Save with `Esc`, `:wq`.

You see:
```
configmap/coredns edited
```
**Don't:** type the `# <-- CHANGE` part. It is only a marker here.

---

### Step 4. Restart CoreDNS

**Why:** new pods load the new Corefile at once.

```
k rollout restart deploy coredns -n kube-system
k rollout status deploy coredns -n kube-system
```
You see:
```
deployment.apps/coredns restarted
deployment "coredns" successfully rolled out   <-- DNS is back up
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
Address: 10.x.x.x   <-- same as the CLUSTER-IP from Step 2
```
**Don't:** read the first `Address` line. That one is the DNS server itself.

---

### Three words first

- **Corefile** = the CoreDNS config text, in ConfigMap `coredns`, namespace `kube-system`.
- **`.:53 { }`** = the main block of the Corefile. Each line inside is a plugin.
- **rewrite name A B** = a question for name A is answered as if it asked for B.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |C|o|r|e|D|N|S| |p|o|d|s| |i|n| |`|C|r|a|s|h|L|o|o|p|B|a|c|k|O|f|f|`| ||| |a| |t|y|p|o| |i|n| |t|h|e| |C|o|r|e|f|i|l|e| ||| |`|k| |r|e|p|l|a|c|e| |-|-|f|o|r|c|e| |-|f| |/|r|o|o|t|/|c|o|r|e|d|n|s|-|b|a|c|k|u|p|.|y|a|m|l|`|;| |r|e|s|t|a|r|t| |C|o|r|e|D|N|S|;| |d|o| |S|t|e|p| |3| |a|g|a|i|n| |||
||| |`|N|X|D|O|M|A|I|N|`| |f|o|r| |`|a|p|i|.|e|x|a|m|p|l|e|.|c|o|m|`| ||| |t|h|e| |l|i|n|e| |i|s| |o|u|t|s|i|d|e| |`|.|:|5|3| |{| |}|`|,| |o|r| |a| |t|y|p|o| |i|n| |t|h|e| |t|a|r|g|e|t| ||| |`|k| |e|d|i|t| |c|m| |c|o|r|e|d|n|s| |-|n| |k|u|b|e|-|s|y|s|t|e|m|`|,| |c|h|e|c|k| |t|h|e| |l|i|n|e|,| |r|e|s|t|a|r|t| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |w|a|n|t|s| |a| |w|h|o|l|e| |d|o|m|a|i|n| |s|e|n|t| |t|o| |a|n|o|t|h|e|r| |D|N|S| |s|e|r|v|e|r| ||| |t|h|a|t| |n|e|e|d|s| |a| |n|e|w| |b|l|o|c|k|,| |n|o|t| |`|r|e|w|r|i|t|e|`| ||| |d|o|c|s| |"|C|u|s|t|o|m|i|z|i|n|g| |D|N|S| |S|e|r|v|i|c|e|"|:| |`|e|x|a|m|p|l|e|.|o|r|g|:|5|3| |{| |f|o|r|w|a|r|d| |.| |1|0|.|0|.|0|.|5|3| |}|`| |||
||| |`|p|o|d|s| |"|t|"| |a|l|r|e|a|d|y| |e|x|i|s|t|s|`| ||| |a|n| |o|l|d| |t|e|s|t| |p|o|d| |w|a|s| |l|e|f|t| |b|e|h|i|n|d| ||| |`|k| |d|e|l|e|t|e| |p|o|d| |t|`|,| |t|e|s|t| |a|g|a|i|n| |||

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
k delete ns web --ignore-not-found
k delete pod t --ignore-not-found
rm -f /root/dns.txt
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 -n web
k rollout status deploy/backend -n web --timeout=120s
clear
k get svc -n web
```

---

### Step 1. Where does the Service live?

**Why:** a short name only works from the same namespace.

```
k get svc -A | grep backend-svc
```
You see:
```
web   backend-svc   ClusterIP   10.x.x.x   <none>   80/TCP   1m   <-- namespace web, note the IP
```
**Means:** from `default`, use `SERVICE.NAMESPACE.svc.cluster.local`: `backend-svc.web.svc.cluster.local`.

---

### Step 2. Test the name on screen

**Why:** see a good answer before you write the file.

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup backend-svc.web.svc.cluster.local
```
You see:
```
Name:	backend-svc.web.svc.cluster.local
Address: 10.x.x.x   <-- same IP as Step 1
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
You see:
```
Server:		10.96.0.10
Address:	10.96.0.10:53   <-- the DNS server, not the answer

Name:	backend-svc.web.svc.cluster.local
Address: 10.x.x.x   <-- the answer
```
**Don't:** use `-it` here. A terminal is not needed when the output goes into a file.

---

### Verify

**Why:** prove the file's IP is the Service's IP.

```
k get svc backend-svc -n web -o jsonpath='{.spec.clusterIP}{"\n"}'
```
You see:
```
10.x.x.x   <-- same as the Address under Name: in the file
```

---

### Three words first

- **FQDN** = the full name, `SERVICE.NAMESPACE.svc.cluster.local`. It works from every namespace.
- **`--rm -i`** = run once, pass the output back, then delete the pod.
- **`>`** = shell: write the output into a file.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|N|X|D|O|M|A|I|N|`| |/| |`|c|a|n|'|t| |f|i|n|d|`| ||| |a| |t|y|p|o|,| |o|r| |t|h|e| |w|r|o|n|g| |n|a|m|e|s|p|a|c|e| |i|n| |t|h|e| |n|a|m|e| ||| |r|e|b|u|i|l|d| |t|h|e| |n|a|m|e| |f|r|o|m| |S|t|e|p| |1| |||
||| |`|p|o|d|s| |"|t|"| |a|l|r|e|a|d|y| |e|x|i|s|t|s|`| ||| |a|n| |o|l|d|e|r| |t|e|s|t| |p|o|d| |i|s| |s|t|i|l|l| |t|h|e|r|e| ||| |`|k| |d|e|l|e|t|e| |p|o|d| |t|`|,| |r|u|n| |i|t| |a|g|a|i|n| |||
||| |t|h|e| |f|i|l|e| |a|l|s|o| |h|o|l|d|s| |`|p|o|d| |"|t|"| |d|e|l|e|t|e|d|`| ||| |t|h|a|t| |l|i|n|e| |c|o|m|e|s| |f|r|o|m| |k|u|b|e|c|t|l| ||| |u|s|u|a|l|l|y| |a|c|c|e|p|t|e|d|;| |o|r| |r|u|n| |w|i|t|h|o|u|t| |`|-|-|r|m|`|,| |t|h|e|n| |`|k| |l|o|g|s| |t| |>| |/|r|o|o|t|/|d|n|s|.|t|x|t|`|,| |`|k| |d|e|l|e|t|e| |p|o|d| |t|`| |||
||| |`|*|*|*| |C|a|n|'|t| |f|i|n|d| |.|.|.|:| |N|o| |a|n|s|w|e|r|`| ||| |b|u|s|y|b|o|x| |a|l|s|o| |a|s|k|s| |f|o|r| |I|P|v|6|;| |t|h|e|r|e| |i|s| |n|o|n|e| ||| |n|o|r|m|a|l|,| |i|g|n|o|r|e| |i|t| |||
||| |e|v|e|r|y| |n|a|m|e| |f|a|i|l|s| ||| |D|N|S| |i|t|s|e|l|f| |i|s| |b|r|o|k|e|n| ||| |q|u|e|s|t|i|o|n| |1|1| |||

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
k delete ns work --ignore-not-found
rm -f app.yaml app-backup.yaml
k create ns work
k create deploy app --image=busybox:1.36 -n work -- sh -c "while true; do date >> /var/log/app.log; sleep 2; done"
k rollout status deploy/app -n work --timeout=120s
clear
k get po -n work
```

---

### Step 1. Save the Deployment to a file

**Why:** a long edit is safer in a file, with a backup.

```
k get deploy app -n work -o yaml > app.yaml
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
        name: busybox   <-- the main container
        resources: {}
```
**Means:** one container, no volume yet.

---

### Step 2. Add the three pieces

**Why:** containers share files only through a volume. Docs page: "Communicate Between Containers in the Same Pod Using a Shared Volume".

```
vim app.yaml
```
The pod template's `spec:`, finished. Only `# <-- CHANGE` lines are new:
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
        volumeMounts:                                  # <-- CHANGE
        - name: logs                                   # <-- CHANGE
          mountPath: /var/log                          # <-- CHANGE
      - name: log-shipper                              # <-- CHANGE
        image: busybox:1.36                            # <-- CHANGE
        command: ["tail", "-f", "/var/log/app.log"]    # <-- CHANGE
        volumeMounts:                                  # <-- CHANGE
        - name: logs                                   # <-- CHANGE
          mountPath: /var/log                          # <-- CHANGE
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      schedulerName: default-scheduler
      securityContext: {}
      terminationGracePeriodSeconds: 30
      volumes:                                         # <-- CHANGE
      - name: logs                                     # <-- CHANGE
        emptyDir: {}                                   # <-- CHANGE
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
You see:
```
Warning: resource deployments/app is missing the kubectl.kubernetes.io/last-applied-configuration annotation ...   <-- harmless
deployment.apps/app configured
```

---

### Step 4. Does the new pod run both containers?

**Why:** the change makes a new pod.

```
k rollout status deploy app -n work
k get po -n work
```
You see:
```
deployment "app" successfully rolled out
app-...   2/2   Running   0   20s   <-- main + sidecar
```

---

### Verify

**Why:** prove the sidecar reads the main container's file.

```
k logs deploy/app -c log-shipper -n work --tail=3
```
You see:
```
Tue Nov 24 10:00:01 UTC 2026   <-- date lines; yours differ
...
```

---

### Three words first

- **Sidecar** = a helper container in the same pod.
- **emptyDir** = an empty folder owned by the pod, shared by its mounts.
- **volumeMounts** = where a volume appears inside one container.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|e|r|r|o|r| |c|o|n|v|e|r|t|i|n|g| |Y|A|M|L|`| ||| |w|r|o|n|g| |i|n|d|e|n|t|a|t|i|o|n|,| |o|r| |a| |T|a|b| ||| |s|p|a|c|e|s| |o|n|l|y|;| |c|o|m|p|a|r|e| |w|i|t|h| |S|t|e|p| |2| |||
||| |`|I|n|i|t|:|C|r|a|s|h|L|o|o|p|B|a|c|k|O|f|f|`| ||| |n|a|t|i|v|e| |s|i|d|e|c|a|r| |(|`|i|n|i|t|C|o|n|t|a|i|n|e|r|s|:|`| |+| |`|r|e|s|t|a|r|t|P|o|l|i|c|y|:| |A|l|w|a|y|s|`|)| |s|t|a|r|t|s| |f|i|r|s|t|;| |`|t|a|i|l| |-|f|`| |q|u|i|t|s|,| |n|o| |f|i|l|e| |y|e|t| ||| |m|o|v|e| |i|t| |u|n|d|e|r| |`|c|o|n|t|a|i|n|e|r|s|:|`|,| |a|f|t|e|r| |`|b|u|s|y|b|o|x|`| |||
||| |s|i|d|e|c|a|r| |l|o|g|:| |`|t|a|i|l|:| |c|a|n|'|t| |o|p|e|n| |'|/|v|a|r|/|l|o|g|/|a|p|p|.|l|o|g|'|`| ||| |m|a|i|n| |c|o|n|t|a|i|n|e|r| |l|a|c|k|s| |t|h|e| |m|o|u|n|t|,| |o|r| |n|a|m|e|s| |d|i|f|f|e|r| ||| |`|n|a|m|e|:| |l|o|g|s|`| |i|n| |a|l|l| |3| |p|l|a|c|e|s| |||
||| |R|E|S|T|A|R|T|S| |`|1|`| ||| |t|h|e| |s|i|d|e|c|a|r| |b|e|a|t| |t|h|e| |f|i|l|e| |b|y| |a| |m|o|m|e|n|t| ||| |n|o|t|h|i|n|g|;| |i|t| |r|e|s|t|a|r|t|e|d| |f|i|n|e| |||
||| |t|h|e| |f|i|l|e| |i|s| |a| |m|e|s|s| ||| |m|a|n|y| |e|d|i|t|s| |w|e|n|t| |w|r|o|n|g| ||| |`|c|p| |a|p|p|-|b|a|c|k|u|p|.|y|a|m|l| |a|p|p|.|y|a|m|l|`|,| |r|e|d|o| |S|t|e|p| |2| |||

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
k delete ns shop --ignore-not-found
k create ns shop
k create deploy web --image=nginx:1.27 -n shop
k set resources deploy web -n shop --requests=cpu=100m
k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.8.0/components.yaml
k get deploy metrics-server -n kube-system -o jsonpath='{.spec.template.spec.containers[0].args}' | grep -q kubelet-insecure-tls || k patch deploy metrics-server -n kube-system --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
k -n kube-system rollout status deploy metrics-server --timeout=180s
k rollout status deploy/web -n shop --timeout=120s
for i in $(seq 1 24); do k top nodes >/dev/null 2>&1 && break; sleep 5; done
clear
k get hpa -n shop
```

---

### Step 1. Does the Deployment request CPU?

**Why:** 70% means 70% of the CPU request. No request, no percentage.

```
k get deploy web -n shop -o jsonpath='{.spec.template.spec.containers[0].resources}'
```
You see:
```
{"requests":{"cpu":"100m"}}   <-- a CPU request exists
```
**Means:** the HPA can calculate.

---

### Step 2. Create the HPA

**Why:** one command sets min, max and the CPU target.

```
k autoscale deploy web --min=2 --max=5 --cpu-percent=70 -n shop
```
You see:
```
horizontalpodautoscaler.autoscaling/web autoscaled
```
**Means:** the HPA is named after the Deployment: `web`.
**Don't:** worry about a "deprecated" warning. It still works.

---

### Step 3. Add the scale-down window

**Why:** `k autoscale` has no flag for it. Docs page: "Horizontal Pod Autoscaling", heading "Stabilization window".

```
k edit hpa web -n shop
```
The `spec:` part, finished. Only `# <-- CHANGE` lines are new:
```
spec:
  behavior:                              # <-- CHANGE
    scaleDown:                           # <-- CHANGE
      stabilizationWindowSeconds: 30     # <-- CHANGE
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
You see:
```
web   Deployment/web   cpu: 0%/70%   2   5   2   1m   <-- min 2, max 5, target 70%
```
**Means:** `<unknown>` in the first minute is normal. Run it again.

---

### Verify

**Why:** prove the window is saved.

```
k get hpa web -n shop -o jsonpath='{.spec.behavior.scaleDown.stabilizationWindowSeconds}'
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|A|l|r|e|a|d|y|E|x|i|s|t|s|`| ||| |a|n| |H|P|A| |`|w|e|b|`| |e|x|i|s|t|s| ||| |f|i|x| |i|t| |w|i|t|h| |`|k| |e|d|i|t| |h|p|a| |w|e|b| |-|n| |s|h|o|p|`| |||
||| |`|<|u|n|k|n|o|w|n|>|`| |a|f|t|e|r| |2| |m|i|n|;| |`|k| |t|o|p| |p|o|d|s| |-|n| |s|h|o|p|`| |f|a|i|l|s| ||| |m|e|t|r|i|c|s|-|s|e|r|v|e|r| |m|i|s|s|i|n|g| |o|r| |s|t|a|r|t|i|n|g| ||| |r|u|n| |P|a|r|t| |A| |a|g|a|i|n|;| |t|h|e| |e|x|a|m| |h|a|s| |i|t| |||
||| |v|i|m| |r|e|o|p|e|n|s|,| |e|r|r|o|r| |c|o|m|m|e|n|t| |o|n| |t|o|p| ||| |a| |T|a|b| |o|r| |w|r|o|n|g| |i|n|d|e|n|t| ||| |f|i|x| |t|h|e| |3| |l|i|n|e|s|,| |`|:|w|q|`| |a|g|a|i|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |w|a|n|t|s| |a|n|o|t|h|e|r| |H|P|A| |n|a|m|e| ||| |n|a|m|e|d| |a|f|t|e|r| |t|h|e| |D|e|p|l|o|y|m|e|n|t| ||| |a|d|d| |`|-|-|n|a|m|e|=|<|n|a|m|e|>|`| |i|n| |S|t|e|p| |2| |||

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
k delete ns shop --ignore-not-found
k delete pc high-priority mid-prio low-prio --ignore-not-found
k create ns shop
k create deploy web --image=nginx:1.27 -n shop
k create pc mid-prio --value=1000
k create pc low-prio --value=100
k rollout status deploy/web -n shop --timeout=120s
clear
k get pc
```

---

### Step 1. Which user-defined class is highest?

**Why:** the new value depends on it. Classes have no namespace.

```
k get pc
```
You see:
```
low-prio                  100          false   1m   ...
mid-prio                  1000         false   1m   ...   <-- highest user-defined
system-cluster-critical   2000000000   false   5h   ...   <-- ignore
system-node-critical      2000001000   false   5h   ...   <-- ignore
```
**Means:** highest user-defined = `1000`. One less = `999`.
**Don't:** count the `system-` classes.

---

### Step 2. Create the class

**Why:** the Deployment can only name a class that exists.

```
k create pc high-priority --value=999
```
You see:
```
priorityclass.scheduling.k8s.io/high-priority created
```

---

### Step 3. Name the class in the Deployment

**Why:** the class goes in the pod template. Docs page: "Pod Priority and Preemption".

```
k edit deploy web -n shop
```
The pod template's `spec:`, finished. Only the `# <-- CHANGE` line is new:
```
    spec:
      priorityClassName: high-priority   # <-- CHANGE
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
k rollout status deploy web -n shop
```
You see:
```
deployment "web" successfully rolled out
```

---

### Verify

**Why:** prove the pods carry the class.

```
k get po -n shop -o custom-columns=NAME:.metadata.name,CLASS:.spec.priorityClassName,PRIO:.spec.priority
```
You see:
```
NAME      CLASS           PRIO
web-...   high-priority   999   <-- class and value
```
**Means:** a `Terminating` pod may show `<none>`. Run it again.

---

### Three words first

- **PriorityClass** = an object holding a number. Higher is scheduled first.
- **User-defined** = made by an admin, not `system-`.
- **priorityClassName** = the pod line that names the class.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |v|a|l|u|e| |`|1|9|9|9|9|9|9|9|9|9|`| ||| |c|o|u|n|t|e|d| |a| |`|s|y|s|t|e|m|-|`| |c|l|a|s|s| ||| |`|k| |d|e|l|e|t|e| |p|c| |h|i|g|h|-|p|r|i|o|r|i|t|y|`|,| |c|r|e|a|t|e| |a|g|a|i|n| |||
||| |n|o| |n|e|w| |p|o|d|s|;| |`|k| |d|e|s|c|r|i|b|e| |r|s| |-|n| |s|h|o|p|`|:| |`|n|o| |P|r|i|o|r|i|t|y|C|l|a|s|s| |w|i|t|h| |n|a|m|e| |.|.|.|`| ||| |t|y|p|o| |i|n| |t|h|e| |n|a|m|e| ||| |f|i|x| |i|t| |i|n| |`|k| |e|d|i|t| |d|e|p|l|o|y| |w|e|b| |-|n| |s|h|o|p|`| |||
||| |t|h|e| |v|a|l|u|e| |c|a|n|n|o|t| |b|e| |c|h|a|n|g|e|d| ||| |i|t| |i|s| |i|m|m|u|t|a|b|l|e| ||| |d|e|l|e|t|e| |a|n|d| |c|r|e|a|t|e| |a|g|a|i|n| |||
||| |o|t|h|e|r| |p|o|d|s| |g|o|t| |e|v|i|c|t|e|d| ||| |h|i|g|h|e|r| |p|r|i|o|r|i|t|y| |p|u|s|h|e|s| |o|u|t| |l|o|w|e|r| ||| |e|x|p|e|c|t|e|d| |||

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
k delete ns shop --ignore-not-found
k create ns shop
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
k rollout status deploy/web -n shop --timeout=120s
clear
k get po -n shop -o wide
```

---

### Step 1. Take `web` out of the numbers

**Why:** then the node shows only OTHER pods' requests.

```
k scale deploy web --replicas=0 -n shop
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
You see (an example; your numbers differ):
```
Allocatable:
  cpu:                1          <-- offered
  ...
  memory:             1843756Ki  <-- offered
...
  Resource           Requests     Limits
  --------           --------     ------
  cpu                250m (25%)   0 (0%)   <-- reserved
  memory             200Mi (11%)  0 (0%)   <-- reserved
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
1800   <-- memory in Mi
225    <-- CPU per pod, in m
480    <-- memory per pod, in Mi
```
**Means:** CPU 750m × 0.9 ÷ 3 = 225m. Memory 1600Mi × 0.9 ÷ 3 = 480Mi.
**Don't:** copy these numbers. Use your own from Step 2.

---

### Step 4. Set the requests, bring the pods back

**Why:** the requests apply to every new pod.

```
k set resources deploy web -n shop --requests=cpu=225m,memory=480Mi
k scale deploy web --replicas=3 -n shop
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
k get po -n shop -o wide
k describe node node01 | grep -A6 "Allocated resources:"
```
You see:
```
web-...   1/1   Running   0   20s   ...   node01   <-- 3 lines like this
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |o|n|e| |p|o|d| |`|P|e|n|d|i|n|g|`|,| |E|v|e|n|t|s|:| |`|I|n|s|u|f|f|i|c|i|e|n|t| |c|p|u|`| |(|o|r| |m|e|m|o|r|y|)| ||| |r|e|q|u|e|s|t|s| |s|l|i|g|h|t|l|y| |t|o|o| |b|i|g| ||| |l|o|w|e|r| |t|h|e|m| |1|0|%|,| |r|e|p|e|a|t| |S|t|e|p| |4| |||
||| |2| |c|o|n|t|a|i|n|e|r|s| |p|e|r| |p|o|d| ||| |`|s|e|t| |r|e|s|o|u|r|c|e|s|`| |s|e|t|s| |E|V|E|R|Y| |c|o|n|t|a|i|n|e|r| ||| |d|i|v|i|d|e| |b|y| |6|,| |o|r| |n|a|m|e| |o|n|e| |c|o|n|t|a|i|n|e|r| |w|i|t|h| |`|-|c| |<|n|a|m|e|>|`| |||
||| |t|h|e| |p|o|d| |h|a|s| |i|n|i|t| |c|o|n|t|a|i|n|e|r|s| ||| |t|h|e| |b|i|g|g|e|r| |o|f| |i|n|i|t| |o|r| |a|p|p| |r|e|q|u|e|s|t|s| |c|o|u|n|t|s| ||| |k|e|e|p| |i|n|i|t| |r|e|q|u|e|s|t|s| |a|t| |o|r| |b|e|l|o|w| |a|p|p| |r|e|q|u|e|s|t|s| |||

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
k delete ns app --ignore-not-found
rm -f pod.yaml
k create ns app
clear
k get cm,secret -n app
```

---

### Step 1. Create the ConfigMap and the Secret

**Why:** both have a one-line create command. No YAML needed.

```
k create cm app-cfg --from-literal=LOG_LEVEL=debug -n app
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
k run api --image=nginx:1.27 -n app --dry-run=client -o yaml > pod.yaml
cat pod.yaml
```
You see:
```
...
spec:
  containers:
  - image: nginx:1.27
    name: api
    resources: {}   <-- container level starts 4 spaces in
  dnsPolicy: ClusterFirst   <-- pod level starts 2 spaces in
...
```

---

### Step 3. Add envFrom and the Secret volume

**Why:** copy the blocks from the docs pages "Configure a Pod to Use a ConfigMap" and "Secrets".

```
vim pod.yaml
```
The finished file. Only the `# <-- CHANGE` lines are new:
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
    envFrom:                 # <-- CHANGE
    - configMapRef:          # <-- CHANGE
        name: app-cfg        # <-- CHANGE
    volumeMounts:            # <-- CHANGE
    - name: db               # <-- CHANGE
      mountPath: /etc/db     # <-- CHANGE
  volumes:                   # <-- CHANGE
  - name: db                 # <-- CHANGE
    secret:                  # <-- CHANGE
      secretName: db-sec     # <-- CHANGE
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
api   1/1   Running   0   10s   <-- Running
```

---

### Verify

**Why:** prove the variable and the file are inside the container.

```
k exec api -n app -- env | grep LOG_LEVEL
k exec api -n app -- cat /etc/db/password
```
You see:
```
LOG_LEVEL=debug
s3cret   <-- your prompt may follow on the same line
```

---

### Three words first

- **ConfigMap** = plain settings stored as `KEY=VALUE`.
- **Secret** = the same, for sensitive values like passwords.
- **envFrom** = turns every key of a ConfigMap into an environment variable.
- **volumes + volumeMounts** = `volumes` names the storage; `volumeMounts` shows it at a path. Each key becomes a file.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |S|T|A|T|U|S| |`|C|r|e|a|t|e|C|o|n|t|a|i|n|e|r|C|o|n|f|i|g|E|r|r|o|r|`| ||| |t|h|e| |C|o|n|f|i|g|M|a|p| |n|a|m|e| |i|n| |`|e|n|v|F|r|o|m|`| |d|o|e|s| |n|o|t| |e|x|i|s|t| ||| |`|k| |d|e|s|c|r|i|b|e| |p|o|d| |a|p|i| |-|n| |a|p|p|`| |n|a|m|e|s| |i|t|;| |d|e|l|e|t|e| |t|h|e| |p|o|d|,| |f|i|x|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |S|T|A|T|U|S| |s|t|a|y|s| |`|C|o|n|t|a|i|n|e|r|C|r|e|a|t|i|n|g|`| ||| |t|h|e| |S|e|c|r|e|t| |n|a|m|e| |i|n| |`|v|o|l|u|m|e|s|`| |d|o|e|s| |n|o|t| |e|x|i|s|t| ||| |r|e|a|d| |E|v|e|n|t|s| |i|n| |`|k| |d|e|s|c|r|i|b|e| |p|o|d| |a|p|i| |-|n| |a|p|p|`|;| |f|i|x| |`|s|e|c|r|e|t|N|a|m|e|:|`| |||
||| |`|u|n|k|n|o|w|n| |f|i|e|l|d| |"|s|p|e|c|.|c|o|n|t|a|i|n|e|r|s|[|0|]|.|v|o|l|u|m|e|s|"|`| ||| |`|v|o|l|u|m|e|s|:|`| |i|s| |i|n|d|e|n|t|e|d| |u|n|d|e|r| |t|h|e| |c|o|n|t|a|i|n|e|r| ||| |m|o|v|e| |i|t| |t|o| |t|h|e| |c|o|l|u|m|n| |o|f| |`|c|o|n|t|a|i|n|e|r|s|:|`| |||
||| |`|F|o|r|b|i|d|d|e|n|:| |p|o|d| |u|p|d|a|t|e|s| |m|a|y| |n|o|t| |c|h|a|n|g|e| |f|i|e|l|d|s| |o|t|h|e|r| |t|h|a|n| |.|.|.|`| ||| |a| |p|o|d|'|s| |e|n|v| |a|n|d| |v|o|l|u|m|e|s| |c|a|n|n|o|t| |c|h|a|n|g|e| ||| |`|k| |d|e|l|e|t|e| |p|o|d| |a|p|i| |-|n| |a|p|p|`|,| |t|h|e|n| |a|p|p|l|y| |a|g|a|i|n| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |w|a|n|t|s| |O|N|E| |k|e|y| |o|n|l|y| ||| |d|i|f|f|e|r|e|n|t| |b|l|o|c|k| ||| |`|e|n|v|:|`| |w|i|t|h| |`|v|a|l|u|e|F|r|o|m|:|`| |/| |`|c|o|n|f|i|g|M|a|p|K|e|y|R|e|f|:|`| |(|s|a|m|e| |d|o|c|s| |p|a|g|e|)| |||

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
k taint node node01 env=prod:NoSchedule- || true
k label node node01 env-
clear
k describe node node01 | grep -i taints
```

---

### Step 1. Taint and label the node

**Why:** the taint keeps pods away; the label lets a pod pick this node.

```
k taint node node01 env=prod:NoSchedule
k label node node01 env=prod
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
Taints:             env=prod:NoSchedule   <-- the taint
NAME     STATUS   ROLES    AGE   VERSION   ENV
node01   Ready    <none>   ...   v1.35.x   prod   <-- the label
```
**Means:** the node is ready for the pod.

---

### Step 3. Generate the pod YAML

**Why:** `--dry-run=client -o yaml` prints the YAML and creates nothing.

```
k run x --image=nginx:1.27 --dry-run=client -o yaml > x.yaml
grep -n containers x.yaml
```
You see:
```
...  containers:   <-- the new blocks go above this line, same column
```

---

### Step 4. Add the toleration and the nodeSelector

**Why:** copy from the docs pages "Taints and Tolerations" and "Assign Pods to Nodes".

```
vim x.yaml
```
The finished file. Only the `# <-- CHANGE` lines are new:
```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: x
  name: x
spec:
  nodeSelector:              # <-- CHANGE
    env: prod                # <-- CHANGE
  tolerations:               # <-- CHANGE
  - key: "env"               # <-- CHANGE
    operator: "Equal"        # <-- CHANGE
    value: "prod"            # <-- CHANGE
    effect: "NoSchedule"     # <-- CHANGE
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
x   1/1   Running   0   15s   192.168.x.x   node01   ...   <-- NODE = node01
```

---

### Three words first

- **Taint** = a mark on a node, `key=value:effect`. `NoSchedule`: no new pods, unless they tolerate it.
- **Toleration** = pod lines that say "I accept this taint". It allows, it does not send.
- **nodeSelector** = pod lines: "only put me on a node with this label".

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|P|e|n|d|i|n|g|`|,| |E|v|e|n|t|s|:| |`|h|a|d| |u|n|t|o|l|e|r|a|t|e|d| |t|a|i|n|t| |{|e|n|v|:| |p|r|o|d|}|`| ||| |k|e|y|,| |v|a|l|u|e| |o|r| |e|f|f|e|c|t| |d|i|f|f|e|r| |f|r|o|m| |t|h|e| |t|a|i|n|t| ||| |`|k| |d|e|l|e|t|e| |p|o|d| |x|`|,| |f|i|x| |`|x|.|y|a|m|l|`|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |`|P|e|n|d|i|n|g|`|,| |E|v|e|n|t|s|:| |`|d|i|d|n|'|t| |m|a|t|c|h| |P|o|d|'|s| |n|o|d|e| |a|f|f|i|n|i|t|y|/|s|e|l|e|c|t|o|r|`| ||| |t|h|e| |n|o|d|e| |l|a|b|e|l| |i|s| |m|i|s|s|i|n|g| |o|r| |d|i|f|f|e|r|e|n|t| ||| |`|k| |l|a|b|e|l| |n|o|d|e| |n|o|d|e|0|1| |e|n|v|=|p|r|o|d|`| |||
||| |`|a|l|r|e|a|d|y| |h|a|s| |e|n|v| |t|a|i|n|t|(|s|)| |w|i|t|h| |s|a|m|e| |e|f|f|e|c|t|(|s|)|`| ||| |t|h|e| |t|a|i|n|t| |i|s| |a|l|r|e|a|d|y| |t|h|e|r|e| ||| |n|o|t|h|i|n|g| |t|o| |d|o|;| |c|h|e|c|k| |w|i|t|h| |S|t|e|p| |2| |||
||| |`|'|e|n|v|'| |a|l|r|e|a|d|y| |h|a|s| |a| |v|a|l|u|e|`| ||| |t|h|e| |l|a|b|e|l| |i|s| |a|l|r|e|a|d|y| |t|h|e|r|e| ||| |a|d|d| |`|-|-|o|v|e|r|w|r|i|t|e|`| |o|n|l|y| |i|f| |t|h|e| |v|a|l|u|e| |i|s| |w|r|o|n|g| |||
||| |`|u|n|k|n|o|w|n| |f|i|e|l|d| |"|s|p|e|c|.|c|o|n|t|a|i|n|e|r|s|[|0|]|.|t|o|l|e|r|a|t|i|o|n|s|"|`| ||| |t|h|e| |b|l|o|c|k|s| |a|r|e| |i|n|d|e|n|t|e|d| |u|n|d|e|r| |t|h|e| |c|o|n|t|a|i|n|e|r| ||| |m|o|v|e| |t|h|e|m| |t|o| |t|h|e| |c|o|l|u|m|n| |o|f| |`|c|o|n|t|a|i|n|e|r|s|:|`| |||

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
k delete ns shop --ignore-not-found
rm -f /root/image.txt
k create ns shop
k create deploy web --image=nginx:1.27 --replicas=3 -n shop
k rollout status deploy/web -n shop --timeout=120s
clear
k get deploy web -n shop -o wide
```

---

### Step 1. What is the container called?

**Why:** `set image` needs the container name, not the deployment name.

```
k get deploy web -n shop -o wide
```
You see:
```
NAME   READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES       SELECTOR
web    3/3     3            3           1m    nginx        nginx:1.27   app=web   <-- container nginx
```
**Means:** the container is `nginx`. The old image is `nginx:1.27`.

---

### Step 2. Update the image and wait

**Why:** `rollout status` waits until all new pods are ready.

```
k set image deploy/web nginx=nginx:1.28 -n shop
k rollout status deploy/web -n shop
```
You see:
```
deployment.apps/web image updated
Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...
...
deployment "web" successfully rolled out   <-- done
```
**Don't:** write `web=nginx:1.28`. Left of `=` is the container name.

---

### Step 3. Roll back

**Why:** `undo` goes back to the previous revision.

```
k rollout history deploy/web -n shop
k rollout undo deploy/web -n shop
k rollout status deploy/web -n shop
```
You see:
```
REVISION  CHANGE-CAUSE
1         <none>
2         <none>   <-- the 1.28 update
deployment.apps/web rolled back
deployment "web" successfully rolled out
```
**Don't:** run `undo` twice. The second one goes back to `nginx:1.28`.

---

### Step 4. Write the image into the file

**Why:** jsonpath prints one field and nothing else.

```
k get deploy web -n shop -o jsonpath='{.spec.template.spec.containers[0].image}' > /root/image.txt
cat /root/image.txt
```
You see:
```
nginx:1.27   <-- your prompt may follow on the same line
```
**Means:** the rollback worked, and the file holds the answer.

---

### Verify

**Why:** prove all pods run the old image again.

```
k get deploy web -n shop -o wide
```
You see:
```
web    3/3     3            3           3m    nginx        nginx:1.27   app=web   <-- 3/3, 1.27
```

---

### Three words first

- **Rolling update** = new pods replace old ones a few at a time. The app stays up.
- **Revision** = each change of the pod template gets a new number. Old ones are kept.
- **jsonpath** = `-o jsonpath='{...}'` prints only the field you name.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |`|r|o|l|l|o|u|t| |s|t|a|t|u|s|`| |n|e|v|e|r| |f|i|n|i|s|h|e|s| ||| |t|h|e| |n|e|w| |i|m|a|g|e| |d|o|e|s| |n|o|t| |e|x|i|s|t| |(|t|y|p|o|)| ||| |`|C|t|r|l|+|C|`|,| |c|h|e|c|k| |t|h|e| |t|a|g|,| |`|k| |s|e|t| |i|m|a|g|e|`| |a|g|a|i|n| |||
||| |`|u|n|a|b|l|e| |t|o| |f|i|n|d| |c|o|n|t|a|i|n|e|r| |n|a|m|e|d| |"|w|e|b|"|`| ||| |d|e|p|l|o|y|m|e|n|t| |n|a|m|e| |l|e|f|t| |o|f| |`|=|`| ||| |u|s|e| |t|h|e| |C|O|N|T|A|I|N|E|R|S| |c|o|l|u|m|n| |f|r|o|m| |S|t|e|p| |1| |||
||| |`|/|r|o|o|t|/|i|m|a|g|e|.|t|x|t|`| |i|s| |e|m|p|t|y| ||| |a| |t|y|p|o| |i|n| |t|h|e| |j|s|o|n|p|a|t|h| ||| |r|u|n| |i|t| |w|i|t|h|o|u|t| |`|>| |/|r|o|o|t|/|i|m|a|g|e|.|t|x|t|`| |f|i|r|s|t| |||
||| |t|h|e| |q|u|e|s|t|i|o|n| |w|a|n|t|s| |r|e|v|i|s|i|o|n| |1| |e|x|a|c|t|l|y| ||| |m|o|r|e| |t|h|a|n| |o|n|e| |s|t|e|p| |b|a|c|k| ||| |`|k| |r|o|l|l|o|u|t| |u|n|d|o| |d|e|p|l|o|y|/|w|e|b| |-|n| |s|h|o|p| |-|-|t|o|-|r|e|v|i|s|i|o|n|=|1|`| |||

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
k delete ns storage --ignore-not-found
k delete pv pv-data --ignore-not-found
rm -f pv.yaml pvc.yaml pod.yaml
k create ns storage
clear
k get pv,pvc -n storage
```

---

### Step 1. Make the disk (PV)

**Why:** there is no `k create pv`. Copy `pv-volume.yaml` from the docs page "Configure a Pod to Use a PersistentVolume for Storage".

```
vim pv.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data            # <-- CHANGE
spec:
  storageClassName: manual
  capacity:
    storage: 1Gi           # <-- CHANGE
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
pv-data   1Gi        RWO            Retain           Available           manual         ...   <-- free disk
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
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data           # <-- CHANGE
  namespace: storage       # <-- CHANGE
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi       # <-- CHANGE
```
```
k apply -f pvc.yaml
k get pvc -n storage
```
You see:
```
NAME       STATUS   VOLUME    CAPACITY   ACCESS MODES   STORAGECLASS   ...
pvc-data   Bound    pv-data   1Gi        RWO            manual         ...   <-- Bound to pv-data
```
**Means:** class and mode match, and 1Gi fits 500Mi. CAPACITY `1Gi` is correct: the claim gets the whole disk.
**Don't:** go on before you see `Bound`.

---

### Step 3. Give the claim to a pod

**Why:** copy `pv-pod.yaml` from the same page.

```
vim pod.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: v1
kind: Pod
metadata:
  name: web-store          # <-- CHANGE
  namespace: storage       # <-- CHANGE
spec:
  volumes:
    - name: task-pv-storage
      persistentVolumeClaim:
        claimName: pvc-data       # <-- CHANGE
  containers:
    - name: task-pv-container
      image: nginx:1.27           # <-- CHANGE
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
web-store   1/1   Running   0   30s   <-- pod runs
pv-data   1Gi   RWO   Retain   Bound   storage/pvc-data   manual   ...   <-- disk is in use
```
**Don't:** panic at `ContainerCreating`. Wait a few seconds, run it again.

---

### Three words first

- **PV** = PersistentVolume, a disk for the whole cluster. No namespace.
- **PVC** = PersistentVolumeClaim, a request for a disk. It lives in a namespace.
- **storageClassName** = a group name. PV and PVC must have the same one to connect.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |P|V|C| |`|P|e|n|d|i|n|g|`| ||| |c|l|a|s|s| |o|r| |a|c|c|e|s|s| |m|o|d|e| |d|i|f|f|e|r|,| |o|r| |t|h|e| |P|V|C| |a|s|k|s| |f|o|r| |m|o|r|e| |t|h|a|n| |1|G|i| ||| |`|k| |d|e|s|c|r|i|b|e| |p|v|c| |p|v|c|-|d|a|t|a| |-|n| |s|t|o|r|a|g|e|`|;| |d|e|l|e|t|e| |t|h|e| |P|V|C|,| |f|i|x| |`|p|v|c|.|y|a|m|l|`|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |P|V|C| |`|P|e|n|d|i|n|g|`|,| |`|p|v|-|d|a|t|a|`| |s|t|i|l|l| |`|A|v|a|i|l|a|b|l|e|`|;| |l|a|t|e|r| |B|o|u|n|d| |t|o| |`|p|v|c|-|3|f|2|a|.|.|.|`| ||| |`|p|v|c|.|y|a|m|l|`| |l|o|s|t| |i|t|s| |`|s|t|o|r|a|g|e|C|l|a|s|s|N|a|m|e|`| |l|i|n|e|,| |s|o| |t|h|e| |d|e|f|a|u|l|t| |c|l|a|s|s| |m|a|d|e| |a| |n|e|w| |d|i|s|k| ||| |d|e|l|e|t|e| |t|h|e| |p|o|d| |a|n|d| |P|V|C|,| |a|d|d| |`|s|t|o|r|a|g|e|C|l|a|s|s|N|a|m|e|:| |m|a|n|u|a|l|`|,| |a|p|p|l|y| |b|o|t|h| |||
||| |P|o|d| |`|P|e|n|d|i|n|g|`|,| |E|v|e|n|t|s|:| |`|p|e|r|s|i|s|t|e|n|t|v|o|l|u|m|e|c|l|a|i|m| |"|.|.|.|"| |n|o|t| |f|o|u|n|d|`| ||| |t|y|p|o| |i|n| |`|c|l|a|i|m|N|a|m|e|`|,| |o|r| |p|o|d| |i|n| |a|n|o|t|h|e|r| |n|a|m|e|s|p|a|c|e| ||| |`|k| |d|e|l|e|t|e| |p|o|d| |w|e|b|-|s|t|o|r|e| |-|n| |s|t|o|r|a|g|e|`|,| |f|i|x| |`|p|o|d|.|y|a|m|l|`|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |`|m|a|n|u|a|l|`| |v|s| |`|M|a|n|u|a|l|`| ||| |c|l|a|s|s| |n|a|m|e|s| |a|r|e| |c|a|s|e|-|s|e|n|s|i|t|i|v|e| ||| |m|a|k|e| |t|h|e|m| |i|d|e|n|t|i|c|a|l| |||
||| |r|e|-|a|p|p|l|y| |f|a|i|l|s| |w|i|t|h| |`|F|o|r|b|i|d|d|e|n|`| ||| |m|o|s|t| |P|V|C| |a|n|d| |p|o|d| |f|i|e|l|d|s| |c|a|n|n|o|t| |c|h|a|n|g|e| |a|f|t|e|r| |c|r|e|a|t|i|o|n| ||| |d|e|l|e|t|e| |t|h|e| |o|b|j|e|c|t|,| |f|i|x| |t|h|e| |f|i|l|e|,| |a|p|p|l|y| |a|g|a|i|n| |||

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
- **Prove:** `k get sc` shows `(default)` next to `fast` only.

### Time budget

Target 5 min. Skip at 8.

---

### PART A. Build the exam (Killercoda only)

```
k delete sc fast standard --ignore-not-found
rm -f sc.yaml
k patch sc local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
clear
k get sc
```

---

### Step 1. Who is the default now?

**Why:** you must take the mark off this class later.

```
k get sc
```
You see:
```
NAME                   PROVISIONER             ...
local-path (default)   rancher.io/local-path   ...   <-- write this name down
```
**Means:** the old default is `local-path`. A StorageClass has no namespace, so no `-n`.

---

### Step 2. Write the StorageClass

**Why:** there is no `k create sc`. Copy the example under "StorageClass objects" on the docs page "Storage Classes".

```
vim sc.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast                                              # <-- CHANGE
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"   # <-- CHANGE
provisioner: rancher.io/local-path                        # <-- CHANGE
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
k get sc
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
k get sc
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

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |r|e|-|a|p|p|l|y| |f|a|i|l|s| |w|i|t|h| |`|F|o|r|b|i|d|d|e|n|`| |a|f|t|e|r| |a| |t|y|p|o| ||| |`|p|r|o|v|i|s|i|o|n|e|r|`| |a|n|d| |`|v|o|l|u|m|e|B|i|n|d|i|n|g|M|o|d|e|`| |c|a|n|n|o|t| |c|h|a|n|g|e| |a|f|t|e|r| |c|r|e|a|t|i|o|n| ||| |`|k| |d|e|l|e|t|e| |s|c| |f|a|s|t|`|,| |f|i|x| |`|s|c|.|y|a|m|l|`|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |`|c|a|n|n|o|t| |u|n|m|a|r|s|h|a|l| |b|o|o|l| |.|.|.| |o|f| |t|y|p|e| |s|t|r|i|n|g|`| ||| |`|i|s|-|d|e|f|a|u|l|t|-|c|l|a|s|s|:| |t|r|u|e|`| |w|i|t|h|o|u|t| |q|u|o|t|e|s| ||| |w|r|i|t|e| |`|"|t|r|u|e|"|`| |||
||| |a| |t|e|s|t| |P|V|C| |s|t|a|y|s| |`|P|e|n|d|i|n|g|`| ||| |n|o|r|m|a|l| |w|i|t|h| |`|W|a|i|t|F|o|r|F|i|r|s|t|C|o|n|s|u|m|e|r|`|:| |i|t| |w|a|i|t|s| |f|o|r| |a| |p|o|d| ||| |d|o| |n|o|t| |"|f|i|x|"| |i|t| |||
||| |n|o| |`|(|d|e|f|a|u|l|t|)|`| |a|t| |a|l|l| ||| |y|o|u| |p|a|t|c|h|e|d| |`|f|a|s|t|`| |i|n|s|t|e|a|d| |o|f| |t|h|e| |o|l|d| |c|l|a|s|s| ||| |p|a|t|c|h| |`|f|a|s|t|`| |b|a|c|k| |t|o| |`|"|t|r|u|e|"|`| |||
||| |y|o|u| |f|i|n|i|s|h|e|d| |a|n|d| |w|a|n|t| |t|h|e| |p|l|a|y|g|r|o|u|n|d| |a|s| |i|t| |w|a|s| ||| |`|f|a|s|t|`| |i|s| |s|t|i|l|l| |t|h|e| |d|e|f|a|u|l|t| ||| |`|k| |d|e|l|e|t|e| |s|c| |f|a|s|t| |s|t|a|n|d|a|r|d| |-|-|i|g|n|o|r|e|-|n|o|t|-|f|o|u|n|d|`|,| |t|h|e|n| |`|k| |p|a|t|c|h| |s|c| |l|o|c|a|l|-|p|a|t|h| |-|p| |'|{|"|m|e|t|a|d|a|t|a|"|:|{|"|a|n|n|o|t|a|t|i|o|n|s|"|:|{|"|s|t|o|r|a|g|e|c|l|a|s|s|.|k|u|b|e|r|n|e|t|e|s|.|i|o|/|i|s|-|d|e|f|a|u|l|t|-|c|l|a|s|s|"|:|"|t|r|u|e|"|}|}|}|'|`| |||

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
k delete ns mariadb --ignore-not-found
k delete pv mariadb-pv --ignore-not-found
rm -f pvc.yaml
k create ns mariadb
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
mariadb-pv   250Mi      RWO            Retain           Available                          ...   <-- class is EMPTY
```
**Means:** 250Mi, ReadWriteOnce, free, and no class. Your PVC must repeat these.

---

### Step 2. Write the PVC and bind it

**Why:** there is no `k create pvc`. Copy `pv-claim.yaml` from the docs page "Configure a Pod to Use a PersistentVolume for Storage".

```
vim pvc.yaml
```
The finished file. Only the `# <-- CHANGE` lines differ from the docs:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mariadb            # <-- CHANGE
  namespace: mariadb       # <-- CHANGE
spec:
  storageClassName: ""     # <-- CHANGE
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 250Mi       # <-- CHANGE
```
```
k apply -f pvc.yaml
k get pvc -n mariadb
```
You see:
```
NAME      STATUS   VOLUME       CAPACITY   ACCESS MODES   ...
mariadb   Bound    mariadb-pv   250Mi      RWO            ...   <-- the OLD disk
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
mariadb-...   1/1   Running   0   1m   <-- app runs
mariadb-pv   250Mi   RWO   Retain   Bound   mariadb/mariadb   ...   <-- old disk in use
```
**Don't:** panic at `ContainerCreating`. The image download can take a minute.

---

### Three words first

- **PV** = PersistentVolume, a disk for the whole cluster. Here it holds the database.
- **PVC** = PersistentVolumeClaim, a request for a disk. A pod uses a PVC, never a PV.
- **claimName** = the line in a pod or deployment that names the PVC.

---

### If something goes wrong

||| |Y|o|u| |s|e|e| ||| |C|a|u|s|e| ||| |F|i|x| |||
|||-|-|-|||-|-|-|||-|-|-|||
||| |P|V| |S|T|A|T|U|S| |`|R|e|l|e|a|s|e|d|`|,| |n|o|t| |`|A|v|a|i|l|a|b|l|e|`| ||| |t|h|e| |P|V| |s|t|i|l|l| |r|e|m|e|m|b|e|r|s| |i|t|s| |d|e|l|e|t|e|d| |P|V|C| |(|`|c|l|a|i|m|R|e|f|`|)| ||| |`|k| |p|a|t|c|h| |p|v| |m|a|r|i|a|d|b|-|p|v| |-|p| |'|{|"|s|p|e|c|"|:|{|"|c|l|a|i|m|R|e|f|"|:|n|u|l|l|}|}|'|`|,| |t|h|e|n| |s|t|e|p| |2| |||
||| |P|V|C| |`|P|e|n|d|i|n|g|`| ||| |c|l|a|s|s|,| |m|o|d|e| |o|r| |s|i|z|e| |d|o|e|s| |n|o|t| |m|a|t|c|h| |t|h|e| |P|V| ||| |`|k| |d|e|s|c|r|i|b|e| |p|v|c| |m|a|r|i|a|d|b| |-|n| |m|a|r|i|a|d|b|`|;| |d|e|l|e|t|e| |t|h|e| |P|V|C|,| |f|i|x| |`|p|v|c|.|y|a|m|l|`|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |V|O|L|U|M|E| |i|s| |a| |l|o|n|g| |n|a|m|e| |l|i|k|e| |`|p|v|c|-|3|f|2|a|.|.|.|`| ||| |`|s|t|o|r|a|g|e|C|l|a|s|s|N|a|m|e|:| |"|"|`| |w|a|s| |m|i|s|s|i|n|g|;| |a| |n|e|w| |e|m|p|t|y| |d|i|s|k| |w|a|s| |m|a|d|e| ||| |d|e|l|e|t|e| |t|h|e| |P|V|C|,| |f|i|x| |t|h|e| |f|i|l|e|,| |a|p|p|l|y| |a|g|a|i|n| |||
||| |t|h|e| |P|V|'|s| |S|T|O|R|A|G|E|C|L|A|S|S| |s|h|o|w|s| |a| |n|a|m|e|,| |e|.|g|.| |`|l|o|c|a|l|-|p|a|t|h|`| ||| |t|h|e| |e|x|a|m|'|s| |d|i|s|k| |h|a|s| |a| |c|l|a|s|s| ||| |u|s|e| |t|h|a|t| |e|x|a|c|t| |n|a|m|e| |i|n|s|t|e|a|d| |o|f| |`|"|"|`| |||
||| |p|o|d| |`|P|e|n|d|i|n|g|`|,| |`|p|e|r|s|i|s|t|e|n|t|v|o|l|u|m|e|c|l|a|i|m| |"|.|.|.|"| |n|o|t| |f|o|u|n|d|`| ||| |t|y|p|o| |i|n| |`|c|l|a|i|m|N|a|m|e|`| ||| |f|i|x| |t|h|e| |f|i|l|e|,| |a|p|p|l|y| |a|g|a|i|n| |||

---

# READ ONCE, DO NOT DRILL

- **StatefulSet:** like a Deployment, but pods get fixed names (`db-0`, `db-1`). Each gets its own disk.
- **HA control plane:** several control plane nodes behind a load balancer.
- **Pod Security:** `k label ns secure pod-security.kubernetes.io/enforce=restricted`
- **kubectl debug:** `k debug node/node01 -it --image=busybox:1.36` gives a shell on a node.
- **Quota:** `k create quota q --hard=pods=10,requests.cpu=2 -n NS`
- **Certificates:** `kubeadm certs check-expiration`, `kubeadm certs renew all`
- **Join a node:** on the control plane `kubeadm token create --print-join-command`; paste the output on the new node.
