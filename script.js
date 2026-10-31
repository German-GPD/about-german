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


  // Ambient pixel scene: stars, stepped light trails, a rocket and a family of ducks.
  (() => {
    const canvas = document.getElementById("pixelAtmosphere");
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = (min, max) => min + Math.random() * (max - min);
    let width = 0, height = 0, dpr = 1, last = 0;
    let rocket = null, ducks = null, raf = 0;
    let nextRocketAt = performance.now() + 6500;
    let nextDucksAt = performance.now() + 10500;
    const stars = [];
    const threads = [];
    const pixel = (x,y,w,h,color) => { ctx.fillStyle=color; ctx.fillRect(Math.round(x),Math.round(y),w,h); };
    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width*dpr);
      canvas.height = Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      stars.length = 0; threads.length = 0;
      const count = Math.min(100, Math.max(34, Math.round(width*height/14500)));
      for(let i=0;i<count;i++) stars.push({x:rand(0,width),y:rand(0,height),size:Math.random()<.82?2:3,phase:rand(0,6.28),speed:rand(.45,1.4),tone:Math.random()});
      for(let i=0;i<7;i++){
        const x=rand(20,width-20), y=rand(30,height*.82);
        const length=rand(34,100), rise=rand(-22,22);
        threads.push({x,y,length,rise,phase:rand(0,6.28)});
      }
    };
    const drawStar = (s,t) => {
      const pulse = reduced ? .55 : .28 + (Math.sin(t*s.speed+s.phase)+1)*.24;
      ctx.globalAlpha=pulse;
      const color=s.tone<.18?"#8be9df":s.tone<.38?"#b7a1ff":s.tone<.48?"#ffd88a":"#d9e5ff";
      pixel(s.x,s.y,s.size,s.size,color);
      if(s.size>2){pixel(s.x+1,s.y-2,1,2,color);pixel(s.x+1,s.y+3,1,2,color);}
    };
    const drawThreads = t => {
      threads.forEach((p,i)=>{
        const alpha=.10+(.05*Math.sin(t*.0005+p.phase));
        ctx.globalAlpha=alpha;
        const x=p.x+Math.sin(t*.00018+p.phase)*5;
        const y=p.y+Math.cos(t*.0002+p.phase)*4;
        ctx.fillStyle=i%2?"#a98bff":"#65dcd4";
        for(let n=0;n<p.length;n+=6){
          const yy=y+(n/p.length)*p.rise;
          ctx.fillRect(Math.round(x+n),Math.round(yy),3,1);
          if(n%24===0)ctx.fillRect(Math.round(x+n),Math.round(yy)-2,1,5);
        }
      });
    };
    const drawRocket = t => {
      const dt=Math.min(.04,(t-last)/1000||0);
      rocket.x+=rocket.speed*dt;
      const x=Math.round(rocket.x),y=Math.round(rocket.y);
      ctx.globalAlpha=.9;
      // Short, stepped exhaust trail.
      pixel(x-18,y+5,8,2,"#8b5cf6");pixel(x-27,y+7,7,2,"#4fcacb");
      pixel(x-34,y+9,5,2,"#e4a44b");
      pixel(x-10,y+3,5,4,"#f6f1e8");
      pixel(x-5,y+1,11,8,"#b9b4ff");
      pixel(x+5,y-1,7,12,"#d9d7ff");
      pixel(x+11,y+2,5,6,"#ff7186");
      pixel(x-2,y-3,5,4,"#ff7186");pixel(x-2,y+9,5,4,"#ff7186");
      pixel(x+6,y+2,4,4,"#182338");pixel(x+7,y+3,2,2,"#72dce1");
      pixel(x-17,y+3,4,2,"#f4b75e");pixel(x-22,y+5,4,2,Math.sin(t*.025)>0?"#ff7186":"#f4b75e");
      if(x>width+70){rocket=null;nextRocketAt=t+rand(18000,26000);}
    };
    const drawDuck = (x,y,scale,shade,step) => {
      const s=scale, body=shade?"#e7bd58":"#f2d36f", wing=shade?"#c9993f":"#d9ad4c";
      // Tiny side-facing duck, deliberately simple and readable at pixel scale.
      pixel(x+2*s,y+5*s,8*s,5*s,body);
      pixel(x+4*s,y+3*s,5*s,3*s,body);
      pixel(x+8*s,y+1*s,4*s,4*s,body);
      pixel(x+11*s,y+3*s,4*s,2*s,"#e99a45");
      pixel(x+5*s,y+6*s,4*s,2*s,wing);
      pixel(x+10*s,y+2*s,1*s,1*s,"#202638");
      pixel(x+4*s,y+10*s,2*s,2*s,"#d68e48");
      pixel(x+9*s,y+10*s,2*s,2*s,"#d68e48");
      if(step){pixel(x+3*s,y+11*s,3*s,1*s,"#d68e48");pixel(x+8*s,y+11*s,3*s,1*s,"#d68e48");}
    };
    const drawDucks = t => {
      const x=Math.round(ducks.x),y=Math.round(ducks.y),step=Math.floor(t/170)%2;
      ctx.globalAlpha=.94;
      drawDuck(x,y,2,0,step);
      drawDuck(x-34,y+7,1,1,step);
      drawDuck(x-56,y+9,1,0,1-step);
      drawDuck(x-78,y+7,1,1,step);
      ducks.x+=ducks.speed*Math.min(.04,(t-last)/1000||0);
      if(ducks.x>width+100){ducks=null;nextDucksAt=t+rand(24000,34000);}
    };
    const render = t => {
      if(document.hidden){raf=0;return;}
      ctx.clearRect(0,0,width,height);
      stars.forEach(s=>drawStar(s,t*.001));
      drawThreads(t);
      if(!reduced){
        if(!rocket && t>=nextRocketAt) rocket={x:-60,y:rand(height*.12,height*.46),speed:rand(70,105)};
        if(!ducks && t>=nextDucksAt) ducks={x:-90,y:Math.min(height-58,Math.max(height*.72,150)),speed:rand(34,47)};
        if(rocket)drawRocket(t);
        if(ducks)drawDucks(t);
      }
      ctx.globalAlpha=1;
      last=t;
      raf=requestAnimationFrame(render);
    };
    resize();
    if(!reduced) raf=requestAnimationFrame(render);
    else {ctx.clearRect(0,0,width,height);stars.forEach(s=>drawStar(s,0));drawThreads(0);}
    window.addEventListener("resize",()=>{resize();if(reduced){ctx.clearRect(0,0,width,height);stars.forEach(s=>drawStar(s,0));drawThreads(0);}},{passive:true});
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}
      else if(!reduced&&!raf){last=performance.now();raf=requestAnimationFrame(render);}
    });
  })();
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