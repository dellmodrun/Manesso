/**
 * Manesso backplane: six capability cartridges docked around a guarded core.
 * The pointed cartridge lifts from its rail and energises its path to the core.
 */
const {
  Cam, fit, mk, place, pointer, prism, proj, reflect, register, rings,
  seg, solid, put, tween, tset, tval, tdone, disposer, flatDot,
} = HL;

const MODULES = [
  { name: "manifest", x: -66, y: -42, z: 7, n: 1 },
  { name: "registry", x: -22, y: -52, z: 11, n: 2 },
  { name: "policy", x: 28, y: -47, z: 8, n: 3 },
  { name: "receipt", x: -48, y: 42, z: 13, n: 4 },
  { name: "settlement", x: 2, y: 50, z: 8, n: 5 },
  { name: "guard", x: 52, y: 36, z: 11, n: 6 },
];
const LIFT = 24;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, active = -1;
  const C = Cam(45, .5, 1.68);
  fit(C, [[-102,-82,0],[102,82,0],[-102,82,0],[102,-82,0],[-80,-60,55],[80,60,55]], 200, 161);
  const P = proj(C), root = mk("g", {}, svg);

  const [base, baseIn] = rings(-97,-72,97,72,13,2.1);
  reflect(svg, root, P, () => true, base, 0, 15);
  const deck = solid(root); put(deck, prism(P, () => true, base, baseIn, 0, 7));
  const [plate, plateIn] = rings(-86,-61,86,61,9,1.3);
  const inset = solid(root); put(inset, prism(P, () => true, plate, plateIn, 7, 9));
  inset.cr.classList.add("lo");

  // Backplane rails and terminal pads establish a deliberate rest composition.
  const railGroup = mk("g", { class: "lo" }, root);
  MODULES.forEach((m) => {
    const end = [m.x * .33, m.y * .28, 10];
    mk("path", { d: seg(P(m.x,m.y,10), P(...end)) + seg(P(end[0],end[1],10), P(end[0] * .58,end[1] * .58,10)), class: "nf" }, railGroup);
    flatDot(railGroup, C, 2.15, "dot off").setAttribute("transform", `translate(${P(m.x*1.12,m.y*1.12,9).join(" ")})`);
  });

  // Central processor has a socket, a die and an offset locking arm.
  const [socketR, socketI] = rings(-31,-25,31,25,7,1.7);
  const socket = solid(root); put(socket, prism(P, () => true, socketR, socketI, 9,16));
  const [coreR, coreI] = rings(-20,-15,20,15,5,1.2);
  const core = solid(root); put(core, prism(P, () => true, coreR, coreI, 16,24));
  core.cr.classList.add("hi");
  const coreMarks = [[-11,-6],[0,-6],[11,-6],[-11,6],[0,6],[11,6]];
  coreMarks.forEach((q,i) => flatDot(root,C,1.55,i===2?"dot":"dot m").setAttribute("transform",`translate(${P(q[0],q[1],24.2).join(" ")})`));
  mk("path", { d: seg(P(32,-18,11),P(43,-29,27))+seg(P(43,-29,27),P(50,-22,27)), class: "nf sil" }, root);

  const carts = MODULES.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y)).map((m) => {
    const group = mk("g", {}, root), body = solid(group);
    const [ring, inner] = rings(m.x-15,m.y-10,m.x+15,m.y+10,4.5,1.15);
    const contacts = [-8,-2.7,2.7,8].map((dx) => mk("circle", { r: 1.18, class: "dot m" }, group));
    const slot = mk("path", { class: "nf lo" }, group);
    const route = mk("path", { class: "nf lo" }, root);
    return { ...m, body, ring, inner, contacts, slot, route, zt: tween(0), sourceIndex: MODULES.indexOf(m) };
  });

  function draw(c, z) {
    const top = c.z + 13 + z;
    put(c.body, prism(P, () => true, c.ring, c.inner, c.z+z, top));
    c.slot.setAttribute("d", seg(P(c.x-8,c.y,top+.15),P(c.x+8,c.y,top+.15)));
    c.contacts.forEach((el,i) => place(el,P(c.x-8+i*5.3,c.y+5.8,top+.25)));
    const mid = [c.x*.58,c.y*.56,11+z*.18];
    c.route.setAttribute("d",seg(P(c.x,c.y,c.z+z),P(...mid))+seg(P(...mid),P(mid[0]*.42,mid[1]*.42,14)));
  }

  const centers = MODULES.map((m)=>P(m.x,m.y,m.z+13));
  const hit = ([x,y]) => {
    let best=-1, dist=52;
    centers.forEach((p,i)=>{const d=Math.hypot(x-p[0],y-p[1]);if(d<dist){best=i;dist=d;}});
    return best;
  };
  const loop = register(stage, (_dt,now) => {
    let moving=false;
    carts.forEach((c)=>{draw(c,tval(c.zt,now));if(!tdone(c.zt,now))moving=true;});
    return moving;
  });
  bag.add(loop.unregister);

  function select(index) {
    if(index===active)return;
    active=index; const now=performance.now();
    carts.forEach((c)=>{
      const selected=c.sourceIndex===index;
      tset(c.zt,selected?lift:0,now,selected?0:Math.abs(c.sourceIndex-index)*22);
      c.body.sil.classList.toggle("hi",selected);
      c.route.classList.toggle("hi",selected);
      c.contacts.forEach((dot)=>dot.classList.toggle("m",!selected));
    });
    read.textContent=index<0?"system ready":MODULES[index].name;
    stage.dispatchEvent(new CustomEvent("manesso-stage",{detail:index}));
    loop.wake();
  }
  carts.forEach((c)=>draw(c,0));
  bag.add(pointer(stage,{move:(p)=>select(hit(p)),leave:()=>select(-1)}));
  bag.add(()=>svg.replaceChildren());
  return { set:(v)=>{lift=v;if(active>=0){tset(carts.find(c=>c.sourceIndex===active).zt,lift,performance.now(),0);loop.wake();}}, select, destroy:bag.dispose };
}

hairline({
  name:"backplane",
  means:"Six capability cartridges dock around a guarded execution core; the selected path rises and resolves to a source stage.",
  rules:[1,4,5,8,9,10],
  range:[16,24,32],
  tour:[[126,126],[247,119],[274,221],[142,220],null],
  mount,
});
