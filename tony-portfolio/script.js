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
var heroStatus=document.getElementById("heroStatus");
var heroPausedByVisibility=false;
function updateHeroPlayback(){
  var playing=!heroVideo.paused&&!heroVideo.ended;
  heroPlayback.textContent=playing?"Pause intro":"Play intro with sound";
  heroPlayback.setAttribute("aria-label",playing?"Pause intro video":"Play intro video with sound");
  if(playing)heroStatus.hidden=true;
}
if(heroVideo){
  var heroSource=heroVideo.querySelector("source");
  function loadHero(){
    if(heroSource&&!heroSource.src){
      heroSource.src=heroSource.dataset.src;
      heroVideo.load();
    }
  }
  function playHero(){
    loadHero();
    heroVideo.play().catch(function(error){
      if(error&&error.name==="NotAllowedError"){
        heroSource.removeAttribute("src");
        heroVideo.load();
        heroStatus.textContent="Your browser blocked sound-on autoplay. Press Play intro with sound to start.";
      }else{
        heroStatus.textContent="The intro could not start. Press Play intro with sound to try again.";
      }
      heroStatus.hidden=false;
      updateHeroPlayback();
    });
  }
  heroPlayback.addEventListener("click",function(){
    heroPausedByVisibility=false;
    if(heroVideo.paused||heroVideo.ended)playHero();
    else heroVideo.pause();
  });
  heroSound.addEventListener("click",function(){
    heroVideo.muted=!heroVideo.muted;
    heroSound.textContent=heroVideo.muted?"Sound off":"Sound on";
    heroSound.setAttribute("aria-label",heroVideo.muted?"Turn sound on":"Mute intro");
    if(!heroVideo.muted&&heroVideo.paused)playHero();
  });
  heroVideo.addEventListener("play",function(){heroStatus.hidden=true;updateHeroPlayback()});
  heroVideo.addEventListener("pause",updateHeroPlayback);
  heroVideo.addEventListener("ended",updateHeroPlayback);
  var connection=navigator.connection;
  var lowDataMode=connection&&(connection.saveData||connection.effectiveType==="slow-2g"||connection.effectiveType==="2g");
  if(reduceMotion||lowDataMode)updateHeroPlayback();
  else playHero();
  var heroVisibilityObserver=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting&&!heroVideo.paused){
        heroPausedByVisibility=true;
        heroVideo.pause();
      }else if(entry.isIntersecting&&heroPausedByVisibility&&!reduceMotion){
        heroPausedByVisibility=false;
        playHero();
      }
    });
  });
  heroVisibilityObserver.observe(heroVideo);
}

/* ---------- lightbox ---------- */
var lb=document.getElementById("lb"),lbBody=document.getElementById("lbBody"),lbClose=document.getElementById("lbClose");
var lbStatus=document.getElementById("lbStatus"),lbTitle=document.getElementById("lbTitle");
var lbPrev=document.getElementById("lbPrev"),lbNext=document.getElementById("lbNext"),lbExit=document.getElementById("lbExit");
var lastFocus=null;
var focusItems=[];
var focusIndex=0;
function showFocusedWork(index){
  if(!lb||!focusItems.length)return;
  focusIndex=Math.max(0,Math.min(focusItems.length-1,index));
  var w=focusItems[focusIndex];
  if(!lb)return;
  var previousVideo=lbBody.querySelector("video");
  if(previousVideo){previousVideo.pause();previousVideo.removeAttribute("src");previousVideo.load()}
  lbBody.innerHTML="";
  lbStatus.hidden=true;
  lbPrev.disabled=focusIndex===0;
  lbNext.disabled=focusIndex===focusItems.length-1;
  var itemName=category&&category.id==="photo"?"photo":"video";
  lbPrev.setAttribute("aria-label","Previous "+itemName);
  lbNext.setAttribute("aria-label","Next "+itemName);
  lbTitle.textContent=(w.title||"Work")+" - "+(focusIndex+1)+" of "+focusItems.length;
  var v=w.video||isVid(w.src),el=document.createElement(v?"video":"img");
  if(v){
    el.controls=true;el.playsInline=true;el.preload="none";el.autoplay=true;el.muted=true;
    lbStatus.textContent="Loading video…";
    lbStatus.hidden=false;
    el.addEventListener("playing",function(){lbStatus.hidden=true});
    el.addEventListener("error",function(){lbStatus.textContent="This video could not be loaded."});
  }else{
    el.loading="eager";el.decoding="async";el.alt=w.title||"";
  }
  el.src=w.src;
  lbBody.appendChild(el);
  if(v)el.play().catch(function(){lbStatus.textContent="Press play to start this video."});
}
function openLB(w,items,index){
  if(!lb)return;
  lastFocus=document.activeElement;
  focusItems=items&&items.length?items:[w];
  focusIndex=typeof index==="number"?index:Math.max(0,focusItems.indexOf(w));
  lb.hidden=false;
  document.body.classList.add("focus-open");
  showFocusedWork(focusIndex);
  lbClose.focus();
}
function moveFocus(step){
  var next=focusIndex+step;
  if(next>=0&&next<focusItems.length)showFocusedWork(next);
}
function closeLB(){
  if(!lb)return;
  var v=lbBody.querySelector("video");
  if(v){v.pause();v.removeAttribute("src");v.load()}
  lb.hidden=true;lbBody.innerHTML="";
  lbStatus.hidden=true;
  lbTitle.textContent="";
  document.body.classList.remove("focus-open");
  focusItems=[];
  focusIndex=0;
  if(lastFocus)lastFocus.focus();
}
if(lb){
  lb.addEventListener("click",function(e){if(e.target===lb)closeLB()});
  lbClose.addEventListener("click",closeLB);
  lbExit.addEventListener("click",closeLB);
  lbPrev.addEventListener("click",function(){moveFocus(-1)});
  lbNext.addEventListener("click",function(){moveFocus(1)});
}
addEventListener("keydown",function(e){
  if(!lb||lb.hidden)return;
  if(e.key==="Escape")closeLB();
  else if(e.key==="ArrowLeft")moveFocus(-1);
  else if(e.key==="ArrowRight")moveFocus(1);
});

/* ---------- build one carousel frame (lazy-loaded) ---------- */
function makeFrame(w,cat,works,index){
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
  b.addEventListener("click",function(){if(!dragged)openLB(w,works,index)});
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

  var frames=list.map(function(w,index){var f=makeFrame(w,cat,list,index);track.appendChild(f);return f});

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
  if((category.id==="film"||category.id==="video")&&WORKS[category.id].length){
    openLB(WORKS[category.id][0],WORKS[category.id],0);
  }
}

/* re-measure step sizes on resize (debounced) */
var rTimer;
addEventListener("resize",function(){
  clearTimeout(rTimer);
  rTimer=setTimeout(function(){chapters.forEach(function(c){if(!c.empty){c.measure();c.update()}})},200);
});
