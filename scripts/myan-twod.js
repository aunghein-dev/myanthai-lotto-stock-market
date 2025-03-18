const mainNumberElement = document.querySelector('.main-number');
let finishedDateTime = '';

let isLiveActive = false; // Track if live data is available
let lastUpdatedTime = null; // Store the last known API update time
let isHoliday = false;


let fetchMainInterval = null;
let fetchNewInterval = null;
let clockInterval = null;


let cachedMorning = JSON.parse(localStorage.getItem('cachedMorningLocal')) || {
  set: "--",
  value: "--",
  twod: "--",
  time: "--"
};

let cachedEvening = JSON.parse(localStorage.getItem('cachedMorningLocal')) ||{
  set: "--",
  value: "--",
  twod: "--",
  time: "--"
};


// ✅ Fetch and update main number
async function fetchMainNumber() {
  try {
    const response = await fetch("https://api.thaistock2d.com/live");
    const data = await response.json();

    let newNumber = data.live.twod;

    return newNumber;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "";
  }
}



// Function to update the UI with the current system time (local time)
function updateClock() {
  let updatedTimeContainer = document.querySelector(".updated-time-container");

  if (isLiveActive) {
    let now = new Date();

    // Format: YYYY-MM-DD HH:MM:SS (Local Time)
    let formattedTime = now.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Ensure 24-hour format
    }).replace(",", ""); // Remove comma in some locales

    updatedTimeContainer.innerHTML = `<img src="icons/live.svg" />  Updating at ${formattedTime}`;
  }
}



async function isLiveTime() {
  try {
    const response = await fetch("https://api.thaistock2d.com/live");
    const data = await response.json();

    if(data.holiday.status === "2"){

      let now = new Date();
    
      let morningStart = new Date();
      morningStart.setHours(8, 40, 0, 0);

      let morningEnd = new Date();
      morningEnd.setHours(12, 1, 0, 999);

      
      let eveningStart = new Date();
      eveningStart.setHours(13, 40, 0, 0);

      let eveningEnd = new Date();
      eveningEnd.setHours(16, 30, 0, 999);  

      // Check if current time is within live trading hours
      isLiveActive =
        (now >= morningStart && now <= morningEnd) ||
        (now >= eveningStart && now < eveningEnd); 
    }

    return isLiveActive;
  } catch (error) {
    console.error("❌ Error fetching live data:", error);
    return null;
  }
}


async function startLiveFetch() {
  const live = await isLiveTime();

  if (live) {
   

    // Start only if not already running
    if (!fetchMainInterval) {
      fetchMainNumber(); // Fetch immediately
      fetchMainInterval = setInterval(fetchMainNumber, 500);
      console.log("✅ fetchMainNumber started.");
    }

    if (!fetchNewInterval) {
      fetchNewNumber(); // Fetch immediately
      fetchNewInterval = setInterval(fetchNewNumber, 500);
      console.log("✅ fetchNewNumber started.");
    }

    if (!clockInterval) {
  
      updateClock(); // Update immediately
      clockInterval = setInterval(updateClock, 500);
      console.log("✅ updateClock started.");
    }

  } 
}


async function stopLiveFetch() {

  renderingNormalRESULTS();
  let updatedTimeContainer = document.querySelector(".updated-time-container");
  let finishedTime = await fetchFinishedTime(); // Get the latest stock_datetime
  updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${finishedTime}`;

  if (fetchMainInterval) {
    clearInterval(fetchMainInterval);
    fetchMainInterval = null;
    console.log("❌ fetchMainNumber stopped.");
  }

  if (fetchNewInterval) {
    clearInterval(fetchNewInterval);
    fetchNewInterval = null;
    console.log("❌ fetchNewNumber stopped.");
  }

  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
    console.log("❌ updateClock stopped.");
  }
}



async function checkLiveStatus() {
  const live = await isLiveTime();

  if (live && !fetchMainInterval) {
    startLiveFetch();
  } else if (!live && fetchMainInterval) {
    stopLiveFetch();
  }

  setTimeout(checkLiveStatus, 1000); // Check every second recursively
}

checkLiveStatus(); // Start the live status check

async function fetchNewNumber() {
  localStorage.removeItem('cachedMorningLocal');
  localStorage.removeItem('cachedEveningLocal');
  try {
    const response = await fetch(`https://api.thaistock2d.com/live?t=${Date.now()}`); // Prevent caching
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    let newSet = data.live.set;
    let newValue = data.live.value;
    let newDigit = data.live.twod;
  
    let latestStockDatetime = "";
    if (data.result.length > 0) {
      latestStockDatetime = data.result[data.result.length - 1].stock_datetime;
    }

    // Convert latestStockDatetime to a Date object
    let latestStockDate = new Date(latestStockDatetime);
    let thresholdTime = new Date();
    thresholdTime.setHours(12, 1, 5, 0); // Set to 12:1:05 PM


    if(lastUpdatedTime <= new Date().setHours(12,1,5,0) && lastUpdatedTime >= new Date().setHours(12,0,59,0)){
      cachedMorning.set = newSet;
      cachedMorning.value = newValue;
      cachedMorning.twod = newDigit;
      localStorage.setItem('cachedMorningLocal',JSON.stringify(cachedMorning));
    }

    if(lastUpdatedTime <= new Date().setHours(16,30,5,0) && lastUpdatedTime >= new Date().setHours(16,29,99,0)){
      cachedEvening.set = newSet;
      cachedEvening.value = newValue;
      cachedEvening.twod = newDigit;
      localStorage.setItem('cachedEveningLocal',JSON.stringify(cachedEvening));
    }

    // Apply fade-in and fade-out effect based on time
    if (latestStockDate < thresholdTime) {
      updateWithFade(".js-morning-set-result", newSet);
      updateWithFade(".js-morning-value-result", newValue);
      updateWithFade(".js-morning-result-digit", "--");
    } else {
     updateWithFade(".js-evening-set-result", newSet);
     updateWithFade(".js-evening-value-result", newValue);
     updateWithFade(".js-evening-result-digit", "--");
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    showLoading();
  }
}

// Function to apply fade-in and fade-out effect when updating elements
function updateWithFade(selector, newValue) {
  let element = document.querySelector(selector);
  if (element && element.textContent !== newValue) {
    element.style.opacity = "0"; // Fade out
    setTimeout(() => {
      element.textContent = newValue; // Change text
      element.style.opacity = "1"; // Fade in
    }, 300); // Wait for fade-out before updating (300ms)
  }
}

// Function to show loading state if there's no internet or API error
function showLoading() {
  document.querySelector(".js-morning-set-result").textContent = "--";
  document.querySelector(".js-morning-value-result").textContent = "--";
  document.querySelector(".js-morning-result-digit").textContent = "--";
}

// Initial call to display loading on page load
showLoading();


async function fetchFinishedTime() {
  try {
    const response = await fetch("https://api.thaistock2d.com/live");
    const data = await response.json();

    if (!data.result || !Array.isArray(data.result)) {
      console.error("❌ No valid 'result' array in response");
      return "";
    }

    // Filter only valid results (those with a non-null history_id)
    const validResults = data.result.filter(item => item.history_id !== null);

    if (validResults.length === 0) {
      console.warn("⚠️ No valid finished stock data found.");
      return "";
    }

    // Find the latest stock_datetime
    validResults.sort((a, b) => new Date(b.stock_datetime) - new Date(a.stock_datetime));

   
    return validResults[0].stock_datetime;

  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return "";
  }
}



async function fetchFinishedResults() {
  try {
    const response = await fetch("https://api.thaistock2d.com/2d_result");
    const data = await response.json();

    const lastData = Array.isArray(data) && data.length > 0 ? data[0] : {};

    return lastData || {};
  } 
  catch (error) {
    console.error("Error fetching data:", error);
    return {}; // Return empty object on failure
  }
}



async function renderingShowingLastResults() {
  try {
    let finishedResults = await fetchFinishedResults();
    let finishedTime = await fetchFinishedTime(); // Get the latest stock_datetime
    let updatedTimeContainer = document.querySelector(".updated-time-container");
    if (!finishedResults || !Array.isArray(finishedResults.child)) {
      console.log("No valid data available.");
      return;
    }
  

    let now = new Date();

    let morningStart = new Date();
    morningStart.setHours(8, 40, 0, 0);

    let morningEnd = new Date();
    morningEnd.setHours(12, 1, 0, 999);

    let eveningStart = new Date();
    eveningStart.setHours(13, 40, 0, 0);

    let eveningEnd = new Date();
    eveningEnd.setHours(16, 30, 0, 999);

    finishedResults.child.forEach((item) => {
      if (now >= morningStart && now <= morningEnd && isLiveActive) {
        if (item.time === '16:30:00') {
          console.log("Rendering Evening Result during Morning Live Active");
          renderEveningInPage(item);
        }
      }

      if (now >= eveningStart && now <= eveningEnd && isLiveActive) {
        if (item.time === '12:01:00') {
          console.log("Rendering Morning Result during Evening Live Active");
          renderMorningInPage(item);
        }
      }

      if (!isLiveActive) {
        if (item.time === '12:01:00') {
          renderMorningInPage(item);
        }
        if (item.time === '16:30:00') {
          renderEveningInPage(item);
        }
      }
      if(!isLiveActive){
        if (!isLiveActive && now > morningEnd && now < eveningStart) {
            updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${finishedTime}`;
        } else if (!isLiveActive){
          updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${finishedTime}`;
        } 
      }

    });
  } catch (error) {
    console.error("Error fetching finished results:", error);
  }
}

async function renderingNormalRESULTS(){
    let finishedResults = await fetchFinishedResults();
    finishedResults.child.forEach((item) => {

    if (!isLiveActive) {
      if (item.time === '12:01:00') {
        if(item.twod === "--"){
          renderMorningInPage(cachedMorning);
        } else {
          renderMorningInPage(item);
        }
      }
      if (item.time === '16:30:00') {
        if(item.twod === "--"){
          renderEveningInPage(cachedEvening);
        } else {
          renderEveningInPage(item);
        }
      }
    }
  })
}

// ✅ Render Evening Result
function renderEveningInPage(itemParam) {
 document.querySelector('.js-evening-set-result').textContent = itemParam.set;
 document.querySelector('.js-evening-value-result').textContent = itemParam.value;
 document.querySelector('.js-evening-result-digit').textContent = itemParam.twod;
  if (!isLiveActive) {
    document.querySelector('.main-number').innerHTML = itemParam.twod;
  }
}

// ✅ Render Morning Result
function renderMorningInPage(itemParam) {
  document.querySelector('.js-morning-set-result').textContent = itemParam.set;
  document.querySelector('.js-morning-value-result').textContent = itemParam.value;
  document.querySelector('.js-morning-result-digit').textContent = itemParam.twod;
  if (!isLiveActive) {
    document.querySelector('.main-number').innerHTML = itemParam.twod;
  }
}


renderingShowingLastResults();

async function renderMainNumber() {
  let currentNumber = ""; // Start with "00"

  setInterval(async () => {
    const newNumber = await fetchMainNumber();
    mainNumberElement.innerHTML = ""; // Clear previous digits

    for (let i = 0; i < 2; i++) {
      const digitSpan = document.createElement("span");
      digitSpan.textContent = newNumber[i];
      digitSpan.classList.add("digit");

      // Apply animation only if live data is active
      if (isLiveActive && newNumber[i] !== currentNumber[i]) {
        digitSpan.classList.add("slide-in");
      }

      mainNumberElement.appendChild(digitSpan);
    }

    currentNumber = newNumber; // Update stored number
  }, 1000); // Change every 2 seconds
}




