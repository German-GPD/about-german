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

  // Deterministic goose loop: mark -> run to center -> face visitor and quack -> run off-screen.
  const goose=document.querySelector(".pixel-goose");
  if(goose){
    document.body.appendChild(goose);
    let timer=0,animation=null,noticeTimer=0,audioContext=null,notice=null,stopped=false,runId=0,cycle=0,quackPending=false;
    const W=64,H=48,clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const profileMarkup=goose.innerHTML;
    const frontMarkup=`<svg class="goose-art" viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
      <path fill="#eeeae0" d="M4 2h2V1h4v1h2v2h1v4h-1v1H4V8H3V4h1z"/>
      <path fill="#c9c5bb" d="M4 7h2v1h4V7h2v2H4z"/>
      <path fill="#25252b" d="M5 3h1v1H5zM10 3h1v1h-1z"/>
      <path fill="#d99b42" d="M7 4h2v2H7zM6 10h1v1H6zM9 10h1v1H9z"/>
      <rect class="goose-leg leg-a" x="5" y="9" width="1" height="2" fill="#d99b42"/>
      <rect class="goose-leg leg-b" x="10" y="9" width="1" height="2" fill="#d99b42"/>
    </svg>`;
    const wait=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
    const playQuack=()=>{
      if(!audioContext||audioContext.state!=="running"){quackPending=true;return;}
      quackPending=false;
      const t=audioContext.currentTime;
      [0,.14].forEach((delay,i)=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain(),filter=audioContext.createBiquadFilter();
        osc.type="sawtooth";filter.type="lowpass";filter.frequency.setValueAtTime(900,t+delay);
        osc.frequency.setValueAtTime(i?440:590,t+delay);
        osc.frequency.exponentialRampToValueAtTime(i?190:260,t+delay+.17);
        gain.gain.setValueAtTime(.0001,t+delay);
        gain.gain.exponentialRampToValueAtTime(.045,t+delay+.02);
        gain.gain.exponentialRampToValueAtTime(.0001,t+delay+.2);
        osc.connect(filter);filter.connect(gain);gain.connect(audioContext.destination);
        osc.start(t+delay);osc.stop(t+delay+.21);
      });
    };
    const unlockAudio=()=>{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!audioContext&&Audio)audioContext=new Audio();
      if(audioContext?.state==="suspended")audioContext.resume().then(()=>{if(quackPending)playQuack();}).catch(()=>{});
    };
    document.addEventListener("pointerdown",unlockAudio,{passive:true});
    document.addEventListener("keydown",unlockAudio);
    const showNotice=(x,y)=>{
      if(!notice){notice=document.createElement("div");notice.className="goose-notice";notice.setAttribute("role","status");notice.setAttribute("aria-live","polite");document.body.appendChild(notice);}
      notice.textContent="Гусь оставил улику.";
      notice.style.left=clamp(x-82,8,Math.max(8,innerWidth-180))+"px";
      notice.style.top=clamp(y-42,8,Math.max(8,innerHeight-42))+"px";
      notice.classList.remove("is-visible");void notice.offsetWidth;notice.classList.add("is-visible");
      clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice?.classList.remove("is-visible"),2200);
    };
    const leaveMarkAtCenter=()=>{
      const w=18,h=13,x=Math.round((innerWidth-w)/2),y=Math.round((innerHeight-h)/2);
      const mark=document.createElement("i");mark.className="goose-poop-mark";mark.setAttribute("aria-hidden","true");
      mark.style.left=x+"px";mark.style.top=y+"px";
      mark.style.setProperty("--poop-w",w+"px");mark.style.setProperty("--poop-h",h+"px");
      mark.style.setProperty("--poop-tone","#887052");
      document.body.appendChild(mark);
      const marks=document.querySelectorAll(".goose-poop-mark");if(marks.length>8)marks[0].remove();
      showNotice(x+w/2,y);
    };
    const setSide=(face,x)=>{
      goose.innerHTML=profileMarkup;
      goose.style.transform="translate3d("+x+"px,0,0) scaleX("+face+")";
    };
    const setFront=(x)=>{
      goose.innerHTML=frontMarkup;
      goose.style.transform="translate3d("+x+"px,0,0)";
    };
    const move=async(from,to,duration,face,id)=>{
      setSide(face,from);
      if(typeof goose.animate==="function"){
        try{
          animation=goose.animate([
            {transform:"translate3d("+from+"px,0,0) scaleX("+face+")"},
            {transform:"translate3d("+to+"px,0,0) scaleX("+face+")"}
          ],{duration,easing:"linear",fill:"forwards"});
          await animation.finished;
          if(id!==runId)return;
          goose.style.transform="translate3d("+to+"px,0,0) scaleX("+face+")";
          animation.cancel();animation=null;
          return;
        }catch(_){if(id!==runId)return;animation=null;}
      }
      goose.style.transition="transform "+duration+"ms linear";
      void goose.offsetWidth;
      goose.style.transform="translate3d("+to+"px,0,0) scaleX("+face+")";
      await wait(duration);
      if(id!==runId)return;
      goose.style.transition="";
    };
    const patrol=async()=>{
      if(stopped||document.hidden)return;
      const id=++runId,vw=innerWidth,vh=innerHeight;
      const face=cycle%2===0?1:-1;cycle++;
      const startX=face===1?-W-8:vw+8,exitX=face===1?vw+8:-W-8;
      const centerX=(vw-W)/2;
      const y=clamp(vh*.58,72,Math.max(72,vh-H-56));
      goose.style.left="0px";goose.style.top=y+"px";goose.style.transition="";
      goose.style.transform="translate3d("+startX+"px,0,0) scaleX("+face+")";
      goose.classList.add("is-running");
      leaveMarkAtCenter();
      await wait(350);
      if(id!==runId)return;
      await move(startX,centerX,Math.max(2600,Math.abs(centerX-startX)*6),face,id);
      if(id!==runId)return;
      await wait(500);
      if(id!==runId)return;
      setFront(centerX);
      playQuack();
      await wait(1100);
      if(id!==runId)return;
      await move(centerX,exitX,Math.max(2600,Math.abs(exitX-centerX)*6),-face,id);
      if(id!==runId)return;
      goose.classList.remove("is-running");
      timer=setTimeout(patrol,9000);
    };
    const pause=()=>{
      runId++;
      if(animation){animation.cancel();animation=null;}
      goose.style.transition="";
      goose.classList.remove("is-running");
    };
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden){stopped=true;clearTimeout(timer);pause();}
      else{stopped=false;clearTimeout(timer);timer=setTimeout(patrol,900);}
    });
    window.addEventListener("resize",()=>{
      if(goose.classList.contains("is-running")){
        stopped=true;clearTimeout(timer);pause();
        timer=setTimeout(()=>{stopped=false;patrol();},500);
      }
    });
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