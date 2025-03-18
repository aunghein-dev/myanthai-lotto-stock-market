const textArray = [
  "မင်္ဂလာရှိသောနေ့ရက်လေး ဖြစ်ကြပါစေ...🌻",
  "အားလုံး အဆင်ပြေကြပါစေ...💜",
  "Thank you for visiting our website. We sincerely appreciate your support and look forward to serving you."
  
];

let index = 0;
const textElement = document.getElementById("scrolling-text");

function updateText() {
  textElement.innerText = textArray[index]; 
  index = (index + 1) % textArray.length;
}

// Ensure the text updates properly after every animation cycle
textElement.addEventListener("animationiteration", updateText);

// 🔹 Force first update on page load
updateText();
