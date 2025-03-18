let modernInternetResult;
let titleViewHTML;

async function fetchFinishedResults() {
  try {
    const response = await fetch("https://api.thaistock2d.com/2d_result");
    const data = await response.json();

    return  data || {};
  } 
  catch (error) {
    console.error("Error fetching data:", error);
    return {}; // Return empty object on failure
  }
}




async function renderTitleView() {
  const titleViewPanel = document.querySelector('.js-title-view-panel');
  titleViewPanel.innerHTML = ""; // Clear previous content

  titleViewHTML = "";
  modernInternetResult = await fetchGoogleSheetModernInternet();

  const uniqueDates = [...new Set(modernInternetResult.map(item => item['Format Date']))];

  let noonSet = '';
  let noonValue = '';
  let noonTwod = '';

  let eveningSet = '';
  let eveningValue = '';
  let eveningTwod = '';

  let moderMorning = '';
  let internetMorning = '';
  let modernEvening = '';
  let internetEvening = '';

  let twodResult = await fetchFinishedResults();
  

  uniqueDates.forEach(Date => {
    // Reset values for each date
    moderMorning = '';
    internetMorning = '';
    modernEvening = '';
    internetEvening = '';

     noonSet = '';
     noonValue = '';
     noonTwod = '';
  
     eveningSet = '';
     eveningValue = '';
     eveningTwod = '';

    // Filter the data for the specific date
    const filteredData = modernInternetResult.filter(item => item['Format Date'] === Date);

    // Process time-based data
    filteredData.forEach(item => {
      if (item.Time === '9:30 AM') {
        moderMorning = item.Modern;
        internetMorning = item.Internet;
      } else if (item.Time === '2:00 PM') {
        modernEvening = item.Modern;
        internetEvening = item.Internet;
      }
    });

    
    twodResult.forEach(twodResult => {
      if (twodResult.date === Date) {
        if (twodResult.child && twodResult.child[1]) {
          noonSet = twodResult.child[1].set ;
          noonValue = twodResult.child[1].value ;
          noonTwod = twodResult.child[1].twod ;
        } else {

          noonSet = noonValue = noonTwod = "--"; // Set defaults when missing
        }
    
        if (twodResult.child && twodResult.child[3]) {
          eveningSet = twodResult.child[3].set ;
          eveningValue = twodResult.child[3].value ;
          eveningTwod = twodResult.child[3].twod ;
        } else {
    
          eveningSet = eveningValue = eveningTwod = "--"; // Set defaults when missing
        }
      }
    });
    

    // Append only once per unique date
    titleViewHTML += `<!-- #one-box -->
      <div class="title-vw-date-header">${formatDateManually(Date)}</div>
      <div class="morning-evening-container">
        <div class="morning-box">
          <p class="morning-result-time">12:00 PM</p>
          <div class="morning-setvalue-section">
            <div class="morning-set">
              <p class="setvalue-header">SET</p>
              <p class="morning-set-result js-morning-set-result">${noonSet}</p>
            </div>
            <div class="morning-value">
              <p class="setvalue-header">Value</p>
              <p class="morning-value-result js-morning-value-result">${noonValue}</p>
            </div>
            <div class="morning-result">
              <p class="setvalue-header">2D</p>
              <p class="morning-result-digit js-morning-result-digit">${noonTwod}</p>
            </div>
          </div>
        </div>
        <div class="evening-box">
          <p class="evening-result-time">4:30 PM</p>
          <div class="evening-setvalue-section">
            <div class="evening-set">
              <p class="setvalue-header">SET</p>
              <p class="evening-set-result js-evening-set-result">${eveningSet}</p>
            </div>
            <div class="evening-value">
              <p class="setvalue-header">Value</p>
              <p class="evening-value-result js-evening-value-result">${eveningValue}</p>
            </div>
            <div class="evening-result">
              <p class="setvalue-header">2D</p>
              <p class="evening-result-digit js-evening-result-digit">${eveningTwod}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modern-internet-container">
        <div class="nine-thirty-o-clock">
          <div class="mordern-internet-inner-box modern-internet-time">
            9:30 AM
          </div>
          <div class="mordern-internet-inner-box">
            <div class="modern-internet-mini-header">Modern</div>
            <div class="nine-thirty-mordern-result">${moderMorning}</div>
          </div>
          <div class="mordern-internet-inner-box">
            <div class="modern-internet-mini-header">Internet</div>
            <div class="nine-thirty-internet-result">${internetMorning}</div>
          </div>
        </div>

        <div class="two-o-clock">
          <div class="mordern-internet-inner-box modern-internet-time">
            2:00 PM
          </div>
          <div class="mordern-internet-inner-box">
            <div class="modern-internet-mini-header">Modern</div>
            <div class="two-o-clock-mordern-result">${modernEvening}</div>
          </div>
          <div class="mordern-internet-inner-box">
            <div class="modern-internet-mini-header">Internet</div>
            <div class="two-o-clock-internet-result">${internetEvening}</div>
          </div>
        </div>
      </div>
      <!-- #one-box -->`;
  });

  titleViewPanel.innerHTML = titleViewHTML; // Update the UI
}

function formatDateManually(dateString) {
  const date = new Date(dateString);
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const weekday = days[date.getDay()];

  return `${day} ${month} ${year} (${weekday})`;
}



async function renderFunctionsForTitleVW() {
  const titleLoadingElement = document.querySelector('.loading-page-title');
  if (!titleLoadingElement) {
    console.error("🚨 Error: .loading-page-title not found!");
    return;
  }

  titleLoadingElement.innerHTML = '<img src="icons/loading.svg" /> loading data ...';

  try {
    await renderTitleView(); // Ensure this function finishes before clearing
  } catch (error) {
    console.error("Error in renderTitleView:", error);
  }

  // Ensure only the title loading element is cleared
  titleLoadingElement.innerHTML = ''; 
}

