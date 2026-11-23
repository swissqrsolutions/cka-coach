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

Then **3C** facts to know by heart, and **3D** habits.

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

### Three words first

- **Image** = your app, packed and stored online. Written `name:tag`, e.g. `nginx:1.27`.
- **Tag** = the version part after the colon.
- **Deployment** = the owner. It creates the pod and re-creates it.
- **Pod** = your app, running. It holds one or more containers.
- **ImagePullBackOff** = the image could not be downloaded. Kubernetes keeps retrying.
- **ErrImagePull** = the same problem, on the first try.
- **Namespace** = a folder. Add `-n <namespace>` to every command.
- **k** = short for `kubectl`.

---

### PART A. Build the exam (Killercoda only)

Paste this once. In the real exam it is already done.

```
k delete ns app --ignore-not-found
k create ns app
k create deploy api --image=nginx:doesnotexist -n app
sleep 20   # wait 20 s for the pull to fail
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`, the pod of deployment `api` is not Running. Find the cause and fix it so the pod reaches Running. Do not delete the deployment.

**What the question is really saying:**

The pod cannot start.
Kubernetes wrote the reason into the pod's Events.
Read the reason. Then fix the deployment.

**Write down from the question:** namespace = `app` · deployment = `api` · do NOT delete the deployment

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. See the status

```
k get pods -n app
```
You see:
```
NAME                   READY   STATUS             RESTARTS   AGE
api-697db8cc78-hgvdr   0/1     ImagePullBackOff   0          60s
```

| Column | Value | Meaning |
|---|---|---|
| READY | `0/1` | 0 of 1 containers are ready |
| STATUS | `ImagePullBackOff` | the image cannot be downloaded |
| RESTARTS | `0` | it never started |

`ErrImagePull` instead? Same problem. Carry on.

Copy the pod name (first column).

---

### Step 2. Ask Kubernetes why

```
k describe pod <pod-name> -n app
```
Look in two places:

1. Top, under **Containers:** the first word is the container name. Here: `nginx`. Write it down.
2. Bottom, under **Events:** `Failed to pull image "nginx:doesnotexist" ... not found`.

The cause: the tag `doesnotexist` does not exist.

---

### Step 3. Fix the image in the deployment

```
k set image deploy/api nginx=nginx:1.27 -n app
```
Pattern: `k set image deploy/<deployment> <container>=<new-image>`.

Left of `=`: the container name from step 2 (`nginx`).
Not the deployment name (`api`).

No tag given in the question? Use `nginx=nginx`.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k rollout status deploy/api -n app
k get pods -n app
```
`rollout status` waits. It ends with `successfully rolled out`.

You want `1/1 Running`.
The pod has a NEW name. That is correct: the deployment made a fresh pod.

```
exit          # exam only: leave the machine before the next question
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `unable to find container named "api"` | you wrote the deployment name left of `=` | use the container name (`nginx`) |
| still `ImagePullBackOff` | the new name or tag has a typo | run `describe` again, fix the typo |
| `No resources found` | you forgot `-n app` | add `-n app` |

---

### Mug this up: the whole answer in 4 lines

```
k get pods -n app
k describe pod <pod> -n app                  # container name + Events
k set image deploy/api nginx=nginx:1.27 -n app
k get pods -n app                            # 1/1 Running
```

**To repeat the question:** paste Part A again.
**Target time:** 2 minutes.

---
## 2. CrashLoopBackOff

### Three words first

- **Command** = what the container runs when it starts. A container lives only as long as its command keeps running.
- **Exit code** = the number a command returns when it stops. `0` = finished OK. Anything else = stopped with an error.
- **CrashLoopBackOff** = the image downloaded fine, the container started, then stopped. Kubernetes restarts it, it stops again. Kubernetes waits longer between each retry.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns app --ignore-not-found
k create ns app
k create deploy api --image=busybox:1.36 -n app -- sh -c "exit 1"
clear
```
(The command `exit 1` means "stop immediately with an error".)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`, the pod of deployment `api` keeps restarting. Find the cause and fix it so the pod stays Running. Do not delete the deployment. The container should run `sleep 3600`.

**What the question is really saying:**

The container starts and stops in a loop.
Find out WHY it stops.
The reason is in one of two places.
Place 1: what the container printed before it stopped (logs).
Place 2: the command it was told to run (describe).

**Write down from the question:** namespace = `app` · deployment = `api` · correct command = `sleep 3600`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. See the status

```
k get pods -n app
```
Wait about 30 s.
In the first seconds STATUS may say `Error` with RESTARTS `1`.
Then wait and run it again.
You see:
```
NAME                   READY   STATUS             RESTARTS      AGE
api-5d9c7b6f4-x2x9k    0/1     CrashLoopBackOff   3 (20s ago)   70s
```
RESTARTS is going UP.
That is the difference from question 1.
Here the container does start, then stops.

---

### Step 2. Read what the stopped container printed

```
k logs <pod-name> -n app --previous
```
`--previous` = show the output of the container that just stopped, not the new one.

Here it prints nothing, because `exit 1` prints nothing.
In the exam you often see a real message here.
For example: `file not found` or `missing variable`.
That message is the cause.

---

### Step 3. Read the command and the exit code

```
k describe pod <pod-name> -n app
```
Find these lines:
```
    Command:
      sh
      -c
      exit 1
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
```
Cause found: the command is `exit 1`. It stops at once with an error.

---

### Step 4. Fix the command in the deployment

```
k edit deploy api -n app
```
This opens the deployment in vim.
Type `/exit 1` and press Enter.
The cursor jumps onto the word `exit` in the line `- exit 1`:
```
      - command:
        - sh
        - -c
        - exit 1        <- cursor is on the "e" of exit
```
Vim keys, exactly:
1. Press `C` (capital C). It deletes to the end of the line and starts typing.
2. Type `sleep 3600`.
3. Press `Esc`.
4. Type `:wq` and press Enter.

The line must now read `- sleep 3600`.

No-vim alternative: one command with the same result.
Type it instead of the vim steps above.
```
k patch deploy api -n app --type=json -p='[{"op":"replace","path":"/spec/template/spec/containers/0/command","value":["sh","-c","sleep 3600"]}]'
```

You see `deployment.apps/api edited` (after vim) or `deployment.apps/api patched` (after `k patch`).

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pods -n app
```
You want `1/1 Running` and RESTARTS `0`.
Wait 20 seconds and run it again.
RESTARTS must stay 0.

```
exit          # exam only
```

---

### The same question with other causes

The steps are identical. Only the message and the fix change.

| What you read in steps 2 and 3 | Cause | Fix |
|---|---|---|
| `Reason: OOMKilled` | the memory limit is too small | `k set resources deploy api -n app --limits=memory=<value the question gives>` (e.g. `256Mi`) |
| STATUS `CreateContainerConfigError` (not a restart loop: the container never starts), Events: `configmap "x" not found` | the ConfigMap or Secret does not exist | create it (`k create cm x --from-literal=KEY=VALUE -n app`) or fix its name with `k edit deploy` |
| Events: `Liveness probe failed` | the probe checks the wrong port or path | `k edit deploy api -n app`, fix the port under `livenessProbe:` |
| logs show an error about a wrong argument | bad `args:` | `k edit deploy api -n app`, fix `args:` |

---

### Mug this up: the whole answer in 5 lines

```
k get pods -n app                            # RESTARTS going up
k logs <pod> -n app --previous               # what it printed before stopping
k describe pod <pod> -n app                  # Command + Exit Code + Events
k edit deploy api -n app                     # fix the cause
k get pods -n app                            # 1/1 Running, RESTARTS stays 0
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 3. Pending pod

### Three words first

- **Scheduler** = the part of Kubernetes that picks a node for each new pod.
- **Pending** = the pod exists, but no node has accepted it yet.
- **Request** = how much CPU and memory a pod reserves. CPU is written in millicores. `1000m` = 1 CPU. `100m` = one tenth of a CPU. A plain `100` means 100 whole CPUs.
- **Taint** = a "keep out" mark on a node. Only pods with a matching toleration may run there. The controlplane usually has one, so normal pods go to node01.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns app --ignore-not-found
k create ns app
k create deploy api --image=nginx:1.27 -n app
k set resources deploy api -n app --requests=cpu=100
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`, a pod of deployment `api` is stuck in Pending. Find the cause and fix it. The container needs `100m` CPU.

**What the question is really saying:**

The scheduler looked at every node and said no to all of them.
It wrote its reason into the pod's Events.
Read the reason. Remove the obstacle.

**Write down from the question:** namespace = `app` · deployment = `api` · correct CPU request = `100m`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. See the status

```
k get pods -n app
```
You see one pod `Pending`.
You may also see an older pod still `Running`.
The deployment keeps the old pod until the new one works.
Copy the name of the PENDING pod.

---

### Step 2. Read the scheduler's reason

```
k describe pod <pending-pod-name> -n app
```
At the bottom, under Events:
```
Warning  FailedScheduling  ...  0/2 nodes are available: 1 Insufficient cpu, 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }. preemption: ...
```
How to read it:
"0 of 2 nodes can take this pod."
"One (node01) does not have enough CPU."
"The other (controlplane) has a taint. It is reserved for control-plane pods."
The counts vary.
If your controlplane has no taint, you see `0/2 nodes are available: 2 Insufficient cpu.`
The word that matters is `Insufficient cpu`.
Ignore the `preemption:` part.

Look higher up in the same output, under **Requests:** → `cpu: 100`.
That is 100 whole CPUs. No node has that.

---

### Step 3. Fix the request in the deployment

```
k set resources deploy api -n app --requests=cpu=100m
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pods -n app
```
You want `1/1 Running`, and no Pending pod left.
The Pending pod disappears on its own. The deployment replaces it.
Still see it? Wait 10 s and run the command again.

```
exit          # exam only
```

---

### The same question with other causes

The Events line always names the cause. Match it:

| Events says | Cause | Fix |
|---|---|---|
| `Insufficient cpu` or `Insufficient memory` | the request is too big | `k set resources deploy api -n app --requests=cpu=100m,memory=128Mi` |
| `had untolerated taint {key: value}` | the node has a taint the pod does not tolerate | remove the taint: `k taint node node01 key=value:NoSchedule-` (or add a toleration, question 36 "Taint, toleration, nodeSelector") |
| `didn't match Pod's node affinity/selector` | the pod asks for a node label that no node has | `k edit deploy api -n app` and fix `nodeSelector:`, or `k label node node01 key=value` |
| `unbound immediate PersistentVolumeClaims` | its PVC is not Bound | fix the PVC (questions 38 "PV + PVC + Pod" and 40 "Reuse an existing PV") |
| Events is empty (`<none>`) and `Node: <none>` | the scheduler itself is not running | question 9 "Scheduler is not running" |

---

### Mug this up: the whole answer in 4 lines

```
k get pods -n app
k describe pod <pending-pod> -n app          # Events: FailedScheduling ... <the reason>
k set resources deploy api -n app --requests=cpu=100m
k get pods -n app                            # 1/1 Running
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 4. Node NotReady: kubelet stopped

### Three words first

- **kubelet** = a program that runs on every node. It starts the containers. Every few seconds it tells the control plane "this node is alive".
- **NotReady** = the control plane has not heard from the node's kubelet. That takes about 40 seconds.
- **systemctl** = the Linux command that starts, stops and checks services. kubelet is a Linux service, not a pod. So kubectl cannot start it. You must log in to the node.

---

### PART A. Build the exam (Killercoda only)

```
ssh node01 "systemctl disable --now kubelet"
sleep 60          # wait until node01 shows NotReady (takes about 40 s)
clear
k get nodes
```
(`disable --now` = stop it AND switch off start-at-boot.
So the "survive a reboot" part is real.)
If node01 still shows `Ready`, wait 20 seconds and run `k get nodes` again.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> Node `node01` is in state NotReady. Find the cause and bring the node back to Ready. The fix must survive a reboot. Do not reboot the node.

**What the question is really saying:**

The kubelet on node01 is not reporting.
Log in to node01. Check the kubelet service. Start it.

**Write down from the question:** node = `node01` · must survive reboot (so: `enable`) · no reboot

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```
Here `k get nodes` already shows the problem: `node01   NotReady`.

---

### Step 1. Get the hint from the control plane

```
k describe node node01
```
Find the **Conditions:** table.
You see `Unknown` and the message `Kubelet stopped posting node status`.

That sentence tells you: the problem is the kubelet, on that node.

---

### Step 2. Log in to the node

```
ssh node01
```
The prompt changes to `root@node01`. Always look at the prompt before you type.

---

### Step 3. Check the kubelet service

```
systemctl status kubelet
```
You see:
```
     Loaded: loaded (/usr/lib/systemd/system/kubelet.service; disabled; ...)
     Active: inactive (dead) since ...
```
`inactive (dead)` = the service is stopped.
`disabled` = it will not start after a reboot either.
If the screen does not return to the prompt, press `q`.

---

### Step 4. Start it

```
systemctl enable --now kubelet
```
- `--now` = start it immediately
- `enable` = also start it after every reboot (the question asked for this)

Check:
```
systemctl status kubelet
systemctl is-enabled kubelet
```
You want `Active: active (running)`. Press `q`.
`is-enabled` must print `enabled` (= survives a reboot).

---

### Step 5. Leave the node

```
exit
```
The prompt is `root@controlplane` again.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get nodes
```
You want `node01   Ready`.
It can take 30 seconds. Run it again if needed.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `The connection to the server localhost:8080 was refused` | you ran kubectl ON node01. kubectl is only set up on the control plane. | type `exit`, run it again |
| kubelet is already `active (running)` before you fixed anything | you ran systemctl on the control plane, not node01 | look at the prompt: it must say `node01`. `exit`, then `ssh node01` |
| after starting: `Active: activating (auto-restart)` | the kubelet is misconfigured, not just stopped | question 5 |
| kubelet is `active (running)` but the node stays NotReady | the container runtime is stopped | on the node: `systemctl enable --now containerd` |

---

### Mug this up: the whole answer in 6 lines

```
k get nodes                       # node01 NotReady
k describe node node01            # "Kubelet stopped posting node status"
ssh node01
systemctl status kubelet          # inactive (dead)
systemctl enable --now kubelet
exit   ;   k get nodes            # Ready
```

**To repeat the question:** paste Part A again.
**Target time:** 2 minutes.

---

## 5. Node NotReady: kubelet misconfigured

### Three words first

- **Service file** = a text file that tells Linux how to start a service. The line `ExecStart=` holds the path of the program to run.
- **journalctl** = the command that shows a service's log. It tells you WHY a service fails.
- **daemon-reload** = tells Linux "I changed a service file, read it again". Without it, Linux keeps using the old version.

---

### PART A. Build the exam (Killercoda only)

```
ssh node01 'f=$(ls /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf /etc/systemd/system/kubelet.service.d/10-kubeadm.conf 2>/dev/null | head -1); echo "drop-in: $f"; sed -i "s#/usr/bin/kubelet#/usr/local/bin/kubelet#" "$f" && grep -n local "$f"; systemctl daemon-reload; systemctl restart kubelet'
```
You should see `drop-in: ...10-kubeadm.conf`.
You should also see one line containing `/usr/local/bin/kubelet`.
Is `drop-in:` empty, or no line printed? Then nothing was broken.
Run `ssh node01 systemctl cat kubelet`. It shows where your playground keeps the file.
Use that path instead.
Wait 60 seconds.
Then run `k get nodes` until node01 shows `NotReady`. Then `clear`.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> Node `node01` is in state NotReady. Find the cause and bring the node back to Ready. Do not reboot the node.

**What the question is really saying:**

The wording is the same as question 4.
On the node you find out this one is harder.
The kubelet is not just stopped. It cannot start.
Something in its configuration is wrong.
`journalctl` tells you what.

**Write down from the question:** node = `node01` · no reboot

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Log in to the node and check the service

```
ssh node01
systemctl status kubelet
```
You see:
```
     Active: activating (auto-restart) (Result: exit-code)
    Process: ... ExecStart=/usr/local/bin/kubelet ... (code=exited, status=203/EXEC)
```

| You see | Meaning |
|---|---|
| `inactive (dead)` | just stopped → question 4 |
| `activating (auto-restart)` | tries to start, fails, tries again → it is misconfigured → this question |

Press `q`.

---

### Step 2. Read WHY it fails

```
journalctl -u kubelet -n 30 --no-pager
```
- `-u kubelet` = only this service
- `-n 30` = the last 30 lines
- `--no-pager` = print it, do not open a viewer

You see:
```
kubelet.service: Failed to locate executable /usr/local/bin/kubelet: No such file or directory
```
Cause found: the service file points to a program path that does not exist.

---

### Step 3. Find the correct path

```
which kubelet
```
Answer: `/usr/bin/kubelet`

---

### Step 4. Find which file holds the wrong path

```
systemctl cat kubelet
```
It prints every file of the service.
Each file has its path in a `#` line on top.
You see TWO blocks with `ExecStart=`:
- **Base file** = `# /usr/lib/systemd/system/kubelet.service` with `ExecStart=/usr/bin/kubelet`. Leave it alone. The drop-in overrides it.
- **Drop-in** = first an empty `ExecStart=`, then `ExecStart=/usr/local/bin/kubelet ...`. The empty line only clears the old value. That is normal.

Edit the block whose `ExecStart=` contains `local`.
The `#` line above it names the file:
```
# /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf
```
(Some installs keep it in `/etc/systemd/system/kubelet.service.d/10-kubeadm.conf`.
Use whatever path YOUR output shows.)

---

### Step 5. Fix the file

```
vim /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf
```
Vim keys, exactly:
1. Type `/local` and press Enter. The cursor lands on the `l` of `local`.
2. Type `6x`. It deletes 6 characters: `local/`.
3. The line now reads `ExecStart=/usr/bin/kubelet ...`.
4. Type `:wq` and press Enter.

You never entered insert mode, so no Esc is needed.
Pressing Esc anyway does no harm.

---

### Step 6. Reload, restart, check

```
systemctl daemon-reload
systemctl restart kubelet
systemctl status kubelet
```
You want `Active: active (running)`. Press `q`.

---

### Step 7. Leave the node

```
exit
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get nodes
```
You want `node01   Ready` (up to 30 seconds).

```
exit          # exam only
```

---

### The same question with other causes

`journalctl` always names the problem. These are the files where the fix goes:

| journalctl says | File to fix | Then |
|---|---|---|
| `Failed to locate executable ...` | `/usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf` (the `ExecStart=` line) | `daemon-reload` + `restart` |
| `unknown flag: --xyz` | `/var/lib/kubelet/kubeadm-flags.env` | `restart` |
| `failed to load kubelet config file` or `unable to load client CA file ...` | `/var/lib/kubelet/config.yaml` (correct CA path: `/etc/kubernetes/pki/ca.crt`) | `restart` |
| `dial tcp ...:6553: connection refused` (wrong API server port) | `/etc/kubernetes/kubelet.conf` (correct port: `6443`) | `restart` |

`daemon-reload` is only needed after changing a service file.
Service files live under `/usr/lib/systemd/` or `/etc/systemd/`.
Running it when not needed does no harm.

---

### Mug this up: the whole answer in 8 lines

```
ssh node01
systemctl status kubelet                     # activating (auto-restart)
journalctl -u kubelet -n 30 --no-pager       # the reason
systemctl cat kubelet                        # which file
vim <that file>                              # fix it
systemctl daemon-reload
systemctl restart kubelet
exit   ;   k get nodes                       # Ready
```

**To repeat the question:** paste Part A again.
**Target time:** 6 minutes.

---

## 6. Service has no endpoints

### Three words first

- **Label** = a `key=value` tag on an object, for example `app=backend`.
- **Selector** = a label written inside a Service. The Service sends traffic to every pod that carries that label.
- **Endpoints** = the list of pod IPs the Service found with its selector. Empty list = no pods found. Traffic goes nowhere.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns web --ignore-not-found
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k create svc clusterip backend-svc --tcp=80:80 -n web
k run client --image=busybox:1.36 -n web -- sleep 3600
clear
```
(Why it is broken: `k create svc` sets the selector to the Service's own name.
That gives `app=backend-svc`. The pods carry `app=backend`.)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, pod `client` cannot reach service `backend-svc` on port 80. The deployment `backend` is Running. Find and fix the issue. Do not delete or recreate the service.

**What the question is really saying:**

The pods are healthy. The Service exists.
But the Service is not connected to the pods.
Compare the Service's selector with the pods' labels.

**Write down from the question:** namespace = `web` · service = `backend-svc` · deployment = `backend` · test pod = `client` · do NOT recreate the service

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Does the Service have pods behind it?

```
k get endpoints backend-svc -n web
```
You see:
```
NAME          ENDPOINTS   AGE
backend-svc   <none>      1m
```
`<none>` = the Service found no pods. (A deprecation warning on this command is harmless.)

---

### Step 2. What label is the Service looking for?

```
k describe svc backend-svc -n web
```
Find the line `Selector:  app=backend-svc`.

---

### Step 3. What labels do the pods really carry?

```
k get pods -n web --show-labels
```
The backend pod shows `app=backend,...`.

`app=backend-svc` is not `app=backend`. That is the cause.

---

### Step 4. Fix the selector on the Service

```
k set selector svc backend-svc app=backend -n web
```
This changes the existing Service. It is not recreated.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get endpoints backend-svc -n web
```
You want an IP, for example `192.168.1.5:80`.

```
k get pod client -n web                      # must be Running before you exec
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You want the HTML that contains `Welcome to nginx!`.
- `--` = everything after this runs INSIDE the pod (here: `wget ...`).
- `-qO-` = quiet, print the page to the screen. It is the capital letter O, not a zero.
- `-T 3` = give up after 3 seconds

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| endpoints still `<none>` | typo in the label you set | compare again with `--show-labels` |
| endpoints still `<none>`, labels match | the pods are not Ready (READY `0/1`) | fix the pods first |
| endpoints show an IP, wget still fails | the port is wrong | question 7 |
| `wget: invalid option -- '0'` | you typed zero instead of capital O | `-qO-` |
| `error: unable to upgrade connection: container not found` or `pod ... is not running` | the client pod is still `ContainerCreating` | wait, `k get pod client -n web` until Running |

---

### Mug this up: the whole answer in 5 lines

```
k get endpoints backend-svc -n web           # <none>
k describe svc backend-svc -n web            # Selector: ...
k get pods -n web --show-labels              # the real label
k set selector svc backend-svc app=backend -n web
k exec client -n web -- wget -qO- -T 3 backend-svc
```

**To repeat the question:** paste Part A again.
**Target time:** 2 minutes.

---

## 7. Service with the wrong targetPort

### Three words first

- **port** = the port of the Service. Clients call this one.
- **targetPort** = the port of the container. The Service forwards the traffic there. It must be the port the app really listens on (nginx: 80).
- **nodePort** = only for NodePort Services: a port (30000 to 32767) opened on every node.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns web --ignore-not-found
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 --target-port=8080 -n web
k run client --image=busybox:1.36 -n web -- sleep 3600
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, pod `client` cannot reach service `backend-svc` on port 80. The backend pods are Running and run nginx, which listens on port 80. Fix the issue without recreating the service.

**What the question is really saying:**

Same symptom as question 6, different cause.
The Service finds the pods.
But it forwards to a port where nothing listens.

**Write down from the question:** namespace = `web` · service = `backend-svc` · app listens on `80`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Does the Service have pods behind it?

```
k get endpoints backend-svc -n web
```
You see:
```
NAME          ENDPOINTS          AGE
backend-svc   192.168.1.5:8080   1m
```
There IS an IP, so the selector is fine.
Now look at the number after the colon: `8080`.
The question said nginx listens on `80`.

**The rule:**
- ENDPOINTS `<none>` → selector problem (question 6)
- ENDPOINTS has an IP but no answer → port problem (this question)

---

### Step 2. Confirm the symptom

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see `Connection refused` or `download timed out`.

---

### Step 3. Fix the port on the Service

```
k edit svc backend-svc -n web
```
Type `/targetPort` and press Enter. You see:
```
  ports:
  - port: 80
    protocol: TCP
    targetPort: 8080
```
Change `8080` to `80`.
Vim keys, exactly:
1. Type `/8080` and press Enter. The cursor is on the first `8`.
2. Type `cw`. It deletes the word and starts typing.
3. Type `80`, then press `Esc`.
4. Type `:wq` and press Enter.

No-vim alternative: `k patch svc backend-svc -n web -p '{"spec":{"ports":[{"port":80,"targetPort":80}]}}'`

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get endpoints backend-svc -n web           # now ...:80
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You want the `Welcome to nginx!` page.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| you do not know the app's port | the question did not say | `k describe pod <backend-pod> -n web`, read `Port:` under Containers |
| wget works with the pod IP but not with the Service name | DNS problem | question 11 |
| the question says clients use another port, e.g. 8080 | then `port:` is wrong, not `targetPort:` | fix `port:` instead |

---

### Mug this up: the whole answer in 3 lines

```
k get endpoints backend-svc -n web           # IP is there, port is wrong
k edit svc backend-svc -n web                # targetPort: 80
k exec client -n web -- wget -qO- -T 3 backend-svc
```

**To repeat the question:** paste Part A again.
**Target time:** 2 minutes.

---

## 8. ★ kube-apiserver is down

### Three words first

- **API server** = the program every `kubectl` command talks to. If it is down, kubectl cannot do anything.
- **Static pod** = a pod that the kubelet starts from a file in `/etc/kubernetes/manifests/`. The API server, scheduler, controller-manager and etcd are all static pods. Change the file, and the kubelet restarts the pod by itself.
- **crictl** = a command that lists containers and shows their logs directly on the node. It works when kubectl does not.

---

### PART A. Build the exam (Killercoda only)

Run this on the control plane:
```
cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/apiserver.bak
sed -i 's/127.0.0.1:2379/127.0.0.1:2380/' /etc/kubernetes/manifests/kube-apiserver.yaml
clear
```
Wait 60 seconds before you start.
(If you get lost: `cp /root/apiserver.bak /etc/kubernetes/manifests/kube-apiserver.yaml` puts everything back.)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> On the control plane node, `kubectl` commands fail. The cluster was working before a configuration change. Find the cause and fix it so the cluster works again.

**What the question is really saying:**

The API server container is not running.
It is started from a file. Something in that file is wrong.
Read the container's log to find out what.
Then fix the file.

**Write down from the question:** control plane node · kubectl fails

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```
Here `k get nodes` answers:
```
The connection to the server 172.30.1.2:6443 was refused - did you specify the right host or port?
```
Port `6443` = the API server. So the API server is down.
(If it said `localhost:8080`, you would simply be on the wrong machine.)

---

### Step 1. Find the API server container

```
crictl ps -a | grep kube-apiserver
```
`-a` = also show stopped containers.
You see lines with `Exited` and a growing ATTEMPT number.
Copy the first column (the container ID) of the most recent line.
On that line, CREATED says seconds or minutes ago. ATTEMPT is the highest.
(An old line from before the break, CREATED hours ago, shows nothing useful.)
Does `crictl ps -a | grep kube-apiserver` print nothing?
Then go straight to the row "NO apiserver container" in the table below.

---

### Step 2. Read its log

```
crictl logs <container-id> 2>&1 | tail -20
```
`2>&1` = send the error output to the screen too.
`crictl logs` writes the container's errors to stderr.
Without `2>&1`, the `| tail` would not catch them.

You see errors that mention `127.0.0.1:2380`, for example:
```
... dial tcp 127.0.0.1:2380: connect: connection refused
```
The API server stores everything in etcd.
etcd answers on port **2379**.
The API server is trying 2380. That is the cause.

---

### Step 3. Back up, then fix the file

First make a backup, OUTSIDE the manifests folder.
The kubelet runs every file inside `/etc/kubernetes/manifests/`.
So a copy left there becomes a second API server.
Then open the original in vim.
```
cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/kube-apiserver.yaml.orig
vim /etc/kubernetes/manifests/kube-apiserver.yaml
```
Type `/etcd-servers` and press Enter. You see:
```
    - --etcd-servers=https://127.0.0.1:2380
```
Change it to `2379`.
Vim keys, exactly:
1. Type `/2380` and press Enter. The cursor is on the `2`.
2. Type `cw`, then type `2379`.
3. Press `Esc`.
4. Type `:wq` and press Enter.

You do NOT restart anything.
The kubelet sees the changed file and restarts the pod.
It takes up to 60 seconds.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get nodes
```
Repeat every 15 seconds until the node list appears.

```
k get pods -n kube-system | grep apiserver
```
You want `1/1 Running`.

```
exit          # exam only
```

---

### The same question with other causes

| crictl logs says | Cause | Fix in the same file |
|---|---|---|
| `open /etc/kubernetes/pki/xyz.crt: no such file or directory` | a certificate path is wrong | `ls /etc/kubernetes/pki/` and correct the path |
| `unknown flag: --xyz` | a flag is misspelled | correct the flag |
| `crictl ps -a` shows NO apiserver container at all | the file has a YAML mistake, so the kubelet cannot read it | `journalctl -u kubelet -n 30 --no-pager | grep -i apiserver` names the line |
| image pull error | the image name is wrong | compare the `image:` line with `kube-scheduler.yaml` (same version number) |

**Two rules for this folder:**
- The backup goes OUTSIDE the folder (step 3). The kubelet runs every file inside `/etc/kubernetes/manifests/`.
- Spaces only, never Tab.

---

### Mug this up: the whole answer in 5 lines

```
k get nodes                                  # ...:6443 was refused
crictl ps -a | grep kube-apiserver           # Exited
crictl logs <id> 2>&1 | tail -20             # the reason
vim /etc/kubernetes/manifests/kube-apiserver.yaml
k get nodes                                  # wait up to 60 s
```

**To repeat the question:** paste Part A again.
**Target time:** 7 minutes.

---

## 9. Scheduler is not running

### Three words first

- **kube-scheduler** = the control plane program that puts every new pod on a node. It is a static pod. Its file is `/etc/kubernetes/manifests/kube-scheduler.yaml`.
- **Pending with no Events** = nobody even tried to place the pod. So the scheduler is not working.
- **kube-controller-manager** = the control plane program that creates pods for Deployments. Broken? Then scaling a Deployment creates no pods at all.

---

### PART A. Build the exam (Killercoda only)

Run this on the control plane:
```
cp /etc/kubernetes/manifests/kube-scheduler.yaml /root/scheduler.bak
sed -i 's/- kube-scheduler$/- kube-schedulerx/' /etc/kubernetes/manifests/kube-scheduler.yaml
k delete pod test --ignore-not-found
sleep 30   # waits 30 s for the old scheduler to stop; the screen is quiet, this is normal
k run test --image=nginx:1.27
clear
```
(Does `test` still get scheduled? Then the old scheduler had not stopped yet.
Run `k delete pod test`. Wait 30 s. Run `k run test --image=nginx:1.27` again.)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> A pod named `test` in namespace `default` stays in Pending. Other pods that were already running are fine. Find the cause and fix it so that `test` is Running.

**What the question is really saying:**

It looks like question 3, but the pod's Events are empty.
In question 3 the scheduler said "no" and gave a reason.
Here nobody answered at all.
So the scheduler is the thing that is broken.

**Write down from the question:** pod = `test` · namespace = `default`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Read the pod's Events

```
k describe pod test
```
At the bottom:
```
Events:  <none>
```
And near the top: `Node:  <none>`.

| What you see | Meaning |
|---|---|
| Pending, and Events give a reason | the scheduler works, the pod does not fit → question 3 |
| **Pending, and Events are `<none>`** | **the scheduler is not running → this question** |

---

### Step 2. Look at the control plane pods

```
k get pods -n kube-system
```
You see:
```
kube-scheduler-controlplane   0/1   CrashLoopBackOff   4   2m
```
(It can also show `RunContainerError`.)

---

### Step 3. Ask why

```
k describe pod kube-scheduler-controlplane -n kube-system
```
Events:
```
exec: "kube-schedulerx": executable file not found in $PATH
```
Cause found: the program name in the command is misspelled.
(`k logs` shows nothing here. The program never started, so it printed nothing.
Does describe show no Events either? Then run these two on the control plane:
`crictl ps -a | grep scheduler`
`crictl inspect <id> | grep -i -m3 message`)

---

### Step 4. Fix the file

```
vim /etc/kubernetes/manifests/kube-scheduler.yaml
```
Type `/schedulerx` and press Enter. You see:
```
  - command:
    - kube-schedulerx
```
Remove the `x`.
Vim keys, exactly:
1. The cursor is on the `s` of `schedulerx`.
2. Press `9l`. It moves 9 characters right, onto the `x`.
3. Press `x`. It deletes the `x`.
4. Type `:wq` and press Enter.

No-vim alternative: `sed -i 's/kube-schedulerx/kube-scheduler/' /etc/kubernetes/manifests/kube-scheduler.yaml`
Do not restart anything. Wait 30 seconds.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pods -n kube-system | grep scheduler   # 1/1 Running
k get pod test                               # Running
```

```
exit          # exam only
```

---

### The same question with other causes

| Symptom | Broken part | File |
|---|---|---|
| new pods Pending, Events `<none>` | scheduler | `/etc/kubernetes/manifests/kube-scheduler.yaml` |
| you scale a Deployment and NO new pods appear, not even Pending (test: `k get rs` — its DESIRED number does not change after you scale) | controller-manager | `/etc/kubernetes/manifests/kube-controller-manager.yaml` |

In both cases, first check: did the program start at all?
Started, then failed (wrong flag, wrong path)? `k logs <that-pod> -n kube-system` names the line.
Never started (wrong command, wrong image)? Then the logs are empty.
Read the Events of `k describe pod <that-pod> -n kube-system`.
Or run `crictl ps -a` on the control plane.
Fix the file. Wait.

---

### Mug this up: the whole answer in 5 lines

```
k describe pod test                                        # Events: <none>
k get pods -n kube-system                                  # scheduler is failing
k describe pod kube-scheduler-controlplane -n kube-system  # the reason
vim /etc/kubernetes/manifests/kube-scheduler.yaml          # fix it, wait 30 s
k get pod test                                             # Running
```

**To repeat the question:** paste Part A again.
**Target time:** 5 minutes.

---

## 10. NetworkPolicy is blocking traffic

### Three words first

- **NetworkPolicy** = a rule that says which traffic may reach a pod. With no policy, a pod accepts traffic from everyone. Once a policy selects a pod, the pod accepts ONLY what its policies allow.
- **podSelector** (top of the policy) = which pods this policy protects. `podSelector: {}` means every pod in the namespace.
- **Policies only add up.** There is no "deny" rule field. A policy that selects pods and allows nothing blocks them. `deny-all` below is such a policy. To let traffic through, add one more policy that allows it. Do not edit or delete the existing one.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns web --ignore-not-found
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
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, pod `client` cannot reach service `backend-svc` on port 80. The service and its pods are healthy. Do not delete or change any existing NetworkPolicy. Create a NetworkPolicy named `allow-client` so that ONLY pod `client` can reach the backend pods on TCP port 80.

**What the question is really saying:**

An existing policy blocks everything.
Add one new policy. It protects the backend pods.
It lets in exactly one source: the `client` pod, on port 80.

You need three facts for the new policy:

| Blank | Meaning | You find it with |
|---|---|---|
| WHO is protected | the label of the backend pods | `--show-labels` |
| WHO may come in | the label of the client pod | `--show-labels` |
| WHICH port | from the question | `80` |

**Write down from the question:** namespace = `web` · policy name = `allow-client` · port = TCP `80` · do NOT touch existing policies

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Rule out questions 6 and 7

```
k get endpoints backend-svc -n web
```
You see an IP with `:80`. So selector and port are fine.

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see `download timed out`.
A TIMEOUT (not "refused") usually means something drops the traffic silently.

---

### Step 2. Look for policies

```
k get netpol -n web
k describe netpol deny-all -n web
```
You see two lines.
Line 1: `PodSelector: <none> (Allowing the specific traffic to all pods in this namespace)`
Line 2: `Allowing ingress traffic: <none>`
Meaning: it selects all pods and allows nothing in.

---

### Step 3. Collect the two labels

```
k get pods -n web --show-labels
```
- backend pod: `app=backend`
- client pod: `run=client` (pods made with `k run` get the label `run=<name>`)

---

### Step 4. Get the policy text from the docs

1. Open **https://kubernetes.io/docs**
2. Search: **`network policies`**
3. Click: **"Network Policies"**
   (direct link: https://kubernetes.io/docs/concepts/services-networking/network-policies/ )
4. Under the heading **"The NetworkPolicy resource"**, copy the example box.

This is what you copied:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - ipBlock:
        cidr: 172.17.0.0/16
        except:
        - 172.17.1.0/24
    - namespaceSelector:
        matchLabels:
          project: myproject
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 6379
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/24
    ports:
    - protocol: TCP
      port: 5978
```

---

### Step 5. Paste, change 5 lines, delete 3 blocks

```
vim np.yaml
```
Vim keys, exactly:
1. Type `:set paste` and press Enter. It stops vim from shifting pasted lines right.
2. Press `i`. Paste with Ctrl+Shift+V (exam terminal).
3. Press `Esc`. You are back in normal mode. `dd` only works there.
4. To delete: move with the arrow keys onto the first line of a block.
5. Type `dd` (one line) or `7dd` (7 lines).
6. To change a line: put the cursor on the first character to replace.
7. Press `C`. It deletes to the end of the line and starts typing.
8. Type the new text. Press `Esc`.
9. When done: type `:wq`, press Enter.

**Delete these 3 blocks** (`dd` deletes one line; `7dd` deletes 7 lines):

| Delete | Lines |
|---|---|
| the line `- Egress` | 1 line |
| the `- ipBlock:` block and the `- namespaceSelector:` block | 7 lines, from `- ipBlock:` to `project: myproject` |
| everything from `egress:` to the end | 7 lines |

**Change these 5 lines:**

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: test-network-policy` | `name: allow-client` | name from the question |
| 2 | `namespace: default` | `namespace: web` | namespace from the question |
| 3 | `role: db` | `app: backend` | WHO is protected (step 3) |
| 4 | `role: frontend` | `run: client` | WHO may come in (step 3) |
| 5 | `port: 6379` | `port: 80` | port from the question |

The finished file:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-client
  namespace: web
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          run: client
    ports:
    - protocol: TCP
      port: 80
```
How it reads: "Protect the pods `app=backend`. Let in the pods `run=client`. Only on TCP 80."

(If vim fights you, do this instead.
Type `cat > np.yaml <<'EOF'`.
Paste the finished file above.
Then type a line with only `EOF`. Same result.)

Save (`Esc`, `:wq`, Enter). Then:
```
k apply -f np.yaml
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You want the `Welcome to nginx!` page.

```
k get netpol -n web
```
You want both `deny-all` (untouched) and `allow-client`.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| still a timeout | a label in the file does not match the real label | compare with `--show-labels`, fix `np.yaml`, `k apply -f np.yaml` again |
| `error parsing ... yaml` | indentation broke while deleting lines | compare with the finished file above, line by line |
| step 1 wget already WORKS, even with `deny-all` | your network plugin does not enforce policies. Flannel alone does not. Calico, Canal and Cilium do. | run `k get pods -A`. Look for calico, canal or cilium in the NAME column. None listed? You can still write and apply the policy. You just cannot see it block or allow. The exam cluster enforces them. |
| `error: unable to upgrade connection` / `container not found` | the client pod is not Running yet | `k get pod client -n web`, wait |

---

### Mug this up: the whole answer in 6 lines

```
k get endpoints backend-svc -n web           # fine -> not question 6 or 7
k get netpol -n web                          # there is a policy
k get pods -n web --show-labels              # the two labels
vim np.yaml                                  # docs copy: delete 3 blocks, change 5 lines
k apply -f np.yaml
k exec client -n web -- wget -qO- -T 3 backend-svc
```

**To repeat the question:** paste Part A again.
**Target time:** 6 minutes.

---

## 11. DNS is not working

### Three words first

- **CoreDNS** = the DNS program. It turns a Service name (like `backend-svc`) into an IP. It runs as Deployment `coredns` in namespace `kube-system`.
- **kube-dns** = the old name. The CoreDNS pods still have the label `k8s-app=kube-dns`. Their Service is still called `kube-dns`. Below, `coredns` = the Deployment. `kube-dns` = the label and the Service.
- **nslookup** = a command that asks DNS for the IP of a name. It is the test for this question.

---

### PART A. Build the exam (Killercoda only)

```
k scale deploy coredns -n kube-system --replicas=0
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> Pods in the cluster cannot resolve service names. Connections by IP address still work. Find the cause and fix it. Two CoreDNS replicas must be running.

**What the question is really saying:**

Names fail, IPs work.
So the network is fine. Only name lookup is broken.
Check the three parts of CoreDNS in this order:
1. The pods.
2. The Deployment that owns them.
3. The Service in front of them.

**Write down from the question:** replicas = `2`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Confirm the symptom

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local
```
- `kubernetes.default.svc.cluster.local` = the full name of Service `kubernetes` in namespace `default`. It exists in every cluster. So it is a safe test name. Always use the full name. busybox's nslookup handles short names badly. It can print `NXDOMAIN` even when DNS works.
- `--rm -it --restart=Never` = run once, show the output, delete the test pod

You see `connection timed out; no servers could be reached`.

---

### Step 2. Are the CoreDNS pods there?

```
k get pods -n kube-system -l k8s-app=kube-dns
```
You see `No resources found`. There are no DNS pods at all.

---

### Step 3. Look at their owner

```
k get deploy coredns -n kube-system
```
You see `READY 0/0`. The Deployment was scaled to zero.

---

### Step 4. Fix

```
k scale deploy coredns -n kube-system --replicas=2
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pods -n kube-system -l k8s-app=kube-dns
```
You want 2 pods, `1/1 Running`.

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local
```
You see two `Address` lines:
```
Server:    10.96.0.10
Address:   10.96.0.10:53                         <- the DNS server itself, not the answer

Name:      kubernetes.default.svc.cluster.local
Address:   10.96.0.1                             <- the answer you want
```
The SECOND `Address` line (under `Name:`) is the proof.
Numbers may differ in your cluster.
An extra line like `*** Can't find ...: No answer` is harmless.
It is only the IPv6 lookup.

```
exit          # exam only
```

---

### The same question with other causes

| What you find | Cause | Fix |
|---|---|---|
| step 2: pods exist but `CrashLoopBackOff` | a typo in the CoreDNS config | `k logs -n kube-system -l k8s-app=kube-dns` names the line. `k edit cm coredns -n kube-system`, fix it, then `k rollout restart deploy coredns -n kube-system` |
| step 2: pods are `1/1 Running`, DNS still fails | the Service in front of them lost its pods | `k get endpoints kube-dns -n kube-system` (a deprecation warning here is harmless). If `<none>`: `k set selector svc kube-dns k8s-app=kube-dns -n kube-system` |
| step 2: pods `Pending` | scheduling problem | question 3 |

---

### Mug this up: the whole answer in 5 lines

```
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local
k get pods -n kube-system -l k8s-app=kube-dns
k get deploy coredns -n kube-system
k scale deploy coredns -n kube-system --replicas=2
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup kubernetes.default.svc.cluster.local
```

**To repeat the question:** paste Part A again.
**Target time:** 4 minutes.

---

## 12. Logs and usage into a file

### Three words first

- **`>`** = write the output of a command into a file. It replaces what was in the file. (`>>` adds to the end instead.)
- **k logs** = what a container printed.
- **k top** = how much CPU and memory pods or nodes use right now. It needs the add-on `metrics-server`. The exam cluster has it.
- **echo** = print this text. `echo abc > file` puts `abc` into the file.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns app --ignore-not-found
k create ns app
k run api --image=nginx:1.27 -n app
mkdir -p /opt
# install metrics-server (the playground has none; k top needs it). Pinned version:
k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.8.0/components.yaml
# let it trust the playground's self-signed kubelet certificates
k patch deploy metrics-server -n kube-system --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
# wait until it runs, then give it 60 s to collect the first numbers
k -n kube-system rollout status deploy metrics-server --timeout=180s
sleep 60
k top nodes
```
The last line should list each node with CPU and memory numbers.
Still `error: Metrics API not available`? Wait 30 seconds. Run `k top nodes` again.
(Did the playground already have metrics-server? The lines above simply update it. That is fine.)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Write the logs of pod `api` in namespace `app` to the file `/opt/api.log`.
> 2. Find the pod that uses the most CPU across all namespaces and write its name to `/opt/top.txt`.

**What the question is really saying:**

Two outputs, two files.
The grader opens the files and compares the content.
Write exactly what is asked, nothing more.

**Write down from the question:** pod = `api` · namespace = `app` · files = `/opt/api.log`, `/opt/top.txt`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Logs into the file

```
k logs api -n app > /opt/api.log
```

---

### Step 2. Sort all pods by CPU

```
k top pods -A --sort-by=cpu
```
- `-A` = all namespaces
- `--sort-by=cpu` = highest first

You see:
```
NAMESPACE     NAME                           CPU(cores)   MEMORY(bytes)
kube-system   kube-apiserver-controlplane    45m          310Mi
kube-system   etcd-controlplane              21m          60Mi
...
```
The first row is the answer.

---

### Step 3. Write only the name

```
echo kube-apiserver-controlplane > /opt/top.txt
```
(Use the name YOU see in the first row.)

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
cat /opt/api.log
cat /opt/top.txt
```
You want log lines in the first file.
You want exactly one pod name in the second.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `error: Metrics API not available` | no metrics-server in this playground, or it is still starting | run the metrics-server lines of Part A again, wait 60 s; the exam has it |
| `No such file or directory` on `>` | the folder does not exist | `mkdir -p /opt` |
| `Defaulted container "x" out of: x, y` | the pod has 2 containers. kubectl silently took the first one. | the question names a container? Add `-c`: `k logs api -c <container> -n app > /opt/api.log` |
| the question asks for the logs of a crashed container | current logs are empty | add `--previous` |

**Related commands the exam uses in the same style:**
```
k top nodes
k top pods -n NS --sort-by=memory
k get events -n NS --sort-by=.lastTimestamp > /opt/events.txt
k get pods -A -o wide > /opt/pods.txt
```

---

### Mug this up: the whole answer in 4 lines

```
k logs api -n app > /opt/api.log
k top pods -A --sort-by=cpu                  # first row
echo <that-name> > /opt/top.txt
cat /opt/api.log ; cat /opt/top.txt
```

**To repeat the question:** paste Part A again.
**Target time:** 2 minutes.

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

### Three words first

- **ServiceAccount (SA)** = an identity for a program running in the cluster.
- **Role** = a list of permissions inside ONE namespace. Each permission = verbs (get, list, create...) on resources (pods, deployments...).
- **RoleBinding** = gives a Role to a ServiceAccount (or user). Without the binding, the Role does nothing.

The chain: **ServiceAccount ← RoleBinding → Role**

---

### PART A. Build the exam (Killercoda only)

```
k delete ns dev --ignore-not-found
k create ns dev
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `dev`:
> 1. Create a ServiceAccount named `deploy-bot`.
> 2. Create a Role named `deploy-manager` that allows `get`, `list` and `create` on `deployments`.
> 3. Create a RoleBinding named `deploy-bot-binding` that binds the Role to the ServiceAccount.

**What the question is really saying:**

Three objects, three commands, no YAML. Then prove it works.

**Write down from the question:** namespace = `dev` · SA = `deploy-bot` · Role = `deploy-manager` · verbs = `get,list,create` · resource = `deployments` · binding = `deploy-bot-binding`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. The ServiceAccount

```
k create sa deploy-bot -n dev
```

---

### Step 2. The Role

```
k create role deploy-manager --verb=get,list,create --resource=deployments -n dev
```
- `--verb` = the allowed actions, comma-separated, no spaces
- `--resource` = what they apply to

---

### Step 3. The RoleBinding

```
k create rolebinding deploy-bot-binding --role=deploy-manager --serviceaccount=dev:deploy-bot -n dev
```
`--serviceaccount` is always written `NAMESPACE:NAME`. Here: `dev:deploy-bot`.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

Test as the ServiceAccount:
```
k auth can-i create deployments -n dev --as=system:serviceaccount:dev:deploy-bot
k auth can-i delete deployments -n dev --as=system:serviceaccount:dev:deploy-bot
```
You want `yes` for the first (allowed) and `no` for the second (not allowed).

The long name is always built the same way: `system:serviceaccount:NAMESPACE:NAME`

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| first test says `no` | a typo in a NAME (SA, Role, namespace). Kubernetes gives NO error if the SA or Role is missing. | `k describe rolebinding deploy-bot-binding -n dev`. Read Role + Subjects. Delete the wrong object (`k delete rolebinding ... -n dev`). Create it again. |
| `error: serviceaccount must be <namespace>:<name>` | you wrote `--serviceaccount=deploy-bot` without `dev:` | write `--serviceaccount=dev:deploy-bot` |
| `the server doesn't have a resource type "deploymnts"` | a spelling mistake in the resource (singular `deployment` is fine; a misspelling is not) | use `deployments` |
| the question names a USER, not a ServiceAccount | different flag | binding: `--user=alice`. Test: `--as=alice` |

---

### Mug this up: the whole answer in 4 lines

```
k create sa deploy-bot -n dev
k create role deploy-manager --verb=get,list,create --resource=deployments -n dev
k create rolebinding deploy-bot-binding --role=deploy-manager --serviceaccount=dev:deploy-bot -n dev
k auth can-i create deployments -n dev --as=system:serviceaccount:dev:deploy-bot     # yes
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 14. RBAC: ClusterRole

### Three words first

- **Namespaced resource** = lives inside a namespace: pods, deployments, services, PVCs, secrets.
- **Cluster-wide resource** = has no namespace: nodes, PersistentVolumes, namespaces, StorageClasses.
- **ClusterRole + ClusterRoleBinding** = the same as Role + RoleBinding, but for the whole cluster. A Role cannot give access to cluster-wide resources. A ClusterRole can.

How to check which kind a resource is:
```
k api-resources | grep -i nodes
```
Read the NAMESPACED column: `false` = cluster-wide.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns ops --ignore-not-found
k delete clusterrole node-reader --ignore-not-found
k delete clusterrolebinding node-viewer-binding --ignore-not-found
k create ns ops
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> Create a ServiceAccount named `node-viewer` in namespace `ops`. It must be able to `get` and `list` nodes. Use a ClusterRole named `node-reader` and a ClusterRoleBinding named `node-viewer-binding`.

**What the question is really saying:**

Same three steps as question 13.
The only difference: nodes are cluster-wide.
So the Role and the binding are the "Cluster" versions.
They take no `-n`.

**Write down from the question:** SA = `node-viewer` in `ops` · ClusterRole = `node-reader` · verbs = `get,list` · resource = `nodes` · binding = `node-viewer-binding`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. The ServiceAccount (has a namespace)

```
k create sa node-viewer -n ops
```

---

### Step 2. The ClusterRole (no namespace)

```
k create clusterrole node-reader --verb=get,list --resource=nodes
```

---

### Step 3. The ClusterRoleBinding (no namespace)

```
k create clusterrolebinding node-viewer-binding --clusterrole=node-reader --serviceaccount=ops:node-viewer
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k auth can-i list nodes --as=system:serviceaccount:ops:node-viewer       # yes
k auth can-i delete nodes --as=system:serviceaccount:ops:node-viewer     # no
```
You want `yes` for the first and `no` for the second.
No `-n` needed: nodes have no namespace.
`-n` on the clusterrole and clusterrolebinding commands is ignored.
Only the SA needs a namespace.

```
exit          # exam only
```

---

### The third combination the exam uses

> "Give user `alice` the permissions of the existing ClusterRole `view`, but only in namespace `staging`."

```
k create rolebinding alice-view --clusterrole=view --user=alice -n staging
k auth can-i list pods -n staging --as=alice      # yes
k auth can-i list pods -n default --as=alice      # no
```
A **RoleBinding** that points to a **ClusterRole** = those permissions, limited to that one namespace.

| You need access to... | Use |
|---|---|
| namespaced resources, in one namespace | Role + RoleBinding |
| cluster-wide resources (nodes, PVs...) | ClusterRole + ClusterRoleBinding |
| namespaced resources, in ALL namespaces | ClusterRole + ClusterRoleBinding |
| an existing ClusterRole, in one namespace only | RoleBinding with `--clusterrole=` |

---

### Mug this up: the whole answer in 4 lines

```
k create sa node-viewer -n ops
k create clusterrole node-reader --verb=get,list --resource=nodes
k create clusterrolebinding node-viewer-binding --clusterrole=node-reader --serviceaccount=ops:node-viewer
k auth can-i list nodes --as=system:serviceaccount:ops:node-viewer       # yes
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 15. ★ Helm template (Argo CD without CRDs)

### Three words first

- **Helm** = a tool that installs packaged applications into Kubernetes.
- **Chart** = the package. It lives in a **repo** (a URL). A chart has **values** = settings you can switch.
- **helm template** = print the YAML the chart WOULD create. Nothing is installed. (`helm install` is the command that really installs.)
- **Release** = one named copy of a chart (here `my-argo`). **CRD** = a file that teaches Kubernetes a new object type (question 18).

---

### PART A. Build the exam (Killercoda only)

```
helm version || curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | DESIRED_VERSION=v3.16.4 bash   # installs a pinned Helm 3 only if helm is missing
helm repo remove argocd 2>/dev/null
rm -f /root/argo-helm.yaml
clear
```
(Does `helm version` print a version? Then nothing is installed.
Helm 3 and Helm 4 both work for this page.
If the install URL fails, follow https://helm.sh/docs/intro/install/ .)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Add the Helm repository `https://argoproj.github.io/argo-helm` with the name `argocd`.
> 2. Generate a template of the chart `argo-cd`, version `7.7.3`, for namespace `argocd`. The CRDs must NOT be installed by the chart.
> 3. Save the output to `/root/argo-helm.yaml`.

**What the question is really saying:**

Three jobs:
1. Add the repo.
2. Find the name of the setting that switches CRDs off.
3. Write the YAML to a file.

You install nothing.

**Write down from the question:** repo name = `argocd` · URL · chart = `argo-cd` · version = `7.7.3` · namespace = `argocd` · CRDs off · file = `/root/argo-helm.yaml`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Add the repo

```
helm repo add argocd https://argoproj.github.io/argo-helm
helm repo update
```
You see `"argocd" has been added to your repositories`.

---

### Step 2. Find the setting that controls CRDs

```
helm show values argocd/argo-cd --version 7.7.3 | grep -i -A3 "^crds"
```
You see:
```
crds:
  # -- Install and upgrade CRDs
  install: true
```
`install` sits under `crds`. Written with a dot, the setting name is **`crds.install`**.

---

### Step 3. Generate the file

```
helm template my-argo argocd/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > /root/argo-helm.yaml
```

How to read it:

| Part | Meaning |
|---|---|
| `helm template` | print YAML, install nothing |
| `my-argo` | the release name (a label for this copy of the chart). Any name works; use the one the question gives. Do not confuse it with the repo name `argocd` or the namespace `argocd`. |
| `argocd/argo-cd` | `<repo-name>/<chart-name>` |
| `--version 7.7.3` | the chart version from the question |
| `--namespace argocd` | the namespace from the question |
| `--set crds.install=false` | the setting from step 2 |
| `> /root/argo-helm.yaml` | write the output into the file |

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
ls -l /root/argo-helm.yaml
grep -c "kind: CustomResourceDefinition" /root/argo-helm.yaml
```
You want a file that is not empty (size > 0).
You also want the count `0`.
(`grep -c` prints `0` when it finds nothing. It also returns exit code 1.
Some terminals show that as an error.
Here `0` IS the success case.)

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `Error: repo argocd not found` | step 1 was skipped or the name has a typo | `helm repo list` |
| `chart "argo-cd" version "..." not found` | wrong version text | `helm search repo argocd/argo-cd --versions | head` |
| the count is not 0 | the setting name is wrong for this chart version | repeat step 2 and read the exact name |
| `No such file or directory` | the target folder does not exist | `mkdir -p <folder>` first |
| you ran `helm install` by mistake | something got installed | `helm uninstall <release> -n argocd` |

---

### Mug this up: the whole answer in 5 lines

```
helm repo add argocd https://argoproj.github.io/argo-helm
helm repo update
helm show values argocd/argo-cd --version 7.7.3 | grep -i -A3 "^crds"
helm template my-argo argocd/argo-cd --version 7.7.3 --namespace argocd --set crds.install=false > /root/argo-helm.yaml
grep -c "kind: CustomResourceDefinition" /root/argo-helm.yaml      # 0
```

**To repeat the question:** paste Part A again.
**Target time:** 4 minutes.

---

## 16. Helm install, upgrade, rollback

### Three words first

- **Release** = one installed copy of a chart. It has a name and lives in a namespace.
- **Revision** = the version number of a release. Install = revision 1. Every upgrade or rollback adds 1.
- **--set name=value** = change one of the chart's settings on the command line.
- **Chart**, **repo**, **values** = the package, its URL, its settings. See question 15.

---

### PART A. Build the exam (Killercoda only)

```
helm version || curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | DESIRED_VERSION=v3.16.4 bash   # installs a pinned Helm 3 only if helm is missing
helm uninstall web -n demo 2>/dev/null
k delete ns demo --ignore-not-found
helm repo remove ingress-nginx 2>/dev/null
clear
```
Note: the ingress-nginx project was retired. Maintenance ended March 2026.
Does its repo or chart no longer install?
Then practise the same steps with a maintained chart.
- **Repo** = `helm repo add podinfo https://stefanprodan.github.io/podinfo`
- **Chart** = `podinfo/podinfo`
- **Setting** = `replicaCount` (top level, no `controller.`)

Only the names change.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Add the Helm repository `https://kubernetes.github.io/ingress-nginx` with the name `ingress-nginx`.
> 2. Install the chart `ingress-nginx` as release `web` in a new namespace `demo`, with `2` controller replicas.
> 3. Upgrade the release to `3` controller replicas.
> 4. Roll the release back to revision `1`.

**What the question is really saying:**

Install with one setting. Change that setting. Undo the change.
You need the exact name of the "replicas" setting.
`helm show values` gives it.

**Write down from the question:** repo = `ingress-nginx` · release = `web` · namespace = `demo` · replicas 2 → 3 → back to revision 1

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Add the repo

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

---

### Step 2. Find the setting name

```
helm show values ingress-nginx/ingress-nginx | grep -n replicaCount
```
You see at least two hits, for example:
```
NNN:  replicaCount: 1          <- under controller:
MMM:    replicaCount: 1        <- under defaultBackend:
```
Pick the one under `controller:`.
The question says "controller replicas". It is the first hit.
To be sure, open the values: `helm show values ingress-nginx/ingress-nginx | less`.
Type `/replicaCount`. Read the parent key above it. Press `q`.
So the setting name is **`controller.replicaCount`**.

---

### Step 3. Install

```
helm install web ingress-nginx/ingress-nginx -n demo --create-namespace --set controller.replicaCount=2
```
Reading it: `helm install <release> <repo>/<chart> -n <namespace>`.
`--create-namespace` makes the namespace if it does not exist.

---

### Step 4. Upgrade

```
helm upgrade web ingress-nginx/ingress-nginx -n demo --set controller.replicaCount=3
```

---

### Step 5. Look at the revisions, then roll back

```
helm history web -n demo
```
You see revision 1 (`superseded`) and revision 2 (`deployed`).

```
helm rollback web 1 -n demo
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
helm list -n demo
```
You want STATUS `deployed`, REVISION `3` (the rollback is itself a new revision).

```
k get deploy -n demo
```
You want the controller deployment (`web-ingress-nginx-controller`) back at `2/2`.
(Also looking at `k get svc -n demo`? EXTERNAL-IP `<pending>` is normal.
The chart asks for a cloud LoadBalancer. A playground does not have one.
Ignore it.)

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `helm list` shows nothing | you forgot `-n demo`. Helm needs the namespace too. | `helm list -A` shows all namespaces |
| `cannot re-use a name that is still in use` | the release already exists | `helm uninstall web -n demo`, install again |
| replicas did not change | the setting name is wrong | repeat step 2 |

**Related commands:**
```
helm list -A                                 # all releases everywhere
helm get values web -n demo                  # the settings of a release
helm uninstall web -n demo                   # remove a release
helm search repo ingress-nginx --versions    # available chart versions
```

---

### Mug this up: the whole answer in 6 lines

```
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx ; helm repo update
helm show values ingress-nginx/ingress-nginx | grep -n replicaCount
helm install web ingress-nginx/ingress-nginx -n demo --create-namespace --set controller.replicaCount=2
helm upgrade web ingress-nginx/ingress-nginx -n demo --set controller.replicaCount=3
helm history web -n demo
helm rollback web 1 -n demo
```

**To repeat the question:** paste Part A again.
**Target time:** 5 minutes.

---

## 17. Kustomize

### Three words first

- **Kustomize** = a way to change a normal YAML file without editing that file. It is built into kubectl.
- **kustomization.yaml** = the plan file. `resources:` lists the YAML files to use. The rest says what to change (namespace, replicas, image...).
- **`-k <folder>`** = tell kubectl to read a folder that contains a `kustomization.yaml`. (`-f` is for a normal file.)

---

### PART A. Build the exam (Killercoda only)

```
k delete ns kust --ignore-not-found
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
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> A Kustomize configuration exists in `/root/kust`. Change it so that deployment `kweb` runs with `3` replicas, then apply it. Do not edit `deploy.yaml`.

**What the question is really saying:**

The change goes into `kustomization.yaml`, not into the base file.
Then apply the FOLDER with `-k`.

**Write down from the question:** folder = `/root/kust` · deployment = `kweb` · replicas = `3` · do NOT edit `deploy.yaml`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Read what is there

```
ls /root/kust
cat /root/kust/kustomization.yaml
```
You see:
```
resources:
- deploy.yaml
namespace: kust
replicas:
- name: kweb
  count: 2
```
How it reads: "Take `deploy.yaml`. Put everything in namespace `kust`. Set `kweb` to 2 replicas."

---

### Step 2. Make the change

```
vim /root/kust/kustomization.yaml
```
Change `count: 2` to `count: 3`.
Vim keys, exactly:
1. Type `/count` and press Enter. The cursor is on the `c`.
2. Press `$`. It jumps to the last character, the `2`.
3. Type `r3`. It replaces that one character with `3`.
4. Type `:wq` and press Enter.

---

### Step 3. Preview (creates nothing)

```
k kustomize /root/kust
```
It prints the final YAML.
Check that you see `replicas: 3` and `namespace: kust`.

---

### Step 4. Apply the folder

```
k apply -k /root/kust
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get deploy -n kust
```
You want `kweb   3/3`.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `deployment.apps/kweb created` plus an error about `kustomization.yaml` (`kind not set` / `Object 'Kind' is missing`) | you used `-f` with the folder. kubectl applied `deploy.yaml` as-is into `default`. Your changes were ignored. It could not read `kustomization.yaml`. | clean up: `k delete deploy kweb -n default`, then `k apply -k /root/kust` |
| `No resources found` in `k get deploy` | you looked in the wrong namespace. The kustomization sets it. | read `namespace:` in the file |
| the question asks for a new image tag instead | different block | add to `kustomization.yaml`: `images:` / `- name: nginx` / `  newTag: "1.28"` |

---

### Mug this up: the whole answer in 4 lines

```
cat /root/kust/kustomization.yaml
vim /root/kust/kustomization.yaml            # make the change here, not in deploy.yaml
k kustomize /root/kust                       # preview
k apply -k /root/kust
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 18. ★ CRDs

### Three words first

- **CRD (CustomResourceDefinition)** = an object that adds a NEW kind of object to Kubernetes. Example: after installing cert-manager's CRDs, the cluster knows the kind `Certificate`.
- **k get crd** = lists all CRDs installed in the cluster.
- **k explain** = prints the documentation of a kind or of one of its fields. It works for the new kinds too.

---

### PART A. Build the exam (Killercoda only)

```
k apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.2/cert-manager.crds.yaml
rm -f /root/crds.txt /root/subject.txt
clear
```
This installs only cert-manager's CRDs, not cert-manager itself.
So there are no cert-manager pods. Do not look for them.
This question only needs the CRDs.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> cert-manager is installed in the cluster.
> 1. Write a list of all cert-manager CRDs to `/root/crds.txt`.
> 2. Write the documentation of the field `subject` in the `spec` of the `Certificate` resource to `/root/subject.txt`.

**What the question is really saying:**

Two outputs into two files. One comes from `k get crd`, the other from `k explain`.

**Write down from the question:** files = `/root/crds.txt`, `/root/subject.txt` · kind = `Certificate` · field = `spec.subject`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Look first

```
k get crd | grep cert-manager
```
`grep cert-manager` keeps only the lines that contain that word.
You see 6 lines, for example `certificates.cert-manager.io`.

---

### Step 2. Same command, into the file

```
k get crd | grep cert-manager > /root/crds.txt
```

---

### Step 3. The field documentation, into the file

```
k explain certificate.spec.subject > /root/subject.txt
```
The path is written with dots: `<kind>.spec.<field>`.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
cat /root/crds.txt
cat /root/subject.txt
```
You want the 6 lines in the first file.
The second file starts like this:
```
GROUP:      cert-manager.io
KIND:       Certificate
VERSION:    v1

FIELD: subject <Object>
```
followed by the field's DESCRIPTION.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `error: couldn't find resource for "certificate"` | you do not know the exact kind name | `k api-resources | grep cert-manager` and use a name from the first column |
| the question gives an exact command format (for example `-o name`) | the grader compares the format | use exactly that: `k get crd -o name | grep cert-manager > /root/crds.txt` |
| the question also asks you to CREATE an object of the new kind | you need its fields | `k explain <kind>.spec` lists them. Write a small YAML with `apiVersion` and `kind` from the top of that output, `k apply -f`. |

---

### Mug this up: the whole answer in 3 lines

```
k get crd | grep cert-manager > /root/crds.txt
k explain certificate.spec.subject > /root/subject.txt
cat /root/crds.txt ; cat /root/subject.txt
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 19. ★ cri-dockerd (prepare a node)

### Three words first

- **Container runtime** = the program on a node that actually runs containers. **cri-dockerd** is an adapter that lets Kubernetes use Docker as that runtime.
- **.deb file** = an installer package for Debian/Ubuntu. `dpkg -i <file>` installs it.
- **sysctl** = a Linux kernel setting, written `name = value`. `sysctl -w` sets it until the next reboot. A file in `/etc/sysctl.d/` sets it permanently.

This question uses no kubectl at all. It is Linux work on one machine.

---

### PART A. Build the exam (Killercoda only)

**Playground warning, read first:**
The free Killercoda playground has NO Docker. It runs containerd.
So Step 1 (`dpkg -i`) may stop with `dependency problems`.
Step 2 can NOT finish: `cri-docker` will not start.
You see `Cannot connect to the Docker daemon`.
Type those commands for practice. Read the messages. Then move on.
Steps 3 and 4 (the kernel settings) work fully here.
Do NOT run `apt-get install -f -y` on the playground.
Do NOT install Docker on the playground either.
It can replace the playground's containerd and break the cluster.
In the exam, Docker is already installed and every step works.

```
# 1. put the package where the question expects it (pinned release, matched to your Ubuntu version)
. /etc/os-release; echo "Ubuntu codename: $VERSION_CODENAME"
curl -fL -o /root/cri-dockerd.deb https://github.com/Mirantis/cri-dockerd/releases/download/v0.4.10/cri-dockerd_0.4.10.3-0.ubuntu-${VERSION_CODENAME}_amd64.deb
ls -l /root/cri-dockerd.deb
# 2. undo the kernel settings, so the task is real (the playground already has them at 1)
rm -f /etc/sysctl.d/k8s.conf
sysctl -w net.ipv4.ip_forward=0 net.ipv6.conf.all.forwarding=0 net.bridge.bridge-nf-call-iptables=0
clear
```
- `curl` fails (404)? Then your Ubuntu codename has no build. Replace `${VERSION_CODENAME}` with `jammy`. Run that line again.
- Pod networking on this machine is broken until you finish Step 4. That is expected.

---

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

Three separate Linux jobs:
1. Install a package.
2. Switch a service on.
3. Write four settings into a file and load them.

**Write down from the question:** package path · service = `cri-docker` · the 4 parameters (copy them, do not retype) · must persist (so: a file, not `sysctl -w`)

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```
(If kubectl is not installed on that machine, `k get nodes` fails. For this question that is fine.)

---

### Step 1. Install the package

```
dpkg -i /root/cri-dockerd.deb
```
You see `Setting up cri-dockerd ...`.

---

### Step 2. Enable and start the service

```
systemctl enable --now cri-docker
systemctl status cri-docker
```
You want `Active: active (running)`. Press `q`.

---

### Step 3. Write the settings into a file

```
vim /etc/sysctl.d/k8s.conf
```
Vim keys, exactly:
1. Type `:set paste` and press Enter.
2. Press `i`.
3. Paste the four lines from the question:
```
net.bridge.bridge-nf-call-iptables = 1
net.ipv6.conf.all.forwarding = 1
net.ipv4.ip_forward = 1
net.netfilter.nf_conntrack_max = 131072
```
4. Press `Esc`. Type `:wq` and press Enter.

The file name can be anything that ends in `.conf`.

---

### Step 4. Load the settings now

```
sysctl --system
```
It reads every file in `/etc/sysctl.d/` and prints each setting it applied.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
sysctl net.ipv4.ip_forward net.bridge.bridge-nf-call-iptables net.ipv6.conf.all.forwarding net.netfilter.nf_conntrack_max
```
You want the four values from the question.

```
systemctl is-enabled cri-docker          # enabled
systemctl is-active cri-docker           # active
exit                                     # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `sysctl: cannot stat /proc/sys/net/bridge/bridge-nf-call-iptables` | the kernel module for bridging is not loaded | `modprobe br_netfilter`, then `sysctl --system` again |
| `sysctl: cannot stat /proc/sys/net/netfilter/nf_conntrack_max` | the conntrack module is not loaded | `modprobe nf_conntrack`, then `sysctl --system` again |
| `dpkg: dependency problems` | a required package (usually Docker) is missing | exam: `apt-get install -f -y`. Playground: expected (no Docker), do not run it, go on to Step 3 |
| `cri-docker` fails: `Cannot connect to the Docker daemon` | Docker is not installed or not running | exam: `systemctl enable --now docker`, then restart cri-docker. Playground: expected (no Docker), go on to Step 3 |
| `Unit cri-docker.service not found` | the package did not install, or the service has another name | run `systemctl list-unit-files`, then look for cri |

---

### Mug this up: the whole answer in 5 lines

```
dpkg -i /root/cri-dockerd.deb
systemctl enable --now cri-docker
vim /etc/sysctl.d/k8s.conf                   # paste the parameters from the question
sysctl --system
sysctl net.ipv4.ip_forward                   # = 1
```

**Target time:** 4 minutes.

---

## 20. ★ Install a CNI (network plug-in)

### Three words first

- **CNI** = the network plug-in. It gives every pod an IP address and lets pods talk to each other. Without it, nodes stay `NotReady` and CoreDNS pods stay `Pending`. Most other new pods sit in `ContainerCreating`, because no IP can be given.
- **Flannel** and **Calico** = two common CNIs. **Flannel does NOT enforce NetworkPolicy. Calico does.** This one fact decides the question.
- **Pod CIDR** = the IP range the cluster uses for pods, for example `10.244.0.0/16`. The CNI must be told the same range.

---

### PART A. Build the exam (Killercoda only)

**Playground warning, read first:**
The free Killercoda playground already has a CNI.
Installing Calico on top of it would break pod networking.
So in the playground, do ONLY the rehearsal below.
That is: dry-run, find the range, edit `cidr:`.
Do NOT run Step 1 (`k create -f` tigera-operator).
Do NOT run Step 4 (`k apply -f custom-resources.yaml`). Just read them.
Nodes will already be `Ready` here.
The full task (nodes going from NotReady to Ready) needs a fresh kubeadm cluster.
That cluster must have no CNI. Examples: the killer.sh simulator, or your own VMs.

**What you CAN rehearse here, without changing anything** (Calico v3.29.1 as the example URLs):
```
k create -f https://raw.githubusercontent.com/projectcalico/calico/v3.29.1/manifests/tigera-operator.yaml --dry-run=client | tail -3
k -n kube-system get pod -l component=kube-controller-manager -o yaml | grep cluster-cidr
curl -LO https://raw.githubusercontent.com/projectcalico/calico/v3.29.1/manifests/custom-resources.yaml
vim custom-resources.yaml        # find cidr:, change it (Step 3), but do NOT apply it here
clear
```
`--dry-run=client` = check the file and print what would be created, but create nothing.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> The cluster has no CNI installed. Install ONE of the following, from the given manifest:
> - Flannel: `<URL 1>`
> - Calico: `<URL 2>` (tigera-operator) and `<URL 3>` (custom-resources)
>
> The CNI must let pods communicate AND must support NetworkPolicy enforcement.

**What the question is really saying:**

Pick the right one, then install it. "Must support NetworkPolicy" means Calico.

**Write down from the question:** the URLs · requirement = NetworkPolicy support → **Calico**

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```
In the exam the nodes show `NotReady`.
That is expected: there is no network yet.
(In the playground they are already `Ready`.)

---

### Step 1. Install the Calico operator

**Exam only. Do not run this step in the Killercoda playground.**
```
k create -f <tigera-operator URL from the question>
```
Use `create`, not `apply`.
The file is very large. `apply` refuses it with `metadata.annotations: Too long`.

---

### Step 2. Find the cluster's pod IP range

```
k -n kube-system get pod -l component=kube-controller-manager -o yaml | grep cluster-cidr
```
You see for example `- --cluster-cidr=10.244.0.0/16`. Write it down.

Does it print NOTHING? Then kubeadm ran without a pod range.
Check the kubeadm config:
```
k -n kube-system get cm kubeadm-config -o yaml | grep -i podSubnet
```
Is that empty too, or does the question give no range?
Then leave the `cidr:` in the file at its default (`192.168.0.0/16`).
Skip the edit in Step 3.

---

### Step 3. Download the settings file and put the range in

```
curl -LO <custom-resources URL from the question>
vim custom-resources.yaml
```
Type `/cidr` and press Enter.
Change the value to the range from step 2:
```
      cidr: 10.244.0.0/16
```
Vim keys, exactly:
1. The cursor is on the `c` of `cidr:`.
2. Press `w` twice. The cursor moves onto the first digit of the value.
3. Press `C`. It deletes to the end of the line and starts typing.
4. Type `10.244.0.0/16` (your range).
5. Press `Esc`. Type `:wq` and press Enter.

---

### Step 4. Apply it

**Exam only. Do not run this step in the Killercoda playground.**
```
k apply -f custom-resources.yaml
```
Do you see `no matches for kind "Installation"` (or `"APIServer"`)?
Then the operator from step 1 is still registering its CRDs.
Wait 20 seconds and run the same command again.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

Give it 1 to 2 minutes.
```
k get pods -A | grep -i -E "calico|tigera"
k get nodes
```
You want the calico pods `Running` and all nodes `Ready`.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| calico pods Running but other pods get no IP / stay `ContainerCreating` | the `cidr:` in the file is not the cluster's range | fix the file, `k apply -f custom-resources.yaml` again |
| `Too long: must have at most 262144 bytes` | you used `apply` for the operator | `k create -f ...` |
| the question does NOT mention NetworkPolicy | either CNI is fine | Flannel is one command: `k apply -f <flannel URL>` |

---

### Mug this up: the whole answer in 5 lines

```
k create -f <tigera-operator URL>
k -n kube-system get pod -l component=kube-controller-manager -o yaml | grep cluster-cidr
curl -LO <custom-resources URL> ; vim custom-resources.yaml      # cidr: <that range>
k apply -f custom-resources.yaml
k get nodes                                                       # Ready
```

**Target time:** 7 minutes.

---

## 21. kubeadm upgrade

### Three words first

- **kubeadm** = the tool that installed the cluster. It also upgrades it.
- Each machine gets three new programs: **kubeadm**, **kubelet**, **kubectl**.
- **kubelet** = the node agent.
- **kubectl** = the command line.
- **drain** = moves the pods off a node. Closes it for new pods.
- **uncordon** = opens the node again. Drain before the upgrade, uncordon after.
- Both are kubectl commands. Run them on the control plane.
- **apt-get** = the Ubuntu package installer.
- **apt-mark hold** = locks a package, so it is never updated by accident. Unlock (`unhold`), install, lock again.
- **Version numbers** = `1.35.2` means minor `35`, patch `2`. The apt package text adds a suffix, e.g. `1.35.2-1.1`.
- **New minor** (1.34 → 1.35) = change one word in the apt source file.
- **New patch** (1.35.0 → 1.35.2) = no change there.
- **ssh node01** = log in to the worker machine. `exit` brings you back to the control plane.

**Do not memorise the commands. Follow the docs page line by line.**
Memorise only the order:

```
drain → apt-get update → new kubeadm → kubeadm upgrade → new kubelet + kubectl → restart kubelet → uncordon
```

---

### PART A. Build the exam (Killercoda only)

You can practise only if a newer patch version exists.
This block shows both versions:
```
k get nodes
apt-get update -qq
apt-cache madison kubeadm | head -5
```
Compare the VERSION column of `k get nodes` with the top line of `apt-cache madison`.
- **Newer version of the same minor** (e.g. nodes `v1.35.0`, madison `1.35.2-1.1`) = practise the full routine. Use that version in place of `1.35.2`.
- **Top line is your version** = this playground cannot create the problem. Read the steps below.
- **Where to practise then** = a Killercoda scenario on an older version. Search Killercoda for "upgrade".
- **Or** = the killer.sh simulator that comes with the exam.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> Upgrade the control plane node to Kubernetes `1.35.2`. Then upgrade the worker node `node01` to the same version. Drain each node before upgrading it and make it schedulable again afterwards.

**What the question is really saying:**

Do the same routine twice: first on the control plane, then on the worker.
Only ONE command differs.
Control plane: `kubeadm upgrade apply v1.35.2`.
Worker: `kubeadm upgrade node`.
Drain and uncordon always run on the control plane.

**Write down from the question:** target version = `1.35.2` · nodes = `controlplane`, `node01` · drain before, uncordon after

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```
Read the VERSION column.
That is where you start from.

---

### Open the docs page and keep it open

1. Open **https://kubernetes.io/docs**
2. Search: **`kubeadm upgrade`**
3. Click: **"Upgrading kubeadm clusters"**
   (direct link: https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-upgrade/ )
4. For the worker, the page links to **"Upgrading Linux nodes"**.

Copy each command from the page and replace the version `x` placeholders with yours.

---

### Step 1. Drain the control plane

Run this on the control plane.
Exam: does the prompt not end in `#`? Then type `sudo -i` first.
```
k drain controlplane --ignore-daemonsets --delete-emptydir-data
```
You see (first and last lines):
```
node/controlplane cordoned
...
node/controlplane drained
```
Why: the pods move to other nodes.
No new pods arrive while you replace the node's programs.

---

### Step 2. Refresh the package list

```
cat /etc/apt/sources.list.d/kubernetes.list
apt-get update
```
You see:
```
deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.35/deb/ /
```
Why: each package source holds ONE minor version (here `v1.35`).
Patch upgrade (1.35.x → 1.35.2)? It is already right.
Minor upgrade (the line says e.g. `v1.34`)? Change it first:
Type `vim /etc/apt/sources.list.d/kubernetes.list`.
Type `:s/v1.34/v1.35/` and press Enter.
Type `:wq`.
Run `apt-get update` again.
Without `apt-get update`, apt does not know the new version exists.

---

### Step 3. Find the exact package version

```
apt-cache madison kubeadm | head -3
```
You see:
```
   kubeadm | 1.35.2-1.1 | https://pkgs.k8s.io/core:/stable:/v1.35/deb  Packages
```
Why: apt needs the FULL text `1.35.2-1.1`, not just `1.35.2`.
Write it down. kubeadm, kubelet and kubectl use the same text.
(Different suffix in your list? Use yours.)

---

### Step 4. Install the new kubeadm

```
apt-mark unhold kubeadm
apt-get install -y kubeadm=1.35.2-1.1
apt-mark hold kubeadm
kubeadm version -o short
```
You see:
```
kubeadm set on hold.
v1.35.2
```
Why: `kubeadm` performs the upgrade, so it is upgraded first.
`unhold` unlocks the package. `hold` locks it again.

---

### Step 5. Check the upgrade plan

```
kubeadm upgrade plan
```
You see, near the end:
```
You can now apply the upgrade by executing the following command:

	kubeadm upgrade apply v1.35.2
```
Why: it checks that the cluster can be upgraded.
It prints the exact next command. It changes nothing.

---

### Step 6. Upgrade the control plane

```
kubeadm upgrade apply v1.35.2
```
When asked `Are you sure you want to proceed? [y/N]`, type `y` and press Enter.
It takes a few minutes.
At the end, look for a line with `SUCCESS!` and `v1.35.2`.
Why: this upgrades the static pods: API server, controller manager, scheduler and etcd.
It does NOT touch the kubelet.

---

### Step 7. Install the new kubelet and kubectl

```
apt-mark unhold kubelet kubectl
apt-get install -y kubelet=1.35.2-1.1 kubectl=1.35.2-1.1
apt-mark hold kubelet kubectl
```
You see:
```
kubelet set on hold.
kubectl set on hold.
```
Why: `k get nodes` shows the kubelet's version as VERSION.
kubectl is upgraded with it.

---

### Step 8. Restart the kubelet

```
systemctl daemon-reload
systemctl restart kubelet
systemctl is-active kubelet
```
You see:
```
active
```
Why: the new kubelet is on disk.
The old one keeps running until you restart it.
`daemon-reload` makes systemd read the service files again first.

---

### Step 9. Uncordon the control plane

```
k uncordon controlplane
k get nodes
```
You see:
```
NAME           STATUS   ROLES           AGE   VERSION
controlplane   Ready    control-plane   ...   v1.35.2
node01         Ready    <none>          ...   v1.35.0
```
Why: pods may be scheduled on the control plane again.
node01 still shows its old version (your number may differ).
That is the next part.

---

### Step 10. Drain node01 (from the control plane)

Run this on the control plane, NOT on node01.
```
k drain node01 --ignore-daemonsets --delete-emptydir-data
```
You see:
```
node/node01 cordoned
...
node/node01 drained
```
Why: `k drain` needs kubectl and the admin kubeconfig.
Only the control plane has them.

---

### Step 11. Go to node01 and install the new kubeadm

```
ssh node01
cat /etc/apt/sources.list.d/kubernetes.list
apt-get update
apt-mark unhold kubeadm
apt-get install -y kubeadm=1.35.2-1.1
apt-mark hold kubeadm
```
The prompt now shows `node01`.
(Exam: not root? Type `sudo -i` again.)
The package source must show `v1.35` here too.
If not, change it exactly as in step 2.
Why: every machine has its own packages.
Same commands as steps 2 to 4.

---

### Step 12. Upgrade node01's configuration

```
kubeadm upgrade node
```
You want a line saying the configuration for this node was successfully updated.
Why: this is the ONE different command.
A worker has no control plane.
So type `kubeadm upgrade node`, never `apply`.

---

### Step 13. New kubelet and kubectl on node01, then restart

```
apt-mark unhold kubelet kubectl
apt-get install -y kubelet=1.35.2-1.1 kubectl=1.35.2-1.1
apt-mark hold kubelet kubectl
systemctl daemon-reload
systemctl restart kubelet
```
Why: same as steps 7 and 8, on this machine.

---

### Step 14. Back to the control plane, uncordon node01

```
exit
k uncordon node01
```
The prompt shows `controlplane` again after `exit`.
Why: `uncordon` is a kubectl command, so it runs on the control plane.
node01 takes new pods again.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get nodes
```
You want VERSION `v1.35.2` on both nodes.
You want STATUS `Ready`, and NO `SchedulingDisabled`.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `SchedulingDisabled` next to a node | you forgot `uncordon` | `k uncordon <node>` |
| `k drain` refuses: "cannot delete Pods with local storage" | missing flag | add `--delete-emptydir-data` |
| `k drain` refuses: pods "not managed by a controller" | a bare pod is on the node | add `--force` |
| `Version '1.35.2' not found` | you need the full text | copy it from `apt-cache madison kubeadm` |
| madison does not list `1.35.2` at all | no `apt-get update`, or the source file still points at the old minor | step 2 |
| VERSION still old after the upgrade | the kubelet was not restarted | `systemctl daemon-reload && systemctl restart kubelet` |
| `localhost:8080 was refused` | you ran `k drain` / `k uncordon` while still on node01 (no kubeconfig there) | `exit` first, run it on the control plane |

---

### Mug this up: the order, and the one difference

```
k drain <node> --ignore-daemonsets --delete-emptydir-data        # from the control plane
ssh node01                                                       # worker only
apt-get update ; apt-cache madison kubeadm                       # exact version text
apt: unhold → install kubeadm=<ver> → hold
kubeadm upgrade plan ; kubeadm upgrade apply v<ver>   # control plane   |  kubeadm upgrade node   # worker
apt: unhold → install kubelet=<ver> kubectl=<ver> → hold
systemctl daemon-reload ; systemctl restart kubelet
exit                                                             # worker only: back to the control plane
k uncordon <node>                                                # from the control plane
```

**Target time:** 12 minutes.
Do this question late in the exam.

---

## 22. etcd backup and restore (lower priority)

### Three words first

- **etcd** = the database where the cluster stores every object.
- etcd runs as a static pod from `/etc/kubernetes/manifests/etcd.yaml`.
- **Snapshot** = a backup file of that database. Made with `etcdctl snapshot save`.
- **Restore** = unpack a snapshot into a NEW folder. Then point etcd at that folder.
- **etcdctl** = talks to the running etcd. Use it for snapshot **save**.
- **etcdutl** = works on files only. Use it for snapshot **restore**.
- Kubernetes v1.35 uses etcd 3.6. There, `etcdctl snapshot restore` no longer exists.

etcd only accepts connections that show three certificate files.
Their paths are written in `etcd.yaml`.

---

### PART A. Build the exam (Killercoda only)

Nothing to build.
Run it on the control plane of any playground.
(Backup only is safe.
The restore changes the cluster. Do it in a playground you can throw away.)
```
rm -f /opt/etcd-backup.db ; rm -rf /var/lib/etcd-restored ; clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a snapshot of etcd, which runs at `https://127.0.0.1:2379`, and save it to `/opt/etcd-backup.db`.
> 2. Restore the snapshot into the directory `/var/lib/etcd-restored` and configure etcd to use it.

**What the question is really saying:**

Part 1 is one long command.
Part 2 is one command plus a 1-line change in `etcd.yaml`.

**Write down from the question:** endpoint = `https://127.0.0.1:2379` · backup file = `/opt/etcd-backup.db` · restore folder = `/var/lib/etcd-restored`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Get the command from the docs

1. Open **https://kubernetes.io/docs**
2. Search: **`etcd backup`**
3. Click: **"Operating etcd clusters for Kubernetes"**
   (direct link: https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/ )
4. Go to the heading **"Backing up an etcd cluster"** → **"Snapshot using etcdctl options"**.
5. Copy the command with `--cacert`, `--cert` and `--key`.

---

### Step 2. Check the tools, find the three certificate paths

```
which etcdctl etcdutl
grep -E "trusted-ca-file|cert-file|key-file" /etc/kubernetes/manifests/etcd.yaml
```
`which` prints a path for each installed tool.
In the exam both are normally there.
`etcdutl` missing in a playground? See "If something goes wrong" below.
You need it only in step 4.
Use the three lines WITHOUT the word `peer`:

| Line in etcd.yaml | Flag for etcdctl | Usual value |
|---|---|---|
| `--trusted-ca-file=` | `--cacert=` | `/etc/kubernetes/pki/etcd/ca.crt` |
| `--cert-file=` | `--cert=` | `/etc/kubernetes/pki/etcd/server.crt` |
| `--key-file=` | `--key=` | `/etc/kubernetes/pki/etcd/server.key` |

---

### Step 3. Take the snapshot

```
etcdctl snapshot save /opt/etcd-backup.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key
```
You want `Snapshot saved at /opt/etcd-backup.db`.

Question asks only for a backup? You are finished: `ls -l /opt/etcd-backup.db`.

---

### Step 4. Restore into a new folder

```
etcdutl snapshot restore /opt/etcd-backup.db --data-dir=/var/lib/etcd-restored
```
No certificates needed: this only unpacks a file.
Use `etcdutl`, not `etcdctl`.
etcd 3.6 (Kubernetes v1.35) removed `etcdctl snapshot restore`.

---

### Step 5. Tell etcd to use the new folder

```
cp /etc/kubernetes/manifests/etcd.yaml /root/etcd.yaml.bak
vim /etc/kubernetes/manifests/etcd.yaml
```
Press `G` to jump to the end of the file. You see:
```
  volumes:
  - hostPath:
      path: /etc/kubernetes/pki/etcd
      type: DirectoryOrCreate
    name: etcd-certs
  - hostPath:
      path: /var/lib/etcd
      type: DirectoryOrCreate
    name: etcd-data
```
Change **ONE line**: in the block named `etcd-data`, change

| Before | After |
|---|---|
| `path: /var/lib/etcd` | `path: /var/lib/etcd-restored` |

Save with `Esc`, `:wq`.

Why only this line:
`hostPath` is the folder on the machine.
The container shows it at `/var/lib/etcd` (that is the `mountPath`).
etcd reads `/var/lib/etcd` inside the container (that is `--data-dir`).
You change only the `hostPath`. etcd keeps reading the same place.
But that place now shows the restored folder.
Leave `--data-dir` and `mountPath` alone.

Check:
```
grep -n "etcd-restored" /etc/kubernetes/manifests/etcd.yaml
```
You want exactly 1 line.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

The kubelet restarts etcd by itself.
kubectl does not answer for up to 60 seconds. That is normal.
```
k get nodes
k get pods -n kube-system | grep etcd        # 1/1 Running
```

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| snapshot save hangs or says `context deadline exceeded` | a certificate path or the endpoint is wrong | compare with step 2 |
| kubectl does not come back after 2 minutes | a typo in `etcd.yaml` | `crictl ps -a | grep etcd`, `crictl logs <id>`. Or put the backup back: `cp /root/etcd.yaml.bak /etc/kubernetes/manifests/etcd.yaml` |
| `data-dir ... not empty` on restore | the target folder already exists | choose a new folder name or `rm -rf` it first |
| `etcdutl: command not found` (playground) | the tool is not installed there | Read the etcd version: `k -n kube-system get pod etcd-controlplane -o jsonpath='{..image}'`. Example: `3.6.5-0` → `v3.6.5`. Download: `curl -sLo /tmp/etcd.tgz https://github.com/etcd-io/etcd/releases/download/v3.6.5/etcd-v3.6.5-linux-amd64.tar.gz`. Unpack: `tar xzf /tmp/etcd.tgz -C /tmp`. Then run `/tmp/etcd-v3.6.5-linux-amd64/etcdutl` instead of `etcdutl`. Use your version number. |

---

### Mug this up: the whole answer in 5 lines

```
grep -E "trusted-ca-file|cert-file|key-file" /etc/kubernetes/manifests/etcd.yaml
etcdctl snapshot save /opt/etcd-backup.db --endpoints=https://127.0.0.1:2379 --cacert=... --cert=... --key=...
etcdutl snapshot restore /opt/etcd-backup.db --data-dir=/var/lib/etcd-restored    # etcdutl, never etcdctl
vim /etc/kubernetes/manifests/etcd.yaml      # hostPath path: /var/lib/etcd-restored
k get nodes                                  # wait up to 60 s
```

**Target time:** 10 minutes.

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

### Three words first

- **containerPort** = a line in the pod template. It names the port the container listens on.
- **NodePort Service** = a Service that also opens a port on every node. Three numbers are involved:
  - `port` = the Service's own port
  - `targetPort` = the container's port
  - `nodePort` = the port on every node (30000 to 32767)
- **k expose** = creates a Service for a Deployment.
  It copies the Deployment's labels into the selector. So the selector is always right.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns web --ignore-not-found
k create ns web
k create deploy np --image=nginx:1.27 -n web
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`:
> 1. Edit deployment `np` so that the container declares port `80` (TCP).
> 2. Create a Service named `np-svc` of type `NodePort` that exposes the deployment on port `80`, using node port `30080`.

**What the question is really saying:**

Two jobs.
Add two lines to the Deployment.
Create a Service. Then set its node port to a fixed number.
(Otherwise Kubernetes picks a random one.)

**Write down from the question:** namespace = `web` · deployment = `np` · containerPort = `80` · Service = `np-svc` · port = `80` · nodePort = `30080`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Add the container port to the Deployment

```
k edit deploy np -n web
```
Type `/image:` and press Enter. You see:
```
      containers:
      - image: nginx:1.27
        imagePullPolicy: IfNotPresent
        name: nginx
```
Put the cursor on the line `name: nginx`.
Press `o` (opens a new line below) and type these three lines.
Start `ports:` in the same column as `imagePullPolicy:` (8 spaces).
NOT at the `-` of `- image:`:
```
        ports:
        - containerPort: 80
          protocol: TCP
```
Save with `Esc`, `:wq`.
You see `deployment.apps/np edited`.

---

### Step 2. Create the Service

```
k expose deploy np --name=np-svc --port=80 --target-port=80 --type=NodePort -n web
```

---

### Step 3. Set the node port

```
k edit svc np-svc -n web
```
Type `/nodePort` and press Enter. You see a random number:
```
  - nodePort: 31544
    port: 80
```
Change it to `30080`.
Save with `Esc`, `:wq`.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get svc np-svc -n web
```
You want TYPE `NodePort` and PORT(S) `80:30080/TCP`.

```
k get endpointslices -n web -l kubernetes.io/service-name=np-svc     # ENDPOINTS shows a pod IP
curl -s -m 3 node01:30080 | head -5          # the nginx page
```

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| after step 1 vim reopens with an error at the top | wrong indentation, or a Tab character | `ports:` lines up with `imagePullPolicy:` and `name:`. Spaces only. |
| `k get endpoints` prints `Warning: v1 Endpoints is deprecated` | Endpoints is replaced by EndpointSlice since v1.33 | harmless; or use `k get endpointslices` as above |
| the Service is called `np` | you forgot `--name=np-svc` | `k delete svc np -n web`, run step 2 again |
| `provided port is not in the valid range` | nodePort outside 30000 to 32767 | use the number from the question |
| curl fails but endpoints are fine | you curled the wrong node name | `k get nodes -o wide`, use a node IP |

---

### Mug this up: the whole answer in 4 lines

```
k edit deploy np -n web                      # add ports: / - containerPort: 80 / protocol: TCP
k expose deploy np --name=np-svc --port=80 --target-port=80 --type=NodePort -n web
k edit svc np-svc -n web                     # nodePort: 30080
k get svc np-svc -n web                      # 80:30080/TCP
```

**To repeat the question:** paste Part A again.
**Target time:** 4 minutes.

---

## 24. Ingress

### Three words first

- **Ingress** = a rule for incoming web traffic: "host X, path Y → Service Z, port N".
- **IngressClass** = points to the controller. The controller is the program that carries out Ingress rules.
  Example: the class `nginx` points to ingress-nginx.
  An Ingress without a class is ignored. Exception: one IngressClass is marked as the default.
- **pathType: Prefix** = the rule matches the path and everything below it.
  `/` with Prefix matches every request.

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
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, create an Ingress named `web-ing` that uses the existing IngressClass. Requests for host `shop.example.com` with path `/` (type Prefix) must go to service `backend-svc` on port `80`.

**What the question is really saying:**

One object, and there is a command for it.
No YAML.

**Write down from the question:** namespace = `web` · Ingress = `web-ing` · host = `shop.example.com` · path = `/` Prefix · Service = `backend-svc` · port = `80` · class = "the existing one" (look it up)

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Find the class name

```
k get ingressclass
```
You see `nginx`.
Write it down.

---

### Step 2. Create the Ingress

```
k create ingress web-ing --class=nginx --rule="shop.example.com/*=backend-svc:80" -n web
```

How to read the rule: `"HOST/PATH=SERVICE:PORT"`

| Part | Meaning |
|---|---|
| `shop.example.com` | the host |
| `/*` | path `/`. The `*` makes it `pathType: Prefix`. Without `*` it becomes `Exact`. |
| `backend-svc:80` | Service name and Service port |

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k describe ing web-ing -n web
```
You want:
```
Ingress Class:    nginx
Rules:
  Host              Path  Backends
  shop.example.com  /     backend-svc:80 (<pod IP>:80)
```
Look at the pod IP in brackets (your number differs).
It proves the Service name and port are right.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| Backends shows `<error: services "..." not found>` | the Service NAME has a typo | `k delete ing web-ing -n web`, create again |
| Backends shows empty brackets `()` instead of a pod IP | the Service PORT is wrong (the Service has no such port) | `k get svc backend-svc -n web`, check PORT(S), delete and create again |
| `Ingress Class: <none>` | you forgot `--class` | delete and create again |
| the question asks for TLS with secret `web-tls` | add it inside the rule | `--rule="shop.example.com/*=backend-svc:80,tls=web-tls"` |
| the question asks for two paths | repeat the flag | `--rule="host/api*=api-svc:80" --rule="host/*=web-svc:80"` |
| the question asks for an annotation (for example rewrite-target) | add a flag | `--annotation nginx.ingress.kubernetes.io/rewrite-target=/` |

---

### Mug this up: the whole answer in 3 lines

```
k get ingressclass
k create ingress web-ing --class=nginx --rule="shop.example.com/*=backend-svc:80" -n web
k describe ing web-ing -n web
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 25. ★ Gateway API (replace an Ingress)

### Three words first

- **Gateway** = the entry point: port, protocol, hostname, TLS certificate.
  It names a **GatewayClass** (the controller). An Ingress names an IngressClass the same way.
- **HTTPRoute** = the routing rule: which host and path go to which Service and port.
  It points to its Gateway with `parentRefs`.
- Together they do what ONE Ingress did.
- **Migration** = read the values out of the Ingress. Write them into these two objects.
- **Path types** have new names.
  Ingress `pathType: Prefix` = HTTPRoute `type: PathPrefix`.
  Ingress `Exact` = HTTPRoute `Exact`.

---

### PART A. Build the exam (Killercoda only)

```
k apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml
k delete ns web --ignore-not-found
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
clear
```
(The playground has no real gateway controller.
So traffic will not flow.
The Gateway will never show `Accepted` or `Programmed`.
In Killercoda, check only that the objects exist with the right values.
The exam grades that too, plus the status check at the end.)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, an Ingress named `web-ing` exposes an application over HTTPS. Migrate it to the Gateway API:
> 1. Create a Gateway named `web-gw` that uses the existing GatewayClass and keeps the same hostname and TLS configuration as the Ingress.
> 2. Create an HTTPRoute named `web-route` that keeps the same routing rules as the Ingress.
> 3. Delete the Ingress.

**What the question is really saying:**

The question does not give you the values.
They are inside the existing Ingress.
Read 5 values from it. Put them into two new objects.

**Write down from the question:** namespace = `web` · Gateway = `web-gw` · HTTPRoute = `web-route` · source = Ingress `web-ing`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Read the 5 values

```
k get ing web-ing -n web -o yaml
k get gatewayclass
```
In the Ingress YAML, find and write down:

| # | Value | Where in the Ingress | Here |
|---|---|---|---|
| 1 | hostname | `spec.rules[].host` | `shop.example.com` |
| 2 | TLS secret | `spec.tls[].secretName` | `web-tls` |
| 3 | path | `spec.rules[].http.paths[].path` | `/` |
| 4 | Service name | `...backend.service.name` | `backend-svc` |
| 5 | Service port | `...backend.service.port.number` | `80` |

And from `k get gatewayclass`: the class name → `nginx`.

---

### Step 2. Get the text from the docs

1. Open **https://kubernetes.io/docs**
2. Search: **`gateway api`**
3. Click: **"Gateway API"**
   (direct link: https://kubernetes.io/docs/concepts/services-networking/gateway/ )
4. Copy the example under the heading **"Gateway"**.
5. Copy the example under the heading **"HTTPRoute"**.

This is what you copied (Gateway):
```
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: example-gateway
spec:
  gatewayClassName: example-class
  listeners:
  - name: http
    protocol: HTTP
    port: 80
```
This is what you copied (HTTPRoute):
```
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: example-httproute
spec:
  parentRefs:
  - name: example-gateway
  hostnames:
  - "www.example.com"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /login
    backendRefs:
    - name: example-svc
      port: 8080
```

---

### Step 3. The Gateway

```
vim gw.yaml
```
Press `i`, then paste the Gateway example.
Do the pasted lines drift more and more to the right? Then:
Press `Esc`. Type `:set paste` and press Enter.
Type `ggdG` to delete everything.
Press `i` and paste again.

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: example-gateway` | `name: web-gw` | from the question |
| 2 | (no namespace line) | add `namespace: web` under `name:` | from the question |
| 3 | `gatewayClassName: example-class` | `gatewayClassName: nginx` | the existing class (step 1) |
| 4 | `- name: http` | `- name: https` | just a label for the listener |
| 5 | `protocol: HTTP` | `protocol: HTTPS` | the Ingress used TLS |
| 6 | `port: 80` | `port: 443` | the HTTPS port |
| 7 | (not in the example) | add `hostname:` and the `tls:` block, see below | value 1 and value 2 |

The `tls:` block is NOT in the docs example.
Memorise these 4 lines, or get them with `k explain gateway.spec.listeners.tls`:
```
    tls:
      mode: Terminate
      certificateRefs:
      - name: web-tls
```

The finished file:
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
    hostname: shop.example.com
    tls:
      mode: Terminate
      certificateRefs:
      - name: web-tls
```
Save, then:
```
k apply -f gw.yaml
```

---

### Step 4. The HTTPRoute

```
vim route.yaml
```
Press `i`, then paste the HTTPRoute example.
Lines drift? Use the `:set paste` tip from step 3.

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: example-httproute` | `name: web-route` | from the question |
| 2 | (no namespace line) | add `namespace: web` under `name:` | from the question |
| 3 | `- name: example-gateway` | `- name: web-gw` | must be the Gateway's name from step 3. This is the link between the two objects. |
| 4 | `- "www.example.com"` | `- "shop.example.com"` | value 1 |
| 5 | `value: /login` | `value: /` | value 3. Keep `type: PathPrefix`. It is the Gateway name for `pathType: Prefix`. |
| 6 | `- name: example-svc` | `- name: backend-svc` | value 4 |
| 7 | `port: 8080` | `port: 80` | value 5 |

The finished file:
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
Save, then:
```
k apply -f route.yaml
```

---

### Step 5. Delete the Ingress (only after both objects exist)

```
k get gateway,httproute -n web
k delete ing web-ing -n web
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get gateway,httproute -n web
k get httproute web-route -n web -o yaml | grep -E "name: web-gw|value: /|backend-svc|port: 80"
k get ing -n web                             # No resources found
```
In Killercoda, check only this: both objects exist and carry the five values.
The `parentRefs` line only shows what you typed.
It does not prove the route is attached.
Here nothing can be attached: there is no controller.
In the exam there is a controller.
There, also run `k describe httproute web-route -n web`.
Look under **Status → Parents**. You want `Accepted` with Status `True`.
`k get gateway -n web` should show PROGRAMMED `True`.
The question gives a `curl` command? Run it.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `no matches for kind "Gateway"` | wrong `apiVersion` | `gateway.networking.k8s.io/v1` |
| the route is not attached / curl gives 404 | `parentRefs.name` is not the Gateway's name, or the hostnames differ | make them identical |
| the Ingress had NO tls | plain HTTP | keep `protocol: HTTP`, `port: 80`, and leave the `tls:` block out |

---

### Mug this up: the whole answer in 6 lines

```
k get ing web-ing -n web -o yaml             # host, secret, path, service, port
k get gatewayclass                           # class name
vim gw.yaml      ; k apply -f gw.yaml        # docs "Gateway" example + hostname + tls block
vim route.yaml   ; k apply -f route.yaml     # docs "HTTPRoute" example, parentRefs = gateway name
k get gateway,httproute -n web
k delete ing web-ing -n web
```

**To repeat the question:** paste Part A again.
**Target time:** 8 minutes.

---

## 26. ★ NetworkPolicy: allow one app to reach another

### Three words first

- **podSelector at the top of the policy** = the pods being protected (the destination).
- **ingress → from** = who may send traffic to them (the source).
- **OR inside `from`** = each `-` starts a new, separate source.
- **AND inside `from`** = two selectors under the SAME `-`. Both must be true.
- **Enforcement** = a NetworkPolicy is only a rule.
  The network plug-in (CNI) must support policies. Otherwise the rule is silently ignored.

```
  - from:                                   - from:
    - namespaceSelector: ...                  - namespaceSelector: ...
      podSelector: ...                        - podSelector: ...
  ONE dash = namespace AND pod              TWO dashes = namespace OR pod  (allows much more)
```

---

### PART A. Build the exam (Killercoda only)

```
k delete ns prod --ignore-not-found
k create ns prod
k run db --image=nginx:1.27 -n prod --labels=app=db
k run api --image=busybox:1.36 -n prod --labels=app=api -- sleep 3600
k run other --image=busybox:1.36 -n prod --labels=app=other -- sleep 3600
k expose pod db --name=db-svc --port=80 -n prod
clear
```
(nginx on port 80 plays the role of the database here.)

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `prod`, create a NetworkPolicy named `db-policy`. Pods with label `app=db` must accept incoming traffic ONLY from pods with label `app=api` in the same namespace, and only on TCP port `80`.

**Variant the exam also uses:**

> "Several NetworkPolicy files exist in `/root/netpol/`. Apply the one that allows `api` to reach `db` and is the LEAST permissive. Do not modify the files."

**What the question is really saying:**

Fill in three blanks:

| Blank | Value |
|---|---|
| WHO is protected | `app=db` |
| WHO may come in | `app=api` |
| WHICH port | TCP `80` |

**Write down from the question:** namespace = `prod` · policy = `db-policy` · protected = `app=db` · allowed source = `app=api` · port = TCP `80`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Check that the labels are real

```
k get pods -n prod --show-labels
```
You see `app=db`, `app=api`, `app=other`.
They match the question.

---

### Step 2. Get the policy text from the docs

1. Open **https://kubernetes.io/docs** → search **`network policies`** → click **"Network Policies"**
   (direct link: https://kubernetes.io/docs/concepts/services-networking/network-policies/ )
2. Under **"The NetworkPolicy resource"**, copy the example box.

This is what you copied:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - ipBlock:
        cidr: 172.17.0.0/16
        except:
        - 172.17.1.0/24
    - namespaceSelector:
        matchLabels:
          project: myproject
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 6379
  egress:
  - to:
    - ipBlock:
        cidr: 10.0.0.0/24
    ports:
    - protocol: TCP
      port: 5978
```

---

### Step 3. Paste, delete 3 blocks, change 5 lines

```
vim np.yaml
```
Press `i`, paste.
Lines drift to the right? Type `Esc`, `:set paste`, Enter, `ggdG`, `i`, paste again.
Press `Esc`.

**Delete 3 blocks.**
In vim, put the cursor on the first line of the block.
Type the number of lines, then `dd`.
Example: `7dd` deletes 7 lines.

| # | First line | Last line | Lines | vim |
|---|---|---|---|---|
| 1 | `- Egress` | (same line) | 1 | `dd` |
| 2 | `- ipBlock:` | `project: myproject` | 7 | `7dd` |
| 3 | `egress:` | `port: 5978` (end of file) | 7 | `7dd` |

After block 2, one item is left under `from:`.
It is `- podSelector:` with `role: frontend`.

**Change:**

| # | The docs say | You change it to |
|---|---|---|
| 1 | `name: test-network-policy` | `name: db-policy` |
| 2 | `namespace: default` | `namespace: prod` |
| 3 | `role: db` | `app: db` |
| 4 | `role: frontend` | `app: api` |
| 5 | `port: 6379` | `port: 80` |

The finished file:
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
Save, then:
```
k apply -f np.yaml
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k exec api -n prod -- wget -qO- -T 3 db-svc | head -3        # works
k exec other -n prod -- wget -qO- -T 3 db-svc                # download timed out
k describe netpol db-policy -n prod
```

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `other` still gets the nginx page | the network plug-in does not enforce NetworkPolicy (some playgrounds) | check the policy with `k describe netpol`; if it is right, the exam cluster will enforce it |
| `api` also times out | wrong label in `from`, or the `ports:` block is under the wrong item | compare with the finished file; `k get pods -n prod --show-labels` |
| `error validating` / `did not find expected key` | indentation after deleting the blocks | `- podSelector:` must start 4 spaces in, under `- from:` |
| `k describe netpol` shows `NamespaceSelector: project=myproject` | block 2 was not fully deleted | delete those lines, apply again |

---

### The two variants

**"api" is in ANOTHER namespace (for example `frontend`).** The `from` part becomes:
```
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: frontend
      podSelector:
        matchLabels:
          app: api
```
ONE dash.
Every namespace has the label `kubernetes.io/metadata.name=<its name>`.
Kubernetes adds it. You never label it yourself.

**"Choose the least permissive file".** Do this:
```
ls /root/netpol/
cat /root/netpol/*.yaml
```
Throw out every file that allows MORE than asked:

| In the file you see | Verdict |
|---|---|
| `from:` missing, or `- {}` , or `podSelector: {}` under `from` | allows everyone → too permissive |
| only a `namespaceSelector` (no podSelector) | allows every pod of that namespace → too permissive |
| no `ports:` section | allows every port → too permissive |
| two dashes where the question means AND | too permissive |
| exactly the asked source labels + the asked port | **this one** |

Then `k apply -f /root/netpol/<that-file>.yaml`.
Apply only that one. Do not edit it.

---

### Mug this up: the whole answer in 4 lines

```
k get pods -n prod --show-labels
vim np.yaml                                  # docs copy: delete 3 blocks, change 5 lines
k apply -f np.yaml
k exec api -n prod -- wget -qO- -T 3 db-svc  # works;  from "other": times out
```

**To repeat the question:** paste Part A again.
**Target time:** 6 minutes.

---

## 27. Default deny, but keep DNS

### Three words first

- **Ingress** (in a NetworkPolicy) = traffic coming INTO the selected pods.
- **Egress** = traffic going OUT of them.
- **Default deny** = selects all pods (`podSelector: {}`). Allows nothing.
  After it, only traffic allowed by other policies passes.
- **Port 53** = the DNS port (UDP and TCP).
  Block egress without port 53? Then pods cannot look up any Service name.
- **Egress rule without `to:`** = the listed ports are allowed to ANY destination.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns prod --ignore-not-found
k create ns prod
k run app --image=busybox:1.36 -n prod -- sleep 3600
k run web --image=nginx:1.27 -n prod --port=80 --expose
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `prod`, create a NetworkPolicy named `default-deny` that blocks all incoming and all outgoing traffic for every pod in the namespace. DNS lookups (port 53, UDP and TCP) must still work.

**What the question is really saying:**

One policy.
Select every pod. List both directions.
Allow nothing in. Allow only port 53 out.

**Write down from the question:** namespace = `prod` · policy = `default-deny` · both directions · exception = port 53 UDP + TCP

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 0. Test once BEFORE the policy

Run this line now, before you create any policy.
It prints the nginx welcome page. Nothing blocks traffic yet.
Remember it: after the policy, the same line must time out.
```
k exec app -n prod -- wget -qO- -T 3 web
```

---

### Step 1. Get the policy text from the docs

1. Open **https://kubernetes.io/docs** → search **`network policies`** → click **"Network Policies"**
   (direct link: https://kubernetes.io/docs/concepts/services-networking/network-policies/ )
2. Scroll to the heading **"Default policies"**.
3. Find **"Default deny all ingress and all egress traffic"**. Copy that small box.

This is what you copied:
```
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

---

### Step 2. Paste, change 1 line, add 7 lines

```
vim deny.yaml
```
Press `i`, paste.
Change the name.
Add `namespace: prod`: cursor on `name:`, press `o`, type it.
Put the cursor on `- Egress`. Press `o`.
Type the 6-line `egress:` block.
1 + 6 = 7 added lines.

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: default-deny-all` | `name: default-deny` | from the question |
| 2 | (no namespace line) | add `namespace: prod` under `name:` | from the question |
| 3 | (file ends after `- Egress`) | add the `egress:` block below | the DNS exception |

The finished file:
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
How it reads:
"All pods. Both directions are restricted.
Nothing may come in (no `ingress:` section).
Going out, only port 53 is allowed."

`egress:` starts in the same column as `policyTypes:`.

Save, then:
```
k apply -f deny.yaml
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k describe netpol default-deny -n prod
```
You want (the lower part):
```
Spec:
  PodSelector:     <none> (Allowing the specific traffic to all pods in this namespace)
  Allowing ingress traffic:
    <none> (Selected pods are isolated for ingress connectivity)
  Allowing egress traffic:
    To Port: 53/UDP
    To Port: 53/TCP
    To: <any> (traffic not restricted by destination)
  Policy Types: Ingress, Egress
```
Test: a name lookup works, a connection does not.
(In Step 0 the `wget` line printed the nginx page.
Now it must time out.)
```
k exec app -n prod -- nslookup web.prod.svc.cluster.local     # Name + Address: DNS still works
k exec app -n prod -- wget -qO- -T 3 web                      # download timed out: traffic blocked
```
`wget` still prints the page after the policy?
Then the playground's network plug-in does not enforce NetworkPolicy.
Use the describe output as your check.

```
exit          # exam only
```

---

### The shorter versions of this question

| The question says | The `spec:` is |
|---|---|
| "deny all ingress" | `podSelector: {}` + `policyTypes: [Ingress]` |
| "deny all egress" | `podSelector: {}` + `policyTypes: [Egress]` |
| "deny all ingress and egress" | `podSelector: {}` + `policyTypes: [Ingress, Egress]` |
| "... but allow DNS" | add the `egress:` → `ports: 53` block |

All four are on the same docs page under "Default policies".

---

### Mug this up: the whole answer in 3 lines

```
vim deny.yaml                                # docs "Default deny all ingress and all egress" + namespace + egress port 53
k apply -f deny.yaml
k describe netpol default-deny -n prod
```

**To repeat the question:** paste Part A again.
**Target time:** 4 minutes.

---

## 28. ★ TLS settings in a ConfigMap

### Three words first

- **ConfigMap** = an object that holds configuration text.
  A pod can mount it as a file. Here it holds the nginx config file.
- **ssl_protocols** = the nginx setting that lists which TLS versions the server accepts.
- **nginx reads its config file only when it starts.**
- **Mounted as a folder** = the file updates by itself within a minute. nginx does not reload it.
- **Mounted with `subPath`** (this setup) = the file never updates.
- Either way: restart the pods with `k rollout restart`.
- **TLS versions** = TLSv1.2 and TLSv1.3 are versions of the HTTPS encryption.
- **`curl --tls-max 1.2`** = forces the older one. It must fail once only 1.3 is allowed.

---

### PART A. Build the exam (Killercoda only)

This builds a real HTTPS nginx:
- a self-signed certificate (Secret `nginx-tls`)
- the config in ConfigMap `nginx-config`, mounted as `/etc/nginx/nginx.conf`
- a Service.
```
k delete ns nginx-static --ignore-not-found
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
clear
```
Wait until `k get pods -n nginx-static` shows `1/1 Running`.
Now the closing-routine `curl` with `--tls-max 1.2` still WORKS.
That is the problem you fix.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `nginx-static`, deployment `nginx-static` gets its configuration from ConfigMap `nginx-config`. The server currently accepts TLSv1.2 and TLSv1.3. Change the configuration so that ONLY TLSv1.3 is accepted, and make sure the running pods use the new configuration.

**What the question is really saying:**

Remove one word from one line in a ConfigMap.
Then restart the Deployment so the pods pick it up.

**Write down from the question:** namespace = `nginx-static` · ConfigMap = `nginx-config` · deployment = `nginx-static` · keep only `TLSv1.3`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Backup first

```
k get cm nginx-config -n nginx-static -o yaml > /root/cm-backup.yaml
```

---

### Step 2. Change the line

```
k edit cm nginx-config -n nginx-static
```
Type `/ssl_protocols` and press Enter.
The cursor is on the line inside `nginx.conf: |`.

| Before | After |
|---|---|
| `ssl_protocols TLSv1.2 TLSv1.3;` | `ssl_protocols TLSv1.3;` |

Easiest way: type `:s/TLSv1.2 //` and press Enter.
It removes `TLSv1.2` and its space, on this line only.
Keep the `;` at the end.
Save with `Esc`, `:wq`.
You see `configmap/nginx-config edited`.

---

### Step 3. Restart the pods

```
k rollout restart deploy nginx-static -n nginx-static
k rollout status deploy nginx-static -n nginx-static
```
You want `successfully rolled out`.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get cm nginx-config -n nginx-static -o yaml | grep ssl_protocols
k get pods -n nginx-static                   # new pod, 1/1 Running
```
Test the server.
In Killercoda, use the Service IP.
In the exam, the question gives the address, often with this exact test.
```
IP=$(k get svc nginx-static -n nginx-static -o jsonpath='{.spec.clusterIP}')
curl -sSk --tls-max 1.2 https://$IP          # must now FAIL (error ... protocol version)
curl -sSk --tlsv1.3 https://$IP              # hello
```

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| the edit is refused: `field is immutable` | the ConfigMap has `immutable: true` | Change the line in `vim /root/cm-backup.yaml`. Then `k replace --force -f /root/cm-backup.yaml` (deletes and re-creates it). Then step 3. Not `k apply`: the backup still holds `resourceVersion`. |
| new pod goes `CrashLoopBackOff` | you broke the nginx syntax (missing `;`) | `k logs <pod> -n nginx-static` names the line. Fix the ConfigMap, restart again. |
| the old TLS version still works | you skipped step 3 | restart |

---

### Mug this up: the whole answer in 3 lines

```
k get cm nginx-config -n nginx-static -o yaml > /root/cm-backup.yaml
k edit cm nginx-config -n nginx-static                           # ssl_protocols TLSv1.3;
k rollout restart deploy nginx-static -n nginx-static
```

**To repeat the question:** paste Part A again.
**Target time:** 4 minutes.

---

## 29. CoreDNS config

### Three words first

- **Corefile** = the configuration text of CoreDNS.
  It is stored in ConfigMap `coredns`, namespace `kube-system`.
- **`.:53 { ... }`** = the main block of the Corefile. Each line inside is a plug-in.
  The line `kubernetes cluster.local ...` answers for Service names.
- **rewrite name A B** = a plug-in line.
  Someone asks for name A? CoreDNS answers as if they asked for name B.
- **reload** = a plug-in line already in the Corefile.
  CoreDNS notices a changed ConfigMap by itself, within a minute or two.
  So the lookup may work even before your restart.
  Restart anyway. It is immediate, and the question asks for it.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns web --ignore-not-found
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 -n web
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> Configure cluster DNS so that the name `api.example.com` resolves to the service `backend-svc` in namespace `web`, for all pods in the cluster. Make sure CoreDNS uses the new configuration.

**What the question is really saying:**

Add one line to the Corefile, then restart CoreDNS.
Three motions: backup, edit, restart.
A mistake here breaks DNS for the whole cluster.
So the backup is not optional.

**Write down from the question:** name = `api.example.com` · target = `backend-svc.web.svc.cluster.local`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Backup first

```
k get cm coredns -n kube-system -o yaml > /root/coredns-backup.yaml
```

---

### Step 2. Add the line

```
k edit cm coredns -n kube-system
```
You see:
```
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
```
Put the cursor on the line `ready`.
Press `o` (new line below).
Type this, with the same indentation as `ready`:
```
        rewrite name api.example.com backend-svc.web.svc.cluster.local
```
Save with `Esc`, `:wq`.

---

### Step 3. Restart CoreDNS

```
k rollout restart deploy coredns -n kube-system
k rollout status deploy coredns -n kube-system
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pods -n kube-system -l k8s-app=kube-dns                # all 1/1 Running
k get svc backend-svc -n web                                 # note the CLUSTER-IP
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup api.example.com
```
You want an `Address:` line that shows the CLUSTER-IP of `backend-svc`.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| coredns pods `CrashLoopBackOff` after the restart | a typo in the Corefile | `k logs -n kube-system -l k8s-app=kube-dns` names the line. Or put the backup back: `k replace --force -f /root/coredns-backup.yaml`, then restart again. (Not `k apply`: the backup holds an old `resourceVersion`.) |
| nslookup says `NXDOMAIN` | the line is outside the `.:53 { }` block, or you did not restart | check the position, restart |
| the question asks to forward a whole domain to another DNS server | different line | add a new block at the end of the Corefile: `example.org:53 { forward . 10.0.0.53 }` (3 lines). Docs search: `customizing dns service` |

---

### Mug this up: the whole answer in 4 lines

```
k get cm coredns -n kube-system -o yaml > /root/coredns-backup.yaml
k edit cm coredns -n kube-system             # inside .:53 { } add: rewrite name A B
k rollout restart deploy coredns -n kube-system
k run t --image=busybox:1.36 --rm -it --restart=Never -- nslookup api.example.com
```

**To put the playground back afterwards:** `k replace --force -f /root/coredns-backup.yaml ; k rollout restart deploy coredns -n kube-system`
**Target time:** 5 minutes.

---

## 30. DNS names across namespaces

### Three words first

- **Short name** = just the Service name, e.g. `backend-svc`.
  It only works from a pod in the SAME namespace.
- **Full name (FQDN)** = `SERVICE.NAMESPACE.svc.cluster.local`. It works from every namespace.
- **nslookup** = asks DNS for the IP behind a name.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns web --ignore-not-found
k create ns web
k create deploy backend --image=nginx:1.27 -n web
k expose deploy backend --name=backend-svc --port=80 -n web
rm -f /root/dns.txt
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> From a temporary pod in namespace `default` (image `busybox:1.36`), look up the DNS name of service `backend-svc` that lives in namespace `web`. Save the output of the lookup to `/root/dns.txt`.

**What the question is really saying:**

The test pod and the Service are in different namespaces.
So use the full name.
Send the output into a file.

**Write down from the question:** Service = `backend-svc` · its namespace = `web` · image = `busybox:1.36` · file = `/root/dns.txt`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Build the full name

Nothing to type here. Read it like this:
```
SERVICE   . NAMESPACE . svc.cluster.local
backend-svc . web     . svc.cluster.local     →   backend-svc.web.svc.cluster.local
```

---

### Step 2. Look it up and write the file

```
k run t --image=busybox:1.36 --rm -i --restart=Never -- nslookup backend-svc.web.svc.cluster.local > /root/dns.txt
```

| Part | Meaning |
|---|---|
| `k run t --image=busybox:1.36` | a temporary pod named `t` (in `default`, because there is no `-n`) |
| `--rm -i --restart=Never` | run once, pass the output back to you, delete the pod afterwards. (`-i` without `-t`: no terminal is needed when the output goes into a file.) |
| `-- nslookup <name>` | the command the pod runs |
| `> /root/dns.txt` | write the output into the file |

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
cat /root/dns.txt
```
You want something like this (your IPs differ):
```
Server:		10.96.0.10
Address:	10.96.0.10:53

Name:	backend-svc.web.svc.cluster.local
Address: 10.103.45.12
```
The first `Address` (with `:53`) is the DNS server.
The one that counts is the `Address` under `Name:`.
Compare it with CLUSTER-IP in `k get svc backend-svc -n web`.
It is the same IP.
You may see `*** Can't find backend-svc.web.svc.cluster.local: No answer`.
That is normal.
busybox also asks for an IPv6 address, and there is none.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `NXDOMAIN` / `can't resolve` | a typo in the name, or the wrong namespace in the name | build the name again from step 1 |
| `pods "t" already exists` | an older test pod is still there | `k delete pod t`, run it again |
| the file also contains `pod "t" deleted` | that line comes from kubectl | usually accepted. To avoid it: run the pod without `--rm`. Then `k logs t > /root/dns.txt`. Then `k delete pod t`. |
| every name fails | DNS itself is broken | `k get pods -n kube-system -l k8s-app=kube-dns` must show Running; if not, `k logs` them and check the `coredns` ConfigMap |

**Good to know:** `backend-svc.web` (without the rest) also works.
A pod's DNS settings are in `/etc/resolv.conf`.
Read them: `k exec <pod> -- cat /etc/resolv.conf`.

---

### Mug this up: the whole answer in 2 lines

```
k run t --image=busybox:1.36 --rm -i --restart=Never -- nslookup backend-svc.web.svc.cluster.local > /root/dns.txt
cat /root/dns.txt
```

**To repeat the question:** paste Part A again.
**Target time:** 2 minutes.

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

### Three words first

- **Sidecar** = a second container in the same pod. It helps the main one, e.g. reads its log file.
  In YAML it goes under `initContainers:` with `restartPolicy: Always`.
  That one line makes it a sidecar: it starts first and keeps running.
- **emptyDir volume** = an empty folder that belongs to the pod.
  Every container that mounts it sees the same files.
- **volumeMounts** = where a volume appears inside a container.
  Two containers in one pod do NOT see each other's files.
  Only a volume that both mount is shared.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns work --ignore-not-found
k create ns work
k create deploy app --image=busybox:1.36 -n work -- sh -c "while true; do date >> /var/log/app.log; sleep 2; done"
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `work`, deployment `app` writes its log to `/var/log/app.log`. Add a sidecar container named `log-shipper` with image `busybox:1.36` that runs `tail -f /var/log/app.log`. Use a shared volume named `logs` mounted at `/var/log` in both containers. Do not change the existing container's image or command.

**What the question is really saying:**

Add three things to the Deployment:

```
1. a volume                          (pod level)
2. a mount of it in the main container   (container level)
3. the sidecar, which also mounts it     (pod level, under initContainers)
```

**Write down from the question:** namespace = `work` · deployment = `app` · sidecar = `log-shipper`, `busybox:1.36`, `tail -f /var/log/app.log` · volume = `logs` · mount path = `/var/log`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Open the docs example next to you

1. Open **https://kubernetes.io/docs** → search **`sidecar containers`** → click **"Sidecar Containers"**
   (direct link: https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/ )
2. Under the heading **"Example application"** there is a Deployment.
   Its bottom half is exactly the shape you need:

```
    spec:
      containers:
        - name: myapp
          image: alpine:latest
          command: ['sh', '-c', 'while true; do echo "logging" >> /opt/logs.txt; sleep 1; done']
          volumeMounts:
            - name: data
              mountPath: /opt
      initContainers:
        - name: logshipper
          image: alpine:latest
          restartPolicy: Always
          command: ['sh', '-c', 'tail -F /opt/logs.txt']
          volumeMounts:
            - name: data
              mountPath: /opt
      volumes:
        - name: data
          emptyDir: {}
```
Copy three pieces from it:
the `volumeMounts:` block, the `initContainers:` block, the `volumes:` block.

---

### Step 2. Work on a file, not in the live editor

A long edit is safer in a file.
If the YAML is wrong, you still have the file.
```
k get deploy app -n work -o yaml > app.yaml
cp app.yaml app-backup.yaml
vim app.yaml
```
Type `/containers:` and press Enter. You see:
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
```

---

### Step 3. Add the three pieces

Where they go: `app.yaml` has two `spec:` lines.
Use the SECOND one, directly above `containers:`. It belongs to `template:`.
Not the top `spec:` under `kind: Deployment`.
- **First** = type `:set paste` and Enter. Then vim adds no indentation of its own.
- **Pieces 1 and 3** = cursor on that second `spec:` line. Press `o`. Type the 11 lines.
- **Piece 2** = cursor on `resources: {}` of the main container. Press `o`. Type the 3 lines.

Lines marked `# ADD` are new. Do not type the `# ADD` text.
The result looks like this:
```
    spec:
      volumes:                                        # ADD  piece 1
      - name: logs                                    # ADD
        emptyDir: {}                                  # ADD
      initContainers:                                 # ADD  piece 3
      - name: log-shipper                             # ADD
        image: busybox:1.36                           # ADD
        restartPolicy: Always                         # ADD
        command: ['sh', '-c', 'tail -f /var/log/app.log']   # ADD
        volumeMounts:                                 # ADD
        - name: logs                                  # ADD
          mountPath: /var/log                         # ADD
      containers:
      - command:
        - sh
        - -c
        - while true; do date >> /var/log/app.log; sleep 2; done
        image: busybox:1.36
        imagePullPolicy: IfNotPresent
        name: busybox
        resources: {}
        volumeMounts:                                 # ADD  piece 2
        - name: logs                                  # ADD
          mountPath: /var/log                         # ADD
```

What changed compared with the docs example:

| The docs say | You write |
|---|---|
| volume name `data` (3 places) | `logs` (3 places) |
| `mountPath: /opt` (2 places) | `/var/log` (2 places) |
| sidecar `name: logshipper` | `log-shipper` |
| `image: alpine:latest` | `busybox:1.36` |
| `tail -F /opt/logs.txt` | `tail -f /var/log/app.log` |

Indentation rule: `volumes:`, `initContainers:` and `containers:` all start in the same column.

Save with `Esc`, `:wq`.

---

### Step 4. Apply

```
k apply -f app.yaml
```
(A warning about a missing annotation is harmless.)

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k rollout status deploy app -n work
k get pods -n work
```
You want READY **`2/2`** (main container + sidecar), `Running`.

```
k logs deploy/app -c log-shipper -n work | tail -3
```
You want date lines.
They prove the sidecar reads the file the main container writes.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `error converting YAML` / `did not find expected key` | indentation, or a Tab | compare with step 3; spaces only |
| pod stays `Init:0/1` forever | `restartPolicy: Always` is missing. Kubernetes waits for `tail -f` to finish. It never does. | add the line |
| sidecar log: `tail: can't open '/var/log/app.log'` | the main container does not mount the volume (piece 2 missing), or the names differ | the `name:` must be identical in all 3 places |
| everything is broken | start over | `cp app-backup.yaml app.yaml` |

---

### Mug this up: the whole answer in 5 lines

```
k get deploy app -n work -o yaml > app.yaml
vim app.yaml          # 1. volumes: emptyDir   2. volumeMounts in main   3. initContainers + restartPolicy: Always + volumeMounts
k apply -f app.yaml
k get pods -n work                           # 2/2
k logs deploy/app -c log-shipper -n work
```

**To repeat the question:** paste Part A again.
**Target time:** 8 minutes.

---

## 32. ★ HPA (autoscaling)

### Three words first

- **HPA (HorizontalPodAutoscaler)** = changes a Deployment's number of replicas automatically, based on CPU use.
- **Target 70%** = "keep average CPU use at 70% of what each pod REQUESTED".
  So the Deployment must have a CPU request.
  Without one, the HPA cannot calculate anything.
- **Stabilization window** = how long the HPA waits before it removes pods.
  So the count does not jump up and down.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns shop --ignore-not-found
k create ns shop
k create deploy web --image=nginx:1.27 -n shop
k set resources deploy web -n shop --requests=cpu=100m
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `shop`, create a HorizontalPodAutoscaler named `web` for deployment `web`: minimum `2` replicas, maximum `5` replicas, target average CPU utilization `70`%. Set the scale-down stabilization window to `30` seconds.

**What the question is really saying:**

One command creates the HPA.
One small edit adds the 3-line "behavior" block.
The command has no flag for it.

**Write down from the question:** namespace = `shop` · deployment = `web` · min `2` · max `5` · CPU `70`% · scale-down window `30` s

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Create the HPA

```
k autoscale deploy web --min=2 --max=5 --cpu-percent=70 -n shop
```
The HPA gets the same name as the deployment: `web`.
A warning that `--cpu-percent` is deprecated is harmless.
Flag refused? Run `k autoscale --help`.
Use the newer spelling shown there (`--cpu=70%`).

---

### Step 2. Add the stabilization window

```
k edit hpa web -n shop
```
Type `/maxReplicas` and press Enter.
Press `O` (capital o: new line ABOVE).
Type these 3 lines. Start `behavior:` in the same column as `maxReplicas:`:
```
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 30
```
Save with `Esc`, `:wq`.

Forgot the spelling? Docs search **`horizontal pod autoscaling`**.
Open page **"Horizontal Pod Autoscaling"** → heading **"Stabilization window"**.
The same 3 lines are there.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get hpa -n shop
```
You want one of these two (both are correct):
```
NAME   REFERENCE        TARGETS              MINPODS   MAXPODS   REPLICAS
web    Deployment/web   cpu: 0%/70%          2         5         2
web    Deployment/web   cpu: <unknown>/70%   2         5         2
```
The second line appears when the playground has no metrics-server (see the table below).
Check MINPODS, MAXPODS and `/70%`.
```
k get hpa web -n shop -o yaml | grep -A2 scaleDown
```
You want `stabilizationWindowSeconds: 30` directly under `scaleDown:`.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| TARGETS `<unknown>/70%` for more than a minute | the deployment has no CPU request | `k set resources deploy web -n shop --requests=cpu=100m` |
| TARGETS `<unknown>` and `k top pods` also fails | no metrics-server in this playground | nothing to fix; the exam has it |
| the question wants a different HPA name | the command names it after the deployment | add `--name=<name>` to step 1 |
| the question asks for MEMORY | not every kubectl version has a memory flag | run `k autoscale --help`. Lists `--memory`? Use it (e.g. `--memory=80%`). If not: create with CPU. Then `k edit hpa`, change `name: cpu` to `name: memory`. |

---

### Mug this up: the whole answer in 3 lines

```
k autoscale deploy web --min=2 --max=5 --cpu-percent=70 -n shop
k edit hpa web -n shop            # behavior: / scaleDown: / stabilizationWindowSeconds: 30
k get hpa -n shop
```

**To repeat the question:** paste Part A again.
**Target time:** 4 minutes.

---

## 33. ★ PriorityClass

### Three words first

- **PriorityClass** = an object that holds a number.
  A pod that names the class gets that priority.
  Cluster full? Higher numbers are scheduled first.
  Lower ones can be evicted to make room.
- **User-defined** = created by an admin.
  Two classes always exist and belong to Kubernetes: `system-cluster-critical`, `system-node-critical`.
  They do NOT count as user-defined.
- **priorityClassName** = the line in the pod template (pod level) that names the class.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns shop --ignore-not-found
k delete pc high-priority mid-prio low-prio --ignore-not-found
k create ns shop
k create deploy web --image=nginx:1.27 -n shop
k create pc mid-prio --value=1000
k create pc low-prio --value=100
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a PriorityClass named `high-priority` whose value is exactly ONE LESS than the highest existing user-defined PriorityClass.
> 2. Configure deployment `web` in namespace `shop` to use this PriorityClass.

**What the question is really saying:**

Look at the existing numbers. Ignore the two `system-` ones.
Subtract 1. Create the class.
Add one line to the Deployment.

**Write down from the question:** class = `high-priority` · value = highest user-defined minus 1 · deployment = `web` in `shop`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Look at the existing classes

```
k get pc
```
(`pc` = short for `priorityclass`. No namespace.) For example, you see:
```
NAME                      VALUE        GLOBAL-DEFAULT   AGE
low-prio                  100          false            1m
mid-prio                  1000         false            1m
system-cluster-critical   2000000000   false            5h
system-node-critical      2000001000   false            5h
```
Ignore both `system-` lines.
Highest user-defined = `1000`.
One less = **`999`**.

---

### Step 2. Create the class

```
k create pc high-priority --value=999
```

---

### Step 3. Put it on the Deployment

```
k edit deploy web -n shop
```
Type `/containers:` and press Enter.
Press `O` (capital o: new line ABOVE).
Type this, starting in the same column as `containers:`:
```
      priorityClassName: high-priority
```
Save with `Esc`, `:wq`.

One-command alternative. Same result, no editor.
```
k patch deploy web -n shop -p '{"spec":{"template":{"spec":{"priorityClassName":"high-priority"}}}}'
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k rollout status deploy web -n shop
k get pods -n shop -o custom-columns=NAME:.metadata.name,CLASS:.spec.priorityClassName,PRIO:.spec.priority
```
You want CLASS `high-priority` and PRIO `999`.
Old `Terminating` pods show CLASS `<none>`.
Ignore them, or run the command again after a few seconds.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| you used 1999999999 | you counted a `system-` class | `k delete pc high-priority`, create again with the right value |
| new pods do not appear, `k describe rs` says `no PriorityClass with name ...` | typo in the class name | fix the line in `k edit deploy` |
| other pods got evicted after your change | expected: higher priority pods may push out lower ones | nothing to fix |
| a PriorityClass value cannot be edited | the field is immutable | delete and create again |

---

### Mug this up: the whole answer in 4 lines

```
k get pc                                     # highest NON-system value
k create pc high-priority --value=<that minus 1>
k edit deploy web -n shop                    # priorityClassName: high-priority  (above containers:)
k get pods -n shop -o custom-columns=NAME:.metadata.name,CLASS:.spec.priorityClassName
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

---

## 34. ★ Share a node's resources between pods

### Three words first

- **Allocatable** = how much CPU and memory a node offers to pods in total.
- **Allocated (requests)** = how much of that is already reserved by the pods running there.
- **Request** = what one pod reserves.
  The scheduler places a pod only if `allocatable − already requested ≥ the pod's request`.
  Ask for too much and the pod stays Pending.

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
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `shop`, deployment `web` runs `3` replicas, all on node `node01`. Set CPU and memory requests so that the three pods share the node's available resources equally. Leave roughly 10% headroom so the node stays stable. All 3 pods must be Running afterwards.

**What the question is really saying:**

A calculation, then one command:
```
(allocatable − already requested) × 0.9 ÷ 3  =  request per pod
```

**Write down from the question:** namespace = `shop` · deployment = `web` · 3 replicas · node = `node01` · 10% headroom

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Take the deployment out of the calculation

```
k scale deploy web --replicas=0 -n shop
```
Now the node's numbers show only what OTHER pods use.

---

### Step 2. Read the two numbers

```
k describe node node01 | grep -A7 "Allocatable:"
k describe node node01 | grep -A6 "Allocated resources:"
```
Example output. **Your numbers will differ.**
Killercoda's node01 is not this example:
```
Allocatable:
  cpu:                1
  ephemeral-storage:  19586931083
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             1843756Ki
  pods:               110
...
Allocated resources:
  (Total limits may be over 100 percent, i.e., overcommitted.)
  Resource           Requests     Limits
  --------           --------     ------
  cpu                250m (25%)   0 (0%)
  memory             200Mi (11%)  0 (0%)
  ephemeral-storage  0 (0%)       0 (0%)
```
Take `cpu` and `memory` from Allocatable.
Take the Requests column (not Limits) from Allocated resources.

---

### Step 3. Calculate

Convert first: `1` CPU = `1000m`.
Memory in Ki ÷ 1024 = Mi → `1843756Ki` ≈ `1800Mi`.

| | CPU | Memory |
|---|---|---|
| Allocatable | 1000m | 1800Mi |
| − already requested | − 250m | − 200Mi |
| = free | 750m | 1600Mi |
| × 0.9 (keep 10%) | 675m | 1440Mi |
| ÷ 3 pods | 225m | 480Mi |
| round DOWN | **220m** | **480Mi** |

**Use YOUR numbers, not this example.**
Always round down.

---

### Step 4. Set the requests and bring the pods back

```
k set resources deploy web -n shop --requests=cpu=220m,memory=480Mi
k scale deploy web --replicas=3 -n shop
```
Only if the question also asks for limits: add `--limits=cpu=220m,memory=480Mi`.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pods -n shop -o wide
```
You want 3 pods, all `Running`, all on `node01`.

```
k describe node node01 | grep -A6 "Allocated resources:"
```
You want CPU and memory requests around 90%, not above 100%.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| one pod `Pending`, Events: `Insufficient cpu` (or memory) | the requests are a bit too big | lower them by 10% and run step 4 again |
| the pod has init containers too | init containers run one at a time, before the app. The scheduler reserves the BIGGER of: largest init request, or sum of app requests. | usually nothing to do. Keep each init request at or below the app's request. |
| the deployment has 2 containers per pod | `set resources` applies the values to EVERY container | divide by (pods × containers), or name one container: `-c <name>` |

---

### Mug this up: the whole answer in 5 lines

```
k scale deploy web --replicas=0 -n shop
k describe node node01 | grep -A7 "Allocatable:"
k describe node node01 | grep -A6 "Allocated resources:"
k set resources deploy web -n shop --requests=cpu=<X>m,memory=<Y>Mi      # (free × 0.9) ÷ 3, rounded down
k scale deploy web --replicas=3 -n shop      ;  k get pods -n shop
```

**To repeat the question:** paste Part A again.
**Target time:** 6 minutes.

---

## 35. ConfigMap and Secret in a pod

### Three words first

- **ConfigMap** = holds plain settings as `KEY=VALUE`.
- **Secret** = the same, for sensitive values (passwords).
- **As environment variables** = every key becomes a variable inside the container.
  Written with `envFrom:` at CONTAINER level.
- **As files (a volume)** = every key becomes a file in a folder in the container.
  The file's content is the value.
  Needs two blocks: `volumes:` at POD level, `volumeMounts:` at CONTAINER level.
  The same `name:` links them.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns app --ignore-not-found
k create ns app
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `app`:
> 1. Create a ConfigMap named `app-cfg` with the key `LOG_LEVEL` and value `debug`.
> 2. Create a Secret named `db-sec` with the key `password` and value `s3cret`.
> 3. Create a pod named `api` with image `nginx:1.27`. All keys of the ConfigMap must be available as environment variables. The Secret must be mounted as files under `/etc/db`.

**What the question is really saying:**

Two one-line commands.
Then a pod YAML. Add two blocks to it:
`envFrom` for the ConfigMap.
`volumes` + `volumeMounts` for the Secret.

**Write down from the question:** namespace = `app` · ConfigMap = `app-cfg` (`LOG_LEVEL=debug`) · Secret = `db-sec` (`password=s3cret`) · pod = `api`, `nginx:1.27` · mount path = `/etc/db`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Create the ConfigMap and the Secret

```
k create cm app-cfg --from-literal=LOG_LEVEL=debug -n app
k create secret generic db-sec --from-literal=password=s3cret -n app
```

---

### Step 2. Generate the pod YAML (no typing)

```
k run api --image=nginx:1.27 -n app --dry-run=client -o yaml > pod.yaml
vim pod.yaml
```
`--dry-run=client -o yaml` = print the YAML, create nothing.
You see:
```
spec:
  containers:
  - image: nginx:1.27
    name: api
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

---

### Step 3. If you forget the lines: where they are in the docs

Step 4 shows every line you need.
Use this table only if you forget them in the exam.

| Block | Docs search | Page | Copy |
|---|---|---|---|
| `envFrom` | `configmap` | "Configure a Pod to Use a ConfigMap" → heading "Configure all key-value pairs in a ConfigMap as container environment variables" | the 3 lines `envFrom:` / `- configMapRef:` / `name:` |
| Secret volume | `secret volume` | "Distribute Credentials Securely Using Secrets" → heading "Create a Pod that has access to the secret data through a Volume" | the `volumeMounts:` block and the `volumes:` block |

---

### Step 4. Add the two blocks

In `pod.yaml`, type `:set paste` and Enter first.
Then vim adds no indentation of its own.
- **Container level** = cursor on `resources: {}`. Press `o`.
  Type the 6 lines `envFrom:` to `mountPath: /etc/db`.
  They start 4 spaces in, same column as `image:`.
- **Pod level** = stay on the last line you typed. Press `Esc`, `o`.
  Type the 4 lines `volumes:` to `secretName: db-sec`.
  They start 2 spaces in, same column as `containers:`.

Lines marked `# ADD` are new. Do not type the `# ADD` text.
The result looks like this:
```
spec:
  containers:
  - image: nginx:1.27
    name: api
    resources: {}
    envFrom:                       # ADD  (container level: same column as "image:")
    - configMapRef:                # ADD
        name: app-cfg              # ADD
    volumeMounts:                  # ADD  (container level)
    - name: db                     # ADD
      mountPath: /etc/db           # ADD
  volumes:                         # ADD  (pod level: same column as "containers:")
  - name: db                       # ADD
    secret:                        # ADD
      secretName: db-sec           # ADD
  dnsPolicy: ClusterFirst
  restartPolicy: Always
```

How it reads:
- `envFrom` → "make every key of ConfigMap `app-cfg` an environment variable"
- `volumes` → "this pod has storage called `db`. Its content is Secret `db-sec`"
- `volumeMounts` → "show storage `db` inside the container at `/etc/db`"

`db` is just a linking name you choose.
It must be the same in both blocks.

Save with `Esc`, `:wq`. Then:
```
k apply -f pod.yaml
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pod api -n app                         # 1/1 Running
k exec api -n app -- env | grep LOG_LEVEL    # LOG_LEVEL=debug
k exec api -n app -- ls /etc/db              # password
k exec api -n app -- cat /etc/db/password    # s3cret
```

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| STATUS `CreateContainerConfigError` | the ConfigMap or Secret name in the pod does not exist | `k describe pod api -n app` names it. `k delete pod api -n app`, fix `pod.yaml`, apply again. |
| `strict decoding error: unknown field "spec.containers[0].volumes"` | `volumes:` is indented under the container | move it to pod level (same column as `containers:`) |
| `unknown field "secretName"` under configMap | wrong word | Secret volume uses `secretName:`. ConfigMap volume uses `name:`. |
| `k apply` after a fix says `Forbidden: pod updates may not change fields other than ...` | pods are immutable: env and volumes cannot change after creation | `k delete pod api -n app`, fix the file, apply again |

**Variants:**
- **Only ONE key as a variable** = `env:` with `valueFrom:` → `configMapKeyRef:` (`name:` + `key:`).
  Same docs page, heading "Define container environment variables using ConfigMap data".
- Secret as environment variables: `envFrom:` → `- secretRef:` → `name: db-sec`.
- ConfigMap as files: `volumes:` → `configMap:` → `name: app-cfg`.

---

### Mug this up: the whole answer in 5 lines

```
k create cm app-cfg --from-literal=LOG_LEVEL=debug -n app
k create secret generic db-sec --from-literal=password=s3cret -n app
k run api --image=nginx:1.27 -n app --dry-run=client -o yaml > pod.yaml
vim pod.yaml          # container: envFrom + volumeMounts      pod: volumes
k apply -f pod.yaml   ;   k exec api -n app -- env | grep LOG_LEVEL
```

**To repeat the question:** paste Part A again.
**Target time:** 6 minutes.

---

## 36. ★ Taint, toleration, nodeSelector

### Three words first

- **Taint** = a mark on a NODE, written `key=value:effect`.
  Effect `NoSchedule`: the scheduler puts no new pod on that node.
  Exception: the pod tolerates the taint.
- **Toleration** = lines in a POD that say "I accept this taint".
  It only ALLOWS the pod on that node. It does not send the pod there.
- **nodeSelector** = pod lines: "only put me on a node with this label".
  This is what SENDS the pod to a node.

Want a pod on a tainted node for sure? You need both:
toleration (allowed) + nodeSelector (sent).

---

### PART A. Build the exam (Killercoda only)

```
k delete pod x --ignore-not-found
k taint node node01 env=prod:NoSchedule- 2>/dev/null
k label node node01 env- 2>/dev/null
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Taint node `node01` with `env=prod:NoSchedule`.
> 2. Label node `node01` with `env=prod`.
> 3. Create a pod named `x` with image `nginx:1.27` in namespace `default` that tolerates the taint and is scheduled on `node01`.

**What the question is really saying:**

Two commands on the node.
Then a pod YAML with two added blocks at pod level.

**Write down from the question:** node = `node01` · taint = `env=prod:NoSchedule` · label = `env=prod` · pod = `x`, `nginx:1.27`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Taint and label the node

```
k taint node node01 env=prod:NoSchedule
k label node node01 env=prod
```
Check:
```
k describe node node01 | grep -i taints
k get node node01 --show-labels | grep -o "env=prod"
```

---

### Step 2. Generate the pod YAML

```
k run x --image=nginx:1.27 --dry-run=client -o yaml > x.yaml
vim x.yaml
```

---

### Step 3. Where to copy the toleration from

1. Open **https://kubernetes.io/docs** → search **`taints tolerations`** → click **"Taints and Tolerations"**
   (direct link: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ )
2. Near the top, copy this block.
   In `x.yaml` it goes at POD level, under `spec:`.
   It starts in the same column as `containers:` (step 4 shows where):
```
tolerations:
- key: "key1"
  operator: "Equal"
  value: "value1"
  effect: "NoSchedule"
```

---

### Step 4. Add two blocks at pod level

In `x.yaml`, type `:set paste` and Enter.
Put the cursor on the line `spec:` (directly above `containers:`).
Press `o`, and type the 7 lines.
Each starts 2 spaces in, the same column as `containers:`.
Indent the toleration's lines as shown.

Lines marked `# ADD` are new.
Do not type the `# ADD` text or the comments after it.
The result looks like this:
```
spec:
  nodeSelector:                    # ADD  (pod level: same column as "containers:")
    env: prod                      # ADD
  tolerations:                     # ADD
  - key: "env"                     # ADD   docs said "key1"
    operator: "Equal"              # ADD
    value: "prod"                  # ADD   docs said "value1"
    effect: "NoSchedule"           # ADD
  containers:
  - image: nginx:1.27
    name: x
```

How the taint maps to the toleration:

| Taint `env=prod:NoSchedule` | Toleration line |
|---|---|
| `env` | `key: "env"` |
| `prod` | `value: "prod"` |
| `NoSchedule` | `effect: "NoSchedule"` |

Save with `Esc`, `:wq`. Then:
```
k apply -f x.yaml
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pod x -o wide
```
You want `Running` and NODE `node01`.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| pod `Pending`, Events: `had untolerated taint {env: prod}` | key, value or effect in the toleration differ from the taint | `k delete pod x`, fix `x.yaml`, apply again |
| pod `Pending`, Events: `didn't match Pod's node affinity/selector` | the node label is missing or different | `k label node node01 env=prod` |
| pod is Running but on another node | `nodeSelector` is missing | add it (toleration alone does not send the pod) |

**Related commands:**
```
k taint node node01 env=prod:NoSchedule-     # remove a taint: same text + "-" at the end
k label node node01 env-                     # remove a label: key + "-"
k describe node <node> | grep -i taints      # see taints
```
- `NoSchedule` = no NEW pods.
- `NoExecute` = also removes pods already running there.
- A toleration for "any value": `operator: "Exists"` and no `value:` line.

---

### Mug this up: the whole answer in 5 lines

```
k taint node node01 env=prod:NoSchedule
k label node node01 env=prod
k run x --image=nginx:1.27 --dry-run=client -o yaml > x.yaml
vim x.yaml            # pod level: nodeSelector + tolerations (copied from docs)
k apply -f x.yaml   ;   k get pod x -o wide
```

**To repeat the question (and clean the node):** paste Part A again.
**Target time:** 5 minutes.

---

## 37. Rolling update and rollback

### Three words first

- **Rolling update** = you change a Deployment's image. It replaces the pods a few at a time.
  So the app stays available.
- **Revision** = each change of the pod template creates a new numbered revision.
  The Deployment keeps the old ones.
- **Rollback** = go back to an earlier revision: `k rollout undo`.

---

### PART A. Build the exam (Killercoda only)

```
k delete ns shop --ignore-not-found
k create ns shop
k create deploy web --image=nginx:1.27 --replicas=3 -n shop
clear
```

---

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `shop`:
> 1. Update deployment `web` to image `nginx:1.28` and wait until the rollout is complete.
> 2. Then roll the deployment back to the previous revision.
> 3. Write the image that is in use after the rollback to `/root/image.txt`.

**What the question is really saying:**

Three commands: change the image, watch it finish, undo.
Then one output into a file.

**Write down from the question:** namespace = `shop` · deployment = `web` · new image = `nginx:1.28` · file = `/root/image.txt`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Find the container name

```
k get deploy web -n shop -o wide
```
Read the CONTAINERS column: `nginx`.
And IMAGES: `nginx:1.27`.

---

### Step 2. Update and wait

```
k set image deploy/web nginx=nginx:1.28 -n shop
k rollout status deploy/web -n shop
```
You want `deployment "web" successfully rolled out`.

---

### Step 3. Look at the history, then roll back

```
k rollout history deploy/web -n shop
```
You see revision 1 and revision 2.
```
k rollout undo deploy/web -n shop
k rollout status deploy/web -n shop
```
To go to one specific revision instead: `k rollout undo deploy/web -n shop --to-revision=1`

---

### Step 4. Write the image into the file

```
k get deploy web -n shop -o jsonpath='{.spec.template.spec.containers[0].image}' > /root/image.txt
```
Forgot the jsonpath? This is just as good:
Read the image with `k get deploy web -n shop -o wide`.
Then type `echo nginx:1.27 > /root/image.txt`.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
cat /root/image.txt                          # nginx:1.27
k get deploy web -n shop                     # 3/3
```

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `rollout status` never finishes | the new image does not exist (typo in the image name or tag) | press `Ctrl+C`, then `k rollout undo deploy/web -n shop` |
| `unable to find container named ...` | wrong name left of `=` | use the CONTAINERS column from step 1 |

**Related commands:**
```
k scale deploy web --replicas=5 -n shop
k rollout restart deploy/web -n shop         # restart all pods, same image
k rollout pause deploy/web -n shop           # / resume
```

---

### Two short questions that come from the same area

**Static pod** — "Create a static pod named `static-web` with image `nginx:1.27` on node `node01`."
The kubelet starts a static pod from a file.
The file is in `/etc/kubernetes/manifests/` on that node.
```
ssh node01
kubectl run static-web --image=nginx:1.27 --dry-run=client -o yaml > /etc/kubernetes/manifests/static-web.yaml
exit
k get pods -A | grep static-web              # static-web-node01   Running
```
(On a worker, `--dry-run=client` works, even without a cluster connection.
`kubectl` missing there? Write the file on the control plane.
Then copy it: `scp static-web.yaml node01:/etc/kubernetes/manifests/`.)
To remove it, delete the file.
`k delete pod` does not work: the kubelet starts it again.

**DaemonSet** — "Run one pod of image `nginx:1.27` on every node, named `agent`."
There is no `k create daemonset`.
Generate a Deployment and change 3 things:
```
k create deploy agent --image=nginx:1.27 --dry-run=client -o yaml > ds.yaml
vim ds.yaml
```
| Change | |
|---|---|
| `kind: Deployment` | → `kind: DaemonSet` |
| the line `replicas: 1` | delete |
| the line `strategy: {}` | delete |
```
k apply -f ds.yaml
k get ds agent                               # DESIRED = number of nodes
```
Must it also run on the control plane? Add a toleration.
Put it under `spec.template.spec`, same column as `containers:`.
Its lines: `key: "node-role.kubernetes.io/control-plane"`, `operator: "Exists"`, `effect: "NoSchedule"`.

---

### Mug this up: the whole answer in 5 lines

```
k get deploy web -n shop -o wide                             # container name
k set image deploy/web nginx=nginx:1.28 -n shop
k rollout status deploy/web -n shop
k rollout undo deploy/web -n shop
k get deploy web -n shop -o jsonpath='{.spec.template.spec.containers[0].image}' > /root/image.txt
```

**To repeat the question:** paste Part A again.
**Target time:** 3 minutes.

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

### Three words first

- **PV** = a disk. It belongs to the whole cluster. So it has NO namespace.
- **PVC** = a request for a disk. It lives in a namespace.
  Kubernetes connects it to a PV that matches.
- **Pod** = uses the PVC by its name.
  The PVC and the pod must be in the SAME namespace.

The chain is always: **Pod → PVC → PV**

Here nothing exists yet.
Build all three, from right to left.
First the PV, then the PVC, then the pod.

---

### PART A. Build the exam (Killercoda only)

In the real exam this is already done.
Paste it once, then forget it.

```
k delete ns storage --ignore-not-found
k delete pv pv-data --ignore-not-found
k create ns storage
clear
```
(The first line can take 20 seconds.
That is normal.)

What now exists: an empty namespace `storage`.
What does NOT exist: the PV, the PVC, the pod.
All three are your job.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a PersistentVolume named `pv-data`: capacity `1Gi`, access mode `ReadWriteOnce`, hostPath `/mnt/data`, storage class `manual`.
> 2. In namespace `storage`, create a PersistentVolumeClaim named `pvc-data` that requests `500Mi`, access mode `ReadWriteOnce`, storage class `manual`.
> 3. In namespace `storage`, create a pod named `web-store` with image `nginx:1.27` that mounts the claim at `/usr/share/nginx/html`.

**What the question is really saying:**

Right now the chain shows nothing built yet, for example:
```
Pod ✗   →   PVC ✗   →   PV ✗
```
Make a disk.
Make a request that matches the disk.
Make a pod that uses the request.

Kubernetes connects a PVC to a PV by comparing three values.
They are all in the question:

| Value | PV (the disk) | PVC (the request) | Rule |
|---|---|---|---|
| storageClassName | `manual` | `manual` | must be the same |
| accessModes | `ReadWriteOnce` | `ReadWriteOnce` | must be the same |
| size | `1Gi` | `500Mi` | the disk must be big enough. 1Gi is more than 500Mi: it fits. |

**Write down from the question (always do this):**
PV = `pv-data`, 1Gi, `/mnt/data` · PVC = `pvc-data`, 500Mi · pod = `web-store`, `nginx:1.27`, `/usr/share/nginx/html` · namespace = `storage` · class = `manual` · mode = `ReadWriteOnce`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Open ONE docs page. It has all three pieces.

There is no `k create pv` and no `k create pvc` command.
So you copy.

1. Open **https://kubernetes.io/docs**
2. In the search box type: **`persistent volume pod`**
3. Click the result named: **"Configure a Pod to Use a PersistentVolume for Storage"**
   (direct link: https://kubernetes.io/docs/tutorials/configuration/configure-persistent-volume-storage/ )

Keep this page open.
You will copy three boxes from it, one per step:

| Step | Heading on the page | Box to copy |
|---|---|---|
| 2 | "Create a PersistentVolume" | `pods/storage/pv-volume.yaml` |
| 3 | "Create a PersistentVolumeClaim" | `pods/storage/pv-claim.yaml` |
| 4 | "Create a Pod" | `pods/storage/pv-pod.yaml` |

---

### Step 2. The PV (the disk)

Copy the box **`pods/storage/pv-volume.yaml`**.
This is what you copied:
```
apiVersion: v1
kind: PersistentVolume
metadata:
  name: task-pv-volume
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
```

```
vim pv.yaml
```
Press `i`, paste.
Lines drift more and more to the right? Then:
Press `Esc`. Type `:set paste` and Enter.
Type `ggdG` to clear. Press `i`, paste again.
The same tip works for every paste below.
**Change 2 lines, delete 2 lines:**

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: task-pv-volume` | `name: pv-data` | the name the question asks for |
| 2 | `storage: 10Gi` | `storage: 1Gi` | the size the question asks for |
| 3 | `labels:` and `type: local` | delete both lines (`dd` twice) | the question did not ask for labels |

`storageClassName: manual`, `ReadWriteOnce` and `/mnt/data` already match the question. Lucky.
In the exam, check each one against YOUR question.

No `namespace:` line.
A PV has no namespace.

The finished file:
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
Save with `Esc`, `:wq`. Then:

```
k apply -f pv.yaml
k get pv
```
You want:
```
NAME      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pv-data   1Gi        RWO            Retain           Available           manual         <unset>                          5s
```
STATUS `Available` = the disk exists and nobody uses it yet.

The chain now looks like this:
```
Pod ✗   →   PVC ✗   →   PV ✓
```

---

### Step 3. The PVC (the request)

Copy the box **`pods/storage/pv-claim.yaml`**.
This is what you copied:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: task-pv-claim
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
```

```
vim pvc.yaml
```
Press `i`, paste. **Change 2 lines, add 1 line:**

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: task-pv-claim` | `name: pvc-data` | the name the question asks for |
| 2 | (no namespace line) | add `namespace: storage` under `name:` | a PVC lives in a namespace |
| 3 | `storage: 3Gi` | `storage: 500Mi` | the size the question asks for |

The finished file:
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
Save. Then:

```
k apply -f pvc.yaml
k get pvc -n storage
```
You want:
```
NAME       STATUS   VOLUME    CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
pvc-data   Bound    pv-data   1Gi        RWO            manual         <unset>                 5s
```
Check two columns: STATUS = **`Bound`**, VOLUME = **`pv-data`**.

CAPACITY shows `1Gi`, although you asked for 500Mi.
That is correct.
The PVC gets the WHOLE disk it was connected to.
Do not try to fix it.

**Do not go to step 4 until you see `Bound`.**
If the PVC is not bound, the pod will never start.

The chain now looks like this:
```
Pod ✗   →   PVC ✓   →   PV ✓
```

---

### Step 4. The pod

Copy the box **`pods/storage/pv-pod.yaml`**.
This is what you copied:
```
apiVersion: v1
kind: Pod
metadata:
  name: task-pv-pod
spec:
  volumes:
    - name: task-pv-storage
      persistentVolumeClaim:
        claimName: task-pv-claim
  containers:
    - name: task-pv-container
      image: nginx
      ports:
        - containerPort: 80
          name: "http-server"
      volumeMounts:
        - mountPath: "/usr/share/nginx/html"
          name: task-pv-storage
```

```
vim pod.yaml
```
Press `i`, paste. **Change 3 lines, add 1 line:**

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: task-pv-pod` | `name: web-store` | the name the question asks for |
| 2 | (no namespace line) | add `namespace: storage` under `name:` | must be the same namespace as the PVC |
| 3 | `claimName: task-pv-claim` | `claimName: pvc-data` | the NAME of the PVC from step 3 |
| 4 | `image: nginx` | `image: nginx:1.27` | the image the question asks for |

`mountPath: "/usr/share/nginx/html"` already matches.
In the exam, check it against YOUR question.

Leave everything else alone.
`task-pv-storage` appears twice: under `volumes` and under `volumeMounts`.
It is just a label that links the two blocks.
It must be the same in both places. Do not touch it.

How the pod file reads, in plain words:
- `volumes:` = "this pod has a disk. It comes from the PVC `pvc-data`"
- `volumeMounts:` = "show that disk in the container at `/usr/share/nginx/html`"

Save. Then:
```
k apply -f pod.yaml
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pod -n storage
```
You want `web-store   1/1   Running`.
`ContainerCreating` for a few seconds is normal. Run it again.

```
k get pv
```
You want `pv-data`, STATUS `Bound`, CLAIM `storage/pvc-data`.

```
exit          # exam only: leave the machine before the next question
```

The chain is complete:
```
Pod ✓   →   PVC ✓   →   PV ✓
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| PVC `Pending` | class or access mode differ between `pv.yaml` and `pvc.yaml`. Or the PVC asks for MORE than the PV has. | `k describe pvc pvc-data -n storage`, read Events. `k delete pvc pvc-data -n storage`, fix the file, apply again. |
| PVC `Pending` and `k get pv` shows `pv-data` still `Available`; once the pod exists the PVC is `Bound` to a long name like `pvc-3f2a...` | `pvc.yaml` has no `storageClassName` line. So the default class is used. It ignores `pv-data` and makes a NEW empty disk. (Killercoda's default `local-path` waits for a pod first.) | delete the pod and the PVC, put `storageClassName: manual` back, apply both again |
| Pod `Pending`, Events say `persistentvolumeclaim "..." not found` | `claimName` has a typo, or the pod is in a different namespace than the PVC | `k delete pod web-store -n storage`, fix `pod.yaml`, apply again |
| Pod `Pending`, Events say `unbound immediate PersistentVolumeClaims` | you skipped the `Bound` check in step 3 | fix the PVC first |
| `manual` vs `Manual` | class names are case-sensitive | make them identical |

You cannot edit these fields of a PVC or pod after creation.
Delete, fix the file, apply again.
It takes 20 seconds.

---

### Mug this up: the whole answer in 9 lines

```
vim pv.yaml                    # docs box 1: name, size. Delete labels. NO namespace.
k apply -f pv.yaml
k get pv                       # Available
vim pvc.yaml                   # docs box 2: name, + namespace, size
k apply -f pvc.yaml
k get pvc -n storage           # Bound + VOLUME = pv-data     <- do not continue without this
vim pod.yaml                   # docs box 3: name, + namespace, claimName, image
k apply -f pod.yaml
k get pod -n storage           # 1/1 Running
```

**To repeat the question:** paste Part A again. It wipes everything.

**Target time:** 8 minutes.

---

## 39. ★ StorageClass (create one and make it the default)

### Three words first

- **StorageClass** = a template.
  A PVC asks for a disk, and no PV exists?
  Then Kubernetes uses the template to CREATE a new PV automatically.
- **Provisioner** = the program that actually makes the disk.
  It is just a name inside the StorageClass. Copy it from the question.
- **Default StorageClass** = the template used when a PVC names no class.
  It shows as `(default)` in `k get sc`.

A PVC forgets the `storageClassName` line?
Then the default class silently creates a new empty disk.

One more setting you will be asked for:

| volumeBindingMode | Meaning |
|---|---|
| `Immediate` | create the disk the moment the PVC appears |
| `WaitForFirstConsumer` | wait until a pod actually uses the PVC, then create the disk |

---

### PART A. Build the exam (Killercoda only)

In the real exam this is already done.
Paste it once, then forget it.

```
k delete sc fast standard --ignore-not-found
k patch sc local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}' 2>/dev/null
cat <<EOF | k apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
  annotations:
    storageclass.kubernetes.io/is-default-class: "true"
provisioner: rancher.io/local-path
volumeBindingMode: Immediate
EOF
clear
```

What now exists: one default StorageClass called `standard`.
What does NOT exist: a class called `fast`.
That is your job.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> 1. Create a StorageClass named `fast` with provisioner `rancher.io/local-path` and volume binding mode `WaitForFirstConsumer`.
> 2. Make `fast` the default StorageClass.
> 3. No other StorageClass may be marked as default. Do not delete or modify anything else.

**What the question is really saying:**

Three small jobs:

```
1. make a new template called fast
2. put the "default" mark on fast
3. take the "default" mark OFF the old one
```

The "default" mark is an **annotation** (a note on the object).
It has this exact text:
`storageclass.kubernetes.io/is-default-class: "true"`
You never type it. You copy it from the docs.

**Write down from the question (always do this):**
name = `fast` · provisioner = `rancher.io/local-path` · mode = `WaitForFirstConsumer` · must be the ONLY default

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Look at what exists

```
k get sc
```

You see something like:
```
NAME                 PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
local-path           rancher.io/local-path   Delete          WaitForFirstConsumer   false               2h
standard (default)   rancher.io/local-path   Delete          Immediate              false               10s
```

Read one thing: **which name has `(default)` next to it.**
Here: `standard`.
Write it down. You need it in step 5.
No `local-path` in your list? That is fine.
Only `standard` (and later `fast`) matter here.

(`sc` is short for `storageclass`.
A StorageClass has no namespace, so there is no `-n`.)

---

### Step 2. Get the StorageClass text from the docs

There is no `k create storageclass` command. So you copy.

1. Open **https://kubernetes.io/docs**
2. In the search box type: **`storage classes`**
3. Click the result named: **"Storage Classes"**
   (direct link: https://kubernetes.io/docs/concepts/storage/storage-classes/ )
4. Near the top, find the heading **"StorageClass objects"**.
   Under it, find "Here's an example of a StorageClass:"
5. Copy the box right below it.

This is what you copied:
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: low-latency
  annotations:
    storageclass.kubernetes.io/is-default-class: "false"
provisioner: csi-driver.example-vendor.example
reclaimPolicy: Retain # default value is Delete
allowVolumeExpansion: true
mountOptions:
  - discard # this might enable UNMAP / TRIM at the block storage layer
volumeBindingMode: WaitForFirstConsumer
parameters:
  guaranteedReadWriteLatency: "true" # provider-specific
```

Good news: the long annotation is already in there.
So is `volumeBindingMode`.

---

### Step 3. Paste it into a file, change 3 lines, delete 6 lines

```
vim sc.yaml
```
Press `i`, paste.

**Change 3 lines:**

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: low-latency` | `name: fast` | the name the question asks for |
| 2 | `is-default-class: "false"` | `is-default-class: "true"` | this IS the "make it default" job |
| 3 | `provisioner: csi-driver.example-vendor.example` | `provisioner: rancher.io/local-path` | the provisioner the question gives |

**Delete 6 lines.** The question did not ask for them.
`dd` deletes a line in vim:

```
reclaimPolicy: Retain ...
allowVolumeExpansion: true
mountOptions:
  - discard ...
parameters:
  guaranteedReadWriteLatency: ...
```

`volumeBindingMode: WaitForFirstConsumer` stays.
It already matches the question.
(If your question says `Immediate`, change that word.)

The finished file, 8 lines:
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
Press `Esc`, type `:wq`, press Enter.

**Rule for deleting:** keep only what the question names.
Extra settings from an example can make the grader mark it wrong.
`parameters` for another provisioner can break disk creation.

---

### Step 4. Create it

```
k apply -f sc.yaml
k get sc
```

You see:
```
NAME                 PROVISIONER             ...
fast (default)       rancher.io/local-path   ...
local-path           rancher.io/local-path   ...
standard (default)   rancher.io/local-path   ...
```

Jobs 1 and 2 are done.
But look: **two** names have `(default)`.
The question says only one may.
That is job 3.

---

### Step 5. Take the default mark off the old class

Do not type this command.
Copy it from the docs.

1. Same search box, type: **`change default storage class`**
2. Click the result named: **"Change the default StorageClass"**
   (direct link: https://kubernetes.io/docs/tasks/administer-cluster/change-default-storage-class/ )
3. Find step 2 on that page: **"Mark the default StorageClass as non-default"**.
4. Copy the command under it.

This is what you copied:
```
kubectl patch storageclass standard -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
```

Change ONE word: `standard` → the name you wrote down in step 1.
(In this practice it already is `standard`.)
Then run it.

What it does: `patch` changes one small part of an object.
Here it sets the annotation to `"false"` on the old class.
Nothing else on that class changes.
So you respect "do not modify anything else".

**If you prefer no long command:**
Type `k edit sc standard`.
Find the line `storageclass.kubernetes.io/is-default-class: "true"`.
Change `"true"` to `"false"`.
Save with `:wq`. Same result.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get sc
```
You want `(default)` next to **`fast` only**:
```
NAME             PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ...
fast (default)   rancher.io/local-path   Delete          WaitForFirstConsumer   ...
local-path       rancher.io/local-path   Delete          WaitForFirstConsumer   ...
standard         rancher.io/local-path   Delete          Immediate              ...
```
Check three columns on the `fast` row:
The name has `(default)`.
PROVISIONER is what the question gave.
VOLUMEBINDINGMODE is `WaitForFirstConsumer`.

```
exit          # exam only: leave the machine before the next question
```

---

### Traps

| Trap | What happens | What to do |
|---|---|---|
| You skip step 5 | two defaults; the question says only one | always run `k get sc` at the end and count the `(default)` marks |
| You made a typo in `sc.yaml` and already applied it | provisioner and volumeBindingMode cannot be changed afterwards | `k delete sc fast`, fix the file, `k apply -f sc.yaml` again |
| You delete the old default class to get rid of its mark | the question said do not delete anything | only change its annotation |
| You write `is-default-class: true` without quotes | `k apply` is rejected (`cannot unmarshal bool ... of type string`). Annotation values must be strings. | write `"true"` with the quotes |
| Later a test PVC stays `Pending` | with `WaitForFirstConsumer` that is NORMAL. It waits for a pod. | do not "fix" it |

---

### Mug this up: the whole answer in 5 lines

```
k get sc                                   # who is (default) now? write the name down
vim sc.yaml                                # docs copy: change 3 lines, delete 6 lines
k apply -f sc.yaml
k patch storageclass <old-default> -p '...is-default-class":"false"...'     # copied from the docs
k get sc                                   # (default) next to fast ONLY
```

**To repeat the question:** paste Part A again.
**To put the playground back as it was afterwards:**
```
k delete sc fast standard --ignore-not-found
k patch sc local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

**Target time:** 5 minutes.

---

## 40. ★ Reuse an existing PV (the MariaDB question)

### Two words first

- **PV** = a disk. It exists in the cluster.
  Here it holds the database files.
- **PVC** = a request for a disk. A pod cannot use a PV directly.
  A pod uses a PVC. Kubernetes connects the PVC to a PV.

The chain is always: **Pod → PVC → PV**

---

### PART A. Build the exam (Killercoda only)

In the real exam this is already done.
You never type this part there.
Paste it once, then forget it.

```
k delete ns mariadb --ignore-not-found
k delete pv mariadb-pv --ignore-not-found
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
```

What now exists:
a namespace, the old disk (`mariadb-pv`), the app's file (`/root/mariadb-deploy.yaml`).
What does NOT exist: a PVC, and a running database.
Those are your job.

---

### PART B. The exam starts here

**The question, as the exam words it:**

> A MariaDB deployment in namespace `mariadb` was deleted by accident. Its PersistentVolume still exists and holds the data.
> 1. Create a PersistentVolumeClaim named `mariadb` in namespace `mariadb`, with access mode `ReadWriteOnce` and `250Mi` of storage. It must bind to the existing PersistentVolume.
> 2. Edit `/root/mariadb-deploy.yaml` so the deployment uses this PVC.
> 3. Apply the file and make sure the deployment is running.

**What the question is really saying:**

Look at the chain. Only the last part is left:

```
Pod ✗   →   PVC ✗   →   PV ✓
```

Rebuild the two missing parts.
Then the new database uses the OLD disk.
It gets its old data back.

**Write down from the question (always do this):**
PVC name = `mariadb` · namespace = `mariadb` · mode = `ReadWriteOnce` · size = `250Mi` · file = `/root/mariadb-deploy.yaml`

---

### Opening routine (same 2 commands at the start of EVERY question)

```
ssh <host-from-the-question>      # exam only. In Killercoda, skip this line.
k get nodes                       # proves: I am on the right machine, and kubectl answers
```

---

### Step 1. Look at the old disk

```
k get pv
```

You see:
```
NAME         CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
mariadb-pv   250Mi      RWO            Retain           Available                          <unset>                          1m
```

Read four columns:

| Column | Value | Meaning |
|---|---|---|
| CAPACITY | `250Mi` | size of the disk |
| ACCESS MODES | `RWO` | short for ReadWriteOnce |
| STATUS | `Available` | free; no PVC is using it |
| STORAGECLASS | (empty) | this disk has NO class. Remember this. |

**Why this step matters:**
You never write "use disk mariadb-pv" in a PVC.
You write what you need. Kubernetes picks a disk that matches.
It compares three things: **class, access mode, size**.
So your PVC must repeat the values you just read.

---

### Step 2. Get the PVC text from the docs

There is no `k create pvc` command.
So you copy from the docs. Do not type it from memory.

1. Open **https://kubernetes.io/docs**
2. In the search box type: **`persistent volume pod`**
3. Click the result named: **"Configure a Pod to Use a PersistentVolume for Storage"**
   (direct link: https://kubernetes.io/docs/tutorials/configuration/configure-persistent-volume-storage/ )
4. On the right side of the page, click the heading: **"Create a PersistentVolumeClaim"**
5. Find the box labelled **`pods/storage/pv-claim.yaml`**.
6. Click the **copy icon** at the top of that box.

This is what you copied:
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: task-pv-claim
spec:
  storageClassName: manual
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
```

---

### Step 3. Paste it into a file and change 4 things

```
vim pvc.yaml
```
Press `i`, paste, then make these 4 changes:

| # | The docs say | You change it to | Why |
|---|---|---|---|
| 1 | `name: task-pv-claim` | `name: mariadb` | the name the question asks for |
| 2 | (no namespace line) | add `namespace: mariadb` under `name:` | the question says namespace `mariadb` |
| 3 | `storageClassName: manual` | `storageClassName: ""` | the old disk's class is empty (step 1) |
| 4 | `storage: 3Gi` | `storage: 250Mi` | the size the question asks for |

`accessModes: ReadWriteOnce` stays as it is.
It already matches.

The finished file:
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
Press `Esc`, type `:wq`, press Enter.

**About change 3, the one people get wrong:**
Keep the `storageClassName` line.
Without it, Kubernetes fills in the cluster's default class.
That class creates a brand-new EMPTY disk for you.
Your PVC shows "Bound". Everything looks fine.
But the database has no data, and you lose the points.
`""` says "no class". That is exactly what the old disk has.

---

### Step 4. Create the PVC and check it connected to the OLD disk

```
k apply -f pvc.yaml
k get pvc -n mariadb
```

You want:
```
NAME      STATUS   VOLUME       CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
mariadb   Bound    mariadb-pv   250Mi      RWO                           <unset>                 5s
```

Check two columns:
STATUS = **`Bound`**.
VOLUME = **`mariadb-pv`** (the old disk's name).

The chain is now:
```
Pod ✗   →   PVC ✓   →   PV ✓
```

If something else shows up:

| You see | Cause | Fix |
|---|---|---|
| STATUS `Pending` | one of the three values does not match the disk | `k describe pvc mariadb -n mariadb`, read Events. Then `k delete pvc mariadb -n mariadb`, fix `pvc.yaml`, apply again. |
| VOLUME is a long name like `pvc-3f2a...` | the `storageClassName: ""` line is missing. A new empty disk was made. | same: delete the PVC, fix the file, apply again |

(A PVC cannot be edited after creation.
Delete and re-create is the normal way.)

---

### Step 5. Tell the app to use the PVC

```
vim /root/mariadb-deploy.yaml
```
Type `/claimName` and press Enter.
The cursor jumps to the line.

| Before | After |
|---|---|
| `claimName: ""` | `claimName: mariadb` |

`claimName` is simply the NAME of the PVC you made in step 4.
One word changes. Touch nothing else in this file.
Save with `Esc`, `:wq`.

---

### Step 6. Start the app

```
k apply -f /root/mariadb-deploy.yaml
```

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get pods -n mariadb
```
You want `1/1 Running`.
The first start can take a minute while the image downloads.
You see `ContainerCreating`? Run it again.

```
k get pv
```
You want `mariadb-pv` with STATUS `Bound` and CLAIM `mariadb/mariadb`.
This proves the old disk is the one in use.

```
exit          # exam only: leave the machine before the next question
```

The chain is complete:
```
Pod ✓   →   PVC ✓   →   PV ✓
```

---

### One more trap the exam can set

In step 1, the PV's STATUS is `Released` instead of `Available`.
It means the disk still remembers its deleted PVC (the `claimRef`).
It will refuse a new one.
Fix it with one command.
```
k patch pv mariadb-pv -p '{"spec":{"claimRef":null}}'
k get pv mariadb-pv
```
STATUS is now `Available`. Carry on with step 2.
(Same result by hand: type `k edit pv mariadb-pv`.
Delete the line `claimRef:` and the indented lines under it. Save.)

Also: in step 1, did STORAGECLASS show a name (e.g. `local-path`)?
Then change 3 uses that exact name instead of `""`.

---

### Mug this up: the whole answer in 7 lines

```
k get pv                                   # read: size, mode, class
vim pvc.yaml                               # docs copy + 4 changes
k apply -f pvc.yaml
k get pvc -n mariadb                       # Bound + VOLUME = old PV name
vim /root/mariadb-deploy.yaml              # claimName: mariadb
k apply -f /root/mariadb-deploy.yaml
k get pods -n mariadb                      # 1/1 Running
```

**To repeat the question:** paste Part A again. It wipes everything and rebuilds the exam.

**Target time:** 7 minutes.

---

# READ ONCE, DO NOT DRILL

- **StatefulSet:** like a Deployment, but pods get fixed names (`db-0`, `db-1`). Each gets its own disk.
- **HA control plane:** several control plane nodes behind a load balancer.
- **Pod Security:** `k label ns secure pod-security.kubernetes.io/enforce=restricted`
- **kubectl debug:** `k debug node/node01 -it --image=busybox:1.36` gives a shell on a node.
- **Quota:** `k create quota q --hard=pods=10,requests.cpu=2 -n NS`
- **Certificates:** `kubeadm certs check-expiration`, `kubeadm certs renew all`
- **Join a node:** on the control plane `kubeadm token create --print-join-command`; paste the output on the new node.
