// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");

if (toggle && nav) {
  nav.dataset.open = "false"; // collapsed by default

  toggle.addEventListener("click", () => {
    const open = nav.dataset.open === "true";
    nav.dataset.open = String(!open);
    toggle.setAttribute("aria-expanded", String(!open));
  });
}