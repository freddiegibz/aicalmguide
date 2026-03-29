// Launch flow:
// 1. Front-end checkout success URL -> oto1.html
// 2. OTO1 checkout success URL -> thank-you.html
// 3. OTO decline path -> downsell.html
// 4. Downsell checkout success URL -> thank-you.html
const OFFER_LINKS = {
  frontEnd: "https://buy.stripe.com/9B63cufzl9gwdGU59MbZe0v",
  frontEndWithBump: "https://buy.stripe.com/fZueVc2Mz64kgT60TwbZe0w",
  oto1: "https://buy.stripe.com/5kQ4gy86T64k0U8eKmbZe0x",
  downsell: "https://buy.stripe.com/00w14m86TdwMauIeKmbZe0yv",
  service:
    "mailto:adsbyalfred@protonmail.com?subject=LEAKS&body=LEAKS",
};

const DEFAULT_CURRENCY = "USD";
const faqTriggers = document.querySelectorAll(".faq-item__trigger");
const offerLinks = document.querySelectorAll("[data-offer-key]");
const heroSection = document.querySelector("[data-hero]");
const stickyCta = document.querySelector("[data-sticky-cta]");
const orderBumpModal = document.querySelector("[data-order-bump-modal]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
const bumpHelper = document.querySelector("[data-bump-helper]");

let lastFocusedElement = null;

const buildPixelPayload = (offerPrice, offerCurrency) => {
  const payload = {};

  if (Number.isFinite(offerPrice) && offerPrice > 0) {
    payload.value = offerPrice;
    payload.currency = offerCurrency;
  }

  return payload;
};

const openOrderBumpModal = (trigger) => {
  if (!orderBumpModal) {
    return;
  }

  lastFocusedElement = trigger;
  orderBumpModal.hidden = false;
  document.body.classList.add("is-modal-open");

  window.requestAnimationFrame(() => {
    orderBumpModal.classList.add("is-open");
  });

  const preferredAction =
    orderBumpModal.querySelector('[data-modal-choice="with-bump"]:not(.is-disabled)') ||
    orderBumpModal.querySelector('[data-modal-choice="base"]');

  preferredAction?.focus();
};

const closeOrderBumpModal = () => {
  if (!orderBumpModal || orderBumpModal.hidden) {
    return;
  }

  orderBumpModal.classList.remove("is-open");
  document.body.classList.remove("is-modal-open");

  window.setTimeout(() => {
    orderBumpModal.hidden = true;
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }, 180);
};

offerLinks.forEach((link) => {
  const offerKey = link.dataset.offerKey;
  const href = OFFER_LINKS[offerKey];

  if (href) {
    link.setAttribute("href", href);
    return;
  }

  if (link.dataset.requireCheckout === "true") {
    link.classList.add("is-disabled");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("tabindex", "-1");
  }
});

if (bumpHelper) {
  bumpHelper.hidden = Boolean(OFFER_LINKS.frontEndWithBump);
}

offerLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.classList.contains("is-disabled")) {
      event.preventDefault();
      return;
    }

    const offerKey = link.dataset.offerKey;
    const href = link.getAttribute("href");
    const canTrack = typeof window.fbq === "function";
    const eventName = link.dataset.trackEvent;
    const offerPrice = Number.parseFloat(link.dataset.offerPrice || "0");
    const offerCurrency = link.dataset.offerCurrency || DEFAULT_CURRENCY;
    const isPrimaryClick =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;

    const shouldOpenBumpModal =
      offerKey === "frontEnd" && !link.dataset.modalChoice && Boolean(orderBumpModal) && isPrimaryClick;

    if (canTrack && Number.isFinite(offerPrice) && offerPrice > 0) {
      window.fbq("track", "AddToCart", buildPixelPayload(offerPrice, offerCurrency));
    }

    if (shouldOpenBumpModal) {
      event.preventDefault();
      openOrderBumpModal(link);
      return;
    }

    if (canTrack && eventName) {
      window.fbq("track", eventName, buildPixelPayload(offerPrice, offerCurrency));
    }

    if (!href || !isPrimaryClick || !canTrack || !/^https?:/i.test(href)) {
      return;
    }

    event.preventDefault();
    window.setTimeout(() => {
      window.location.href = href;
    }, 140);
  });
});

if (heroSection && stickyCta) {
  const updateStickyCta = () => {
    const hasScrolledPastHero = heroSection.getBoundingClientRect().bottom <= 0;
    stickyCta.classList.toggle("is-visible", hasScrolledPastHero);
  };

  updateStickyCta();
  window.addEventListener("scroll", updateStickyCta, { passive: true });
  window.addEventListener("resize", updateStickyCta);
}

faqTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    const content = trigger.nextElementSibling;

    faqTriggers.forEach((item) => {
      const siblingContent = item.nextElementSibling;
      item.setAttribute("aria-expanded", "false");
      if (siblingContent) {
        siblingContent.hidden = true;
      }
    });

    trigger.setAttribute("aria-expanded", String(!isOpen));
    if (content) {
      content.hidden = isOpen;
    }
  });
});

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeOrderBumpModal);
});

if (orderBumpModal) {
  orderBumpModal.addEventListener("click", (event) => {
    if (event.target === orderBumpModal) {
      closeOrderBumpModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !orderBumpModal.hidden) {
      closeOrderBumpModal();
    }
  });
}
