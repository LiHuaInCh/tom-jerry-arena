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
lines=['# 难度分档后的普通难度 171 场\n','| 指标 | 数值 | 目标 |','|---|---|---|']
lines.append(f"| 第5波 | {round(sum(r['reach5'] for r in rows)/len(rows)*100)}% | 70% |")
lines.append(f"| 第10波 | {round(sum(r['reach10'] for r in rows)/len(rows)*100)}% | 40% |")
lines.append(f"| 第15波 | {round(sum(r['reach15'] for r in rows)/len(rows)*100)}% | 15% |")
lines.append('')
lines.append('梯队：'+' / '.join(f'{t} {cnt.get(t,0)}' for t in 'SABCD'))
lines.append('')
lines.append('## 前十\n')
for r in rows[:10]: lines.append(f"- {r['name']}：10波 {round(r['reach10']*100)}%，{r['kills']:.0f} 杀，{r['level']:.1f} 级")
lines.append('')
lines.append('## 后十\n')
for r in rows[-10:]: lines.append(f"- {r['name']}：10波 {round(r['reach10']*100)}%，{r['kills']:.0f} 杀，{r['level']:.1f} 级")
open('docs/balance-tuned3.md','w',encoding='utf-8').write('\n'.join(lines))
print(cnt)
