// UV-360 — Product Specialist walkthrough

// ===== Models =====
const MODEL_NAMES = {
  x47: "X-47",
  f77: "F77",
  shockwave: "Shockwave",
  tesseract: "Tesseract",
};

// ===== Categories (shared across all models) =====
const CATEGORIES = [
  { id: "design", label: "Design & Colors" },
  { id: "performance", label: "Performance & Range" },
  { id: "battery", label: "Battery & Charging" },
  { id: "motor", label: "Motor" },
  { id: "safety", label: "Safety" },
  { id: "smarttech", label: "Smart Tech & Utility" },
  { id: "mechanical", label: "Mechanical" },
  { id: "dimensions", label: "Dimensions" },
  { id: "warranty", label: "Warranty" },
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
  const cat = CATEGORIES.find((c) => c.id === activeCategory);
  const data = (CONTENT[activeModel] || {})[activeCategory] || {};

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
