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

  // Goose patrol: a small, clearly recognizable bird crosses the viewport.
  const goose=document.querySelector(".pixel-goose");
  if(goose&&!reducedMotion){
    let noticeTimer;
    const showNotice=()=>{
      let notice=document.querySelector(".goose-notice");
      if(!notice){
        notice=document.createElement("aside");
        notice.className="goose-notice";
        notice.setAttribute("role","status");
        const heading=document.createElement("strong");
        heading.textContent="ГУСЬ / СИСТЕМНОЕ УВЕДОМЛЕНИЕ";
        const message=document.createElement("div");
        message.textContent="Гусь оставил сюрприз. Улики останутся до перезагрузки страницы.";
        const button=document.createElement("button");
        button.type="button";
        button.textContent="Понятно";
        button.addEventListener("click",()=>{notice.hidden=true;});
        notice.append(heading,message,button);
        document.body.appendChild(notice);
      }
      notice.hidden=false;
      notice.style.display="block";
      window.clearTimeout(noticeTimer);
      noticeTimer=window.setTimeout(()=>{notice.hidden=true;},12000);
    };
    const leaveMark=()=>{
      const rect=goose.getBoundingClientRect();
      const mark=document.createElement("span");
      const shape=Math.floor(Math.random()*4);
      const width=9+Math.random()*13;
      const height=7+Math.random()*8;
      mark.className="goose-poop-mark shape-"+shape;
      mark.setAttribute("aria-hidden","true");
      mark.style.left=Math.round(rect.left+rect.width*(.36+Math.random()*.2))+"px";
      mark.style.top=Math.round(rect.top+rect.height*(.78+Math.random()*.08))+"px";
      mark.style.setProperty("--poop-w",Math.round(width)+"px");
      mark.style.setProperty("--poop-h",Math.round(height)+"px");
      mark.style.setProperty("--poop-base",Math.max(3,Math.round(height*.55))+"px");
      mark.style.setProperty("--poop-top-x",Math.round(width*(.35+Math.random()*.2))+"px");
      mark.style.setProperty("--poop-top-w",Math.round(width*(.2+Math.random()*.2))+"px");
      mark.style.setProperty("--poop-top-h",Math.max(3,Math.round(height*.35))+"px");
      mark.style.setProperty("--poop-rotate",Math.round(-18+Math.random()*36)+"deg");
      mark.style.setProperty("--poop-color",["#98704f","#a27a58","#806044","#ad8662"][shape]);
      document.body.appendChild(mark);
      showNotice();
    };
    function startGoose(){
      const w=window.innerWidth,h=window.innerHeight;
      const y=Math.max(70,Math.min(h-80,Math.round(h*(.18+Math.random()*.58))));
      const leftToRight=Math.random()>.5;
      const start=leftToRight?-95:w+95;
      const distance=leftToRight?w+190:-(w+190);
      const facing=leftToRight?1:-1;
      goose.style.top=y+"px";
      goose.style.left=start+"px";
      goose.classList.add("is-running");
      const move=(x,dy,angle)=>"translate("+x+"px,"+dy+"px) rotate("+angle+"deg) scaleX("+facing+")";
      const motion=goose.animate([
        {transform:move(0,0,-3),offset:0},
        {transform:move(distance*.2,-8,3),offset:.2},
        {transform:move(distance*.4,4,-2),offset:.4},
        {transform:move(distance*.6,-7,3),offset:.6},
        {transform:move(distance*.8,3,-2),offset:.8},
        {transform:move(distance,0,0),offset:1}
      ],{duration:8500,easing:"linear",fill:"forwards"});
      const poopTimer=window.setTimeout(()=>leaveMark(),Math.round(2800+Math.random()*2600));
      motion.onfinish=()=>{
        window.clearTimeout(poopTimer);
        goose.classList.remove("is-running");
        window.setTimeout(startGoose,18000+Math.random()*16000);
      };
    }
    window.setTimeout(startGoose,2500);
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