from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import re, os
base=r'C:/Users/26370/Downloads/tomjerry/'
doc=Document()
st=doc.styles['Normal']; st.font.name='Microsoft YaHei'; st.font.size=Pt(10.5)
lines=open(base+'docs/GAME_DESIGN_V4.md',encoding='utf-8').read().splitlines()
i=0
while i < len(lines):
    ln=lines[i]
    m=re.match(r'!\[(.*?)\]\((.*?)\)', ln.strip())
    if m:
        cap,src=m.group(1),m.group(2)
        p=os.path.join(base,src)
        if os.path.exists(p):
            doc.add_picture(p, width=Inches(6.1))
            doc.paragraphs[-1].alignment=WD_ALIGN_PARAGRAPH.CENTER
            c=doc.add_paragraph(cap); c.alignment=WD_ALIGN_PARAGRAPH.CENTER
            for run in c.runs: run.font.size=Pt(8.5)
        i+=1; continue
    if ln.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].startswith('|'):
            cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
            if not all(set(c)<=set('-: ') for c in cells): rows.append(cells)
            i+=1
        if rows:
            t=doc.add_table(rows=len(rows),cols=len(rows[0])); t.style='Light Grid Accent 1'
            for r,row in enumerate(rows):
                for c,val in enumerate(row[:len(rows[0])]):
                    cell=t.cell(r,c); cell.text=val
                    for p in cell.paragraphs:
                        for run in p.runs: run.font.size=Pt(9)
        continue
    if ln.strip()=='---': doc.add_paragraph()
    elif ln.startswith('### '): doc.add_heading(ln[4:],level=3)
    elif ln.startswith('## '): doc.add_heading(ln[3:],level=2)
    elif ln.startswith('# '): doc.add_heading(ln[2:],level=0)
    elif ln.startswith('- '): doc.add_paragraph(ln[2:],style='List Bullet')
    elif ln.strip(): doc.add_paragraph(ln)
    i+=1
doc.add_paragraph()
doc.add_paragraph('文档结束 · 猫鼠大作战 1.2.8')
doc.save(base+'docs/猫鼠大作战_设计方案_v4.docx')
print('saved')
