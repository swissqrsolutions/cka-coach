# v2 review: 44 mock-exam study pages (second round)

The score answers one question: can an absolute beginner on the Killercoda CKA playground solve the task from this page alone? Scale is 1–5.

| page | score | main remaining problem |
|---|---|---|
| 105 logs → grep ERROR | 5 | none. Cosmetic: YOU SEE shows "INFO tick 4" before "ERROR disk slow 3", but the real log order is the other way round |
| 106 Helm template Argo CD | 5 | none |
| 107 cri-dockerd + sysctl | 4 | Unlike page 306, this page has no warning that `dpkg -i` can stop with dependency errors on Killercoda. If it does, VERIFY's "ii cri-dockerd" shows as "iU" |
| 108 cert-manager CRDs + explain | 5 | none |
| 109 RBAC SA/Role/RoleBinding | 4 | Render bug: "full name is system:serviceaccount::" (the `<namespace>:<name>` placeholders are stripped) |
| 110 named port + NodePort | 5 | none |
| 111 Ingress → Gateway + HTTPRoute | 5 | none |
| 112 pick least-permissive netpol | 4 | Render bug: "backend.backend = .." (the `<service>.<namespace>` text is stripped) |
| 113 PriorityClass highest−1 | 5 | none |
| 114 HPA scaleDown window | 5 | none |
| 115 default StorageClass | 5 | none |
| 116 reuse retained PV (MariaDB) | 5 | none |
| 201 kubelet drop-in path | 5 | none |
| 202 scheduler typo | 5 | none |
| 203 CoreDNS scaled to 0 | 5 | none. The exact "timed out" vs "refused" text from busybox may differ |
| 204 nodeSelector → label node | 5 | none |
| 205 missing ConfigMap volume | 5 | none |
| 206 Calico via tigera operator | 4 | On Killercoda you can only rehearse this task, not finish it. The page says so honestly |
| 207 etcd snapshot | 5 | none |
| 208 Kustomize overlay | 5 | none |
| 209 Helm install + upgrade | 5 | none |
| 210 Ingress imperative | 5 | none |
| 211 TLSv1.3 ConfigMap immutable | 5 | none |
| 212 NetworkPolicy AND | 5 | none. Minor: the CNI grep only searches kube-system, but an operator-installed Calico runs in calico-system |
| 213 native sidecar | 5 | none |
| 214 split node resources | 5 | none. The arithmetic is dense but walked through step by step |
| 215 PVC wrong StorageClass | 5 | none |
| 216 static PV/PVC/Pod | 5 | none |
| 301 apiserver → etcd 2380 | 5 | none |
| 302 controller-manager kubeconfig | 5 | none |
| 303 kubelet clientCAFile | 5 | none |
| 304 DNS egress policy | 5 | none. Unlike pages 112/212/311, there is no CNI-enforcement hint (Canal enforces policies, so this is low risk) |
| 305 rollout undo + image | 5 | none |
| 306 cri-dockerd socket + sysctl | 4 | Docker is missing on Killercoda, so the service never stays active and the task cannot be fully proven. The page says so honestly |
| 307 Helm template → kubectl apply | 5 | none |
| 308 CRDs by group + ClusterIssuer | 5 | none |
| 309 kubeadm certs + join | 5 | none |
| 310 HTTPRoute header + weights | 5 | none |
| 311 netpol AND vs OR pick | 5 | none |
| 312 ClusterIP vs headless DNS | 5 | none |
| 313 HPA cpu+mem + behavior | 5 | none |
| 314 PriorityClass preemption | 5 | none |
| 315 SC Retain + StatefulSet | 4 | Render bug: "named -- = data-cache-0" (the `<template>-<statefulset>-<ordinal>` text is stripped) |
| 316 Released PV claimRef | 5 | none |

## Must-fix list

1. **Stripped `<placeholders>` in explanation text (pages 109, 112, 315).** The renderer treats `<...>` as HTML in the explanation text, so the placeholders vanish. In the MEMORISE and COMMAND blocks the same placeholders render correctly.
   - p109: "A ServiceAccount's full name is system:serviceaccount::."
   - p112: "backend.backend = .."
   - p315: "named -- = data-cache-0"
   - Fix: escape `<`/`>` (`&lt;` `&gt;`) in explanation text, or write the forms out: `system:serviceaccount:finance:reporter`, `<service>.<namespace>`, `<template>-<statefulset>-<ordinal>`.
2. **p107 has no dpkg dependency caveat, so its VERIFY can look like a failure on Killercoda.** The page says YOU SEE "Setting up cri-dockerd ..." and VERIFY expects "ii cri-dockerd". If dpkg stops on unmet dependencies, the beginner sees "iU" and thinks they failed. Fix: copy page 306's line, "on Killercoda it may stop with dependency errors (state iU) - note them and continue".

Nothing else found would make a beginner fail. Every setup script I checked creates the described state. Commands, flags, names and namespaces are correct for v1.35, and steps, VERIFY and MEMORISE agree on every page.

## Verdict
Average **4.86 / 5**, up from about 3.6 in round one. No page scores 3 or lower. 38 pages score 5 and 6 score 4.
The remaining defects are one renderer bug (stripped `<...>` placeholders, 3 pages) and one missing playground caveat (page 107). No technical CKA errors remain.
After those two quick fixes the set is ready. Pages 206 and 306 will stay "rehearse only" on Killercoda, and their text says so honestly.
