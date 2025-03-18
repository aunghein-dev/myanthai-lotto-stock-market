const mainNumberElement = document.querySelector('.main-number');
let finishedDateTime = '';

let isLiveActive = false; // Track if live data is available
let lastUpdatedTime = null; // Store the last known API update time
let isHoliday = false;


let cachedMorning = {
  set: "--",
  value: "--",
  twod: "--",
  time: "--"
};

let cachedEvening = {
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

    const liveTime = data.live.time;
    const liveTimeDate = new Date(liveTime.replace(" ", "T")); // Convert to ISO format

    const now = new Date(); // Define 'now' correctly

    // Set limit times
    const limitTime = new Date();
    limitTime.setHours(12, 1, 0); // 12:01:00 PM

    const evLimitTime = new Date();
    evLimitTime.setHours(16, 30, 0); // 4:30:00 PM

    // Morning caching condition
    if (
      now.getHours() === 12 &&
      now.getMinutes() === 1 &&
      now.getSeconds() === 1
    ) {
      cachedMorning.set = data.live.set;
      cachedMorning.value = data.live.value;
      cachedMorning.time = data.live.time;
      cachedMorning.twod = data.live.twod;

      localStorage.setItem("cachedMorningTwod", JSON.stringify(cachedMorning));
    }

    // Evening caching condition
    if (
      now.getHours() === 16 &&
      now.getMinutes() === 30 &&
      now.getSeconds() === 1
    ) {
      cachedEvening.set = data.live.set;
      cachedEvening.value = data.live.value;
      cachedEvening.time = data.live.time;
      cachedEvening.twod = data.live.twod;

      localStorage.setItem("cachedEveningTwod", JSON.stringify(cachedEvening));
    }

    return newNumber;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "";
  }
}




// Function to update the UI with the current system time (local time)
function updateClock() {
  let updatedTimeContainer = document.querySelector(".updated-time-container");

  if (isLiveActive && updatedTimeContainer) {
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


let fetchMainInterval = null;
let fetchNewInterval = null;
let clockInterval = null;



async function isLiveTime() {
  try {
    const response = await fetch("https://api.thaistock2d.com/live");
    const data = await response.json();

    // Check if holiday status is "2" (allowed for live updates)
    if (data.holiday.status !== "2") {
      console.log("⛔ Market is closed due to holiday status.");
      isHoliday = true; 
      isLiveActive = false;
      return false;
    }

    let now = new Date();

    // Define morning and evening time ranges
    let morningStart = new Date(now);
    morningStart.setHours(8, 40, 0, 0);

    let morningEnd = new Date(now);
    morningEnd.setHours(12, 1, 2, 0);

    let eveningStart = new Date(now);
    eveningStart.setHours(13, 40, 0, 0);

    let eveningEnd = new Date(now);
    eveningEnd.setHours(16, 30, 2, 0);

    // Check if current time is within live trading hours
    isLiveActive =
      (now >= morningStart && now <= morningEnd) ||
      (now >= eveningStart && now <= eveningEnd);

    console.log(isLiveActive ? "✅ Market is live." : "⛔ Market is closed.");

    return isLiveActive;
  } catch (error) {
    console.error("❌ Error fetching live data:", error);
    isLiveActive = false;
    return false;
  }
}


async function startLiveFetch() {
  const live = await isLiveTime();

  if (live) {
    renderMainNumber();

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
      clockInterval = setInterval(updateClock, 1000);
      console.log("✅ updateClock started.");
    }
  } else {
    stopLiveFetch(); // Stop if outside live hours
  }
}


function stopLiveFetch() {
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

// Check every minute if we need to start or stop fetching
setInterval(() => {
  if (isLiveTime() && !fetchMainInterval) {
    startLiveFetch();
  } else if (!isLiveTime() && fetchMainInterval) {
    stopLiveFetch();
  }
}, 60000); // Check every 60 seconds

// Run immediately on page load
startLiveFetch();



async function fetchNewNumber() {
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
    thresholdTime.setHours(12, 10, 0, 0); // Set to 12:10:00

    // Check if live data is available
    if (newDigit === "--") {
      isLiveActive = false; // Stop animation
      newDigit = latestStockDatetime ? data.result[data.result.length - 1].twod : "--"; // Use latest result
    } else {
      isLiveActive = true; // Live data is available again
      
    }

    // Apply fade-in and fade-out effect based on time
    if (latestStockDate < thresholdTime) {
      updateWithFade(".js-morning-set-result", newSet);
      updateWithFade(".js-morning-value-result", newValue);
      updateWithFade(".js-morning-result-digit", '--');
    } else {
      updateWithFade(".js-evening-set-result", newSet);
      updateWithFade(".js-evening-value-result", newValue);
      updateWithFade(".js-evening-result-digit", '--');
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    isLiveActive = false; // Stop updating clock
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

    console.log("✅ Latest finished stock time:", validResults[0].stock_datetime);
    return validResults[0].stock_datetime;

  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return "";
  }
}


updateTime();
// ✅ Fetch finished stock time
async function updateTime() {
  let updatedTimeContainer = document.querySelector(".updated-time-container");

  if (!updatedTimeContainer) return;

  let finishedTime = await fetchFinishedTime(); // Get the latest stock_datetime


  if(isLiveActive === false ){
    updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${finishedTime}`;
  } else if (isLiveActive === false && !isHoliday){
    updatedTimeContainer.innerHTML = `<img src="icons/loading.svg" /> waiting for live ... `;
  }
  
  else {
    updatedTimeContainer.innerHTML = `<img src="icons/loading.svg" /> loading ...`;
  }
  
}

// ✅ Function to set update time with green tick (Only when update is valid)
function setUpdatedTime(time) {
  let updatedTimeContainer = document.querySelector(".updated-time-container");
  if (updatedTimeContainer) {
    updatedTimeContainer.innerHTML = `<img src="icons/green-tick.svg" /> Updated at ${time}`;
  }
}



async function fetchFinishedResults() {
  try {
    const response = await fetch("https://api.thaistock2d.com/2d_result");
    const data = await response.json();

    const lastData = Array.isArray(data) && data.length > 0 ? data[0] : {};
  
    
    if(lastData.date !== new Date().toISOString().split('T')[0]){
      if(!isHoliday && isLiveActive){
        return {}
      } 
      else {
        return  lastData || {};
      }
    } else {
      return  lastData || {};
    }
  } 
  catch (error) {
    console.error("Error fetching data:", error);
    return {}; // Return empty object on failure
  }
}



async function getFinishedResults() {

  let finishedResults = await fetchFinishedResults();
  if (finishedResults.child && Array.isArray(finishedResults.child)) {
    finishedResults.child.forEach((item) => {

     
      if(item.time === '16:30:00'){
        if(item.twod==="--"){
          renderEveningInPage(cachedEvening);
        } else if (item.twod !== "--"){
          renderEveningInPage(item);
          if (localStorage.getItem("cachedEveningTwod")) {
            localStorage.removeItem("cachedEveningTwod");
          } 
        }
      } 
      //Morning Section
      else if (item.time === '12:01:00'){
        if(item.twod==="--"){
          renderMorningInPage(cachedMorning);
        } else if (item.twod !== "--"){
          renderMorningInPage(item);
          if (localStorage.getItem("cachedMorningTwod")) {
            localStorage.removeItem("cachedMorningTwod");
          } 
        }

        console.log(item);
      }
      

    });
  } else {
    console.log("No data available. : in Live");
  }
}


// ✅ Ensure only valid updates trigger green tick
async function renderEveningInPage(itemParam) {
  document.querySelector('.js-evening-set-result').textContent = itemParam.set;
  document.querySelector('.js-evening-value-result').textContent = itemParam.value;
  document.querySelector('.js-evening-result-digit').textContent = itemParam.twod;
  if(!isLiveActive){
    document.querySelector('.main-number').innerHTML = itemParam.twod;
  }
}



// ✅ Ensure only valid updates trigger green tick
async function renderMorningInPage(itemParam) {
  document.querySelector('.js-morning-set-result').textContent = itemParam.set;
  document.querySelector('.js-morning-value-result').textContent = itemParam.value;
  document.querySelector('.js-morning-result-digit').textContent = itemParam.twod;
  if(!isLiveActive){
    document.querySelector('.main-number').innerHTML = itemParam.twod;
  }
}

getFinishedResults();



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



