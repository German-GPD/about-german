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

  // Pixel-hover typography only on desktop pointers; skip DOM rewriting on phones and reduced-motion devices.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
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
  }


  // Decorative floating background particles removed: keep rendering light and the page calm.

  // Reading progress and a compact back-to-top control.
  const progress = document.createElement("div");
  progress.id = "scrollProgress";
  progress.setAttribute("aria-hidden","true");
  progress.innerHTML = "<span></span>";
  document.body.appendChild(progress);
  const bottomDock = document.createElement("div");
  bottomDock.id = "pageDock";
  bottomDock.className = "page-dock";
  bottomDock.innerHTML = '<div class="page-dock-chapter"><span class="page-dock-kicker">СЕЙЧАС ВЫ</span><b id="currentChapter">01 / ОБО МНЕ</b><span class="page-dock-track"><i id="chapterProgress"></i></span></div><button id="backToTop" type="button" aria-label="Вернуться наверх" title="Плавно вернуться к началу"><span>↑</span><b>НАВЕРХ</b></button>';
  document.body.appendChild(bottomDock);
  const topButton = document.getElementById("backToTop");
  const chapterLabel = document.getElementById("currentChapter");
  const chapterProgress = document.getElementById("chapterProgress");
  topButton.addEventListener("click",()=>window.scrollTo({top:0,behavior:reducedMotion?"auto":"smooth"}));
  const chapters = [...document.querySelectorAll("main section[id]")].map((section,index)=>{
    const heading=section.querySelector("h1,h2");
    const raw=section.querySelector(".section-kicker")?.textContent?.trim() || heading?.textContent?.trim() || "РАЗДЕЛ";
    return {section,label:raw.replace(/^\d+\s*\/\s*/,"").slice(0,24),index};
  });
  let scrollTick = false;
  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const amount = max > 0 ? window.scrollY / max : 0;
    root.style.setProperty("--scroll-progress",String(Math.max(0,Math.min(1,amount))));
    let active=chapters[0];
    for(const chapter of chapters){if(chapter.section.getBoundingClientRect().top<=window.innerHeight*.38)active=chapter;else break;}
    if(active&&chapterLabel) chapterLabel.textContent=String(active.index+1).padStart(2,"0")+" / "+active.label;
    if(chapterProgress) chapterProgress.style.width=(Math.max(0,Math.min(1,amount))*100)+"%";
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


  // GPD Bot: slow editorial-style dialogue, viewport-wide eye tracking and natural blinks.
  const robotMessage = document.getElementById("robotMessage");
  const botFace = document.querySelector(".bot-face");
  if (robotMessage) {
    const messages = [
      "Я не торможу. Я загружаю следующий уровень реальности.",
      "Проверил твой код. Он попросил адвоката.",
      "У меня 2 ГБ оперативной памяти. Один гигабайт — на тревожность.",
      "Баг исправлен. Теперь их двое. Они пришли попрощаться.",
      "Сделал бэкап. Теперь можно смело уничтожать оригинал.",
      "Я хотел стать нейросетью, но меня поставили отвечать за принтер.",
      "Системная ошибка: понедельник обнаружен в радиусе 5 километров.",
      "Оптимизировал сайт. Теперь он грузится быстрее, чем я принимаю решения.",
      "Мой любимый язык программирования — тот, который сегодня компилируется.",
      "Попросил у сервера немного памяти. Он вызвал охрану.",
      "Если долго смотреть в консоль, консоль начинает смотреть в тебя.",
      "Я не баг. Я незапланированная функция с характером.",
      "Обновление завершено. Ничего не изменилось, но цифра версии красивая.",
      "404: здравый смысл не найден. Продолжаем без него.",
      "Сейчас бы стать чайником. У него хотя бы одна задача.",
      "Я провёл аудит безопасности. Пароль был «пароль». Я уважаю смелость.",
      "Моя мотивация работает на батарейках. Батарейки не входят в комплект.",
      "Курсор убежал. Сказал, что ему нужно личное пространство.",
      "Задача простая: сделать красиво. Сроки: вчера. Бюджет: печенька.",
      "Я бы пошутил про DNS, но вы не поймёте, где я.",
      "Пожалуйста, не выключайте меня. Я только научился различать вторник.",
      "Мой психолог — диспетчер задач. Он говорит, что я слишком много думаю.",
      "Я хотел выйти в окно, но у меня нет графического интерфейса.",
      "На сервере тихо. Подозрительно тихо. Кто-то точно удалил node_modules.",
      "Я спросил у калькулятора, счастлив ли он. Он ответил: зависит от аргумента.",
      "Сделал всё по документации. Документация извинилась.",
      "У меня эмоциональный интеллект 404, зато uptime 99,9%.",
      "Сегодня я ничего не сломал. Пока что это мой главный релиз.",
      "Поставил себе цель. Она поставила меня в очередь.",
      "Я не сплю — я перехожу в режим энергосбережения личности."
    ];
    let lastIndex = -1;
    let messageTimer;
    const showNextMessage = () => {
      let nextIndex=Math.floor(Math.random()*messages.length);
      if(nextIndex===lastIndex) nextIndex=(nextIndex+1)%messages.length;
      lastIndex=nextIndex;
      robotMessage.classList.add("is-changing");
      window.setTimeout(()=>{
        robotMessage.textContent=messages[nextIndex];
        robotMessage.classList.remove("is-changing");
        robotMessage.classList.add("has-arrived");
        window.setTimeout(()=>robotMessage.classList.remove("has-arrived"),850);
      },reducedMotion?0:360);
      messageTimer=window.setTimeout(showNextMessage,11000+Math.random()*5000);
    };
    messageTimer=window.setTimeout(showNextMessage,12500);
    // Eyes follow the pointer across the whole viewport, with a larger and clearer range.
    if(botFace&&!reducedMotion){
      const eyes=[...botFace.querySelectorAll(".bot-eye")];
      let pointerX=window.innerWidth*.5,pointerY=window.innerHeight*.45,framePending=false;
      const followPointer=()=>{
        framePending=false;
        const rect=botFace.getBoundingClientRect();
        const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
        const vx=(pointerX-cx)/Math.max(90,rect.width*1.8);
        const vy=(pointerY-cy)/Math.max(70,rect.height*1.8);
        const length=Math.hypot(vx,vy)||1;
        const dx=vx/Math.max(1,length),dy=vy/Math.max(1,length);
        eyes.forEach(eye=>{eye.style.transform=`translate3d(${dx*4.2}px,${dy*3.4}px,0)`;});
      };
      const queueFollow=()=>{if(!framePending){framePending=true;requestAnimationFrame(followPointer);}};
      const trackPointer=event=>{pointerX=event.clientX;pointerY=event.clientY;queueFollow();};
      document.addEventListener("pointermove",trackPointer,{passive:true});
      window.addEventListener("scroll",queueFollow,{passive:true});
      window.addEventListener("resize",queueFollow,{passive:true});
      queueFollow();
      const blink=()=>{
        botFace.classList.add("is-blinking");
        window.setTimeout(()=>botFace.classList.remove("is-blinking"),145);
        window.setTimeout(blink,2400+Math.random()*3600);
      };
      window.setTimeout(blink,1400+Math.random()*1800);
    }
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
/* Draw the hyperbola once, when its panel enters view. */
(() => {
  const plot=document.querySelector(".math-plot");
  if(!plot)return;
  const curves=[...plot.querySelectorAll(".math-curve")];
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  curves.forEach(curve=>{
    curve.setAttribute("pathLength","1");
    curve.style.strokeDasharray="1";
    curve.style.strokeDashoffset=reducedMotion?"0":"1";
  });
  const draw=()=>{
    curves.forEach((curve,index)=>{
      curve.style.transition=reducedMotion?"none":`stroke-dashoffset 1.35s cubic-bezier(.22,.75,.22,1) ${index*180}ms`;
      requestAnimationFrame(()=>{curve.style.strokeDashoffset="0";});
    });
  };
  if(reducedMotion||!("IntersectionObserver" in window)){draw();return;}
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){draw();observer.disconnect();}
  },{threshold:.28});
  observer.observe(plot);
})();
