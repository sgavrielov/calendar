import { body, themeToggleBtn } from "./vars.js";
let darkMode = localStorage.getItem("darkMode");

if (darkMode === "enabled") {
  body.classList.toggle("darkmode");
  themeToggleBtn.checked = true;
} else {
  body.classList.remove("darkmode");
  themeToggleBtn.checked = false;
}

themeToggleBtn.addEventListener("click", () => {
  darkMode = localStorage.getItem("darkMode");
  if (themeToggleBtn.checked) {
    body.classList.toggle("darkmode");
    localStorage.setItem("darkMode", "enabled");
  } else {
    body.classList.remove("darkmode");
    localStorage.setItem("darkMode", null);
  }
});
