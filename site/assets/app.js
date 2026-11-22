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
  function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2200); }
  document.addEventListener('click', async e => {
    const b = e.target.closest('.copy'); if (!b) return;
    const txt = b.parentElement.querySelector('code').innerText;
    try { await navigator.clipboard.writeText(txt); } catch { const ta = document.createElement('textarea'); ta.value = txt; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
    b.textContent = 'Copied'; b.classList.add('done'); setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('done'); }, 1500);
  });
  const codeBlock = txt => `<div class="code"><button class="copy" type="button">Copy</button><pre><code>${esc(txt)}</code></pre></div>`;
  const Q = n => D.questions[n - 1];
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
  function home() {
    const p = prog(), solo = D.questions.filter(q => (p[q.n] || {}).st === 'solo').length;
    const next = D.questions.find(q => (p[q.n] || {}).st !== 'solo') || D.questions[0];
    const install = isInstalled() ? '' : installEvt
      ? `<div class="card install"><p><b>Install CKA Coach</b><br><span class="small">Open it from your home screen, works offline.</span></p><button class="btn" id="installBtn">Install</button></div>`
      : isIOS ? `<div class="card install"><p><b>Install:</b> tap Share, then <b>Add to Home Screen</b>.</p></div>`
      : `<div class="card install"><p><b>Install:</b> Chrome menu ⋮ → <b>Add to Home screen</b> → Install.</p></div>`;
    const mocks = [1, 2, 3].map(m => {
      const s = store.get('mock' + m, null);
      const state = !s ? 'Not started' : s.finished ? `Score ${s.score}% · ${s.score >= 66 ? 'PASS' : 'below 66%'}` : 'In progress';
      return `<a class="card mock" href="#/mock/${m}"><span><b>Mock exam ${m}</b><br><span class="small">17 tasks · 2 hours · ${state}</span></span><span class="chip ${s && s.finished && s.score >= 66 ? 'good' : ''}">${s && s.finished ? s.score + '%' : 'Start'}</span></a>`;
    }).join('');
    const topics = D.topics.map((t, i) => {
      const qs = D.questions.filter(q => q.topic === t.name), done = qs.filter(q => (p[q.n] || {}).st === 'solo').length;
      return `<a class="card topic" href="#/topic/${i}"><div class="head"><span>${esc(topicShort(t.name))}</span><span class="chip">${t.weight}% of exam</span></div>
        <div class="small">${done}/${qs.length} solved alone</div><div class="bar"><i style="width:${Math.round(100 * done / qs.length)}%"></i></div></a>`;
    }).join('');
    const refs = D.refs.map((r, i) => i === 0 ? '' : `<li><a href="#/ref/${i}"><span class="num">${i}</span>${esc(r.title.replace(/^\d[A-Z]?\. /, ''))}</a></li>`).join('');
    app.innerHTML = `
      <section class="card hero"><h1>Pass the CKA</h1><p class="sub">${solo}/40 tasks solved alone. Practise each task, then sit 3 full mock exams.</p>
        <a class="btn block" href="#/q/${next.n}">Continue: ${next.n}. ${esc(next.title)}</a></section>
      ${install}
      <h2>Mock exams</h2>${mocks}
      <h2>Practise by topic</h2>${topics}
      <h2>Cheat sheet</h2><div class="card"><ul class="qlist">${refs}</ul></div>`;
    if ($('#installBtn')) $('#installBtn').onclick = async () => { installEvt.prompt(); await installEvt.userChoice; installEvt = null; render(); };
  }

  function topicView(i) {
    const t = D.topics[i], p = prog();
    const qs = D.questions.filter(q => q.topic === t.name);
    app.innerHTML = `<a href="#/" class="small">← Home</a><h1>${esc(topicShort(t.name))}</h1><p class="sub">${t.weight}% of the exam · ${qs.length} tasks</p>
      <div class="card"><ul class="qlist">${qs.map(q => `<li><a href="#/q/${q.n}"><span class="num">${q.n}</span><span>${esc(q.title)} ${q.star ? '<span class="chip star">often in exam</span>' : ''}</span><span class="st ${statusOf(q.n)}">${ST[statusOf(q.n)] || ''}</span></a></li>`).join('')}</ul></div>
      <details class="step"><summary>How to solve this topic</summary><div class="body">${t.intro}</div></details>`;
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

  function practice(n) {
    const q = Q(n); if (!q) return home();
    const p = prog()[n] || {};
    const hints = [
      { t: 'Hint 1 · the words you need', h: q.words },
      { t: 'Hint 2 · what the question is really saying', h: q.meaning },
      ...q.steps.map((s, i) => ({ t: `Hint ${i + 3} · ${s.title}`, h: s.html })),
    ];
    app.innerHTML = `<a href="#/topic/${D.topics.findIndex(t => t.name === q.topic)}" class="small">← ${esc(topicShort(q.topic))}</a>
      <h1>${q.n}. ${esc(q.title)} ${q.star ? '<span class="chip star">often in exam</span>' : ''}</h1>
      <p class="sub">Target time ${q.target} min ${p.st ? '· last result: ' + ST[p.st] : ''}</p>
      <section class="card exam"><div class="label">Exam question</div><p class="q" id="q"></p>
        <p class="small" id="dhelp">Tap the words you must not get wrong (names, namespace, numbers, "do not…").</p>
        <button class="btn ghost block" id="dcheck">Check my picks</button><div class="keys" id="keys" hidden></div></section>
      <h2>1 · Build it in Killercoda</h2>
      <div class="card">${q.setup ? `<p class="small">Open the free CKA playground, then paste this. In the real exam this is already done.</p>
        <a class="btn block" href="${KILLERCODA}" target="_blank" rel="noopener">Open Killercoda CKA playground</a>${codeBlock(q.setup)}` : `<p>${q.setupNote || 'This one cannot be built in a playground. Learn the steps; practise in killer.sh.'}</p>`}</div>
      <h2>2 · Solve it</h2>
      <div class="card"><div class="clock" id="clock">0:00</div><div class="row"><button class="btn" id="go">Start timer</button><a class="btn ghost" href="${DOCS}" target="_blank" rel="noopener">Docs</a></div></div>
      <div id="hints"></div><button class="btn ghost block" id="more">Show a hint</button>
      <details class="step"><summary>If something goes wrong</summary><div class="body">${q.wrong}</div></details>
      <details class="step"><summary>Mug this up: the whole answer</summary><div class="body">${q.mug}</div></details>
      <h2>3 · How did it go?</h2>
      <div class="row"><button class="btn good" data-r="solo">Solved alone</button><button class="btn warn" data-r="help">With hints</button><button class="btn bad" data-r="fail">Not yet</button></div>
      <div class="pager">${n > 1 ? `<a class="btn ghost" href="#/q/${n - 1}">← ${n - 1}</a>` : ''}${n < 40 ? `<a class="btn ghost" href="#/q/${n + 1}">${n + 1} →</a>` : ''}</div>`;
    const check = dissect(q, $('#q'));
    $('#dcheck').onclick = () => {
      const r = check();
      $('#keys').innerHTML = q.keys.map(k => `<span class="chip">${inline(k)}</span>`).join('');
      $('#keys').hidden = false; $('#dcheck').hidden = true;
      $('#dhelp').textContent = r.miss ? `You found ${r.hit}. Missed ${r.miss} (red). Write these down before you type anything:` : `Perfect, you found all ${r.hit}. Write them down:`;
    };
    let shown = 0, t0 = 0, iv = 0;
    $('#more').onclick = () => {
      if (shown >= hints.length) return;
      const h = hints[shown++];
      $('#hints').insertAdjacentHTML('beforeend', `<details class="step" open><summary>${esc(h.t)}</summary><div class="body">${h.h}</div></details>`);
      $('#more').textContent = shown >= hints.length ? 'All hints shown' : 'Show the next hint';
      if (shown >= hints.length) $('#more').disabled = true;
    };
    $('#go').onclick = () => {
      if (iv) { clearInterval(iv); iv = 0; $('#go').textContent = 'Start timer'; return; }
      t0 = Date.now(); $('#go').textContent = 'Stop';
      iv = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); $('#clock').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; $('#clock').style.color = s > q.target * 60 ? 'var(--bad)' : ''; }, 500);
    };
    $$('[data-r]').forEach(b => b.onclick = () => {
      const all = prog(), secs = t0 ? Math.round((Date.now() - t0) / 1000) : null;
      all[n] = { st: b.dataset.r, hints: shown, secs, at: Date.now() };
      store.set('progress', all); clearInterval(iv);
      toast(b.dataset.r === 'solo' ? 'Great. Marked as solved alone.' : b.dataset.r === 'help' ? 'Saved. Try it again tomorrow without hints.' : 'Saved. It comes back in your weak list.');
      location.hash = `#/q/${n < 40 ? n + 1 : n}`;
    });
  }

  // ---------- mock exams ----------
  const mockState = m => store.get('mock' + m, { started: 0, deadline: 0, done: {}, flag: {}, grade: {}, finished: false });
  const weightOf = (m, n) => { const t = Q(n).topic, inMock = D.mocks[m - 1].filter(x => Q(x).topic === t).length; return D.topics.find(x => x.name === t).weight / inMock; };

  function mockView(m) {
    const ids = D.mocks[m - 1], s = mockState(m);
    if (s.finished) return mockResult(m);
    if (!s.started) {
      app.innerHTML = `<a href="#/" class="small">← Home</a><h1>Mock exam ${m}</h1>
        <div class="card"><p><b>Like the real CKA:</b> 17 tasks, 2 hours, pass at 66%. Tasks are weighted like the exam (troubleshooting 30%, architecture 25%, networking 20%, workloads 15%, storage 10%).</p>
        <p><b>How it works:</b> open the Killercoda CKA playground. For each task, paste its setup, then solve it there. Use only the kubernetes.io docs. No hints during the exam.</p>
        <p><b>Time plan:</b> first 80 minutes all tasks in order; stuck more than 8 minutes → flag it and move on. Last 40 minutes: flagged tasks, then check everything.</p>
        <p class="small">At the end you check each task with its verify steps and mark it passed, partly or failed. Your score is weighted like the real exam.</p></div>
        <button class="btn block" id="start">Start the 2-hour exam</button>`;
      $('#start').onclick = () => { store.set('mock' + m, { ...s, started: Date.now(), deadline: Date.now() + 120 * 60000 }); headerTimer(); mockView(m); };
      return;
    }
    const left = Math.max(0, s.deadline - Date.now());
    app.innerHTML = `<a href="#/" class="small">← Home (the timer keeps running)</a><h1>Mock exam ${m}</h1>
      <p class="sub">${Object.keys(s.done).length}/17 done · ${Object.keys(s.flag).length} flagged · ${Math.ceil(left / 60000)} min left</p>
      <a class="btn ghost block" href="${KILLERCODA}" target="_blank" rel="noopener">Open Killercoda CKA playground</a>
      <div class="card"><div class="grid">${ids.map((n, i) => `<a href="#/mock/${m}/${i + 1}" class="${s.done[n] ? 'done' : ''} ${s.flag[n] ? 'flag' : ''}">${i + 1}</a>`).join('')}</div></div>
      <button class="btn block" id="finish">Finish and check my answers</button>`;
    $('#finish').onclick = () => { s.ended = Date.now(); store.set('mock' + m, s); location.hash = `#/mock/${m}/grade`; };
  }

  function mockTask(m, i) {
    const ids = D.mocks[m - 1], n = ids[i - 1], q = Q(n), s = mockState(m);
    if (!s.started) return mockView(m);
    app.innerHTML = `<a href="#/mock/${m}" class="small">← All tasks</a>
      <h1>Task ${i} of 17</h1><p class="sub">Weight ${weightOf(m, n).toFixed(1)}% · ${esc(topicShort(q.topic))}</p>
      <section class="card exam"><div class="label">Task</div><p class="q">${inline(q.question)}</p></section>
      ${q.setup ? `<details class="step"><summary>Setup for Killercoda (paste first)</summary><div class="body">${codeBlock(q.setup)}<p class="small">In the real exam this is already there.</p></div></details>` : `<div class="card small">This task can't be built in a playground. Write down the steps you would run; check them at the end.</div>`}
      <div class="row"><a class="btn ghost" href="${KILLERCODA}" target="_blank" rel="noopener">Terminal</a><a class="btn ghost" href="${DOCS}" target="_blank" rel="noopener">Docs</a></div>
      <div class="row" style="margin-top:10px"><button class="btn ${s.flag[n] ? 'warn' : 'ghost'}" id="flag">${s.flag[n] ? 'Flagged' : 'Flag'}</button><button class="btn ${s.done[n] ? 'good' : ''}" id="done">${s.done[n] ? 'Done ✓' : 'Mark done'}</button></div>
      <div class="pager">${i > 1 ? `<a class="btn ghost" href="#/mock/${m}/${i - 1}">← ${i - 1}</a>` : ''}${i < 17 ? `<a class="btn ghost" href="#/mock/${m}/${i + 1}">${i + 1} →</a>` : `<a class="btn ghost" href="#/mock/${m}">All tasks</a>`}</div>`;
    $('#flag').onclick = () => { const st = mockState(m); st.flag[n] ? delete st.flag[n] : st.flag[n] = 1; store.set('mock' + m, st); mockTask(m, i); };
    $('#done').onclick = () => { const st = mockState(m); st.done[n] = 1; store.set('mock' + m, st); location.hash = i < 17 ? `#/mock/${m}/${i + 1}` : `#/mock/${m}`; };
  }

  function mockGrade(m) {
    const ids = D.mocks[m - 1], s = mockState(m);
    app.innerHTML = `<h1>Check your answers</h1><p class="sub">For each task run its verify steps in the terminal. Be honest: a fix that does not verify scores zero in the real exam.</p>
      ${ids.map((n, i) => { const q = Q(n), v = q.steps.find(x => /Closing/.test(x.title)); return `<details class="step"><summary>${i + 1}. ${esc(q.title)} <span class="chip" id="g${n}">${s.grade[n] ?? '–'}</span></summary><div class="body">
        <p>${inline(q.question)}</p>${v ? v.html : q.mug}
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
    app.innerHTML = `<a href="#/" class="small">← Home</a><h1>Mock exam ${m}: result</h1>
      <div class="card"><div class="score ${s.score >= 66 ? 'pass' : 'fail'}">${s.score}%</div><p style="text-align:center">${s.score >= 66 ? 'PASS. You would pass the real exam with this.' : 'Below 66%. Practise the tasks below, then try the next mock.'}<br><span class="small">Time used: ${mins} min of 120</span></p></div>
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
    const h = location.hash.replace(/^#\/?/, '').split('/');
    scrollTo(0, 0);
    if (h[0] === 'q') practice(+h[1]);
    else if (h[0] === 'topic') topicView(+h[1]);
    else if (h[0] === 'ref') refView(+h[1]);
    else if (h[0] === 'mock' && h[2] === 'grade') mockGrade(+h[1]);
    else if (h[0] === 'mock' && h[2]) mockTask(+h[1], +h[2]);
    else if (h[0] === 'mock') mockView(+h[1]);
    else home();
    headerTimer();
  }
  addEventListener('hashchange', render);
  fetch('data.json?v=' + (document.currentScript?.src.split('v=')[1] || ''), { cache: 'no-cache' }).then(r => r.json()).then(d => { D = d; render(); })
    .catch(() => { app.innerHTML = '<p>Could not load. Open once with internet, then it works offline.</p>'; });
})();
