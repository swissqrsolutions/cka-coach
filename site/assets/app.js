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
  const codeBlock = txt => `<div class="code"><button class="copy" type="button">Copy</button><pre><code>${esc(txt)}</code></pre></div>`;
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
  function home() {
    const p = prog(), solo = PQ().filter(q => (p[q.n] || {}).st === 'solo').length;
    const next = PQ().find(q => (p[q.n] || {}).st !== 'solo') || PQ()[0];
    const install = isInstalled() ? '' : installEvt
      ? `<div class="card install"><p><b>Install CKA Coach</b><br><span class="small">Open it from your home screen, works offline.</span></p><button class="btn" id="installBtn">Install</button></div>`
      : isIOS ? `<div class="card install"><p><b>Install:</b> tap Share, then <b>Add to Home Screen</b>.</p></div>`
      : `<div class="card install"><p><b>Install:</b> Chrome menu ⋮ → <b>Add to Home screen</b> → Install.</p></div>`;
    const mocks = [1, 2, 3].map(m => {
      const s = store.get('mock' + m, null);
      const state = !s ? 'Not started' : s.finished ? `Score ${s.score}% · ${s.score >= 66 ? 'PASS' : 'below 66%'}` : 'In progress';
      return `<a class="card mock" href="#/mock/${m}"><span><b>Mock exam ${m}</b><br><span class="small">16 tasks · 2 hours · ${state}</span></span><span class="chip ${s && s.finished && s.score >= 66 ? 'good' : ''}">${s && s.finished ? s.score + '%' : 'Start'}</span></a>`;
    }).join('');
    const topics = D.topics.map((t, i) => {
      const qs = PQ().filter(q => q.topic === t.name), done = qs.filter(q => (p[q.n] || {}).st === 'solo').length;
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
  function practice(n) {
    const q = Q(n); if (!q) return home();
    const p = prog()[n] || {};
    const back = q.mock ? `<a href="#/mock/${q.mock}" class="small">← Mock exam ${q.mock}</a>` : `<a href="#/topic/${D.topics.findIndex(t => t.name === q.topic)}" class="small">← ${esc(topicShort(q.topic))}</a>`;
    const label = q.mock ? `Mock ${q.mock} · task ${q.n % 100}` : q.n;
    app.innerHTML = `${back}
      <h1>${label}. ${esc(q.title)}</h1>
      <p class="sub">${q.star ? '<span class="chip star">often in exam</span> ' : ''}${q.target} min ${p.st ? '· ' + ST[p.st] : ''}</p>
      <section class="card exam"><div class="label">Exam question</div><p class="q">${inline(q.question)}</p></section>
      <div id="story"></div>
      <div class="row" style="margin-top:10px"><a class="btn ghost" href="#/do/${n}">Practise here</a><a class="btn ghost" href="#/guide/${n}/0">Real cluster</a></div>
      <h2>How did it go?</h2>
      <div class="row"><button class="btn good" data-r="solo">Alone</button><button class="btn warn" data-r="help">With help</button><button class="btn bad" data-r="fail">Not yet</button></div>
      <div class="pager">${q.mock ? '' : n > 1 ? `<a class="btn ghost" href="#/q/${n - 1}">← ${n - 1}</a>` : ''}${!q.mock && n < 40 ? `<a class="btn ghost" href="#/q/${n + 1}">${n + 1} →</a>` : ''}</div>`;
    mountPlayer(n, $('#story'));
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
    beats.push({ t: 'Remember', html: `<p class="cap story"><b>Broken:</b> ${esc(st.broken)}<br><b>Fix:</b> ${esc(st.fix)}</p><div class="mug">${q.mug}</div>` });

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
      app.innerHTML = `<a href="#/" class="small">← Home</a><h1>Mock exam ${m}</h1>
        <div class="card"><p><b>Like the real CKA:</b> 16 tasks, 2 hours, pass at 66%. Tasks are weighted like the exam (troubleshooting 30%, architecture 25%, networking 20%, workloads 15%, storage 10%).</p>
        <p><b>How it works:</b> open the Killercoda CKA playground. For each task, paste its setup, then solve it there. Use only the kubernetes.io docs. No hints during the exam.</p>
        <p><b>Time plan:</b> first 80 minutes all tasks in order; stuck more than 8 minutes → flag it and move on. Last 40 minutes: flagged tasks, then check everything.</p>
        <p class="small">At the end you check each task with its verify steps and mark it passed, partly or failed. Your score is weighted like the real exam.</p></div>
        <button class="btn block" id="start">Start the 2-hour exam</button>`;
      $('#start').onclick = () => { store.set('mock' + m, { ...s, started: Date.now(), deadline: Date.now() + 120 * 60000 }); headerTimer(); mockView(m); };
      return;
    }
    const left = Math.max(0, s.deadline - Date.now());
    app.innerHTML = `<a href="#/" class="small">← Home (the timer keeps running)</a><h1>Mock exam ${m}</h1>
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
      <a class="btn ghost block" id="help" href="#/q/${n}">▶ Stuck? See how to solve it${s.help && s.help[n] ? ' (used)' : ''}</a>
      ${q.setup ? `<details class="step"><summary>Setup for Killercoda (paste first)</summary><div class="body">${codeBlock(q.setup)}<p class="small">In the real exam this is already there.</p></div></details>` : `<div class="card small">This task can't be built in a playground. Write down the steps you would run; check them at the end.</div>`}
      <div class="row"><a class="btn ghost" href="${KILLERCODA}" target="_blank" rel="noopener">Terminal</a><a class="btn ghost" href="${DOCS}" target="_blank" rel="noopener">Docs</a></div>
      <div class="row" style="margin-top:10px"><button class="btn ${s.flag[n] ? 'warn' : 'ghost'}" id="flag">${s.flag[n] ? 'Flagged' : 'Flag'}</button><button class="btn ${s.done[n] ? 'good' : ''}" id="done">${s.done[n] ? 'Done ✓' : 'Mark done'}</button></div>
      <div class="pager">${i > 1 ? `<a class="btn ghost" href="#/mock/${m}/${i - 1}">← ${i - 1}</a>` : ''}${i < ids.length ? `<a class="btn ghost" href="#/mock/${m}/${i + 1}">${i + 1} →</a>` : `<a class="btn ghost" href="#/mock/${m}">All tasks</a>`}</div>`;
    $('#help').onclick = () => { const st = mockState(m); (st.help ||= {})[n] = 1; store.set('mock' + m, st); };
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
    app.innerHTML = `<a href="#/" class="small">← Home</a><h1>Mock exam ${m}: result</h1>
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
    else home();
    headerTimer();
  }
  addEventListener('hashchange', render);
  fetch('data.json?v=' + (document.currentScript?.src.split('v=')[1] || ''), { cache: 'no-cache' }).then(r => r.json()).then(d => { D = d; render(); })
    .catch(() => { app.innerHTML = '<p>Could not load. Open once with internet, then it works offline.</p>'; });
})();
