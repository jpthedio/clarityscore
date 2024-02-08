(function () {
  // Initialize Debug Flag
  const DEBUG = true;

  // Debug function
  const debugLog = (message) => {
    if (DEBUG) console.log(message);
  };

  // SELECTORS
  const selectors = {
    name: '[by-quizvalidate-element="name"]',
    email: '[by-quizvalidate-element="email"]',
    phone: '[by-quizvalidate-element="phone"]',
    company: '[by-quizvalidate-element="company"]',
    button: '[by-quizvalidate-element="button"]',
  };

  const elements = {};
  for (const [key, selector] of Object.entries(selectors)) {
    elements[key] = document.querySelector(selector);
  }

  if (Object.values(elements).some(el => !el)) {
    console.error("One or more elements are missing");
    return;
  }

  debugLog("Selectors initialized");

  // HELPER FUNCTIONS
  const applyStyles = (el, valid) => {
    const action = valid ? 'add' : 'remove';
    el.classList[action]("input-valid-state");
    el.classList[!valid ? 'add' : 'remove']("input-error-state");
    debugLog(`Applying ${valid ? 'valid' : 'invalid'} styles to ${el}`);
  };

  const toggleNextButton = (enabled) => {
    elements.button.disabled = !enabled;
    elements.button.classList[enabled ? 'remove' : 'add']("is-not-validated");
    debugLog(`${enabled ? 'Enabling' : 'Disabling'} next button`);
  };

  const updateNextButton = () => {
    const allValid = ['name', 'email', 'phone', 'company'].every(key => elements[key].checkValidity());
    toggleNextButton(allValid);
  };

  const handleValidation = (el) => {
    const isValid = el.checkValidity();
    debugLog(`Validating ${el}: ${isValid}`);
    applyStyles(el, isValid);
    updateNextButton();
  };

  // EVENT LISTENERS
  ['name', 'email', 'phone', 'company'].forEach(key => {
    elements[key].addEventListener("input", () => handleValidation(elements[key]));
  });

  // INITIAL EXECUTION
  updateNextButton();
})();
