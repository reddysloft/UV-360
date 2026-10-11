// UV-360 — Product Specialist walkthrough

// ===== Models =====
const MODEL_NAMES = {
  x47: "X-47",
  f77: "F77",
  shockwave: "Shockwave",
  tesseract: "Tesseract",
};

// Models not launched yet — show a "Soon Available" watermark instead of content
const COMING_SOON = new Set(["shockwave", "tesseract"]);

// ===== Categories (shared across all models) =====
const CATEGORIES = [
  { id: "design", label: "Design & Colors" },
  { id: "variants", label: "Variants" },
  { id: "battery", label: "Battery & Charging" },
  { id: "performance", label: "Performance & Range" },
  { id: "motor", label: "Motor" },
  { id: "safety", label: "Safety" },
  { id: "smarttech", label: "Smart Tech & Utility" },
  { id: "mechanical", label: "Mechanical" },
  { id: "dimensions", label: "Dimensions" },
  { id: "warranty", label: "Warranty" },
  { id: "differences", label: "Differences in Variants" },
];

// ===== Content store =====
// Two shapes are supported per model + category:
//   1. Simple:   { body: "<html>", image: "path.jpg" }
//   2. Sub-tabs: { tabs: [ { id, label, body, image }, ... ] }
// Leave a field empty and the page shows a placeholder automatically.
const CONTENT = {
  x47: {
    design: {
      tabs: [
        {
          id: "design",
          label: "Design",
          headline: "Futuristic Design",
          body: "Designed with obsession, making every angle and finish a testament to our Aviation DNA in design, inside &amp; out. A true benchmark in merging the worlds of design and engineering.",
          image: "X47 - Design.png",
        },
        {
          id: "colors",
          label: "Colors",
          colors: [
            { id: "red", name: "Turbo Red", swatch: "#d81f27", image: "Turbo Red - X47.png" },
            { id: "white", name: "Stellar White", swatch: "#eaeaea", image: "Stellar white - X47.png" },
            { id: "black", name: "Cosmic Black", swatch: "#12151c", image: "Cosmic Black - X47.png" },
            { id: "sand", name: "Sandstorm", swatch: "#d7c7a1", image: "SANDSTORM - X47.png" },
          ],
        },
      ],
    },
    battery: {
      layout: "specs",
      sections: [
        {
          heading: "Battery",
          specs: [
            { label: "Battery Pack", values: ["SRB7", "SRB10"] },
            { label: "Energy Capacity", values: ["7.1 kWh", "10.3 kWh"] },
            { label: "BMS &amp; Safety", values: ["5-level Safety System", "5-level Safety System"] },
          ],
        },
        {
          heading: "Charging",
          specs: [
            { label: "Standard Charger", values: ["20%-80% in 3hr 30min", "20%-80% in 5hr"] },
            { label: "On-board Charger", values: ["20% - 80% in 3hr 30min", "20% - 80% in 5hr"] },
            { label: "Boost Charger", values: ["20% - 80% in 1hr 45min", "20% - 80% in 2hr 30min"] },
            { label: "UV Supernova Plus", values: ["20% - 80% in 40min", "20% - 80% in 60min"] },
          ],
        },
      ],
      images: [
        "Battery.png",
        "battery (1).png",
        "battery (2).png",
        "battery (3).png",
        "Battery cells.png",
      ],
    },
  },
  f77: {},
  shockwave: {},
  tesseract: {},
};

// ===== State =====
let activeModel = "x47";
let activeCategory = "design";
let activeSubTab = null; // falls back to the first sub-tab when null
let activeColor = null; // falls back to the first color when null
let slideTimer = null; // auto-advance timer for the image slideshow

// ===== Elements =====
const modelButtons = document.querySelectorAll(".model-btn");
const heroTitle = document.querySelector(".hero-title");
const catNav = document.getElementById("cat-nav");
const contentEl = document.getElementById("content");

// ===== Render: category buttons =====
function renderCategoryNav() {
  catNav.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat-btn" + (cat.id === activeCategory ? " is-active" : "");
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => selectCategory(cat.id));
    catNav.appendChild(btn);
  });
}

// ===== Render: content =====
function renderContent() {
  clearInterval(slideTimer); // stop any running slideshow before re-rendering

  // Not-yet-launched models: hide categories and show a watermark
  if (COMING_SOON.has(activeModel)) {
    catNav.style.display = "none";
    contentEl.innerHTML = `
      <div class="coming-soon">
        <span class="coming-soon-text">Soon Available</span>
      </div>
    `;
    return;
  }
  catNav.style.display = "";

  const cat = CATEGORIES.find((c) => c.id === activeCategory);
  const data = (CONTENT[activeModel] || {})[activeCategory] || {};

  if (data.layout === "specs") {
    contentEl.innerHTML = specsPanelHTML(data);
    initSlideshow(contentEl.querySelector("[data-slideshow]"));
    return;
  }

  if (Array.isArray(data.tabs) && data.tabs.length) {
    renderTabbedContent(data.tabs);
  } else {
    renderSimpleContent(cat, data);
  }
}

function panelHTML({ title, alt, body, image }) {
  const bodyHTML = body
    ? body
    : `Details for <strong>${title}</strong> on the ${MODEL_NAMES[activeModel]} are coming soon.`;
  const mediaHTML = image
    ? `<img src="${encodeURI(image)}" alt="${alt || title}" />`
    : `<span class="media-placeholder">Image goes here</span>`;
  return `
    <div class="content-panel">
      <div class="content-text">
        <h2 class="content-title">${title}</h2>
        <div class="content-body">${bodyHTML}</div>
      </div>
      <div class="content-media">${mediaHTML}</div>
    </div>
  `;
}

function renderSimpleContent(cat, data) {
  contentEl.innerHTML = panelHTML({
    title: cat.label,
    alt: `${MODEL_NAMES[activeModel]} — ${cat.label}`,
    body: data.body,
    image: data.image,
  });
}

function renderTabbedContent(tabs) {
  if (!tabs.some((t) => t.id === activeSubTab)) {
    activeSubTab = tabs[0].id;
  }
  const tab = tabs.find((t) => t.id === activeSubTab) || tabs[0];

  const subNav = tabs
    .map(
      (t) =>
        `<button type="button" class="subtab-btn${
          t.id === activeSubTab ? " is-active" : ""
        }" data-subtab="${t.id}">${t.label}</button>`
    )
    .join("");

  const panel =
    Array.isArray(tab.colors) && tab.colors.length
      ? colorsPanelHTML(tab.colors)
      : panelHTML({
          title: tab.headline || tab.label,
          alt: `${MODEL_NAMES[activeModel]} — ${tab.label}`,
          body: tab.body,
          image: tab.image,
        });

  contentEl.innerHTML = `
    <div class="subtab-nav">${subNav}</div>
    ${panel}
  `;

  contentEl.querySelectorAll(".subtab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeSubTab = btn.dataset.subtab;
      renderContent();
    });
  });

  contentEl.querySelectorAll(".color-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeColor = btn.dataset.color;
      renderContent();
    });
  });
}

function colorsPanelHTML(colors) {
  if (!colors.some((c) => c.id === activeColor)) {
    activeColor = colors[0].id;
  }
  const color = colors.find((c) => c.id === activeColor) || colors[0];

  const buttons = colors
    .map(
      (c) => `
      <button type="button" class="color-btn${
        c.id === activeColor ? " is-active" : ""
      }" data-color="${c.id}">
        <span class="color-swatch" style="background:${c.swatch}"></span>
        <span class="color-name">${c.name}</span>
      </button>`
    )
    .join("");

  const mediaHTML = color.image
    ? `<img src="${encodeURI(color.image)}" alt="${MODEL_NAMES[activeModel]} — ${color.name}" />`
    : `<span class="media-placeholder">Image goes here</span>`;

  return `
    <div class="colors-panel">
      <div class="color-list">${buttons}</div>
      <div class="content-media">${mediaHTML}</div>
    </div>
  `;
}

// ===== Specs layout (headings + spec rows on the left, slideshow on the right) =====
function specValues(values) {
  return values
    .map((v) => `<span class="spec-val">${v}</span>`)
    .join(`<span class="spec-pipe">|</span>`);
}

function sectionHTML(section) {
  const rows = section.specs
    .map(
      (s) => `
      <div class="spec-row">
        <div class="spec-label">${s.label}</div>
        <div class="spec-values">${specValues(s.values)}</div>
      </div>`
    )
    .join("");
  return `
    <div class="spec-section">
      <h3 class="spec-heading">${section.heading}</h3>
      ${rows}
    </div>
  `;
}

function slideshowHTML(images) {
  if (!images || !images.length) {
    return `<div class="content-media"><span class="media-placeholder">Image goes here</span></div>`;
  }
  const slides = images
    .map(
      (src, i) =>
        `<img class="slide${i === 0 ? " is-active" : ""}" src="${encodeURI(
          src
        )}" alt="Slide ${i + 1}" />`
    )
    .join("");
  const dots = images
    .map(
      (_, i) =>
        `<button type="button" class="dot${
          i === 0 ? " is-active" : ""
        }" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
    )
    .join("");
  return `
    <div class="slideshow" data-slideshow>
      <div class="slides">${slides}</div>
      <button type="button" class="slide-nav slide-prev" aria-label="Previous image">&#8249;</button>
      <button type="button" class="slide-nav slide-next" aria-label="Next image">&#8250;</button>
      <div class="slide-dots">${dots}</div>
    </div>
  `;
}

function specsPanelHTML(data) {
  const sections = (data.sections || []).map(sectionHTML).join("");
  return `
    <div class="specs-panel">
      <div class="specs-col">${sections}</div>
      <div class="specs-media">${slideshowHTML(data.images)}</div>
    </div>
  `;
}

function initSlideshow(root) {
  if (!root) return;
  const slides = root.querySelectorAll(".slide");
  const dots = root.querySelectorAll(".dot");
  if (slides.length <= 1) return; // nothing to cycle through

  let index = 0;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === index));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
  }

  function startAuto() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => show(index + 1), 4000);
  }

  root.querySelector(".slide-next").addEventListener("click", () => {
    show(index + 1);
    startAuto();
  });
  root.querySelector(".slide-prev").addEventListener("click", () => {
    show(index - 1);
    startAuto();
  });
  dots.forEach((d) => {
    d.addEventListener("click", () => {
      show(Number(d.dataset.index));
      startAuto();
    });
  });

  startAuto();
}

// ===== Actions =====
function selectCategory(catId) {
  activeCategory = catId;
  activeSubTab = null; // reset to the first sub-tab of the new category
  activeColor = null; // reset to the first color
  catNav.querySelectorAll(".cat-btn").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.category === catId);
  });
  renderContent();
}

function selectModel(model) {
  activeModel = model;
  heroTitle.textContent = MODEL_NAMES[model] || model;
  modelButtons.forEach((b) => {
    b.classList.toggle("is-active", b.dataset.model === model);
  });
  // keep the current category selected so you can compare the same part across models
  renderContent();
}

modelButtons.forEach((btn) => {
  btn.addEventListener("click", () => selectModel(btn.dataset.model));
});

// ===== Init =====
renderCategoryNav();
renderContent();
