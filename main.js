const cfg = SITE_CONFIG;

function applyTheme() {
  const root = document.documentElement.style;
  root.setProperty("--color-primary", cfg.theme.primary);
  root.setProperty("--color-primary-dark", cfg.theme.primaryDark);
  root.setProperty("--color-accent", cfg.theme.accent);
  root.setProperty("--color-accent-hover", cfg.theme.accentHover);
}

function fillChrome() {
  const navPhone = document.getElementById("navPhone");
  navPhone.textContent = cfg.phoneDisplay;
  navPhone.href = cfg.phoneHref;

  document.getElementById("footerName").textContent = cfg.name;

  const howtoPhone = document.getElementById("howtoPhone");
  howtoPhone.textContent = cfg.phoneDisplay;
  howtoPhone.href = cfg.phoneHref;

  document.getElementById("messengerBtn").href = cfg.messengerLink;

  document.getElementById("mapFrame").src =
    `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(cfg.mapQuery)}&z=14`;
}

function renderCatalog() {
  const grid = document.getElementById("catalogGrid");
  grid.innerHTML = cfg.catalog.map(item => `
    <article class="catalog-card" id="${item.id}">
      <figure class="catalog-card__media">
        <img src="${item.img}" alt="${item.imgAlt}" width="1200" height="900" loading="lazy">
      </figure>
      <div class="catalog-card__body">
        <div class="catalog-card__head">
          <h3 class="catalog-card__title">${item.title}</h3>
          <span class="catalog-card__capacity">${item.capacity}</span>
        </div>
        <ul class="catalog-card__features">
          ${item.features.map(feature => `<li>${feature}</li>`).join("")}
        </ul>
        <p class="catalog-card__desc">${item.description}</p>
        <div class="catalog-card__prices">
          ${item.priceRows.map(row => `
            <div class="price-row">
              <span class="price-row__label">${row.label}</span>
              <span class="price-row__dots"></span>
              <span class="price-row__value">${row.value}</span>
            </div>
          `).join("")}
        </div>
        <p class="catalog-card__note">${item.priceNote}</p>
        <div class="catalog-card__actions">
          <a class="btn btn--primary btn--small" href="${cfg.phoneHref}">Позвонить</a>
          <a class="btn btn--outline btn--small" href="${cfg.messengerLink}" target="_blank" rel="noopener">${cfg.messengerLabel}</a>
        </div>
      </div>
    </article>
  `).join("");
}

function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = cfg.gallery.map((photo, index) => `
    <figure class="gallery__item" data-index="${index}" tabindex="0" role="button" aria-label="Открыть фото: ${photo.alt}">
      <img src="${photo.src}" alt="${photo.alt}" loading="lazy">
    </figure>
  `).join("");

  grid.addEventListener("click", event => {
    const item = event.target.closest(".gallery__item");
    if (item) openLightbox(Number(item.dataset.index));
  });

  grid.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const item = event.target.closest(".gallery__item");
    if (item) {
      event.preventDefault();
      openLightbox(Number(item.dataset.index));
    }
  });
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxCounter = document.getElementById("lightboxCounter");
let slideIndex = 0;

function showSlide(index) {
  const count = cfg.gallery.length;
  slideIndex = (index + count) % count;
  const photo = cfg.gallery[slideIndex];
  lightboxImg.src = photo.src;
  lightboxImg.alt = photo.alt;
  lightboxCaption.textContent = photo.alt;
  lightboxCounter.textContent = `${slideIndex + 1} / ${count}`;
}

function openLightbox(index) {
  showSlide(index);
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("no-scroll");
}

document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
document.getElementById("lightboxPrev").addEventListener("click", () => showSlide(slideIndex - 1));
document.getElementById("lightboxNext").addEventListener("click", () => showSlide(slideIndex + 1));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showSlide(slideIndex - 1);
  if (event.key === "ArrowRight") showSlide(slideIndex + 1);
});

function renderPromos() {
  const grid = document.getElementById("promosGrid");
  grid.innerHTML = cfg.promos.map(promo => `
    <article class="promo-card">
      <span class="promo-card__badge">${promo.badge}</span>
      <h3 class="promo-card__title">${promo.title}</h3>
      <p class="promo-card__text">${promo.text}</p>
    </article>
  `).join("");
}

function renderReviews() {
  const grid = document.getElementById("reviewsGrid");
  grid.innerHTML = cfg.reviews.map(review => `
    <article class="review-card">
      <div class="review-card__head">
        <span class="review-card__avatar">${review.initials}</span>
        <span class="review-card__meta">
          <span class="review-card__name">${review.name}</span>
          <span class="review-card__date">${review.date}</span>
        </span>
      </div>
      <p class="review-card__text">${review.text}</p>
      <span class="review-card__tag">Ждёт наполнения</span>
    </article>
  `).join("");
}

function renderFaq() {
  const list = document.getElementById("faqList");
  list.innerHTML = cfg.faq.map(item => `
    <details class="faq-item">
      <summary>${item.question}</summary>
      <p class="faq-item__answer">${item.answer}</p>
    </details>
  `).join("");
}

function renderSteps() {
  const grid = document.getElementById("stepsGrid");
  grid.innerHTML = cfg.steps.map(step => `
    <article class="step-card">
      <span class="step-card__num">${step.num}</span>
      <h3 class="step-card__title">${step.title}</h3>
      <p class="step-card__text">${step.text}</p>
    </article>
  `).join("");
}

function fillContacts() {
  const list = document.getElementById("contactsList");
  list.innerHTML = cfg.contacts.map(item => {
    const inner = item.href
      ? `<a class="contacts__value" href="${item.href}"${item.external ? ' target="_blank" rel="noopener"' : ""}>${item.value}</a>`
      : `<span class="contacts__value">${item.value}</span>`;
    return `
      <li class="contacts-item">
        <span class="contacts-label">${item.label}</span>
        ${inner}
      </li>
    `;
  }).join("");
}

applyTheme();
fillChrome();
renderCatalog();
renderGallery();
renderPromos();
renderReviews();
renderFaq();
renderSteps();
fillContacts();
