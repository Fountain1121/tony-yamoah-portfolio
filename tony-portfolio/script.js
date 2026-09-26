/* ADD WORKS: drop files in the /works folder, then list them here.
   Example: film:[{src:"works/film/short-film.mp4",title:"Short film"}]
   Any category left empty will show a "No works uploaded yet" message on the page. */
var WORKS={
film:[
    {src:"works/film/Img 4154.mp4", title:"Film 01"},
    {src:"works/film/Img 0215.mp4", title:"Film 02"},
    {src:"works/film/Img 0834.mp4", title:"Film 03"},
    {src:"works/film/Img 3922.mp4", title:"Film 04"}
],
photo:[
    {src:"works/photo/IMG_2742.jpg", title:"Photo 01"},
    {src:"works/photo/IMG_2743.jpg", title:"Photo 02"},
    {src:"works/photo/IMG_2744.jpg", title:"Photo 03"},
    {src:"works/photo/IMG_2745.jpg", title:"Photo 04"},
    {src:"works/photo/IMG_2746.jpg", title:"Photo 05"},
    {src:"works/photo/IMG_2747.jpg", title:"Photo 06"},
    {src:"works/photo/IMG_2748.jpg", title:"Photo 07"},
    {src:"works/photo/IMG_2749.jpg", title:"Photo 08"},
    {src:"works/photo/IMG_2750.jpg", title:"Photo 09"},
    {src:"works/photo/IMG_2751.jpg", title:"Photo 10"},
    {src:"works/photo/IMG_3252.jpg", title:"Photo 11"},
    {src:"works/photo/IMG_3258.jpg", title:"Photo 12"},
    {src:"works/photo/IMG_3262.jpg", title:"Photo 13"},
    {src:"works/photo/IMG_3294.jpg", title:"Photo 14"},
],
video:[
   {src:"works/video/Img 3864.mp4", title:"Video 01"}
]};
var C=[{id:"film",t:"Film",d:"Stories in motion.",h:190},{id:"photo",t:"Photography",d:"Light, held still.",h:28},{id:"video",t:"Videography",d:"Moments, as they happen.",h:222}];
var still=matchMedia("(prefers-reduced-motion:reduce)").matches;
if(still)document.body.classList.add("still");
var chap=[],main=document.getElementById("journey"),lb=document.getElementById("lb");
function isVid(s){return /\.(mp4|webm|mov)$/i.test(s)}
function openLB(w){lb.innerHTML="";var v=w.video||isVid(w.src),e=document.createElement(v?"video":"img");e.src=w.src;if(v){e.controls=true;e.autoplay=true}lb.appendChild(e);lb.hidden=false}
lb.onclick=function(e){if(e.target===lb)lb.hidden=true};
addEventListener("keydown",function(e){if(e.key==="Escape")lb.hidden=true});
function frame(w,c){var b=document.createElement("button");b.className="frame";
var v=w.video||isVid(w.src),e=document.createElement(v?"video":"img");e.src=w.src;
if(v){e.muted=true;e.loop=true;e.playsInline=true;e.preload="metadata";b.onmouseenter=function(){e.play()};b.onmouseleave=function(){e.pause()}}else e.alt=w.title||c.t;
b.setAttribute("aria-label",w.title||c.t);b.appendChild(e);b.onclick=function(){openLB(w)};return b}
function build(k){var o=chap[k],c=o.c,list=WORKS[c.id],t=o.track;t.innerHTML="";
if(!list.length){var m=document.createElement("p");m.className="empty";m.textContent="No works uploaded yet.";t.appendChild(m)}
else list.forEach(function(w){t.appendChild(frame(w,c))});
layout()}
C.forEach(function(c,k){var s=document.createElement("section");s.className="chapter";s.id=c.id;
s.innerHTML='<div class="stage"><div class="head"><h2>'+c.t+'</h2><p>'+c.d+'</p></div><div class="track"></div><div class="bar"></div></div>';
main.appendChild(s);var o={c:c,sec:s,track:s.querySelector(".track"),bar:s.querySelector(".bar"),dist:0};chap.push(o);build(k)});
function layout(){chap.forEach(function(o){o.dist=Math.max(0,o.track.scrollWidth-innerWidth);o.sec.style.height=(still||!WORKS[o.c.id].length)?"auto":(innerHeight+o.dist)+"px"});tick()}
function tick(){var hue=180,mid=innerHeight/2;
chap.forEach(function(o){var r=o.sec.getBoundingClientRect();if(r.top<=mid&&r.bottom>mid)hue=o.c.h;if(still||!WORKS[o.c.id].length)return;
var p=o.dist?Math.min(1,Math.max(0,-r.top/o.dist)):0;o.track.style.transform="translateX("+(-p*o.dist)+"px)";o.bar.style.transform="scaleX("+p+")";
[].forEach.call(o.track.children,function(f){var fr=f.getBoundingClientRect(),d=(fr.left+fr.width/2-innerWidth/2)/innerWidth,a=Math.abs(d);
f.style.transform="translateY("+(a*50)+"px) rotate("+(d*9)+"deg) scale("+(1-Math.min(a,1)*.18)+")";f.style.opacity=1-Math.min(a,1)*.5})});
document.documentElement.style.setProperty("--hue",hue)}
var busy=false;function req(){if(!busy){busy=true;requestAnimationFrame(function(){busy=false;tick()})}}
addEventListener("scroll",req,{passive:true});addEventListener("resize",layout);addEventListener("load",layout);
/* hero viewfinder */
var vf=document.getElementById("vf"),hd=document.getElementById("top");
hd.addEventListener("pointermove",function(e){var r=hd.getBoundingClientRect();vf.style.setProperty("--x",e.clientX-r.left+"px");vf.style.setProperty("--y",e.clientY-r.top+"px")});
var n=0;setInterval(function(){n++;var p=function(x){return String(x).padStart(2,"0")};document.getElementById("tc").textContent=p(Math.floor(n/3600))+":"+p(Math.floor(n/60)%60)+":"+p(n%60)},1000);
