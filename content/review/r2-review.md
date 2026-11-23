# Review r2 — pages 21–40

Scale: 5 = a beginner can follow it alone in Killercoda and solve the task; 1 = cannot.
"Export artefacts" below (glued `Copy`, `&#39;`, empty `| ` table rows, lost indentation) are flagged because the brief says the export matches the app.

## Page 21 — kubeadm upgrade — score 1/5
- SOLVE IT has only step 0 and "Closing routine". The whole routine (drain, apt, kubeadm upgrade, kubelet, uncordon, ssh to node01) is missing. Fix: add the full numbered steps for controlplane, then for node01.
- `apt-get update` is missing everywhere (MEMORISE too), so `apt-get install kubeadm='1.35.2-*'` will often say "version not found". Fix: add `apt-get update` before each install.
- `ssh node01` is never mentioned, but the table says "you ran k drain / k uncordon on node01 … exit first". Fix: add "ssh node01 … exit" steps explicitly, with drain/uncordon on controlplane.
- `kubeadm upgrade plan` is missing; and nothing says that a new MINOR version needs the apt repo line changed in `/etc/apt/sources.list.d/kubernetes.list`. Fix: add both (one line each).
- "(cannot be set up in a playground)" leaves the beginner with nothing to practise. Fix: point to the Killercoda kubeadm-upgrade scenario or explain how to practise a patch upgrade on the playground's version.
- `Copydrain → …` and `Version &#39;1.35.2&#39;` are export/render artefacts. Fix: strip "Copy" label and decode entities.

## Page 22 — etcd backup and restore — score 3/5
- Each continuation line of the snapshot command is prefixed `$ --endpoints=…`; a beginner runs them one by one and each fails. Fix: show it as one block without `$` on continuation lines.
- "(If etcdutl is not installed, the same line with etcdctl works.)" is wrong for v1.35: it ships etcd 3.6, where `etcdctl snapshot restore` was removed. Fix: say etcdutl only; give a fallback (e.g. exec into the etcd pod image or install etcdutl).
- The page never checks that `etcdctl`/`etcdutl` exist on the Killercoda controlplane. Fix: add `which etcdctl etcdutl` and what to do if missing.
- Table row "kubectl does not come back after 2 minutes → `` `crictl ps -a ``" is truncated with a stray backtick. Fix: "crictl ps -a | grep etcd; crictl logs <id>; compare etcd.yaml with /root/etcd.yaml.bak".
- "Check: YOU SEE: grep -n …" labels a command as output. Fix: use "$" for commands, "YOU SEE" only for output.

## Page 23 — NodePort — score 4/5
- Question says "port 80 (TCP)", the YOU SEE block adds only `containerPort: 80`, MEMORISE adds `protocol: TCP`. Contradiction. Fix: add `protocol: TCP` as the third line in step 1.
- `k get endpoints` prints a deprecation warning in v1.33+; a beginner thinks something broke. Fix: use `k get endpointslices -n web` or say the warning is harmless.
- "ports: must start in the same column as image: / name::" — `image:` sits after `- `; beginner may align with the dash. Fix: "same column as the word imagePullPolicy:".

## Page 24 — Ingress — score 4/5
- "An Ingress without a class is ignored" is false when a default IngressClass exists. Fix: "…unless an IngressClass is marked default".
- "IngressClass = the name of the controller" — it is an object that points to a controller. Fix: reword in one line.
- "Backends shows <error … not found> | Service name or port has a typo" — a wrong port does not give "not found". Fix: split the row: name typo vs port typo (shows no endpoints).
- Expected IP `(192.168.x.x:80)` depends on the CNI. Fix: write `(<pod IP>:80)` as in VERIFY.

## Page 25 — Gateway API — score 3/5
- Verification `k describe httproute … | grep -A3 "Parent Refs"` shows the parentRef you typed, not whether it is attached; the playground GatewayClass has no controller, so nothing can ever be Accepted/Programmed. Fix: say plainly that in Killercoda only object creation can be checked; in the exam check `Accepted True` under Status → Parents.
- Ingress `pathType: Prefix` → HTTPRoute `type: PathPrefix` (and Exact → Exact) mapping is never stated. Fix: add a row "pathType Prefix = PathPrefix".
- "vim gw.yaml / Paste the Gateway example" — no "press i", and pasting into vim with autoindent produces staircase YAML. Fix: "press i; if indentation drifts, `:set paste` first".
- "Save, then: YOU SEE: k apply -f gw.yaml" — command shown as output. Fix: `$ k apply -f gw.yaml`.
- Very long for one task (two 7-row tables + two full files). Fix: drop the "finished file" or the table, not both.

## Page 26 — NetworkPolicy: allow one app to reach another — score 3/5
- "Delete: - the line - Egress - the 7 lines from - ipBlock: to project: myproject - the 7 lines from egress: to the end" is one run-on line; the dashes read as YAML. Fix: render as 3 bullets with the first/last line quoted.
- No "This is what you copied" block (other pages have one), so the beginner cannot count the "7 lines". Fix: show the docs example.
- "WRITE DOWN: … plus the three blanks" and "The same three blanks as in question 10" refer to a page not in this flow. Fix: write the values in WRITE DOWN.
- Trap "Putting podSelector and namespaceSelector as two list items (OR) instead of removing it" is unreadable. Fix: "Leave only the podSelector item under from:".
- No IF SOMETHING GOES WRONG section; and no note that enforcement needs a policy-capable CNI (if `other` still gets nginx, the beginner is lost). Fix: add the table with that row.

## Page 27 — Default deny, but keep DNS — score 4/5
- `nslookup kubernetes.default` with busybox 1.36 often fails on short names regardless of policy. Fix: use `kubernetes.default.svc.cluster.local`.
- `wget -qO- -T 3 kubernetes.default:443` fails even without the policy (HTTP to an HTTPS port), so it proves nothing. Fix: test against a pod/Service on port 80 (e.g. create one nginx in prod).
- Step title "change 1 line, add 7 lines" but the table adds a namespace line too (8 lines added). Fix: "change 1, add 8".
- Expected describe output is squashed onto one line; real output lists `To Port:` lines separately plus `To: <any>`. Fix: copy real output.

## Page 28 — TLS settings in a ConfigMap — score 2/5
- Setup does not mount the ConfigMap into the Deployment, so "gets its configuration from ConfigMap" is false in Killercoda; the restart changes nothing and the curl test cannot run. Fix: setup must mount nginx.conf (with a self-signed cert Secret) into the deployment.
- Even if mounted, `server { listen 443 ssl; ssl_protocols … }` has no `ssl_certificate` → nginx crashes. Fix: include cert/key lines in the setup config.
- Immutable fix "k delete cm …, k apply -f /root/cm-backup.yaml" fails: the backup contains `resourceVersion`/`uid` ("resourceVersion should not be set on objects to be created"). Fix: `k replace --force -f /root/cm-backup.yaml` or strip those fields.
- "A running pod does not re-read its config" is inaccurate: the mounted file updates; nginx does not reload. Fix: say that.

## Page 29 — CoreDNS config — score 4/5
- Rollback "k apply -f /root/coredns-backup.yaml" after editing fails with "the object has been modified" (stale resourceVersion). Fix: `k replace -f` … or `k replace --force -f`.
- "Same three motions as question 28" — cross-reference instead of content. Fix: drop it.
- No note that CoreDNS also auto-reloads (`reload` plugin) — a beginner sees it working before restart and gets confused. Fix: one line.

## Page 30 — DNS names across namespaces — score 4/5
- Step 1 shows `$ SERVICE . NAMESPACE . svc.cluster.local` as commands; a beginner will type them. Fix: show as plain text, not `$`.
- `--rm -it … > file`: with output redirected, `-t` is pointless and can add TTY warnings. Fix: use `--rm -i --restart=Never`.
- Expected output omits the `Server:`/`Address: 10.96.0.10:53` header lines; beginner compares the wrong Address. Fix: show the full busybox output and mark which Address counts.
- busybox nslookup may also print "*** Can't find …: No answer" (AAAA). Fix: say it is normal.
- "every name fails | question 11" — cross-reference with no content. Fix: one-line hint (check coredns pods).

## Page 31 — Sidecar container — score 2/5
- Step 3 YAML is shown flush-left with `$` on every line, and the promised "# ADD" markers are missing — the beginner cannot see indentation or what is new. Fix: render as a code block with real indentation and # ADD markers.
- "Lines marked # ADD are new" — none are marked. Fix: same as above.
- `/containers:` in the full deploy YAML: nothing says the new `volumes:`/`initContainers:` go under `spec.template.spec`, not the top `spec:`. Fix: one line "the spec: just above containers:".
- `IN PLAIN WORDS: Copy1. a volume …` — export artefact. Fix: strip "Copy".

## Page 32 — HPA — score 4/5
- `k describe hpa … | grep -A3 -i behavior` shows only Scale Up lines; Scale Down is further down. Fix: `grep -A12 -i behavior` or use the yaml grep from VERIFY.
- Expected `cpu: 0%/70%` conflicts with the table row saying the playground may have no metrics-server (`<unknown>`). Fix: show both outputs up front.
- "the question asks for MEMORY | no flag in older kubectl" — vague ("older" than what?). Fix: check `k autoscale --help` on v1.35 and give the exact flag, or give only the edit path.

## Page 33 — PriorityClass — score 5/5
- Minor: right after the edit, old pods still Terminating show CLASS `<none>`. Fix: "ignore Terminating pods".

## Page 34 — Share a node's resources between pods — score 4/5
- Example `Allocated resources` output omits the `(Total limits may be over 100 percent…)` and `--------` lines a beginner will see. Fix: paste real output.
- "the pod has init containers too | they also need room" is misleading (init containers run one at a time; effective request = max(init, sum of app)). Fix: reword.
- Killercoda's node01 may have different CPU/memory; the worked example looks like the answer. Fix: bold "your numbers will differ".

## Page 35 — ConfigMap and Secret in a pod — score 2/5
- Step 4 YAML is flush-left with `$` prefixes and no # ADD markers — indentation (the whole point: CONTAINER vs POD level) is invisible. Fix: real indented code block with markers.
- Step 3 tells the beginner to copy from two docs pages, then step 4 gives the full answer anyway — confusing order. Fix: keep one (docs pointer as fallback).
- Last table row has an empty Cause cell. Fix: "pods are immutable".
- "error validating data: unknown field "volumes"" — real v1.35 message is `strict decoding error: unknown field "spec.containers[0].volumes"`. Fix: quote that.

## Page 36 — Taint, toleration, nodeSelector — score 3/5
- Step 4 YAML is flush-left with `$`, "Lines marked # ADD are new" but none marked. Fix: indented block with markers.
- Step 3 copies `tolerations:` from docs but never says where in x.yaml (under `spec:`, same column as `containers:`). Fix: one line.
- "Check: YOU SEE: k describe node …" — commands labelled as output. Fix: `$`.
- `Copyk taint …` artefact. Fix: strip "Copy".

## Page 37 — Rolling update and rollback — score 5/5
- VERIFY "must see: new top revision" is vague. Fix: "revision 3 appears, revision 1 disappears".
- "the new image does not exist (question 1)" — odd cross-ref. Fix: drop "(question 1)".

## Page 38 — PV + PVC + Pod — score 4/5
- "In question 40 one part of the chain already existed" — page 40 comes after this one. Fix: remove forward references (also p39).
- Contradiction: IF-WRONG says missing storageClassName → "Bound, VOLUME pvc-3f2a…", TRAPS says "stays Pending" (with local-path WaitForFirstConsumer it is Pending until a pod uses it). Fix: make both say "binds to a NEW disk from the default class, not pv-data".
- `k get pv` expected header lacks `VOLUMEATTRIBUTESCLASS` and `REASON` columns shown in v1.35. Fix: paste real output.
- "Press i, paste" with no paste-indentation warning. Fix: add `:set paste` hint once.

## Page 39 — StorageClass — score 4/5
- "You already met the default class in question 40" — not yet met; page 40 is next. Fix: remove or reorder 40 before 38/39.
- Expected `k get sc` assumes a `local-path` class exists in the playground; setup hides errors with `2>/dev/null`. Fix: say "if local-path is not listed, that is fine".
- Trap "Annotation value not quoted (must be the string "true")" — never shown what happens. Fix: "unquoted true is rejected: annotations must be strings".

## Page 40 — Reuse an existing PV (MariaDB) — score 4/5
- Trap "PV still Released with an old claimRef — check status before" has no fix, and that is the likely real-exam state. Fix: add `k patch pv <name> -p '{"spec":{"claimRef":null}}'` → Available.
- MEMORISE says docs search 'persistent volumes', step 2 says 'persistent volume pod'. Fix: one search term.
- MEMORISE "storageClassName <same as PV>" hides the key trick (empty → `""`, not deleted). Fix: write `storageClassName: "" if PV has none`.

## Top 10 fixes across these pages
1. Page 21: write the missing step-by-step (ssh, apt-get update, unhold/install/hold, upgrade plan/apply/node, kubelet restart, drain/uncordon on controlplane).
2. Pages 31, 35, 36: restore indentation and # ADD markers in the "add these lines" YAML; drop the `$` prefix on YAML.
3. Page 28: fix setup so the ConfigMap is actually mounted and nginx starts with a cert; otherwise the task cannot be practised.
4. Page 22: remove the "etcdctl restore works too" fallback (gone in etcd 3.6) and add a check that etcdctl/etcdutl exist.
5. Pages 28, 29: backups restored with `k apply` fail on resourceVersion — use `k replace --force -f`.
6. Use `$` only for commands and YOU SEE only for output (p22, 25, 27, 30, 33, 35, 36 mix them).
7. Remove cross/forward references to other question numbers ("question 10/11/28/40"); state the content inline.
8. Fix weak/false verifications: p25 Parent Refs grep, p27 wget to :443 and short-name nslookup, p32 grep -A3, p37 "new top revision".
9. Add one global vim-paste tip (`press i`, `:set paste`) on every "paste the docs example" page.
10. Strip export/render artefacts: "Copy" glued to text, `&#39;`, empty `| ` header rows, empty table cells, truncated `crictl ps -a`.

## Overall verdict
Most pages (23, 24, 29, 30, 33, 37–40) are solid and a beginner can finish them alone.
Four pages are blocking: 21 has no solution steps, 28's setup cannot create the problem, and 31/35/36 show YAML without visible indentation.
Fix the top 5 items and the average would move from about 3.5 to above 4.
