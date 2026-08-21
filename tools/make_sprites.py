"""8-bit sprite sheet for the conservancy game. Every sprite is a hand-drawn ASCII pixel map.
Palette: warm safari, 8-bit discipline (few colors, hard edges). Output: individual PNGs +
a labeled contact sheet at 5x for review."""
from PIL import Image, ImageDraw
import os

P = {  # palette
 '.': None,             # transparent
 'S': (222,203,153),    # savanna sand
 's': (208,187,132),    # sand shade
 'G': (156,168,94),     # grass green
 'g': (135,148,82),     # grass shade
 'D': (166,138,96),     # dirt track
 'W': (126,168,184),    # water
 'w': (106,148,166),    # water deep
 'K': (34,48,63),       # drone dark navy
 'k': (68,88,110),      # drone mid
 'köp': (68,88,110),
 'L': (232,241,248),    # light/white
 'R': (176,58,58),      # alert red
 'A': (242,169,59),     # amber
 'O': (200,155,90),     # giraffe ochre
 'o': (122,90,50),      # giraffe patch/dark brown
 'E': (148,144,140),    # elephant grey
 'e': (112,108,105),    # elephant shade
 'Z': (240,238,230),    # zebra white
 'z': (40,38,36),       # zebra stripe / black
 'T': (94,126,70),      # acacia green
 't': (74,102,56),      # acacia shade
 'B': (107,83,52),      # trunk brown
 'V': (58,84,58),       # ranger green
 'P': (52,46,58),       # poacher dark
 'Y': (245,222,120),    # spotlight yellow
 'H': (194,178,146),    # pad concrete
 'h': (168,152,120),    # pad shade
 'C': (200,72,60),      # tent red-orange
 'c': (160,55,48),      # tent shade
}

def sprite(name, rows):
    h=len(rows); w=max(len(r) for r in rows)
    im=Image.new('RGBA',(w,h),(0,0,0,0))
    px=im.load()
    for y,row in enumerate(rows):
        for x,ch in enumerate(row):
            col=P.get(ch)
            if col: px[x,y]=col+(255,)
    im.save(f'assets/{name}.png')
    return im

SP={}

# ---------- drones, top-down 16x16, 2 rotor frames ----------
def drone(body, accent, cam):
    f1=[
    "..kk........kk..",
    ".kKKk......kKKk.",
    ".kK.k......k.Kk.",
    ".kk..%s..kk.".replace('%s','BBBBBB') if False else None,
    ]
    # build programmatically instead: X-frame quad
    rows=[list('.'*16) for _ in range(16)]
    def rotor(cx,cy):
        for dx,dy in [(-1,-2),(0,-2),(1,-2),(-2,-1),(2,-1),(-2,0),(2,0),(-2,1),(2,1),(-1,2),(0,2),(1,2)]:
            rows[cy+dy][cx+dx]='k'
        rows[cy][cx]='K'
    for cx,cy in [(3,3),(12,3),(3,12),(12,12)]:
        rotor(cx,cy)
    # arms
    for i in range(5,8): rows[i][i]=body; rows[i][15-i]=body; rows[15-i][i]=body; rows[15-i][15-i]=body
    # body 6x6
    for y in range(5,11):
        for x in range(5,11):
            rows[y][x]=body
    for x in range(6,10): rows[5][x]=accent
    rows[7][7]=cam; rows[7][8]=cam
    rows[10][7]='z'; rows[10][8]='z'
    return [''.join(r) for r in rows]

SP['drone_m3e']  = sprite('drone_m3e',  drone('K','A','L'))   # Mavic 3E: navy, amber stripe
SP['drone_m2t']  = sprite('drone_m2t',  drone('k','R','R'))   # Mavic 2T: thermal red nose
SP['drone_mini'] = sprite('drone_mini', drone('E','L','z'))   # Mini 4 Pro: light grey

# ---------- giraffe 16x24, side view ----------
SP['giraffe']=sprite('giraffe',[
"..o.o.............",
"..OOO.............",
".oOOO.............",
"..OO..............",
"..OO..............",
"..OO..............",
"...OO.............",
"...OO.............",
"...OO.............",
"....OO............",
"....OO............",
".....OOOOOOOOOO...",
".....OOoOOOOoOOO..",
".....OOOOoOOOOOOo.",
".....OoOOOOoOOOO..",
".....OOOOOOOOOO...",
"......Oo.....Oo...",
"......O......O....",
"......O......O....",
"......O......O....",
"......O......O....",
".....oO.....oO....",
])

# ---------- elephant 24x16 ----------
SP['elephant']=sprite('elephant',[
".......EEEEEEEEEEEEE......",
".....EEEEEEEEEEEEEEEEE....",
"...EEEEEEEEEEEEEEEEEEEE...",
"..EEEEEeeeEEEEEEEEEEEEEE..",
"..EzEEeeeeeEEEEEEEEEEEEE..",
"..EEEEeeeeeEEEEEEEEEEEEE..",
"..EEEEEeeeEEEEEEEEEEEEEE..",
"..EEEEEEEEEEEEEEEEEEEEEE..",
"..EELEEEEEEEEEEEEEEEEEE...",
"..EELEEEEEEEEEEEEEEEEEEe..",
"..EE.EEEEE..EEEEE..EEEE.e.",
"..EE.EEEEE..EEEEE..EEEE...",
"..EE.eEEEe..eEEEe..eEEe...",
"..Ee.eEEEe..eEEEe..eEEe...",
"..ee......................",
])

# ---------- zebra 16x14 ----------
SP['zebra']=sprite('zebra',[
"................",
"..zz............",
".zZZz...........",
".zZz............",
".zZZ............",
"..ZZzZZzZZzZZz..",
"..zZZzZZzZZzZZ..",
"..ZZzZZzZZzZZz..",
"..zZZzZZzZZzZZ..",
"...Z...Z..Z..Z..",
"...Z...Z..Z..Z..",
"...z...z..z..z..",
])

# ---------- rhino 20x12 (Ol Pejeta's soul) ----------
SP['rhino']=sprite('rhino',[
"..........EEEEEE....",
"........EEEEEEEEEE..",
".......EEEEEEEEEEEE.",
"..L...EEEEEEEEEEEEE.",
"..L..EEEEEEEEEEEEEE.",
"..LLEEEzEEEEEEEEEEE.",
"..LLEEEEEEEEEEEEEEE.",
"..EEEEEEEEEEEEEEEEE.",
"..EEEEEEEEEEEEEEEE..",
"...EEE..EEEEE..EEE..",
"...eEe..eEEEe..eEe..",
])

# ---------- acacia 24x20 ----------
SP['acacia']=sprite('acacia',[
"......TTTTTTTTTTT.......",
"....TTTTTTTTTTTTTTT.....",
"..TTTTtTTTTTTTtTTTTTT...",
".TTTTTTTTTTTTTTTTTTTTT..",
".tTTTTTTTtTTTTTTTTTTTt..",
"..ttTTTTTTTTTTtTTTTtt...",
"....tt..tTTTt...tt......",
"..........BB............",
"..........BB............",
".........BBB............",
".........BB.............",
"........BBB.............",
])

# ---------- bush 12x8 ----------
SP['bush']=sprite('bush',[
"...TTTTT....",
".TTTtTTTTT..",
"TTTTTTTtTTT.",
".tTTtTTTTt..",
"...tt..tt...",
])

# ---------- base camp: pad 24x24 + tent ----------
SP['pad']=sprite('pad',[
"HHHHHHHHHHHHHHHHHHHHHHHH",
"HhhhhhhhhhhhhhhhhhhhhhhH",
"HhHHHHHHHHHHHHHHHHHHHHhH",
"HhHHHHHHHHHHHHHHHHHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLLLLLLLLLLLHHHHhH",
"HhHHHHLLLLLLLLLLLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHLLHHHHHHHHLLHHHHhH",
"HhHHHHHHHHHHHHHHHHHHHHhH",
"HhHHHHHHHHHHHHHHHHHHHHhH",
"HhhhhhhhhhhhhhhhhhhhhhhH",
"HHHHHHHHHHHHHHHHHHHHHHHH",
])
SP['tent']=sprite('tent',[
".....CC.....",
"....CCCC....",
"...CCCCCC...",
"..CCCzzCCC..",
".CCCCzzCCCC.",
"CCCCCzzCCCCC",
"cCCCCzzCCCCc",
])

# ---------- ranger + suspect 8x12 ----------
SP['ranger']=sprite('ranger',[
"..VV....",
"..VV....",
".VVVV...",
"VVVVVV..",
"V.VV.V..",
"..VV....",
"..VV....",
".V..V...",
".V..V...",
])
SP['suspect']=sprite('suspect',[
"..PP....",
"..PP....",
".PPPP...",
"PPPPPP..",
"P.PP.P..",
"..PP....",
"..PP....",
".P..P...",
".P..P...",
])

# ---------- terrain tiles 16x16 ----------
SP['tile_grass']=sprite('tile_grass',['S'*16]*16)
im=Image.open('assets/tile_grass.png'); px=im.load()
import random
random.seed(7)
for _ in range(26):
    x,y=random.randrange(16),random.randrange(16)
    px[x,y]=P['s']+(255,)
for _ in range(10):
    x,y=random.randrange(15),random.randrange(15)
    px[x,y]=P['G']+(255,); px[x+1,y]=P['g']+(255,)
im.save('assets/tile_grass.png'); SP['tile_grass']=im

SP['tile_green']=sprite('tile_green',['G'*16]*16)
im=Image.open('assets/tile_green.png'); px=im.load()
random.seed(11)
for _ in range(30):
    x,y=random.randrange(16),random.randrange(16)
    px[x,y]=P['g']+(255,)
im.save('assets/tile_green.png'); SP['tile_green']=im

SP['tile_water']=sprite('tile_water',['W'*16]*16)
im=Image.open('assets/tile_water.png'); px=im.load()
random.seed(3)
for _ in range(14):
    x,y=random.randrange(14),random.randrange(16)
    px[x,y]=P['w']+(255,); px[x+1,y]=P['w']+(255,)
im.save('assets/tile_water.png'); SP['tile_water']=im

SP['tile_dirt']=sprite('tile_dirt',['D'*16]*16)

# ---------- UI icons 8/10px ----------
SP['icon_batt']=sprite('icon_batt',[
"zzzzzzzz..",
"zGGGG..zz.",
"zGGGG..zzz",
"zGGGG..zz.",
"zzzzzzzz..",
])
SP['icon_alert']=sprite('icon_alert',[
"....RR....",
"...RRRR...",
"...RRRR...",
"..RRzzRR..",
"..RRzzRR..",
".RRRzzRRR.",
".RRRRRRRR.",
"RRRRzzRRRR",
"RRRRRRRRRR",
])
SP['icon_cam']=sprite('icon_cam',[
"..zzz.....",
"zzzzzzzzz.",
"zLLzzzzzz.",
"zLzzzKKzz.",
"zzzzKKKKz.",
"zzzzKKKKz.",
"zzzzzKKzz.",
"zzzzzzzzz.",
])

# ---------- contact sheet ----------
SCALE=5
bgw,bgh=1180,760
sheet=Image.new('RGB',(bgw,bgh),(222,203,153))
d=ImageDraw.Draw(sheet)
# terrain strip backdrop
for i in range(0,bgw,16*SCALE):
    sheet.paste(SP['tile_grass'].resize((16*SCALE,16*SCALE),Image.NEAREST),(i,bgh-16*SCALE))
def put(name,x,y,label=None):
    im=SP[name] if isinstance(SP[name],Image.Image) else Image.open(f'assets/{name}.png')
    big=im.resize((im.width*SCALE,im.height*SCALE),Image.NEAREST)
    sheet.paste(big,(x,y),big if big.mode=='RGBA' else None)
    if label: d.text((x,y+big.height+6),label,fill=(74,63,38))
put('drone_m3e',60,60,'MAVIC 3E'); put('drone_m2t',220,60,'MAVIC 2T'); put('drone_mini',380,60,'MINI 4 PRO')
put('giraffe',560,40,'GIRAFFE'); put('elephant',700,70,'ELEPHANT'); put('zebra',900,70,'ZEBRA'); put('rhino',1010,200,'RHINO' )
put('acacia',60,240,'ACACIA'); put('bush',240,280,'BUSH'); put('pad',360,220,'PAD'); put('tent',540,260,'TENT')
put('ranger',680,240,'RANGER'); put('suspect',760,240,'SUSPECT')
put('tile_grass',60,460,'SAVANNA'); put('tile_green',180,460,'GRASS'); put('tile_water',300,460,'WATER'); put('tile_dirt',420,460,'TRACK')
put('icon_batt',560,470,'BATT'); put('icon_alert',660,460,'ALERT'); put('icon_cam',760,465,'CAMERA')
d.text((60,20),'CONSERVANCY GAME - SPRITE SHEET v3 (5x)',fill=(74,63,38))
sheet.save('assets/contact-sheet.png')
print('sprites:',len(SP),'-> assets/, contact sheet written')
