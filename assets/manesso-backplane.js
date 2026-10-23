/**
 * Manesso capability controller: a six-bay serviceable execution backplane.
 * A selected cartridge releases from its socket, lifts, and energises its bus.
 */
const {
  Cam, circ, facing, fit, mk, open, place, pointer, prism, proj, reflect,
  register, rings, ringAt, rrect, seg, solid, put, tween, tset, tval,
  tdone, disposer,
} = HL;

const MODULES = [
  { name:"manifest", x:-66, y:-40, z:10 }, { name:"registry", x:-21, y:-51, z:10 },
  { name:"policy", x:30, y:-45, z:10 }, { name:"receipt", x:-50, y:39, z:10 },
  { name:"settlement", x:1, y:49, z:10 }, { name:"guard", x:54, y:34, z:10 },
];

function mount({ stage, svg, read }, value) {
  const bag=disposer(); let lift=value, active=-1;
  const C=Cam(45,.5,1.65); fit(C,[[-108,-82,-7],[108,82,-7],[-108,82,0],[108,-82,0],[-80,-60,66],[80,60,66]],200,158);
  const P=proj(C), front=facing(C), root=mk("g",{},svg);
  const dot=(parent,p,r=1,cls="dot m")=>{const e=mk("circle",{r,class:cls},parent);place(e,P(...p));return e;};
  const slab=(parent,x0,y0,x1,y1,r,z0,z1,cls="")=>{const [a,b]=rings(x0,y0,x1,y1,r,Math.min(1.5,(x1-x0)/5,(y1-y0)/5));const s=solid(parent);put(s,prism(P,front,a,b,z0,z1));if(cls)s.g.setAttribute("class",cls);return s;};
  const circleAt=(x,y,r,n=24)=>circ(r,n).map(q=>({...q,u:q.u+x,v:q.v+y}));

  // Heavy chassis, feet, collars and perimeter hardware.
  const [base,baseIn]=rings(-101,-74,101,74,13,2.2); reflect(svg,root,P,front,base,-4,17);
  [[-84,-59],[84,-59],[-84,59],[84,59]].sort((a,b)=>a[0]+a[1]-b[0]-b[1]).forEach(([x,y])=>{
    const foot=solid(root);put(foot,prism(P,front,circleAt(x,y,6),circleAt(x,y,4.5),-7,-1));
    const collar=solid(root);put(collar,prism(P,front,circleAt(x,y,7.5),circleAt(x,y,6.2),-1,1));
  });
  const chassis=solid(root);put(chassis,prism(P,front,base,baseIn,-2,6));
  const [deck,deckIn]=rings(-94,-67,94,67,10,1.5);const deckSolid=solid(root);put(deckSolid,prism(P,front,deck,deckIn,6,9));deckSolid.cr.classList.add("lo");
  const [tray,trayIn]=rings(-87,-60,87,60,8,1.2);const traySolid=solid(root);put(traySolid,prism(P,front,tray,trayIn,9,10));traySolid.sil.classList.add("lo");
  [[-88,-61],[-44,-66],[44,-66],[88,-61],[-88,61],[-44,66],[44,66],[88,61]].forEach(p=>{dot(root,[p[0],p[1],9.7],1.35,"dot off");dot(root,[p[0],p[1],9.9],.45,"dot m");});

  // Front I/O comb and rear power bridge make the controller a buildable object.
  slab(root,-39,63,39,69,2,9.5,12,"io-rail");
  [-30,-21,-12,-3,6,15,24,33].forEach((x,i)=>slab(root,x-2,65,x+2,70,.7,12,13,i===3?"active-port":""));
  slab(root,-53,-68,53,-63,1.5,10,13,"power-bridge");
  [-45,45].forEach(x=>{slab(root,x-3,-70,x+3,-61,1.2,9,15);dot(root,[x,-65,15.2],1,"dot m");});

  // Static socket wells, guide rails, retaining arms and routed buses.
  const bus=mk("g",{class:"nf lo"},root), arms=[];
  MODULES.forEach((m,i)=>{
    const [well,wellIn]=rings(m.x-18,m.y-13,m.x+18,m.y+13,5,1.2);const ws=solid(root);put(ws,prism(P,front,well,wellIn,9.5,11.5));ws.sil.classList.add("lo");
    [-1,1].forEach(side=>{slab(root,m.x+side*13-1.5,m.y-10,m.x+side*13+1.5,m.y+10,1,11.5,13);dot(root,[m.x+side*13,m.y-7,13.2],.8,"dot off");
      const arm=mk("path",{d:seg(P(m.x+side*18,m.y-8,12),P(m.x+side*18,m.y+8,12)),class:"nf lo bay-arm"},root);arms.push({arm,index:i});});
    const end=[m.x*.42,m.y*.38,12], core=[m.x*.19,m.y*.17,15];
    mk("path",{d:seg(P(m.x,m.y,12),P(...end))+seg(P(...end),P(...core)),class:"nf bus-line"},bus);
    mk("path",{d:seg(P(m.x+2,m.y-2,12),P(end[0]+2,end[1]-2,12))+seg(P(end[0]+2,end[1]-2,12),P(core[0]+2,core[1]-2,15)),class:"nf lo"},bus);
    dot(root,[m.x*1.19,m.y*1.19,10.1],2,"dot off");dot(root,[m.x*1.19,m.y*1.19,10.2],.65,"dot m");
  });

  // Processor socket, ceramic core, heat sink, fasteners and lock hardware.
  slab(root,-34,-27,34,27,7,10,16,"core-socket");
  [[-27,-20],[27,-20],[-27,20],[27,20]].forEach(p=>{dot(root,[p[0],p[1],16.2],1.4,"dot off");dot(root,[p[0],p[1],16.4],.5,"dot m");});
  const core=slab(root,-23,-17,23,17,5,16,24,"core-body");core.cr.classList.add("hi");
  [-15,-10,-5,0,5,10,15].forEach((x,i)=>{const fin=slab(root,x-1,-12,x+1,12,.5,24,29+i%2*.6,i===3?"core-fin hot":"core-fin");if(i===3)fin.sil.classList.add("hi");});
  [[-16,-12],[0,-12],[16,-12],[-16,12],[0,12],[16,12]].forEach((p,i)=>dot(root,[p[0],p[1],24.3],1.25,i===4?"dot":"dot m"));
  mk("path",{d:seg(P(35,-19,12),P(43,-27,31))+seg(P(43,-27,31),P(53,-20,31)),class:"nf sil lock-arm"},root);
  dot(root,[35,-19,12.3],2.1,"dot off");dot(root,[53,-20,31],2.7,"dot m");dot(root,[53,-20,31],1.2,"dot off");
  [[-39,0],[39,0]].forEach((p,i)=>{const beacon=solid(root);put(beacon,prism(P,front,circleAt(p[0],p[1],3.2,20),circleAt(p[0],p[1],2.2,20),11,17));beacon.sil.classList.add(i?"lo":"hi");});

  // Six service cartridges: body, cap, seam, contacts, fasteners and connector feet.
  const carts=MODULES.slice().sort((a,b)=>a.x+a.y-b.x-b.y).map(m=>{
    const group=mk("g",{},root), shadow=mk("path",{class:"nf lo"},root), body=solid(group), cap=solid(group);
    const [ring,inner]=rings(m.x-15,m.y-10,m.x+15,m.y+10,4.5,1.1),[capR,capI]=rings(m.x-12.5,m.y-7.5,m.x+12.5,m.y+7.5,3.2,.8);
    const contacts=[-8,-2.7,2.7,8].map(()=>mk("circle",{r:1.12,class:"dot m"},group));
    const screws=[[-10,-5],[10,-5]].map(()=>mk("circle",{r:.72,class:"dot off"},group));
    const seam=mk("path",{class:"nf lo"},group), aperture=mk("path",{class:"nf lo"},group),feet=[-8,8].map(()=>solid(group));
    return {...m,group,shadow,body,cap,ring,inner,capR,capI,contacts,screws,seam,aperture,feet,zt:tween(0),sourceIndex:MODULES.indexOf(m)};
  });

  function draw(c,z){
    const top=c.z+16+z;put(c.body,prism(P,front,c.ring,c.inner,c.z+z,top-2));put(c.cap,prism(P,front,c.capR,c.capI,top-2,top));
    c.seam.setAttribute("d",open(ringAt(P,c.ring,top-3)));c.aperture.setAttribute("d",seg(P(c.x-5,c.y,top+.15),P(c.x+5,c.y,top+.15)));
    c.contacts.forEach((e,i)=>place(e,P(c.x-8+i*5.3,c.y+5.2,top+.25)));c.screws.forEach((e,i)=>place(e,P(c.x+(i?10:-10),c.y-5,top+.28)));
    c.feet.forEach((f,i)=>{const sx=i?8:-8,[a,b]=rings(c.x+sx-2,c.y+8,c.x+sx+2,c.y+12,1,.6);put(f,prism(P,front,a,b,c.z-1+z,c.z+2+z));});
    c.shadow.setAttribute("d",open(ringAt(P,rrect(c.x-16,c.y-11,c.x+16,c.y+11,5,5),10)));
  }
  const centres=MODULES.map(m=>P(m.x,m.y,m.z+16));
  const hit=([x,y])=>{let best=-1,dist=50;centres.forEach((p,i)=>{const d=Math.hypot(x-p[0],y-p[1]);if(d<dist){best=i;dist=d;}});return best;};
  const loop=register(stage,(_dt,now)=>{let moving=false;carts.forEach(c=>{draw(c,tval(c.zt,now));if(!tdone(c.zt,now))moving=true;});return moving;});bag.add(loop.unregister);
  function select(index){
    if(index===active)return;active=index;const now=performance.now();carts.forEach(c=>{const on=c.sourceIndex===index;tset(c.zt,on?lift:0,now,on?0:Math.abs(c.sourceIndex-index)*18);c.body.sil.classList.toggle("hi",on);c.cap.sil.classList.toggle("hi",on);c.contacts.forEach(d=>d.classList.toggle("m",!on));});
    [...bus.children].forEach((p,i)=>p.classList.toggle("hi",index>=0&&Math.floor(i/2)===index&&i%2===0));arms.forEach(a=>a.arm.classList.toggle("hi",a.index===index));read.textContent=index<0?"system ready":MODULES[index].name+" / source linked";stage.dispatchEvent(new CustomEvent("manesso-stage",{detail:index}));loop.wake();
  }
  carts.forEach(c=>draw(c,0));bag.add(pointer(stage,{move:p=>select(hit(p)),leave:()=>select(-1)}));bag.add(()=>svg.replaceChildren());
  return {set:v=>{lift=v;if(active>=0){tset(carts.find(c=>c.sourceIndex===active).zt,lift,performance.now(),0);loop.wake();}},select,destroy:bag.dispose};
}

hairline({name:"backplane",means:"A six-bay capability controller releases one service cartridge and energises its verified path to the execution core.",rules:[1,2,4,5,8,9,10],range:[24,34,44],tour:[[122,119],[242,112],[277,221],[139,222],null],mount});
