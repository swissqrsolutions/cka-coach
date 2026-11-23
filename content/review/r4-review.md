# Review r4: Mock 2 tasks 9–16 and Mock 3 tasks 1–16 (24 pages)

Scores answer one question: can an absolute beginner on Killercoda (controlplane + node01) follow the page alone and solve the task?

Problems that appear on almost every page are listed once here and not repeated per page:
- "0. ... just k get nodes" uses the alias `k`, which is never explained. Every later step says `kubectl` while Verify/Memorise say `k`. Fix: add one line once: "k = short alias for kubectl (already set in exam and Killercoda)".
- The "Check it works" step repeats the Verify section and has no YOU SEE. Fix: delete it, or merge it into Verify.
- Shell syntax is never explained: heredoc `cat <<'EOF' | kubectl apply -f -`, `$(...)`, `>`, `|`, `grep -A`, `jsonpath`. Fix: add a one-time "shell cheat-sheet" page and link to it.
- Memorise often says `k apply -f np.yaml`/`ci.yaml`/`hpa.yaml`, but no step ever creates that file (the steps use a heredoc). Fix: say "vim np.yaml (paste YAML), then k apply -f np.yaml", or keep the heredoc in Memorise.

## Page 209 — Helm install + upgrade with values — score 4/5
- The terms "chart", "release" and "revision" are never defined. Only "Repo = chart catalogue." is given. Fix: add "chart = app package; release = one installed copy; revision = version number of that release".
- `helm -n helm-web list -o json | grep -o '"revision":"[0-9]*"' | grep -o '[0-9]*'` is unreadable for a beginner, and Memorise uses `echo 2 >` instead. Fix: teach one way: `helm -n helm-web history web` → read the last REVISION → `echo 2 > /root/helm-rev.txt`.
- "Forgetting --version on upgrade → newest chart" is true, but the page never says that the question requires it. Fix: point to the words "keeping the same chart version" in the question.

## Page 210 — Create an Ingress with path routing — score 4/5
- "The * at the end means pathType Prefix" is explained, but `--rule="host/path*=svc:port"` syntax is not broken down. Fix: add "format: HOST/PATH=SERVICE:PORT; add * for Prefix".
- "No ingress controller on Killercoda, so ADDRESS stays empty" is in Plain Words, but the terms "ingress controller" and "ingressClassName" are never explained. Fix: one line: "controller = the program that actually routes traffic; class = which controller".
- Step 4 has no expected output, and Verify repeats it. Fix: merge.

## Page 211 — TLS ConfigMap: allow only TLSv1.3 — score 3/5
- The terms TLS, subPath, ClusterIP and "immutable" appear without definitions. Fix: add one line each (TLS = HTTPS encryption version; subPath = mount a single file; immutable = locked forever).
- `curl -sk --tls-max 1.2 https://$(kubectl ... jsonpath="{.spec.clusterIP}")` is a nested one-liner with nothing explained. Fix: split it: `IP=$(kubectl -n nginx-static get svc nginx-static -o jsonpath='{.spec.clusterIP}')`, then `curl -sk --tls-max 1.2 https://$IP`, and explain -s, -k and --tls-max.
- The steps use get -o yaml + sed + apply, but Memorise uses `k edit`. That is two methods for one task. Fix: use `k edit` in the steps too (faster, exam-realistic) and keep sed as the alternative.
- Step 1 can fail with "connection refused" if it runs before the Pod is Ready. Fix: run `k -n nginx-static rollout status deploy nginx-static` first.
- Verify says "must see: error / refused", but the curl with `-s` prints nothing. Fix: "must see: refused (from `|| echo refused`)".

## Page 212 — Write a NetworkPolicy: namespace AND pod selector — score 4/5
- The page never says why other traffic is denied (once a policy selects a Pod, everything not allowed is blocked). This is the key concept. Fix: add "A policy that selects app=db pods turns on deny-all-other-ingress for them".
- "Same list item (no 2nd dash) = AND" is fine, but no YAML shows the wrong (OR) version next to it. Fix: show the 2-dash version under Traps.
- `wget ... db.db`: the short DNS name `service.namespace` is never explained. Fix: "db.db = Service db in namespace db".
- The page has no check that the Killercoda CNI enforces NetworkPolicy. If it does not, step 3 succeeds and the learner thinks the answer is wrong. Fix: add `k -n kube-system get pods | grep -E 'calico|canal|cilium'`.
- Memorise has `k apply -f np.yaml`, but the file was never created (see the common problems above).

## Page 213 — Native sidecar container (restartPolicy Always) — score 3/5
- Step 1 saves `/root/order-app.yaml` and then ignores it, and step 2 retypes the whole Deployment. On the exam, retyping can silently drop fields such as labels, env and resources. Fix: edit the saved file (or `k edit`) and add only initContainers, volumeMounts and volumes.
- "native sidecar" and "init container" are never explained. Fix: one line: "init containers run before the app; with restartPolicy: Always one keeps running beside it = native sidecar (GA since v1.33)".
- emptyDir is never explained. Fix: "emptyDir = empty shared folder that lives as long as the Pod".
- The page does not warn that mounting the volume at /var/log hides the image's own /var/log. That is harmless here, but a beginner will wonder. Fix: optional one-line note.
- Memorise packs the YAML into a single line with no indentation. A beginner cannot type it into `k edit`. Fix: show the indented snippet.

## Page 214 — Split node resources evenly across replicas — score 2/5
- `kubectl describe node node01 | grep -A6 Allocatable` shows memory in **Ki** (for example `1928288Ki`), but YOU SEE says "~1.9Gi" and step 3 uses "1900Mi". The page never says how to convert. Fix: show the real Ki line and "÷1024 = Mi".
- Step 3 `echo "free cpu 1000m-250m=750m ..."` is not a calculation. It only prints text. Fix: use real arithmetic, e.g. `echo $(( (1000-250)*90/100/3 ))` → 225.
- The question says "Some Pods cannot start", but the setup (init 1 CPU on a 1-CPU node) leaves **all** Pods Pending. Fix: change the question to "Pods cannot start", or lower the setup requests.
- The page never explains the core rule: a Pod's request is max(init, sum of main containers). Without it the trap "its larger request blocks scheduling" means nothing. Fix: add that line.
- The terms "Allocatable", "requests" and "m" (millicores) are never defined. Fix: "1000m = 1 CPU; requests = reserved amount the scheduler counts".
- The Allocated resources grep shows a percentage table. The page never says which number to take (Requests column, not Limits). Fix: point to the Requests column explicitly.

## Page 215 — PVC Pending: wrong StorageClass — score 3/5
- The Traps say "Deleting the pod without saving its YAML first", but step 2 deletes the pod **without** saving it (only the PVC is saved). That contradicts the page's own trap. Fix: add `kubectl -n storage-fix get pod log-writer -o yaml > /root/log-writer.yaml` before the delete.
- Memorise `k apply -f pvc.yaml -f pod.yaml` fails as written: the pod.yaml still contains resourceVersion and uid ("resourceVersion should not be set on objects to be created"). Fix: "strip status, uid, resourceVersion, creationTimestamp from BOTH files".
- Step 2 saves `/root/logs-pvc.yaml`, but step 3 retypes the PVC, so the saved file is never used. Fix: either edit the saved file, or drop the save.
- "WaitForFirstConsumer" appears only in Traps and is never explained. Fix: "local-path makes the disk only when a Pod uses the claim".
- `--force --grace-period=0` is not explained, and it is unneeded for a Pending pod. Fix: plain `delete pod` is enough here.

## Page 216 — Static PV + PVC + Pod (hostPath) — score 4/5
- The trap "PVC without storageClassName → default class, never binds" is half-true. With no default class it binds only to a PV that has no class. Fix: "PVC without class won't match a PV with class manual".
- hostPath is never explained, and neither is which node it lands on (the node where the Pod runs, often node01). Fix: one line.
- "PVC gets the 1Gi PV (bigger is OK)" is good. CAPACITY shows 1Gi for the PVC, and a beginner may think that is wrong. Fix: note "PVC shows 1Gi, the PV's size".

## Page 301 — API server down after etcd change — score 4/5
- Step 0 says "just k get nodes". Here that command fails, which is the point, but the page does not say so. Fix: "it will fail; that is the symptom".
- "static pod", "manifest", "etcd" and "peer port" are never defined. Fix: "static pod = pod kubelet starts from a file in /etc/kubernetes/manifests".
- `watch -n3 crictl ps --name kube-apiserver` has no note on how to exit. A beginner gets stuck. Fix: add "(Ctrl+C to exit)".
- YOU SEE "Exited ... kube-apiserver" may instead be Running or Created mid-cycle. Fix: "Exited or restarting (ATTEMPT count rising)".
- The exact log text varies (the peer port is TLS too). Fix: "look for 127.0.0.1:2380 in the error".

## Page 302 — Controller-manager broken: Deployment does not scale — score 4/5
- Step 4 jumps to `sed` on the manifest without showing how the learner finds the file or the flag. Fix: add `grep kubeconfig /etc/kubernetes/manifests/kube-controller-manager.yaml` first.
- "controller-manager" and "kubeconfig" are never defined. Fix: "kubeconfig = login file a component uses to talk to the API server".
- The page has no wait or watch after the fix, and step 5 can still show 1/3 for about 30–60 s. Fix: add "wait ~1 min / watch".

## Page 303 — Kubelet config: wrong client CA file — score 3/5
- `journalctl -u kubelet --no-pager | grep -i -m2 "ca-wrong\|client-ca\|error"` prints the **oldest** matches in the journal, which are usually unrelated boot errors, not the current failure. Fix: `journalctl -u kubelet --no-pager -n 30 | grep -i -E "ca|error"`.
- In step 3, YOU SEE "ca.crt" is ambiguous: the `grep clientCAFile` at this point shows `ca-wrong.crt`. Fix: "ls shows ca.crt; config shows ca-wrong.crt".
- In step 4, `exit` is listed before "YOU SEE: active". The order confuses. Fix: put `exit` after the YOU SEE line.
- "kubelet", "client CA" and "NotReady" are never explained. Fix: "kubelet = agent on each node; CA file = certificate used to trust callers".

## Page 304 — NetworkPolicy blocks DNS egress — score 4/5
- The key concept "egress = outgoing traffic; default-deny-egress blocks DNS too" is not stated. Fix: add one line in Plain Words.
- Step 1's first wget can hang for about 10 s before "bad address", and the page does not warn about it. Fix: note "takes a few seconds".
- The trap "Adding Ingress to policyTypes → blocks incoming traffic for every pod" is correct. "podSelector: {}" (= all pods) is not explained. Fix: one line.
- Memorise `k apply -f dns.yaml` refers to a file that was never created.

## Page 305 — Bad rollout: roll back and record image — score 4/5
- The question says the update "left it unavailable", but with 2 replicas the rolling update keeps both old Pods Running, so READY stays 2/2. Fix: reword to "the new Pods fail", or use replicas 1 / maxUnavailable 1 in setup.
- Step 2 says "Revision 1 was healthy", but `rollout history` shows only numbers and `<none>`. Fix: add `kubectl -n release rollout history deploy checkout --revision=1` to see the image.
- The question asks for "image used by the running Pods", but the page reads the Deployment spec. That is fine after the rollback, but a strict reading wants the Pods. Fix: also show `k -n release get pods -o jsonpath='{.items[*].spec.containers[0].image}'`.

## Page 306 — cri-dockerd + sysctl (persist + verify) — score 3/5
- `dpkg -i /root/cri-dockerd.deb` may stop with unmet dependencies (or a jammy-vs-noble mismatch) on Killercoda, and YOU SEE "Setting up cri-dockerd" will not appear. Fix: add "if dependency errors: note them, continue; package state = iU".
- `systemctl enable --now` prints "Job for cri-docker.service failed" on Killercoda. Plain Words warns about this, but the step does not, so the beginner panics. Fix: put "(start fails without Docker — enabled is what counts)" in step 2.
- The setup downloads a .deb from GitHub. If it fails, it only echoes text and the whole page dead-ends. Fix: give the release page URL and the exact asset name.
- The terms sysctl, kernel module, br_netfilter and "socket unit" are never explained. Fix: one line each.
- Verify omits `net.ipv6.conf.all.forwarding`, which is one of the four required keys. Fix: add it.

## Page 307 — Helm template Argo CD and apply with kubectl — score 2/5
- `helm show values ... | grep -n -A3 -E "^crds:|^  service:" | head -20`: `^  service:` matches every component's service block (dex, redis and others), so `head -20` cuts off before `server.service`. YOU SEE "server.service.type" will not appear. Fix: `helm show values argocd/argo-cd --version 7.7.3 | grep -n -A5 "^server:"` then search for `service:` below it, or `grep -n "^crds:" -A5`.
- The setup line `kubectl apply -k ".../manifests/crds?ref=v2.13.2"` uses client-side apply. The ApplicationSet CRD is close to or over the 256 KB annotation limit ("metadata.annotations: Too long"), and the command also needs git. Fix: `kubectl apply --server-side -k ...`.
- The page never explains the difference between `helm template` and `helm install`, which is the whole point of the task. Fix: "template = only prints YAML; nothing goes to the cluster".
- The page never says where the Service name `argo-argocd-server` comes from (release name + nameOverride). Fix: `grep -n "name: argo-argocd-server" /root/argocd-template.yaml` before the get svc.
- Argo CD starts about 7 Pods on small Killercoda nodes. "must see: pods Running" may take several minutes or stay ContainerCreating. Fix: say "wait 2–4 min; Pending/slow is a playground limit".
- "Same repo as the docs." is meaningless. Fix: delete it.

## Page 308 — CRDs: filter by group + create a custom resource — score 3/5
- Verify says "must see: READY True", but the setup installs **only CRDs**, with no cert-manager controller, so READY stays empty forever. Fix: "must see: selfsigned listed (READY empty – no controller in playground)".
- The question says "of kind cert-manager.io/v1", which is wrong: that is the apiVersion, and the kind is ClusterIssuer. Fix: "with apiVersion cert-manager.io/v1".
- The `custom-columns ... | awk '$2=="cert-manager.io"{print $1}'` one-liner is not explained. A beginner cannot reproduce it. Fix: explain the columns and awk in one line, or offer `k get crd | grep '\.cert-manager\.io$'` + a manual check.
- "CRD" is used in the title and question but only defined in step 3 ("A CRD lets you store new object kinds"). Fix: move the definition to Plain Words.

## Page 309 — kubeadm: cert expiry, renew, join command — score 3/5
- "SET UP: (cannot be set up in a playground)" contradicts Plain Words ("No setup needed: the cluster already has these"), and the task works fine on Killercoda. Fix: "No setup needed — works as is on Killercoda".
- In step 3, `sleep 20` may be too short for kubelet to notice the file is gone (it checks about every 20 s), so the pod never restarts. Fix: `watch crictl ps --name kube-apiserver` until it disappears, then move the file back.
- The page has no proof that the **running** apiserver uses the new cert, because the openssl check reads the file on disk. Fix: `echo | openssl s_client -connect 127.0.0.1:6443 2>/dev/null | openssl x509 -noout -enddate`.
- In the trap "Not restarting the apiserver — it keeps the old cert in memory", "serving certificate" is never explained. Fix: "serving cert = the HTTPS cert the API server shows clients".

## Page 310 — Gateway API: header match + weighted split — score 3/5
- Verify says "must see: ... Accepted True", but the setup GatewayClass points to a fake controller (`example.net/gateway-controller`), so the route never gets any status. Fix: "Status empty is normal here (no controller); check the spec only".
- "Header rule is more specific, so it wins" is true, but the page does not explain that rule 1 implicitly matches path `/` too. Fix: one line on Gateway API precedence (more header matches win).
- Gateway, GatewayClass, HTTPRoute, parentRefs and backendRefs are never defined. Fix: one line: "Gateway = entry point; HTTPRoute = routing rules attached to it".
- The setup may fail if a GatewayClass named `nginx` already exists from another page with a different controllerName (that field is immutable). Fix: use the dry-run/apply guard, or name it `cka-demo`.

## Page 311 — NetworkPolicy pick: AND vs OR trap — score 4/5
- Step 2 `echo "a=OR ..."` is not a command that does anything. It is the answer printed as text. Fix: make it a plain explanation box, not a `$` command.
- Least-privilege comparison between c and b: the page does not say that c (no ports) allows ALL ports. Fix: "c = right sources but every port".
- The same CNI-enforcement caveat as page 212 applies.

## Page 312 — ClusterIP + headless Service and DNS records — score 4/5
- `grep -c Address /root/headless-dns.txt` also counts the DNS server's "Address: 10.96.0.10:53" line, so the headless file gives 3 and svc gives 2. YOU SEE ("svc: 1 address; headless: 2") does not match. Fix: "ignore the first Address (DNS server)".
- With `--rm -i`, the line `pod "dnsq" deleted` may end up in the saved file, and busybox nslookup may append "*** Can't find ...: No answer" (AAAA). Fix: tell the learner both are normal.
- If the catalog pods are not Ready yet, the headless lookup returns nothing. Fix: run `k -n dns-lab rollout status deploy catalog` first.
- The difference between "port" and "target-port" is only in Traps. Fix: "port = what clients call; targetPort = container port".

## Page 313 — HPA: CPU + memory, scaleUp and scaleDown behavior — score 4/5
- Step 3 says "READY 2/2 (once metrics exist)" and "Without metrics the HPA may wait". This is wrong: HPA raises replicas to minReplicas even with no metrics. Fix: "READY 2/2 within ~30 s (minReplicas enforced)".
- HPA, "utilisation" (percent of requests) and "stabilization window" are never defined. Fix: "utilisation = usage ÷ request".
- "Two metrics: HPA uses the higher demand" is correct, but "behavior" policies are not explained beyond the YAML. Fix: one line on the scaleUp policy meaning.

## Page 314 — PriorityClass with preemption policy — score 3/5
- The trap "Forgetting --preemption-policy=Never" **contradicts the task**, which requires PreemptLowerPriority (the default). Fix: "Setting preemptionPolicy: Never (copied from team-b) — task wants PreemptLowerPriority".
- PriorityClass, preemption and globalDefault are never explained. Fix: one line: "higher value = scheduled first and may evict lower pods".
- In the step 1 output, `grep -v system-` keeps the header and sorts ascending, so the highest value is the last line. That is not said. Fix: "highest = last line".
- The trap "Description without quotes" is harmless in YAML, so it is not a real trap. Fix: replace it with "value from a system-* class (2000000000)".

## Page 315 — StorageClass (Retain, expandable) + StatefulSet claims — score 4/5
- StatefulSet, headless Service, volumeClaimTemplates and "reclaimPolicy Retain" are never explained. Fix: one line each in Plain Words.
- The PVC naming rule `data-cache-0` (template-statefulset-ordinal) appears in YOU SEE without explanation. Fix: add it.
- Pods start one after another and pull redis, so the check can show only cache-0 at first. Fix: "wait until both Running (ordered start)".

## Page 316 — Re-bind a Released PV (clear claimRef) — score 4/5
- `kubectl patch ... --type=json -p='[{"op":"remove","path":"/spec/claimRef"}]'` is JSON-patch syntax, and it is not explained. Fix: one line: "removes the claimRef field; or `k edit pv` and delete the claimRef block".
- The trap "Creating the PVC before the PV shows Available → may stay Pending" overstates it: the PVC binds once the PV frees. Fix: "check Available first so you know the patch worked".
- "Released", "claimRef" and "reclaimPolicy Retain" are only partially explained. Fix: "Released = old claim gone, PV still reserved for it".
- The postgres:17-alpine pull can take a minute, and "Running" may show ContainerCreating first. Fix: add "wait".

## Top 10 fixes across these pages
1. Page 314: replace the trap "--preemption-policy=Never" (it contradicts the task) with "don't copy Never from team-b".
2. Page 308 Verify: change "READY True" to "listed (READY empty, no controller)". Also fix "of kind cert-manager.io/v1" → apiVersion.
3. Page 310 Verify: drop "Accepted True" (fake controller gives no status).
4. Page 307: fix the values grep (it never reaches server.service) and use `--server-side` for the Argo CD CRD install.
5. Page 214: show the real Ki values, do real arithmetic, explain max(init, main), and fix the "some Pods" premise.
6. Page 215: save pod YAML before deleting it, and strip resourceVersion/uid in Memorise or the apply fails.
7. Page 303: replace `grep -m2` on the whole journal with `journalctl -n 30` (recent lines).
8. Page 309: remove the "cannot be set up" contradiction, and replace `sleep 20` with watching crictl until the pod is gone.
9. All pages: create a file before Memorise says `k apply -f x.yaml`, explain the `k` alias once, and remove or merge the empty "Check it works" step.
10. Add a one-line glossary to Plain Words on every page (static pod, CRD, headless, egress, emptyDir, Allocatable, etc.). Beginners hit undefined terms on nearly every page.

## Overall verdict
Commands are mostly correct for v1.35, and the solutions would pass the exam. The CKA-expert content is solid, apart from a few factual slips (pages 313, 314, 308, 310).
For an absolute beginner the pages are too terse: core concepts and shell syntax are never defined, and several YOU SEE/Verify lines cannot match what Killercoda actually prints.
Fix the 4 wrong expectations and the 2 broken setups/commands first, then add a short glossary line per page. Average 3.5/5.
