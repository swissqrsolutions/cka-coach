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

## 6. Service has no endpoints

### Three words first

- **Label** = a `key=value` tag on an object, for example `app=backend`.
- **Selector** = the label a Service looks for. The Service sends traffic to every pod that has it.
- **Endpoints** = the list of pod IPs the Service found. An empty list means no pods were found. Traffic goes nowhere.

---

### PART A. Build the exam (Killercoda only)

Paste this once. It is safe to paste again: it deletes the old attempt first.
In the real exam this is already done.

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
The last line shows the broken state: `<none>`.

Why it is broken: `k create svc` sets the selector to the Service's own name, `app=backend-svc`.
The pods have the label `app=backend`.

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

### Think

- **What is broken:** the Service finds no pods.
- **Where to look first:** `k get ep backend-svc -n web`
- **What I expect to see:** `<none>` in the ENDPOINTS column.
- **Fix path:** read the Service's selector, then the pods' labels. Then `k set selector`.
- **How I prove it:** `k exec client -n web -- wget -qO- -T 3 backend-svc` prints `Welcome to nginx!`.

### Time budget

Target 2 minutes. Skip and flag at 5 minutes.

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
Warning: v1 Endpoints is deprecated in v1.33+; use discovery.k8s.io/v1 EndpointSlice
NAME          ENDPOINTS   AGE
backend-svc   <none>      1m      <-- this line matters: <none>
```
`<none>` = the Service found no pods.
The warning is harmless. Ignore it.

> Check: the newer command is `k get endpointslices -n web -l kubernetes.io/service-name=backend-svc`. When it finds no pods, its ENDPOINTS column should say `<unset>`. Use whichever you remember. `k get endpoints` is shorter.

---

### Step 2. What label is the Service looking for?

```
k get svc backend-svc -n web -o wide
```
You see:
```
NAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE   SELECTOR
backend-svc   ClusterIP   10.96.120.15   <none>        80/TCP    1m    app=backend-svc      <-- SELECTOR
```
`-o wide` adds the SELECTOR column. Here it is `app=backend-svc`.
`k describe svc backend-svc -n web` shows the same in the line `Selector:`.

---

### Step 3. What labels do the pods really have?

```
k get pods -n web --show-labels
```
You see:
```
NAME                       READY   STATUS    RESTARTS   AGE   LABELS
backend-6b7c9d7f8d-x2k4p   1/1     Running   0          1m    app=backend,pod-template-hash=6b7c9d7f8d   <-- app=backend
client                     1/1     Running   0          1m    run=client
```
The backend pod has `app=backend`.
The Service looks for `app=backend-svc`. They do not match. That is the cause.

Ignore `pod-template-hash`. It changes with every rollout. Never put it in a selector.

---

### Step 4. Fix the selector on the Service

```
k set selector svc backend-svc app=backend -n web
```
You see:
```
service/backend-svc selector updated
```
This changes the existing Service. It is not recreated.
`set selector` replaces the WHOLE selector. If the old one had two labels, give both.

---

### Closing routine (same at the end of EVERY question: verify, then exit)

```
k get endpoints backend-svc -n web
```
You see:
```
NAME          ENDPOINTS          AGE
backend-svc   192.168.1.5:80     2m      <-- an IP:port, not <none>
```

```
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see:
```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>      <-- this line proves it works
```
- `--` = everything after it runs INSIDE the pod.
- `-qO-` = quiet, print the page to the screen. It is a capital O, not a zero.
- `-T 3` = give up after 3 seconds.

```
exit          # exam only
```

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| endpoints still `<none>` | typo in the label you set | compare again with `--show-labels` |
| endpoints still `<none>`, labels match | the pods are not Ready (READY `0/1`) | fix the pods first |
| endpoints still `<none>` after `k edit svc` | you changed `metadata.labels`, not `spec.selector` | use `k set selector` |
| endpoints break again after a rollout | you copied `pod-template-hash` into the selector | use only `app=backend` |
| `No resources found` / `NotFound` | you forgot `-n web` | add `-n web` |
| endpoints show an IP, wget still fails | the port is wrong | question 7 |
| `wget: invalid option -- '0'` | you typed a zero, not a capital O | `-qO-` |
| `container not found` or `pod ... is not running` | the client pod is still starting | `k get pod client -n web` until Running |

---

### Mug this up: the whole answer in 5 lines

```
k get ep backend-svc -n web                  # <none>
k get svc backend-svc -n web -o wide         # SELECTOR: app=backend-svc
k get po -n web --show-labels                # real label: app=backend
k set selector svc backend-svc app=backend -n web
k exec client -n web -- wget -qO- -T 3 backend-svc
```

**To repeat the question:** paste Part A again.
**Target time:** 2 minutes.
