let nav = 0;

const calendar = document.querySelector(".calendar");
const monthYear = document.querySelector(".monthYear");

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  monthYear.innerHTML = `${dt.toLocaleDateString("en-us", {
    month: "long",
  })} <span class="monthYear__year">${year}</span>`;

  const dateString = firstDayOfMonth.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const paddingDays = weekdays.indexOf(dateString.split(", ")[0]);

  calendar.innerHTML = "";

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement("div");
    daySquare.classList.add("day");

    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      daySquare.addEventListener("click", () => console.log("Click"));

      if (i - paddingDays == day && nav === 0) {
        daySquare.classList.add("active");
      }
    } else {
      daySquare.classList.add("paddingDay");
    }

    calendar.appendChild(daySquare);
  }
}

function initBtns() {
  document.querySelector(".nextBtn").addEventListener("click", () => {
    nav++;
    load();
  });
  document.querySelector(".prevBtn").addEventListener("click", () => {
    nav--;
    load();
  });
}

initBtns();
load();
