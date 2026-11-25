# Layout rollout brief (approved Q2 layout) — CKA Coach, English only

Reference: question 2 (content/cka-guide.md "## 2. " section, content/coach.json key "2"). See its changes with `git -C C:/code/cka-coach log --oneline -6` and `git show <commit> -- content/cka-guide.md content/coach.json`. Read tools/build.mjs (flowOf) to understand how code blocks become commands / output / YAML. Do not edit site/ or tools/ — the app renders the new layout for every question whose coach entry has a "plan".

## Per question
1. **coach.json "plan"**: ONE English line, arrow chain of the solution, like Q2: "CrashLoopBackOff → logs --previous → describe (Command, Exit Code) → edit deployment → RESTARTS stays 0". Trigger → 3–5 key actions (decisive detail in brackets) → proof. If the question has no coach entry yet, create `{"plan": "..."}` for it.
2. **Arrow notes** in output / YAML blocks: very short ("<-- RESTARTS", "<-- cmd", "<-- failed", "<-- name", "# <-- CHANGE"), no wide gaps before them, so lines fit 390px (~36 monospace chars visible). Never change real YAML indentation or real output columns. If a note still doesn't fit, remove it from the block and write it as its own sentence ABOVE the block (Q2: "Only the last line changes, `exit 1` becomes `sleep 3600`:"). Parser rule: the text line directly before a code block decides its type — "You see:" must stay directly before an output block; leave a blank line between a new note paragraph and "You see:".
3. **New words** ("Three words first" / words): remove terms a step already explains; keep the rest.
4. **Hidden data**: coach.json traps / clues / verify / memorise must match the steps (same commands, values, YAML form). Fix mismatches.
5. Commands keep the official-docs form (TYPE NAME for get/describe/delete/label/annotate/patch/taint/expose/autoscale; TYPE/NAME for set/rollout/scale/edit/logs-on-non-pod/wait; full type names except pv, pvc, hpa, rs, crd; `-n` last). Don't change meaning, outputs or setup.

## Mock questions (101–116, 201–216, 301–316)
Their steps live in content/mocks.json (read tools/build.mjs to see the fields). Same rules: plan line in coach.json under the mock's number, short arrow notes in mocks.json outputs, consistency of coach.json data with the mock's steps.

## Writing safely (several writers edit the same files in parallel)
- For EVERY write to content/cka-guide.md, content/coach.json or content/mocks.json: `mkdir C:/code/cka-coach/content/.lock` (if it fails, wait 5 s and retry) → re-read the file → apply exact string replacements (Python, no regex alternation with `|`, no character-level splitting) → write → `rmdir C:/code/cka-coach/content/.lock`. Hold the lock only for that read-modify-write.
- JSON: keep the format (indent 1, ensure_ascii=False, same trailing newline).
- Never `git checkout`, `git stash`, `git reset`. Do not commit.

## Check
- `node tools/build.mjs` must finish (88 questions).
- Screenshots at 390px with your OWN ports (given in your task): `python -m http.server <PORT> --directory site` (background) and Chrome headless `--remote-debugging-port=<DPORT> --user-data-dir=<new scratch folder>`; copy `C:/Users/Sara/AppData/Local/Temp/claude/cbce6fdd09c70e4b/cbfc5492-629a-41b6-8555-d9a012363df3/scratchpad/shot2.mjs` to your own scratch file and replace 9333 and 8770 in it with your ports; run it with `<outdir> qN=/q/N:light ...`. Read the PNGs, fix cut-off notes or layout problems. Stop only YOUR server and YOUR Chrome afterwards.
- Report per question: plan line, notes shortened/moved, words removed, data mismatches fixed, anything unsure.
