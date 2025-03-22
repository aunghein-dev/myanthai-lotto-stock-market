 function generateCalendar(startDateStr , excludeWeekends = true) {
  const [startYear, startMonth] = startDateStr.split("-").map(Number);
  const currentDate = new Date(startYear, startMonth - 1);
  let todayStr = new Date().toISOString().split('T')[0];
  const container = document.getElementById("calendar-container");
  const isTodayContainer = (paramDtStr) => (paramDtStr === todayStr) ? "today-date-box" : "";

  const formattedMonths = (formatYr, formatMn) => {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(formatYr, formatMn - 1));
  };

  let year = startYear;
  let month = startMonth - 1;

  let firstDay = new Date(year, month, 1).getDay();
  firstDay = (firstDay === 0) ? 6 : firstDay - 1;
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
          ${excludeWeekends ? '' : '<th class="tb-sat">Sat</th><th class="tb-sun">Sun</th>'}
        </tr>
      </thead>
      <tbody>`;

  let day = 1;
  let rowContent = "<tr>";

  for (let col = 0; col < 7; col++) {
    if (col < firstDay) {
      rowContent += "<td></td>";
    } else if (day <= lastDate) {
      let dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      rowContent += `
        <td class="day-cell ${isTodayContainer(dateStr)}" data-date="${dateStr}">
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

  while (day <= lastDate) {
    rowContent = "<tr>";
    for (let col = 0; col < 7; col++) {
      if (day <= lastDate) {
        let dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        rowContent += `
          <td class="day-cell ${isTodayContainer(dateStr)}" data-date="${dateStr}">
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
        rowContent += "<td></td>";
      }
    }
    rowContent += "</tr>";
    table += rowContent;
  }

  table += "</tbody></table>";
  container.innerHTML = `<div class="month-display-container">${formattedMonths(year, month + 1)}</div>` + table;

  if (excludeWeekends) {
    document.querySelectorAll('.pure-calendar-header .tb-sat, .pure-calendar-header .tb-sun').forEach(header => header.remove());
    document.querySelectorAll('tbody tr td:nth-child(6), tbody tr td:nth-child(7)').forEach(cell => cell.remove());
  }
}



// Ensure rendering happens after all calendars are generated
 function renderingResultsIntoCalendar() {
  let targetMonthsArr = JSON.parse(localStorage.getItem('cached1MResult'));
  const today = new Date();

  targetMonthsArr.forEach(value => {
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
  generateCalendar(localStorage.getItem("selectedDate") || new Date().toISOString().slice(0, 7));
  setTimeout(() => renderingResultsIntoCalendar(), 500); // Delay ensures DOM is ready
}

generatePastMonths();
