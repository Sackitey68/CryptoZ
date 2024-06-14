"use strict";

// API key for currency API
const key = "fca_live_caDW8Ee1ueBl2aVfg9IXghchORW06Pb20BtSAqtw";

// State to manage application data
const state = {
  openedDrawer: null, // Currently opened drawer (base or target)
  currencies: [], // List of all available currencies
  filteredCurrencies: [], // List of currencies filtered based on search input
  base: "GBP", // Base currency code
  target: "AUD", // Target currency code
  rates: {}, // Exchange rates data
  baseValue: 0.0088, // Initial base value
};

// UI elements
const ui = {
  controls: document.querySelector("#controls"),
  drawer: document.querySelector("#drawer"),
  dismissBtn: document.querySelector("#dismiss-btn"),
  currencyList: document.getElementById("currency-list"),
  searchInput: document.querySelector("#search"),
  baseBtn: document.querySelector("#base"),
  targetBtn: document.querySelector("#target"),
  exchangeRate: document.querySelector("#exchange-rate"),
  baseInput: document.querySelector("#base-input"),
  targetInput: document.querySelector("#target-input"),
};

// Selectors for mobile navigation and sections
const btnNav = document.querySelector(".btn-mobile-nav");
const header = document.querySelector("header");
const allSections = document.querySelectorAll("section");
const currencyToggle = document.querySelector(".currency-converter");
const drawerToggle = document.querySelector(".drawer");

// ****** Event Listeners ******
const setupEventListeners = () => {
  document.addEventListener("DOMContentLoaded", initApp); // Initialize app on DOMContentLoaded
  ui.controls.addEventListener("click", showDrawer); // Show drawer on control click
  ui.dismissBtn.addEventListener("click", hideDrawer); // Hide drawer on dismiss button click
  ui.searchInput.addEventListener("input", filterCurrency); // Filter currency list on search input
  ui.currencyList.addEventListener("click", selectPair); // Select currency pair on list item click
  ui.baseInput.addEventListener("change", convertInput); // Convert input value on base input change
};

// **** Event Handlers ****
const initApp = () => {
  fetchCurrencies(); // Fetch available currencies
  fetchExchangeRate(); // Fetch initial exchange rate
};

// Show drawer for currency selection
const showDrawer = (e) => {
  if (e.target.hasAttribute("data-drawer")) {
    state.openedDrawer = e.target.id; // Set opened drawer (base or target)
    ui.drawer.classList.add("show"); // Show drawer
    currencyToggle.classList.add("hidden");
    drawerToggle.classList.remove("hide");
  }
};

// Hide drawer and clear search input
const hideDrawer = () => {
  clearSearchInput();
  state.openedDrawer = null; // Reset opened drawer
  ui.drawer.classList.remove("show"); // Hide drawer
  currencyToggle.classList.remove("hidden");
  drawerToggle.classList.add("hide");
};

// Filter currency list based on search input
const filterCurrency = () => {
  const keyword = ui.searchInput.value.trim().toLowerCase();
  state.filteredCurrencies = getAvailableCurrencies().filter(
    ({ code, name }) => {
      return (
        code.toLowerCase().includes(keyword) ||
        name.toLowerCase().includes(keyword)
      );
    }
  );

  displayCurrencies(); // Display filtered currencies
};

// Select currency pair (base or target)
const selectPair = (e) => {
  if (e.target.hasAttribute("data-code")) {
    const { openedDrawer } = state;

    // Update the base or target currency in the state
    state[openedDrawer] = e.target.dataset.code;

    // Load exchange rate and update the buttons
    loadExchangeRate();

    // Close the drawer after selection
    hideDrawer();
  }
};

// Convert input value based on base currency value
const convertInput = () => {
  state.baseValue = parseFloat(ui.baseInput.value) || 1;
  loadExchangeRate();
};

// ***** Render Functions ****

// Display list of currencies
const displayCurrencies = () => {
  ui.currencyList.innerHTML = state.filteredCurrencies
    .map(({ code, name }) => {
      return `
<li data-code="${code}">
  <img src="${getImageURL(code)}" alt="${name}" />
  <div>
    <h4>${code}</h4>
    <p>${name}</p>
  </div>
</li>
`;
    })
    .join("");
};

// Display conversion details
const displayConversion = () => {
  updateButtons(); // Update base and target buttons
  updateInputs(); // Update input fields
  updateExchangeRate(); // Update exchange rate display
};

// Update the text of the base and target buttons
const updateButtons = () => {
  [ui.baseBtn, ui.targetBtn].forEach((btn) => {
    const code = state[btn.id];

    // Find or create the arrow icon element
    let icon = btn.querySelector(".material-symbols-outlined");
    if (!icon) {
      icon = document.createElement("span");
      icon.classList.add("material-symbols-outlined");
      icon.textContent = "keyboard_arrow_down";
    }

    // Update the button text and icon
    btn.innerHTML = `${code} ${icon.outerHTML}`;
    btn.style.setProperty("--image", `url(${getImageURL(code)})`);
  });
};

// Update input fields based on conversion result
const updateInputs = () => {
  const { base, baseValue, target, rates } = state;
  const result = baseValue * rates[base][target];
  ui.targetInput.value = result.toFixed(4);
  ui.baseInput.value = baseValue.toFixed(4);
};

// Update the displayed exchange rate
const updateExchangeRate = () => {
  const { base, target, rates } = state;
  const rate = rates[base][target].toFixed(4);
  ui.exchangeRate.textContent = `1 ${base} = ${rate} ${target}`;
};

// Get available currencies excluding the current base and target
const getAvailableCurrencies = () => {
  return state.currencies.filter(({ code }) => {
    return state.base !== code && state.target !== code;
  });
};

// Clear the search input field
const clearSearchInput = () => {
  ui.searchInput.value = "";
  ui.searchInput.dispatchEvent(new Event("input"));
};

// Get image URL for the currency flag
const getImageURL = (code) => {
  const flag =
    "https://wise.com/public-resources/assets/flags/rectangle/{code}.png";
  return flag.replace("{code}", code.toLowerCase());
};

// Load exchange rate data and display conversion
const loadExchangeRate = () => {
  const { base, rates } = state;
  if (typeof rates[base] !== "undefined") {
    displayConversion();
  } else {
    fetchExchangeRate();
  }
};

// Fetch list of available currencies from the API
const fetchCurrencies = () => {
  fetch(`https://api.freecurrencyapi.com/v1/currencies?apikey=${key}`)
    .then((response) => response.json())
    .then(({ data }) => {
      state.currencies = Object.values(data);
      state.filteredCurrencies = getAvailableCurrencies();
      displayCurrencies();
    })
    .catch(console.error);
};

// Fetch exchange rate data from the API
const fetchExchangeRate = () => {
  const { base } = state;
  fetch(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${key}&currencies=&base_currency=${base}`
  )
    .then((response) => response.json())
    .then(({ data }) => {
      state.rates[base] = data;
      displayConversion();
    })
    .catch(console.error);
};

// Initialize event listeners
setupEventListeners();

// Mobile navigation button click event
btnNav.addEventListener("click", () => {
  header.classList.toggle("nav-open");
});

// Reveal section transition
const revealSection = function (entries, observer) {
  const [entry] = entries;
  if (!entry.isIntersecting) return;
  entry.target.classList.remove("section--hidden");
  observer.unobserve(entry.target);
};

// Observer for revealing sections
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.1,
});

// Apply observer to all sections
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add("section--hidden");
});
