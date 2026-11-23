# Review r3: Mock 1 tasks 1–16, Mock 2 tasks 1–8

Read as (A) an absolute beginner on Killercoda and (B) a strict CKA v1.35 expert.
Problems that repeat on every page (step 0, `k` alias, sudo) are listed once under Top 10 and not repeated per page.

## Page 101 — Node NotReady: kubelet stopped — score 4/5
- Setup `sleep 45`: in recent versions the controller-manager waits about 50s (`node-monitor-grace-period`) before it marks a node NotReady, so step 1 may still show `Ready`. Fix: `sleep 60`, plus the note "if it still says Ready, wait and re-run".
- "kubelet" is used everywhere but defined only as "program". Fix: add one line: "kubelet = the agent on every node that starts pods and reports to the control plane."
- Step 6 "Check it works" repeats step 5 word for word. Fix: delete step 6, or merge it into VERIFY.
- Exam realism: on the real exam you are not root on node01, so `systemctl enable --now kubelet` fails with "Access denied". Fix: put `sudo -i` after `ssh node01`, with the note "(Killercoda is already root)".

## Page 102 — Service has no endpoints — score 4/5
- "EndpointSlices", "selector" and "label" are never explained, yet the whole task rests on them. Fix: add one line: "Service finds pods by label; selector = the label it looks for; EndpointSlice = the list of pod IPs it found."
- "YOU SEE: ENDPOINTS <unset>" is a beginner's first sight of an EndpointSlice and gives no context. Fix: show the full row: `cart-xxxxx  IPv4  80  <unset>`.
- The trap "Leaving the wrong selector key and adding a second one (selector is AND)" is unclear to a beginner. Fix: "If the key itself is wrong, a merge patch ADDS a key; then edit the Service instead."

## Page 103 — Pods stuck Pending (requests too big) — score 4/5
- "request", "Insufficient memory" and "scheduler" are not explained. Fix: "request = memory the pod reserves; the scheduler only places it on a node with that much free."
- Step 2 `grep -A3 Events` on Killercoda shows mixed reasons ("1 Insufficient memory, 1 node(s) had untolerated taint…"). Fix: add "ignore the taint part; Insufficient memory is the cause."
- The trap "Leaving a limit lower than 128Mi → invalid spec" does not apply to this setup, which has no limit. Fix: change it to "if a limit exists, it must be ≥ 128Mi".
- Step 5 duplicates step 4. Fix: merge them.

## Page 104 — CrashLoop / restarts: wrong liveness probe — score 4/5
- "liveness probe" is explained only by a metaphor. Fix: "livenessProbe = kubelet calls this URL; if it fails N times, the container is restarted."
- The beginner cannot write the JSON patch in step 3 from memory, and MEMORISE switches to `k edit` with no editing instructions. Fix: show the 3 lines to change in `k edit` (`livenessProbe: httpGet: port: 80`), plus "save with :wq".
- "YOU SEE: RESTARTS 0" is only true for the NEW pod name. Fix: "the new pod (new name) shows RESTARTS 0; the old one disappears."

## Page 105 — Extract error lines from pod logs — score 5/5
- The question says "on the controlplane node" but the exam ssh line is `cka01005`. Fix: say "the host you ssh'd into IS that task's controlplane".
- `grep -vc ERROR` prints 0 but exits with code 1; a beginner may read that as an error. Fix: add the note "exit code 1 here is normal".
- Exam: `/opt` needs root (`sudo mkdir -p`). Fix: add `sudo` in the exam note.

## Page 106 — Helm: template Argo CD without CRDs — score 3/5
- Helm, chart, repo, release, CRD and values are all used with zero explanation; this is the most jargon-heavy page so far. Fix: add a 4-line glossary: "chart = package of YAML; repo = where charts live; release = an installed chart; CRD = a new object type."
- The setup `kubectl apply -k …/manifests/crds?ref=v2.13.2` needs git, and the ApplicationSet CRD can hit "metadata.annotations: Too long" with client-side apply. Fix: `kubectl apply --server-side -k "…"`.
- Step 3 `grep -A3 "^crds"`: the values file has comment lines in between, so "install: true" may fall outside 3 lines. Fix: `grep -A6 '^crds:'`.
- Running Argo CD (about 7 pods) on 2 small Killercoda nodes can leave pods Pending/slow, which breaks "pods up → Running". Fix: add "may take 2–3 min; Pending for lack of resources is OK in the playground."
- Step 7 repeats steps 5–6. Fix: drop it.

## Page 107 — Install cri-dockerd + kernel sysctl — score 3/5
- Expert: "persist across reboots" is not met. `br_netfilter` loaded with `modprobe` disappears at reboot, so `bridge-nf-call-iptables` is gone at boot. Fix: also `echo br_netfilter > /etc/modules-load.d/k8s.conf`.
- `systemctl enable --now cri-docker.service` on Killercoda prints "Job for cri-docker.service failed" (no Docker), yet the page shows only "Loaded: … enabled". Fix: put the expected error in YOU SEE: "start fails without Docker — enable still worked, check is-enabled."
- The setup downloads an `ubuntu-jammy` .deb; Killercoda may run a newer Ubuntu, and the curl fallback only echoes, so step 1 fails with "cannot access archive". Fix: add a check line (`ls -l /root/cri-dockerd.deb`) and say what to do if it is missing.
- The heredoc in step 3 (`cat <<'EOF' > …`) is never explained, so a beginner does not know to paste all 6 lines at once. Fix: "paste the whole block including the final EOF line".
- `net.netfilter.nf_conntrack_max` needs the nf_conntrack module, which the page does not mention. Fix: add `modprobe nf_conntrack` beside br_netfilter.

## Page 108 — CRDs: list cert-manager CRDs + explain a field — score 4/5
- VERIFY "`wc -l /root/resources.yaml` → must see: cert-manager CRD lines": `wc -l` prints a number, not lines. Fix: "must see: 6" (or use `cat`).
- "Custom Resource Definition" is never explained. Fix: "CRD = adds a new object type (like Certificate) to Kubernetes."
- `grep cert-manager` drops the NAME header; an expert grader may expect the header kept. Fix: add the safer alternative `k get crd -l app.kubernetes.io/name=cert-manager > …` (keeps default format and header).

## Page 109 — RBAC: ServiceAccount, Role, RoleBinding — score 4/5
- The trap "`--serviceaccount=reporter` without `finance:` — binds nothing, no error" is wrong: kubectl rejects it with "serviceaccount must be <namespace>:<name>". Fix: change it to "forgetting `finance:` → error; forgetting `-n finance` on the rolebinding → binding lands in default".
- `--as=system:serviceaccount:finance:reporter` is unexplained. Fix: "--as = pretend to be that account; SA full name is system:serviceaccount:<ns>:<name>".
- The check does not test that `get` and `watch` are allowed, nor that other resources are denied. Fix: add `auth can-i list secrets … → no`.

## Page 110 — Expose container port + NodePort Service — score 4/5
- The beginner path (JSON patch, heredoc) differs from MEMORISE (`edit`, `expose`, `edit`), and neither explains vim. Fix: pick one path; if it is `edit`, show the exact YAML to insert with indentation.
- "NodePort", "targetPort" and "port" vs "containerPort" are not distinguished. Fix: "containerPort = inside pod; port = Service's port; nodePort = port on every node (30000–32767)."
- Step 3 `curl …:30080` uses `addresses[0]`, which is assumed to be InternalIP. That is fine, but the command is opaque. Fix: add "this prints node01's IP".

## Page 111 — Gateway API: migrate Ingress to Gateway + HTTPRoute — score 3/5
- VERIFY "`grep -A8 listeners` → must see … web-tls" fails. `-o yaml` adds the defaulted `allowedRoutes` (3 lines) and the last-applied annotation also matches "listeners", so web-tls falls outside 8 lines. Fix: `k -n web-app get gateway web-gateway -o jsonpath='{.spec.listeners}'`.
- MEMORISE `k apply -f gw.yaml -f route.yaml`: these files are never created anywhere on the page. Fix: "vim gw.yaml (paste step 3), vim route.yaml (paste step 4)".
- Gateway, GatewayClass, listener, TLS terminate and parentRefs are dense jargon with only "door" metaphors. Fix: add a 3-line mapping table: Ingress host→listener hostname, tls.secretName→certificateRefs, paths/backend→HTTPRoute.
- The trap "Missing tls block → listener not programmed" is wrong: the API server rejects an HTTPS listener without tls at apply time. Fix: "→ apply fails with a validation error".
- The page never notes that `parentRefs` has no namespace because the route is in the same namespace. Fix: add one line saying so.

## Page 112 — NetworkPolicy: choose the least permissive — score 4/5
- VERIFY says "must see: deny-all + the new one" but the policy is named `default-deny`. Fix: "default-deny + allow-frontend".
- Step 2 just hands over the answer ("1 opens everything…2 is exact") without teaching the key rule: namespaceSelector + podSelector in ONE list item = AND. Fix: add "same `- from` item = both must match; separate items = either".
- Step 1 assumes the Killercoda CNI enforces NetworkPolicy; if it does not, wget succeeds before the fix and the beginner is lost. Fix: add "if this already works, your CNI ignores policies — continue anyway".
- `backend.backend` short DNS name is unexplained. Fix: "<service>.<namespace>".

## Page 113 — PriorityClass one below the highest — score 5/5
- Step 4 jsonpath during rollout may print "0 4999" (the old pod is still terminating). Fix: "run again after rollout finishes; only 4999".
- PriorityClass is never defined. Fix: "PriorityClass = number; higher pods schedule first and can evict lower ones."

## Page 114 — HPA with scale-down behavior — score 4/5
- "just means no metrics-server; fine." is a sentence fragment, and metrics-server is unexplained. Fix: "`<unknown>` = no metrics-server installed in the playground; the HPA object is still correct."
- The trap "Wrong namespace (autoscale)" is confusing because the namespace and the command are both called autoscale. Fix: "Forgetting `-n autoscale`".
- Step 3 output omits that the defaults are added (`policies`, `selectPolicy`). Fix: show `{"policies":[…],"selectPolicy":"Max","stabilizationWindowSeconds":30}`.
- MEMORISE (`k autoscale` + edit) differs from the steps (full YAML), and the edit indentation is not shown. Fix: show `spec:\n  behavior:\n    scaleDown:\n      stabilizationWindowSeconds: 30`.

## Page 115 — Default StorageClass with WaitForFirstConsumer — score 3/5
- Setup: the upstream `local-path-storage.yaml` v0.0.30 does NOT mark `local-path` as default. If the setup installs it, step 1 shows no "(default)" and the main lesson ("un-default the old one") is never exercised. Fix: add `kubectl patch sc local-path -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'` to the setup.
- The step 3 `for` loop with `$(…)` is unreadable for a beginner and differs from MEMORISE. Fix: use the single command `k patch sc local-path -p …` and say "repeat for each other (default) class".
- The order creates a second default before removing the old one. Fix: un-default the old one first (it is also safer).
- Step 5 duplicates step 4. Fix: drop it.

## Page 116 — Reuse a retained PV for MariaDB — score 4/5
- The trap "PV stuck Released with an old claimRef" gives no fix. In the real exam the retained PV is often Released, and the PVC stays Pending. Fix: `k patch pv mariadb-pv -p '{"spec":{"claimRef":null}}'`.
- "PV", "PVC", "bind" and "access mode RWO" are unexplained. Fix: "PV = the disk; PVC = a request for a disk; Bound = request matched to disk."
- Steps use `sed` but MEMORISE uses `vim` with no explanation of either. Fix: keep `sed` and explain it ("replace text in file").
- Add `volumeName: mariadb-pv` as the guaranteed binding; the page only says "optionally". Fix: include it in the step 2 YAML.

## Page 201 — Kubelet fails: broken systemd drop-in — score 3/5
- The step 5 `sed … $(systemctl cat kubelet | grep -o '^# /.*10-kubeadm.conf' | cut -c3-)` is far beyond a beginner and is not explained. Fix: two steps: "1) `systemctl cat kubelet | grep '^#'` → note the 10-kubeadm.conf path; 2) `vim <that path>`".
- Step 4 "YOU SEE: /usr/bin/kubelet" is ambiguous: `grep ExecStart=` actually prints 3 lines (base unit `/usr/bin/kubelet`, empty `ExecStart=`, drop-in `/usr/local/bin/kubelet`). Fix: show all 3 and say "the LAST one wins — that is the broken one".
- "drop-in", "unit file" and "daemon-reload" are not explained. Fix: "drop-in = extra file in kubelet.service.d that overrides the main unit."
- Setup `sleep 45` has the same grace-period problem as page 101. Fix: `sleep 60`.
- Exam: needs `sudo -i` on node01. Fix: add it.

## Page 202 — Scheduler down: Pods stay Pending — score 2/5
- Step 3 is wrong as written: `crictl logs` of a container that failed at exec is EMPTY. "executable file not found" is a runtime error, not process output, so the beginner's key diagnosis step shows nothing. Fix: `kubectl -n kube-system describe pod kube-scheduler-controlplane | grep -iA3 message` (or `crictl inspect <id> | grep -i message`).
- "YOU SEE: CrashLoopBackOff": for an exec failure the status is usually `RunContainerError`/`CreateContainerError` → `CrashLoopBackOff` alternating. Fix: say "RunContainerError or CrashLoopBackOff".
- "static pod", "mirror pod", "manifest" and `crictl` are all unexplained. Fix: "static pod = kubelet runs the YAML in /etc/kubernetes/manifests directly; edit the file, not the pod."
- MEMORISE `crictl logs <id>` has the same empty-output problem. Fix: replace it with the describe/inspect line.
- Step 5 "Running … node01" may be controlplane if it is untainted. Fix: "Running on any node".

## Page 203 — DNS not resolving: CoreDNS down — score 4/5
- busybox 1.36 `nslookup kubernetes.default` also prints `** server can't find kubernetes.default.cluster.local: NXDOMAIN` lines (search-domain tries) and can exit non-zero, so a beginner thinks it failed. Fix: in YOU SEE, say "ignore NXDOMAIN lines; success = a Name/Address for kubernetes.default.svc.cluster.local".
- "CoreDNS" is never defined. Fix: "CoreDNS = the pods that answer name lookups inside the cluster."
- Only one cause (scaled to 0) is taught, while the exam may break the Corefile or the kube-dns Service instead. Fix: add a line in TRAPS: "if replicas are fine, check `k -n kube-system get cm coredns` and `get svc kube-dns` endpoints".

## Page 204 — Pending: nodeSelector matches no node — score 5/5
- `--overwrite` is not explained. Fix: "--overwrite = replace the value if the label already exists."
- Events show a mixed message (taint plus selector) on Killercoda. Fix: add "the selector part is the cause".

## Page 205 — Init container blocked by missing ConfigMap — score 4/5
- Title and pattern say "Init container waiting / blocked", but the init container never runs: the volume mount fails ("FailedMount … configmap not found"). Fix: change the pattern to "pod can't mount a missing ConfigMap volume → create it".
- `rollout status --timeout=120s`: kubelet retries the mount with backoff, so 120s can time out. Fix: `--timeout=180s` plus "if it times out, just re-run".
- "init container", "ConfigMap" and "volume" are unexplained; IN PLAIN WORDS says "config file", which misleads. Fix: "ConfigMap = key/value settings object; mounted as a volume, each key becomes a file."

## Page 206 — Install Calico CNI with the tigera operator — score 2/5
- It cannot be practised at all; a beginner gets no feedback on any step except 1. Fix: tell them to run only step 1 and `curl … custom-resources.yaml; grep -n cidr` on Killercoda, and mark the others "exam only".
- Contradiction: step 3 says "Change only if your podSubnet differs", but TRAPS says "Leaving default cidr 192.168.0.0/16" is a trap. Fix: change the trap to "Not CHECKING the cidr against podSubnet".
- `sed … <YOUR-podSubnet>`: a beginner will paste it literally. Fix: show a concrete example (`10.244.0.0/16`) and say "replace with your value".
- Missing wait between operator and custom-resources (the trap mentions it, but no step does). Fix: add `k wait --for=condition=Established crd/installations.operator.tigera.io --timeout=60s`.
- podSubnet can be missing from kubeadm-config. Fix: give the fallback `ps aux | grep -o 'cluster-cidr=[^ ]*'` (or check the controller-manager manifest).
- CNI, operator, Installation CR and tigerastatus are all unexplained. Fix: add a 3-line glossary.

## Page 207 — etcd snapshot backup — score 3/5
- MEMORISE and VERIFY drop `ETCDCTL_API=3`. With the apt `etcd-client` from Ubuntu jammy (v3.3), plain `etcdctl snapshot save` fails because the default API is v2. Fix: `export ETCDCTL_API=3` as the first MEMORISE line.
- The setup installs a distro etcdctl that may be much older than the cluster's etcd 3.5/3.6, and `snapshot status` prints a deprecation warning (use `etcdutl`). Fix: note "deprecation warning is OK".
- etcd, snapshot, and CA/cert/key are not explained. Fix: "etcd = the cluster's database; CA/cert/key = the ID card etcdctl shows to be allowed in."
- Exam: `/etc/kubernetes/pki` and `/opt/backup` need root. Fix: `sudo -i` first.

## Page 208 — Kustomize overlay — score 4/5
- "base", "overlay", `../../base` and `-k` are not explained. Fix: "base = original YAML; overlay = folder of changes on top; ../../base = two folders up, then base."
- Step 4 `kubectl create namespace shop-prod` errors on a re-run ("AlreadyExists"). Fix: use the `--dry-run=client -o yaml | k apply -f -` form already used in the setups, or say "AlreadyExists is fine".
- MEMORISE writes YAML on one line ("resources: [../../base]; namespace: …") that is not valid to paste. Fix: show it as the real 7-line file.

## Top 10 fixes across these pages
1. Page 202 step 3: `crictl logs` shows nothing for an exec failure. Use `describe pod … | grep -i message` / `crictl inspect`.
2. Page 115 setup: make `local-path` the default first, otherwise the task's core lesson never happens.
3. Page 111 VERIFY: replace `grep -A8 listeners` with jsonpath `{.spec.listeners}`; also create gw.yaml/route.yaml in MEMORISE.
4. Page 207: add `export ETCDCTL_API=3` to MEMORISE/VERIFY.
5. Page 107: persist `br_netfilter` (modules-load.d) and show the expected "cri-docker failed to start" on Killercoda.
6. All pages, step 0: "in Killercoda just k get nodes (exam: ssh line first)" is cryptic, and `k` is never defined. Add once: "`alias k=kubectl` (preset on exam/Killercoda)".
7. All node/system pages (101, 107, 201, 202, 207): add `sudo -i` for the exam; Killercoda is root, the exam is not.
8. Pages 101/201: `sleep 45` is shorter than the ~50s node grace period. Use 60.
9. Add a one-line definition of every core term at first use (selector, EndpointSlice, request, probe, CRD, Helm chart/release, PV/PVC, static pod, CoreDNS, drop-in).
10. Remove the duplicate "Check it works" steps and make MEMORISE use the same method as the steps (patch vs edit vs sed vs vim), with vim save/exit shown once.

## Overall verdict
Technically solid. Most commands, names and namespaces match the questions, and most setups create the described state.
The real failures are a few wrong outputs or diagnostics (202 crictl logs, 111 grep, 115 default SC, 207 ETCDCTL_API) and the missing exam `sudo`.
For an absolute beginner, unexplained core terms and the switching between patch, edit, sed and vim are the main barrier; average about 3.7/5.
