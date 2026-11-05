# -*- coding: utf-8 -*-
import re
src = open('js/data.js', encoding='utf-8').read()
chars = re.findall(r"id: '([^']+)', faction: '\w+', name: '([^']+)'", src)
seen = set(); out = []
for i, n in chars:
    if i in seen: continue
    seen.add(i); out.append((i, n))
anchor = "  characters.forEach(function (c) { c.weapon = 'w_' + c.id;"
start = src.index(anchor)
# 找到 skills 定义结束处插入 talents
talents = []
stats = [
    ('damage', '伤害', 0.06, '+6% 伤害'),
    ('speed', '移速', 0.05, '+5% 移速'),
    ('fireRate', '攻速', 0.05, '+5% 攻速'),
    ('magnet', '拾取', 30, '+30 拾取范围'),
    ('crit', '暴击', 0.04, '+4% 暴击率'),
    ('maxHp', '生命', 8, '+8 生命'),
]
lines = []
for idx, (cid, name) in enumerate(out):
    st, label, val, desc = stats[idx % len(stats)]
    tname = '「' + name + '」的' + label + '天赋'
    tdesc = '开局' + desc + '。'
    lines.append("    %s: { name: '%s', desc: '%s', stat: '%s', value: %s }" % (cid, tname, tdesc, st, val))
block = "  const talents = {\n" + ",\n".join(lines) + "\n  };\n"
src = src[:start] + block + src[start:]
src = src.replace("c.skill = skills[c.id]; c.skillCd = 0;", "c.skill = skills[c.id]; c.skillCd = 0; c.talent = talents[c.id];")
open('js/data.js', 'w', encoding='utf-8').write(src)
print('talents', len(lines))
