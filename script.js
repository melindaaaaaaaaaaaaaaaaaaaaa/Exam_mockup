/* PANEL 1–3 */

let h = [], w, E, D, O, y;
let k = [], W;
let b, v, H, S, U, N, R, P;

const colors = ["#522","#622","#722","#822","#922","#a22","#b22","#c22","#d22","#e22","#f22","#f44","#f66","#f88","#faa","#fcc"];

function enable(id, state) {
  document.getElementById(id).disabled = !state;
}

function clearCanvas(id) {
  let c = document.getElementById(id);
  let ctx = c.getContext("2d");
  ctx.clearRect(0,0,c.width,c.height);
}

function parse(text, key, type="string") {
  let lines = text.split("\n");
  for (let l of lines) {
    if (l.startsWith(key)) {
      let val = l.split(" ")[1];
      if (type==="int") return parseInt(val);
      if (type==="float") return parseFloat(val);
      return val;
    }
  }
}

function draw(canvasId, grid) {
  let c = document.getElementById(canvasId);
  let ctx = c.getContext("2d");

  c.width = c.clientWidth;
  c.height = c.clientHeight;

  let rows = grid.length;
  let cols = grid[0].length;

  let cw = c.width / cols;
  let ch = c.height / rows;

  for (let i=0;i<rows;i++){
    for (let j=0;j<cols;j++){
      ctx.fillStyle = k[grid[i][j]];
      ctx.fillRect(j*cw, i*ch, cw, ch);
    }
  }
}

function highlight(canvasId, x, y, color) {
  let c = document.getElementById(canvasId);
  let ctx = c.getContext("2d");

  let cw = c.width / h[0].length;
  let ch = c.height / h.length;

  ctx.fillStyle = color;
  ctx.fillRect(x*cw, y*ch, cw, ch);
}

/* GLOBAL CLICK */

document.addEventListener("click", (e) => {
  let id = e.target.id;

  /* PANEL 1 */
  if (id === "wipe-1") {
    params1.value = "";
    grid.value = "";
    enable("read-1", false);
    enable("exec-1", false);
  }

  if (id === "data-1") {
    params1.value =
`COLS 9
ROWS 11
UMIN 0.20
UMAX 0.70
UNUM 11
SEPC ;`;
    enable("read-1", true);
  }

  if (id === "read-1") {
    let txt = params1.value;
    w = parse(txt,"ROWS","int");
    E = parse(txt,"COLS","int");
    D = parse(txt,"UMIN","float");
    O = parse(txt,"UMAX","float");
    y = parse(txt,"UNUM","int");

    enable("exec-1", true);
    enable("data-2", true);
    enable("data-3", true);
  }

  if (id === "exec-1") {
    let step = (O-D)/(y-1);
    h = [];
    let text="";

    for (let i=0;i<w;i++){
      let row=[];
      for (let j=0;j<E;j++){
        let r = Math.floor(Math.random()*y);
        row.push(r);
        text += (D+step*r).toFixed(2).slice(1);
        if (j<E-1) text+=";";
      }
      if (i<w-1) text+="\n";
      h.push(row);
    }
    grid.value = text;
  }

  /* PANEL 2 */
  if (id === "wipe-2") {
    params2.value="";
    clearCanvas("map-2");
  }

  if (id === "data-2") {
    let txt = "CNUM "+y+"\n";
    for (let i=0;i<y;i++){
      txt += `CL${String(i).padStart(2,"0")} ${colors[i]}\n`;
    }
    params2.value = txt;
    enable("read-2", true);
  }

  if (id === "read-2") {
    let txt = params2.value;
    W = parse(txt,"CNUM","int");
    k=[];
    for (let i=0;i<W;i++){
      let val = parse(txt,"CL"+String(i).padStart(2,"0"));
      if (val) k.push(val);
    }
    enable("exec-2", true);
  }

  if (id === "exec-2") {
    draw("map-2", h);
  }

  /* PANEL 3 */
  if (id === "wipe-3") {
    params3.value="";
    clearCanvas("map-3");
  }

  if (id === "data-3") {
    params3.value =
`XMIN 0
YMIN 0
XMAX ${E}
YMAX ${w}`;
    enable("read-3", true);
  }

  if (id === "read-3") {
    let txt = params3.value;
    b = parse(txt,"XMIN","int");
    v = parse(txt,"YMIN","int");
    H = parse(txt,"XMAX","int");
    S = parse(txt,"YMAX","int");

    enable("exec-3", true);
  }

  if (id === "exec-3") {
    U = Math.floor(Math.random()*(H-b)+b);
    N = Math.floor(Math.random()*(S-v)+v);
    R = Math.floor(Math.random()*(H-b)+b);
    P = Math.floor(Math.random()*(S-v)+v);

    clearCanvas("map-3");
    draw("map-3", h);

    highlight("map-3", U, N, "#8f8");
    highlight("map-3", R, P, "#88f");
  }

});

/* PANEL BAWAH */

let k2 = [], agents = [], old = [];
let intervals = {}, running = {};

function drawBottom(grid){
  let c = document.getElementById("map-4");
  let ctx = c.getContext("2d");

  c.width = c.clientWidth;
  c.height = c.clientHeight;

  let h = grid.length, w = grid[0].length;
  let cw = c.width / w, ch = c.height / h;

  for(let i=0;i<h;i++){
    for(let j=0;j<w;j++){
      let v = grid[i][j];
      if(v>0){
        ctx.fillStyle = k2[v] || "#000";
        ctx.fillRect(j*cw,i*ch,cw,ch);
      }
      ctx.strokeRect(j*cw,i*ch,cw,ch);
    }
  }
}

function parsePalette(t){
  return t.split("\n").filter(x=>x.startsWith("COL")).map(x=>x.split(" ")[1]);
}

function parseAgents(t){
  return t.split("\n").map(r=>r.split(";").map(Number));
}

function getN(g,x,y){
  let r=[];
  for(let dx=-1;dx<=1;dx++)
    for(let dy=-1;dy<=1;dy++)
      if(dx||dy) r.push(g[y+dy]?.[x+dx]??0);
  return r;
}

function step(g){
  let o = structuredClone(g);
  for(let i=1;i<g.length-1;i++){
    for(let j=1;j<g[0].length-1;j++){
      let x = g[i][j];
      let n = getN(g,j,i);
      let sum = n.reduce((a,b)=>a+b,0);
      let min = Math.min(...n);
      let max = Math.max(...n);

      if ((sum < 8 || sum > 9) && x === 1 && min === 0 && max < 9){
        o[i][j] = 9;
      }
    }
  }
  return o;
}

/* BUTTON BAWAH */

const paramsInput = document.getElementById("params-input");
const agentsInput = document.getElementById("agents-input");

document.getElementById("wipe").onclick = () => {
  paramsInput.value="";
  agentsInput.value="";
};

document.getElementById("data").onclick = () => {
  paramsInput.value=`# palette
NUMC 10
COL0 #888
COL1 #f22
COL2 #f33
COL3 #f44
COL4 #f55
COL5 #f66
COL6 #f77
COL7 #f88
COL8 #f99
COL9 #faa`;

  agentsInput.value =
`9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;1;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;1;1;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;1;1;1;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;1;1;1;1;9;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;1;1;1;1;1;1;9;9;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;1;1;1;1;1;1;1;1;1;9;9;9;9;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0
1;1;1;1;1;1;1;1;1;1;1;1;1;1;9;9;9;9;0;0;0;0;0;0;0;0;0;0;0;9;9;0;0;0;0;0;0;0;9;9
1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;9;0;0;0;0;0;0;0;0;0;0;9;9;1;1;1;0;0;0;1;1;1
1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;9;9;9;0;0;0;0;0;0;9;1;1;1;1;1;1;1;1;1;1;1
1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;9;9;0;0;0;0;9;1;1;1;1;1;1;1;1;1;1;1;1
1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;9;9;9;9;9;1;1;1;1;1;1;1;1;1;1;1;1;1
1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1;1`;

  // aktifkan read
  document.getElementById("read").disabled = false;
};

document.getElementById("read").onclick = () => {
  k2 = parsePalette(paramsInput.value);
  agents = parseAgents(agentsInput.value);
  old = structuredClone(agents);
  drawBottom(agents);

  // aktifkan exec
  document.getElementById("exec").disabled = false;
};

document.getElementById("exec").onclick = () => {
  agents = step(old);
  drawBottom(agents);
  old = structuredClone(agents);
};

document.getElementById("info").onclick = () => {

// 1. alert pertama
alert("mockup-t4 v0.1");

// 2. confirm
let lanjut = confirm("Do you want to continue?");
if (!lanjut) return;

// 3. prompt input nama
let nama = prompt("Who are you?", "Guest");

// handle kalau cancel / kosong
if (!nama) nama = "Guest";

// 4. hasil akhir
alert("Welcome, " + nama);

};


/* PROGRESS */

function toggle(b,p,label){
  let btn=document.getElementById(b);
  let bar=document.getElementById(p);

  if(bar.value>=100) return;

  if(running[b]){
    clearInterval(intervals[b]);
    running[b]=false;
    btn.textContent=label;
  } else {
    running[b]=true;
    btn.textContent="stop";
    intervals[b]=setInterval(()=>{
      bar.value++;
      if(bar.value>=100){
        bar.value=100;
        clearInterval(intervals[b]);
        btn.disabled=true;
        btn.textContent=label;
      }
    },50);
  }
}

document.getElementById("prog-1").onclick = ()=>toggle("prog-1","bar-1","scan");
document.getElementById("prog-2").onclick = ()=>toggle("prog-2","bar-2","filter");
document.getElementById("prog-3").onclick = ()=>toggle("prog-3","bar-3","format");
document.getElementById("prog-4").onclick = ()=>toggle("prog-4","bar-4","sort");
document.getElementById("prog-5").onclick = ()=>toggle("prog-5","bar-5","erase");

/* refs */
const params1 = document.getElementById("params-1");
const params2 = document.getElementById("params-2");
const params3 = document.getElementById("params-3");
const grid = document.getElementById("grid");
