
const lottoHTML = document.querySelector('.lotto-wrapper');

let maxYear;
let lottoData = []; // Global variable to store the fetched data

async function fetchLottoData() {
  addingLoadingPage('.loading-page');
    lottoData = await fetchSheetData(); // Fetch data and store it

    if (!Array.isArray(lottoData) || lottoData.length === 0) {
        console.log("No valid data available.");
        lottoData = []; // Ensure it's always an array
    }
    removeLoadingPage('.loading-page');
      // Remove background color after loading is done
  document.querySelectorAll('.loading-page, .loading-page-title, .loading-page-table')
  .forEach(el => {
    el.style.backgroundColor = 'transparent'; // Remove background color
    el.style.opacity = '0'; // Optional: Fade out effect
  });
    renderLottoForAllYears(); // Call this AFTER data is fetched
}

async function addingLoadingPage(querySelector) {
    document.querySelector(querySelector).innerHTML = 
    `<img src="icons/loading.svg" />
     loading...`;
}

function removeLoadingPage(querySelector) {
  document.querySelector(querySelector).innerHTML = '';
}


function getYearBoxHTML(year, htmlText) {
  return `<div class="year-box">
          <div class="year-title">${year}</div>
          <div class="container-warapper">
          ${htmlText}
          </div>
          </div>`;
}

function renderLottoForAllYears() {
  let yearBoxHTML = "";

  let uniqueYears = new Set();

  // Collect unique years
  for (let i = 0; i < lottoData.length; i++) {
      let dateObj = new Date(lottoData[i].date);
      let year = dateObj.getFullYear();
      uniqueYears.add(year);
  }

  // Sort years in descending order
  let sortedYears = [...uniqueYears].sort((a, b) => b - a);

  // Loop through each unique year
  sortedYears.forEach(lottoYear => {
      let lottoContainerHTML = "";
      let previousFirstPrize = null; // Store previous first prize

      // Loop through lottoData (latest first)
      for (let i = lottoData.length - 1; i >= 0; i--) {
          let dateObj = new Date(lottoData[i].date);
          let year = dateObj.getFullYear();
      
          if (lottoYear === year) { // Match the current year
              let firstPrize = lottoData[i].firstPrize || ""; // Ensure it's a string
              let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

              let isDuplicate = previousFirstPrize === firstPrize;

              lottoContainerHTML = 
              `<div class="lotto-container">
                  <div class="lotto-draw-info">
                      <div class="lotto-day">${dateObj.getDate()}</div>
                      <div class="lotto-month">${monthNames[dateObj.getMonth()]}</div>
                  </div>
                  <div class="myan-3d">
                      <div class="lotto-inner-header">3D</div>
                      <div class="myan-3d-num myan-3d-num${i}">${isDuplicate ? "xxx" : firstPrize.substring(3)}</div>
                  </div>
                  <div class="thai-lotto">
                      <div class="lotto-inner-header">1st Prize</div>
                      <div class="thai-lotto-num thai-lotto-num${i}">${isDuplicate ? "xxxxxx" : firstPrize}</div>
                  </div>
              </div>` + lottoContainerHTML; // Insert at the beginning

              previousFirstPrize = firstPrize; // Store for duplicate check       
          }
      }

      // Add the year box for this year
      yearBoxHTML += getYearBoxHTML(lottoYear, lottoContainerHTML);
  });

  // Append all years' lotto results to the page
  lottoHTML.innerHTML += yearBoxHTML;
}


// Fetch and store the data, then process it
fetchLottoData();


async function fetchSheetData() {
  const sheetURL = "https://docs.google.com/spreadsheets/d/1nKWh-qiQuc1GP5pyiLAVo47-4Ncmq8Wv2p0C4i5ozS4/gviz/tq?tqx=out:json";

  try {
      const response = await fetch(sheetURL);
      let text = await response.text();

      // Clean JSON response
      text = text.replace("/*O_o*/", "").replace("google.visualization.Query.setResponse(", "").slice(0, -2);
      const jsonData = JSON.parse(text);

      // Extract rows
      const rows = jsonData.table.rows.map(row => ({
          date: row.c[1]?.v, // Date column (Index 1)
          firstPrize: row.c[2]?.v, // 1st Prize (Index 2)
          first3Digits: row.c[3]?.v, // First 3 Digits (Index 3)
          last3Digits: row.c[4]?.v, // Last 3 Digits (Index 4)
          last2Digits: row.c[5]?.v // Last 2 Digits (Index 5)
      }));

      // Filter dates from 2021 and above
      const filteredData = rows.filter(item => new Date(item.date).getFullYear() >= 2019);

      return filteredData;
  } catch (error) {
      console.error("Error fetching Google Sheet:", error);
  }
}

fetchSheetData();