/**
 * Variables
 */
// Define your category scores and other variables
const quizForm = document.querySelector('[by-quiz-element="form"]');
const quizFormBlock = document.querySelector('[by-quiz-element="form-block"]');
const radioGroups = document.querySelectorAll('[by-quiz-element="button-answer-group"]');
const buttonSubmit = document.querySelectorAll('[by-quiz-element="button-submit"]');
const buttonRedirect = document.querySelector('[by-quiz-element="button-redirect"]');

const inputElement = document.querySelector('[by-quiz-element="input-name"]');
const inputResultsUrlElement = document.querySelector('[by-resultsurl-element="input"]');
const mirrorElement = document.querySelector('[by-quiz-element="input-name-mirror"]');

const categoryScores = {};
const processedElements = new Set();
const totalAnswerGroups = radioGroups.length;

/**
 * Mirror Input Name to Span
 */
inputElement.addEventListener('input', function () {
  mirrorElement.textContent = inputElement.value;
});

/**
 * Functions
 */
// Function to calculate category totals
function calculateCategoryTotals() {
  const categoryTotals = {};
  for (const category in categoryScores) {
    const total = Object.values(categoryScores[category]).reduce((acc, score) => acc + score, 0);
    categoryTotals[category] = total;
  }
  return categoryTotals;
}

/**
 * Place Results URL to input field
 */
function resultsUrl(linkParam) {
  if (inputResultsUrlElement) {
    const domain = window.location.hostname;
    inputResultsUrlElement.value = `https://${domain}${linkParam}`;

    console.log(inputResultsUrlElement.value);
  }
}

/**
 * Update URL and Text Element
 */
function updateUrl() {
  // Calculate category totals
  const categoryTotals = calculateCategoryTotals();

  // Add the name from inputElement to the query parameters
  const nameValue = encodeURIComponent(inputElement.value);

  // Build the query parameters following the structure
  const queryParams = [
    ...Object.entries(categoryTotals).map(([category, total]) => `Score${category}=${total}`),
    `Name=${nameValue}`
  ].join('&');

  // Create the final URL with the query parameters
  const finalUrl = `/results?&${queryParams}`;

  resultsUrl(finalUrl)

  if (buttonRedirect) {
    buttonRedirect.href = finalUrl;
  }
}

/**
 * Radio Groups Initialization
 */
radioGroups.forEach((answerGroup) => {
  const category = answerGroup.getAttribute('by-quiz-category');
  const questionNumber = answerGroup.getAttribute('by-quiz-question-number');

  // Initialize this specific radio group within the category
  if (!categoryScores[category]) {
    categoryScores[category] = {};
  }
  categoryScores[category][questionNumber] = 0;

  const radioButtons = answerGroup.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((radio) => {
    // Set a unique name for the group on load
    radio.setAttribute(
      'name',
      `Question-${questionNumber}-${totalAnswerGroups}-${category}`
    );
    radio.setAttribute(
      'data-name',
      `Question-${questionNumber}-${totalAnswerGroups}-${category}`
    );

    // Add change event listener
    radio.addEventListener('change', () => {
      const answerValue = radio.value;
      const score = answerValue === 'Yes' ? 1 : 0;

      categoryScores[category][questionNumber] = score;

      updateUrl();
    });
  });

  // Add a mutation observer to track changes
  const observer = new MutationObserver((mutationsList) => {
    console.log("Observer fired");
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (!processedElements.has(answerGroup)) {
          processedElements.add(answerGroup);
        }
      }
    }
  });

  const config = { attributes: true, attributeFilter: ['class'] };
  observer.observe(answerGroup.querySelector('label.quiz_answer-radio-field'), config);
});

// Initial update of the URL
updateUrl();

// Set the names for radio groups on page load
radioGroups.forEach((answerGroup) => {
  const category = answerGroup.getAttribute('by-quiz-category');
  const questionNumber = answerGroup.getAttribute('by-quiz-question-number');

  const radioButtons = answerGroup.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((radio) => {
    // Set a unique name for the group on load
    radio.setAttribute(
      'name',
      `Question-${questionNumber}-${totalAnswerGroups}-${category}`
    );
  });
});

/**
 * Step Functionality
 */
// Get all the step elements and buttons
const quizSteps = document.querySelectorAll('[by-quiz-element="step"]');
const nextButtons = document.querySelectorAll('[by-quizstep-button="next"]');
const prevButtons = document.querySelectorAll('[by-quizstep-button="prev"]');
const progressIndicator = document.querySelector('[by-quizstep-progress="indicator"]');
const progressPercent = document.querySelector('[by-quizstep-progress="percent"]');

let currentStepIndex = 0; // Initialize to 0 for the first step

// Function to update the step classes based on the current step index
function updateStepClasses() {
  quizSteps.forEach((step, index) => {
    if (index === currentStepIndex) {
      step.classList.add('is-active-step');
      step.classList.remove('is-inactive-step');
    } else {
      step.classList.remove('is-active-step');
      step.classList.add('is-inactive-step');
    }
  });

  // Update the progress indicator and percentage
  const percentValue = (currentStepIndex + 1) / quizSteps.length * 100;
  progressIndicator.style.width = percentValue + '%';
  progressPercent.textContent = Math.round(percentValue);
}

// Function to handle the "Next" button click
nextButtons.forEach((nextButton) => {
  nextButton.addEventListener('click', () => {
    if (currentStepIndex < quizSteps.length - 1) {
      currentStepIndex++;
      updateStepClasses();
    }
  });
});

// Function to handle the "Previous" button click
prevButtons.forEach((prevButton) => {
  prevButton.addEventListener('click', () => {
    if (currentStepIndex > 0) {
      currentStepIndex--;
      updateStepClasses();
    }
  });
});

// Initial setup: Start with the first step as active (0% progress)
updateStepClasses();

/**
 * Form Submit Redirect with Countdown
 */
// Check if the form element and countdown element are found
const countdownElement = document.querySelector('[by-quiz-element="redirect-countdown"]');

if (quizForm && buttonRedirect && countdownElement) {
  quizForm.addEventListener('submit', function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Set the initial countdown value (e.g., 5 seconds)
    let countdownValue = 5;

    // Function to update the countdown element
    function updateCountdown() {
      countdownElement.textContent = countdownValue === 1 ? countdownValue +
        ' second' : countdownValue +
        ' seconds';
    }

    // Update the countdown element with the initial value
    updateCountdown();

    // Create an interval to update the countdown
    const countdownInterval = setInterval(function () {
      countdownValue--;

      // Update the countdown element
      updateCountdown();

      // Check if the countdown is complete
      if (countdownValue === 0) {
        // Trigger the click event on the "buttonRedirect" element
        buttonRedirect.click();

        // Clear the countdown interval
        clearInterval(countdownInterval);
      }
    }, 1000); // Update the countdown every 1 second (1000 milliseconds)
  });
} else {
  console.error('Quiz form, buttonRedirect, or countdown element not found.');
}

/**
 * Prevent Form Submit when hitting Enter
 */
// Prevent form submission on Enter key press
document.addEventListener('keydown', function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    return false;
  }
});
