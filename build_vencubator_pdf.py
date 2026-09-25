from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
import os

OUT = os.path.join('output', 'pdf', 'Vencubator_1pager.pdf')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
REG = r'C:\Windows\Fonts\malgun.ttf'
BOLD = r'C:\Windows\Fonts\malgunbd.ttf'
if not os.path.exists(REG):
    raise RuntimeError('Korean font not found')
pdfmetrics.registerFont(TTFont('Malgun', REG))
pdfmetrics.registerFont(TTFont('Malgun-Bold', BOLD if os.path.exists(BOLD) else REG))

W, H = A4
navy = colors.HexColor('#0B2E63')
blue = colors.HexColor('#1261B3')
sky = colors.HexColor('#DFF1FF')
cyan = colors.HexColor('#22B8CF')
orange = colors.HexColor('#FF8A3D')
ink = colors.HexColor('#172B4D')
muted = colors.HexColor('#58708F')
line = colors.HexColor('#D5E3F2')
white = colors.white

def para(c, text, x, y, w, h, size=8.5, leading=None, color=ink, bold=False, align=TA_LEFT):
    style = ParagraphStyle('s', fontName='Malgun-Bold' if bold else 'Malgun', fontSize=size,
                           leading=leading or size*1.35, textColor=color, alignment=align,
                           spaceAfter=0, spaceBefore=0, wordWrap='CJK')
    obj = Paragraph(text, style)
    _, ph = obj.wrap(w, h)
    obj.drawOn(c, x, y+h-ph)

def rr(c, x, y, w, h, fill, stroke=None, r=8, sw=1):
    c.setFillColor(fill); c.setStrokeColor(stroke or fill); c.setLineWidth(sw)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1 if stroke else 0)

def dot(c, x, y, r, fill):
    c.setFillColor(fill); c.circle(x, y, r, fill=1, stroke=0)

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle('Vencubator - 아이디어를 사업으로 키우는 AI 코파일럿')
c.setFillColor(colors.HexColor('#F7FBFF')); c.rect(0, 0, W, H, fill=1, stroke=0)
c.setFillColor(navy); c.rect(0, H-93*mm, W, 93*mm, fill=1, stroke=0)
c.setFillColor(blue); c.circle(W-19*mm, H-23*mm, 42*mm, fill=1, stroke=0)
c.setFillColor(colors.HexColor('#1C74C9')); c.circle(W-5*mm, H-61*mm, 26*mm, fill=1, stroke=0)
c.setStrokeColor(colors.Color(1,1,1,alpha=0.16)); c.setLineWidth(1)
for r in [18, 27, 36]: c.circle(W-23*mm, H-26*mm, r*mm, fill=0, stroke=1)

para(c, 'VENCUBATOR', 17*mm, H-23*mm, 80*mm, 8*mm, size=9, color=colors.HexColor('#A9D9FF'), bold=True)
para(c, '아이디어를 사업으로 키우는<br/>AI 코파일럿', 17*mm, H-59*mm, 108*mm, 31*mm, size=24, leading=29, color=white, bold=True)
para(c, '배우고  ·  검증하고  ·  다음 행동으로 이어지는 창업 실행 파트너', 17*mm, H-69*mm, 126*mm, 8*mm, size=9.7, color=colors.HexColor('#D8ECFF'))

rr(c, 141*mm, H-72*mm, 48*mm, 42*mm, colors.Color(1,1,1,alpha=0.12), colors.Color(1,1,1,alpha=0.26), 10, 0.8)
para(c, '아이디어', 145*mm, H-42*mm, 40*mm, 7*mm, size=8.2, color=white, bold=True, align=TA_CENTER)
c.setStrokeColor(colors.HexColor('#8BDCF0')); c.setLineWidth(2.2); c.line(149*mm,H-49*mm,179*mm,H-49*mm)
for xx, cc in [(149*mm, cyan),(164*mm, orange),(179*mm, colors.HexColor('#C4F0FF'))]: dot(c, xx, H-49*mm, 2.5*mm, cc)
para(c, '성장', 145*mm, H-58*mm, 40*mm, 7*mm, size=13, color=white, bold=True, align=TA_CENTER)
para(c, '지금 필요한 것을 찾아<br/>바로 내 사업에 적용', 145*mm, H-70*mm, 40*mm, 10*mm, size=6.8, leading=8.2, color=colors.HexColor('#D8ECFF'), align=TA_CENTER)

strip_y = H-111*mm
rr(c, 15*mm, strip_y, 180*mm, 15*mm, white, line, 7, 0.7)
para(c, '창업 지식은 넘치지만, 내 아이디어에 적용하는 순간 막힙니다.', 21*mm, strip_y+4.6*mm, 104*mm, 7*mm, size=9.2, color=navy, bold=True)
para(c, 'Vencubator는 지식을 행동으로 번역합니다.', 126*mm, strip_y+4.6*mm, 63*mm, 7*mm, size=8.2, color=blue, bold=True, align=TA_CENTER)

flow_y = H-140*mm
para(c, '한 번의 학습이 아니라, 계속 이어지는 실행 흐름', 15*mm, flow_y+11*mm, 100*mm, 6*mm, size=10.2, color=navy, bold=True)
steps = [('내 아이디어', sky, navy), ('필요한 지식', colors.HexColor('#E8F7FF'), blue), ('검증', colors.HexColor('#FFF1E7'), orange), ('의사결정', colors.HexColor('#E8F4FF'), navy), ('다음 행동', colors.HexColor('#E6FBF5'), colors.HexColor('#008B70'))]
sx = 15*mm; boxw = 32*mm
for i, (label, bg, tc) in enumerate(steps):
    rr(c, sx, flow_y-3*mm, boxw, 12*mm, bg, r=6)
    para(c, label, sx, flow_y+1.1*mm, boxw, 6*mm, size=8.0, color=tc, bold=True, align=TA_CENTER)
    if i < len(steps)-1:
        c.setStrokeColor(colors.HexColor('#8BB3D5')); c.setLineWidth(1.2)
        c.line(sx+boxw+1.5*mm, flow_y+3*mm, sx+boxw+5*mm, flow_y+3*mm)
        c.line(sx+boxw+5*mm, flow_y+3*mm, sx+boxw+3.2*mm, flow_y+4.2*mm)
        c.line(sx+boxw+5*mm, flow_y+3*mm, sx+boxw+3.2*mm, flow_y+1.8*mm)
    sx += 36*mm

col_y = H-229*mm; left_x, right_x, col_w = 15*mm, 106*mm, 84*mm
rr(c, left_x, col_y, col_w, 73*mm, white, line, 8, 0.7)
para(c, '왜 지금 필요한가', left_x+6*mm, col_y+63*mm, col_w-12*mm, 6*mm, size=10.2, color=navy, bold=True)
items = [('01', '지식은 많지만 적용이 어렵습니다', '창업에듀 678개 콘텐츠처럼 정보는 충분합니다. 문제는 배운 내용을 내 아이디어에 연결하는 일입니다.'), ('02', '도구는 많지만 다음 행동이 끊깁니다', '캔버스 작성 이후의 검증, 결과 반영, 의사결정까지 한 흐름으로 이어져야 합니다.'), ('03', '전문 도움은 지속 이용에 부담입니다', '무료 교육과 고비용 컨설팅 사이에서, 혼자서도 반복 실행할 수 있는 도구가 필요합니다.')]
yy = col_y+54*mm
for num, head, body in items:
    dot(c, left_x+9*mm, yy+1.7*mm, 4.4*mm, blue)
    para(c, num, left_x+5.2*mm, yy-0.8*mm, 7.6*mm, 5*mm, size=6.5, color=white, bold=True, align=TA_CENTER)
    para(c, head, left_x+17*mm, yy+1.6*mm, col_w-23*mm, 7*mm, size=8.1, color=navy, bold=True)
    para(c, body, left_x+17*mm, yy-9.6*mm, col_w-23*mm, 13*mm, size=7.0, leading=9.2, color=muted)
    yy -= 18*mm

rr(c, right_x, col_y, col_w, 73*mm, colors.HexColor('#F0F8FF'), colors.HexColor('#B9D8F4'), 8, 0.7)
para(c, 'Vencubator의 차별점', right_x+6*mm, col_y+63*mm, col_w-12*mm, 6*mm, size=10.2, color=navy, bold=True)
para(c, '사용할수록 쌓이는 Business Context', right_x+6*mm, col_y+56*mm, col_w-12*mm, 6*mm, size=8.4, color=blue, bold=True)
context = [('고객', '누구를 위해 만드는가'), ('문제', '무엇을 해결하는가'), ('증거', '무엇을 확인했는가'), ('결정', '무엇을 바꾸는가')]
cx, cy = right_x+6*mm, col_y+39*mm
for i, (a,b) in enumerate(context):
    xx = cx + (i%2)*38*mm; yy2 = cy - (i//2)*17*mm
    rr(c, xx, yy2, 33*mm, 12*mm, white, colors.HexColor('#C7DFF4'), 5, 0.6)
    para(c, a, xx+2*mm, yy2+5.8*mm, 29*mm, 5*mm, size=8.0, color=blue, bold=True, align=TA_CENTER)
    para(c, b, xx+1*mm, yy2+1.4*mm, 31*mm, 4*mm, size=6.0, color=muted, align=TA_CENTER)
para(c, '결과가 쌓일수록 다음 행동이 더 구체적으로 달라집니다.', right_x+6*mm, col_y+5*mm, col_w-12*mm, 12*mm, size=7.7, leading=9.2, color=navy, bold=True, align=TA_CENTER)

band_y = 15*mm
c.setFillColor(navy); c.roundRect(15*mm, band_y, 180*mm, 25*mm, 8, fill=1, stroke=0)
para(c, '12주 검증 계획', 21*mm, band_y+15*mm, 29*mm, 6*mm, size=9.0, color=colors.HexColor('#A9D9FF'), bold=True)
para(c, '첫 가치 경험  ·  프로젝트 완료율  ·  재방문율  ·  두 번째 프로젝트  ·  유료 전환', 21*mm, band_y+8*mm, 92*mm, 7*mm, size=7.4, color=white)
para(c, '초기 가격 가설', 125*mm, band_y+15*mm, 28*mm, 6*mm, size=7.2, color=colors.HexColor('#A9D9FF'), bold=True, align=TA_CENTER)
para(c, '월 14,900원', 122*mm, band_y+7*mm, 34*mm, 8*mm, size=12.5, color=white, bold=True, align=TA_CENTER)
para(c, '무료 교육과 고비용 컨설팅 사이의 지속 가능한 실행 도구', 158*mm, band_y+9*mm, 33*mm, 9*mm, size=6.5, leading=8.2, color=colors.HexColor('#D8ECFF'), align=TA_CENTER)
para(c, 'ASK  초기 사용자와 멘토를 찾습니다  |  “배우기 위해”가 아니라 “발전시키는 과정에서” 배우는 경험을 함께 검증합니다.', 15*mm, 8*mm, 180*mm, 5*mm, size=6.5, color=muted, align=TA_CENTER)
c.showPage(); c.save(); print(OUT)
