import { calendar, weekdaysEl, monthYearDisplay, nextMonthBtn, prevMonthBtn } from "./vars.js";

class Calendar {
  constructor(calendar, weekdaysEl, monthYearDisplay, nextMonthBtn, prevMonthBtn) {
    this.calendar = calendar;
    this.weekdaysEl = weekdaysEl;
    this.monthYearDisplay = monthYearDisplay;
    this.nextMonthBtn = nextMonthBtn;
    this.prevMonthBtn = prevMonthBtn;
    this.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.nav = 0;

    this.weekdaysRender();
    this.load();
    this.navigation();
  }

  weekdaysRender() {
    this.weekdays.forEach((weekday) => {
      this.weekdaysEl.innerHTML += `<div>${weekday}</div>`;
    });
  }

  load() {
    const dt = new Date();

    if (this.nav !== 0) {
      dt.setMonth(new Date().getMonth() + this.nav);
    }

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const paddingDays = this.weekdays.indexOf(dateString.split(", ")[0]);

    this.monthYearDisplay.innerHTML = `${dt.toLocaleDateString("en-us", {
      month: "long",
    })} <span>${year}</span>`;

    this.calendar.innerHTML = "";

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
      const daySquare = document.createElement("div");
      daySquare.classList.add("day");

      if (i > paddingDays) {
        daySquare.textContent = i - paddingDays;
        daySquare.setAttribute("date", `${month + 1}/${i - paddingDays}/${year}`);

        // daySquare.addEventListener("click", () => {
        //   console.log(`Date Clicked: ${month + 1}/${i - paddingDays}/${year}`);
        // });

        if (i - paddingDays === day && this.nav === 0) {
          daySquare.classList.add("currentDay");
        }
      } else {
        daySquare.classList.replace("day", "paddingDay");
      }
      this.calendar.appendChild(daySquare);
    }
  }

  navigation() {
    this.nextMonthBtn.addEventListener("click", () => {
      this.nav++;
      this.load();
    });

    this.prevMonthBtn.addEventListener("click", () => {
      this.nav--;
      this.load();
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "ArrowRight") {
        this.nav++;
        this.load();
      } else if (e.code === "ArrowLeft") {
        this.nav--;
        this.load();
      }
    });
  }
}

export default new Calendar(calendar, weekdaysEl, monthYearDisplay, nextMonthBtn, prevMonthBtn);
