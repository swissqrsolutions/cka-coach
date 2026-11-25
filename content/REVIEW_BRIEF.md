# Review brief — CKA Coach (English only)

The user found a page where a box did not match the question (Q3: "Remember" showed generic `describe node` / `get pvc`, but Q3 is solved with `set resources`). That is now fixed in the app (Remember = the question's own step commands). Your job: make sure NOTHING else on any page of your questions misleads like that.

## For every question/task in your range, read the whole page content and check
1. **Question ↔ solution:** do the steps actually solve exactly what the question asks (names, namespace, values, file paths, output format)? Is any required part missing?
2. **Plan line** (content/coach.json "plan"): every arrow matches a real step, same order, same values. No action that no step does.
3. **Outputs ("You see")**: plausible for that exact command on current Kubernetes (v1.37 exam); same names/values as the question; arrow notes point at the right thing. If an output is a made-up summary, rewrite it as a short realistic excerpt with "..." for varying parts, and add "(shortened)" to the line before it ("You see (shortened):" is NOT allowed — the parser needs "You see:" exactly; put "Shortened:" as a sentence above "You see:" instead, separated by a blank line).
4. **Hidden data in coach.json** (clues, traps, verify, memorise): every command must appear in the steps (or the task's verify list) with the same names, values and quoting; placeholders like `<highest-1>` are fine where the step computes the value. Remove or rewrite anything that teaches a different method than the steps.
5. **"If something goes wrong" table and New words**: every row fits this question (no rows about other scenarios); New words don't repeat terms the steps explain.
6. **Keyword hints (content/keywords.json)** are no longer shown; ignore them.
7. **Command form**: `k` everywhere (the exam has `alias k=kubectl`) — in mocks.json steps replace a leading `kubectl ` by `k ` (also inside multi-line command blocks and in pipes like `| kubectl apply` → `| k apply`). Official-docs form: TYPE NAME for get/describe/delete/label/annotate/patch/taint/expose/autoscale; TYPE/NAME for set/rollout/scale/edit/logs on non-pods/wait; full type names except pv, pvc, hpa, rs, crd; `-n <ns>` last. Do not change outputs.
8. **Correctness**: flags/flags values valid on current kubectl/etcd/helm/kubeadm (check the official docs with WebFetch when unsure).

## Writing safely (other reviewers edit the same files)
- Every write to content/cka-guide.md, content/coach.json, content/mocks.json: `mkdir C:/code/cka-coach/content/.lock` (retry after 5 s if it exists) → re-read → exact string replacements in Python (no regex alternation with `|`, no character splitting) → write → `rmdir` the lock. JSON format unchanged (indent 1, ensure_ascii=False, same trailing newline).
- Never git checkout/stash/reset. Do not commit. Do not edit site/ or tools/.
- Run `node tools/build.mjs` at the end (88 questions).

## Report
A table: question | problems found | what you changed. Then a list of anything you could not verify. Be concrete (old → new). If a question is fine, say "ok".
