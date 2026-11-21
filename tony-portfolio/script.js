/* ADD WORKS: drop files in the /works folder, then list them here.
   Example: film:[{src:"works/film/short-film.mp4",title:"Short film"}]
   Any category left empty will show a "No works uploaded yet" message on the page. */
var WORKS={
film:[
    {src:"works/film/Img 0215.mp4", title:"Film 02"},
    {src:"works/film/Img 0834.mp4", title:"Film 03"},
    {src:"works/film/Img 3922.mp4", title:"Film 04"}
],
photo:[
    {src:"works/photo/IMG_2744.JPG", title:"Photo 03"},
    {src:"works/photo/IMG_3252.jpg", title:"Photo 11"},
    {src:"works/photo/IMG_3258.jpg", title:"Photo 12"},
    {src:"works/photo/IMG_3262.jpg", title:"Photo 13"},
    {src:"works/photo/IMG_3294.jpg", title:"Photo 14"},
],
video:[
   {src:"works/film/Img 4154.mp4", title:"Video 01"},
   {src:"works/video/Img 3864.mp4", title:"Video 02"}
]};

var CATS=[
  {id:"film",  t:"Film",        h:190},
  {id:"photo", t:"Photography", h:28},
  {id:"video", t:"Videography", h:222}
];

var reduceMotion=matchMedia("(prefers-reduced-motion:reduce)").matches;
var isVid=function(s){return /\.(mp4|webm|mov|m4v)$/i.test(s)};
var main=document.getElementById("journey");

/* ---------- intro video ---------- */
var heroVideo=document.getElementById("heroVideo");
var heroPlayback=document.getElementById("heroPlayback");
var heroSound=document.getElementById("heroSound");
var heroPausedByVisibility=false;
function updateHeroPlayback(){
  var playing=!heroVideo.paused&&!heroVideo.ended;
  heroPlayback.textContent=playing?"Pause intro":"Play intro";
  heroPlayback.setAttribute("aria-label",playing?"Pause intro video":"Play intro video");
}
if(heroVideo){
  var heroSource=heroVideo.querySelector("source");
  function loadHero(){
    if(heroSource&&!heroSource.src){
      heroSource.src=heroSource.dataset.src;
      heroVideo.load();
    }
  }
  heroPlayback.addEventListener("click",function(){
    heroPausedByVisibility=false;
    loadHero();
    if(heroVideo.paused||heroVideo.ended)heroVideo.play().catch(updateHeroPlayback);
    else heroVideo.pause();
  });
  heroSound.addEventListener("click",function(){
    heroVideo.muted=!heroVideo.muted;
    heroSound.textContent=heroVideo.muted?"Sound off":"Sound on";
    heroSound.setAttribute("aria-label",heroVideo.muted?"Turn sound on":"Mute video");
    if(!heroVideo.muted&&heroVideo.paused){
      loadHero();
      heroVideo.play().catch(updateHeroPlayback);
    }
  });
  heroVideo.addEventListener("play",updateHeroPlayback);
  heroVideo.addEventListener("pause",updateHeroPlayback);
  heroVideo.addEventListener("ended",updateHeroPlayback);
  var connection=navigator.connection;
  var lowDataMode=connection&&(connection.saveData||connection.effectiveType==="slow-2g"||connection.effectiveType==="2g");
  if(reduceMotion||lowDataMode)updateHeroPlayback();
  else{
    loadHero();
    heroVideo.play().catch(updateHeroPlayback);
  }
  var heroVisibilityObserver=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting&&!heroVideo.paused){
        heroPausedByVisibility=true;
        heroVideo.pause();
      }else if(entry.isIntersecting&&heroPausedByVisibility&&!reduceMotion){
        heroPausedByVisibility=false;
        heroVideo.play().catch(updateHeroPlayback);
      }
    });
  });
  heroVisibilityObserver.observe(heroVideo);
}

/* ---------- lightbox ---------- */
var lb=document.getElementById("lb"),lbBody=document.getElementById("lbBody"),lbClose=document.getElementById("lbClose");
var lbStatus=document.getElementById("lbStatus");
var lastFocus=null;
function openLB(w){
  if(!lb)return;
  lastFocus=document.activeElement;
  lbBody.innerHTML="";
  var v=w.video||isVid(w.src),el=document.createElement(v?"video":"img");
  if(v){
    el.controls=true;el.playsInline=true;el.preload="none";el.autoplay=true;
    lbStatus.textContent="Loading video…";
    lbStatus.hidden=false;
    el.addEventListener("playing",function(){lbStatus.hidden=true});
    el.addEventListener("error",function(){lbStatus.textContent="This video could not be loaded."});
  }else{
    el.loading="eager";el.decoding="async";el.alt=w.title||"";
  }
  el.src=w.src;
  lbBody.appendChild(el);
  lb.hidden=false;
  lbClose.focus();
  if(v)el.play().catch(function(){lbStatus.textContent="Press play to start this video."});
}
function closeLB(){
  if(!lb)return;
  var v=lbBody.querySelector("video");
  if(v){v.pause();v.removeAttribute("src");v.load()}
  lb.hidden=true;lbBody.innerHTML="";
  lbStatus.hidden=true;
  if(lastFocus)lastFocus.focus();
}
if(lb){
  lb.addEventListener("click",function(e){if(e.target===lb)closeLB()});
  lbClose.addEventListener("click",closeLB);
}
addEventListener("keydown",function(e){if(e.key==="Escape"&&lb&&!lb.hidden)closeLB()});

/* ---------- build one carousel frame (lazy-loaded) ---------- */
function makeFrame(w,cat){
  var b=document.createElement("button");
  b.className="frame";b.type="button";
  var title=w.title||cat.t;
  var v=w.video||isVid(w.src);
  b.setAttribute("aria-label",v?"Play "+title:"View "+title);
  if(v){
    b.classList.add("video-frame");
    var prompt=document.createElement("span");
    prompt.className="video-prompt";
    prompt.setAttribute("aria-hidden","true");
    var icon=document.createElement("span");
    icon.className="play-icon";
    icon.textContent="▶";
    var name=document.createElement("span");
    name.textContent=title;
    var action=document.createElement("small");
    action.textContent="Play video";
    prompt.appendChild(icon);
    prompt.appendChild(name);
    prompt.appendChild(action);
    b.appendChild(prompt);
  }else{
    var el=document.createElement("img");
    el.dataset.src=w.src;
    el.loading="lazy";
    el.decoding="async";
    el.alt="";
    b.appendChild(el);
  }

  var dragged=false;
  b.addEventListener("click",function(){if(!dragged)openLB(w)});
  b._setDragged=function(val){dragged=val};
  return b;
}

/* ---------- build a chapter (normal document flow; carousel scrolls natively) ---------- */
function buildChapter(cat){
  var sec=document.createElement("section");
  sec.className="chapter";
  sec.innerHTML=
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

  /* --- lazy-load images slightly ahead of view; videos load only when opened --- */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var el=en.target.querySelector("[data-src]");
        if(el&&!el.src){el.src=el.dataset.src;el.removeAttribute("data-src")}
      }
    });
  },{root:track,rootMargin:"0px 120% 0px 120%"});
  frames.forEach(function(f){if(f.querySelector("[data-src]"))io.observe(f)});

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

  return {sec:sec,track:track,measure:measure,update:update,empty:false};
}

var categoryId=main&&main.dataset.category;
var category=CATS.find(function(cat){return cat.id===categoryId});
var chapters=[];
if(category){
  document.documentElement.style.setProperty("--hue",category.h);
  chapters.push(buildChapter(category));
}

/* re-measure step sizes on resize (debounced) */
var rTimer;
addEventListener("resize",function(){
  clearTimeout(rTimer);
  rTimer=setTimeout(function(){chapters.forEach(function(c){if(!c.empty){c.measure();c.update()}})},200);
});
