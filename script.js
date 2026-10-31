(() => {
  "use strict";
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const themeToggle = document.getElementById("themeToggle");
  const themeQuery = window.matchMedia("(prefers-color-scheme: light)");
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f4f2ec" : "#12131a");
    if (themeToggle) {
      themeToggle.firstChild.textContent = theme === "light" ? "☾ " : "☼ ";
      themeToggle.setAttribute("aria-pressed", String(theme === "light"));
      themeToggle.title = theme === "light" ? "Сейчас светлая тема" : "Сейчас тёмная тема";
    }
  };
  let manualTheme = false;
  setTheme(themeQuery.matches ? "light" : "dark");
  themeToggle?.addEventListener("click", () => {
    manualTheme = true;
    setTheme(root.dataset.theme === "light" ? "dark" : "light");
  });
  themeQuery.addEventListener?.("change", (event) => {
    if (!manualTheme) setTheme(event.matches ? "light" : "dark");
  });
  document.getElementById("year")?.replaceChildren(String(new Date().getFullYear()));

  // Broken remote art should never leave a blank card.
  document.querySelectorAll(".gpd-game-art img").forEach(img => {
    img.addEventListener("error", () => {
      img.classList.add("is-broken");
      img.alt = "";
    }, { once:true });
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    root.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, {threshold:0.01,rootMargin:"0px 0px 40px 0px"});
    revealItems.forEach(item=>observer.observe(item));
  } else revealItems.forEach(item=>item.classList.add("is-visible"));


  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });

  // Pixel-hover typography: each glyph switches to the pixel font on hover.
  // Screen readers keep the original text through aria-label.
  const pixelTargets = "h1, h2, h3, .logo, .section-kicker, .card-label, .device-chip, .skill-level, .case-number, .game-franchises span, .tag, .btn";
  document.querySelectorAll(pixelTargets).forEach((element) => {
    if (element.dataset.pixelLetters === "true") return;
    const originalText = element.textContent;
    if (!originalText || !originalText.trim()) return;
    if (!element.hasAttribute("aria-label")) element.setAttribute("aria-label", originalText.replace(/\s+/g, " ").trim());
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue) nodes.push(walker.currentNode);
    }
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const tokens = node.nodeValue.match(/\s+|[^\s]+/gu) || [];
      tokens.forEach((token) => {
        if (/^\s+$/u.test(token)) {
          fragment.appendChild(document.createTextNode(token));
          return;
        }
        const word = document.createElement("span");
        word.className = "pixel-word";
        word.setAttribute("aria-hidden", "true");
        for (const character of token) {
          const glyph = document.createElement("span");
          glyph.className = "pixel-glyph";
          glyph.textContent = character;
          word.appendChild(glyph);
        }
        fragment.appendChild(word);
      });
      node.parentNode.replaceChild(fragment, node);
    });
    element.dataset.pixelLetters = "true";
  });


  // Decorative floating background particles removed: keep rendering light and the page calm.

  // Reading progress and a compact back-to-top control.
  const progress = document.createElement("div");
  progress.id = "scrollProgress";
  progress.setAttribute("aria-hidden","true");
  progress.innerHTML = "<span></span>";
  document.body.appendChild(progress);
  const topButton = document.createElement("button");
  topButton.id = "backToTop";
  topButton.type = "button";
  topButton.textContent = "↑";
  topButton.setAttribute("aria-label","Наверх");
  topButton.title = "Вернуться наверх";
  document.body.appendChild(topButton);
  topButton.addEventListener("click",()=>window.scrollTo({top:0,behavior:reducedMotion?"auto":"smooth"}));
  let scrollTick = false;
  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? window.scrollY / max : 0;
    root.style.setProperty("--scroll-progress",String(Math.max(0,Math.min(1,amount))));
    topButton.classList.toggle("is-visible",window.scrollY > 420);
    scrollTick = false;
  };
  window.addEventListener("scroll",()=>{
    if(!scrollTick){requestAnimationFrame(updateScrollUI);scrollTick=true;}
  },{passive:true});
  updateScrollUI();

  // Subtle pointer tilt and spotlight, disabled for touch-only devices.
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && !reducedMotion) {
    const tiltTargets = document.querySelectorAll(".project,.skill-card,.device-card,.ai-card,.device-main,.monitor");
    tiltTargets.forEach(card=>{
      card.addEventListener("pointermove",event=>{
        const rect=card.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width;
        const y=(event.clientY-rect.top)/rect.height;
        card.style.setProperty("--mx",(x*100)+"%");
        card.style.setProperty("--my",(y*100)+"%");
        const rx=(.5-y)*2.8, ry=(x-.5)*3.5;
        card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      });
      card.addEventListener("pointerleave",()=>{
        card.style.transform="";
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  // Goose patrol: stays in the visible viewport and moves in deliberate, smooth stages.
  const goose=document.querySelector(".pixel-goose");
  if(goose&&!reducedMotion){
    document.body.appendChild(goose);
    let runTimer=null,noticeTimer=null,activeAnimation=null,audioContext=null;
    let running=false,notice=null;
    const gooseWidth=64,gooseHeight=48;
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const unlockAudio=()=>{
      if(!audioContext){
        const AudioContextClass=window.AudioContext||window.webkitAudioContext;
        if(AudioContextClass)audioContext=new AudioContextClass();
      }
      if(audioContext?.state==="suspended")audioContext.resume().catch(()=>{});
    };
    document.addEventListener("pointerdown",unlockAudio,{once:true,passive:true});
    document.addEventListener("keydown",unlockAudio,{once:true});
    const quack=()=>{
      if(!audioContext||audioContext.state!=="running")return;
      const now=audioContext.currentTime;
      [0,0.16].forEach((offset,index)=>{
        const osc=audioContext.createOscillator();
        const gain=audioContext.createGain();
        osc.type="sawtooth";
        osc.frequency.setValueAtTime(index?560:690,now+offset);
        osc.frequency.exponentialRampToValueAtTime(index?300:360,now+offset+.13);
        gain.gain.setValueAtTime(.0001,now+offset);
        gain.gain.exponentialRampToValueAtTime(.055,now+offset+.018);
        gain.gain.exponentialRampToValueAtTime(.0001,now+offset+.15);
        osc.connect(gain);gain.connect(audioContext.destination);
        osc.start(now+offset);osc.stop(now+offset+.16);
      });
    };
    const showNotice=()=>{
      if(!notice){
        notice=document.createElement("aside");
        notice.className="goose-notice";
        notice.setAttribute("role","status");
        notice.textContent="Гусь оставил улику.";
        document.body.appendChild(notice);
      }
      const rect=goose.getBoundingClientRect();
      notice.style.left=clamp(rect.left+gooseWidth/2-105,12,window.innerWidth-222)+"px";
      notice.style.top=clamp(rect.top-54,12,window.innerHeight-70)+"px";
      notice.classList.remove("is-visible");
      void notice.offsetWidth;
      notice.classList.add("is-visible");
      window.clearTimeout(noticeTimer);
      noticeTimer=window.setTimeout(()=>notice?.classList.remove("is-visible"),3200);
    };
    const leaveMark=()=>{
      const width=10+Math.random()*8,height=7+Math.random()*6;
      const protectedElements=[...document.querySelectorAll(
        "img,picture,video,.legend-card,.legend-image,.legend-portrait,.inspiration-card,.source-art,.book-card,.project-card,.case-card,.device-card,.game-card,.hero-quote,.pixel-avatar"
      )];
      const safeRects=protectedElements.map(element=>{
        const rect=element.getBoundingClientRect();
        return {left:rect.left-12,right:rect.right+12,top:rect.top-12,bottom:rect.bottom+12};
      }).filter(rect=>rect.right>0&&rect.left<window.innerWidth&&rect.bottom>0&&rect.top<window.innerHeight);
      let left=0,top=0,found=false;
      const gooseRect=goose.getBoundingClientRect();
      for(let attempt=0;attempt<55;attempt++){
        const x=clamp(gooseRect.left+gooseWidth/2-width/2+(Math.random()-.5)*34,8,window.innerWidth-width-8);
        const y=clamp(gooseRect.bottom-5+(Math.random()-.5)*12,8,window.innerHeight-height-8);
        const blocked=safeRects.some(rect=>x<rect.right&&x+width>rect.left&&y<rect.bottom&&y+height>rect.top);
        if(!blocked){left=x;top=y;found=true;break;}
      }
      if(!found)return;
      const mark=document.createElement("span");
      mark.className="goose-poop-mark shape-"+Math.floor(Math.random()*4);
      mark.setAttribute("aria-hidden","true");
      mark.style.left=Math.round(left)+"px";
      mark.style.top=Math.round(top)+"px";
      mark.style.setProperty("--poop-w",Math.round(width)+"px");
      mark.style.setProperty("--poop-h",Math.round(height)+"px");
      mark.style.setProperty("--poop-base",Math.max(3,Math.round(height*.55))+"px");
      mark.style.setProperty("--poop-top-x",Math.round(width*.45)+"px");
      mark.style.setProperty("--poop-top-w",Math.max(3,Math.round(width*.25))+"px");
      mark.style.setProperty("--poop-top-h",Math.max(3,Math.round(height*.35))+"px");
      mark.style.setProperty("--poop-rotate",Math.round(-12+Math.random()*24)+"deg");
      mark.style.setProperty("--poop-color","#8b7259");
      document.body.appendChild(mark);
      showNotice();
    };
    const wait=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
    const animateTo=(from,to,duration,face)=>{
      goose.style.left=from+"px";
      goose.style.transform="translateY(0) scaleX("+face+")";
      const animation=goose.animate([
        {left:from+"px",transform:"translateY(0) scaleX("+face+")"},
        {left:to+"px",transform:"translateY(-2px) scaleX("+face+")",offset:.48},
        {left:to+"px",transform:"translateY(0) scaleX("+face+")"}
      ],{duration,easing:"cubic-bezier(.42,0,.2,1)",fill:"forwards"});
      activeAnimation=animation;
      return animation.finished.catch(()=>{});
    };
    async function startGoose(){
      if(running)return;
      running=true;
      goose.classList.add("is-running");
      const width=window.innerWidth;
      const leftToRight=Math.random()>.5;
      const face=leftToRight?1:-1;
      const start=leftToRight?-gooseWidth-8:width+8;
      const end=leftToRight?width+8:-gooseWidth-8;
      const stop=leftToRight?width*(.42+Math.random()*.2):width*(.38+Math.random()*.2);
      const top=clamp(window.innerHeight*(.34+Math.random()*.26),72,window.innerHeight-gooseHeight-70);
      goose.style.top=top+"px";
      await animateTo(start,stop,Math.max(1800,Math.abs(stop-start)*8),face);
      await wait(420);
      if(Math.random()<.48){
        leaveMark();
        await wait(300);
        await animateTo(stop,end,Math.max(1700,Math.abs(end-stop)*8),face);
      }else{
        goose.style.transform="translateY(0) scaleX("+(-face)+")";
        quack();
        await wait(380);
        await animateTo(stop,end,Math.max(1700,Math.abs(end-stop)*8),-face);
      }
      goose.classList.remove("is-running");
      running=false;
      activeAnimation=null;
      runTimer=window.setTimeout(startGoose,8500+Math.random()*9000);
    }
    window.addEventListener("resize",()=>{
      if(activeAnimation&&running){activeAnimation.cancel();running=false;goose.classList.remove("is-running");}
    });
    runTimer=window.setTimeout(startGoose,1800);
  }
})();


/* Book library: shuffled six-book preview and bespoke typographic covers. */
(() => {
  const library = document.getElementById("bookLibrary");
  const grid = document.getElementById("bookGrid");
  if (!library || !grid) return;
  const books = [...grid.querySelectorAll(".book-card")];
  const palette = ["cyan", "violet", "amber", "blue", "mint", "rose"];
  books.forEach((book, index) => {
    const category = book.querySelector(":scope > span")?.textContent?.trim() || "TECHNICAL BOOK";
    const title = book.querySelector("h4")?.textContent?.trim() || "Technical reference";
    const cover = document.createElement("div");
    cover.className = "book-cover";
    cover.setAttribute("aria-hidden", "true");
    const code = document.createElement("span");
    code.className = "book-cover-code";
    code.textContent = String(index + 1).padStart(2, "0") + " / GPD LIBRARY";
    const mark = document.createElement("span");
    mark.className = "book-cover-mark";
    mark.textContent = category.split(/[ /]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join("").toUpperCase();
    const name = document.createElement("strong");
    name.textContent = title;
    const foot = document.createElement("small");
    foot.textContent = category;
    cover.dataset.tone = palette[index % palette.length];
    cover.append(code, mark, name, foot);
    book.prepend(cover);
  });
  const shuffled = [...books];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const preview = new Set(shuffled.slice(0, 6));
  const render = () => books.forEach(book => { book.hidden = !library.open && !preview.has(book); });
  render();
  library.addEventListener("toggle", render);
})();