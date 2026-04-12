/* ===== PANEL BAWAH ===== */

let agents = [], old = [], intervals = {}, running = {}, k = [];

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
        ctx.fillStyle = k[v] || "#000";
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

/* ===== TAMBAH KE EVENT EXISTING ===== */
document.addEventListener("click", (e) => {
  let id = e.target.id;

  if(id==="wipe"){
    paramsInput.value="";
    agentsInput.value="";
    document.getElementById("read").disabled=true;
    document.getElementById("exec").disabled=true;
  }

  if(id==="data"){
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

    agentsInput.value=`1;0;0;0;0;0;0;0;0;0
1;1;0;0;0;0;0;0;0;0
1;1;1;0;0;0;0;0;0;0
1;1;1;1;0;0;0;0;0;0`;

    document.getElementById("read").disabled=false;
  }

  if(id==="read"){
    k = parsePalette(paramsInput.value);
    agents = parseAgents(agentsInput.value);
    old = structuredClone(agents);
    drawBottom(agents);
    document.getElementById("exec").disabled=false;
  }

  if(id==="exec"){
    agents = step(old);
    drawBottom(agents);
    old = structuredClone(agents);
  }

  if(id==="info"){
    alert("mockup-t4 v0.1");
    while(!confirm("Continue?")){}
    let n=prompt("Who are you?","Guest");
    alert("Welcome "+n);
  }

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
        }
      },50);
    }
  }

  if(id==="prog-1") toggle("prog-1","bar-1","scan");
  if(id==="prog-2") toggle("prog-2","bar-2","filter");
  if(id==="prog-3") toggle("prog-3","bar-3","format");
  if(id==="prog-4") toggle("prog-4","bar-4","sort");
  if(id==="prog-5") toggle("prog-5","bar-5","erase");

});

const paramsInput = document.getElementById("params-input");
const agentsInput = document.getElementById("agents-input");
