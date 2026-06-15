import * as THREE from "three";
import { OrbitControls } from "./assets/vendor/OrbitControls.js";

const metrics = [
  ["100 Вт", "номинальная выходная мощность на нагрузке 4 Ом"],
  ["Vcc/GND/Vee", "внешний трёхпроводный ввод двухполярного питания"],
  ["0.0053 %", "фактические гармонические искажения на номинальной мощности"],
  ["90 дБ+", "требуемое отношение сигнал/шум"],
  ["140 x 80 мм", "габарит печатной платы по расчётам безопасности"],
  ["0.16 кг", "расчётная масса печатного узла с компонентами"],
];

const specs = [
  ["Наименование изделия", "Усилитель мощности 100W"],
  ["Назначение", "усиление низкочастотного аудиосигнала для работы с низкоомной нагрузкой через транзисторный выходной каскад"],
  ["Номинальная мощность", "100 Вт на нагрузке 4 Ом"],
  ["Входной сигнал", "номинальная амплитуда около 1.2 В; при 2.23 В в моделировании получена пиковая мощность до 360 Вт"],
  ["Диапазон частот по ТЗ", "20-25000 Гц"],
  ["Результат моделирования", "фактический диапазон 3.76-1457 Гц; пиковое усиление 26.14 дБ"],
  ["Искажения", "не более 0.01 %, фактически 0.0053 %"],
  ["Питание", "внешний двухполярный источник постоянного напряжения через разъём Vcc/GND/Vee; стабилизаторы 7815 и 7915 формируют внутренние ±15 В для малосигнальной части"],
  ["Плата", "FR-4, толщина 1.6 мм, прямоугольная форма 140 x 80 мм"],
  ["Корпус", "ABS-пластик, крышка с вентиляционными отверстиями, крепления платы и боковое окно для разъёма"],
  ["Эксплуатация", "сухое помещение, температура окружающей среды +5...+40 °C"],
  ["Ориентировочная степень защиты", "IP40 при закрытой крышке; эксплуатация во влажной среде не допускается"],
];

const bomGroups = [
  {
    title: "Резисторы",
    focus: "resistors",
    items: ["R1: 12 кОм", "R2, R6-R9, R11, R13-R15: 10 кОм", "R3-R5, R10: 100 кОм", "R12: 47 Ом"],
  },
  {
    title: "Конденсаторы",
    focus: "capacitors",
    items: ["C1, C3, C8: 10 мкФ, 25 В", "C2: 1 мкФ, 25 В", "C4: 2.2 мкФ, 50 В", "C5: 4.7 мкФ, 50 В", "C6, C7, C10: 0.1 мкФ, 50 В", "C9: 470 мкФ, 50 В"],
  },
  {
    title: "Полупроводники",
    focus: "transistors",
    items: ["D1-D8: 1N4148", "Q1: КТ3102", "Q2-Q4: BD139", "выходной каскад: 2SC4793, 2SA1837, 2SA1943, 2SC5200"],
  },
  {
    title: "Микросхемы и узлы",
    focus: "ics",
    items: ["IC1-IC2: TL072 / MC4558 по материалам этапов", "DA1: 7815", "DA2: 7915", "разъём питания, аудиоразъёмы, выключатель"],
  },
];

const operations = [
  ["005", "Подготовительная", "Проверить комплектность КД: ТЗ, схема Э3, элементная база, топология, 3D-модель корпуса.", "board"],
  ["010", "Комплектовочная", "Скомплектовать ОУ, стабилизаторы, транзисторы, резисторы R1-R19, конденсаторы C1-C15, плату, корпус ABS, разъёмы и выключатель.", "ics"],
  ["015", "Контрольная", "Проверить плату: отсутствие сколов, расслоений, замыканий, обрывов дорожек и повреждений металлизации.", "board"],
  ["020", "Контроль комплектующих", "Проверить номиналы резисторов, исправность ОУ, стабилизаторов, транзисторов и полярность электролитических конденсаторов.", "capacitors"],
  ["025", "Подготовительная", "Выполнить формовку выводов резисторов, конденсаторов и транзисторов по шагу посадочных мест.", "resistors"],
  ["030", "Электромонтажная", "Установить резисторы R1-R19 согласно схеме и монтажному чертежу.", "resistors"],
  ["035", "Электромонтажная", "Установить конденсаторы C1-C15, соблюдая полярность электролитических конденсаторов.", "capacitors"],
  ["040", "Электромонтажная", "Установить операционные усилители и стабилизаторы напряжения 7815/7915, соблюдая ключи корпусов.", "ics"],
  ["045", "Паяльная", "Выполнить пайку компонентов при 240-260 °C, время прогрева вывода не более 3 секунд.", "board"],
  ["050", "Очистительная", "Очистить плату от остатков флюса, выполнить визуальный контроль качества пайки.", "board"],
  ["055", "Сборочная", "Установить плату в корпус на стойки, закрепить разъёмы и исключить передачу усилия кабеля на пайку.", "connectors"],
  ["060", "Контрольно-измерительная", "Подать внешнее двухполярное питание на Vcc/GND/Vee, проконтролировать отсутствие КЗ, перегрева и клиппинга в рабочем режиме.", "transistors"],
];

const partDescriptions = {
  all: ["Вся сборка", "Печатная плата усилителя мощности в демонстрационном ABS-корпусе."],
  board: ["Печатная плата", "Основание FR-4 с топологией усилителя, компонентами и разъёмами."],
  resistors: ["Резисторы", "Цепи задания режимов, обратной связи и ограничительных сопротивлений."],
  capacitors: ["Конденсаторы", "Фильтрация, развязка, частотная коррекция и электролитические накопители питания."],
  transistors: ["Транзисторный каскад", "Дискретный выходной каскад и элементы усиления мощности."],
  ics: ["Операционные усилители и стабилизаторы", "MC4558/TL072 и стабилизаторы 7815/7915 формируют малосигнальную часть и питание."],
  connectors: ["Разъёмы", "Ввод внешнего питания, аудиовходы/выходы и органы коммутации."],
  case: ["Корпус", "ABS-оболочка с вентиляцией, крепёжными стойками и боковым окном разъёма."],
};

const sections = [
  {
    id: "passport",
    title: "Паспорт изделия",
    kicker: "01 · общие сведения",
    focus: "all",
    render: () => `
      <p class="lead">ИЭТР подготовлено для проекта по дисциплине "Автоматизация проектных работ". Руководство объединяет ТЗ, результаты моделирования, состав изделия, требования безопасности, технологический маршрут и интерактивную STEP-модель.</p>
      <div class="grid three">
        ${metrics.map(([value, label]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join("")}
      </div>
      <h3>Исполнители</h3>
      <div class="grid three">
        <div class="doc-box"><strong>Засухин Николай Александрович</strong></div>
        <div class="doc-box"><strong>Хлудин Павел Сергеевич</strong></div>
        <div class="doc-box"><strong>Сметанин Леонид Владимирович</strong></div>
      </div>
    `,
  },
  {
    id: "tz",
    title: "Техническое задание",
    kicker: "02 · технические требования",
    focus: "board",
    render: () => `
      <p class="lead">Техническое задание определяет назначение изделия, основные электрические параметры, конструктивное исполнение, условия эксплуатации и требования безопасности.</p>
      ${renderSpecTable(specs)}
      <div class="grid">
        <div class="doc-box"><h3>Функциональное назначение</h3><p>Изделие должно усиливать аудиосигнал низкой частоты и обеспечивать работу с нагрузкой 4 Ом при номинальной выходной мощности 100 Вт.</p></div>
        <div class="doc-box"><h3>Конструктивные требования</h3><p>Плата устанавливается внутри закрытого ABS-корпуса на стойках; крышка должна обеспечивать вентиляцию и защиту пользователя от контакта с проводниками.</p></div>
      </div>
    `,
  },
  {
    id: "principle",
    title: "Принцип работы",
    kicker: "03 · электрическая часть",
    focus: "ics",
    render: () => `
      <p class="lead">Схема построена на операционных усилителях, стабилизаторах симметричного питания и дискретном выходном каскаде. В моделировании подтверждена работа на номинальной мощности при входной амплитуде около 1.2 В.</p>
      <div class="image-grid">
        <figure class="image-frame"><img src="./assets/images/docx_Skhemotekhnicheskoe_modelirovanie_(1)/image1.GIF" alt="Исходная электрическая схема"><figcaption>Исходная схема из этапа схемотехнического моделирования.</figcaption></figure>
        <figure class="image-frame"><img src="./assets/images/docx_Skhemotekhnicheskoe_modelirovanie_(1)/image2.png" alt="Модель схемы LTspice"><figcaption>Смоделированная схема в LTspice.</figcaption></figure>
      </div>
      <div class="grid three">
        <div class="doc-box"><strong>Класс работы</strong><p>В отсутствие нагрузки схема близка к Super A; при подключении нагрузки наблюдается клиппинг, фактически режим соответствует классу AB.</p></div>
        <div class="doc-box"><strong>Усиление</strong><p>Пиковое усиление по результатам моделирования: 26.14 дБ.</p></div>
        <div class="doc-box"><strong>Шум</strong><p>Полный шум 19.633 мкВ; требование SNR выше 90 дБ считается выполненным.</p></div>
      </div>
    `,
  },
  {
    id: "composition",
    title: "Состав изделия",
    kicker: "04 · элементная база",
    focus: "capacitors",
    render: () => `
      <p class="lead">Элементная база перенесена из XLSX-ведомости и материалов стандартизации. В интерактивной модели можно выделять группы компонентов.</p>
      <div class="tag-row">
        ${Object.keys(partDescriptions).filter((key) => key !== "all" && key !== "case").map((key) => `<button class="chip-button" data-focus-chip="${key}" type="button">${partDescriptions[key][0]}</button>`).join("")}
      </div>
      <div class="grid">
        ${bomGroups.map((group) => `
          <div class="doc-box">
            <h3>${group.title}</h3>
            <ul class="plain-list">${group.items.map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>
        `).join("")}
      </div>
    `,
  },
  {
    id: "model",
    title: "3D-модель",
    kicker: "05 · интерактивная сборка",
    focus: "all",
    render: () => `
      <p class="lead">Справа размещена интерактивная 3D-модель усилителя. Модель можно вращать, приближать, выбирать элементы и включать прозрачный корпус.</p>
      <div class="image-grid">
        <figure class="image-frame"><img src="./assets/images/topology.png" alt="Топология платы усилителя"><figcaption>Топологическое моделирование печатной платы.</figcaption></figure>
        <figure class="image-frame"><img src="./assets/images/docx_3d_i_mekhanicheskoe/image1.png" alt="3D-модель корпуса и платы"><figcaption>Общий вид конструкции из этапа 3D и механического моделирования.</figcaption></figure>
      </div>
    `,
  },
  {
    id: "mechanics",
    title: "Механика и тепло",
    kicker: "06 · расчётные этапы",
    focus: "transistors",
    render: () => `
      <p class="lead">Корпус выполнен из ABS-пластика. В отчёте указаны крепления платы и крышки двумя диаметрально противоположными болтами, вентиляционные отверстия и отдельное отверстие для подключения платы.</p>
      <div class="image-grid">
        <figure class="image-frame"><img src="./assets/images/docx_3d_i_mekhanicheskoe/image3.png" alt="Результат механического моделирования"><figcaption>Механическое моделирование и испытание конструкции.</figcaption></figure>
        <figure class="image-frame"><img src="./assets/images/docx_3d_i_mekhanicheskoe/image7.png" alt="Тепловое моделирование усилителя"><figcaption>Тепловое моделирование платы и корпуса.</figcaption></figure>
      </div>
      <div class="grid three">
        <div class="metric"><strong>1.5 м</strong><span>высота падения в расчёте ударной нагрузки</span></div>
        <div class="metric"><strong>290 Гц</strong><span>оценка основной собственной частоты платы</span></div>
        <div class="metric"><strong>200 Гц</strong><span>практический ориентир, выше которого риск резонанса низкий</span></div>
      </div>
    `,
  },
  {
    id: "safety",
    title: "Безопасность",
    kicker: "07 · эксплуатационные требования",
    focus: "connectors",
    render: () => `
      <p class="lead">Внутри корпуса отсутствуют цепи 220 В: питание подаётся от внешнего двухполярного источника постоянного напряжения через разъём Vcc/GND/Vee. Стабилизаторы 7815 и 7915 формируют внутренние ±15 В для операционных усилителей и малосигнальной части. Основные риски связаны с коротким замыканием, переполюсовкой, перегревом силовых элементов и механическим повреждением соединений.</p>
      <div class="grid">
        <div class="doc-box"><h3>Электробезопасность</h3><ul class="plain-list"><li>использовать только внешний двухполярный источник с ограничением тока;</li><li>класс III применим при питании от сертифицированного SELV/PELV-источника;</li><li>не включать изделие при снятой крышке;</li><li>исключить попадание металлических предметов через вентиляцию;</li><li>маркировать Vcc, GND, Vee и полярность подключения.</li></ul></div>
        <div class="doc-box"><h3>Тепловая защита</h3><ul class="plain-list"><li>обеспечить свободный воздухообмен через крышку;</li><li>контролировать нагрев выходных транзисторов;</li><li>не закрывать вентиляционные отверстия;</li><li>при перегреве отключить питание и проверить монтаж.</li></ul></div>
      </div>
    `,
  },
  {
    id: "standard",
    title: "Унификация",
    kicker: "08 · стандартизация",
    focus: "resistors",
    render: () => `
      <p class="lead">По расчёту стандартизации большинство типоразмеров относится к покупной элементной базе. Оригинальными считаются печатная плата, нижняя часть корпуса и верхняя крышка.</p>
      <div class="grid three">
        <div class="metric"><strong>32</strong><span>типоразмера составных частей</span></div>
        <div class="metric"><strong>90.6 %</strong><span>коэффициент применяемости</span></div>
        <div class="metric"><strong>36.0 %</strong><span>коэффициент повторяемости</span></div>
      </div>
      <p>Средняя повторяемость составных частей: 1.56. Доля оригинальных типоразмеров составляет 9.4 %, что соответствует электронному изделию на покупной элементной базе.</p>
    `,
  },
  {
    id: "process",
    title: "Технологический процесс",
    kicker: "09 · маршрутная карта",
    focus: "board",
    render: () => `
      <p class="lead">Маршрутная карта переведена в интерактивный сценарий. Нажатие на операцию выделяет связанный узел в 3D-модели.</p>
      <div class="operation-list">
        ${operations.map(([code, title, text, focus]) => `
          <button type="button" class="operation-card" data-operation-focus="${focus}">
            <b>${code}</b>
            <span><strong>${title}</strong><p>${text}</p></span>
          </button>
        `).join("")}
      </div>
    `,
  },
  {
    id: "economics",
    title: "Экономика",
    kicker: "10 · себестоимость",
    focus: "all",
    render: () => `
      <p class="lead">Расчёт экономических показателей выполнен по материалам проекта с учётом материальных затрат, трудоёмкости этапов, заработной платы, страховых взносов, накладных и прочих расходов.</p>
      <div class="grid three">
        <div class="metric"><strong>5 424 руб.</strong><span>материальные затраты с транспортными расходами</span></div>
        <div class="metric"><strong>611 н/ч</strong><span>суммарная трудоёмкость проекта</span></div>
        <div class="metric"><strong>435 049 руб.</strong><span>полная себестоимость проекта</span></div>
      </div>
    `,
  },
  {
    id: "docs",
    title: "Документация",
    kicker: "11 · файлы проекта",
    focus: "all",
    render: () => `
      <p class="lead">ИЭТР собирает результаты предыдущих этапов в эксплуатационный формат: инженер видит исходные требования, конструкцию, техпроцесс, контроль и ограничения безопасности.</p>
      <div class="grid">
        <div class="doc-box"><h3>Использованные материалы</h3><ul class="plain-list"><li>техническое задание;</li><li>схемотехническое моделирование;</li><li>элементная база;</li><li>топологическое и 3D-моделирование;</li><li>механическое и тепловое моделирование;</li><li>стандартизация, безопасность, экономика;</li><li>технологическая карта.</li></ul></div>
        <div class="doc-box"><h3>Публикация</h3><p>Сайт является статическим GitHub Pages-проектом. В репозитории публикуются только файлы руководства, изображения, STEP-модель и локальные библиотеки для просмотра 3D.</p></div>
      </div>
    `,
  },
];

let viewerApi = null;

function renderSpecTable(rows) {
  return `<table class="spec-table"><tbody>${rows.map(([name, value]) => `<tr><th>${name}</th><td>${value}</td></tr>`).join("")}</tbody></table>`;
}

function initApp() {
  const nav = document.getElementById("sectionNav");
  const content = document.getElementById("content");
  content.innerHTML = sections.map((section) => `
    <section class="section" id="${section.id}" data-focus="${section.focus || "all"}">
      <p class="section-kicker">${section.kicker}</p>
      <h2>${section.title}</h2>
      ${section.render()}
    </section>
  `).join("");

  nav.innerHTML = sections.map((section, index) => `<button type="button" data-nav="${section.id}" class="${index === 0 ? "is-active" : ""}">${section.title}</button>`).join("");
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-nav]");
    if (!button) return;
    document.getElementById(button.dataset.nav)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  content.addEventListener("click", (event) => {
    const focusTarget = event.target.closest("[data-focus-chip], [data-operation-focus]");
    const focus = focusTarget?.dataset.focusChip || focusTarget?.dataset.operationFocus;
    if (focus) viewerApi?.focus(focus, { updateCard: true });
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = visible.target.id;
    nav.querySelectorAll("button").forEach((button) => button.classList.toggle("is-active", button.dataset.nav === id));
    viewerApi?.focus(visible.target.dataset.focus, { updateCard: true, soft: true });
  }, { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.35, 0.6] });

  document.querySelectorAll(".section").forEach((section) => observer.observe(section));
  document.getElementById("printButton").addEventListener("click", () => window.print());
}

class AmpViewer {
  constructor() {
    this.root = document.getElementById("viewer");
    this.status = document.getElementById("viewerStatus");
    this.fallback = document.getElementById("viewerFallback");
    this.controlsRoot = document.getElementById("viewerControls");
    this.selectedPartName = document.getElementById("selectedPartName");
    this.selectedPartDesc = document.getElementById("selectedPartDesc");
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.modelRoot = new THREE.Group();
    this.pickables = [];
    this.materials = [];
    this.caseObjects = [];
    this.currentFocus = "all";
    this.autoRotate = false;
    this.caseVisible = true;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
  }

  async init() {
    this.setupScene();
    this.setupEvents();
    this.animate();
    try {
      await this.loadStepModel();
      this.setStatus("Готово", "ready");
      this.fallback.classList.add("is-hidden");
    } catch (error) {
      console.error(error);
      this.buildFallbackModel();
      this.setStatus("Демо", "ready");
      this.fallback.classList.add("is-hidden");
    }
  }

  setupScene() {
    this.root.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color(0xf1f5f8);
    this.scene.add(this.modelRoot);
    this.camera.position.set(150, -170, 115);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8995, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(90, -120, 160);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xb8d4ff, 0.7);
    fill.position.set(-120, 100, 90);
    this.scene.add(fill);
    const grid = new THREE.GridHelper(220, 22, 0xb7c2ca, 0xd7dee4);
    grid.position.z = -5;
    this.scene.add(grid);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.resize();
  }

  setupEvents() {
    window.addEventListener("resize", () => this.resize());
    this.renderer.domElement.addEventListener("pointerdown", (event) => this.pick(event));
    this.controlsRoot.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.action === "autorotate") {
        this.autoRotate = !this.autoRotate;
        button.classList.toggle("is-active", this.autoRotate);
      }
      if (button.dataset.action === "reset") this.focus("all", { updateCard: true });
      if (button.dataset.toggle === "case") this.toggleCase(button);
      if (button.dataset.focus) this.focus(button.dataset.focus, { updateCard: true });
    });
  }

  async loadStepModel() {
    this.setStatus("STEP", "");
    if (typeof window.occtimportjs !== "function") throw new Error("occt-import-js is not available");
    const occt = await window.occtimportjs({ locateFile: (file) => `./assets/vendor/${file}` });
    const response = await fetch("./assets/models/amp100.STEP");
    if (!response.ok) throw new Error(`STEP request failed: ${response.status}`);
    const fileBuffer = new Uint8Array(await response.arrayBuffer());
    const result = occt.ReadStepFile(fileBuffer, {
      linearUnit: "millimeter",
      linearDeflectionType: "bounding_box_ratio",
      linearDeflection: 0.0007,
      angularDeflection: 0.4,
    });
    if (!result.success || !result.meshes?.length) throw new Error("STEP import returned no meshes");
    this.buildFromOcctResult(result);
  }

  buildFromOcctResult(result) {
    const nodeNames = mapMeshNodeNames(result.root);
    result.meshes.forEach((sourceMesh, index) => {
      const nodeName = nodeNames[index] || sourceMesh.name || "";
      const tags = classifyMesh(`${nodeName} ${sourceMesh.name || ""}`);
      const mesh = this.createMesh(sourceMesh, tags, nodeName);
      this.modelRoot.add(mesh);
      this.pickables.push(mesh);
    });
    this.normalizeModel();
    this.createSyntheticCase();
    this.focus("all", { updateCard: true });
    this.status.title = `STEP: ${result.meshes.length} сеток`;
  }

  createMesh(sourceMesh, tags, nodeName) {
    const geometry = new THREE.BufferGeometry();
    const position = toFlatFloatArray(sourceMesh.attributes?.position?.array || []);
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    const normals = sourceMesh.attributes?.normal?.array;
    if (normals?.length) geometry.setAttribute("normal", new THREE.BufferAttribute(toFlatFloatArray(normals), 3));
    else geometry.computeVertexNormals();
    if (sourceMesh.index?.array?.length) geometry.setIndex(toFlatNumberArray(sourceMesh.index.array));
    geometry.computeBoundingSphere();
    const sourceColor = sourceMesh.color || sourceMesh.face_colors?.[0];
    const material = new THREE.MeshStandardMaterial({
      color: colorForMesh(sourceColor, tags),
      roughness: roughnessFor(tags),
      metalness: tags.includes("copper") ? 0.18 : 0.04,
      side: THREE.DoubleSide,
    });
    if (tags.includes("leds")) {
      material.emissive = new THREE.Color(0xffe47a);
      material.emissiveIntensity = 0.18;
    }
    rememberMaterialBase(material);
    this.materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.tags = tags;
    mesh.userData.name = cleanPartName(nodeName || sourceMesh.name || "Компонент");
    mesh.userData.description = describeTags(tags);
    return mesh;
  }

  normalizeModel() {
    const box = new THREE.Box3().setFromObject(this.modelRoot);
    const center = box.getCenter(new THREE.Vector3());
    this.modelRoot.children.forEach((child) => child.position.sub(center));
    const normalizedBox = new THREE.Box3().setFromObject(this.modelRoot);
    const size = normalizedBox.getSize(new THREE.Vector3());
    this.modelRoot.userData.size = size;
  }

  createSyntheticCase() {
    const size = this.modelRoot.userData.size || new THREE.Vector3(140, 80, 25);
    const width = Math.max(size.x + 22, 155);
    const depth = Math.max(size.y + 20, 95);
    const height = Math.max(size.z + 28, 34);
    const wallThickness = 3;
    const caseGroup = new THREE.Group();
    caseGroup.userData.tags = ["case"];
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0xa7a9aa,
      transparent: true,
      opacity: 0.58,
      roughness: 0.5,
      metalness: 0.02,
      side: THREE.DoubleSide,
      depthWrite: true,
    });
    rememberMaterialBase(wallMat);
    const coverMat = wallMat.clone();
    coverMat.color.setHex(0xf4f5f4);
    coverMat.opacity = 0.9;
    rememberMaterialBase(coverMat);
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x17191d, roughness: 0.75 });
    rememberMaterialBase(darkMat);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xb8c0c8, roughness: 0.38, metalness: 0.35 });
    rememberMaterialBase(metalMat);

    const bottom = new THREE.Mesh(new THREE.BoxGeometry(width, depth, wallThickness), wallMat);
    bottom.position.z = -9;
    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallThickness, height), wallMat);
    rearWall.position.set(0, depth / 2, height / 2 - 9);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, depth, height), wallMat);
    leftWall.position.set(-width / 2, 0, height / 2 - 9);
    const rightWall = leftWall.clone();
    rightWall.position.x = width / 2;

    const frontShape = roundedRectShape(width, height, 4);
    frontShape.holes.push(roundedRectPath(28, 10, 3, width * 0.25, height * 0.45));
    const frontWall = new THREE.Mesh(new THREE.ExtrudeGeometry(frontShape, { depth: wallThickness, bevelEnabled: false }), wallMat);
    frontWall.rotation.x = Math.PI / 2;
    frontWall.position.set(0, -depth / 2, -9);

    const coverShape = roundedRectShape(width, depth, 5);
    const ventSpacing = 8.2;
    for (let row = -1; row <= 1; row += 1) {
      for (let col = -1.5; col <= 1.5; col += 1) {
        coverShape.holes.push(circlePath(col * ventSpacing, row * ventSpacing, 2.6));
      }
    }
    coverShape.holes.push(circlePath(-0.5 * ventSpacing, -2 * ventSpacing, 2.6));
    coverShape.holes.push(circlePath(0.5 * ventSpacing, -2 * ventSpacing, 2.6));
    const cover = new THREE.Mesh(new THREE.ExtrudeGeometry(coverShape, { depth: 2.5, bevelEnabled: false }), coverMat);
    cover.position.z = height - 9;

    const connectorPanel = new THREE.Mesh(new THREE.BoxGeometry(25, 1.1, 7.2), darkMat);
    connectorPanel.position.set(width * 0.25, -depth / 2 - 0.8, height * 0.45 - 5.4);
    for (let i = -1; i <= 1; i += 1) {
      const jack = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 1.5, 24), metalMat);
      jack.rotation.x = Math.PI / 2;
      jack.position.set(width * 0.25 + i * 6, -depth / 2 - 1.7, height * 0.45 - 5.4);
      caseGroup.add(jack);
      this.caseObjects.push(jack);
      this.pickables.push(jack);
    }

    const screwPositions = [
      [-width / 2 + 16, depth / 2 - 15],
      [width / 2 - 16, -depth / 2 + 15],
    ];
    screwPositions.forEach(([x, y]) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 2.6, 6), metalMat);
      screw.position.set(x, y, height - 5.2);
      screw.rotation.z = Math.PI / 6;
      caseGroup.add(screw);
      this.caseObjects.push(screw);
      this.pickables.push(screw);
    });

    const ventShadow = new THREE.Group();
    for (let row = -1; row <= 1; row += 1) {
      for (let col = -1.5; col <= 1.5; col += 1) {
        ventShadow.add(createVentDarkDisc(col * ventSpacing, row * ventSpacing, height - 9.25, darkMat));
      }
    }
    ventShadow.add(createVentDarkDisc(-0.5 * ventSpacing, -2 * ventSpacing, height - 9.25, darkMat));
    ventShadow.add(createVentDarkDisc(0.5 * ventSpacing, -2 * ventSpacing, height - 9.25, darkMat));
    caseGroup.add(ventShadow);

    [bottom, rearWall, leftWall, rightWall, frontWall, cover, connectorPanel, ...ventShadow.children].forEach((object) => {
      object.userData.tags = ["case"];
      object.userData.name = "Корпус ABS";
      object.userData.description = partDescriptions.case[1];
      this.caseObjects.push(object);
      this.pickables.push(object);
    });
    caseGroup.add(bottom, rearWall, leftWall, rightWall, frontWall, cover, connectorPanel);
    caseGroup.traverse((object) => {
      if (!object.isMesh) return;
      object.userData.tags = object.userData.tags || ["case"];
      object.userData.name = object.userData.name || "Корпус ABS";
      object.userData.description = object.userData.description || partDescriptions.case[1];
      if (!this.caseObjects.includes(object)) this.caseObjects.push(object);
      if (!this.pickables.includes(object)) this.pickables.push(object);
    });
    this.modelRoot.add(caseGroup);
  }

  buildFallbackModel() {
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x176995, roughness: 0.6 });
    rememberMaterialBase(boardMat);
    const board = new THREE.Mesh(new THREE.BoxGeometry(140, 80, 1.6), boardMat);
    board.userData.tags = ["board"];
    board.userData.name = "Печатная плата";
    board.userData.description = partDescriptions.board[1];
    this.modelRoot.add(board);
    this.pickables.push(board);
    this.materials.push(boardMat);
    for (let i = 0; i < 18; i += 1) {
      const tags = i % 5 === 0 ? ["transistors"] : i % 4 === 0 ? ["capacitors"] : i % 3 === 0 ? ["ics"] : ["resistors"];
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(8 + (i % 4) * 3, 5, 5 + (i % 3) * 4), new THREE.MeshStandardMaterial({ color: colorForMesh(null, tags), roughness: 0.58 }));
      mesh.position.set(-58 + (i % 6) * 23, -28 + Math.floor(i / 6) * 28, 4);
      mesh.userData.tags = tags;
      mesh.userData.name = partDescriptions[tags[0]][0];
      mesh.userData.description = partDescriptions[tags[0]][1];
      rememberMaterialBase(mesh.material);
      this.pickables.push(mesh);
      this.materials.push(mesh.material);
      this.modelRoot.add(mesh);
    }
    this.modelRoot.userData.size = new THREE.Vector3(140, 80, 22);
    this.createSyntheticCase();
    this.focus("all", { updateCard: true });
  }

  resize() {
    const rect = this.root.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height, 300);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  pick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.visiblePickables(), false)[0];
    if (!hit) return;
    const focus = primaryTag(hit.object.userData.tags);
    this.currentFocus = focus;
    this.applyHighlight(focus);
    this.updatePartCard(focus, hit.object);
    this.fitCamera([hit.object]);
    this.updateToolButtons(focus);
  }

  focus(focus = "all", options = {}) {
    if (options.soft && this.currentFocus === focus) return;
    this.currentFocus = focus || "all";
    this.applyHighlight(this.currentFocus);
    this.updateToolButtons(this.currentFocus);
    if (options.updateCard) this.updatePartCard(this.currentFocus);
    const objects = this.objectsForFocus(this.currentFocus);
    this.fitCamera(objects.length ? objects : this.visiblePickables());
  }

  objectsForFocus(focus) {
    if (!focus || focus === "all") return this.visiblePickables();
    return this.visiblePickables().filter((object) => object.userData.tags?.includes(focus));
  }

  applyHighlight(focus) {
    this.pickables.forEach((object) => {
      const material = object.material;
      if (!material) return;
      const matches = !focus || focus === "all" || object.userData.tags?.includes(focus);
      material.opacity = matches ? material.userData.baseOpacity : 0.16;
      material.transparent = !matches || material.userData.baseTransparent;
      material.depthWrite = matches ? material.userData.baseDepthWrite : false;
      if (material.emissive) {
        material.emissive.copy(material.userData.baseEmissive || new THREE.Color(0x000000));
        material.emissiveIntensity = material.userData.baseEmissiveIntensity || 0;
        if (matches && focus !== "all") {
          material.emissive.setHex(object.userData.tags?.includes("leds") ? 0xffdf6a : 0x2f7edb);
          material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.25);
        }
      }
    });
  }

  visiblePickables() {
    return this.pickables.filter((object) => {
      let current = object;
      while (current) {
        if (!current.visible) return false;
        current = current.parent;
      }
      return true;
    });
  }

  toggleCase(button) {
    this.caseVisible = !this.caseVisible;
    this.caseObjects.forEach((object) => {
      object.visible = this.caseVisible;
    });
    button.classList.toggle("is-active", this.caseVisible);
    button.classList.toggle("is-off", !this.caseVisible);
    button.textContent = `Корпус: ${this.caseVisible ? "вкл" : "выкл"}`;
    button.setAttribute("aria-pressed", String(this.caseVisible));
  }

  fitCamera(objects) {
    const box = new THREE.Box3();
    objects.forEach((object) => box.expandByObject(object));
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 10);
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const distance = Math.min(Math.max((maxDim / (2 * Math.tan(fov / 2))) * 1.55, 45), 480);
    const direction = new THREE.Vector3(0.9, -1.05, 0.72).normalize();
    this.camera.position.copy(center).add(direction.multiplyScalar(distance));
    this.controls.target.copy(center);
    this.controls.update();
  }

  updateToolButtons(focus) {
    this.controlsRoot.querySelectorAll("[data-focus]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.focus === focus);
    });
  }

  updatePartCard(focus, pickedObject) {
    if (pickedObject) {
      this.selectedPartName.textContent = pickedObject.userData.name || "Компонент";
      this.selectedPartDesc.textContent = pickedObject.userData.description || "Элемент печатного узла.";
      return;
    }
    const [name, desc] = partDescriptions[focus || "all"] || partDescriptions.all;
    this.selectedPartName.textContent = name;
    this.selectedPartDesc.textContent = desc;
  }

  setStatus(text, mode) {
    this.status.textContent = text;
    this.status.classList.toggle("is-ready", mode === "ready");
    this.status.classList.toggle("is-error", mode === "error");
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.1;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

function mapMeshNodeNames(root) {
  const names = {};
  function walk(node) {
    if (!node) return;
    (node.meshes || []).forEach((meshIndex) => {
      names[meshIndex] = node.name || "";
    });
    (node.children || []).forEach(walk);
  }
  walk(root);
  return names;
}

function roundedRectShape(width, height, radius, offsetX = 0, offsetY = 0) {
  const shape = new THREE.Shape();
  const x = offsetX - width / 2;
  const y = offsetY - height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function roundedRectPath(width, height, radius, offsetX = 0, offsetY = 0) {
  const path = new THREE.Path();
  const x = offsetX - width / 2;
  const y = offsetY - height / 2;
  path.moveTo(x + radius, y);
  path.lineTo(x + width - radius, y);
  path.quadraticCurveTo(x + width, y, x + width, y + radius);
  path.lineTo(x + width, y + height - radius);
  path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  path.lineTo(x + radius, y + height);
  path.quadraticCurveTo(x, y + height, x, y + height - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

function circlePath(x, y, radius) {
  const path = new THREE.Path();
  path.absellipse(x, y, radius, radius, 0, Math.PI * 2, true);
  return path;
}

function createVentDarkDisc(x, y, z, material) {
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 0.35, 28), material);
  disc.position.set(x, y, z);
  return disc;
}

function classifyMesh(name) {
  const source = name.toUpperCase();
  const tags = [];
  if (source.includes("LAYER") || source.includes("BOARD") || source.includes("PCB")) tags.push("board");
  if (/^R\d+/.test(source) || source.includes("RES")) tags.push("resistors");
  if (/^C\d+/.test(source) || source.includes("CAP")) tags.push("capacitors");
  if (/^Q\d+/.test(source) || /^VT\d+/.test(source) || source.includes("BD139") || source.includes("2SC") || source.includes("2SA") || source.includes("KT3102")) tags.push("transistors");
  if (/^IC\d+/.test(source) || /^OP\d+/.test(source) || /^DA\d+/.test(source) || source.includes("TL072") || source.includes("MC4558") || source.includes("7815") || source.includes("7915")) tags.push("ics");
  if (/^J\d+/.test(source) || /^XS\d+/.test(source) || /^XP\d+/.test(source) || source.includes("CONN") || source.includes("SW")) tags.push("connectors");
  if (source.includes("COPPER")) tags.push("copper");
  if (!tags.length) tags.push("component");
  return tags;
}

function colorForMesh(sourceColor, tags) {
  const forced = forcedColorFor(tags);
  if (forced !== null) return new THREE.Color(forced);
  if (sourceColor?.length >= 3) {
    return new THREE.Color(Math.min(1, sourceColor[0] * 1.15 + 0.04), Math.min(1, sourceColor[1] * 1.15 + 0.04), Math.min(1, sourceColor[2] * 1.15 + 0.04));
  }
  return new THREE.Color(0xb0b7be);
}

function forcedColorFor(tags) {
  if (tags.includes("board")) return 0x176995;
  if (tags.includes("copper")) return 0xc5893c;
  if (tags.includes("resistors")) return 0xc6a26f;
  if (tags.includes("capacitors")) return 0x2879bd;
  if (tags.includes("transistors")) return 0x3a3f45;
  if (tags.includes("ics")) return 0x27313d;
  if (tags.includes("connectors")) return 0x2fa9ba;
  return null;
}

function roughnessFor(tags) {
  if (tags.includes("copper")) return 0.34;
  if (tags.includes("board")) return 0.58;
  return 0.62;
}

function rememberMaterialBase(material) {
  material.userData.baseOpacity = material.opacity ?? 1;
  material.userData.baseTransparent = Boolean(material.transparent);
  material.userData.baseDepthWrite = material.depthWrite;
  if (material.emissive) {
    material.userData.baseEmissive = material.emissive.clone();
    material.userData.baseEmissiveIntensity = material.emissiveIntensity || 0;
  }
}

function cleanPartName(name) {
  const raw = (name || "Компонент").split("~")[0].trim();
  if (/^R\d+/i.test(raw)) return `Резистор ${raw}`;
  if (/^C\d+/i.test(raw)) return `Конденсатор ${raw}`;
  if (/^Q\d+/i.test(raw) || /^VT\d+/i.test(raw)) return `Транзистор ${raw}`;
  if (/^IC\d+/i.test(raw) || /^OP\d+/i.test(raw) || /^DA\d+/i.test(raw)) return `Микросхема ${raw}`;
  if (/^J\d+/i.test(raw) || /^XS\d+/i.test(raw) || /^XP\d+/i.test(raw)) return `Разъём ${raw}`;
  if (raw.toUpperCase().includes("LAYER")) return "Печатная плата";
  return raw.replace(/_/g, " ");
}

function describeTags(tags) {
  if (tags.includes("board")) return partDescriptions.board[1];
  if (tags.includes("resistors")) return partDescriptions.resistors[1];
  if (tags.includes("capacitors")) return partDescriptions.capacitors[1];
  if (tags.includes("transistors")) return partDescriptions.transistors[1];
  if (tags.includes("ics")) return partDescriptions.ics[1];
  if (tags.includes("connectors")) return partDescriptions.connectors[1];
  return "Элемент печатного узла усилителя мощности.";
}

function primaryTag(tags = []) {
  const priority = ["connectors", "transistors", "ics", "capacitors", "resistors", "case", "board"];
  return priority.find((tag) => tags.includes(tag)) || "all";
}

function toFlatFloatArray(values) {
  return new Float32Array(toFlatNumberArray(values));
}

function toFlatNumberArray(values) {
  if (!values?.length) return [];
  if (Array.isArray(values[0])) return values.flat();
  return values;
}

initApp();
viewerApi = new AmpViewer();
viewerApi.init();
