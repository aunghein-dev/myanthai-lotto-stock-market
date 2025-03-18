document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach(tab => {
      tab.addEventListener("click", () => {
          // Remove active class from all buttons
          tabs.forEach(btn => btn.classList.remove("active"));
          tab.classList.add("active");

          // Hide all panels
          panels.forEach(panel => panel.classList.remove("active"));

          // Show the target panel
          const targetPanel = document.getElementById(tab.dataset.target);
          targetPanel.classList.add("active");
      });
  });
});
