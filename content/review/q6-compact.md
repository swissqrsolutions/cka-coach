## 6. Service has no endpoints

### PART B. The exam starts here

**The question, as the exam words it:**

> In namespace `web`, pod `client` cannot reach service `backend-svc` on port 80. The deployment `backend` is Running. Find and fix the issue. Do not delete or recreate the service.

**What the question is really saying:**

The Service's selector does not match the pods' label.

**Write down from the question:** namespace = `web` · service = `backend-svc` · deployment = `backend` · test pod = `client` · do NOT recreate the service

---

### Think

- **Broken:** the Service finds no pods.
- **Look first:** `k get ep backend-svc -n web`
- **Expect:** `<none>`
- **Fix:** set the Service selector to the pods' label.
- **Prove:** `wget` from `client` prints `Welcome to nginx!`

### Time budget

Target 2 minutes. Skip and flag at 5 minutes.

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

```
k get ep backend-svc -n web
```
You see:
```
backend-svc   <none>      <-- no pods
```

---

### Step 2. What label does the Service want?

```
k get svc backend-svc -n web -o wide
```
You see:
```
... SELECTOR
... app=backend-svc      <-- wanted
```

---

### Step 3. What label do the pods have?

```
k get po -n web --show-labels
```
You see:
```
backend-6b7c...   app=backend,pod-template-hash=...   <-- real label
```

---

### Step 4. Fix the selector

```
k set selector svc backend-svc app=backend -n web
```
You see:
```
service/backend-svc selector updated
```

---

### Verify

```
k get ep backend-svc -n web
k exec client -n web -- wget -qO- -T 3 backend-svc
```
You see:
```
backend-svc   192.168.1.5:80      <-- an IP now
<title>Welcome to nginx!</title>
```

---

### Three words first

- **Label** = a `key=value` tag on an object, for example `app=backend`.
- **Selector** = the label a Service looks for. It sends traffic to every pod that has it.
- **Endpoints** = the pod IPs the Service found. `<none>` means traffic goes nowhere.
- **`-qO-`** = wget: quiet, print to the screen. Capital O, not zero.

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
| `Warning: v1 Endpoints is deprecated` | normal since v1.33 | ignore it; or `k get endpointslices -n web -l kubernetes.io/service-name=backend-svc` |
| still `<none>` | typo in the label | compare again with `--show-labels` |
| still `<none>`, labels match | pods not Ready (`0/1`) | fix the pods first |
| still `<none>` after `k edit svc` | you changed `metadata.labels`, not `spec.selector` | use `k set selector` |
| breaks again after a rollout | you copied `pod-template-hash` | use only `app=backend` |
| `No resources found` | forgot `-n web` | add `-n web` |
| IP shown, wget still fails | wrong port | question 7 |
| `wget: invalid option -- '0'` | zero instead of capital O | `-qO-` |
| `pod ... is not running` | client still starting | wait, then retry |

In the exam: run the question's `ssh` line first, and `exit` at the end.
