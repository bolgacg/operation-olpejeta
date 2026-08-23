#!/usr/bin/env python3
"""Faux expedition photos for the FIELD ALBUM section. Side-view pixel scenes in the
game palette, shot like a researcher's camera: polaroid frame + orange datestamp.
Scenes drawn at 140x100, upscaled x5 (nearest). Output: assets/photos/photoNN.png
plus a labeled contact sheet for review. Captions live in the HTML, not the PNGs."""
from PIL import Image, ImageDraw
import os, random

os.makedirs('assets/photos', exist_ok=True)

# palette (superset of the sprite sheet's)
SAND=(222,203,153); SANDD=(208,187,132); SANDDD=(190,168,112)
SKY=(238,224,190); SKYHI=(246,236,210); DUSK=(226,160,100); DUSKHI=(240,196,120); DUSKSKY=(120,96,110)
GRASS=(156,168,94); GRASSD=(135,148,82)
TREE=(94,126,70); TREED=(74,102,56); TRUNK=(107,83,52)
NAVY=(34,48,63); NAVYM=(68,88,110); WHITE=(232,241,248)
RED=(176,58,58); AMBER=(242,169,59); YELLOW=(245,222,120)
EGREY=(148,144,140); EGREYD=(112,108,105); EOUT=(84,80,78)
ZWHITE=(240,238,230); BLACK=(40,38,36)
KHAKI=(196,176,128); KHAKID=(168,148,100); OLIVE=(58,84,58); OLIVED=(44,66,46)
POACH=(52,46,58); BOOT=(60,50,40)
SKIN1=(224,172,132); SKIN2=(164,116,76); SKIN3=(110,78,54)
HAIR1=(60,48,36); HAIR2=(30,28,26)
BLUE=(70,110,150); TEAL=(80,140,130); ORANGE=(214,120,60)
GLOVE=(120,170,200); COOL=(240,240,240)
DATEC=(255,168,40)
GOCHRE=(200,155,90); GPATCH=(122,90,50); GMUZ=(174,132,86)

W,H=140,100

def canvas(dusk=False):
    im=Image.new('RGB',(W,H),SKY if not dusk else DUSKSKY)
    d=ImageDraw.Draw(im)
    if dusk:
        d.rectangle([0,0,W,18],fill=DUSKSKY)
        d.rectangle([0,18,W,30],fill=(168,120,110))
        d.rectangle([0,30,W,40],fill=DUSK)
        d.rectangle([0,36,W,40],fill=DUSKHI)
    else:
        d.rectangle([0,0,W,26],fill=SKYHI)
    gnd=40
    d.rectangle([0,gnd,W,H],fill=SAND if not dusk else (188,162,116))
    rnd=random.Random(hash((dusk,W)))
    for _ in range(160):
        x=rnd.randrange(W); y=rnd.randrange(gnd+2,H)
        d.point((x,y),fill=SANDD if not dusk else (162,138,98))
    for _ in range(26):
        x=rnd.randrange(W-1); y=rnd.randrange(gnd+4,H-2)
        d.point((x,y),fill=GRASSD); d.point((x+1,y),fill=GRASS)
    d.line([0,gnd,W,gnd],fill=SANDDD)
    return im,d

def far_acacia(d,x,y):
    d.rectangle([x-5,y-3,x+5,y-1],fill=TREED)
    d.rectangle([x-1,y-1,x,y+2],fill=TRUNK)

def acacia(d,x,y,s=1):
    """flat-top acacia; x = trunk base center, y = ground."""
    cw=11*s; ch=5*s; ctop=y-16*s
    d.rectangle([x-cw,ctop+2*s,x+cw,ctop+2*s+ch],fill=TREE)
    d.rectangle([x-cw+2*s,ctop,x+cw-2*s,ctop+2*s],fill=TREE)
    d.rectangle([x-cw,ctop+2*s+ch-s,x+cw,ctop+2*s+ch],fill=TREED)
    for dx in (-7,-2,4,8):
        d.rectangle([x+dx*s,ctop+2*s,x+dx*s+s-1,ctop+3*s],fill=TREED)
    d.rectangle([x-s,ctop+2*s+ch,x+s-1,y],fill=TRUNK)                  # main trunk
    d.line([(x+s,y-6*s),(x+4*s,ctop+2*s+ch)],fill=TRUNK,width=s)       # fork branch

def person(d,x,y,skin=SKIN1,shirt=KHAKI,pants=KHAKID,pose='stand',hat=None,hair=HAIR1,glove=None):
    """side-on-ish crew member. y = ground (boot soles). x = center. 14 wide, 32 tall standing.
    poses: stand wave up thumbs cross point facepalm crouch kneel"""
    hand=glove or skin
    def head(cx,ty):
        d.rectangle([cx-4,ty,cx+3,ty+7],fill=skin)                     # face block
        d.rectangle([cx-4,ty,cx+3,ty+2],fill=hair)                     # hair top
        d.rectangle([cx-4,ty+2,cx-4,ty+5],fill=hair)                   # hair side
        d.point((cx-1,ty+4),fill=BLACK); d.point((cx+2,ty+4),fill=BLACK)
        if hat:
            d.rectangle([cx-6,ty-1,cx+5,ty],fill=hat)                  # brim
            d.rectangle([cx-3,ty-4,cx+2,ty-1],fill=hat)                # crown
    if pose in ('crouch','kneel'):
        ty=y-22
        head(x,ty)
        d.rectangle([x-5,ty+8,x+4,ty+16],fill=shirt)                   # torso
        d.rectangle([x-8,ty+9,x-6,ty+14],fill=shirt)                   # sleeves fwd/down
        d.rectangle([x+5,ty+9,x+7,ty+14],fill=shirt)
        d.rectangle([x-8,ty+14,x-6,ty+16],fill=hand)
        d.rectangle([x+5,ty+14,x+7,ty+16],fill=hand)
        if pose=='crouch':                                             # squat: knees forward
            d.rectangle([x-6,y-6,x+5,y-3],fill=pants)                  # thighs
            d.rectangle([x-6,y-3,x-3,y],fill=BOOT)
            d.rectangle([x+2,y-3,x+5,y],fill=BOOT)
        else:                                                          # kneel: one knee down
            d.rectangle([x-6,y-6,x-1,y],fill=pants)                    # shin down
            d.rectangle([x+1,y-6,x+5,y-3],fill=pants)                  # knee up
            d.rectangle([x+3,y-3,x+6,y],fill=BOOT)
        return
    ty=y-32
    head(x,ty)
    d.rectangle([x-5,ty+8,x+4,ty+19],fill=shirt)                       # torso
    d.rectangle([x-4,ty+20,x-1,y-3],fill=pants)                        # legs
    d.rectangle([x+0,ty+20,x+3,y-3],fill=pants)
    d.rectangle([x-4,y-3,x-1,y],fill=BOOT); d.rectangle([x+0,y-3,x+3,y],fill=BOOT)
    def arm_down(side):
        sx=x-8 if side<0 else x+5
        d.rectangle([sx,ty+9,sx+2,ty+16],fill=shirt)
        d.rectangle([sx,ty+16,sx+2,ty+18],fill=hand)
    def arm_up(side):
        sx=x-8 if side<0 else x+5
        d.rectangle([sx,ty-2,sx+2,ty+10],fill=shirt)
        d.rectangle([sx,ty-4,sx+2,ty-2],fill=hand)
    if pose=='wave': arm_up(1); arm_down(-1)
    elif pose=='up': arm_up(-1); arm_up(1)
    elif pose=='thumbs':
        arm_down(-1)
        d.rectangle([x+5,ty+6,x+7,ty+11],fill=shirt)                   # bent arm
        d.rectangle([x+5,ty+3,x+7,ty+6],fill=hand)                     # fist+thumb
        d.point((x+6,ty+2),fill=hand)
    elif pose=='cross':
        d.rectangle([x-7,ty+10,x+6,ty+13],fill=shirt)                  # crossed band
        d.rectangle([x-7,ty+11,x-5,ty+13],fill=hand); d.rectangle([x+4,ty+11,x+6,ty+13],fill=hand)
    elif pose=='point':
        arm_down(-1)
        d.rectangle([x+5,ty+9,x+11,ty+11],fill=shirt)                  # arm out
        d.rectangle([x+11,ty+9,x+13,ty+11],fill=hand)
    elif pose=='facepalm':
        arm_down(-1)
        d.rectangle([x+5,ty+2,x+7,ty+10],fill=shirt)                   # arm to face
        d.rectangle([x+1,ty+2,x+5,ty+5],fill=hand)                     # palm on face
    else: arm_down(-1); arm_down(1)

def rhino_lying(d,x,y):
    """anesthetised white rhino on its side/brisket; x,y = ground center. ~64 wide, 26 tall."""
    d.ellipse([x-30,y-22,x+30,y+2],fill=EGREY)                          # body mass
    d.rectangle([x-30,y-12,x+30,y],fill=EGREY)
    d.arc([x-30,y-22,x+30,y-2],180,360,fill=EOUT)                       # back line, top only
    d.rectangle([x+8,y-24,x+22,y-16],fill=EGREY)                        # shoulder hump
    # head resting on ground, facing right
    d.rectangle([x+26,y-14,x+44,y-2],fill=EGREY)                        # head block
    d.rectangle([x+40,y-8,x+48,y-1],fill=EGREY)                         # square lip
    d.polygon([(x+44,y-8),(x+45,y-8),(x+51,y-24),(x+48,y-24),(x+42,y-8)],fill=(196,192,184))  # front horn, tall
    d.polygon([(x+38,y-13),(x+42,y-22),(x+43,y-12)],fill=(178,174,166)) # back horn
    d.rectangle([x+24,y-20,x+29,y-13],fill=EGREYD)                      # ear
    d.rectangle([x+29,y-13,x+40,y-9],fill=BLACK)                        # blindfold
    d.rectangle([x+29,y-13,x+40,y-12],fill=(74,70,64))
    for lx in (x-22,x-8,x+4):
        d.rectangle([lx,y-3,lx+7,y+1],fill=EGREYD)                      # folded legs
    d.line([(x-30,y-10),(x-26,y-16)],fill=EOUT)                         # tail
    for k,(zx,zy) in enumerate([(x+30,y-26),(x+33,y-30),(x+37,y-34)]):  # zzz floating above head
        d.rectangle([zx,zy,zx+1+(k>1),zy+1],fill=WHITE)

def drone_side(d,x,y,body=NAVY,stripe=AMBER,rot=NAVYM):
    """side-view quad; x,y = body center. 18 wide."""
    d.rectangle([x-6,y-2,x+5,y+2],fill=body)
    d.rectangle([x-6,y-2,x+5,y-2],fill=stripe)
    d.rectangle([x-8,y-5,x-6,y-3],fill=body); d.rectangle([x+6,y-5,x+8,y-3],fill=body)   # arms up to rotors
    d.rectangle([x-11,y-6,x-4,y-5],fill=rot)                            # rotor discs
    d.rectangle([x+3,y-6,x+10,y-5],fill=rot)
    d.rectangle([x-5,y+3,x-4,y+5],fill=rot); d.rectangle([x+3,y+3,x+4,y+5],fill=rot)     # legs
    d.rectangle([x-2,y+2,x+1,y+4],fill=BLACK)                           # camera ball
    d.point((x-1,y+3),fill=WHITE)

def giraffe_head(d,x,y):
    """giraffe photobombing: neck sweeps in from top-right, head at x,y (muzzle tip)."""
    for i in range(10):                                                 # blocky neck, overlapping steps
        nx=x+6+i*4; ny=y-6-i*6
        d.rectangle([nx,ny-10,nx+9,ny],fill=GOCHRE)
        if i%2==0: d.rectangle([nx+3,ny-6,nx+5,ny-4],fill=GPATCH)
        else: d.rectangle([nx+6,ny-9,nx+8,ny-7],fill=GPATCH)
    d.rectangle([x+2,y-12,x+16,y-2],fill=GOCHRE)                        # head
    d.rectangle([x-4,y-8,x+2,y-2],fill=GMUZ)                            # muzzle
    d.point((x-2,y-5),fill=BLACK)                                       # nostril
    d.rectangle([x+6,y-10,x+8,y-8],fill=BLACK)                          # eye
    d.rectangle([x+9,y-18,x+11,y-12],fill=GPATCH)                       # ossicones
    d.rectangle([x+14,y-17,x+16,y-12],fill=GPATCH)
    d.rectangle([x+9,y-19,x+11,y-18],fill=BLACK)                        # black tips
    d.rectangle([x+14,y-18,x+16,y-17],fill=BLACK)
    d.rectangle([x+16,y-14,x+21,y-8],fill=GOCHRE)                       # ear out
def zebra(d,x,y,s=1):
    """side view zebra; x,y = ground center. 22 wide at s=1."""
    d.rectangle([x-9,y-13,x+9,y-5],fill=ZWHITE)                         # body
    for i,sx in enumerate(range(-8,9,3)):
        d.rectangle([x+sx,y-13,x+sx+1,y-6],fill=BLACK)                  # bold stripes
    d.rectangle([x-14,y-19,x-9,y-11],fill=ZWHITE)                       # neck
    d.rectangle([x-13,y-18,x-12,y-12],fill=BLACK)
    d.rectangle([x-18,y-22,x-11,y-16],fill=ZWHITE)                      # head
    d.rectangle([x-19,y-19,x-16,y-16],fill=BLACK)                       # muzzle
    d.point((x-15,y-20),fill=BLACK)
    d.rectangle([x-13,y-24,x-12,y-22],fill=BLACK)                       # ears
    d.rectangle([x-10,y-24,x-9,y-22],fill=BLACK)
    for lx in (x-8,x-4,x+3,x+7):
        d.rectangle([lx,y-5,lx+1,y],fill=ZWHITE)                        # legs
        d.rectangle([lx,y-1,lx+1,y],fill=BLACK)                         # hooves
    d.rectangle([x+9,y-12,x+10,y-7],fill=BLACK)                         # tail

def elephant_side(d,x,y):
    """standing elephant ~44 wide; x,y = ground center."""
    d.ellipse([x-20,y-26,x+20,y-2],fill=EGREY)
    d.rectangle([x-16,y-14,x+16,y-4],fill=EGREY)
    d.ellipse([x-34,y-26,x-16,y-6],fill=EGREY)                          # head
    d.rectangle([x-33,y-14,x-29,y+1],fill=EGREYD)                       # trunk
    d.rectangle([x-33,y+0,x-30,y+1],fill=EGREYD)
    d.ellipse([x-26,y-30,x-12,y-16],fill=EGREYD)                        # ear
    d.point((x-29,y-18),fill=BLACK)
    d.rectangle([x-36,y-10,x-33,y-8],fill=WHITE)                        # tusk
    for lx in (x-16,x-6,x+8):
        d.rectangle([lx,y-6,lx+5,y],fill=EGREY)
        d.rectangle([lx,y-1,lx+5,y],fill=EGREYD)
    d.line([(x+20,y-18),(x+23,y-8)],fill=EGREYD)                        # tail

def tent(d,x,y,s=2):
    d.polygon([(x-7*s,y),(x,y-6*s),(x+7*s,y)],fill=(200,72,60))
    d.polygon([(x-7*s,y),(x-6*s,y),(x,y-5*s),(x,y-6*s)],fill=(160,55,48))
    d.rectangle([x-s,y-3*s,x+s,y],fill=(70,40,36))

def table(d,x,y,w=26):
    d.rectangle([x-w//2,y-13,x+w//2,y-11],fill=TRUNK)
    d.rectangle([x-w//2+1,y-11,x-w//2+2,y],fill=(80,62,40))
    d.rectangle([x+w//2-2,y-11,x+w//2-1,y],fill=(80,62,40))

def laptop(d,x,y):
    """x,y = base rear on the table top"""
    d.rectangle([x-4,y-7,x+4,y-1],fill=(60,60,64))
    d.rectangle([x-3,y-6,x+3,y-2],fill=(150,200,170))
    d.rectangle([x-5,y-1,x+5,y],fill=(90,90,96))

# --- 3x5 pixel digit font for the datestamp ---
DIG={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],
 '2':['111','001','111','100','111'],'3':['111','001','111','001','111'],
 '4':['101','101','111','001','001'],'5':['111','100','111','001','111'],
 '6':['111','100','111','101','111'],'7':['111','001','010','010','010'],
 '8':['111','101','111','101','111'],'9':['111','101','111','001','111'],
 ' ':['000','000','000','000','000'],'.':['000','000','000','000','010']}
def datestamp(d,s,x,y):
    for ch in s:
        g=DIG.get(ch)
        if g:
            for gy,row in enumerate(g):
                for gx,c in enumerate(row):
                    if c=='1': d.point((x+gx,y+gy),fill=DATEC)
        x+=4

SCALE=5
def save(im,n,stamp):
    d=ImageDraw.Draw(im)
    datestamp(d,stamp,W-4*len(stamp)-3,H-8)
    big=im.resize((W*SCALE,H*SCALE),Image.NEAREST)
    fw,fh=W*SCALE+2*28,H*SCALE+28+86                                   # polaroid frame
    ph=Image.new('RGB',(fw,fh),(252,250,244))
    ph.paste(big,(28,28))
    dd=ImageDraw.Draw(ph)
    dd.rectangle([27,27,28+W*SCALE,28+H*SCALE],outline=(210,204,190))
    dd.rectangle([0,0,fw-1,fh-1],outline=(198,192,178))
    ph.save(f'assets/photos/photo{n:02d}.png')
    return ph

random.seed(4209)
PHOTOS=[]

# ---- 01: rhino ops morning, crew posing with anesthetised rhino ----
im,d=canvas()
far_acacia(d,18,36); far_acacia(d,120,34)
person(d,50,80,skin=SKIN1,shirt=KHAKI,pants=KHAKID,pose='thumbs',hat=AMBER)        # researcher thumbs up, behind
person(d,84,78,skin=SKIN3,shirt=BLUE,pants=NAVYM,pose='stand',glove=GLOVE)         # vet behind body
rhino_lying(d,66,88)                                                               # drawn after: hides their legs
person(d,20,88,skin=SKIN2,shirt=OLIVE,pants=OLIVED,pose='crouch',hat=OLIVED)       # ranger crouched in front
d.rectangle([116,82,128,88],fill=COOL); d.rectangle([116,82,128,83],fill=RED)      # med kit
d.rectangle([120,84,123,86],fill=RED)
PHOTOS.append(save(im,1,'26 07 14'))

# ---- 02: drone launch, hand catch ----
im,d=canvas()
far_acacia(d,30,35); far_acacia(d,64,37); far_acacia(d,102,34)
acacia(d,16,66)
person(d,58,90,skin=SKIN1,shirt=KHAKI,pants=KHAKID,pose='up',hat=AMBER)
drone_side(d,58,50)                                                                # drone above hands
person(d,94,90,skin=SKIN3,shirt=TEAL,pants=NAVYM,pose='stand')
d.rectangle([88,74,101,79],fill=(60,60,64))                                        # controller held in front
d.rectangle([90,70,91,74],fill=(60,60,64)); d.rectangle([98,70,99,74],fill=(60,60,64))
d.rectangle([89,75,92,76],fill=(150,200,170))                                      # controller screen
PHOTOS.append(save(im,2,'26 07 15'))

# ---- 03: suspect in custody, rangers either side ----
im,d=canvas()
far_acacia(d,14,35)
acacia(d,126,62)
person(d,48,88,skin=SKIN3,shirt=OLIVE,pants=OLIVED,pose='cross',hat=OLIVED)
person(d,68,88,skin=SKIN1,shirt=POACH,pants=(40,36,46),pose='stand',hair=HAIR2)
d.rectangle([62,70,73,73],fill=(120,116,124))                                       # bound hands front
person(d,88,88,skin=SKIN2,shirt=OLIVE,pants=OLIVED,pose='point',hat=OLIVED)        # pointing at him
drone_side(d,26,48,body=NAVYM,stripe=RED)                                           # thermal drone above
d.polygon([(20,54),(32,54),(38,70),(14,70)],fill=(246,238,196))                     # spotlight cone
PHOTOS.append(save(im,3,'26 07 19'))

# ---- 04: camp group photo ----
im,d=canvas()
tent(d,20,72,s=2); tent(d,122,76,s=2)
d.rectangle([46,84,96,90],fill=(194,178,146))                                       # pad
d.rectangle([48,85,94,89],fill=(168,152,120))
drone_side(d,56,80); drone_side(d,71,80,body=NAVYM,stripe=RED); drone_side(d,86,80,body=EGREY,stripe=WHITE)
xs=[34,50,66,82,98,112]
skins=[SKIN1,SKIN3,SKIN2,SKIN1,SKIN2,SKIN3]
shirts=[KHAKI,BLUE,OLIVE,TEAL,KHAKI,ORANGE]
poses=['wave','stand','wave','thumbs','up','wave']
hats=[AMBER,None,OLIVED,None,AMBER,None]
for x,s_,sh,po,ha in zip(xs,skins,shirts,poses,hats):
    person(d,x,70,skin=s_,shirt=sh,pants=KHAKID,pose=po,hat=ha)
PHOTOS.append(save(im,4,'26 07 16'))

# ---- 05: vet sample loading onto the Mini ----
im,d=canvas()
far_acacia(d,20,36); far_acacia(d,52,34)
tent(d,124,66,s=2)
person(d,66,88,skin=SKIN2,shirt=BLUE,pants=NAVYM,pose='kneel',glove=GLOVE)
drone_side(d,40,82,body=EGREY,stripe=WHITE)
d.rectangle([51,84,59,89],fill=COOL)                                                # cooler between them
d.rectangle([51,84,59,85],fill=RED); d.rectangle([54,86,56,88],fill=RED)
PHOTOS.append(save(im,5,'26 07 17'))

# ---- 06: elephant collar day ----
im,d=canvas()
far_acacia(d,116,35)
elephant_side(d,92,88)
d.rectangle([70,74,78,77],fill=(96,74,52))                                          # collar on neck
d.point((74,75),fill=RED)                                                           # tracker LED
person(d,22,88,skin=SKIN1,shirt=KHAKI,pants=KHAKID,pose='point',hat=KHAKID)
person(d,44,90,skin=SKIN3,shirt=TEAL,pants=NAVYM,pose='stand')
d.rectangle([49,60,50,74],fill=(60,60,64))                                          # antenna up
d.rectangle([47,66,52,68],fill=(60,60,64)); d.rectangle([45,74,53,78],fill=(60,60,64))
PHOTOS.append(save(im,6,'26 07 21'))

# ---- 07: giraffe photobomb ----
im,d=canvas()
far_acacia(d,18,36)
person(d,44,88,skin=SKIN2,shirt=ORANGE,pants=KHAKID,pose='wave')
person(d,62,88,skin=SKIN1,shirt=KHAKI,pants=KHAKID,pose='thumbs',hat=AMBER)
giraffe_head(d,80,70)                                                               # leaning into frame from NE
PHOTOS.append(save(im,7,'26 07 18'))

# ---- 08: drone stuck in the acacia ----
im,d=canvas()
acacia(d,74,90,s=2)
drone_side(d,70,66)                                                                 # wedged in canopy
d.rectangle([58,68,86,70],fill=TREED)                                               # branch over it
d.rectangle([64,60,66,62],fill=TREE); d.rectangle([78,58,80,60],fill=TREE)          # leaves knocked up
person(d,34,92,skin=SKIN1,shirt=KHAKI,pants=KHAKID,pose='up')                       # reaching hopelessly
person(d,112,92,skin=SKIN3,shirt=BLUE,pants=NAVYM,pose='facepalm')                  # despair
d.rectangle([70,44,71,50],fill=RED); d.point((70,52),fill=RED)                      # ! above drone
PHOTOS.append(save(im,8,'26 07 22'))

# ---- 09: ops desk at dusk ----
im,d=canvas(dusk=True)
far_acacia(d,20,36); far_acacia(d,130,35)
tent(d,120,78,s=2)
table(d,56,94,w=40)
laptop(d,44,81); laptop(d,62,81)
d.rectangle([72,75,76,81],fill=(60,60,64)); d.point((74,74),fill=RED)               # radio, LED
d.rectangle([77,71,77,75],fill=(60,60,64))                                          # antenna
person(d,28,96,skin=SKIN2,shirt=KHAKI,pants=KHAKID,pose='stand')
person(d,90,96,skin=SKIN1,shirt=OLIVE,pants=OLIVED,pose='point',hat=OLIVED)         # pointing at sky
drone_side(d,112,52)                                                                # last aircraft coming home
PHOTOS.append(save(im,9,'26 07 24'))

# ---- 10: the zebra noise study ----
im,d=canvas()
far_acacia(d,120,35)
zebra(d,96,84); zebra(d,120,90); zebra(d,106,96)
person(d,22,90,skin=SKIN3,shirt=KHAKI,pants=KHAKID,pose='stand',hat=AMBER)
d.rectangle([32,62,33,82],fill=(60,60,64))                                          # mic pole
d.rectangle([29,57,36,62],fill=(60,60,64))                                          # mic windshield
d.rectangle([28,59,29,60],fill=(90,90,96))
d.rectangle([12,72,17,79],fill=COOL); d.rectangle([12,72,17,73],fill=(60,60,64))    # clipboard held
drone_side(d,66,46)                                                                 # drone overhead mid-field
PHOTOS.append(save(im,10,'26 07 20'))

# ---- contact sheet ----
cols=5; pw,ph_=PHOTOS[0].size
cs=Image.new('RGB',(cols*(pw+16)+16, 2*(ph_+40)+16),(226,222,212))
dd=ImageDraw.Draw(cs)
for k,p in enumerate(PHOTOS):
    x=16+(k%cols)*(pw+16); y=16+(k//cols)*(ph_+40)
    cs.paste(p,(x,y))
    dd.text((x+4,y+ph_+6),f'photo{k+1:02d}',fill=(60,56,48))
cs.save('assets/photos/contact-sheet.png')
print('10 photos + contact sheet -> assets/photos/')
