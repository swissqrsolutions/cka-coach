// Turns content/cka-guide.md into site/data.json (questions, sections, cheat sheet) and stamps the app.
// usage: node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..');
const md = fs.readFileSync(path.join(ROOT, 'content', 'cka-guide.md'), 'utf8').replace(/\r\n/g, '\n');
const lines = md.split('\n');

// code blocks get a copy button (rendered by the app)
const renderer = new marked.Renderer();
renderer.code = ({ text }) => `<div class="code"><button class="copy" type="button">Copy</button><pre><code>${text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</code></pre></div>`;
const ltSafe = s => String(s || '').split(/(`[^`]*`)/).map((p, i) => i % 2 ? p : p.replace(/<(?=[A-Za-z\/])/g, '&lt;')).join('');
const pipeSafe = s => s.split('\n').map(l => l.trim().startsWith('|') ? l.replace(/`[^`]*`/g, c => c.replace(/\|/g, '\\|')) : l).join('\n');
const html = s => marked.parse(ltSafe(pipeSafe(s.trim())), { renderer });

// ---- split top-level parts: everything before PART 4 is reference material
const p4 = lines.findIndex(l => l.startsWith('# PART 4'));
const refMd = lines.slice(0, p4).join('\n');
const tail = lines.slice(p4);

// reference: one page per "# " heading
const refs = [];
let cur = null;
for (const l of refMd.split('\n')) {
  if (/^# /.test(l)) { cur = { title: l.replace(/^# /, '').replace(/^PART \d+: /, ''), body: '' }; refs.push(cur); continue; }
  if (cur) cur.body += l + '\n';
}

// ---- questions
const topics = [];
const questions = [];
let topic = null, q = null;
const flush = () => { if (q) questions.push(q); q = null; };
for (const l of tail) {
  const t = l.match(/^# ([A-Z &]+) \((\d+)% of the score\)/);
  if (t) { flush(); topic = { name: t[1].replace(/\b\w/g, c => c).trim(), weight: +t[2], intro: '' }; topics.push(topic); continue; }
  if (/^# READ ONCE/.test(l)) { flush(); topic = null; refs.push({ title: 'Read once, do not drill', body: '' }); cur = refs[refs.length - 1]; continue; }
  const h = l.match(/^## (\d+)\. (★ )?(.+)$/);
  if (h) { flush(); q = { n: +h[1], star: !!h[2], title: h[3].trim(), topic: topic.name, raw: '' }; continue; }
  if (q) q.raw += l + '\n';
  else if (topic) topic.intro += l + '\n';
  else if (cur) cur.body += l + '\n';
}
flush();

// ---- sections of a question
const sec = (raw, re) => {
  const parts = raw.split(/\n(?=### )/);
  const hit = parts.find(p => re.test(p.split('\n')[0]));
  return hit ? hit.split('\n').slice(1).join('\n').replace(/\n---\s*$/, '').trim() : '';
};
// A step as a sequence: say (explanation), cmd (one command line to type), out (what the screen shows).
// A code block is OUTPUT when the text right before it ends with ":" ("You see:", "for example:", "Change:"), else COMMANDS.
function flowOf(body) {
  const items = [], text = [];
  // text between commands: tables stay tables (k:'tbl'), other paragraphs become one short explanation each
  const flushText = () => {
    const t = text.join('\n').trim(); text.length = 0; if (!t) return;
    for (const par of t.split(/\n\s*\n/)) {
      const p = par.trim(); if (!p) continue;
      if (p.split('\n').every(l => l.trim().startsWith('|'))) items.push({ k: 'tbl', h: marked.parse(pipeSafe(p)) });
      else items.push({ k: 'say', h: marked.parseInline(ltSafe(p.replace(/\n/g, ' '))) });
    }
  };
  const ls = body.split('\n');
  for (let i = 0; i < ls.length; i++) {
    if (!ls[i].startsWith('```')) { if (ls[i].trim() !== '---') text.push(ls[i]); continue; }
    const block = []; i++;
    while (i < ls.length && !ls[i].startsWith('```')) block.push(ls[i++]);
    const before = text.join('\n').trim();
    const lastLine = before.split('\n').pop() || '';
    const endsColon = /:\s*$/.test(lastLine);
    const looksYaml = block.filter(l => /^\s*(-\s+)?[A-Za-z][\w.\/-]*:(\s|$)/.test(l) || /^\s+-\s/.test(l)).length >= Math.max(2, block.filter(l => l.trim()).length * 0.6);
    const saysOutput = /(you see|you get|you want|shows?|prints?|output|answers?|returns?|looks like|for example|says|result|reads?)[^.]*:\s*$/i.test(lastLine);
    const cmdStart = /^\s*(k|kubectl|helm|ssh|systemctl|journalctl|crictl|etcdctl|etcdutl|vim|cat|cp|echo|curl|apt|apt-get|apt-cache|apt-mark|kubeadm|sed|grep|export|exit|cd|ls|dpkg|sysctl|mkdir|wget|nslookup|which|watch|ETCDCTL_API=3)\b/.test(block[0] || '') && !/^\s*\S+\s+\d+\/\d+\s/.test(block[0] || '');
    flushText();
    if (looksYaml) { items.push({ k: 'yaml', t: block.join('\n') }); continue; }
    if (endsColon && saysOutput && !(cmdStart && !/you (see|get|want)/i.test(lastLine))) { items.push({ k: 'out', t: block.join('\n') }); continue; }
    if (endsColon && /(change|to|add|edit|line|file|becomes)\b[^.]*:\s*$/i.test(lastLine)) { items.push({ k: 'yaml', t: block.join('\n') }); continue; }
    if (endsColon && !/^\s*(k|kubectl|helm|ssh|systemctl|journalctl|crictl|etcdctl|etcdutl|vim|cat|cp|echo|curl|apt|apt-get|kubeadm|sed|grep|export|exit|cd|ls|dpkg|sysctl|mkdir|wget|nslookup)\b/.test(block[0] || '')) { items.push({ k: 'out', t: block.join('\n') }); continue; }
    // join "\" continued lines, keep "# comment" as a note shown after the command
    const joined = [];
    for (const raw of block) { if (joined.length && /\\\s*$/.test(joined[joined.length - 1])) joined[joined.length - 1] = joined[joined.length - 1].replace(/\\\s*$/, '') + ' ' + raw.trim(); else joined.push(raw); }
    for (const line of joined) {
      if (!line.trim()) continue;
      const exam = /exam only/i.test(line) || /^ssh <host/.test(line.trim());
      const cmd = line.replace(/\s+#(\s.*)?$/, '').trim();
      const note = (line.match(/\s+#\s(.*)$/) || [])[1] || '';
      if (!cmd) continue;
      items.push({ k: 'cmd', t: cmd, note, skip: exam || undefined });
    }
  }
  flushText();
  return items;
}
const dmap = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'diagram-map.json'), 'utf8'));

for (const x of questions) {
  const r = x.raw;
  x.pic = dmap[x.n] || { mode: 'fix', parts: [], say: '' };
  const partA = sec(r, /PART A/);
  const partB = sec(r, /PART B/);
  const block = (partA.match(/```\n([\s\S]*?)```/) || [])[1] || '';
  const qLines = []; { let on = false; for (const l of partB.split('\n')) { if (/^>/.test(l)) { on = true; qLines.push(l.replace(/^> ?/, '')); } else if (on) break; } }
  const examQ = qLines.join('\n').replace(/\n{2,}/g, '\n').trim();
  const meaning = (partB.match(/\*\*What the question is really saying:\*\*\s*\n\n([\s\S]*?)(?=\n\n\*\*Write down)/) || [])[1] || '';
  const write = (partB.match(/\*\*Write down from the question:\*\*\s*(.+)/) || [])[1] || '';
  const steps = r.split(/\n(?=### )/).filter(p => /^### (Step|Closing)/.test(p)).map(p => {
    const body = p.split('\n').slice(1).join('\n').replace(/\n---\s*$/, '');
    return { title: p.split('\n')[0].replace(/^### /, '').replace(/\s*\(same.*\)$/, ''), html: html(body), flow: flowOf(body) };
  });
  const wrong = sec(r, /If something goes wrong|The same question with other causes/);
  const mug = sec(r, /Mug this up/);
  const tt = (r.match(/\*\*Target time:\*\*\s*(\d+)/) || [])[1];
  Object.assign(x, {
    words: html(sec(r, /Three words|words first/i)),
    setup: block.replace(/\nclear\s*$/, '').trim(),
    setupNote: html(partA.replace(/```[\s\S]*?```/, '').trim()),
    question: examQ,
    meaning: html(meaning),
    keys: write.split('·').map(s => s.trim()).filter(Boolean),
    steps,
    wrong: html(wrong),
    mug: html(mug.replace(/\*\*To repeat[\s\S]*$/, '')),
    target: tt ? +tt : 5,
  });
  delete x.raw;
}

let data_sources = [];
// ---- three mock exams, weighted like the real exam (17 tasks, 120 minutes)
const per = { 'TROUBLESHOOTING': 5, 'CLUSTER ARCHITECTURE': 4, 'SERVICES & NETWORKING': 4, 'WORKLOADS & SCHEDULING': 3, 'STORAGE': 1 };
const byTopic = {};
for (const x of questions) (byTopic[x.topic] ||= []).push(x.n);
let mocks = [0, 1, 2].map(m => {
  const pick = [];
  for (const [t, k] of Object.entries(per)) {
    const pool = byTopic[t] || [];
    // rotate through the pool so the 3 mocks overlap as little as possible; ★ questions first
    const sorted = [...pool].sort((a, b) => (questions[b - 1].star - questions[a - 1].star) || a - b);
    for (let i = 0; i < k; i++) pick.push(sorted[(m * k + i) % sorted.length]);
  }
  return [...new Set(pick)];
});

// ---- the researched mock exams (content/mocks.json) become questions 101-116, 201-216, 301-316
const PIC_BY_TOPIC = { 'TROUBLESHOOTING': ['kubelet'], 'CLUSTER ARCHITECTURE': ['api'], 'SERVICES & NETWORKING': ['svc', 'net'], 'WORKLOADS & SCHEDULING': ['sched', 'pod'], 'STORAGE': ['store'] };
const mockFile = path.join(ROOT, 'content', 'mocks.json');
if (fs.existsSync(mockFile)) {
  const M = JSON.parse(fs.readFileSync(mockFile, 'utf8'));
  mocks.length = 0;
  for (const mk of M.mocks) {
    const ids = [];
    mk.tasks.forEach((t, i) => {
      const n = mk.n * 100 + i + 1; ids.push(n);
      const steps = t.steps.map(s => ({ title: s.title, html: '', flow: [
        ...s.cmds.flatMap(c => c.includes('\n') ? [{ k: 'cmd', t: c, multi: true }] : [{ k: 'cmd', t: c }]),
        ...(s.see ? [{ k: 'out', t: s.see }] : []),
        ...(s.why ? [{ k: 'say', h: marked.parseInline(ltSafe(s.why)) }] : []),
      ] }));
      const allCmds = t.steps.flatMap(s => s.cmds).concat(t.verify || []);
      questions.push({ n, mock: mk.n, star: /very common/i.test(t.reported || ''), title: t.title, topic: t.topic, weight: t.weight,
        question: t.question, keys: t.keys || [], setup: (t.setup || '').replace(/\nclear\s*$/, '').trim(), setupNote: t.setup ? '' : html(t.beginner || ''),
        meaning: html(t.beginner || ''), words: '', steps, wrong: '', mug: html('```\n' + allCmds.join('\n') + '\n```'), target: Math.max(3, Math.round(t.weight * 1.1)),
        docs: t.docs || '', reported: t.reported || '',
        pic: { mode: /TROUBLESHOOT/.test(t.topic) ? 'fix' : 'build', parts: PIC_BY_TOPIC[t.topic] || [], say: t.beginner || '' } });
    });
    mocks.push(ids);
  }
  data_sources = M.sources || [];
}

const storyFile = path.join(ROOT, 'content', 'stories.json');
if (fs.existsSync(storyFile)) { const S = JSON.parse(fs.readFileSync(storyFile, 'utf8')); for (const x of questions) if (S[x.n]) x.story = S[x.n]; }
const vdir = path.join(ROOT, 'content', 'videos');
if (fs.existsSync(vdir)) for (const f of fs.readdirSync(vdir)) { const x = questions.find(q => q.n === +f.replace('.json', '')); if (x) { const raw = fs.readFileSync(path.join(vdir, f), 'utf8'); x.video = JSON.parse(raw); x.video.ver = crypto.createHash('sha1').update(raw).digest('hex').slice(0, 8); } }
const coachFile = path.join(ROOT, 'content', 'coach.json');
if (fs.existsSync(coachFile)) { const C = JSON.parse(fs.readFileSync(coachFile, 'utf8')); for (const x of questions) if (C[x.n]) x.coach = C[x.n]; }
const data = { sources: data_sources, built: new Date().toISOString(), topics: topics.map(t => ({ name: t.name, weight: t.weight, intro: html(t.intro) })), refs: refs.map(r => ({ title: r.title, html: html(r.body) })), questions, mocks };
fs.writeFileSync(path.join(ROOT, 'site', 'data.json'), JSON.stringify(data));

// ---- version stamps + offline file list
const stamp = f => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'site', f))).digest('hex').slice(0, 8);
let index = fs.readFileSync(path.join(ROOT, 'site', 'index.html'), 'utf8');
index = index.replace(/(app\.js|style\.css|data\.json)\?v=[a-f0-9]*/g, (m, f) => `${f}?v=${stamp(f === 'data.json' ? 'data.json' : 'assets/' + f)}`);
fs.writeFileSync(path.join(ROOT, 'site', 'index.html'), index);
console.log(`questions ${questions.length} · topics ${topics.length} · reference pages ${refs.length} · mocks ${mocks.map(m => m.length).join('/')}`);
console.log('missing setup:', questions.filter(x => !x.setup).map(x => x.n).join(',') || 'none', '· missing question:', questions.filter(x => !x.question).map(x => x.n).join(',') || 'none');
