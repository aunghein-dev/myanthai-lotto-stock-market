

async function fetchGoogleSheetModernInternet() {
  const sheetId = "1cIApUBTA6Gm6P-uRrwGZXkEByW2H9xatAyazynj4M38";
  const sheetName = "modern-internet";
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

  try {
      const response = await fetch(sheetUrl);
      const csvData = await response.text();
      return csvToJson(csvData); // Return the result
  } catch (error) {
      console.error("Error fetching sheet:", error);
      return {}; // Handle errors
  }
}



function csvToJson(csv) {
  const lines = csv.split("\n"); // Split by lines
  const headers = lines[0].split(",").map(header => header.trim().replace(/"/g, "")); // Remove quotes from headers
  const jsonData = [];

  for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(value => value.trim().replace(/^"|"$/g, "")); // Remove surrounding quotes
      if (values.length === headers.length) { // Ensure row is valid
          let obj = {};
          headers.forEach((header, index) => {
              obj[header] = values[index];
          });
          jsonData.push(obj);
      }
  }
  return jsonData;
}

async function fetchModernInternetLatest() {
  const sheetId = "1dLLPIHdJkl16tvajomgjn1iqTHeZLeo45Z2Ba2Zzi1Q";
  const sheetName = "modern-internet-latest";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

  try {
    const response = await fetch(url);
    let text = await response.text();

    // Extract only the JSON part
    let jsonText = text.match(/{.*}/s)?.[0];
    if (!jsonText) throw new Error("Invalid JSON format");

    const json = JSON.parse(jsonText);
    const rows = json.table.rows;
    let results = {};

    rows.forEach(row => {
      let time = row.c[0]?.f || ""; // Get formatted time as string directly
      let modern = row.c[1]?.v !== null ? String(row.c[1]?.v) : "--";
      let internet = row.c[2]?.v !== null ? String(row.c[2]?.v) : "--";

      results[time] = { modern, internet };
    });

    return results;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return null;
  }
}


async function renderingModernInternet() {
  let result = await fetchModernInternetLatest();

  renderModernInternetMorning(
    Object.values(result)[0].modern || "--", 
    Object.values(result)[0].internet || "--", 
    Object.values(result)[1].modern || "--",
    Object.values(result)[1].internet || "--"
  );
}
renderingModernInternet();

const removeQuotes = (value) => {
  value = value.replace(/^"(.*)"$/, "$1"); // Remove surrounding quotes
  return value.length === 1 ? `0${value}` : value; // Add leading zero if single digit
};

async function renderModernInternetMorning(morningModern, morningInternet, eveningModern, eveningInternet) {
  const morningModernElement = document.querySelector('.nine-thirty-mordern-result-main-page');
  const morningInternetElement = document.querySelector('.nine-thirty-internet-result-main-page');
  const eveningModernElement = document.querySelector('.two-o-clock-mordern-result-main-page');
  const eveningInternetElement = document.querySelector('.two-o-clock-internet-result-main-page');

        if (morningModernElement) {
        morningModernElement.innerHTML = morningModern;
        } 

        if (morningInternetElement) {
        morningInternetElement.innerHTML = morningInternet;
        } 

        if (eveningModernElement) {
        eveningModernElement.innerHTML = eveningModern;
        } 

        if (eveningInternetElement) {
        eveningInternetElement.innerHTML = eveningInternet;
        } 
}


