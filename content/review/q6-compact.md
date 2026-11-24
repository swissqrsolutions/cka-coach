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
- **Look first:** `k get ep backend-svc -n web`
- **Expect:** `<none>`
- **Fix:** selector = the pods' label.
- **Prove:** `wget` from `client` → `Welcome to nginx!`

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
SELECTOR  app=backend-svc
```

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
| `Warning: v1 Endpoints is deprecated` | normal since v1.33 | ignore it |
| still `<none>` after the fix | typo, or pods not Ready (`0/1`) | compare with `--show-labels`; fix the pods |
| still `<none>` after `k edit svc` | you changed `metadata.labels`, not `spec.selector` | use `k set selector` |
| endpoints show an IP, wget fails | wrong port | question 7 |
| `No resources found` | forgot `-n web` | add `-n web` |
