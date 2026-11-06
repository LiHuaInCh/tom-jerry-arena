# -*- coding: utf-8 -*-
import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

d = json.load(open('docs/chars.json', encoding='utf-8'))
chars = d['chars']
wb = Workbook()
ws = wb.active
ws.title = '角色面板'
head = ['角色','阵营','定位','武器','类型','武器伤害','冷却(秒)','技能','技能类型','技能CD','天赋','天赋效果','生命','移速','简介']
ws.append(head)
for c in chars:
    ws.append([c['name'], c['faction'], c['title'], c['wname'], c['wkind'], c['wdmg'], round(c['wcd'],2), c['sname'], c['skind'], round(c['scd'],2), c['tname'], c['tdesc'], c['hp'], c['speed'], c['desc']])

thin = Side(style='thin', color='B8905F')
border = Border(left=thin, right=thin, top=thin, bottom=thin)
hfill = PatternFill('solid', fgColor='3A2418')
hfont = Font(color='FFF6E0', bold=True, size=11)
for row in ws.iter_rows(min_row=1, max_row=ws.max_row, max_col=len(head)):
    for cell in row:
        cell.border = border
        cell.alignment = Alignment(vertical='center', wrap_text=(cell.row == 1 or cell.column in (3,12,15)))
        if cell.row == 1:
            cell.fill = hfill; cell.font = hfont
        elif cell.column == 2:
            cell.fill = PatternFill('solid', fgColor='E8F1FB' if cell.value == '鼠' else 'FBE8E6')
widths = [12,6,12,14,8,10,10,14,10,9,8,26,8,8,34]
for i,w in enumerate(widths,1): ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = 'A2'
ws.auto_filter.ref = ws.dimensions

ws2 = wb.create_sheet('元素融合')
ws2.append(['组合','名称','效果'])
for k,v in d['fusions'].items():
    ws2.append([' + '.join(x.strip() for x in k.split('+')), v.get('name',''), v.get('desc','')])
for row in ws2.iter_rows(min_row=1, max_row=ws2.max_row, max_col=3):
    for cell in row:
        cell.border = border
        if cell.row == 1:
            cell.fill = hfill; cell.font = hfont
ws2.column_dimensions['A'].width = 14
ws2.column_dimensions['B'].width = 12
ws2.column_dimensions['C'].width = 46

wb.save('docs/角色图鉴.xlsx')
print('rows', ws.max_row - 1)
