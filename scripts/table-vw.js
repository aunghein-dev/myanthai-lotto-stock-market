let cachedData = null; // Store fetched data here

async function fetchDataForLastTwoMonths() {
  if (cachedData) {
    console.log("✅ Returning cached data");
    return cachedData; // Return cached result if available
  }

  let allDates = [];
  let today = new Date();
  
  // Calculate the start date (2 months ago)
  let startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2);
  
  let currentDate = new Date(startDate);
  let todayStr = today.toISOString().split('T')[0];

  while (currentDate.toISOString().split('T')[0] <= todayStr) {
    allDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  let allData = [];

  for (const date of allDates) {
    const apiUrl = `https://api.thaistock2d.com/2d_result?date=${date}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`Skipped ${date}: HTTP ${response.status}`);
        continue;
      }
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        allData.push(...data);
      }
    } catch (error) {
      console.error(`❌ Error fetching data for ${date}:`, error);
    }
  }

  cachedData = allData; // ✅ Store data in cache
  return allData;
}



const digitCountsByMonth = {};


async function countNumForMonths() {
  let targetMonthsArr = await fetchDataForLastTwoMonths();

  const uniqueDates = [...new Set(cachedData.map(item => item.date.slice(0, 7)))];

  const formattedMonths = uniqueDates.map(dateStr => {
    const [year, month] = dateStr.split('-');
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1));
  });

  // Reverse the months array and iterate
  formattedMonths.reverse().forEach(month => {
    const className = month.replace(/\s+/g, '-');

    // Initialize digit counters dynamically for the current month
    const digitCounts = Array(10).fill(0); // Array of 10 zeros for digits 0-9

    // Iterate over targetMonthsArr to count digit occurrences
    cachedData.forEach(value => {
      const formattedValueDate = formatDateToMonthYear(value.date);


      if (formattedValueDate === month) {
        const twod1 = value.child?.[1]?.twod || "";
        const twod3 = value.child?.[3]?.twod || "";

        // Increment counts dynamically
        for (let digit = 0; digit <= 9; digit++) {
        const digitStr = digit.toString();

        // Count occurrences in twod1
        digitCounts[digit] += [...twod1].filter(char => char === digitStr).length;

      // Count occurrences in twod3
      digitCounts[digit] += [...twod3].filter(char => char === digitStr).length;
     }

      }
    });

    // Store the digit counts for this month
    digitCountsByMonth[month] = digitCounts;
  });

}

countNumForMonths();



const formatDateToMonthYear = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};

const isActiveNum = (twod, innernum) => {
  return String(twod).includes(String(innernum)) ? 'active-b' : '';
};   

const isDigitDuplicate = (towd, checkNum) => {  
  const str = String(towd);  
  return str[0] === str[1] && str[0] === String(checkNum)  
    ? `<span class="tooltip-i">2</span>`  
    : "";  
};  

async function renderingMonthVWContainer() {

  let monthContainerHTML ='';

  let targetMonthsArr = await fetchDataForLastTwoMonths();

  const uniqueDates = [...new Set(cachedData.map(item => item.date.slice(0, 7)))];

  const formattedMonths = uniqueDates.map(dateStr => {
    const [year, month] = dateStr.split('-');
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1));
  });

  let classNameArr;

formattedMonths.reverse().forEach(month => {
  classNameArr = [];
  const className = month.replace(/\s+/g, '-');
  classNameArr.push(`${className}-table`);


  monthContainerHTML += `
  <div class="each-month-container ${className}-mn-container">
    <div class="header-of-table-month">${className}</div>
    <table class="styled-table ${className}-table">
      <thead>
        <tr>
          <th rowspan="2" class="td-header-of-date">Date</th>
          <th rowspan="2" class="td-header-of-time">Time</th>
          <th rowspan="2" class="td-header-of-twod">2D</th>
          <th colspan="10" class="right-corner-round-cell" style="text-align: center">Number</th>
        </tr>
        <tr>
          ${[digitCountsByMonth[month][0], digitCountsByMonth[month][1], digitCountsByMonth[month][2], digitCountsByMonth[month][3], digitCountsByMonth[month][4], digitCountsByMonth[month][5], digitCountsByMonth[month][6], digitCountsByMonth[month][7], digitCountsByMonth[month][8], digitCountsByMonth[month][9]]
            .map((cnt, i) => `<th class="header-number">${i} <span class="tooltip">${cnt}</span></th>`)
            .join("")}
        </tr>
      </thead>
    </table>
  </div>`;

      });
    document.querySelector('.js-table-vw-container').innerHTML = monthContainerHTML;


    
    cachedData.reverse().forEach(value => {
      if (!value || !value.child || !Array.isArray(value.child)) return;  // Check if child exists and is an array
    
      const className = `${(formatDateToMonthYear(value.date)).replace(/\s+/g, '-')}-table`;
      const element = document.querySelector(`.${className}`);
    
      if (element) {
        const twod1 = value.child[1]?.twod || "--"; // Use optional chaining and default fallback
        const twod3 = value.child[3]?.twod || "--";
            
    
        element.innerHTML += `
        <tbody>
          ${[["12:01 PM", twod1], ["4:30 PM", twod3]]
            .map(([time, twod]) => `
              <tr${time === "4:30 PM" ? ' class="evening-row-twod"' : ""}>
                ${time === "12:01 PM" ? `<td rowspan="2">${formatDateToDayWeek(value.date)}</td>` : ""}
                <td>${time}</td>
                <td class="main-result-twod-table">${twod}</td>
                ${Array.from({ length: 10 }, (_, i) => `
                  <th class="inner-num ${isActiveNum(twod, i)}">${i} ${isDigitDuplicate(twod, i)}</th>
                `).join("")}
              </tr>
            `).join("")}
        </tbody>`;
      
      } else {
        console.warn(`Element with class "${className}" not found.`);
      }
    });
    
    

}

function formatDateToDayWeek(dateString) {
  const date = new Date(dateString);
  const day = date.getDate(); // Get day (14)
  const weekday = date.toLocaleString('en-US', { weekday: 'short' }); // Get short weekday name (Fri)
  return `${day} ${weekday}`;
}


async function renderFunctionsForTableVW() {
  const tableLoadingElement = document.querySelector('.loading-page-table');
  if (!tableLoadingElement) {
    console.error("🚨 Error: .loading-page-table not found!");
    return;
  }

  tableLoadingElement.innerHTML = '<img src="icons/loading.svg" /> loading data ...';

  try {
    await renderingMonthVWContainer(); // Ensure this function finishes before clearing
  } catch (error) {
    console.error("Error in renderingMonthVWContainer:", error);
  }

  // Ensure only the table loading element is cleared
  tableLoadingElement.innerHTML = ''; 
}

async function runRenderProcesses() {
  await renderFunctionsForTitleVW();
  await renderFunctionsForTableVW();

  // Remove background color after loading is done
  document.querySelectorAll('.loading-page, .loading-page-title, .loading-page-table')
    .forEach(el => {
      el.style.backgroundColor = 'transparent'; // Remove background color
      el.style.opacity = '0'; // Optional: Fade out effect
    });
}

runRenderProcesses();











