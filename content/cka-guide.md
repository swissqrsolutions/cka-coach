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
