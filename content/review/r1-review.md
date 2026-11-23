# Review r1: 20 study pages (beginner + CKA expert view)

Problems that affect every page. Each one is counted once here and not repeated per page.
- **Export/render bugs:** `&#39;` shows as raw text ("pod&#39;s", "didn&#39;t"), so decode HTML entities. Raw `**Calico**` appears too. Table header rows start with an empty `| ` cell. "Copyk top nodes" / "Copyhelm list -A" has the copy-button label glued onto the command.
- **Commands with `|` cut off inside tables:** "`journalctl -u kubelet -n 30 --no-pager" (P8), "`helm search repo argocd/argo-cd --versions" (P15), "`k api-resources" and "`k get crd -o name" (P18), and "`systemctl list-unit-files" (P19). The table parser splits on the pipe, so these commands are incomplete and the opening backtick is never closed. Escape `|` in table cells.
- **Lists flattened into one line:** "1. Near the top, … 2. At the bottom…" and "- --now = start it immediately - enable = also…". Beginners can't tell where one item ends. Render them as real lists.
- **Commands labelled "YOU SEE:"** "YOU SEE: systemctl status kubelet" (P4), "YOU SEE: k apply -f np.yaml" (P10) and "YOU SEE: k auth can-i …" (P13) are commands, not output. Mark them `$`.
- **Duplicated labels:** "You see:" directly followed by "YOU SEE:" (P1, P2, P4…), and "1. Step 1." Drop one of each.
- **Never explained:** `k` (alias for kubectl), pod, node, namespace, "Closing routine", "(exam: ssh line first)", and "question 36/38/40", which point to pages the reader can't see. The basics of vim are also missing: insert mode vs normal mode, Esc before `dd`, and how to delete characters. Add a one-time glossary and vim card, and link "question N" to the page.

## Page 1 — ImagePullBackOff — score 4/5
- The terms pod, namespace and `k` are used on the very first page and never defined. Add one line for each.
- "`k rollout status`" is used with no explanation. Add: "waits until the new pod is ready, then returns".
- The first status is often `ErrImagePull`, not `ImagePullBackOff`. Add: "ErrImagePull = same problem, first try".
- The empty first column ("| ") in the READY/STATUS table looks like a broken table. Remove it.

## Page 2 — CrashLoopBackOff — score 4/5
- "Type /exit 1 … The cursor jumps to: - command:" is wrong: the cursor lands on the `- exit 1` line. Say that, and say how to replace the text (`cw` or `x`, then `i`).
- "Press i, change exit 1 to sleep 3600" assumes the reader knows vim editing. Give the keystrokes, or use `k patch` / `k set` instead.
- The table mixes in `CreateContainerConfigError`, which does not restart. A beginner looking for "keeps restarting" is misled. Label that row "not a restart loop".
- "`--limits=memory=256Mi`" is an invented value. Say "use the value the question gives".
- The first status is `Error` / `RESTARTS 1` before CrashLoopBackOff appears. Say "wait ~30 s".

## Page 3 — Pending pod — score 3/5
- "0/2 nodes are available: 2 Insufficient cpu." On Killercoda the controlplane is likely tainted. The real line would then be "1 Insufficient cpu, 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }…". Show the real line and say the counts vary.
- The trap "Not waiting for the old Pending pod to be replaced" is backwards. The Pending pod is the new one, and the old Running pod is the one that stays. Reword it as "wait until the Pending pod is gone".
- "question 36", "questions 38 and 40" and "question 9" are dead ends for the reader. Link them or name the topic.
- The "Events is empty (<none>)" row should say "and Node: <none>", to match page 9.

## Page 4 — Node NotReady: kubelet stopped — score 4/5
- The setup `systemctl stop kubelet` leaves the kubelet *enabled*, so the "survive reboot" part is never tested. Use `ssh node01 "systemctl disable --now kubelet"`.
- The setup gives no wait time. The node only turns NotReady/Unknown after ~40 s. Add "wait 60 s, then `k get nodes`".
- "YOU SEE: systemctl status kubelet" is a command, not output. Mark it `$`.
- The trap "Running systemctl on the control plane" needs the check: "the prompt must say node01".

## Page 5 — Node NotReady: kubelet misconfigured — score 4/5
- "After editing the unit" uses *unit* without defining it. Write "service file" consistently.
- "Change /usr/local/bin/kubelet to /usr/bin/kubelet" gives no vim keys. Add: "put the cursor on `l` of local, type `6x`" (deletes `local/`).
- `systemctl cat` prints two ExecStart blocks (kubelet.service and the drop-in), and one of them is an empty `ExecStart=`. Say "edit the block whose path contains local".
- Step 1 says nothing about a 40 s wait after setup before the node shows NotReady. Add it.
- The setup assumes the drop-in sits under /usr/lib/systemd/… Older installs use /etc/systemd/system/kubelet.service.d/. Add "if sed finds nothing, check with `systemctl cat kubelet`".

## Page 6 — Service has no endpoints — score 4/5
- The `--` in `k exec client -n web -- wget …` is never explained. Add: "`--` = everything after this runs inside the pod".
- The `-qO-` / `-T 3` explanation is flattened into one sentence. Make it a list.
- `k exec` can fail if the client pod is still ContainerCreating. Add "`k get pod client -n web` first".
- The trap "Copying the pod-template-hash label into the selector" doesn't explain why that is bad. Add "the hash changes on every rollout".

## Page 7 — Service with the wrong targetPort — score 5/5
- No serious problems, beyond the shared vim gap: "Change 8080 to 80" needs the keystrokes (`cw80`, Esc).

## Page 8 — kube-apiserver is down — score 4/5
- The rule "Make a backup before editing … keep it OUTSIDE the folder" sits *after* the steps, under "IF SOMETHING GOES WRONG". Move it to before step 3.
- Step 0 says "k get nodes", which fails here, and the page never shows what that failure looks like ("The connection to the server …:6443 was refused"). Show that line as the symptom.
- `2>&1` is unexplained. Add "send error output to the screen too (crictl logs writes to stderr)".
- The fix in the "no apiserver container" row is truncated: "`journalctl -u kubelet -n 30 --no-pager".
- "Copy the first column of the top line" doesn't say which container to choose. Add "the most recent one, CREATED = seconds/minutes ago".

## Page 9 — Scheduler is not running — score 4/5
- "Remove the x" gives no keys. Add: "the cursor is on `s`; press `9l` then `x`", or use `sed -i 's/kube-schedulerx/kube-scheduler/' …`.
- The setup line `sleep 30` inside a paste block looks like a hang to a beginner. Add a comment saying "wait 30 s".
- The "If something goes wrong" text says "k logs <that-pod> -n kube-system names the wrong line". For an exec failure the logs are empty, and only describe or `crictl ps -a` show the error. Say that.
- Calling the Deployment→pod creator "controller-manager" is fine, but "scale a Deployment and NO new pods appear" deserves "check `k get rs`" as the test.

## Page 10 — NetworkPolicy is blocking traffic — score 3/5
- "In Killercoda wget worked even with deny-all … that playground's network plugin does not enforce policies" is very likely false. The Killercoda CKA playground runs Canal/Calico, which enforces policies. Verify this, and drop the row if it is false. As written it contradicts step 1's "You see download timed out".
- "Policies only add up. There is no 'deny' rule." sits beside an existing policy named `deny-all`, which confuses beginners. Add: "a policy that allows nothing = deny, by selecting the pods".
- "Press i, paste. Delete these 3 blocks (dd …)" never says to press Esc after pasting, or how to move to each block. Add "Esc, move with arrows to `- ipBlock:`, then `7dd`".
- Pasting YAML into vim can staircase-indent it. Add `:set paste` before `i`, or use `cat > np.yaml <<EOF`.
- The page is too long for a 6-minute task (the full docs example plus two tables). Show only the finished file and the 5 changes.
- "Save." doesn't say how. Write "Esc, :wq".

## Page 11 — DNS is not working — score 3/5
- `busybox:1.36 nslookup kubernetes.default` handles search domains badly and can print `** server can't find kubernetes.default: NXDOMAIN` lines even when DNS works. Use `nslookup kubernetes.default.svc.cluster.local`, or busybox:1.28.
- "You want a line Address: 10.96.0.1" doesn't warn that the first `Address:` line is the DNS server (10.96.0.10:53). Say "the second Address line".
- "kube-dns = the old name" will confuse beginners when they check endpoints. Add: "you will use both names below".
- `k get endpoints kube-dns` will show the v1.33+ deprecation warning. Repeat the "harmless" note here.

## Page 12 — Logs and usage into a file — score 3/5
- Killercoda usually has no metrics-server, so half the task can't be practised. Add the install line (metrics-server components.yaml plus the `--kubelet-insecure-tls` patch) to the setup.
- The row "the pod has 2 containers and k logs complains" is wrong. Current kubectl prints "Defaulted container …" and silently uses the first one. Reword it as "always use -c when the question names a container".
- `>` is defined, but `echo` is not. Add "echo = print this text".
- The "Related commands" block shows "Copyk top nodes". This is the render bug.

## Page 13 — RBAC: ServiceAccount + Role + RoleBinding — score 4/5
- The trap "Writing --serviceaccount=deploy-bot without dev: — no error, but it doesn't work" is false. kubectl rejects it with "serviceaccount must be <namespace>:<name>". Fix the text.
- The row 'the server doesn't have a resource type "deployment"' is wrong. kubectl resolves the singular `deployment` fine in `create role` and `auth can-i`. Remove it, or use a real typo such as `deploymnts`.
- The can-i commands are labelled "YOU SEE:". Mark them `$`.
- "Kubernetes gives NO error for a wrong SA name in a binding" is true for a wrong *name*. Keep it, but separate it from the format claim.

## Page 14 — RBAC: ClusterRole — score 5/5
- "Adding -n to the clusterrole commands and thinking it matters" is vague. Write "-n is ignored on clusterrole/clusterrolebinding; only the SA needs a namespace".
- Step 4 doesn't show the expected yes/no answers (they only appear in Verify). Add them.

## Page 15 — Helm template (Argo CD without CRDs) — score 4/5
- The row "`helm search repo argocd/argo-cd --versions" is truncated by the table-pipe bug.
- `grep -c` returns exit code 1 when the count is 0, and some terminals show that as an error. Add "0 plus no output is the success case".
- "argocd (first) | a release name" leaves a beginner confused, because the same word is used three times (repo, release, namespace). Use the release name `my-argo` in the explanation.
- The setup's `get-helm-3` URL should be pinned or checked: Helm 4 is current, and the script may move.

## Page 16 — Helm install, upgrade, rollback — score 4/5
- `helm show values … | grep -n replicaCount` returns at least 2 hits (`controller.replicaCount` and `defaultBackend.replicaCount`). Say "pick the one under controller:".
- ingress-nginx was retired (end of maintenance March 2026). The chart may disappear or stop installing. Use a maintained chart (for example bitnami/nginx `replicaCount`) or warn about the retirement.
- "Release", "chart" and "repo" were defined on page 15 but not here. Add a pointer.
- The controller Service stays `<pending>` (it asks for a LoadBalancer). Say "ignore EXTERNAL-IP pending".

## Page 17 — Kustomize — score 4/5
- The row "error: ... must be a directory or a parse error / you used -f with the folder" is wrong. `k apply -f /root/kust` accepts a folder: it applies deploy.yaml into `default` and fails on kustomization.yaml ("Object 'Kind' is missing"). Show that real behaviour.
- The setup relies on `cd /root/kust` persisting across the pasted lines. If pasted line by line it works, but on a failed `rm` it doesn't. Use absolute paths instead.
- "Change count: 2 to count: 3" needs keys: `r3` on the 2.
- "overlay" and "base" in SPOT THE PATTERN are never defined. Remove them, or define them in one line each.

## Page 18 — CRDs — score 4/5
- Rows 1–2 are truncated ("`k api-resources", "`k get crd -o name"), which loses the grep that makes them useful.
- The question says "cert-manager is installed", but the setup only installs CRDs. Say so, so the beginner doesn't look for pods.
- "a text starting with GROUP: … / KIND: … / FIELD: subject" — the slashes look like part of the output. Show it as a 3-line block.

## Page 19 — cri-dockerd (prepare a node) — score 2/5
- The setup never creates `/root/cri-dockerd.deb`, so steps 1–2 fail on Killercoda ("cannot access archive"). Add a `wget` line for a pinned Mirantis release .deb.
- Killercoda runs containerd with no Docker, so cri-docker won't start, or dpkg reports dependency problems. Say this, or install docker.io in the setup.
- The setup's `rm -f /etc/sysctl.d/k8s.conf` doesn't reset the live values. ip_forward etc. are already 1 on Killercoda, so the verify step proves nothing. Reset with `sysctl -w … =0` in the setup.
- "net.netfilter.nf_conntrack_max" can fail with "cannot stat" if nf_conntrack isn't loaded. Add `modprobe nf_conntrack` to the error table.
- The row "`systemctl list-unit-files" is truncated by the table-pipe bug.

## Page 20 — Install a CNI (network plug-in) — score 2/5
- "(cannot be set up in a playground)" means a beginner can't practise the task at all. Point to a no-CNI kubeadm scenario, or give a `kubeadm reset`-free alternative to rehearse.
- `k apply -f custom-resources.yaml` right after the operator often fails with 'no matches for kind "Installation"' while the CRDs are still being registered. Add "wait 20 s, retry".
- The `--cluster-cidr` grep returns nothing if kubeadm ran without `--pod-network-cidr`. Say what to do then (keep the default, or read `kubeadm-config` cm).
- "Without it … pods stay Pending" is inaccurate. Most pods sit in ContainerCreating, and only CoreDNS stays Pending on NotReady nodes.
- "WRITE DOWN … → **Calico**" shows raw markdown.

## Top 10 fixes across these pages
1. Fix the table renderer: escape `|` in cells (5 commands are truncated) and remove the empty first header cell.
2. Decode HTML entities (`&#39;`) and markdown (`**`), and fix the "Copy" label glued onto commands.
3. Add a one-time vim card covering i, Esc, `:wq`, `x`, `cw`, `dd`, `/search` and `:set paste`, and give exact keys at every edit step (P2, P5, P7, P9, P10, P17).
4. P19: the setup must provide the .deb (and Docker), and reset the sysctl values so the task is real.
5. P10: verify NetworkPolicy enforcement on Killercoda, remove the contradicting row, and add Esc and `:set paste` to the paste steps.
6. P13/P12/P17: correct the false error claims (`--serviceaccount` without ns errors, singular `deployment` works, logs auto-defaults the container, `-f` on a folder).
7. P3: show the real FailedScheduling line, including the control-plane taint, and fix the backwards "old Pending pod" trap.
8. P11: use the FQDN or busybox:1.28 for nslookup, and say which Address line to read.
9. P4: the setup must `disable --now` the kubelet so that "survive reboot" is tested, and add wait times after every node or control-plane setup.
10. Define k, pod, node, namespace, "Closing routine" and "ssh line" once, and replace "question N" with links.

## Overall verdict
The pages are well structured: question → pattern → steps → verify. Most commands are correct for v1.35, and pages 1, 6, 7, 13 and 14 are close to exam-ready.
A true beginner will still get stuck on vim editing, the undefined basics, and the render bugs that cut commands off.
Pages 19 and 20 can't be practised on Killercoda as written, and pages 3, 10, 12, 13 and 17 contain claims that are factually wrong.
