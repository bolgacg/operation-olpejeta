"""Pack assets/*.png into one spritesheet + JSON atlas."""
from PIL import Image
import os, json
names = [n[:-4] for n in sorted(os.listdir('assets')) if n.endswith('.png') and n!='contact-sheet.png' and n!='sheet.png']
imgs = {n: Image.open(f'assets/{n}.png') for n in names}
# simple shelf packing
SHEET_W = 256
x=y=rowh=0
atlas={}
for n in names:
    im=imgs[n]
    if x+im.width>SHEET_W: x=0; y+=rowh; rowh=0
    atlas[n]={'x':x,'y':y,'w':im.width,'h':im.height}
    x+=im.width+1; rowh=max(rowh,im.height+1)
H=y+rowh
sheet=Image.new('RGBA',(SHEET_W,H),(0,0,0,0))
for n,pos in atlas.items():
    sheet.paste(imgs[n],(pos['x'],pos['y']))
sheet.save('assets/sheet.png')
json.dump(atlas, open('assets/sheet.json','w'))
print('packed', len(names), 'sprites into', SHEET_W, 'x', H)
