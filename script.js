const CHECKOUT_URL = "https://buy.stripe.com/9B63cufzl9gwdGU59MbZe0v";
const PRODUCT_PRICE = 27.0;
const PRODUCT_CURRENCY = "USD";
const faqTriggers = document.querySelectorAll(".faq-item__trigger");
const checkoutLinks = document.querySelectorAll(".checkout-link");
const checkoutNote = document.querySelector("[data-checkout-note]");
const heroSection = document.querySelector("[data-hero]");
const stickyCta = document.querySelector("[data-sticky-cta]");

if (CHECKOUT_URL) {
  checkoutLinks.forEach((link) => {
    link.setAttribute("href", CHECKOUT_URL);
  });

  if (checkoutNote) {
    checkoutNote.hidden = true;
  }
}

checkoutLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const canTrack = typeof window.fbq === "function";
    const isPrimaryClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

    if (canTrack) {
      window.fbq("track", "InitiateCheckout", {
        value: PRODUCT_PRICE,
        currency: PRODUCT_CURRENCY,
      });
    }

    if (!href || !isPrimaryClick) {
      return;
    }

    if (!canTrack) {
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
