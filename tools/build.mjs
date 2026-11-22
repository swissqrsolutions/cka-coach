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
const html = s => marked.parse(s.trim(), { renderer });

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
for (const x of questions) {
  const r = x.raw;
  const partA = sec(r, /PART A/);
  const partB = sec(r, /PART B/);
  const block = (partA.match(/```\n([\s\S]*?)```/) || [])[1] || '';
  const examQ = (partB.match(/^> ([\s\S]*?)(?:\n\n|$)/m) || [])[1] || '';
  const meaning = (partB.match(/\*\*What the question is really saying:\*\*\s*\n\n([\s\S]*?)(?=\n\n\*\*Write down)/) || [])[1] || '';
  const write = (partB.match(/\*\*Write down from the question:\*\*\s*(.+)/) || [])[1] || '';
  const steps = r.split(/\n(?=### )/).filter(p => /^### (Step|Closing)/.test(p)).map(p => ({ title: p.split('\n')[0].replace(/^### /, '').replace(/\s*\(same.*\)$/, ''), html: html(p.split('\n').slice(1).join('\n').replace(/\n---\s*$/, '')) }));
  const wrong = sec(r, /If something goes wrong|The same question with other causes/);
  const mug = sec(r, /Mug this up/);
  const tt = (r.match(/\*\*Target time:\*\*\s*(\d+)/) || [])[1];
  Object.assign(x, {
    words: html(sec(r, /Three words|words first/i)),
    setup: block.replace(/\nclear\s*$/, '').trim(),
    setupNote: html(partA.replace(/```[\s\S]*?```/, '').trim()),
    question: examQ.replace(/\n> ?/g, ' ').trim(),
    meaning: html(meaning),
    keys: write.split('·').map(s => s.trim()).filter(Boolean),
    steps,
    wrong: html(wrong),
    mug: html(mug.replace(/\*\*To repeat[\s\S]*$/, '')),
    target: tt ? +tt : 5,
  });
  delete x.raw;
}

// ---- three mock exams, weighted like the real exam (17 tasks, 120 minutes)
const per = { 'TROUBLESHOOTING': 5, 'CLUSTER ARCHITECTURE': 4, 'SERVICES & NETWORKING': 4, 'WORKLOADS & SCHEDULING': 3, 'STORAGE': 1 };
const byTopic = {};
for (const x of questions) (byTopic[x.topic] ||= []).push(x.n);
const mocks = [0, 1, 2].map(m => {
  const pick = [];
  for (const [t, k] of Object.entries(per)) {
    const pool = byTopic[t] || [];
    // rotate through the pool so the 3 mocks overlap as little as possible; ★ questions first
    const sorted = [...pool].sort((a, b) => (questions[b - 1].star - questions[a - 1].star) || a - b);
    for (let i = 0; i < k; i++) pick.push(sorted[(m * k + i) % sorted.length]);
  }
  return [...new Set(pick)];
});

const data = { built: new Date().toISOString(), topics: topics.map(t => ({ name: t.name, weight: t.weight, intro: html(t.intro) })), refs: refs.map(r => ({ title: r.title, html: html(r.body) })), questions, mocks };
fs.writeFileSync(path.join(ROOT, 'site', 'data.json'), JSON.stringify(data));

// ---- version stamps + offline file list
const stamp = f => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, 'site', f))).digest('hex').slice(0, 8);
let index = fs.readFileSync(path.join(ROOT, 'site', 'index.html'), 'utf8');
index = index.replace(/(app\.js|style\.css|data\.json)\?v=[a-f0-9]*/g, (m, f) => `${f}?v=${stamp(f === 'data.json' ? 'data.json' : 'assets/' + f)}`);
fs.writeFileSync(path.join(ROOT, 'site', 'index.html'), index);
console.log(`questions ${questions.length} · topics ${topics.length} · reference pages ${refs.length} · mocks ${mocks.map(m => m.length).join('/')}`);
console.log('missing setup:', questions.filter(x => !x.setup).map(x => x.n).join(',') || 'none', '· missing question:', questions.filter(x => !x.question).map(x => x.n).join(',') || 'none');
