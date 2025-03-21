function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeSwitch(isDark);
}

function updateThemeSwitch(isDark) {
  document.querySelector('.js-theme-switch-light')?.classList.toggle('theme-switch-light-visible', isDark);
  document.querySelector('.js-theme-switch-light')?.classList.toggle('theme-switch-light-invisible', !isDark);

  document.querySelector('.js-theme-switch-dark')?.classList.toggle('theme-switch-light-visible', !isDark);
  document.querySelector('.js-theme-switch-dark')?.classList.toggle('theme-switch-light-invisible', isDark);

}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("theme") === "dark";
  document.documentElement.classList.toggle("dark-mode", isDark);
  updateThemeSwitch(isDark);
});

document.querySelectorAll('.js-theme-switch').forEach(button => {
  button.addEventListener('click', toggleTheme);
});
