from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

W, H = 960, 540
FPS = 10
OUT = 'output/video/Vencubator_prototype.gif'
PHOTO = 'tmp/video/scene_photo.png'
os.makedirs(os.path.dirname(OUT), exist_ok=True)

FONT = r'C:\Windows\Fonts\malgun.ttf'
BOLD = r'C:\Windows\Fonts\malgunbd.ttf'
f = lambda size: ImageFont.truetype(FONT, size)
fb = lambda size: ImageFont.truetype(BOLD if os.path.exists(BOLD) else FONT, size)

navy=(11,46,99); blue=(18,97,179); cyan=(34,184,207); orange=(255,138,61)
white=(255,255,255); ink=(23,43,77); muted=(88,112,143)

src = Image.open(PHOTO).convert('RGB')
scale = max(W/src.width, H/src.height)
photo = src.resize((int(src.width*scale), int(src.height*scale)), Image.Resampling.LANCZOS)
left=(photo.width-W)//2; top=(photo.height-H)//2
photo=photo.crop((left,top,left+W,top+H))

def fit_text(draw, text, xy, font, fill, maxw=None, anchor=None):
    if maxw:
        while draw.textbbox((0,0), text, font=font)[2] > maxw and font.size > 10:
            font = f(font.size-1)
    draw.text(xy, text, font=font, fill=fill, anchor=anchor)

def bubble(im, xy, text, fill, textfill=ink, width=320):
    d=ImageDraw.Draw(im); x,y=xy; font=fb(20); bbox=d.multiline_textbbox((0,0),text,font=font,spacing=5)
    w=min(width,max(170,bbox[2]-bbox[0]+38)); h=bbox[3]-bbox[1]+30
    d.rounded_rectangle((x,y,x+w,y+h),18,fill=fill)
    d.multiline_text((x+19,y+15),text,font=font,fill=textfill,spacing=5)
    return (x,y,w,h)

def tree_layer(progress, healthy):
    im=Image.new('RGBA',(420,500),(0,0,0,0)); d=ImageDraw.Draw(im)
    # glow when healthy
    if healthy:
        glow=Image.new('RGBA',im.size,(0,0,0,0)); gd=ImageDraw.Draw(glow)
        gd.ellipse((45,30,375,350),fill=(60,200,180,45)); glow=glow.filter(ImageFilter.GaussianBlur(25)); im.alpha_composite(glow)
    trunk=(116,78,43) if healthy else (101,72,50)
    leaf=(43,154,101) if healthy else (118,113,93)
    d.line((210,420,210,190),fill=trunk,width=18)
    d.line((210,300,115,195),fill=trunk,width=9); d.line((210,285,305,180),fill=trunk,width=9)
    for cx,cy,rr in [(112,160,68),(210,110,90),(308,150,70),(145,235,60),(270,230,63)]:
        d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),fill=leaf)
    fruits=[(112,145,'고객'),(210,80,'문제'),(310,145,'시장'),(140,225,'검증'),(275,220,'결정')]
    for x,y,label in fruits:
        val=progress
        if val<.34: col=(208,64,55)
        elif val<.68: col=orange
        else: col=(31,150,185) if not healthy else (28,177,132)
        d.ellipse((x-30,y-30,x+30,y+30),fill=col,outline=(255,255,255,200),width=3)
        d.arc((x-22,y-22,x+22,y+22),90,90+int(360*val),fill=(255,255,255),width=5)
        d.text((x,y),label,font=fb(12),fill=white,anchor='mm')
    return im

frames=[]
total=130
for i in range(total):
    t=i/FPS
    im=photo.copy().convert('RGBA')
    d=ImageDraw.Draw(im)
    # cinematic blue wash
    if t>=8.8:
        d.rectangle((0,0,W,H),fill=(16,54,110,80))
    # scene 1: chat on phone
    if t<3.2:
        d.rectangle((0,0,W,64),fill=(8,28,58,190))
        d.text((32,31),'VENCUBATOR  ·  AI CO-PILOT',font=fb(21),fill=white,anchor='lm')
        bubble(im,(560,90),'안녕하세요.\n아이디어를 들려주세요.',(229,244,255),navy)
        if t>0.8: bubble(im,(520,205),'사람들이 출근할 때\n간편하게 먹을 수 있는\n아침 서비스를 만들고 싶어요.',(255,255,255),ink,350)
        if t>1.8: bubble(im,(585,370),'대상 고객은\n어떤 고통을 느끼고 있나요?',(229,244,255),navy,310)
        d.text((34,H-28),'서툴지만, 아이디어를 말하기 시작하는 순간',font=f(22),fill=white)
    # scene 2: phone screen becomes full composition
    elif t<5.0:
        d.rectangle((0,0,W,H),fill=(9,34,75,90))
        d.rounded_rectangle((65,65,895,475),28,outline=(220,240,255),width=3)
        d.text((95,95),'Vencubator',font=fb(31),fill=white)
        d.text((95,145),'지금 필요한 질문부터 시작합니다',font=f(24),fill=(210,234,255))
        bubble(im,(110,220),'대상 고객은 어떤 고통을 느끼고 있나요?',(229,244,255),navy,540)
        if t>4.0: bubble(im,(110,330),'경쟁 서비스와 비교했을 때\n왜 당신의 아이디어여야 하나요?',(255,255,255),ink,560)
        d.text((95,440),'AI가 묻고, 나는 내 사업을 더 선명하게 답한다.',font=fb(22),fill=white)
    # scene 3-4: split screen with idea tree
    elif t<9.2:
        prog=max(0,min(1,(t-5.0)/3.8))
        # left panel slides in
        split=min(1,(t-5.0)/0.8); sx=int(-W/2*(1-split))
        d.rectangle((sx,0,sx+W//2,H),fill=(242,249,255,255))
        d.rectangle((sx+W//2,0,W,H),fill=(16,45,92,210))
        d.text((sx+32,35),'아이디어 나무',font=fb(28),fill=navy)
        tl=tree_layer(prog, prog>.75); im.alpha_composite(tl,(sx+40,75))
        d.text((sx+44,480),'고객  ·  문제  ·  시장  ·  검증  ·  결정',font=f(17),fill=muted)
        bubble(im,(540,82),'오늘의 질문\n가장 먼저 검증할 가설은?',(229,244,255),navy,330)
        if t>6.1: bubble(im,(560,255),'첫 고객 5명에게\n아침 식사 습관을 인터뷰해볼게요.',(255,255,255),ink,330)
        d.text((535,466),'답할 때마다 지식이 쌓이고, 나무가 건강해집니다.',font=f(18),fill=white)
    # scene 5: transformation
    else:
        p=min(1,(t-9.2)/1.6)
        d.rectangle((0,0,W,H),fill=(20,78,145,int(105*p)))
        tl=tree_layer(1,True).resize((260,310),Image.Resampling.LANCZOS)
        im.alpha_composite(tl,(80,95-int(60*p)))
        # light burst
        if p>.45:
            for k in range(10):
                ang=2*math.pi*k/10; r=180+80*p
                d.line((480,270,480+math.cos(ang)*r,270+math.sin(ang)*r),fill=(255,222,130,150),width=4)
        d.rounded_rectangle((470,100,885,425),24,fill=(8,36,79,145),outline=(180,230,255,230),width=3)
        d.text((520,142),'아이디어가 사업이 되는 순간',font=fb(29),fill=white)
        d.text((520,210),'지식  →  검증  →  결정  →  성장',font=fb(24),fill=(163,228,255))
        d.text((520,285),'Vencubator',font=fb(43),fill=white)
        d.text((520,350),'이제, 다음 행동이 보입니다.',font=f(24),fill=(226,244,255))
        d.text((60,470),'야호~!',font=fb(32),fill=white)
    frames.append(im.convert('RGB'))

frames[0].save(OUT, save_all=True, append_images=frames[1:], duration=[int(1000/FPS)]*len(frames), loop=0, optimize=False)
print(OUT)
