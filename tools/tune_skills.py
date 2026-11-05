# -*- coding: utf-8 -*-
import re, hashlib

src = open('js/data.js', encoding='utf-8').read()
stats = {}
for m in re.finditer(r"id: '([^']+)', faction: '\w+', name: '[^']*', en: '', title: '[^']*', weapon: '[^']*',\s*hp: (\d+), speed: (\d+)", src):
    stats[m.group(1)] = (int(m.group(2)), int(m.group(3)))

start = src.index("  const skills = {")
end = src.index("  characters.forEach", start)
block = src[start:end]

def hh(s):
    return int(hashlib.md5(s.encode('utf-8')).hexdigest()[:8], 16)
def f(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')
def i(v):
    return str(int(round(v)))

out = []
for line in block.splitlines():
    m = re.match(r"\s{4}(\w+): \{ (.*) \},?$", line)
    if not m:
        out.append(line); continue
    cid, body = m.group(1), m.group(2)
    name = re.search(r"name: '([^']*)'", body).group(1)
    kind = re.search(r"kind: '(\w+)'", body).group(1)
    icon = re.search(r"icon: '([^']*)'", body).group(1)
    hp, sp = stats.get(cid, (140, 250))
    j = (hh(cid) % 11 - 5) / 100.0
    p = []
    if kind == 'heal':
        p = [('pct', 0.30 + (hp - 100) * 0.0012), ('cd', (12.5 - (sp - 230) * 0.012) * (1 + j))]
    elif kind == 'nova':
        p = [('dmg', i(30 + hp * 0.12)), ('radius', i(140 + sp * 0.10)), ('cd', (7.5 + (hp - 100) * 0.02) * (1 + j))]
    elif kind == 'beam':
        p = [('dmg', i(34 + hp * 0.16)), ('len', i(480 + sp * 0.4)), ('width', 26), ('cd', (8 + hp * 0.012) * (1 + j))]
    elif kind == 'shield':
        p = [('dur', 1.6 + hp * 0.0035), ('cd', (8.5 + hp * 0.012) * (1 + j))]
    elif kind == 'invuln':
        p = [('dur', 2.0 + hp * 0.004), ('cd', (10 + hp * 0.012) * (1 + j))]
    elif kind == 'stealth':
        p = [('dur', 2.2 + (sp - 230) * 0.012), ('cd', (9.5 + (hp - 100) * 0.02) * (1 + j))]
    elif kind == 'haste':
        p = [('dur', 2.8 + (sp - 230) * 0.012), ('mul', 1.42 + (sp - 230) * 0.0015), ('cd', (9.5 - (sp - 230) * 0.01) * (1 + j))]
    elif kind == 'slow':
        p = [('radius', i(150 + hp * 0.25)), ('dur', 2.2 + hp * 0.004), ('cd', (9 + hp * 0.01) * (1 + j))]
    else:
        p = [('dist', i(150 + sp * 0.18)), ('cd', (4.8 + (hp - 100) * 0.008) * (1 + j))]
    parts = ["name: '%s'" % name, "kind: '%s'" % kind, "icon: '%s'" % icon]
    for k, v in p:
        sv = v if isinstance(v, str) else (i(v) if k in ('dmg','radius','len','dist','width') else f(v))
        parts.append('%s: %s' % (k, sv))
    parts.append("iconImg: 'assets/skill-icons/%s.png'" % cid)
    out.append('    %s: { %s }' % (cid, ', '.join(parts)))

newblock = '  const skills = {\n' + '\n'.join(out[1:]) + '\n  };\n'
src = src[:start] + newblock + src[end:]
open('js/data.js', 'w', encoding='utf-8').write(src)
print('tuned', len([l for l in out if l.startswith('    ')]))
