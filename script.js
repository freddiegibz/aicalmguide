const CHECKOUT_URL = "https://buy.stripe.com/9B63cufzl9gwdGU59MbZe0v";
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
