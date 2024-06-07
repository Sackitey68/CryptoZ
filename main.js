"use strict";

const key = "fca_live_caDW8Ee1ueBl2aVfg9IXghchORW06Pb20BtSAqtw";

const state = {
  openedDrawer: null,
  currencies: [],
};

const ui = {
  controls: document.querySelector("#controls"),
  drawer: document.querySelector("#drawer"),
  dismissBtn: document.querySelector("#dismiss-btn"),
  currencyList: document.getElementById("currency-list"),
};
// All Selectors
const btnNav = document.querySelector(".btn-mobile-nav");
const header = document.querySelector("header");
const allSections = document.querySelectorAll("section");

// ****** event Listeners ******
const setupEventListeners = () => {
  document.addEventListener("DOMContentLoaded", initApp);
  ui.controls.addEventListener("click", showDrawer);
  ui.dismissBtn.addEventListener("click", hideDrawer);
};

// ****event handlers ****
const initApp = () => {
  fetchCurrencies();
};

const showDrawer = (e) => {
  if (e.target.hasAttribute("data-drawer")) {
    state.openedDrawer = e.target.id;
    ui.drawer.classList.add("show");
  }
};

const hideDrawer = () => {
  state.openedDrawer = null;
  ui.drawer.classList.remove("show");
};

// ***** render functions ****
const displayCurrencies = () => {
  ui.currencyList.innerHTML = state.currencies
    .map(({ code, name }) => {
      return `
<li data-code = "${code}">
      <img src="https://placehold.co/48" alt="${name}" />
    <div>
      <h4>${code}</h4>
      <p>${name}</p>
    </div>
  </li>
`;
    })
    .join("");
};

setupEventListeners();

const fetchCurrencies = () => {
  fetch(`https://api.freecurrencyapi.com/v1/currencies?apikey=${key}`)
    .then((response) => response.json())
    .then(({ data }) => {
      state.currencies = Object.values(data);
      displayCurrencies();
    })
    .catch(console.error);
};

btnNav.addEventListener("click", () => {
  header.classList.toggle("nav-open");
});

// RevelSection transition
const revealSection = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  entry.target.classList.remove("section--hidden");
  observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.1,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add("section--hidden");
});
