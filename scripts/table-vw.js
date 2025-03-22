let cachedData = {}; // Store fetched data by month

async function fetchDataForMonth(monthString = null) {
  let today = new Date();

  // Extract year and month correctly from parameter
  let [year, month] = monthString
    ? monthString.split("-").map(Number)
    : [today.getFullYear(), today.getMonth() + 1]; // Default: current month

  // Ensure month is correctly set (month is 1-based, but Date() uses 0-based indexing)
  let cacheKey = `${year}-${String(month).padStart(2, "0")}`;

  if (cachedData[cacheKey]) {
    console.log(`✅ Returning cached data for ${cacheKey}`);
    return cachedData[cacheKey];
  }

  let startDate = new Date(year, month - 1, 1); // Month - 1 because JavaScript months are 0-based
  let endDate = new Date(year, month, 0); // Last day of the month

  let allDates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    allDates.push(currentDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1);
  }

  let allData = [];


  for (const date of allDates) {
    const apiUrl = `https://api.thaistock2d.com/2d_result?date=${date}`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.warn(`⚠️ Skipped ${date}: HTTP ${response.status}`);
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

  cachedData[cacheKey] = allData; // ✅ Store in cache
  return allData;
}


async function main(param) {
  let specificMonthData = await fetchDataForMonth(param); // Fetch for March 2025
  
  // Extract the month from the parameter
  let targetMonth = param.split("-")[1];

  // Filter the data instead of modifying the array during iteration
  specificMonthData = specificMonthData.filter(value => value.date.split("-")[1] === targetMonth);

  localStorage.setItem('cached1MResult', JSON.stringify(specificMonthData));

}


  main(localStorage.getItem("selectedDate") || new Date().toISOString().slice(0, 7));


const formatDateToMonthYear = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
};
const digitCountsByMonth = {};


 function countNumForMonths() {
  let targetMonthsArr = JSON.parse(localStorage.getItem('cached1MResult'));

  const uniqueDates = [...new Set(targetMonthsArr.map(item => item.date.slice(0, 7)))];

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
    targetMonthsArr.forEach(value => {
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




const isActiveNum = (twod, innernum) => {
  return String(twod).includes(String(innernum)) ? 'active-b' : '';
};   

const isDigitDuplicate = (towd, checkNum) => {  
  const str = String(towd);  
  return str[0] === str[1] && str[0] === String(checkNum)  
    ? `<span class="tooltip-i">2</span>`  
    : "";  
};  

 function renderingMonthVWContainer() {

  let monthContainerHTML ='';

  let targetMonthsArr = JSON.parse(localStorage.getItem('cached1MResult'));
  countNumForMonths();

  const uniqueDates = [...new Set(targetMonthsArr.map(item => item.date.slice(0, 7)))];

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
      <thead class="table-vw-header">
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


    
    targetMonthsArr.reverse().forEach((value, index, arr) => {
      if (!value || !value.child || !Array.isArray(value.child)) return;  // Check if child exists and is an array
    
      const className = `${(formatDateToMonthYear(value.date)).replace(/\s+/g, '-')}-table`;
      const element = document.querySelector(`.${className}`);
      let customClass = ""; 
    
      if (element) {
        const twod1 = value.child[1]?.twod || "--"; // Use optional chaining and default fallback
        const twod3 = value.child[3]?.twod || "--";
    
        if (index === arr.length - 1) { // Check if this is the last row after reversing
          customClass = `style="border-bottom: 0.2px solid var(--dotted-line-color); border-bottom-left-radius: 16px;"`;
        }
      
    
        element.innerHTML += `
        <tbody>
          ${[["12:01 PM", twod1], ["4:30 PM", twod3]]
            .map(([time, twod]) => `
              <tr${time === "4:30 PM" ? ' class="evening-row-twod"' : ""}>
                ${time === "12:01 PM" ? `<td rowspan="2" ${customClass}>${formatDateToDayWeek(value.date)}</td>` : ""}
                <td>${time}</td>
                <td class="main-result-twod-table">${twod}</td>
                ${Array.from({ length: 10 }, (_, i) => `
                  <th class="inner-num ${isActiveNum(twod, i)}" >${i} ${isDigitDuplicate(twod, i)}</th>
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

  // ✅ Show loading indicator
  tableLoadingElement.innerHTML = '<img src="icons/loading.svg" /> loading data ...';

  try {
    // ✅ Wait for renderingMonthVWContainer() to complete before removing loading
    await renderingMonthVWContainer();
  } catch (error) {
    console.error("Error in renderingMonthVWContainer:", error);
  }

  // ✅ Hide loading indicator only after the function completes
  tableLoadingElement.innerHTML = '';
}


 function runRenderProcesses() {
   renderFunctionsForTitleVW();
   renderFunctionsForTableVW();

  // Remove background color after loading is done
  document.querySelectorAll('.loading-page, .loading-page-title, .loading-page-table')
    .forEach(el => {
      el.style.backgroundColor = 'transparent'; // Remove background color
      el.style.opacity = '0'; // Optional: Fade out effect
    });
}

runRenderProcesses();











