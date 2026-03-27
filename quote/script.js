document.addEventListener("DOMContentLoaded", function () {
  var accordion = document.querySelector("[data-accordion]");

  if (!accordion) {
    return;
  }

  var items = accordion.querySelectorAll(".faq-item");

  items.forEach(function (item) {
    var trigger = item.querySelector(".faq-trigger");

    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      items.forEach(function (entry) {
        entry.classList.remove("is-open");
        var entryTrigger = entry.querySelector(".faq-trigger");

        if (entryTrigger) {
          entryTrigger.setAttribute("aria-expanded", "false");
        }
      });

      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
});
