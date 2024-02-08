/**
 * Save Current URL to a Variable
 */
const currentURL = window.location.href;
const queryParams = new URLSearchParams(currentURL);

/**
 * Handle Name query param
 */
const nameValue = queryParams.get('Name');
const nameSpan = document.querySelector('[by-queryparam-element="name"]');
const nameParentElement = nameSpan ? nameSpan.parentElement : null;

if (nameValue) {
  if (nameSpan) {
    nameSpan.textContent = nameValue;
    nameParentElement.style.display = 'block'; // Hide parent element
  }
} else {
  if (nameParentElement) {
    nameParentElement.style.display = 'none'; // Hide parent element
  }
}

/**
 * Get scores
 */
const chartData = {
  'Strategy': 0,
  'Operations': 0,
  'Creative': 0,
  'Content': 0,
  'Advertising': 0,
  'EmailSMS': 0,
  'Social': 0,
  'SEO': 0
};

const labelsArray = Object.keys(chartData);
const scoreData = {};

// Debugging flag for Score Calculation
const debugScoreCalculation = false;

// Loop through each query parameter and populate the scoreData object
labelsArray.forEach(category => {
  if (debugScoreCalculation) {
    console.log('Debugging Score Calculation for Category:', category);
  }

  const scoreKey = `Score${category}`;
  const scoreValue = parseInt(queryParams.get(scoreKey));

  if (debugScoreCalculation) {
    console.log('Score Key:', scoreKey);
    console.log('Score Value:', scoreValue);
  }

  // Check if the scoreValue is explicitly '0', and if so, set it to 0
  // Otherwise, use the provided score or generate a random score
  let score;
  if (scoreValue === '0') {
    score = 0;
  } else if (scoreValue !== null) {
    score = scoreValue;
  } else {
    score = Math.floor(Math.random() * 3);
    if (debugScoreCalculation) {
      console.log(`Random: ${category} ${scoreKey} ${scoreValue}`)
    }
  }

  scoreData[category] = Math.min(2, Math.max(0, score));
  chartData[category] = scoreData[category];
});

// Debugging flag for Score Calculation
if (debugScoreCalculation) {
  console.log('Score Data:', scoreData);
}

// Update the datasetDataArray with the extracted scores
const datasetDataArray = Object.values(scoreData);

const subCategory = {
  'Awareness': ['Creative', 'Content', 'Social'],
  'Acquisition': ['Advertising', 'EmailSMS', 'SEO'],
  'Retention': ['Strategy', 'Operations'],
};
const scoreSubData = {};

// Loop through each category in subCategory
for (const category in subCategory) {
  const subCategories = subCategory[category];
  let subtotal = 0;

  // Loop through subCategories and sum their scores from chartData
  for (const subCategoryName of subCategories) {
    subtotal += chartData[subCategoryName];
  }

  // Assign the subtotal to the scoreSubData object
  scoreSubData[category] = subtotal;
}

/**
 * Calculate overall total score percentage
 */
const maxScore = labelsArray.length * 2;
const totalScore = datasetDataArray.reduce((sum, score) => sum + score, 0);
const totalScorePercentage = Math.floor((totalScore / maxScore) * 100);
// console.log(`Overall Total Score Percentage: ${totalScorePercentage}%`);

/**
 * Update total score percentage span
 */
const totalNumberSpan = document.querySelector('[by-result-element="total-number"]');
if (totalNumberSpan) {
  let currentNumber = parseInt(totalNumberSpan.textContent);
  const targetNumber = totalScorePercentage;

  // Use GSAP's to() method to animate the number span
  gsap.to(totalNumberSpan, {
    duration: 3,
    innerText: targetNumber,
    roundProps: 'innerText',
    snap: { innerText: 1 },
    ease: 'easeOutBack',
    onUpdate: () => {
      currentNumber = parseInt(totalNumberSpan
        .textContent); // Update currentNumber with the new value
    }
  });
}

/**
 * Update overall dial rotation
 */
const overallDial = document.querySelector('[by-result-element="overall-dial"]');
if (overallDial) {
  const currentRotation = parseInt(overallDial.style.transform.replace('rotate(', '').replace(
    'deg)', ''));
  const targetRotation = Math.floor((totalScorePercentage / 100) * 180);

  // Use GSAP's to() method to animate the dial rotation
  gsap.to(overallDial, {
    duration: 3,
    rotation: targetRotation,
    ease: 'easeOutBack',
    onUpdate: () => {
      overallDial.style.transform = `rotate(${currentRotation}deg)`;
    }
  });
}

/**
 * Update subtotal rings
 */
const categories = document.querySelectorAll('[by-subtotal-category]');

categories.forEach(category => {
  const subCategoryName = category.getAttribute('by-subtotal-category');

  const subCategories = subCategory[subCategoryName];

  let totalPoints = 0;
  const maxPoints = subCategories.length * 2;

  subCategories.forEach(subCategoryName => {
    totalPoints += chartData[subCategoryName];
  });

  const percentage = Math.round((totalPoints / maxPoints) * 100);

  const valueSpan = category.querySelector('[by-subtotal-element="value"]');
  valueSpan.textContent = percentage.toString();

  const circle = category.querySelector('[by-subtotal-element="svg-circle"]');
  const circumference = 2 * Math.PI * circle.getAttribute('r');
  const offset = ((100 - percentage) / 100) * circumference;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = offset;
});

/**
 * Chart generator
 */
// Rest of your chart options
const chartOptions = {
  scales: {
    r: {
      beginAtZero: false,
      suggestedMin: -0.25,
      suggestedMax: 2.1,
      grid: {
        color: 'transparent',
        display: true,
        circular: true,
        drawTicks: false
      },
      pointLabels: {
        display: false
      },
      ticks: {
        display: false
      },
      angleLines: {
        display: false, // Set to false to hide angle lines
        color: '#979BBD',
        lineWidth: 2
      }
    }
  },
  elements: {
    line: {
      fill: 'start'
    }
  },
  plugins: {
    legend: {
      display: false,
    }
  }
};

// Get the canvas and context
const canvas = document.querySelector('[by-chart-element="canvas"]');
const ctx = canvas.getContext('2d');

// Create the radar chart using Chart.js
const myChart = new Chart(ctx, {
  type: 'radar',
  data: {
    labels: labelsArray,
    datasets: [
    {
      label: '',
      data: datasetDataArray,
      backgroundColor: 'rgba(85, 0, 249, 0.3)',
      borderColor: '#5500F9',
      pointBackgroundColor: '#5500F9',
      pointBorderWidth: 0,
      pointHoverBackgroundColor: '#5500F9',
      pointHoverBorderColor: '#5500F9',
      pointRadius: 7,
      pointLabel: '',
      maintainAspectRatio: false,
    }]
  },
  options: chartOptions
});

// Use the Chart.js `render` function as a callback to know when rendering is complete
myChart.render(); // Start rendering

// Check if the animation frame has finished rendering
function checkRenderCompletion() {
  if (myChart.animating) {
    requestAnimationFrame(checkRenderCompletion);
  } else {
    const spinnerOutroTrigger = document.querySelector(
      '[by-chart-element="spinner-outro-trigger"]');
    spinnerOutroTrigger.click();

    // console.log("Chart rendering is complete!");
  }
}

checkRenderCompletion();

/**
 * Update service cards
 */
// Assuming you have calculated the maximum points for a category
const maxPointsPerCategory = 2; // You can change this to the actual maximum points

// Debugging flag for Service Cards
const debugServiceCards = false;

// Loop through each service card and check their score
const serviceCards = document.querySelectorAll('[by-service-element="card"]');
serviceCards.forEach(card => {
  const category = card.getAttribute('by-service-category');
  const className = card.getAttribute('by-service-class');

  // Check if the score for this category is not equal to maxPoints
  if (scoreData[category] === maxPointsPerCategory) {
    // Add the specified class to the card
    card.classList.add(className);
  } else if (card.classList.contains(className)) {
    // Remove the specified class from the card if it exists
    card.classList.remove(className);
  }

  if (debugServiceCards) {
    console.log('Debugging Service Cards for Category:', category);
    console.log('Card Class:', className);
  }
});

/**
 * Update share buttons
 */
const shareButtons = document.querySelectorAll('[by-chart-element="share-button"]');
const copyButton = document.querySelector('[by-chart-element="share-button-copy"]');
const originalButtonText = copyButton.textContent;

shareButtons.forEach(shareButton => {
  const newQueryParams = new URLSearchParams(window.location
    .search); // Keep existing query parameters

  // Add only the valid scores to the new query parameters
  labelsArray.forEach(category => {
    if (scoreData[category] !== undefined) {
      newQueryParams.set(`Score${category}`, scoreData[category]);
    }
  });

  // If name is provided, add it to the share URL
  if (nameValue) {
    newQueryParams.set('Name', nameValue);
  }

  newShareHref =
    `${window.location.origin}${window.location.pathname}?&${newQueryParams.toString()}`;
  shareButton.href = newShareHref;
});

copyButton.addEventListener('click', () => {
  const tempInput = document.createElement('input');
  tempInput.value = window.location.href;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  copyButton.textContent = 'Link copied!';
  setTimeout(() => {
    copyButton.textContent = originalButtonText;
  }, 2000);
});

/**
 * Social Share
 */
// Initialize shareUrl with an empty string
let shareUrl = '';

const elements = document.querySelectorAll("[by-socialshare]");

elements.forEach(element => {
  element.addEventListener("click", event => {
    event.preventDefault();
    const shareType = event.currentTarget.getAttribute("by-socialshare");

    // Update shareUrl with the generated URL
    shareUrl = generateShareableURL();

    // Check if the shareType is 'copy'
    if (shareType === "copy") {
      // Call the copyLink function with the updated shareUrl
      copyLink(element, shareUrl);
    } else {
      share(shareType, shareUrl);
    }
  });
});

function generateShareableURL() {
  // Create a new URLSearchParams object with the existing query parameters
  const newQueryParams = new URLSearchParams(window.location.search);

  // Add only the valid scores to the new query parameters
  labelsArray.forEach(category => {
    if (scoreData[category] !== undefined) {
      newQueryParams.set(`Score${category}`, scoreData[category]);
    }
  });

  // If name is provided, add it to the share URL
  if (nameValue) {
    newQueryParams.set('Name', nameValue);
  }

  // Construct the new shareable URL
  return `${window.location.origin}${window.location.pathname}?&${newQueryParams.toString()}`;
}

function copyLink(element, shareUrl) {
  const tempInput = document.createElement('input');
  tempInput.value = shareUrl; // Use the updated shareUrl
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  copyButton.textContent = 'Link copied!';
  setTimeout(() => {
    copyButton.textContent = originalButtonText;
  }, 2000);
}

function share(shareType, shareUrl) {
  const url = shareUrl;

  switch (shareType) {
  case "linkedin":
    shareUrlLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;

    break;
  case "twitter":
    shareUrlLink = `https://twitter.com/intent/tweet?url=${url}`;
    console.log(shareUrlLink)
    break;
  case "facebook":
    shareUrlLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    console.log(shareUrlLink)
    break;
  case "email":
    shareUrlLink =
      `mailto:?body=View%20your%20ClarityScore%20here!%20${encodeURIComponent(url)}`;

    break;
  default:
  }

  if (shareUrlLink) {
    window.open(shareUrlLink, "_blank");
  }
}

// /**
//  * HTML to JPEG
//  */
// document.querySelector('[by-chart-element="save-jpeg"]').addEventListener('click',
//   saveAsJPEG);

// function saveAsJPEG(event) {
//   event.preventDefault();

//   const pdfElement = document.getElementById('pdf-container');
//   const jpegOptions = { quality: 1, backgroundColor: '#ffffff' };

//   html2canvas(pdfElement, jpegOptions).then((canvas) => {
//     const jpegData = canvas.toDataURL('image/jpeg');

//     const link = document.createElement('a');
//     link.href = jpegData;
//     link.download = 'document.jpeg';

//     link.click();
//   });
// }

/**
 * HTML to JPEG
 */

// Initialize elements and log them for debugging
const saveHtmlButton = document.querySelector('[by-screenshot-element="button"]');
const saveHtmlTarget = document.querySelector('[by-screenshot-element="target"]');
const sectionElement = document.querySelector('[by-screenshot-element="section"]');
let filename = 'ClarityScore Report'

// Check if elements are null before attaching event listeners
if (saveHtmlButton && saveHtmlTarget && sectionElement) {
  saveHtmlButton.addEventListener('mousedown', onScreenShotClick);
} else {
  console.error("Some elements are missing.");
}

function download(canvas, filename) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL("image/jpeg;base64");
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function onScreenShotClick(event) {
  const element = saveHtmlTarget; // Changed target

  if (element && sectionElement) {
    // Add the class before capturing
    sectionElement.classList.add('is-screenshot');

    html2canvas(element).then((canvas) => {
      // Download
      download(canvas, filename);

      // Remove the class after capture
      sectionElement.classList.remove('is-screenshot');

    }).catch(err => {
      console.error("An error occurred during the screenshot capture:", err);
      // Just in case of an error, also remove the class
      sectionElement.classList.remove('is-screenshot');
    });
  } else {
    console.error("Either the target or section element is missing.");
  }
}
