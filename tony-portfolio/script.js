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

var CATS=[
  {id:"film",  t:"Film",        d:"Stories in motion.",     h:190},
  {id:"photo", t:"Photography", d:"Light, held still.",     h:28},
  {id:"video", t:"Videography", d:"Moments, as they happen.", h:222}
];

var reduceMotion=matchMedia("(prefers-reduced-motion:reduce)").matches;
var isVid=function(s){return /\.(mp4|webm|mov|m4v)$/i.test(s)};
var main=document.getElementById("journey");

/* ---------- lightbox ---------- */
var lb=document.getElementById("lb"),lbBody=document.getElementById("lbBody"),lbClose=document.getElementById("lbClose");
var lastFocus=null;
function openLB(w){
  lastFocus=document.activeElement;
  lbBody.innerHTML="";
  var v=w.video||isVid(w.src),el=document.createElement(v?"video":"img");
  el.src=w.src;
  if(v){el.controls=true;el.playsInline=true;el.autoplay=true}
  else{el.alt=w.title||""}
  lbBody.appendChild(el);
  lb.hidden=false;
  lbClose.focus();
  if(v)el.play().catch(function(){});
}
function closeLB(){
  var v=lbBody.querySelector("video");if(v)v.pause();
  lb.hidden=true;lbBody.innerHTML="";
  if(lastFocus)lastFocus.focus();
}
lb.addEventListener("click",function(e){if(e.target===lb)closeLB()});
lbClose.addEventListener("click",closeLB);
addEventListener("keydown",function(e){if(e.key==="Escape"&&!lb.hidden)closeLB()});

/* ---------- build one carousel frame (lazy-loaded) ---------- */
function makeFrame(w,cat){
  var b=document.createElement("button");
  b.className="frame";b.type="button";
  b.setAttribute("aria-label",(w.title||cat.t));
  var v=w.video||isVid(w.src);
  var el=document.createElement(v?"video":"img");
  el.dataset.src=w.src;
  if(v){el.muted=true;el.loop=true;el.playsInline=true;el.preload="none";el.setAttribute("aria-hidden","true")}
  else{el.loading="lazy";el.decoding="async";el.alt=""}
  b.appendChild(el);

  if(v){
    b.addEventListener("pointerenter",function(){if(el.src)el.play().catch(function(){})});
    b.addEventListener("pointerleave",function(){el.pause()});
  }

  var dragged=false;
  b.addEventListener("click",function(){if(!dragged)openLB(w)});
  b._setDragged=function(val){dragged=val};
  return b;
}

/* ---------- build a chapter (normal document flow; carousel scrolls natively) ---------- */
function buildChapter(cat){
  var sec=document.createElement("section");
  sec.className="chapter";sec.id=cat.id;
  sec.innerHTML=
    '<div class="head"><h2>'+cat.t+'</h2><p>'+cat.d+'</p></div>'+
    '<div class="carousel">'+
      '<button class="navbtn prev" aria-label="Previous ' + cat.t.toLowerCase() + ' work">‹</button>'+
      '<div class="track" tabindex="0" aria-label="'+cat.t+' works, scroll left or right"></div>'+
      '<button class="navbtn next" aria-label="Next ' + cat.t.toLowerCase() + ' work">›</button>'+
    '</div>'+
    '<div class="bar" aria-hidden="true"><i></i></div>';
  main.appendChild(sec);

  var track=sec.querySelector(".track"),bar=sec.querySelector(".bar i");
  var list=WORKS[cat.id]||[];

  if(!list.length){
    track.innerHTML="";
    var m=document.createElement("p");m.className="empty";m.textContent="No works uploaded yet.";
    track.appendChild(m);
    sec.querySelector(".carousel").style.display="block";
    sec.querySelector(".navbtn.prev").style.display="none";
    sec.querySelector(".navbtn.next").style.display="none";
    bar.parentElement.style.display="none";
    return {sec:sec,track:track,empty:true};
  }

  var frames=list.map(function(w){var f=makeFrame(w,cat);track.appendChild(f);return f});

  /* --- drag to scroll (mouse users without horizontal wheel/trackpad) --- */
  var down=false,startX=0,startScroll=0,moved=false;
  track.addEventListener("pointerdown",function(e){
    if(e.pointerType==="mouse"){down=true;moved=false;startX=e.clientX;startScroll=track.scrollLeft;track.setPointerCapture(e.pointerId)}
  });
  track.addEventListener("pointermove",function(e){
    if(!down)return;
    var dx=e.clientX-startX;
    if(Math.abs(dx)>6)moved=true;
    track.scrollLeft=startScroll-dx;
  });
  function endDrag(e){
    if(!down)return;down=false;
    if(moved)frames.forEach(function(f){f._setDragged(true);requestAnimationFrame(function(){f._setDragged(false)})});
  }
  track.addEventListener("pointerup",endDrag);
  track.addEventListener("pointerleave",endDrag);

  /* --- keyboard: left/right steps one frame at a time --- */
  track.addEventListener("keydown",function(e){
    if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;
    e.preventDefault();
    var step=(frames[0].offsetWidth)+parseFloat(getComputedStyle(track).columnGap||24);
    track.scrollBy({left:e.key==="ArrowRight"?step:-step,behavior:reduceMotion?"auto":"smooth"});
  });

  /* --- arrow buttons --- */
  var step=function(){return frames[0].offsetWidth+parseFloat(getComputedStyle(track).columnGap||24)};
  sec.querySelector(".navbtn.prev").addEventListener("click",function(){track.scrollBy({left:-step(),behavior:reduceMotion?"auto":"smooth"})});
  sec.querySelector(".navbtn.next").addEventListener("click",function(){track.scrollBy({left:step(),behavior:reduceMotion?"auto":"smooth"})});

  /* --- lazy-load media slightly ahead of view, using the track itself as the root --- */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var el=en.target.querySelector("[data-src]");
        if(el&&!el.src){el.src=el.dataset.src;el.removeAttribute("data-src")}
      }
    });
  },{root:track,rootMargin:"0px 120% 0px 120%"});
  frames.forEach(function(f){io.observe(f)});

  /* --- O(1) "active" (centered) frame + progress bar, updated on scroll (rAF-throttled) --- */
  var gap=0,frameStep=0,ticking=false;
  function measure(){
    gap=parseFloat(getComputedStyle(track).columnGap||24);
    frameStep=(frames[0]?frames[0].offsetWidth:300)+gap;
  }
  function update(){
    ticking=false;
    if(!frameStep)measure();
    var max=track.scrollWidth-track.clientWidth;
    bar.style.width=max>0?(Math.min(1,track.scrollLeft/max)*100)+"%":"100%";
    var idx=Math.round(track.scrollLeft/frameStep);
    idx=Math.max(0,Math.min(frames.length-1,idx));
    frames.forEach(function(f,i){f.classList.toggle("active",i===idx)});
  }
  track.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
  measure();update();

  /* --- pause offscreen videos to save battery/CPU --- */
  var pio=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var v=en.target.querySelector("video");
      if(v&&!en.isIntersecting)v.pause();
    });
  },{threshold:0});
  frames.forEach(function(f){pio.observe(f)});

  return {sec:sec,track:track,measure:measure,update:update,empty:false};
}

var chapters=CATS.map(buildChapter);

/* re-measure step sizes on resize (debounced) */
var rTimer;
addEventListener("resize",function(){
  clearTimeout(rTimer);
  rTimer=setTimeout(function(){chapters.forEach(function(c){if(!c.empty){c.measure();c.update()}})},200);
});

/* ---------- section reveal + ambient hue shift (IntersectionObserver, no scroll math) ---------- */
var revealIO=new IntersectionObserver(function(entries){
  entries.forEach(function(en){if(en.isIntersecting)en.target.classList.add("in")});
},{threshold:.2});
document.querySelectorAll(".head").forEach(function(h){revealIO.observe(h)});

var hueIO=new IntersectionObserver(function(entries){
  entries.forEach(function(en){
    if(en.isIntersecting){
      var cat=CATS.find(function(c){return c.id===en.target.id});
      if(cat)document.documentElement.style.setProperty("--hue",cat.h);
    }
  });
},{rootMargin:"-45% 0px -45% 0px",threshold:0});
chapters.forEach(function(c){hueIO.observe(c.sec)});

/* ---------- hero viewfinder + timecode ---------- */
var vf=document.getElementById("vf"),hd=document.getElementById("top");
hd.addEventListener("pointermove",function(e){
  var r=hd.getBoundingClientRect();
  vf.style.setProperty("--x",(e.clientX-r.left)+"px");
  vf.style.setProperty("--y",(e.clientY-r.top)+"px");
});
var n=0,tc=document.getElementById("tc");
setInterval(function(){
  n++;
  var p=function(x){return String(x).padStart(2,"0")};
  tc.textContent=p(Math.floor(n/3600))+":"+p(Math.floor(n/60)%60)+":"+p(n%60);
},1000);
