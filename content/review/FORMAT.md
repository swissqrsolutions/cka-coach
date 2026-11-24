# Question format (approved on Q6)

The model answer is `content/review/q6-compact.md`. Copy its structure exactly.

## Markdown skeleton (the app parses these exact headings and labels)

```
## N. Title                      (keep the old title and any ★ exactly)

### PART B. The exam starts here
**The question, as the exam words it:**

> (the exam question, verbatim from the old version)

**What the question is really saying:**

(ONE line)

**Write down from the question:** a · b · c     (keep it; the app hides it, but the builder needs it)

---

### Think
- **Broken:** / **Wanted:**  (idea, no full command)
- **Look first:** (idea, no full command)
- **Expect:** (the symptom, may be a short token like `<none>`)
- **Fix:** (idea)
- **Prove:** (idea)

### Time budget

Target N min. Skip at M.

---

### PART A. Build the exam (Killercoda only)

(one code block, from the current version; keep it unless broken: idempotent, ends with `clear` and one check command)

---

### Step 1. Short question-like title

**Why:** one line.

(code block with the command(s) that belong together)
You see:
(code block: a REAL output line, shortened only with ..., key part marked `<-- note`)
**Means:** the conclusion, one line.
**Don't:** optional, at most one, only where the mistake happens.

---
(more steps)

### Verify

**Why:** one line.
(command block)
You see:
(real output)
**Don't:** optional

---

### Three words first
- only words that are NEW for this question (not Pod, Deployment, Namespace, Label, Service, Node, k: those are on the global Basics page)

---

### If something goes wrong

| You see | Cause | Fix |
|---|---|---|
(at most 5 rows; rare problems only; never repeat a step's Don't or Means)
```

No `### Mug this up` section (its absence switches the app to the new layout). No "Opening routine" / "Closing routine" sections (the app adds the ssh/exit line itself). No extra sections.

## Rules

1. Page order as above: question + 1-line meaning, Think, Part A, steps, Verify, then the folded help (story line comes from data, not from you).
2. Each step: Why → command → You see → Means → optional Don't (max 1). Every step that changes something has a "You see".
3. 4–6 steps. Up to 8 for multi-node tasks (upgrade, node tasks). Group commands that belong together in one step.
4. "You see" must be a real output line, shortened only with `...`, the key part marked `<--`. Never invent a header line. If unsure of the exact text on v1.35, write the line you are sure of and add nothing invented.
5. YAML: show it in full so it can be copied (it is in its own code block in the step). Mark only changed lines with `# <-- CHANGE`. Name the kubernetes.io docs page title in the Why line.
6. "Need help?" = Three words first (new words only) + the table (max 5 rows, no repeats).
7. Think: max 5 lines, names ideas, not full commands.
8. About 350 visible words in Learn mode, not counting YAML and Part A. Short sentences, max 15 words, one idea each.
9. The line before an output code block must be exactly `You see:`. Command blocks must start with a real command (`k`, `ssh`, `systemctl`, `crictl`, `vim`, `cat`, `helm`, `etcdctl`, ...).
10. In the real exam the reader runs `ssh` first; for node tasks the step itself says `ssh node01` and later `exit`.
