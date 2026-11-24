// CKA Coach — practice every task, then sit three timed mock exams. Plain JS, works offline.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('cka:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cka:' + k, JSON.stringify(v)); } catch {} },
  };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const KILLERCODA = 'https://killercoda.com/playgrounds/scenario/cka';
  const DOCS = 'https://kubernetes.io/docs/';
  const app = $('#app');
  let D = null;

  // ---------- offline + updates ----------
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
  }

  // ---------- install prompt (Android / Chrome); iPhone gets instructions ----------
  let installEvt = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (location.hash === '' || location.hash === '#/') render(); });
  const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  // ---------- theme ----------
  $('#theme').onclick = () => {
    const dark = (document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
    const t = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = t; store.set('theme', t);
  };

  // ---------- small helpers ----------
  window.CKAToast = t => toast(t);
  if (window.CKANative) document.documentElement.classList.add('native');
  function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2200); }
  document.addEventListener('click', async e => {
    // inside the Android app: Killercoda opens in the top half, Copy sends the command into that terminal
    const kc = e.target.closest('a[href^="https://killercoda.com"]');
    if (kc && window.CKANative) { e.preventDefault(); CKANative.openTerminal(kc.href); return; }
    const b = e.target.closest('.copy'); if (!b) return;
    if (window.CKANative) { CKANative.run(b.parentElement.querySelector('code').innerText); toast('Sent to the terminal. Press Enter there.'); return; }
    const txt = b.parentElement.querySelector('code').innerText;
    try { await navigator.clipboard.writeText(txt); } catch { const ta = document.createElement('textarea'); ta.value = txt; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    b.textContent = 'Copied'; b.classList.add('done'); setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1500);
  });
  const codeBlock = txt => `<div class="code"><button class="copy" type="button">Copy</button><pre><code>${esc(txt).replace(/&lt;(?!none&gt;)([a-zA-Z][^&]{0,44}?)&gt;/g, '<mark class="ph">&lt;$1&gt;</mark>')}</code></pre></div>`;
  const Q = n => D.questions.find(x => x.n === n);
  const PQ = () => D.questions.filter(x => x.n <= 40);
  const prog = () => store.get('progress', {});
  const statusOf = n => (prog()[n] || {}).st || '';
  const ST = { solo: '✓ alone', help: '✓ with hints', fail: '✗ not yet' };
  const topicShort = t => t.charAt(0) + t.slice(1).toLowerCase();

  // ---------- timer in the header (mock exams) ----------
  let tick = 0;
  function headerTimer() {
    clearInterval(tick);
    const el = $('#timer');
    const active = [1, 2, 3].map(m => ({ m, s: store.get('mock' + m, null) })).find(x => x.s && x.s.deadline && !x.s.finished);
    if (!active) { el.hidden = true; return; }
    const upd = () => {
      const left = Math.max(0, active.s.deadline - Date.now());
      const mm = Math.floor(left / 60000), ss = Math.floor(left / 1000) % 60;
      el.textContent = `Mock ${active.m} · ${mm}:${String(ss).padStart(2, '0')}`;
      el.classList.toggle('low', left < 15 * 60000);
      if (left === 0) { clearInterval(tick); el.textContent = `Mock ${active.m} · time is up`; }
    };
    el.hidden = false; upd(); tick = setInterval(upd, 1000);
    el.onclick = () => location.hash = `#/mock/${active.m}`;
  }

  // ---------- views ----------
  function installCard() {
    return isInstalled() ? '' : installEvt
      ? `<div class="card install"><p><b>Install CKA Coach</b><br><span class="small">Open it from your home screen, works offline.</span></p><button class="btn" id="installBtn">Install</button></div>`
      : isIOS ? `<div class="card install"><p><b>Install:</b> tap Share, then <b>Add to Home Screen</b>.</p></div>`
      : `<div class="card install"><p><b>Install:</b> Chrome menu ⋮ → <b>Add to Home screen</b> → Install.</p></div>`;
  }
  function home() { // the Practice tab
    const p = prog(), solo = PQ().filter(q => (p[q.n] || {}).st === 'solo').length;
    const groups = D.topics.map(t => {
      const qs = PQ().filter(q => q.topic === t.name);
      return `<h2>${esc(topicShort(t.name))} <span class="chip">${t.weight}% of exam</span></h2>
        <div class="card"><ul class="qlist">${qs.map(q => `<li><a href="#/q/${q.n}"><span class="num">${q.n}</span><span>${esc(q.title)}</span><span class="st ${statusOf(q.n)}">${ST[statusOf(q.n)] || ''}</span></a></li>`).join('')}</ul></div>`;
    }).join('');
    const weak = Object.entries(store.get('weak', {})).filter(([n]) => Q(+n));
    const weakCard = weak.length ? `<h2>Weak list <span class="chip bad">over target time</span></h2><div class="card"><ul class="qlist">${weak.map(([n, w]) => `<li><a href="#/q/${n}"><span class="num">${n}</span><span>${esc(Q(+n).title)}</span><span class="st fail">${Math.floor(w.sec / 60)}:${String(w.sec % 60).padStart(2, '0')} / ${Q(+n).target}:00</span></a></li>`).join('')}</ul></div>` : '';
    app.innerHTML = `${installCard()}${weakCard}<h1>Practice</h1><a class="btn ghost block" href="#/cheat">Cheat sheet (commands, YAML from docs, facts, warm-up)</a><p class="sub">40 questions · ${solo} solved alone. Open one, set it up in Killercoda, solve it.</p>${groups}`;
    if ($('#installBtn')) $('#installBtn').onclick = async () => { installEvt.prompt(); await installEvt.userChoice; installEvt = null; render(); };
  }
  function cheatPage() {
    const secs = D.refs.filter((r, i) => i > 0).concat(D.topics.map(t => ({ title: 'How to solve: ' + topicShort(t.name), html: t.intro })));
    app.innerHTML = `<a href="#/" class="small">← Practice</a><h1>Cheat sheet</h1><p class="sub">Everything from your guide. Tap a section to open it.</p>
      ${secs.map(r => `<details class="step"><summary>${esc(r.title.replace(/^\d[A-Z]?\.\s*/, '').replace(/^./, c => c.toUpperCase()).toLowerCase().replace(/^./, c => c.toUpperCase()))}</summary><div class="body btable">${r.html}</div></details>`).join('')}`;
  }
  function mocksPage() { // the Mock exams tab
    const cards = [1, 2, 3].map(m => {
      const s = store.get('mock' + m, null);
      const state = !s ? 'Not started' : s.finished ? `Score ${s.score}% · ${s.score >= 66 ? 'PASS' : 'below 66%'}` : 'In progress';
      return `<a class="card mock" href="#/mock/${m}"><span><b>Mock exam ${m}</b><br><span class="small">16 tasks · 2 hours · ${state}</span></span><span class="chip ${s && s.finished && s.score >= 66 ? 'good' : ''}">${s && s.finished ? s.score + '%' : s ? 'Open' : 'Start'}</span></a>`;
    }).join('');
    app.innerHTML = `<h1>Mock exams</h1><p class="sub">Like the real exam: 2 hours, pass at 66%. Do them after the practice questions.</p>${cards}
      <h2>Exam day: before you start</h2><table class="bt">
        <tr><td>Where</td><td>PSI secure browser: question panel, a terminal, Firefox (only kubernetes.io/docs). Not Killercoda.</td></tr>
        <tr><td>Already set up</td><td><code>k</code> = kubectl, Tab completion. Don't make aliases.</td></tr>
        <tr><td>Copy / paste</td><td><code>Ctrl+Shift+C</code> / <code>Ctrl+Shift+V</code> in the terminal</td></tr>
        <tr><td>Every question</td><td><code>ssh</code> line → <code>k get nodes</code> → solve → verify → <code>exit</code></td></tr>
        <tr><td>Time</td><td>80 min all questions (skip after 8 min) · 40 min flagged + re-check</td></tr>
        <tr><td>Rehearsal</td><td>2 killer.sh sessions are included: use them in the last week</td></tr></table>`;
  }

  function topicView(i) {
    const t = D.topics[i], p = prog();
    const qs = PQ().filter(q => q.topic === t.name);
    app.innerHTML = `<a href="#/" class="small">← Home</a><h1>${esc(topicShort(t.name))}</h1><p class="sub">${t.weight}% of the exam · ${qs.length} tasks</p>
      <div class="card"><ul class="qlist">${qs.map(q => `<li><a href="#/q/${q.n}"><span class="num">${q.n}</span><span>${esc(q.title)} ${q.star ? '<span class="chip star">often in exam</span>' : ''}</span><span class="st ${statusOf(q.n)}">${ST[statusOf(q.n)] || ''}</span></a></li>`).join('')}</ul></div>
      `;
  }

  // the "dissect" game: tap the words that matter in the exam question
  function dissect(q, el) {
    const want = new Set();
    for (const k of q.keys) {
      const v = (k.split('=')[1] || k).replace(/`/g, '').toLowerCase();
      for (const w of v.split(/[^a-z0-9.\-/:]+/)) if (w.length > 1 && !['the', 'a', 'an', 'so', 'to', 'it', 'of', 'in', 'is', 'on', 'and', 'or', 'for'].includes(w)) want.add(w);
      if (/not|no /.test(v)) want.add('not').add('do');
      if (/reboot/.test(v)) want.add('reboot');
    }
    const parts = q.question.split(/(\s+)/);
    el.innerHTML = parts.map(p => /^\s+$/.test(p) ? p : `<span class="tok" data-w="${esc(p.replace(/`/g, '').replace(/[.,;:()]+$/, '').toLowerCase())}">${inline(p)}</span>`).join('');
    $$('.tok', el).forEach(t => t.onclick = () => t.classList.toggle('sel'));
    return () => {
      // score each important word once, even if it appears several times in the question
      const toks = $$('.tok', el), found = new Set(toks.filter(t => t.classList.contains('sel') && want.has(t.dataset.w)).map(t => t.dataset.w));
      const present = new Set(toks.map(t => t.dataset.w).filter(w => want.has(w)));
      toks.forEach(t => {
        t.classList.remove('sel');
        if (want.has(t.dataset.w)) t.classList.add(found.has(t.dataset.w) ? 'hit' : 'miss');
      });
      return { hit: found.size, miss: present.size - found.size };
    };
  }

  // ================= LEARN: question page · ▶ animated explainer · in-app terminal · split-screen guide =================
  const plain = h => { const d = document.createElement('div'); d.innerHTML = String(h || ''); return d.textContent.replace(/\s+/g, ' ').trim(); };
  const short = h => { const t = plain(h); if (t.length <= 170) return t; const two = (t.match(/^(.*?[.!?])\s.*?[.!?](\s|$)/) || [])[0] || t; return two.length > 170 ? (t.match(/^.*?[.!?](\s|$)/) || [t])[0].slice(0, 170).trim() : two.trim(); };
  const shortH = h => plain(h).length <= 170 ? String(h) : esc(short(h));
  const cmdsOf = q => q.steps.flatMap((s, si) => s.flow.map((f, fi) => ({ ...f, si, fi }))).filter(f => f.k === 'cmd' && !f.skip);
  const PARTS = [
    ['you', 'You · kubectl'], ['api', 'API server'], ['etcd', 'etcd'],
    ['sched', 'Scheduler'], ['cm', 'Controllers'], ['access', 'RBAC'],
    ['kubelet', 'Node · kubelet'], ['pod', 'Pod'], ['svc', 'Service'],
    ['net', 'Network'], ['dns', 'DNS'], ['store', 'Storage'], ['tools', 'Helm · CRD'],
  ];
  const picture = q => `<div class="pic ${q.pic.mode}">${PARTS.map(([k, l], i) => `<div class="part p-${k} ${q.pic.parts.includes(k) ? 'on' : ''}" style="--i:${i}">${l}</div>`).join('')}</div>`;

  let watchGen = 0;
  const useful = f => f.k === 'say' && !/:\s*$/.test(short(f.h));
  const BAD = /(ImagePullBackOff|ErrImagePull|CrashLoopBackOff|CreateContainerConfigError|OOMKilled|Pending|NotReady|Unknown|inactive \(dead\)|auto-restart|refused|timed out|Exited|Error|Failed\w*|failed|Insufficient \w+|untolerated taint|&lt;none&gt;|No resources found|forbidden)/g;
  const GOOD = /(\bRunning\b|\bReady\b|\bBound\b|\bAvailable\b|active \(running\)|Welcome to nginx!|\b1\/1\b|\b2\/2\b|\(default\)|\byes\b|edited|created|configured|rolled back)/g;
  const paint = t => esc(t).replace(BAD, '<b class="bad">$1</b>').replace(GOOD, '<b class="good">$1</b>');
  // exam coaching: the pattern, the clues in the question, traps, verification, the fast version
  const coachTop = c => `<h2>Spot the pattern</h2><div class="card pattern"><div class="ptag">${esc(c.pattern)}</div>
    ${(c.clues || []).map(x => `<div class="clue"><mark>${esc(x.q)}</mark><span>→ ${esc(x.means)}</span></div>`).join('')}</div>`;
  const coachBottom = (c, q) => `<h2>Traps to avoid</h2><div class="card traps">${(c.traps || []).map(t => `<div class="trap">⚠ ${esc(t)}</div>`).join('')}</div>
    <h2>Verify against the question</h2><div class="card">${(c.verify || []).map(v => `<div class="vrow"><div class="need">✔ ${esc(v.need)}</div>${codeBlock(v.cmd)}<div class="bsee">You must see: <code>${esc(v.see)}</code></div></div>`).join('')}</div>
    <h2>Memorise: the fast version</h2><div class="card">${codeBlock((c.memorise || []).join('\n'))}<p class="small">Target: ${c.minutes || q.target} min in the exam. Type it from memory once a day.</p></div>`;
  const PH = [
    [/^(pod|pod-name|first-row-pod-name|pending-pod-name)$/i, "the pod's real name: first column of <code>k get pods -n &lt;namespace&gt;</code> (looks like <code>api-697db8cc78-hgvdr</code>). Type the first letters and press Tab."],
    [/^(id|container-id)$/i, 'the container ID: first column of the <code>crictl ps -a</code> output (top line).'],
    [/^highest-1$/i, 'the highest value in <code>k get pc</code> (ignore the system- ones) minus 1.'],
    [/^(X|Y)$/i, 'the number you worked out in the step above.'],
    [/^(ip|pod IP)$/i, 'the IP column of <code>k get pods -o wide -n &lt;namespace&gt;</code>.'],
    [/^node$/i, 'the node name from <code>k get nodes</code>.'],
    [/^old$/i, 'the old name or value shown in the question or the previous output.'],
    [/URL/i, 'the URL written in the question: copy it from there.'],
    [/^(cluster-cidr|podSubnet|YOUR-podSubnet)$/i, 'the pod network range: <code>k -n kube-system get pod -l component=kube-controller-manager -o yaml | grep cluster-cidr</code>.'],
    [/^secret$/i, 'the Secret name from the question (or <code>k get secret -n &lt;namespace&gt;</code>).'],
    [/^same as PV$/i, 'the same value the PV shows in <code>k get pv</code>.'],
    [/^old PV name$/i, 'the PV name from <code>k get pv</code>.'],
    [/^svc-clusterIP$/i, 'the CLUSTER-IP column of <code>k get svc -n &lt;namespace&gt;</code>.'],
  ];
  const phNotes = cmds => {
    const found = [...new Set(cmds.join('\n').match(/<(?!none>)[a-zA-Z][^<>]{0,44}>/g) || [])];
    if (!found.length) return '';
    return `<div class="phnote">${found.map(p => { const k = p.slice(1, -1), hit = PH.find(([re]) => re.test(k)); return `<p>Replace <mark class="ph">${esc(p)}</mark> with ${hit ? hit[1] : 'the real value from the output above or from the question.'}</p>`; }).join('')}</div>`;
  };
  const BASICS = `<details class="step basics"><summary>New here? The basics</summary><div class="body">
    <table class="bt"><tr><th colspan="2">Words</th></tr>
      <tr><td><code>k</code></td><td>kubectl, the command for everything</td></tr>
      <tr><td>Pod</td><td>your app, running</td></tr>
      <tr><td>Deployment</td><td>"always run N pods": fix this, not the pod</td></tr>
      <tr><td>Node</td><td>a machine (controlplane, node01)</td></tr>
      <tr><td>Namespace</td><td>a folder: always add <code>-n name</code></td></tr>
      <tr><td>Service</td><td>fixed address in front of pods</td></tr>
      <tr><td>Label</td><td>a tag like <code>app=web</code></td></tr>
      <tr><td><mark class="ph">&lt;name&gt;</mark></td><td>put the real name here</td></tr></table>
    <table class="bt"><tr><th colspan="2">vim keys</th></tr>
      <tr><td><code>i</code></td><td>start typing</td></tr>
      <tr><td><code>Esc</code></td><td>stop typing</td></tr>
      <tr><td><code>:wq</code> Enter</td><td>save and quit</td></tr>
      <tr><td><code>:q!</code> Enter</td><td>quit, don't save</td></tr>
      <tr><td><code>dd</code> / <code>u</code></td><td>delete line / undo</td></tr>
      <tr><td><code>:set paste</code></td><td>before pasting YAML</td></tr></table>
    <table class="bt"><tr><th colspan="2">If…</th></tr>
      <tr><td>"k: command not found"</td><td><code>alias k=kubectl</code></td></tr>
      <tr><td>"No resources found"</td><td>you forgot <code>-n</code></td></tr>
      <tr><td>node task in the real exam</td><td><code>sudo -i</code> first</td></tr>
      <tr><td>YAML</td><td>spaces only, 2 per level</td></tr>
      <tr><td>long name</td><td>type 3 letters + Tab</td></tr></table>
  </div></details>`;
  // compact page: question + meaning → Think → Part A → steps (command + you see) → verify; the rest folded in "Need help?"
  // Exam mode: count up against the question's target time; over it → the weak list
  let qTick = 0;
  function examTimer(q) {
    const el = $('#qt'), lim = q.target * 60;
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const cur = () => { const t = store.get('qtimer', null); return t && t.n === q.n ? t : null; };
    const setWeak = (on, sec) => { const w = store.get('weak', {}); if (on) w[q.n] = { sec, at: Date.now() }; else delete w[q.n]; store.set('weak', w); };
    const upd = () => {
      const t = cur(); if (!t) { el.textContent = `0:00 / ${fmt(lim)}`; return; }
      const sec = Math.floor(((t.end || Date.now()) - t.start) / 1000);
      el.textContent = `${fmt(sec)} / ${fmt(lim)}`;
      el.classList.toggle('over', sec > lim);
      if (sec > lim && !t.flagged) { t.flagged = true; store.set('qtimer', t); setWeak(true, sec); toast('Over the target time: added to your weak list.'); }
    };
    $('#qtStart').onclick = () => { store.set('qtimer', { n: q.n, start: Date.now() }); clearInterval(qTick); qTick = setInterval(upd, 1000); upd(); };
    $('#qtDone').onclick = () => {
      const t = cur(); if (!t || t.end) return;
      t.end = Date.now(); store.set('qtimer', t); clearInterval(qTick); upd();
      const sec = Math.floor((t.end - t.start) / 1000);
      if (sec <= lim) { setWeak(false); toast(`Done in ${fmt(sec)}: within the target.`); } else toast(`Done in ${fmt(sec)}: over the target. Practise it again.`);
    };
    const t = cur(); if (t && !t.end) qTick = setInterval(upd, 1000);
    upd();
  }

  function compactBody(q, mode = 'learn') {
    const c = q.coach || {};
    const tick = t => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
    const steps = q.steps.map((s, i) => {
      const items = s.flow.filter(f => !f.skip);
      const cmds = items.filter(f => f.k === 'cmd').map(f => f.t);
      const outs = items.filter(f => f.k === 'out').map(f => f.t);
      const yamls = items.filter(f => f.k === 'yaml').map(f => f.t);
      const why = items.filter(f => f.k === 'say' && /^💡/.test(plain(f.h))).map(f => `<div class="why">${f.h}</div>`).join('');
      const v = /^Verify/.test(s.title);
      const inner = `${cmds.length ? codeBlock(cmds.join('\n')) + phNotes(cmds) : ''}
        ${yamls.map(y => codeBlock(y)).join('')}
        ${outs.length ? `<div class="bsee">You see:</div><pre class="out">${paint(outs.join('\n'))}</pre>` : ''}`;
      return `<div class="bstep${v ? ' verify' : ''}"><div class="bnum">${v ? '✓' : i + 1}</div><div class="bbody">
        <b>${esc(s.title.replace(/^Step \d+\.\s*/, ''))}</b>
        ${mode === 'practise' ? `${why}<details class="reveal"><summary>Show command</summary>${inner}</details>` : inner + why}
      </div></div>`;
    }).join('');
    const thinkCard = q.think ? `<section class="card think"><div class="label">Think (15 seconds)</div>${q.think}${q.budget ? `<p class="budget">⏱ ${esc(q.budget)}</p>` : ''}</section>` : '';
    const build = `<h2>Build it in Killercoda</h2>
      <div class="card">${q.setup ? `<a class="btn block" href="${KILLERCODA}" target="_blank" rel="noopener">Open Killercoda</a>${codeBlock(q.setup)}` : '<p class="small">Cannot be built in a playground. Practise in killer.sh.</p>'}</div>`;
    const examNote = `<p class="small">Real exam: run the question's <code>ssh</code> line first, <code>exit</code> at the end.</p>`;
    if (mode === 'exam') return `<section class="card exam"><div class="label">Exam question</div><p class="q">${inline(q.question)}</p></section>
      ${build}
      <div class="card qtimer"><div><div class="label">Your time</div><span id="qt">0:00</span></div><div class="row"><button class="btn" id="qtStart">Start</button><button class="btn good" id="qtDone">Done</button></div>
        <p class="small">Paste Part A, then Start. Solve it without looking. Over ${q.target} min puts it on your weak list.</p></div>
      ${examNote}
      <details class="step"><summary>Show the solution</summary><div class="body">${thinkCard}${steps}</div></details>`;
    const traps = (c.traps || []).map(t => typeof t === 'string' ? `<div class="trap">⚠ ${tick(t)}</div>` : `<div class="trap pair"><div class="dont">❌ <b>Don't:</b> ${tick(t.dont)}</div><div class="do">✅ <b>Do:</b> ${tick(t.do)}</div></div>`).join('');
    const st = q.story || {};
    return `<section class="card exam"><div class="label">Exam question</div><p class="q">${inline(q.question)}</p>
        ${q.meaning ? `<div class="means">${q.meaning}</div>` : ''}</section>
      ${thinkCard}
      ${build}
      <h2>Solve it</h2>
      ${mode === 'practise' ? '<p class="small">Type each command yourself. Tap "Show command" only to check.</p>' : ''}
      ${steps}
      ${examNote}
      <details class="step needhelp"><summary>Need help?</summary><div class="body">
        ${q.keys && q.keys.length ? `<div class="writedown"><b>Write down:</b> ${q.keys.map(k => `<span class="chip">${inline(k)}</span>`).join(' ')}</div>` : ''}
        ${st.broken ? `<h3>The story</h3><p>${esc(st.broken)}</p>${st.fix ? `<p>${esc(st.fix)}</p>` : ''}` : ''}
        ${c.pattern ? `<h3>Spot the pattern</h3><div class="pattern"><div class="ptag">${esc(c.pattern)}</div>${(c.clues || []).map(x => `<div class="clue"><mark>${esc(x.q)}</mark><span>→ ${esc(x.means)}</span></div>`).join('')}</div>` : ''}
        ${traps ? `<h3>Watch out</h3><div class="traps">${traps}</div>` : ''}
        ${q.wrong ? `<h3>If something goes wrong</h3><div class="btable">${q.wrong}</div>` : ''}
        ${q.words ? `<h3>Words</h3>${q.words}` : ''}
        ${BASICS}
      </div></details>`;
  }

  // the whole answer in baby steps: one command, what you see, why
  function solution(q) {
    const plainWords = q.meaning || (q.story && q.story.broken ? esc(q.story.broken) : '');
    const steps = q.steps.map((s, i) => {
      const items = s.flow.filter(f => !f.skip);
      const cmds = items.filter(f => f.k === 'cmd').map(f => f.t + (f.note ? '      # ' + f.note : ''));
      const yamls = items.filter(f => f.k === 'yaml').map(f => f.t);
      const outs = items.filter(f => f.k === 'out').map(f => f.t);
      const whys = items.filter(f => f.k === "say" && plain(f.h).length > 2), why = whys[0];
      if (!cmds.length && !outs.length && !why && !yamls.length) return '';
      return `<div class="bstep"><div class="bnum">${i + 1}</div><div class="bbody">
        <b>${esc(s.title.replace(/^Step \d+\.\s*/, '').replace('Closing routine', 'Check it works'))}</b>
        ${cmds.length ? codeBlock(cmds.join('\n')) + phNotes(cmds) : ''}
        ${yamls.map(y => `<div class="bsee">File content (YAML: spaces matter, 2 per level, never Tab):</div>${codeBlock(y)}`).join('')}
        ${outs.length ? `<div class="bsee">You see:</div><pre class="out">${paint(outs.join('\n'))}</pre>` : ''}
        ${items.filter(f => f.k === 'tbl').map(f => `<div class="btable">${f.h}</div>`).join('')}
        ${whys.length ? `<div class="bwhy">${whys.map(w => `<p>${w.h}</p>`).join("")}</div>` : ''}
      </div></div>`;
    }).join('');
    const c = q.coach || {};
    const sshLine = (q.question.match(/^ssh \S+/) || [])[0];
    // traps as Don't / Do pairs (old plain-string traps still shown as one line)
    const tick = t => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>');
    const traps = (c.traps || []).length ? `<h2>Watch out</h2><div class="card traps">${c.traps.map(t => typeof t === 'string' ? `<div class="trap">⚠ ${tick(t)}</div>` : `<div class="trap pair"><div class="dont">❌ <b>Don't:</b> ${tick(t.dont)}</div><div class="do">✅ <b>Do:</b> ${tick(t.do)}</div></div>`).join('')}</div>` : '';
    const verify = (c.verify || []).length ? `<h2>Verify against the question</h2><div class="card">${c.verify.map(v => `<div class="vrow"><div class="need">✔ ${esc(v.need)}</div>${codeBlock(v.cmd)}<div class="bsee">You must see: <code>${esc(v.see)}</code></div></div>`).join('')}</div>` : '';
    const memorise = (c.memorise || []).length ? `<h2>Memorise: the fast version</h2><div class="card">${codeBlock(c.memorise.join('\n'))}<p class="small">Target: ${c.minutes || q.target} min in the exam. Type it from memory once a day.</p></div>` : '';
    const solveBlock = `
      <div class="bstep routine"><div class="bnum">0</div><div class="bbody"><b>Start of every question</b>
        <div class="bwhy"><p><b>In Killercoda:</b> nothing to log into, you're already on the right machine. Just check:</p></div>
        ${codeBlock('k get nodes')}
        <div class="bwhy"><p><b>In the real exam only:</b> each question shows its own login line at the top${sshLine ? `, here <code>${sshLine}</code>` : ', e.g. <code>ssh cka01001</code>'}. Type that first, then <code>k get nodes</code>. If you see <code>localhost:8080 refused</code>, you're on the wrong machine.</p></div></div></div>
      ${steps}
      <div class="bstep routine"><div class="bnum">✓</div><div class="bbody"><b>End of every question</b><div class="bwhy"><p><b>In Killercoda:</b> nothing to do; just verify (below).</p><p><b>In the real exam only:</b> after verifying, type <code>exit</code> to leave this question's machine. The next question's ssh line only works from the base machine.</p></div></div></div>
      ${verify}`;
    const tried = !!(prog()[q.n] || {}).st;
    return `${BASICS}
      ${plainWords ? `<h2>In plain words</h2><div class="card plain">${plainWords}</div>` : ''}
      ${q.words ? `<h2>Words you need</h2><div class="card plain">${q.words}</div>` : ''}
      ${q.coach ? coachTop(c) : ''}
      ${traps}
      <h2>Set up in Killercoda, then try it yourself</h2>
      <div class="card">${q.setup ? `<a class="btn block" href="${KILLERCODA}" target="_blank" rel="noopener">Open Killercoda</a>${codeBlock(q.setup)}<p class="small">Paste this first. In the real exam it is already set up. Then try to solve it before you look below.</p>` : `${/no setup needed/i.test(plain(q.meaning||'')) ? '<a class="btn block" href="'+KILLERCODA+'" target="_blank" rel="noopener">Open Killercoda</a><p class="small">No setup needed: it works as is on Killercoda. Try it before you look below.</p>' : '<p class="small">This one cannot be set up in a playground. Read the steps; practise it in killer.sh.</p>'}`}</div>
      ${tried ? `<details class="step solution"><summary>Try first, then show the solution</summary><div class="body">${solveBlock}</div></details>` : `<h2>Solution, step by step</h2>${solveBlock}`}
      ${q.wrong ? `<h2>If something goes wrong</h2><div class="card btable">${q.wrong}</div>` : ''}
      ${memorise}`;
  }

  function practice(n) {
    const q = Q(n); if (!q) return home();
    const p = prog()[n] || {};
    const back = q.mock ? `<a href="#/mock/${q.mock}" class="small">← Mock exam ${q.mock}</a>` : `<a href="#/" class="small">← Practice</a>`;
    const label = q.mock ? `Mock ${q.mock} · task ${q.n % 100}` : q.n;
    clearInterval(qTick);
    const mode = q.compact ? (store.get('mode', {})[n] || 'learn') : '';
    if (q.compact) app.innerHTML = `${back}
      <h1>${label}. ${esc(q.title)}</h1>
      <p class="sub">${q.star ? '<span class="chip star">often in exam</span> ' : ''}${q.target} min ${p.st ? '· ' + ST[p.st] : ''}${store.get('weak', {})[n] ? ' · <span class="chip bad">weak</span>' : ''}</p>
      <div class="modes" role="tablist">${[['learn', 'Learn'], ['practise', 'Practise'], ['exam', 'Exam']].map(([k, l]) => `<button class="${k === mode ? 'on' : ''}" data-mode="${k}">${l}</button>`).join('')}</div>
      ${compactBody(q, mode)}
      <h2>How did it go?</h2>
      <div class="row"><button class="btn good" data-r="solo">Alone</button><button class="btn warn" data-r="help">With help</button><button class="btn bad" data-r="fail">Not yet</button></div>
      <div class="pager">${q.mock ? '' : n > 1 ? `<a class="btn ghost" href="#/q/${n - 1}">← ${n - 1}</a>` : ''}${!q.mock && n < 40 ? `<a class="btn ghost" href="#/q/${n + 1}">${n + 1} →</a>` : ''}</div>`;
    else app.innerHTML = `${back}
      <h1>${label}. ${esc(q.title)}</h1>
      <p class="sub">${q.star ? '<span class="chip star">often in exam</span> ' : ''}${q.target} min ${p.st ? '· ' + ST[p.st] : ''}</p>
      <section class="card exam"><div class="label">Exam question</div><p class="q">${inline(q.question)}</p></section>
      ${q.keys && q.keys.length ? `<div class="writedown"><b>Write down:</b> ${q.keys.map(k => `<span class="chip">${inline(k)}</span>`).join(' ')}</div>` : ''}
      ${q.think ? `<section class="card think"><div class="label">Think (15 seconds)</div>${q.think}${q.budget ? `<p class="budget">⏱ ${esc(q.budget)}</p>` : ''}</section>` : ''}
      ${solution(q)}
      <h2>How did it go?</h2>
      <div class="row"><button class="btn good" data-r="solo">Alone</button><button class="btn warn" data-r="help">With help</button><button class="btn bad" data-r="fail">Not yet</button></div>
      <div class="pager">${q.mock ? '' : n > 1 ? `<a class="btn ghost" href="#/q/${n - 1}">← ${n - 1}</a>` : ''}${!q.mock && n < 40 ? `<a class="btn ghost" href="#/q/${n + 1}">${n + 1} →</a>` : ''}</div>`;
    $$('[data-mode]').forEach(b => b.onclick = () => { const m = store.get('mode', {}); m[n] = b.dataset.mode; store.set('mode', m); practice(n); });
    if (mode === 'exam') examTimer(q);
    if (q.coach && mode !== 'exam') { const qe = $('section.exam .q'); if (qe) for (const x of q.coach.clues || []) { const h = inline(x.q); if (h && qe.innerHTML.includes(h)) qe.innerHTML = qe.innerHTML.replace(h, '<mark>' + h + '</mark>'); } }
    $$('[data-r]').forEach(b => b.onclick = () => {
      const all = prog(); all[n] = { st: b.dataset.r, at: Date.now() }; store.set('progress', all);
      toast(b.dataset.r === 'solo' ? 'Saved ✓' : 'Saved. It comes back later.');
      location.hash = q.mock ? `#/mock/${q.mock}` : `#/q/${n < 40 ? n + 1 : n}`;
    });
  }

  // ---------- ▶ the story player: one consistent kitchen story for every task, you tap Next ----------
  const CAST = {
    you: ['🧑‍💼', 'You, the owner', 'kubectl'], api: ['🛎️', 'Front desk', 'API server'], etcd: ['📒', 'Order book', 'etcd'],
    sched: ['🪑', 'Host', 'Scheduler'], cm: ['👨‍🍳', 'Head chef', 'Controller manager'], kubelet: ['🧑‍🍳', 'Table cook', 'kubelet (node)'],
    pod: ['🍲', 'Dish', 'Pod'], svc: ['☎️', 'Phone number', 'Service'], net: ['🚧', 'Door guard', 'NetworkPolicy / CNI'],
    dns: ['📖', 'Phone book', 'CoreDNS'], store: ['🗄️', 'Store room', 'PV / PVC / StorageClass'], access: ['🪪', 'Key cards', 'RBAC'],
    tools: ['🧰', 'Meal kits', 'Helm / Kustomize / CRD'],
  };
  const card = (k, cls = '') => { const c = CAST[k] || CAST.pod; return `<div class="cast ${cls}"><div class="emo">${c[0]}</div><div><b>${c[1]}</b><code>${c[2]}</code></div></div>`; };
  function watch(n) { location.replace('#/q/' + n); }
  function mountPlayer(n, root) {
    const q = Q(n); if (!q) return;
    const st = q.story || { cast: q.pic.parts.length ? q.pic.parts : ['pod'], broken: q.pic.say, fix: '', before: '', after: '' };
    const build = q.pic.mode === 'build';
    const main = st.cast[0];
    const badge = (txt, ok) => txt ? `<span class="badge ${ok ? 'ok' : 'bad'}">${esc(txt)}</span>` : '';
    const strip = ok => `<div class="strip">${card(main, ok ? 'good' : build ? 'missing' : 'broken')}${badge(ok ? st.after : st.before, ok)}</div>`;
    const beats = [];
    beats.push({ t: 'Meet the cast', html: `<div class="castlist">${st.cast.map((k, i) => card(k, 'enter" style="animation-delay:' + (i * 0.7) + 's')).join('')}</div><p class="cap">These are the characters in this task.</p>` });
    beats.push({ t: build ? "What's missing" : "What's broken", html: `<div class="hero-card">${card(main, build ? 'missing big' : 'broken big')}${badge(st.before, false)}</div><p class="cap story">${esc(st.broken)}</p>` });
    beats.push({ t: 'Read the order', html: `<p class="q" id="dq"></p><div class="keys" id="dk"></div><p class="cap small">Write these down before you type anything.</p>`, after: el => {
      dissect(q, $('#dq', el))(); $$('.tok', el).forEach(t => t.classList.toggle('miss', false));
      $$('.tok.hit', el).forEach((t, i) => { t.classList.toggle('hit', false); setTimeout(() => t.classList.add('hit'), 600 + i * 700); });
      $('#dk', el).innerHTML = q.keys.map((k, i) => `<span class="chip enter" style="animation-delay:${0.6 + i * 0.9}s">${inline(k)}</span>`).join('');
    } });
    // ---- think before you type: decode the order, two guesses, the plan ----
    const val = k => ((k.match(/`([^`]+)`/) || [])[1] || (k.split('=')[1] || '').trim());
    const decode = k => {
      const v = val(k), K = k.toLowerCase();
      if (/namespace/.test(K)) return ['Add <code>-n ' + esc(v) + '</code> to every command', 'Forget it and you see "No resources found".'];
      if (/not delete|do not|don't|never/.test(K)) return ['Change it, never delete it', 'Use <code>edit</code>, <code>set</code> or <code>patch</code>.'];
      if (/reboot/.test(K)) return ['Make it survive a reboot', 'Use <code>systemctl enable</code>, or a file in /etc.'];
      if (/^node\b|node =/.test(K)) return ['Work on that table: <code>ssh ' + esc(v || 'node01') + '</code>', 'Type <code>exit</code> when you are done.'];
      if (/deploy/.test(K)) return ['The Deployment <code>' + esc(v) + '</code> is the owner', 'Fix the owner, not the dish (pod).'];
      if (/file|path|\/opt|\/root|\/etc/.test(K)) return ['Write exactly to <code>' + esc(v || k) + '</code>', 'Wrong path = zero points.'];
      if (/port/.test(K)) return ['Port <code>' + esc(v) + '</code>', 'Compare it with what the app really listens on.'];
      if (/image/.test(K)) return ['Image <code>' + esc(v) + '</code>', 'Copy the name and tag exactly.'];
      if (/service|svc/.test(K)) return ['Service <code>' + esc(v) + '</code>', 'Its selector must match the pod labels.'];
      if (/command|run/.test(K)) return ['The container must run <code>' + esc(v) + '</code>', 'Copy it exactly.'];
      return [inline(k), 'Copy this exactly from the question.'];
    };
    beats.push({ t: 'Decode the order', html: '<div class="decode">' + q.keys.map((k, i) => { const d = decode(k); return '<div class="dec enter" style="animation-delay:' + (i * 1.2) + 's"><div class="from">' + inline(k) + '</div><div class="arrow">↓</div><div class="to"><b>' + d[0] + '</b><span>' + d[1] + '</span></div></div>'; }).join('') + '</div>' });

    const pick3 = (right, pool) => { const o = [right]; for (const p of pool.sort(() => Math.random() - 0.5)) { if (o.length >= 3) break; if (!o.includes(p)) o.push(p); } return o.sort(() => Math.random() - 0.5); };
    const quiz = (title, ask, options, right, show, why) => ({ t: title, html: '<p class="cap story">' + ask + '</p><div class="quiz">' + options.map(o => '<button class="opt" data-o="' + esc(o) + '">' + show(o) + '</button>').join('') + '</div><p class="cap verdict"></p>', after: el => {
      $$('.opt', el).forEach(b => b.onclick = e => { e.stopPropagation();
        const ok = b.dataset.o === right;
        $$('.opt', el).forEach(x => { x.disabled = true; if (x.dataset.o === right) x.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        $('.verdict', el).innerHTML = (ok ? '<b class="win">Yes!</b> ' : '<b class="lose">Not quite.</b> ') + why; $('.verdict', el).classList.add('enter');
      });
    } });
    const others = Object.keys(CAST).filter(k => k !== 'you' && !st.cast.includes(k));
    beats.push(quiz('You guess', build ? 'Which character does this task add or change?' : 'Who do you think is broken?', pick3(main, others), main,
      k => '<span class="emo">' + CAST[k][0] + '</span> ' + CAST[k][1] + ' <code>' + CAST[k][2] + '</code>', esc(st.broken)));
    const firstCmd = (cmdsOf(q)[0] || {}).t || '';
    const POOL = ['k get nodes', 'k get pods -A', 'systemctl status kubelet', 'k get ep -n NS', 'k describe pod NAME -n NS', 'k logs NAME -n NS --previous', 'crictl ps -a', 'k get netpol -n NS', 'k get pvc -n NS', 'helm list -A', 'k get sc', 'k get svc -n NS'];
    if (firstCmd) beats.push(quiz('You guess', 'What do you type first?', pick3(firstCmd, POOL.filter(p => p.split(' ')[1] !== firstCmd.split(' ')[1])), firstCmd,
      c => '<code class="cmdopt">' + esc(c) + '</code>', 'Always look before you touch: <code>' + esc(firstCmd) + '</code>'));

    const ICON = ['👀 Look', '🔍 Find why', '🔧 Fix', '✅ Prove'];
    beats.push({ t: 'The plan', html: '<div class="plan">' + q.steps.map((s, i) => { const tag = i === q.steps.length - 1 ? ICON[3] : i === 0 ? ICON[0] : i === q.steps.length - 2 ? ICON[2] : ICON[1]; return '<div class="pl enter" style="animation-delay:' + (i * 0.9) + 's"><span class="tag">' + tag + '</span>' + esc(s.title.replace(/^Step \d+\.\s*/, '').replace('Closing routine', 'Prove it works')) + '</div>'; }).join('') + '</div><p class="cap">Now watch each command. Then you do it.</p>' });

    q.steps.forEach((s, si) => {
      const items = s.flow.filter(f => !f.skip);
      items.forEach((f, i) => {
        if (f.k !== 'cmd') return;
        const outs = [], says = [];
        for (let j = i + 1; j < items.length && items[j].k !== 'cmd'; j++) (items[j].k === 'out' ? outs : says).push(items[j]);
        const say = says.find(useful);
        const isLast = si === q.steps.length - 1;
        beats.push({ t: s.title.replace(/^Step \d+\.\s*/, '').replace('Closing routine', 'Prove it works'), html: `${strip(false)}<div class="term"><div class="ln"><span class="pr">$</span> <span class="typed"></span></div></div><p class="cap"></p>`, after: async (el, alive) => {
          const ty = $('.typed', el), tm = $('.term', el), text = f.multi ? f.t.split('\n')[0] + ' …' : f.t;
          for (const ch of text) { if (!alive()) return; ty.textContent += ch; await new Promise(r => setTimeout(r, 45)); }
          await new Promise(r => setTimeout(r, 600)); if (!alive()) return;
          outs.forEach(o => { const p = document.createElement('pre'); p.className = 'out enter'; p.innerHTML = paint(o.t); tm.append(p); });
          await new Promise(r => setTimeout(r, outs.length ? 900 : 200)); if (!alive()) return;
          const cap = $('.cap', el); cap.innerHTML = say ? shortH(say.h) : (isLast ? 'Check the result.' : ''); cap.classList.add('enter');
        } });
      });
    });
    beats.push({ t: 'Fixed', html: `<div class="hero-card">${card(main, 'good big')}${badge(st.after, true)}</div><p class="cap story">${esc(st.fix || 'Done and verified.')}</p>` });
    beats.push({ t: 'Remember', html: `<div class="hook">${CAST[main][0]} ${esc(st.before || '')} → ${esc(st.after || 'fixed')}</div><p class="cap story"><b>Broken:</b> ${esc(st.broken)}<br><b>Fix:</b> ${esc(st.fix)}</p><div class="mug">${q.mug}</div>` });

    { // order for memory: cast, read, decode, GUESS who, then reveal what's broken, guess first command, plan, steps
      const bi = beats.findIndex(b => /^What's (broken|missing)/.test(b.t)), [rev] = beats.splice(bi, 1);
      beats.splice(beats.findIndex(b => b.t === 'You guess') + 1, 0, rev); }
    root.innerHTML = `<div class="player"><div class="ptitle" id="pt"></div><div class="stage" id="stage"></div>
        <div class="dots">${beats.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div>
        <div class="pctl"><button class="iconbtn" id="pv" aria-label="Back">◀</button><button class="btn" id="nx">Next ▶</button><button class="iconbtn" id="auto" aria-label="Auto play">Auto</button></div></div>`;
    let idx = 0, gen = 0, auto = false, timer = 0;
    const show = i => {
      idx = Math.max(0, Math.min(beats.length - 1, i)); const my = ++gen; clearTimeout(timer);
      const b = beats[idx], stage = $('#stage');
      $('#pt').textContent = `${idx + 1}/${beats.length} · ${b.t}`;
      stage.innerHTML = `<div class="beat enter">${b.html}</div>`;
      $$('.dots i').forEach((d, j) => d.className = j < idx ? 'done' : j === idx ? 'now' : '');
      $('#nx').textContent = idx === beats.length - 1 ? 'Practise it ▶' : 'Next ▶';
      const alive = () => my === gen && document.body.contains(stage);
      Promise.resolve(b.after && b.after(stage, alive)).then(() => {
        if (auto && alive() && idx < beats.length - 1) timer = setTimeout(() => alive() && show(idx + 1), Math.max(4500, plain(stage.textContent).length * 65));
      });
    };
    $('#nx').onclick = () => idx === beats.length - 1 ? (location.hash = `#/do/${n}`) : show(idx + 1);
    $('#pv').onclick = () => show(idx - 1);
    $('#auto').onclick = () => { auto = !auto; $('#auto').classList.toggle('on', auto); if (auto) show(idx + 1 < beats.length ? idx + 1 : idx); };
    $('#stage').onclick = e => { if (!e.target.closest('button,a')) $('#nx').click(); };
    $$('.dots i').forEach(d => d.onclick = () => show(+d.dataset.i));
    show(0);
  }

  // ---------- ▶ story video: Kube Foods (head office + branch), voice, quiz stops, then a few exact steps ----------
  function mountVideo(q, root) {
    const v = q.video;
    const st = (emo, name, real, cls) => `<div class="stn ${cls}"><i>${emo}</i><b>${name}</b><small>${real}</small></div>`;
    const wd = v.world;
    const floor = (f, cls) => `<div class="floor ${cls}"><div class="flabel">${esc(f.label)} · <code>${esc(f.real)}</code></div>${f.stations.map(x => st(x[0], esc(x[1]), esc(x[2]), x[3])).join('')}${cls === 'office' ? '<div class="regtext"></div>' : `<div class="nosign">${esc(wd.nosign)}</div><div class="roster"><b>${wd.roster} <code>${esc(wd.rosterReal)}</code></b><span></span></div>`}</div>`;
    root.innerHTML = `<div class="vid">
      <div class="world" id="world">
        ${floor(wd.top, 'office')}
        <div class="phoneline"><span class="call">${esc(wd.call)}</span></div>
        ${floor(wd.bottom, 'branch')}
        <div class="owner"><i>${wd.owner[0]}</i><b>${esc(wd.owner[1])}</b><small>${esc(wd.owner[2])}</small></div>
        <div class="vexam">${wd.goal}</div>
        <div class="night"><span>${wd.night}</span></div>
        <div class="vterm"><div class="vprompt"></div><pre></pre></div>
        <div class="vquiz"></div>
        <div class="bigcheck">✓</div>
        <div class="recap"></div>
        <button class="vplay" aria-label="Play">▶</button>
      </div>
      <div class="vsub"></div>
      <div class="vbar"><i></i></div>
    </div>
    <h2>Do it in ${v.steps.length} steps</h2>
    ${v.steps.map((s, i) => `<div class="vstep"><div class="vnum">${i + 1}</div><div class="vbody"><b>${esc(s.do)}</b>${codeBlock(s.cmds.join('\n'))}${s.see ? `<div class="vsee">You see: <code>${esc(s.see)}</code></div>` : ''}</div></div>`).join('')}`;
    const W = $('.world', root), sub = $('.vsub', root), pre = $('.vterm pre', root), bar = $('.vbar i', root), btn = $('.vplay', root);
    let audio = null, playing = false, gen = 0, cur = 0, pendingNext = null;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    // plays one clip; always finishes: on end, on error, or after the clip's length (+1 s) even if 'ended' never fires
    const playAudio = (src, my) => new Promise(res => {
      const me = audio || (audio = new Audio());
      me.pause(); me.src = src;
      try { me.muted = !!JSON.parse(localStorage.getItem('cka:mute')); } catch {}
      let done = false, guard = 0, iv = 0;
      const finish = () => { if (done) return; done = true; clearTimeout(guard); clearInterval(iv); res(); };
      me.onended = finish; me.onerror = finish;
      me.onloadedmetadata = () => { guard = setTimeout(finish, (me.duration || 8) * 1000 + 1500); };
      guard = setTimeout(finish, 25000);
      me.play().catch(() => setTimeout(finish, 4000));
      iv = setInterval(() => { if (my !== gen) { me.pause(); finish(); } else if (!playing && !me.paused) me.pause(); }, 300);
    });
    const typeTerm = async (lines, my) => {
      pre.textContent = '';
      for (const line of lines || []) {
        if (my !== gen) return;
        if (line.startsWith('$')) { for (const ch of line + '\n') { if (my !== gen) return; pre.textContent += ch; await sleep(55); } }
        else { await sleep(500); pre.textContent += line + '\n'; }
        await sleep(600);
      }
    };
    const ask = (sc, k, my) => new Promise(res => {
      const box = $('.vquiz', root);
      box.innerHTML = `<p>${esc(sc.sub)}</p>` + sc.quiz.map((o, j) => `<button data-j="${j}">${esc(o.t)}</button>`).join('');
      box.classList.add('on');
      $$('button', box).forEach(b => b.onclick = async e => {
        e.stopPropagation();
        const o = sc.quiz[+b.dataset.j];
        $$('button', box).forEach(x => { x.disabled = true; if (sc.quiz[+x.dataset.j].ok) x.classList.add('right'); });
        if (!o.ok) b.classList.add('wrong');
        box.insertAdjacentHTML('beforeend', `<div class="fb ${o.ok ? 'ok' : ''}">${esc(o.fb)}</div>`);
        await playAudio(`media/${q.n}/s${k + 1}-o${+b.dataset.j + 1}.mp3?v=${v.ver}`, my);
        await sleep(700); box.classList.remove('on'); res();
      });
    });
    const scene = async k => {
      const my = ++gen; cur = k;
      if (k >= v.scenes.length) { playing = false; W.classList.add('ended'); btn.textContent = '↺'; btn.hidden = false; return; }
      const sc = v.scenes[k];
      W.className = 'world ' + sc.state.split(' ').map(x => 's-' + x).join(' ');
      $('.regtext', root).textContent = sc.reg || '';
      $('.roster span', root).textContent = sc.roster || '';
      $('.vprompt', root).textContent = (sc.prompt || 'root@controlplane') + ':~$';
      if (k === v.scenes.length - 1) $('.recap', root).innerHTML = v.steps.flatMap(s => s.cmds).map((c, i) => `<code style="animation-delay:${i * 0.8}s">${esc(c)}</code>`).join('');
      sub.textContent = sc.sub; bar.style.width = ((k + 1) / v.scenes.length * 100) + '%';
      const talk = playAudio(`media/${q.n}/s${k + 1}.mp3?v=${v.ver}`, my);
      await Promise.all([talk, typeTerm(sc.term, my)]);
      if (my !== gen) return;
      if (sc.quiz) { await ask(sc, k, my); if (my !== gen) return; }
      await sleep(600);
      if (my !== gen) return;
      if (playing) scene(k + 1); else pendingNext = k + 1;
    };
    btn.onclick = e => {
      e.stopPropagation();
      if (!audio) { audio = new Audio(`media/${q.n}/s1.mp3?v=${v.ver}`); audio.play().then(() => audio.pause()).catch(() => {}); } // unlock sound inside the tap
      playing = true; btn.hidden = true; W.classList.remove('ended'); scene(0);
    };
    W.onclick = () => {
      if (!btn.hidden || $('.vquiz', root).classList.contains('on')) return;
      playing = !playing; W.classList.toggle('paused', !playing);
      if (playing && pendingNext !== null) { const nx = pendingNext; pendingNext = null; scene(nx); return; }
      if (audio) playing ? audio.play().catch(() => {}) : audio.pause();
    };
    addEventListener('hashchange', () => { gen++; playing = false; if (audio) audio.pause(); }, { once: true });
  }

  // ---------- practise in the app: type each command, the terminal answers like the real one ----------
  const norm = s => s.replace(/^kubectl\s/, 'k ').replace(/\s+/g, ' ').trim();
  const matches = (typed, want) => {
    const re = new RegExp('^' + norm(want).split(/(<[^>]+>|NAME|NS|POD)/).map((p, i) => i % 2 ? '\\S+' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$');
    return re.test(norm(typed));
  };
  function doIt(n) {
    const q = Q(n); if (!q) return home();
    const cmds = cmdsOf(q);
    let at = 0;
    app.innerHTML = `<a href="#/q/${n}" class="small">← ${q.n}. ${esc(q.title)}</a>
      <div class="sim"><div class="term tall" id="tm"><div class="ln dim">${esc(q.question.replace(/`/g, ''))}</div></div>
        <form class="cmdline" id="f"><span class="pr">$</span><input id="in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type the command"><button class="btn" aria-label="Run">⏎</button></form>
        <div class="coach" id="coach"></div></div>`;
    const tm = $('#tm'), coach = $('#coach'), input = $('#in');
    const print = (cls, txt) => { const d = document.createElement(cls === 'out' ? 'pre' : 'div'); d.className = cls; d.textContent = txt; tm.append(d); tm.scrollTop = 1e6; };
    const explain = c => { const s = q.steps[c.si].flow; const after = []; for (let i = c.fi + 1; i < s.length && s[i].k !== 'cmd'; i++) after.push(s[i]); return after; };
    const showCoach = (just = '') => {
      if (at >= cmds.length) { coach.innerHTML = `${just}<div class="now done">✓ Solved. Next: once more without help, then on a real cluster.</div><div class="row"><a class="btn good" href="#/q/${n}">Done</a><button class="btn ghost" id="again">Again</button></div>`; $('#again').onclick = () => doIt(n); return; }
      const c = cmds[at], st = q.steps[c.si];
      if (c.multi) { coach.innerHTML = `${just}<div class="now"><b>${esc(st.title)}</b><span class="small"> · ${at + 1}/${cmds.length} · paste this YAML</span></div>${codeBlock(c.t)}<button class="btn block" id="applied">Done ✓</button>`; $("#applied").onclick = () => { print("ln", "$ " + c.t.split("\n")[0] + " …"); const after = explain(c), say = after.find(useful); after.filter(f => f.k === "out").forEach(o => print("out", o.t)); at++; showCoach(say ? `<div class="just">${shortH(say.h)}</div>` : ""); }; return; }
      coach.innerHTML = `${just}<div class="now"><b>${esc(st.title.replace(/^Step \d+\.\s*/, '').replace('Closing routine', 'Check it works'))}</b><span class="small"> · ${at + 1}/${cmds.length}</span></div>
        <div class="row"><button class="btn ghost" id="hint">Hint</button><button class="btn ghost" id="show">Show command</button></div>`;
      let h = 0;
      $('#hint').onclick = () => { h++; $('#hint').textContent = h === 1 ? c.t.split(' ').slice(0, 2).join(' ') + ' …' : c.t.replace(/\s\S+$/, ' …'); };
      $('#show').onclick = () => { input.value = c.t; input.focus(); };
    };
    $('#f').onsubmit = e => {
      e.preventDefault();
      const typed = input.value.trim(); if (!typed || at >= cmds.length) return;
      print('ln', '$ ' + typed); input.value = '';
      const c = cmds[at];
      if (!matches(typed, c.t)) { print('err', / -n /.test(c.t) && /^(kubectl|k) /.test(typed) && !/ -n | -A/.test(typed) ? 'No resources found in default namespace.   ← you forgot -n' : '✗ not this step. Tap Hint.'); return; }
      const after = explain(c), outs = after.filter(f => f.k === 'out'), say = after.find(useful);
      if (/^vim? /.test(c.t)) print('dim', '[file opens in vim]');
      outs.forEach(o => print('out', o.t));
      if (!outs.length) print('dim', '✓');
      at++;
      showCoach(say ? `<div class="just">${shortH(say.h)}</div>` : '');
    };
    showCoach('');
    setTimeout(() => input.focus(), 100);
  }

  // ---------- real cluster: one step per screen, for Android split screen next to Killercoda ----------
  function guide(n, i) {
    const q = Q(n); if (!q) return home();
    const pages = [{ title: 'Build it', body: q.setup ? `<a class="btn block" href="${KILLERCODA}" target="_blank" rel="noopener">Open Killercoda</a>${codeBlock(q.setup)}<p class="small">Split screen: Recent apps → tap this app's icon → <b>Open in split screen</b>.</p>` : `<p>Can't be built in a playground. Practise in killer.sh.</p>` },
      ...q.steps.map(s => { const say = s.flow.find(useful); return { title: s.title.replace(/^Step \d+\.\s*/, '').replace('Closing routine', 'Check it works'),
        body: s.flow.filter(f => !f.skip).map(f => f.k === 'cmd' ? codeBlock(f.t) : f.k === 'out' ? `<pre class="out">${esc(f.t)}</pre>` : '').join('') + (say ? `<p class="just">${shortH(say.h)}</p>` : '') }; })];
    i = Math.max(0, Math.min(pages.length - 1, i));
    app.innerHTML = `<a href="#/q/${n}" class="small">← ${q.n}. ${esc(q.title)}</a>
      <div class="gstep"><div class="small">${i + 1}/${pages.length}</div><h2>${esc(pages[i].title)}</h2>${pages[i].body}</div>
      <div class="pager">${i > 0 ? `<a class="btn ghost" href="#/guide/${n}/${i - 1}">←</a>` : ''}${i < pages.length - 1 ? `<a class="btn" href="#/guide/${n}/${i + 1}">Next →</a>` : `<a class="btn good" href="#/q/${n}">Done</a>`}</div>`;
  }

  // ---------- mock exams ----------
  const mockState = m => store.get('mock' + m, { started: 0, deadline: 0, done: {}, flag: {}, grade: {}, finished: false });
  const weightOf = (m, n) => { if (Q(n).weight) return Q(n).weight; const t = Q(n).topic, inMock = D.mocks[m - 1].filter(x => Q(x).topic === t).length; return D.topics.find(x => x.name === t).weight / inMock; };

  function mockView(m) {
    const ids = D.mocks[m - 1], s = mockState(m);
    if (s.finished) return mockResult(m);
    if (!s.started) {
      app.innerHTML = `<a href="#/mocks" class="small">← Mock exams</a><h1>Mock exam ${m}</h1>
        <div class="card"><ul class="quick">
        <li><b>16 tasks · 2 hours · pass at 66%</b>, weighted like the real exam</li>
        <li>Open Killercoda, paste each task's setup, solve it there</li>
        <li>No help: only kubernetes.io/docs (help is marked "used")</li>
        <li>Stuck over 8 min → <b>Flag</b> and move on</li>
        <li>At the end: run each task's checks and mark Passed / Partly / Failed</li></ul></div>
        <button class="btn block" id="start">Start the 2-hour exam</button>`;
      $('#start').onclick = () => { store.set('mock' + m, { ...s, started: Date.now(), deadline: Date.now() + 120 * 60000 }); headerTimer(); mockView(m); };
      return;
    }
    const left = Math.max(0, s.deadline - Date.now());
    app.innerHTML = `<a href="#/mocks" class="small">← Mock exams (the timer keeps running)</a><h1>Mock exam ${m}</h1>
      <p class="sub">${Object.keys(s.done).length}/${ids.length} done · ${Object.keys(s.flag).length} flagged · ${Math.ceil(left / 60000)} min left</p>
      <a class="btn ghost block" href="${KILLERCODA}" target="_blank" rel="noopener">Open Killercoda CKA playground</a>
      <div class="card"><div class="grid">${ids.map((n, i) => `<a href="#/mock/${m}/${i + 1}" class="${s.done[n] ? 'done' : ''} ${s.flag[n] ? 'flag' : ''}">${i + 1}</a>`).join('')}</div></div>
      <button class="btn block" id="finish">Finish and check my answers</button>`;
    $('#finish').onclick = () => { s.ended = Date.now(); store.set('mock' + m, s); location.hash = `#/mock/${m}/grade`; };
  }

  function mockTask(m, i) {
    const ids = D.mocks[m - 1], n = ids[i - 1], q = Q(n), s = mockState(m);
    if (!s.started) return mockView(m);
    app.innerHTML = `<a href="#/mock/${m}" class="small">← All tasks</a>
      <h1>Task ${i} of ${ids.length}</h1><p class="sub">Weight ${weightOf(m, n).toFixed(1)}% · ${esc(topicShort(q.topic))}</p>
      <section class="card exam"><div class="label">Task</div>${(() => { const mm = q.question.match(/^(ssh \S+)\s*(.*)$/s); return mm ? `<div class="sshline">${codeBlock(mm[1])}</div><p class="q">${inline(mm[2])}</p>` : `<p class="q">${inline(q.question)}</p>`; })()}</section>
      <details class="step" id="helpbox"><summary>Show solution (counts as help)${s.help && s.help[n] ? ' (used)' : ''}</summary><div class="body" id="helpbody"></div></details>
      ${q.setup ? `<details class="step"><summary>Setup for Killercoda (paste first)</summary><div class="body">${codeBlock(q.setup)}<p class="small">In the real exam this is already there.</p></div></details>` : `<div class="card small">This task can't be built in a playground. Write down the steps you would run; check them at the end.</div>`}
      <div class="row"><a class="btn ghost" href="${KILLERCODA}" target="_blank" rel="noopener">Terminal</a><a class="btn ghost" href="${DOCS}" target="_blank" rel="noopener">Docs</a></div>
      <div class="row" style="margin-top:10px"><button class="btn ${s.flag[n] ? 'warn' : 'ghost'}" id="flag">${s.flag[n] ? 'Flagged' : 'Flag'}</button><button class="btn ${s.done[n] ? 'good' : ''}" id="done">${s.done[n] ? 'Done ✓' : 'Mark done'}</button></div>
      <div class="pager">${i > 1 ? `<a class="btn ghost" href="#/mock/${m}/${i - 1}">← ${i - 1}</a>` : ''}${i < ids.length ? `<a class="btn ghost" href="#/mock/${m}/${i + 1}">${i + 1} →</a>` : `<a class="btn ghost" href="#/mock/${m}">All tasks</a>`}</div>`;
    $('#helpbox').ontoggle = () => { if (!$('#helpbox').open || $('#helpbody').children.length) return; const st = mockState(m); (st.help ||= {})[n] = 1; store.set('mock' + m, st); $('#helpbody').innerHTML = solution(q).replace(/<h2>Set up in Killercoda[\s\S]*?(?=<h2>Solution|<details class="step solution")/, '').replace('<details class="step solution">', '<details class="step solution" open>'); };
    $('#flag').onclick = () => { const st = mockState(m); st.flag[n] ? delete st.flag[n] : st.flag[n] = 1; store.set('mock' + m, st); mockTask(m, i); };
    $('#done').onclick = () => { const st = mockState(m); st.done[n] = 1; store.set('mock' + m, st); location.hash = i < ids.length ? `#/mock/${m}/${i + 1}` : `#/mock/${m}`; };
  }

  function mockGrade(m) {
    const ids = D.mocks[m - 1], s = mockState(m);
    app.innerHTML = `<h1>Check your answers</h1><p class="sub">For each task run its verify steps in the terminal. Be honest: a fix that does not verify scores zero in the real exam.</p>
      ${ids.map((n, i) => { const q = Q(n), v = q.steps.find(x => /Closing|Check it works/.test(x.title)); return `<details class="step"><summary>${i + 1}. ${esc(q.title)}${s.help && s.help[n] ? " (watched)" : ""} <span class="chip" id="g${n}">${s.grade[n] ?? '–'}</span></summary><div class="body">
        <p>${inline(q.question)}</p>${v && v.html ? v.html : v ? v.flow.filter(f => f.k === "cmd").map(f => codeBlock(f.t)).join("") : q.mug}
        <div class="row"><button class="btn good" data-n="${n}" data-g="1">Passed</button><button class="btn warn" data-n="${n}" data-g="0.5">Partly</button><button class="btn bad" data-n="${n}" data-g="0">Failed</button></div></div></details>`; }).join('')}
      <button class="btn block" id="score">See my score</button>`;
    $$('[data-g]').forEach(b => b.onclick = () => { const st = mockState(m); st.grade[b.dataset.n] = +b.dataset.g; store.set('mock' + m, st); $('#g' + b.dataset.n).textContent = { 1: 'passed', 0.5: 'partly', 0: 'failed' }[b.dataset.g]; b.closest('details').open = false; });
    $('#score').onclick = () => {
      const st = mockState(m), missing = ids.filter(n => st.grade[n] === undefined).length;
      if (missing) return toast(`${missing} tasks not checked yet`);
      st.score = Math.round(ids.reduce((a, n) => a + weightOf(m, n) * st.grade[n], 0));
      st.finished = true; store.set('mock' + m, st); headerTimer(); location.hash = `#/mock/${m}`;
    };
  }

  function mockResult(m) {
    const ids = D.mocks[m - 1], s = mockState(m), mins = Math.round(((s.ended || Date.now()) - s.started) / 60000);
    const weak = ids.filter(n => s.grade[n] < 1);
    app.innerHTML = `<a href="#/mocks" class="small">← Mock exams</a><h1>Mock exam ${m}: result</h1>
      <div class="card"><div class="score ${s.score >= 66 ? 'pass' : 'fail'}">${s.score}%</div><p style="text-align:center">${s.score >= 66 ? 'PASS. You would pass the real exam with this.' : 'Below 66%. Practise the tasks below, then try the next mock.'}<br><span class="small">Time used: ${mins} min of 120${s.help ? ` · watched help on ${Object.keys(s.help).length} task(s)` : ""}</span></p></div>
      ${weak.length ? `<h2>Practise these</h2><div class="card"><ul class="qlist">${weak.map(n => `<li><a href="#/q/${n}"><span class="num">${n}</span>${esc(Q(n).title)}<span class="st fail">${s.grade[n] === 0.5 ? 'partly' : 'failed'}</span></a></li>`).join('')}</ul></div>` : '<div class="card">Every task passed. Excellent.</div>'}
      <button class="btn ghost block" id="redo">Reset this mock exam</button>`;
    $('#redo').onclick = () => { if (confirm('Reset mock exam ' + m + '? Your score is cleared.')) { localStorage.removeItem('cka:mock' + m); headerTimer(); mockView(m); } };
  }

  function refView(i) {
    const r = D.refs[i]; if (!r) return home();
    app.innerHTML = `<a href="#/" class="small">← Home</a><h1>${esc(r.title)}</h1><div class="card">${r.html}</div>
      <div class="pager">${i > 1 ? `<a class="btn ghost" href="#/ref/${i - 1}">← Back</a>` : ''}${i < D.refs.length - 1 ? `<a class="btn ghost" href="#/ref/${i + 1}">Next →</a>` : ''}</div>`;
  }

  // ---------- router ----------
  function render() {
    if (!D) return;
    watchGen++;
    const h = location.hash.replace(/^#\/?/, '').split('/');
    scrollTo(0, 0);
    if (h[0] === 'q') practice(+h[1]);
    else if (h[0] === 'watch') watch(+h[1]);
    else if (h[0] === 'do') doIt(+h[1]);
    else if (h[0] === 'guide') guide(+h[1], +h[2] || 0);
    else if (h[0] === 'topic') topicView(+h[1]);
    else if (h[0] === 'ref') refView(+h[1]);
    else if (h[0] === 'mock' && h[2] === 'grade') mockGrade(+h[1]);
    else if (h[0] === 'mock' && h[2]) mockTask(+h[1], +h[2]);
    else if (h[0] === 'mock') mockView(+h[1]);
    else if (h[0] === 'mocks') mocksPage();
    else if (h[0] === 'cheat') cheatPage();
    else home();
    const onMock = h[0] === 'mocks' || h[0] === 'mock' || (h[0] === 'q' && +h[1] > 100);
    $$('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === (onMock ? 'mocks' : 'practice')));
    headerTimer();
  }
  addEventListener('hashchange', render);
  fetch(($('meta[name=datav]') || {}).content || 'data.json', { cache: 'no-cache' }).then(r => r.json()).then(d => { D = d; render(); })
    .catch(() => { app.innerHTML = '<p>Could not load. Open once with internet, then it works offline.</p>'; });
})();
