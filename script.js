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

  // A wandering pixel goose. Its little "gift" stays until the page is reloaded.
  const goose=document.querySelector(".pixel-goose");
  if(goose&&!reducedMotion){
    let visitTimer;
    let noticeTimer;
    const scheduleGoose=()=>{visitTimer=window.setTimeout(startGoose,26000+Math.random()*22000);};
    const dropPoop=()=>{
      const rect=goose.getBoundingClientRect();
      const mark=document.createElement("span");
      mark.className="goose-poop-mark";
      mark.setAttribute("aria-hidden","true");
      mark.style.left=Math.round(rect.left+rect.width*.42)+"px";
      mark.style.top=Math.round(rect.top+rect.height*.76)+"px";
      document.body.appendChild(mark);
      const notice=document.createElement("div");
      notice.className="goose-notice";
      notice.setAttribute("role","status");
      notice.innerHTML="<strong>НОВОЕ СОБЫТИЕ / GOOSE.EXE</strong>Гусь накакал. История сохранится до перезагрузки страницы. Не благодарите.";
      document.body.appendChild(notice);
      requestAnimationFrame(()=>notice.classList.add("is-visible"));
      window.clearTimeout(noticeTimer);
      noticeTimer=window.setTimeout(()=>{notice.classList.remove("is-visible");window.setTimeout(()=>notice.remove(),250);},8500);
    };
    const startGoose=()=>{
      goose.classList.remove("is-running");
      const width=window.innerWidth;
      const height=window.innerHeight;
      const startY=Math.max(90,Math.min(height-150,height*(.25+Math.random()*.5)));
      const endY=Math.max(80,Math.min(height-140,startY+(Math.random()-.5)*Math.min(230,height*.35)));
      goose.style.top=startY+"px";
      goose.style.left="0px";
      goose.style.transform="translateX(-125px) scaleX(1)";
      void goose.offsetWidth;
      goose.classList.add("is-running");
      const rightward=Math.random()>.5;
      const from=rightward?-125:width+125;
      const to=rightward?width+125:-125;
      const direction=rightward?1:-1;
      goose.style.left=from+"px";
      goose.animate([
        {transform:`translate(0,0) rotate(-4deg) scaleX(${direction})`,offset:0},
        {transform:`translate(${(to-from)*.16}px,-28px) rotate(9deg) scaleX(${direction})`,offset:.16},
        {transform:`translate(${(to-from)*.31}px,12px) rotate(-8deg) scaleX(${direction})`,offset:.31},
        {transform:`translate(${(to-from)*.46}px,-18px) rotate(5deg) scaleX(${direction})`,offset:.46},
        {transform:`translate(${(to-from)*.53}px,0) rotate(-2deg) scaleX(${direction})`,offset:.54},
        {transform:`translate(${(to-from)*.61}px,-9px) rotate(12deg) scaleX(${direction})`,offset:.67},
        {transform:`translate(${(to-from)*.78}px,15px) rotate(-10deg) scaleX(${direction})`,offset:.82},
        {transform:`translate(${to-from}px,-4px) rotate(3deg) scaleX(${direction})`,offset:1}
      ],{duration:7800,easing:"linear",fill:"forwards"}).pause();
      const motion=goose.getAnimations().at(-1);
      motion.play();
      window.setTimeout(()=>{motion.pause();dropPoop();},4300);
      window.setTimeout(()=>motion.play(),5350);
      motion.onfinish=()=>{
        goose.classList.remove("is-running");
        goose.getAnimations().forEach(animation=>animation.cancel());
        scheduleGoose();
      };
    };
    window.setTimeout(startGoose,5200);
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