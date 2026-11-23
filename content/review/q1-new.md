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
