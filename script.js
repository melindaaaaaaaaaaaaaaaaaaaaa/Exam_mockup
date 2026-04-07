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

document.addEventListener("click", (e) => {
  let id = e.target.id;

  if (id === "wipe-1") {
    params1.value = "";
    grid.value = "";

    enable("read-1", false);
    enable("exec-1", false);

    ["data-2","read-2","exec-2","data-3","read-3","exec-3"]
      .forEach(x=>enable(x,false));

    clearCanvas("map-2");
    clearCanvas("map-3");
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

  if (id === "wipe-2") {
    params2.value="";
    clearCanvas("map-2");
    enable("data-2", false);
    enable("read-2", false);
    enable("exec-2", false);
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

  if (id === "wipe-3") {
    params3.value="";
    clearCanvas("map-3");
    enable("data-3", false);
    enable("read-3", false);
    enable("exec-3", false);
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

// refs
const params1 = document.getElementById("params-1");
const params2 = document.getElementById("params-2");
const params3 = document.getElementById("params-3");
const grid = document.getElementById("grid");

let agents = [];

function getNeighbors(grid, x, y) {
  let res = [];
  for (let dx=-1; dx<=1; dx++){
    for (let dy=-1; dy<=1; dy++){
      if (dx===0 && dy===0) continue;
      res.push(grid[y+dy]?.[x+dx] ?? 0);
    }
  }
  return res;
}

function processGrid(grid){
  let out = structuredClone(grid);

  for (let i=1;i<grid.length-1;i++){
    for (let j=1;j<grid[0].length-1;j++){
      let n = getNeighbors(grid,j,i);
      let sum = n.reduce((a,b)=>a+b,0);

      if (sum < 8 || sum > 9){
        out[i][j] = 9;
      }
    }
  }
  return out;
}
