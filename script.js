// Launch flow:
// 1. Front-end checkout success URL -> oto1.html
// 2. OTO1 checkout success URL -> thank-you.html
// 3. Downsell checkout success URL -> thank-you.html
const OFFER_LINKS = {
  frontEnd: "https://buy.stripe.com/9B63cufzl9gwdGU59MbZe0v",
  oto1: "",
  downsell: "",
  service:
    "mailto:adsbyalfred@protonmail.com?subject=Done-For-You%20Missed%20Call%20Recovery%20Setup&body=Hi%2C%20I%27d%20like%20to%20ask%20about%20the%20Done-For-You%20Missed%20Call%20Recovery%20Setup.%0A%0ABusiness%20type%3A%0ALocation%3A%0AApprox.%20missed%20calls%20per%20week%3A%0AWhat%20I%20need%20help%20with%3A%0A",
};

const DEFAULT_CURRENCY = "USD";
const faqTriggers = document.querySelectorAll(".faq-item__trigger");
const offerLinks = document.querySelectorAll("[data-offer-key]");
const heroSection = document.querySelector("[data-hero]");
const stickyCta = document.querySelector("[data-sticky-cta]");

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

offerLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.classList.contains("is-disabled")) {
      event.preventDefault();
      return;
    }

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

    if (canTrack && eventName) {
      const payload = {};

      if (Number.isFinite(offerPrice) && offerPrice > 0) {
        payload.value = offerPrice;
        payload.currency = offerCurrency;
      }

      window.fbq("track", eventName, payload);
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
