(() => {
  "use strict";
  const translations = {
    ru: {
      online:"online",write:"Написать ↗",badge:"LVL 99 · ОБЪЕКТИВНО ТОП",taglineOld:"Изучаю.",heroLine1:"Создаю",heroLine2:"digital vibe.",
      heroCopy:"Я Герман — начинающий разработчик и создатель цифровых проектов. Изучаю веб-технологии, собираю интерфейсы и превращаю идеи в работающие продукты — от первой строчки кода до публикации.",
      seeProjects:"Мои проекты ↓",searchPlaceholder:"Искать в сети через DuckDuckGo…",screenCaption:"BUILD / TEST / REPEAT",
      aboutKicker:"01 / ОБО МНЕ",aboutTitle:"Думаю. Собираю. Улучшаю.",aboutCopy1:"Я самостоятельно изучаю разработку и проверяю знания на собственных проектах. Мне интересны не только код и визуал, но и весь путь продукта: идея, удобство, тестирование, исправление ошибок и публикация.",
      aboutCopy2:"Сейчас мой основной фокус — веб-разработка, интерфейсы, небольшие полезные приложения и цифровые инструменты. Использую ИИ как помощника для исследования и работы, стараясь понимать решения и доводить результат до рабочего состояния.",
      aiTag:"+ ИИ в связке",projectsKicker:"02 / ПРОЕКТЫ",projectsTitle:"Идеи, которые уже работают.",projectsCopy:"Создаю, публикую и постепенно улучшаю собственные цифровые продукты.",
      projectOneLabel:"PROJECT 01 / RELEASED",projectOneCopy:"Калькулятор школьных оценок с поддержкой нескольких систем оценивания и маскотом Gera. Проект развивается с упором на простой интерфейс и работу без сохранения списка оценок после перезагрузки.",
      openProject:"Открыть проект ↗",projectTwoLabel:"PROJECT 02 / IN PROGRESS",projectTwoCopy:"Конвертер валют и других показателей с акцентом на выразительный интерфейс, данные из нескольких источников и графики динамики.",
      sourceCode:"Исходный код ↗",projectThreeLabel:"PROJECT 03 / PERSONAL",projectThreeCopy:"Личный сайт-портфолио: пространство для моих проектов, экспериментов с дизайном и развития цифрового бренда GPD.",
      experienceKicker:"03 / МОЙ ПУТЬ",experienceTitle:"Опыт через практику.",experienceCopy:"Я в начале пути, поэтому показываю реальные проекты и навыки, которые развиваю, а не выдумываю должности или стаж.",
      timelineOneTitle:"Разработка и публикация проектов",timelineOneCopy:"Развиваю School Calc, работаю над Cash Converter и улучшаю личный сайт. Практикую Git, GitHub Pages, структуру кода, адаптивную вёрстку и проверку ошибок.",
      timelineTwoTitle:"От идеи до релиза",timelineTwoCopy:"Опубликовал School Calc V2 и подготовил промоматериалы. Учусь не только писать код, но и оформлять проекты, документировать функции и показывать результат пользователям.",
      timelineThreeTitle:"Самостоятельное обучение",timelineThreeCopy:"Изучаю HTML, CSS и JavaScript, экспериментирую с Vue, Python и Linux. Постепенно углубляюсь в UI/UX, доступность и поддержку кода.",
      toolkitKicker:"04 / ИНСТРУМЕНТЫ",toolkitTitle:"Чем пользуюсь.",toolDesignTitle:"Дизайн и визуал",toolDesignCopy:"Работаю над структурой интерфейсов, визуальными акцентами и оформлением проектов.",
      toolDevTitle:"Разработка",toolDevCopy:"HTML, CSS, JavaScript, GitHub и IDE для написания, проверки и публикации кода.",toolVideoTitle:"Видео и контент",toolVideoCopy:"Создаю промоматериалы и монтирую видео для презентации проектов.",
      contactKicker:"05 / СВЯЗЬ",contactTitle:"Основные ссылки. Без лабиринта.",contactCopy:"Самое важное — в первом ряду. Остальные площадки не потерялись: они аккуратно собраны ниже.",
      contactTelegram:"Написать лично",moreLinks:"Ещё мои площадки (7)",discordServer:"Сервер сообщества",steamProfile:"Профиль игрока",footerMade:"MADE WITH VIBE_ · GPD PIXEL SYSTEM",licenseLink:"Лицензия",backTop:"Наверх ↑"
    },
    en: {
      online:"online",write:"Contact ↗",badge:"LVL 99 · OBJECTIVELY TOP",taglineOld:"Learning.",heroLine1:"Building",heroLine2:"digital vibes.",
      heroCopy:"I'm German — a self-taught beginner developer building digital projects. I explore web technologies, craft interfaces, and turn ideas into working products, from the first line of code to publishing.",
      seeProjects:"Explore projects ↓",searchPlaceholder:"Search the web with DuckDuckGo…",screenCaption:"BUILD / TEST / REPEAT",
      aboutKicker:"01 / ABOUT ME",aboutTitle:"Think. Build. Improve.",aboutCopy1:"I'm learning development independently and testing what I learn through real projects. I'm interested in more than code and visuals: the full product journey — the idea, usability, testing, fixing issues, and publishing.",
      aboutCopy2:"My current focus is web development, interfaces, useful small apps, and digital tools. I use AI as a research and workflow assistant while aiming to understand the decisions and ship something that works.",
      aiTag:"+ AI in the workflow",projectsKicker:"02 / PROJECTS",projectsTitle:"Ideas turned into real projects.",projectsCopy:"I build, publish, and continuously improve my own digital products.",
      projectOneLabel:"PROJECT 01 / RELEASED",projectOneCopy:"A school-grade calculator with multiple grading scales and the Gera mascot. It focuses on a simple interface and does not retain the grade list after a reload.",
      openProject:"Open project ↗",projectTwoLabel:"PROJECT 02 / IN PROGRESS",projectTwoCopy:"A currency and indicator converter focused on a distinctive interface, data from multiple sources, and rate-history charts.",
      sourceCode:"Source code ↗",projectThreeLabel:"PROJECT 03 / PERSONAL",projectThreeCopy:"My personal portfolio — a home for my projects, design experiments, and the evolving GPD digital identity.",
      experienceKicker:"03 / MY JOURNEY",experienceTitle:"Experience through practice.",experienceCopy:"I'm at the beginning of my journey, so I showcase real projects and skills I'm developing instead of inventing job titles or years of experience.",
      timelineOneTitle:"Building and publishing projects",timelineOneCopy:"I develop School Calc, work on Cash Converter, and improve this website. I practise Git, GitHub Pages, code structure, responsive layouts, and debugging.",
      timelineTwoTitle:"From idea to release",timelineTwoCopy:"I released School Calc V2 and created promotional materials. I'm learning not only to write code, but also to present projects, document features, and share results with users.",
      timelineThreeTitle:"Independent learning",timelineThreeCopy:"I study HTML, CSS, and JavaScript, experiment with Vue, Python, and Linux, and keep learning about UI/UX, accessibility, and maintainable code.",
      toolkitKicker:"04 / TOOLKIT",toolkitTitle:"Tools and workflows.",toolDesignTitle:"Design and visuals",toolDesignCopy:"I work on interface structure, visual details, and the presentation of projects.",
      toolDevTitle:"Development",toolDevCopy:"HTML, CSS, JavaScript, GitHub, and IDEs for writing, testing, and publishing code.",toolVideoTitle:"Video and content",toolVideoCopy:"I create promotional assets and edit videos to present my projects.",
      contactKicker:"05 / CONTACT",contactTitle:"The important links, up front.",contactCopy:"The main links are easy to find. The rest are still here, neatly organised below.",
      contactTelegram:"Message me directly",moreLinks:"More places to find me (7)",discordServer:"Community server",steamProfile:"Gaming profile",footerMade:"MADE WITH VIBE_ · GPD PIXEL SYSTEM",licenseLink:"License",backTop:"Back to top ↑"
    },
    es: {
      online:"en línea",write:"Contactar ↗",badge:"LVL 99 · OBJETIVAMENTE TOP",taglineOld:"Aprendiendo.",heroLine1:"Creo",heroLine2:"digital vibes.",
      heroCopy:"Soy German, desarrollador principiante autodidacta y creador de proyectos digitales. Exploro tecnologías web, diseño interfaces y convierto ideas en productos funcionales, desde la primera línea de código hasta su publicación.",
      seeProjects:"Ver proyectos ↓",searchPlaceholder:"Buscar en la web con DuckDuckGo…",screenCaption:"CREAR / PROBAR / REPETIR",
      aboutKicker:"01 / SOBRE MÍ",aboutTitle:"Pensar. Crear. Mejorar.",aboutCopy1:"Aprendo desarrollo por mi cuenta y pongo en práctica lo que aprendo mediante proyectos reales. Me interesan tanto el código y lo visual como todo el proceso: idea, usabilidad, pruebas, corrección de errores y publicación.",
      aboutCopy2:"Ahora me centro en el desarrollo web, las interfaces, pequeñas aplicaciones útiles y herramientas digitales. Uso la IA como apoyo para investigar y trabajar, intentando comprender las decisiones y entregar resultados funcionales.",
      aiTag:"+ IA en el proceso",projectsKicker:"02 / PROYECTOS",projectsTitle:"Ideas convertidas en proyectos.",projectsCopy:"Creo, publico y mejoro poco a poco mis propios productos digitales.",
      projectOneLabel:"PROYECTO 01 / PUBLICADO",projectOneCopy:"Calculadora de notas escolares con varios sistemas de calificación y la mascota Gera. Se centra en una interfaz sencilla y no conserva la lista de notas al recargar la página.",
      openProject:"Abrir proyecto ↗",projectTwoLabel:"PROYECTO 02 / EN DESARROLLO",projectTwoCopy:"Conversor de divisas y otros indicadores, con una interfaz distintiva, datos de varias fuentes y gráficos de evolución.",
      sourceCode:"Código fuente ↗",projectThreeLabel:"PROYECTO 03 / PERSONAL",projectThreeCopy:"Mi portafolio personal: un espacio para mis proyectos, experimentos de diseño y la evolución de la identidad digital GPD.",
      experienceKicker:"03 / MI CAMINO",experienceTitle:"Experiencia a través de la práctica.",experienceCopy:"Estoy al comienzo del camino, así que muestro proyectos reales y habilidades que desarrollo, sin inventar puestos ni años de experiencia.",
      timelineOneTitle:"Desarrollo y publicación de proyectos",timelineOneCopy:"Desarrollo School Calc, trabajo en Cash Converter y mejoro esta web. Practico Git, GitHub Pages, estructura del código, diseño adaptable y depuración.",
      timelineTwoTitle:"De la idea al lanzamiento",timelineTwoCopy:"Publiqué School Calc V2 y preparé materiales promocionales. Aprendo no solo a programar, sino también a presentar proyectos, documentar funciones y compartir resultados.",
      timelineThreeTitle:"Aprendizaje autodidacta",timelineThreeCopy:"Estudio HTML, CSS y JavaScript; experimento con Vue, Python y Linux; y sigo aprendiendo sobre UI/UX, accesibilidad y mantenimiento del código.",
      toolkitKicker:"04 / HERRAMIENTAS",toolkitTitle:"Herramientas y métodos.",toolDesignTitle:"Diseño y visuales",toolDesignCopy:"Trabajo en la estructura de las interfaces, los detalles visuales y la presentación de los proyectos.",
      toolDevTitle:"Desarrollo",toolDevCopy:"HTML, CSS, JavaScript, GitHub e IDE para escribir, probar y publicar código.",toolVideoTitle:"Vídeo y contenido",toolVideoCopy:"Creo materiales promocionales y edito vídeos para presentar mis proyectos.",
      contactKicker:"05 / CONTACTO",contactTitle:"Los enlaces principales, a mano.",contactCopy:"Los enlaces más importantes están arriba. Los demás siguen disponibles, organizados aquí debajo.",
      contactTelegram:"Escríbeme directamente",moreLinks:"Más redes y perfiles (7)",discordServer:"Servidor de la comunidad",steamProfile:"Perfil de juegos",footerMade:"HECHO CON VIBE_ · SISTEMA DE PÍXELES GPD",licenseLink:"Licencia",backTop:"Volver arriba ↑"
    }
  };
  const applyLanguage = (lang) => {
    const chosen = translations[lang] ? lang : "ru";
    document.documentElement.lang = chosen;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = translations[chosen][el.dataset.i18n];
      if (typeof value === "string") {
        if (el.dataset.i18n === "footerMade") el.textContent = value;
        else el.textContent = value;
      }
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const value = translations[chosen][el.dataset.i18nPlaceholder];
      if (value) el.placeholder = value;
    });
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === chosen));
    });
    const titles = {ru:"German / GPD — разработчик и цифровые проекты",en:"German / GPD — developer and digital projects",es:"German / GPD — desarrollador y proyectos digitales"};
    const descriptions = {
      ru:"German / GPD — личный сайт Германа Петраченко: веб-разработка, интерфейсы, программирование и собственные цифровые проекты.",
      en:"German / GPD — the personal website of German Petrachenko: web development, interfaces, programming, and independent digital projects.",
      es:"German / GPD — sitio personal de German Petrachenko: desarrollo web, interfaces, programación y proyectos digitales propios."
    };
    document.title = titles[chosen];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = descriptions[chosen];
    try { localStorage.setItem("gpd-language", chosen); } catch (_) {}
  };
  document.querySelectorAll("[data-lang]").forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.lang)));
  let initial = "ru";
  try {
    const saved = localStorage.getItem("gpd-language");
    const browser = (navigator.language || "ru").slice(0,2).toLowerCase();
    initial = saved || (translations[browser] ? browser : "en");
  } catch (_) {
    const browser = (navigator.language || "ru").slice(0,2).toLowerCase();
    initial = translations[browser] ? browser : "en";
  }
  applyLanguage(initial);
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();