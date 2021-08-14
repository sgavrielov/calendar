import { calendar, event, nextMonthBtn, prevMonthBtn } from "./vars.js";

let days = Array.from(document.querySelectorAll(".day"));

const date = () => {
  Array.from(document.querySelectorAll(".day")).forEach((day) => {
    day.addEventListener("click", () => {
      console.log(day.getAttribute("date"));
      // calendar.style.display = "none";
      // event.style.display = "flex";
    });
  });
};

date();

nextMonthBtn.addEventListener("click", () => {
  date();
});
prevMonthBtn.addEventListener("click", () => {
  date();
});
