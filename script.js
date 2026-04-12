let h=[], k=[];

// ===== UTIL =====
function enable(id,s){document.getElementById(id).disabled=!s;}
function clearCanvas(id){
  let c=document.getElementById(id);
  c.getContext("2d").clearRect(0,0,c.width,c.height);
}

// ===== DRAW =====
function draw(id,grid){
  let c=document.getElementById(id),ctx=c.getContext("2d");
  c.width=c.clientWidth; c.height=c.clientHeight;

  let r=grid.length,c2=grid[0].length;
  let cw=c.width/c2,ch=c.height/r;

  for(let i=0;i<r;i++){
    for(let j=0;j<c2;j++){
      let v=grid[i][j];
      if(v>0){ctx.fillStyle=k[v]||"#000";ctx.fillRect(j*cw,i*ch,cw,ch);}
      ctx.strokeStyle="#888";ctx.strokeRect(j*cw,i*ch,cw,ch);
    }
  }
}

// ===== PARSE =====
function parsePalette(t){
  return t.split("\n").filter(x=>x.startsWith("COL")).map(x=>x.split(" ")[1]);
}
function parseAgents(t){
  return t.split("\n").map(r=>r.split(";").map(Number));
}

// ===== AUTOMATA =====
function step(g){
  let o=structuredClone(g);
  for(let i=1;i<g.length-1;i++){
    for(let j=1;j<g[0].length-1;j++){
      let s=0;
      for(let dx=-1;dx<=1;dx++)
        for(let dy=-1;dy<=1;dy++)
          if(dx||dy)s+=g[i+dy][j+dx];
      if(s<8||s>9)o[i][j]=9;
    }
  }
  return o;
}

// ===== STATE =====
let agents=[], old=[], intervals={}, run={};

// ===== EVENTS =====
document.addEventListener("click",(e)=>{
let id=e.target.id;

// --- PANEL BAWAH ---
if(id==="wipe"){
  paramsInput.value=""; agentsInput.value="";
  clearCanvas("map-4");
  enable("read",false); enable("exec",false);
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

enable("read",true);
}

if(id==="read"){
  k=parsePalette(paramsInput.value);
  agents=parseAgents(agentsInput.value);
  old=structuredClone(agents);
  draw("map-4",agents);
  enable("exec",true);
}

if(id==="exec"){
  agents=step(old);
  draw("map-4",agents);
  old=structuredClone(agents);
}

if(id==="info"){
  alert("mockup-t4 v0.1");
  while(!confirm("Do you want to continue?")){}
  let n=prompt("Who are you?","Guest");
  alert("Welcome, "+n);
}

// --- PROGRESS ---
function toggle(b,p){
  let btn=document.getElementById(b),bar=document.getElementById(p);

  if(run[b]){
    clearInterval(intervals[b]); run[b]=false;
    btn.textContent=b.replace("prog-","");
  }else{
    run[b]=true; btn.textContent="stop";
    intervals[b]=setInterval(()=>{
      bar.value++;
      if(bar.value>=100){clearInterval(intervals[b]);btn.disabled=true;}
    },50);
  }
}

if(id==="prog-1")toggle("prog-1","bar-1");
if(id==="prog-2")toggle("prog-2","bar-2");
if(id==="prog-3")toggle("prog-3","bar-3");
if(id==="prog-4")toggle("prog-4","bar-4");
if(id==="prog-5")toggle("prog-5","bar-5");

});

// refs
const paramsInput=document.getElementById("params-input");
const agentsInput=document.getElementById("agents-input");
