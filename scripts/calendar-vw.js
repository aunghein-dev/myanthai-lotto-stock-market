async function generateCalendar() {
  const container = document.getElementById("calendar-container");

  const currentDate = new Date();
  const startYear = currentDate.getFullYear();
  const startMonth = currentDate.getMonth();
  const formattedMonths = (formatYr, formatMn) => {
    // Format the date to get full month name and year
    const formattedDate = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(formatYr, formatMn - 1));
    
    // Return formatted as 'Month-YYYY'
    return formattedDate.replace(' ', '-');
  }
  

  // Calculate the end year and end month for the last 1 months
  let endYear = startYear;
  let endMonth = startMonth - 3;

  if (endMonth < 0) {
    endMonth += 12;
    endYear--; // Adjust year if the month goes negative
  }

  let year = startYear;
  let month = startMonth;

  const startTime = Date.now(); // Capture the start time
  const timeLimit = 500; // 500 ms time limit (adjustable)

  let calendarHTML = ''; // Accumulate HTML content

  while (year > endYear || (year === endYear && month >= endMonth)) {
    // Check if time limit exceeded
    if (Date.now() - startTime > timeLimit) {
      console.warn('Time limit exceeded');
      break; // Stop if time limit reached
    }

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1; // Adjust for Monday start
    const lastDate = new Date(year, month + 1, 0).getDate();

    let table = `
      <table class="pure-calendar-tb">
        <thead>
          <tr class="pure-calendar-header">
            <th class="tb-mon">Mon</th>
            <th class="tb-tue">Tue</th>
            <th class="tb-wed">Wed</th>
            <th class="tb-thu">Thu</th>
            <th class="tb-fri">Fri</th>
            <th class="tb-sat">Sat</th>
            <th class="tb-sun">Sun</th>
          </tr>
        </thead>
        <tbody>`;

    let day = 1;
    let rowContent = "";

    // First row (ensuring correct alignment)
    rowContent = "<tr>";
    for (let col = 0; col < 7; col++) {
      if (col < firstDay) {
        rowContent += "<td></td>"; // Empty cells before the first day
      } else if (day <= lastDate) {
        let dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        rowContent += `
          <td class="day-cell" data-date="${dateStr}">
            <div class="day-container">
              <div class="day-of-month">${day}</div>
              <div class="day-result-container"> 
                <div class="day-top" data-date="${dateStr}"></div>
                <div class="day-bottom" data-date="${dateStr}"></div>
              </div>
            </div>
          </td>`;
        day++;
      }
    }
    rowContent += "</tr>";
    table += rowContent;

    // Remaining rows
    while (day <= lastDate) {
      rowContent = "<tr>";
      for (let col = 0; col < 7; col++) {
        if (day <= lastDate) {
          let dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          rowContent += `
            <td class="day-cell" data-date="${dateStr}">
              <div class="day-container">
                <div class="day-of-month">${day}</div>
                <div class="day-result-container"> 
                  <div class="day-top" data-date="${dateStr}"></div>
                  <div class="day-bottom" data-date="${dateStr}"></div>
                </div>
              </div>
            </td>`;
          day++;
        } else {
          rowContent += "<td></td>"; // Empty cells after last date
        }
      }
      rowContent += "</tr>";
      table += rowContent;
    }

    table += "</tbody></table>";

    calendarHTML += `<div class="month-display-container">${formattedMonths(year, month + 1)}</div>` + table;

    // Move to the previous month
    month--;
    if (month < 0) {
      month = 11; // December
      year--;
    }
  }

  // Add the entire calendar HTML at once
  container.innerHTML = calendarHTML;

  // Select and remove Sat and Sun headers
  const satHeaders = document.querySelectorAll('.pure-calendar-header .tb-sat');
  const sunHeaders = document.querySelectorAll('.pure-calendar-header .tb-sun');
  satHeaders.forEach(header => header.remove());
  sunHeaders.forEach(header => header.remove());

  // Select and remove all Saturday and Sunday cells
  const saturdayCells = document.querySelectorAll('tbody tr td:nth-child(6)');
  const sundayCells = document.querySelectorAll('tbody tr td:nth-child(7)');
  saturdayCells.forEach(cell => cell.remove());
  sundayCells.forEach(cell => cell.remove());
}

generateCalendar();



// Ensure rendering happens after all calendars are generated
async function renderingResultsIntoCalendar() {
  let targetMonthsArr = await fetchDataForLastTwoMonths();
  const today = new Date();

  cachedData.forEach(value => {
    let dateStr = value.date; 
    const dateValue = new Date(value.date);
    let dayTop = document.querySelector(`.day-top[data-date="${dateStr}"]`);
    let dayBottom = document.querySelector(`.day-bottom[data-date="${dateStr}"]`);

    const isPastOrToday = dateValue <= today;

    if (dayTop) dayTop.innerHTML = isPastOrToday ? value.child[1]?.twod || "--" : value.child[1]?.twod || "";
    if (dayBottom) dayBottom.innerHTML = isPastOrToday ? value.child[3]?.twod || "--" : value.child[3]?.twod || "";
    
  });
}

// Wait for all calendars before rendering data
async function generatePastMonths() {
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    let date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    await generateCalendar(date.getFullYear(), date.getMonth());
  }
  setTimeout(() => renderingResultsIntoCalendar(), 500); // Delay ensures DOM is ready
}

generatePastMonths();
