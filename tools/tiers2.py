import csv
rows=list(csv.DictReader(open('docs/balance-survival.csv',encoding='utf-8')))
for r in rows:
    for k in ['deathRate','reach5','reach10','reach15','avgDeathWave','kills','level','avgTime']:
        r[k]=float(r[k])
rows.sort(key=lambda r:(-r['reach10'],-r['kills']))
def tier(r):
    if r['reach10']>=0.9: return 'S'
    if r['reach10']>=0.6: return 'A'
    if r['reach10']>=0.35: return 'B'
    if r['reach10']>=0.15: return 'C'
    return 'D'
from collections import Counter
cnt=Counter(tier(r) for r in rows)
avg5=round(sum(r['reach5'] for r in rows)/len(rows)*100)
avg10=round(sum(r['reach10'] for r in rows)/len(rows)*100)
avg15=round(sum(r['reach15'] for r in rows)/len(rows)*100)
lines=[]
lines.append('# 签名上线后 171 场平衡报告\n')
lines.append('## 总览\n')
lines.append('| 指标 | 数值 | 目标 |')
lines.append('|---|---|---|')
lines.append(f'| 第 5 波存活 | {avg5}% | 70% |')
lines.append(f'| 第 10 波存活 | {avg10}% | 40% |')
lines.append(f'| 第 15 波存活 | {avg15}% | 15% |')
lines.append('')
lines.append('## 梯队分布\n')
for t in 'SABCD':
    lines.append(f'- {t}：{cnt.get(t,0)} 人')
lines.append('')
lines.append('## 完整梯队\n')
lines.append('| 梯队 | 角色 | 阵营 | 第10波存活 | 平均死亡波 | 平均击杀 | 平均等级 |')
lines.append('|---|---|---|---|---|---|---|')
for r in rows:
    fac='鼠' if r['faction']=='mouse' else '猫'
    lines.append(f"| {tier(r)} | {r['name']} | {fac} | {round(r['reach10']*100)}% | {r['avgDeathWave']} | {r['kills']:.0f} | {r['level']:.1f} |")
lines.append('')
lines.append('## 观察\n')
lines.append('- 整体偏难：第 10 波 26%，目标 40%；第 15 波 5%，目标 15%。')
lines.append('- 梯队断层：S/A 10 人，D 档 28 人；最低一批第 3~4 波就倒。')
lines.append('- 高梯队集中在环绕 / 长柄 / 重锤 + 治疗 / 护盾签名，贴身续航仍占优。')
lines.append('- 低梯队集中在速射 / 散射 / 布置 / 灼烧光环，前期清怪不足，签名来不及发挥作用。')
lines.append('')
lines.append('## 建议\n')
lines.append('1. 敌人基础血量 ×2.5 → ×2.0，先看第 10 波能否回到 35~40%。')
lines.append('2. 1~5 波敌人血量额外 -12%，缓解低梯队第 3 波暴毙。')
lines.append('3. 速射 / 散射基础伤害 +12%，布置爆炸 +10%，灼烧光环 +8%。')
lines.append('4. 牛仔杰瑞、剑客汤姆、图多盖洛的续航签名小幅下调。')
lines.append('5. 调整后重跑 171 场，再按角色单独修正。')
open('docs/balance-signatures.md','w',encoding='utf-8').write('\n'.join(lines))
print('S',cnt.get('S',0),'A',cnt.get('A',0),'B',cnt.get('B',0),'C',cnt.get('C',0),'D',cnt.get('D',0))
print('avg',avg5,avg10,avg15)
