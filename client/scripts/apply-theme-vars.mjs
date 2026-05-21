import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'components');
const skip = /LoginForm|RegistrationForm|HomeHeader|HomeFooter|HomeHero|SettingsPage\.css$/;

const replacements = [
  [/background-color:\s*#ffffff\b/gi, 'background-color: var(--bg-surface)'],
  [/background:\s*#ffffff\b/gi, 'background: var(--bg-surface)'],
  [/background-color:\s*#fff\b/gi, 'background-color: var(--bg-surface)'],
  [/background:\s*#fff\b/gi, 'background: var(--bg-surface)'],
  [/border:\s*1px solid #eef0f5/gi, 'border: 1px solid var(--border-light)'],
  [/border:\s*1px solid #e5e7eb/gi, 'border: 1px solid var(--border-color)'],
  [/border-bottom:\s*1px solid #e5e7eb/gi, 'border-bottom: 1px solid var(--border-color)'],
  [/border-top:\s*1px solid #e5e7eb/gi, 'border-top: 1px solid var(--border-color)'],
  [/border-color:\s*#e5e7eb/gi, 'border-color: var(--border-color)'],
  [/border-color:\s*#eef0f5/gi, 'border-color: var(--border-light)'],
  [/border:\s*1px solid #d1d5db/gi, 'border: 1px solid var(--border-color)'],
  [/color:\s*#6b7280\b/gi, 'color: var(--text-secondary)'],
  [/color:\s*#9ca3af\b/gi, 'color: var(--text-secondary)'],
  [/color:\s*#111827\b/gi, 'color: var(--text-primary)'],
  [/color:\s*#111\b/gi, 'color: var(--text-primary)'],
  [/color:\s*#374151\b/gi, 'color: var(--text-primary)'],
  [/color:\s*#1f2937\b/gi, 'color: var(--text-primary)'],
  [/color:\s*#A0A0A0\b/gi, 'color: var(--text-muted)'],
  [/color:\s*#d1d5db\b/gi, 'color: var(--text-muted)'],
  [/color:\s*#4b5563\b/gi, 'color: var(--text-secondary)'],
  [/color:\s*#8173DA\b/gi, 'color: var(--accent-soft)'],
  [/color:\s*#7F73D3\b/gi, 'color: var(--accent-soft)'],
  [/background-color:\s*#f3f4f6\b/gi, 'background-color: var(--bg-surface-muted)'],
  [/background:\s*#f3f4f6\b/gi, 'background: var(--bg-surface-muted)'],
  [/background-color:\s*#f9fafb\b/gi, 'background-color: var(--bg-surface-muted)'],
  [/background:\s*#f9fafb\b/gi, 'background: var(--bg-surface-muted)'],
  [/background-color:\s*#f7f8fa\b/gi, 'background-color: var(--bg-surface-muted)'],
  [/background:\s*#f7f8fa\b/gi, 'background: var(--bg-surface-muted)'],
  [/background-color:\s*#F1EEFE\b/gi, 'background-color: var(--bg-active)'],
  [/background:\s*#F1EEFE\b/gi, 'background: var(--bg-active)'],
  [/background-color:\s*#f1eefe\b/gi, 'background-color: var(--bg-active)'],
  [/background:\s*#f1eefe\b/gi, 'background: var(--bg-active)'],
  [/background-color:\s*#F0EEFD\b/gi, 'background-color: var(--bg-active)'],
  [/background:\s*#F0EEFD\b/gi, 'background: var(--bg-active)'],
  [/background-color:\s*#F1F0F8\b/gi, 'background-color: var(--bg-active)'],
  [/background-color:\s*#f1f0ff\b/gi, 'background-color: var(--accent-bg)'],
  [/background:\s*#f1f0ff\b/gi, 'background: var(--accent-bg)'],
  [/box-shadow:\s*0 4px 12px rgba\(0,0,0,0\.05\)/g, 'box-shadow: var(--shadow-sm)'],
  [/box-shadow:\s*0 8px 20px rgba\(0,0,0,0\.08\)/g, 'box-shadow: var(--shadow-md)'],
  [/background-color:\s*#e5e7eb\b/gi, 'background-color: var(--border-color)'],
  [/background:\s*#e5e7eb\b/gi, 'background: var(--border-color)'],
  [/background-color:\s*white\b/gi, 'background-color: var(--bg-surface)'],
  [/background:\s*white\b/gi, 'background: var(--bg-surface)'],
  [/color:\s*#4f46e5\b/gi, 'color: var(--accent)'],
  [/border-bottom-color:\s*#4f46e5\b/gi, 'border-bottom-color: var(--accent)'],
  [/border-color:\s*#4f46e5\b/gi, 'border-color: var(--accent)'],
  [/background-color:\s*#4f46e5\b/gi, 'background-color: var(--accent)'],
  [/background:\s*#4f46e5\b/gi, 'background: var(--accent)'],
  [/background-color:\s*#4338ca\b/gi, 'background-color: var(--btn-primary-hover)'],
  [/background:\s*#4338ca\b/gi, 'background: var(--btn-primary-hover)'],
  [/background-color:\s*#dcfce7\b/gi, 'background-color: var(--status-published-bg)'],
  [/background:\s*#dcfce7\b/gi, 'background: var(--status-published-bg)'],
  [/color:\s*#166534\b/gi, 'color: var(--status-published-text)'],
  [/background:\s*#8173DA\b/gi, 'background: var(--accent-soft)'],
  [/background-color:\s*#8173DA\b/gi, 'background-color: var(--accent-soft)'],
  [/color:\s*white\b/gi, 'color: var(--on-accent)'],
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.css') && !skip.test(p)) out.push(p);
  }
  return out;
}

let count = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [re, rep] of replacements) content = content.replace(re, rep);
  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', path.relative(root, file));
    count++;
  }
}
console.log(`Done: ${count} files`);
