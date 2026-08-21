// OPERATION: OL PEJETA — hand-built map. 40x26 tiles of 16px.
// t: 0 savanna, 1 grass, 2 water, 3 dirt track
window.MAP = (function(){
  const W=40, H=26;
  const t = Array.from({length:H}, ()=>Array(W).fill(0));
  const rect=(x,y,w,h,v)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(t[j]&&t[j][i]!==undefined)t[j][i]=v;};
  // grass patches
  rect(4,3,9,5,1); rect(24,14,10,6,1); rect(14,8,7,4,1); rect(30,2,8,5,1);
  // waterhole
  rect(17,16,5,3,2); rect(18,15,3,1,2); rect(18,19,3,1,2);
  // dirt track: camp to north gate, with a bend
  for(let j=6;j<24;j++) t[j][10]=3;
  for(let i=10;i<30;i++) t[6][i]=3;
  // trees/bushes decorations [x,y,kind]
  const deco=[[5,4,'acacia'],[9,6,'acacia'],[26,15,'acacia'],[31,17,'acacia'],[16,9,'acacia'],
              [33,3,'acacia'],[36,5,'bush'],[13,5,'bush'],[22,20,'bush'],[7,12,'bush'],
              [28,8,'bush'],[35,19,'bush'],[3,18,'bush']];
  // camp: pad + tents, bottom middle-left
  const camp={pad:{x:9,y:21}, tents:[[7,20],[12,23]]};
  // controlled airspace sector (Level 2): north strip
  const sector={x0:24*16,y0:0,x1:40*16,y1:5*16};
  return {W,H,t,deco,camp,sector,TS:16};
})();
