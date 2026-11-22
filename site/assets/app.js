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
    app.innerHTML = `
      <section class="card hero"><h1>Pass the CKA</h1><p class="sub">${solo}/40 tasks solved alone. Practise each task, then sit 3 full mock exams.</p>
        <a class="btn block" href="#/q/${next.n}">Continue: ${next.n}. ${esc(next.title)}</a></section>
      ${install}
      <h2>Mock exams</h2>${mocks}
      <h2>Practise by topic</h2>${topics}`;
    if ($('#installBtn')) $('#installBtn').onclick = async () => { installEvt.prompt(); await installEvt.userChoice; installEvt = null; render(); };
  }

  function topicView(i) {
    const t = D.topics[i], p = prog();
    const qs = D.questions.filter(q => q.topic === t.name);
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
  const plain = h => String(h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
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
  function practice(n) {
    const q = Q(n); if (!q) return home();
    const p = prog()[n] || {};
    app.innerHTML = `<a href="#/topic/${D.topics.findIndex(t => t.name === q.topic)}" class="small">← ${esc(topicShort(q.topic))}</a>
      <h1>${q.n}. ${esc(q.title)}</h1>
      <p class="sub">${q.star ? '<span class="chip star">often in exam</span> ' : ''}${q.target} min ${p.st ? '· ' + ST[p.st] : ''}</p>
      <section class="card exam"><div class="label">Exam question</div><p class="q">${inline(q.question)}</p></section>
      <a class="btn block big" href="#/watch/${n}">▶ Watch how to solve it</a>
      <div class="row" style="margin-top:10px"><a class="btn ghost" href="#/do/${n}">Practise here</a><a class="btn ghost" href="#/guide/${n}/0">Real cluster</a></div>
      <h2>How did it go?</h2>
      <div class="row"><button class="btn good" data-r="solo">Alone</button><button class="btn warn" data-r="help">With help</button><button class="btn bad" data-r="fail">Not yet</button></div>
      <div class="pager">${n > 1 ? `<a class="btn ghost" href="#/q/${n - 1}">← ${n - 1}</a>` : ''}${n < 40 ? `<a class="btn ghost" href="#/q/${n + 1}">${n + 1} →</a>` : ''}</div>`;
    $$('[data-r]').forEach(b => b.onclick = () => {
      const all = prog(); all[n] = { st: b.dataset.r, at: Date.now() }; store.set('progress', all);
      toast(b.dataset.r === 'solo' ? 'Saved ✓' : 'Saved. It comes back later.');
      location.hash = `#/q/${n < 40 ? n + 1 : n}`;
    });
  }

  // ---------- ▶ the explainer: a short animation built from the question's own steps ----------
  function watch(n) {
    const q = Q(n); if (!q) return home();
    const scenes = [];
    scenes.push({ t: 'What is going on', run: async (st, a) => {
      st.innerHTML = picture(q) + `<p class="cap" id="cap"></p>`;
      await a.wait(1600); st.querySelector('.pic').classList.add('lit');
      await a.wait(900); await a.type($('#cap', st), q.pic.say); await a.wait(1800);
    } });
    scenes.push({ t: 'Read the question like this', run: async (st, a) => {
      st.innerHTML = `<p class="q" id="dq"></p><div class="keys" id="dk"></div>`;
      const get = dissect(q, $('#dq', st)); get();
      $$('.tok', st).forEach(t => t.classList.remove('hit', 'miss'));
      await a.wait(1200);
      for (const k of q.keys) {
        const words = (k.split('=')[1] || k).replace(/`/g, '').toLowerCase().split(/[^a-z0-9.\-/:]+/).filter(w => w.length > 1);
        $$('.tok', st).filter(t => words.includes(t.dataset.w)).forEach(t => t.classList.add('hit'));
        $('#dk', st).insertAdjacentHTML('beforeend', `<span class="chip pop">${inline(k)}</span>`);
        await a.wait(1300);
      }
      await a.wait(1200);
    } });
    q.steps.forEach((s, si) => scenes.push({ t: s.title.replace(/^Step \d+\.\s*/, '').replace('Closing routine', 'Check it works'), run: async (st, a) => {
      st.innerHTML = `<div class="term" id="tm"></div><p class="cap" id="cap"></p>`;
      const tm = $('#tm', st);
      const items = s.flow.filter(f => !f.skip);
      for (let i = 0; i < items.length; i++) {
        const f = items[i];
        if (f.k === 'cmd') { const line = document.createElement('div'); line.className = 'ln'; line.innerHTML = '<span class="pr">$</span> '; tm.append(line); const sp = document.createElement('span'); line.append(sp); await a.type(sp, f.t, 32); await a.wait(500); }
        else if (f.k === 'out') { const o = document.createElement('pre'); o.className = 'out'; o.textContent = f.t; tm.append(o); tm.scrollTop = 1e6; await a.wait(1400); }
        else if (useful(f)) { $('#cap', st).innerHTML = shortH(f.h); $('#cap', st).classList.remove('pop'); void st.offsetWidth; $('#cap', st).classList.add('pop'); await a.wait(Math.min(4200, 1400 + short(f.h).length * 28)); }
      }
      await a.wait(900);
    } }));
    scenes.push({ t: 'The whole answer', run: async (st, a) => { st.innerHTML = `<div class="mug">${q.mug}</div>`; await a.wait(6000); } });

    app.innerHTML = `<a href="#/q/${n}" class="small">← ${q.n}. ${esc(q.title)}</a>
      <div class="player"><div class="ptitle" id="pt"></div><div class="stage" id="stage"></div>
        <div class="dots">${scenes.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div>
        <div class="pctl"><button class="iconbtn" id="pv" aria-label="Back">⏮</button><button class="btn" id="pp">❚❚ Pause</button><button class="iconbtn" id="nx" aria-label="Next">⏭</button><button class="iconbtn" id="sp" aria-label="Speed">1×</button></div></div>
      <div class="row" style="margin-top:12px"><a class="btn" href="#/do/${n}">Now practise it</a></div>`;
    let idx = 0, paused = false, token = 0, speed = 1; const gen = ++watchGen;
    const api = tk => ({
      wait: ms => new Promise((res, rej) => { let left = ms; const step = () => { if (tk !== token || gen !== watchGen) return rej(0); if (!paused) left -= 50 * speed; if (left <= 0) res(); else setTimeout(step, 50); }; step(); }),
      async type(el, text, cps = 30) { for (const ch of text) { await this.wait(cps); el.textContent += ch; } },
    });
    const show = async i => {
      idx = Math.max(0, Math.min(scenes.length - 1, i)); const tk = ++token;
      $('#pt').textContent = `${idx + 1}/${scenes.length} · ${scenes[idx].t}`;
      $$('.dots i').forEach((d, j) => d.className = j < idx ? 'done' : j === idx ? 'now' : '');
      try { await scenes[idx].run($('#stage'), api(tk)); if (tk === token && idx < scenes.length - 1) show(idx + 1); else if (tk === token) { $('#pp').textContent = '↺ Replay'; paused = true; } } catch {}
    };
    $('#pp').onclick = () => { if ($('#pp').textContent.includes('Replay')) { paused = false; $('#pp').textContent = '❚❚ Pause'; return show(0); } paused = !paused; $('#pp').textContent = paused ? '▶ Play' : '❚❚ Pause'; $('#stage').classList.toggle('paused', paused); };
    $('#pv').onclick = () => show(idx - 1);
    $('#nx').onclick = () => show(idx + 1);
    $('#sp').onclick = () => { speed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1; $('#sp').textContent = speed + '×'; };
    $$('.dots i').forEach(d => d.onclick = () => show(+d.dataset.i));
    show(0);
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
    else home();
    headerTimer();
  }
  addEventListener('hashchange', render);
  fetch('data.json?v=' + (document.currentScript?.src.split('v=')[1] || ''), { cache: 'no-cache' }).then(r => r.json()).then(d => { D = d; render(); })
    .catch(() => { app.innerHTML = '<p>Could not load. Open once with internet, then it works offline.</p>'; });
})();
