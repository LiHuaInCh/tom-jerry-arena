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
from collections import Counter, defaultdict
print(Counter(tier(r) for r in rows))
byname={r['id']:r for r in rows}
for t in 'SABCD':
    print('\n['+t+']')
    print('、'.join(r['name']+('(%.0f)'%(r['reach10']*100)) for r in rows if tier(r)==t))
print('\nfile=',len(rows))
