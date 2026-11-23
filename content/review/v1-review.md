# v1 review (round 2): 44 pages

Scale: can an absolute beginner on the free Killercoda CKA playground follow this page alone and solve the task?

| page | score | main remaining problem |
|---|---|---|
| 1 ImagePullBackOff | 5 | none |
| 2 CrashLoopBackOff | 4.5 | The `k patch` no-vim line is shown as "FILE CONTENT (YAML)", and its output is given as "edited" when patch prints "patched" |
| 3 Pending pod | 5 | none |
| 4 kubelet stopped | 4 | Setup has no wait, so step 1 ("Unknown / Kubelet stopped posting") still shows Ready for about 40 s |
| 5 kubelet misconfigured | 4.5 | VERIFY runs `systemctl status kubelet` after the page has already exited node01 (it needs `ssh node01`) |
| 6 Service no endpoints | 5 | none |
| 7 wrong targetPort | 5 | none |
| 8 apiserver down | 4.5 | The backup and vim commands in step 3 are rendered as a "FILE CONTENT (YAML)" block |
| 9 scheduler down | 4.5 | none serious. Describe Events on a static mirror pod can be empty, but the page covers that with crictl |
| 10 NetworkPolicy blocking | 4 | A table cell is cut off: "check with `k get pods -A \"" (the pipe broke the table) |
| 11 DNS | 5 | none |
| 12 logs/top to file | 3.5 | The page says "install it (Part A)" for metrics-server, but Part A installs nothing |
| 13 RBAC Role | 5 | none |
| 14 RBAC ClusterRole | 5 | none |
| 15 Helm template | 4.5 | none serious |
| 16 Helm install/upgrade/rollback | 4.5 | ingress-nginx is retired upstream, so the chart and images may disappear later. It works today |
| 17 Kustomize | 5 | none |
| 18 CRDs | 5 | none |
| 19 cri-dockerd | 3 | Killercoda has no Docker, so dpkg/cri-docker fail. The page points to "the warning in Part A", which does not exist |
| 20 CNI | 3 | Steps 1 and 4 install Calico on top of Killercoda's existing CNI. The page never says plainly "do not run these in the playground" |
| 21 kubeadm upgrade | 4 | No guidance if the playground is already at or above 1.35.2 (pick the newest patch from madison) |
| 22 etcd | 4.5 | Only a missing etcdutl is handled. A missing etcdctl in the playground is not |
| 23 NodePort | 4.5 | `o` in k edit with YAML autoindent can double the indent. No `:set paste` tip here (other pages have it) |
| 24 Ingress | 5 | none |
| 25 Gateway API | 4.5 | none serious |
| 26 NetPol app→app | 4.5 | none serious |
| 27 Default deny + DNS | 4 | "Run the wget line once BEFORE applying the policy" only appears in the closing routine, after the apply |
| 28 TLS ConfigMap | 5 | none |
| 29 CoreDNS config | 5 | none |
| 30 DNS across ns | 5 | none |
| 31 Sidecar | 4.5 | none serious. The 11-line pod-level insert is the hardest typing on the page |
| 32 HPA | 5 | none |
| 33 PriorityClass | 4 | The `k get pc` output table is rendered as five "COMMAND:" lines, so a beginner may type them |
| 34 Share node resources | 4.5 | none serious |
| 35 ConfigMap + Secret | 5 | none |
| 36 Taint/toleration | 5 | none |
| 37 Rollout/rollback | 5 | none |
| 38 PV+PVC+Pod | 4.5 | The status lines "Pod ✗ → PVC ✗ → PV ✓" are rendered as "COMMAND:" |
| 39 StorageClass | 5 | none |
| 40 Reuse PV | 5 | none |
| 101 Mock kubelet | 4.5 | WRITE DOWN adds "do NOT reinstall Kubernetes", which is not in the question |
| 102 Mock svc selector | 4.5 | "ENDPOINTS  = no Pod IPs" is missing the word `<unset>` |
| 103 Mock Pending | 4.5 | none serious |
| 104 Mock liveness | 4 | Step 3's "YOU SEE" box holds the instructions and shows the already-fixed `port: 80` |

## Must-fix list

- **P12**: "install it (Part A), wait 60 s". Part A installs nothing. Fix: add to setup `k apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.7.2/components.yaml` plus the `--kubelet-insecure-tls` patch, or say "skip step 2 in the playground".
- **P19**: "apt-get install -f -y (in the playground, see the warning in Part A)" / "Playground: expected, see Part A". There is no warning in Part A. Fix: add a Part A note ("Killercoda has no Docker: run `apt-get install -y docker.io` first, or expect cri-docker to fail; the sysctl part still works").
- **P20**: "COMMAND: k create -f <tigera-operator URL from the question>". In Killercoda this layers Calico onto the existing CNI. Fix: add a bold line before step 1: "Killercoda already has a CNI: do only Part A (dry-run + cidr edit). Do not run steps 1 and 4."
- **P4**: the setup is only `ssh node01 "systemctl disable --now kubelet"`. Fix: add `sleep 60   # wait until node01 shows NotReady`, as page 101 does.
- **P10**: "check with `k get pods -A \"" is truncated. Fix: write the full command outside the table: `k get pods -A | grep -iE "calico|cilium|canal|flannel"`.
- **P33**: "COMMAND: NAME VALUE GLOBAL-DEFAULT AGE" (and 4 more lines). This is output, not commands. Fix: render it as a YOU SEE block.
- **P27**: the "before" test comes after the apply. Fix: move `k exec app -n prod -- wget -qO- -T 3 web` into a step 0.5, before `k apply -f deny.yaml`.

## Verdict

Average **4.56 / 5** over 44 pages (round 1: 3.7 and 3.45). Most first-round fixes landed, and the troubleshooting pages are now solid.
Only P19 and P20 remain ≤ 3. Both fail because the playground cannot reproduce the task, and the page does not say so plainly. P12 (metrics-server) is next.
Everything else is cosmetic: export/rendering glitches (output shown as COMMAND or YAML, one truncated cell) and a few ordering or wait issues (P4, P27). No wrong v1.35 commands or flags were found.
