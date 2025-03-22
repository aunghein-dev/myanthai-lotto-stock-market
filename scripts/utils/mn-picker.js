const pickerButton = document.getElementById("picker-button");
const pickerDropdown = document.getElementById("picker-dropdown");
const monthGrid = document.getElementById("month-grid");
const yearDisplay = document.getElementById("year-display");
const prevYearButton = document.getElementById("prev-year");
const nextYearButton = document.getElementById("next-year");
const calendarIcon = document.querySelector(".picker-container img"); // Select image

// Retrieve last selected month & year from localStorage (if exists)
let storedDate = localStorage.getItem("selectedDate");
let selectedYear, selectedMonthIndex;

if (storedDate) {
  const [storedYear, storedMonth] = storedDate.split("-").map(Number);
  selectedYear = storedYear;
  selectedMonthIndex = storedMonth - 1; // Convert 1-based to 0-based index
} else {
  selectedYear = new Date().getFullYear();
  selectedMonthIndex = new Date().getMonth();
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function updateYearDisplay() {
  yearDisplay.textContent = selectedYear;
}

function populateMonths() {
  monthGrid.innerHTML = ""; 

  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth(); // 0-based (Jan = 0, Dec = 11)

  months.forEach((month, index) => {
    const button = document.createElement("button");
    button.textContent = month;

    // Disable future months (only allow selection up to the current month)
    if (selectedYear === currentYear && index > currentMonthIndex) {
      button.disabled = true;
      button.classList.add("disabled");
    }

    // Ensure first selection works correctly
    if (selectedMonthIndex === undefined && index === currentMonthIndex) {
      selectedMonthIndex = currentMonthIndex;
      button.classList.add("selected");
    }

    // Apply 'selected' class to the currently selected month
    if (index === selectedMonthIndex && !button.disabled) {
      button.classList.add("selected");
    }

    button.onclick = async () => {
      if (button.disabled) return; // Prevent clicking disabled months

      // Remove 'selected' class from all buttons
      document.querySelectorAll(".month-grid button").forEach(btn => btn.classList.remove("selected"));

      // Add 'selected' class to the clicked button
      button.classList.add("selected");

      selectedMonthIndex = index;
      let formattedDate = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
      
      // ✅ Update button UI text to "Mon-YYYY" format
      pickerButton.textContent = `${months[selectedMonthIndex]}-${selectedYear}`;

      // Store selected date in localStorage (still in "YYYY-MM" format)
      localStorage.setItem("selectedDate", formattedDate);

      pickerDropdown.classList.remove("active");

      // ✅ Ensure UI updates only after fetching data
      try {
        await main(formattedDate);
        renderFunctionsForTableVW();
        generatePastMonths();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    monthGrid.appendChild(button);
  });
}

// Toggle dropdown when clicking button or icon
function toggleDropdown() {
  pickerDropdown.classList.toggle("active");
}

pickerButton.addEventListener("click", toggleDropdown);
calendarIcon.addEventListener("click", toggleDropdown); // Make image clickable

prevYearButton.addEventListener("click", () => {
  selectedYear--;
  updateYearDisplay();
  populateMonths();
});

nextYearButton.addEventListener("click", () => {
  selectedYear++;
  updateYearDisplay();
  populateMonths();
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => { 
  if (!pickerButton.contains(event.target) && 
      !pickerDropdown.contains(event.target) && 
      !calendarIcon.contains(event.target)) {
    pickerDropdown.classList.remove("active");
  }
});

// Set default to last picked month/year or current month/year on load
document.addEventListener("DOMContentLoaded", () => {
  let formattedDate = `${selectedYear}-${String(selectedMonthIndex + 1).padStart(2, '0')}`;
  
  // ✅ Set picker button text to "Mon-YYYY"
  pickerButton.textContent = `${months[selectedMonthIndex]}-${selectedYear}`;

  populateMonths();
  updateYearDisplay();
});
