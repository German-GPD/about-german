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

  // Goose patrol: a true pixel sprite, smooth staged movement, and viewport-local reactions.
  const goose=document.querySelector(".pixel-goose");
  if(goose&&!reducedMotion){
    document.body.appendChild(goose);
    let timer=0,animation=null,noticeTimer=0,audioContext=null,notice=null,stopped=false;
    const W=64,H=48,clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const wait=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
    const makeAudio=()=>{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!audioContext&&Audio)audioContext=new Audio();
      if(audioContext?.state==="suspended")audioContext.resume().catch(()=>{});
    };
    document.addEventListener("pointerdown",makeAudio,{once:true,passive:true});
    document.addEventListener("keydown",makeAudio,{once:true});
    const quack=()=>{
      if(!audioContext||audioContext.state!=="running")return;
      const t=audioContext.currentTime;
      [0,.14].forEach((delay,i)=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain();
        osc.type="triangle";
        osc.frequency.setValueAtTime(i?520:660,t+delay);
        osc.frequency.exponentialRampToValueAtTime(i?270:330,t+delay+.12);
        gain.gain.setValueAtTime(.0001,t+delay);
        gain.gain.exponentialRampToValueAtTime(.045,t+delay+.015);
        gain.gain.exponentialRampToValueAtTime(.0001,t+delay+.14);
        osc.connect(gain);gain.connect(audioContext.destination);
        osc.start(t+delay);osc.stop(t+delay+.15);
      });
    };
    const showNotice=()=>{
      if(!notice){
        notice=document.createElement("div");
        notice.className="goose-notice";
        notice.setAttribute("role","status");
        notice.setAttribute("aria-live","polite");
        document.body.appendChild(notice);
      }
      notice.textContent="Гусь оставил улику.";
      const r=goose.getBoundingClientRect(),vw=window.innerWidth,vh=window.innerHeight;
      const left=clamp(r.left+W/2-90,8,Math.max(8,vw-188));
      const top=r.top>58?r.top-48:clamp(r.bottom+8,8,Math.max(8,vh-46));
      notice.style.left=left+"px";notice.style.top=top+"px";
      notice.classList.remove("is-visible");void notice.offsetWidth;notice.classList.add("is-visible");
      clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice?.classList.remove("is-visible"),2400);
    };
    const leaveMark=()=>{
      const w=12+Math.floor(Math.random()*7),h=8+Math.floor(Math.random()*5);
      const r=goose.getBoundingClientRect();
      const protectedNodes=document.querySelectorAll("img,picture,video,.legend-card,.legend-image,.inspiration-card,.source-art,.book-card,.project-card,.case-card,.device-card,.game-card,.hero-quote,.pixel-avatar");
      const protectedRects=[...protectedNodes].map(node=>node.getBoundingClientRect()).filter(box=>box.width&&box.height);
      for(let attempt=0;attempt<30;attempt++){
        const x=clamp(r.left+W/2-w/2+(Math.random()-.5)*22,8,Math.max(8,innerWidth-w-8));
        const y=clamp(r.bottom-5+(Math.random()-.5)*8,8,Math.max(8,innerHeight-h-8));
        const collision=protectedRects.some(box=>x<box.right+8&&x+w>box.left-8&&y<box.bottom+8&&y+h>box.top-8);
        if(collision)continue;
        const mark=document.createElement("i");
        mark.className="goose-poop-mark";
        mark.setAttribute("aria-hidden","true");
        mark.style.left=x+"px";mark.style.top=y+"px";
        mark.style.setProperty("--poop-w",w+"px");mark.style.setProperty("--poop-h",h+"px");
        mark.style.setProperty("--poop-tone",["#887052","#9a7a57","#786044"][Math.floor(Math.random()*3)]);
        document.body.appendChild(mark);showNotice();return;
      }
    };
    const move=async(from,to,duration,face)=>{
      goose.style.left="0px";
      goose.style.top=goose.dataset.y+"px";
      goose.style.transform="translate3d(0,0,0) scaleX("+face+")";
      const dx=from;
      goose.style.setProperty("--goose-x",dx+"px");
      const keyframes=[
        {transform:"translate3d("+from+"px,0,0) scaleX("+face+")"},
        {transform:"translate3d("+to+"px,0,0) scaleX("+face+")"}
      ];
      animation=goose.animate(keyframes,{duration,easing:"cubic-bezier(.36,.02,.18,1)",fill:"forwards"});
      try{await animation.finished;}catch(_){}
      if(animation){
        goose.style.transform="translate3d("+to+"px,0,0) scaleX("+face+")";
        animation.cancel();animation=null;
      }
    };
    const patrol=async()=>{
      if(stopped||document.hidden)return;
      const vw=innerWidth,vh=innerHeight;
      const face=Math.random()<.5?1:-1;
      const startX=face===1?-W-8:vw+8,endX=face===1?vw+8:-W-8;
      const stopX=face===1?vw*(.46+Math.random()*.08):vw*(.46+Math.random()*.08);
      const y=clamp(vh*(.32+Math.random()*.28),72,Math.max(72,vh-H-64));
      goose.dataset.y=y;goose.style.top=y+"px";goose.style.left="0px";
      goose.classList.add("is-running");
      await move(startX,stopX,Math.max(2600,Math.abs(stopX-startX)*10),face);
      await wait(650);
      if(Math.random()<.48){
        leaveMark();
        await wait(420);
        await move(stopX,endX,Math.max(2400,Math.abs(endX-stopX)*10),face);
      }else{
        // Pause, turn in place, quack, then continue back the way it came.
        goose.style.transform="translate3d("+stopX+"px,0,0) scaleX("+(-face)+")";
        quack();await wait(650);
        await move(stopX,face===1?-W-8:vw+8,Math.max(2600,Math.abs((face===1?-W-8:vw+8)-stopX)*10),-face);
      }
      goose.classList.remove("is-running");
      timer=setTimeout(patrol,9000+Math.random()*7000);
    };
    const pause=()=>{
      if(animation){animation.cancel();animation=null;}
      goose.classList.remove("is-running");
    };
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden){stopped=true;clearTimeout(timer);pause();}
      else{stopped=false;timer=setTimeout(patrol,1200);}
    });
    window.addEventListener("resize",()=>{if(animation){pause();stopped=true;clearTimeout(timer);timer=setTimeout(()=>{stopped=false;patrol();},500);}});
    timer=setTimeout(patrol,1400);
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