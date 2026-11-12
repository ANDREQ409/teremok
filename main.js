const cfg = SITE_CONFIG;

const grid = document.getElementById("featuresGrid");
const form = document.getElementById("bookingForm");
const successBlock = document.getElementById("formSuccess");
const failBlock = document.getElementById("formFail");
const submitBtn = form.querySelector(".form__submit");
const burgerBtn = document.getElementById("burgerBtn");
const nav = document.getElementById("siteNav");
const dateInInput = form.querySelector('input[name="dateIn"]');
const dateOutInput = form.querySelector('input[name="dateOut"]');
const guestsSelect = form.querySelector('select[name="guests"]');

function applyTheme() {
  const root = document.documentElement.style;
  root.setProperty("--color-primary", cfg.theme.primary);
  root.setProperty("--color-primary-dark", cfg.theme.primaryDark);
  root.setProperty("--color-accent", cfg.theme.accent);
  root.setProperty("--color-accent-hover", cfg.theme.accentHover);
}

function fillContacts() {
  const navPhone = document.getElementById("navPhone");
  navPhone.textContent = cfg.phoneDisplay;
  navPhone.href = cfg.phoneHref;

  document.getElementById("footerName").textContent = cfg.name;

  const mapLink = `https://yandex.ru/maps/?text=${encodeURIComponent(cfg.mapQuery)}`;
  document.getElementById("mapFrame").src =
    `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(cfg.mapQuery)}&z=14`;

  const list = document.getElementById("contactsList");
  list.innerHTML = cfg.contacts.map(item => {
    const inner = item.href
      ? `<a class="contacts__value" href="${item.href}"${item.external ? ' target="_blank" rel="noopener"' : ""}>${item.value}</a>`
      : `<span class="contacts__value">${item.value}</span>`;
    return `
      <li class="contacts__item">
        <span class="contacts__label">${item.label}</span>
        ${inner}
      </li>
    `;
  }).join("");
}

function fillBookingPoints() {
  const list = document.getElementById("bookingPoints");
  list.innerHTML = cfg.bookingPoints.map(point => `<li>${point}</li>`).join("");
}

function renderFeatures() {
  const buttonLabel = cfg.bookButtonLabel || "Забронировать";
  grid.innerHTML = cfg.features.map(feature => `
    <article class="service-card">
      <h3 class="service-card__title">${feature.title}</h3>
      <p class="service-card__desc">${feature.description}</p>
      <div class="service-card__footer">
        <button type="button" class="btn btn--primary service-card__book">${buttonLabel}</button>
      </div>
    </article>
  `).join("");
}

function fillGuests() {
  cfg.guestOptions.forEach(option => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    guestsSelect.appendChild(optionElement);
  });
}

function showFieldError(fieldName, message) {
  const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);
  const inputElement = form.querySelector(`[name="${fieldName}"]`);
  if (errorElement) errorElement.textContent = message;
  if (inputElement) inputElement.classList.toggle("form__input--invalid", Boolean(message));
}

function validateForm(data) {
  let isValid = true;

  if (data.name.trim().length < 2) {
    showFieldError("name", "Введите имя (минимум 2 символа)");
    isValid = false;
  } else {
    showFieldError("name", "");
  }

  const phoneDigits = data.phone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    showFieldError("phone", "Введите телефон полностью, например +7 (900) 123-45-67");
    isValid = false;
  } else {
    showFieldError("phone", "");
  }

  if (!data.dateIn) {
    showFieldError("dateIn", "Выберите дату заезда");
    isValid = false;
  } else {
    showFieldError("dateIn", "");
  }

  if (data.dateOut && data.dateIn && data.dateOut < data.dateIn) {
    showFieldError("dateOut", "Выезд не может быть раньше заезда");
    isValid = false;
  } else {
    showFieldError("dateOut", "");
  }

  return isValid;
}

function saveRequest(request) {
  const requests = JSON.parse(localStorage.getItem("teremok_requests") || "[]");
  requests.push(request);
  localStorage.setItem("teremok_requests", JSON.stringify(requests));
}

function onFeatureBookClick(event) {
  const button = event.target.closest(".service-card__book");
  if (!button) return;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function onFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const data = {
    name: formData.get("name") || "",
    phone: formData.get("phone") || "",
    dateIn: formData.get("dateIn") || "",
    dateOut: formData.get("dateOut") || "",
    guests: formData.get("guests") || "",
    comment: formData.get("comment") || ""
  };

  if (formData.get("_gotcha")) {
    form.reset();
    return;
  }

  if (!validateForm(data)) return;

  saveRequest({
    ...data,
    createdAt: new Date().toISOString()
  });

  submitBtn.disabled = true;
  submitBtn.textContent = "Отправляем…";
  successBlock.hidden = true;
  failBlock.hidden = true;

  let sent = false;
  try {
    const response = await fetch(cfg.formEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });
    sent = response.ok;
  } catch {
    sent = false;
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "Отправить заявку";

  if (sent) {
    form.reset();
    successBlock.hidden = false;
    successBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => { successBlock.hidden = true; }, 6000);
  } else {
    failBlock.hidden = false;
    failBlock.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function onBurgerClick() {
  const isOpen = nav.classList.toggle("nav--open");
  burgerBtn.classList.toggle("burger--open", isOpen);
  burgerBtn.setAttribute("aria-expanded", String(isOpen));
}

function onNavLinkClick() {
  nav.classList.remove("nav--open");
  burgerBtn.classList.remove("burger--open");
  burgerBtn.setAttribute("aria-expanded", "false");
}

function setMinDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dateInInput.min = `${yyyy}-${mm}-${dd}`;

  dateInInput.addEventListener("change", () => {
    dateOutInput.min = dateInInput.value || dateInInput.min;
    if (dateOutInput.value && dateOutInput.value < dateOutInput.min) {
      dateOutInput.value = "";
    }
  });
}

applyTheme();
fillContacts();
fillBookingPoints();
renderFeatures();
fillGuests();
setMinDates();

grid.addEventListener("click", onFeatureBookClick);
form.addEventListener("submit", onFormSubmit);
burgerBtn.addEventListener("click", onBurgerClick);
nav.querySelectorAll(".nav__link").forEach(link => link.addEventListener("click", onNavLinkClick));
