import {
  CALENDAR,
  CURRENT_VIEW_MONTH,
  CURRENT_VIEW_YEAR,
  DELETE_DAY_DATA_BTN,
  EDIT_DAY_DATA,
  EDIT_DAY_DATA_SVG,
  NEXT_MONTH_BTN,
  PREV_MONTH_BTN,
  SAVE_DAY_DATA_BTN,
  TOGGLE_DAY_DATA_BTN,
  VIEW_DATA_DATE,
  VIEW_DATA_WRAPPER,
  VIEW_DAY_DATA,
  VIEW_DAY_DATA_SVG,
  WEEKDAYS_CONTAINER,
} from "../constants.js";
import { globalState } from "../globalState.js";

class Calendar {
  #element;
  #weekdays;
  #locale = navigator.language;

  constructor(calendarElement) {
    this.#element = calendarElement;
    this.#weekdays = this.initializeWeekdays();

    this.renderWeekdays();
    this.render();
  }

  get locale() {
    return this.#locale;
  }

  initializeWeekdays() {
    const firstDayIndex = new Intl.Locale(this.#locale).weekInfo.firstDay;
    const w = [];

    for (let i = 0; i < 7; ++i) {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + i);

      const weekName = date.toLocaleDateString(this.#locale, {
        weekday: "long",
      });
      w.push(weekName);
    }

    return w.slice(firstDayIndex).concat(w.slice(0, firstDayIndex));
  }

  renderWeekdays() {
    for (let i = 0; i < this.#weekdays.length; ++i) {
      const weekdayElem = document.createElement("div");
      weekdayElem.textContent = this.#weekdays[i];
      weekdayElem.classList.add("weekday");
      WEEKDAYS_CONTAINER.appendChild(weekdayElem);
    }
  }

  getMonthName(monthNumber) {
    const d = new Date();
    d.setMonth(monthNumber);
    return d.toLocaleDateString(this.#locale, {
      month: "long",
    });
  }

  render(nav = 0) {
    const date = new Date();

    if (nav !== 0) {
      date.setMonth(new Date().getMonth() + nav);
    }

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDayDate = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const paddingDays = this.#weekdays.indexOf(
      firstDayDate.toLocaleDateString(this.#locale, { weekday: "long" })
    );

    let totalDaysInPrevMonth = new Date(year, month, 0).getDate();
    const totalDaysInNextMonth = new Date(year, month + 2, 0).getDate();
    const daysInNextMonthToRender = 42 - paddingDays - daysInMonth;

    CURRENT_VIEW_MONTH.textContent = this.getMonthName(month);
    CURRENT_VIEW_YEAR.textContent = year;

    PREV_MONTH_BTN.textContent = this.getMonthName(month - 1);
    NEXT_MONTH_BTN.textContent = this.getMonthName(month + 1);

    this.#element.innerHTML = "";

    let calendarRow = document.createElement("div");
    calendarRow.classList.add("calendarRow");

    for (
      let i = 1;
      i <= paddingDays + daysInMonth + daysInNextMonthToRender;
      ++i
    ) {
      const daySquare = document.createElement("div");
      daySquare.classList.add("day");

      const dayNumberElem = document.createElement("span");
      dayNumberElem.classList.add("dayNumber");

      if (i <= paddingDays) {
        daySquare.classList.add("pastMonth");
      } else if (i <= paddingDays + daysInMonth) {
        let hasData = Boolean(
          globalState.data?.[year]?.[month]?.[i - paddingDays]
        );

        dayNumberElem.textContent = i - paddingDays;
        daySquare.appendChild(dayNumberElem);
        daySquare.setAttribute("date", `${year}/${month}/${i - paddingDays}`);

        if (nav < 0 || (nav <= 0 && i - paddingDays < day)) {
          daySquare.classList.add("pastDay");
        }

        if (hasData) {
          const viewDayDataBtn = document.createElement("button");
          viewDayDataBtn.classList.add("viewDayDataBtn");
          viewDayDataBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
          viewDayDataBtn.addEventListener("click", () => {
            const [year, month, day] = daySquare
              .getAttribute("date")
              .split("/");

            VIEW_DATA_DATE.textContent = new Date(
              year,
              month,
              day
            ).toLocaleDateString(this.#locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            SAVE_DAY_DATA_BTN.disabled = true;
            DELETE_DAY_DATA_BTN.disabled = false;
            TOGGLE_DAY_DATA_BTN.disabled = false;

            VIEW_DATA_WRAPPER.style.display = "block";
            VIEW_DAY_DATA.style.display = "block";

            VIEW_DAY_DATA_SVG.style.display = "none";
            EDIT_DAY_DATA_SVG.style.display = "block";

            globalState.editViewDayDataEnabled = false;
            globalState.editViewDate = `${year}/${month}/${day}`;

            globalState.markdownContent = globalState.data[year][month][day];

            VIEW_DAY_DATA.innerHTML = marked.parse(globalState.markdownContent);
          });

          daySquare.appendChild(viewDayDataBtn);
        } else {
          const addNewDataBtn = document.createElement("button");
          addNewDataBtn.classList.add("addNewDataBtn");
          addNewDataBtn.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

          addNewDataBtn.addEventListener("click", () => {
            const [year, month, day] = daySquare
              .getAttribute("date")
              .split("/");

            VIEW_DATA_DATE.textContent = new Date(
              year,
              month,
              day
            ).toLocaleDateString(this.#locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            SAVE_DAY_DATA_BTN.disabled = true;
            DELETE_DAY_DATA_BTN.disabled = true;
            TOGGLE_DAY_DATA_BTN.disabled = true;

            VIEW_DATA_WRAPPER.style.display = "block";
            EDIT_DAY_DATA.style.display = "block";

            VIEW_DAY_DATA_SVG.style.display = "block";
            EDIT_DAY_DATA_SVG.style.display = "none";

            globalState.editViewDayDataEnabled = true;
            globalState.editViewDate = `${year}/${month}/${day}`;
          });

          daySquare.appendChild(addNewDataBtn);
        }

        // Current day
        if (nav === 0 && i - paddingDays === day) {
          daySquare.classList.add("currentDay");
        }
      } else if (i > paddingDays + daysInMonth) {
        daySquare.classList.add("futureMonth");
      }

      calendarRow.appendChild(daySquare);

      if (i % 7 === 0) {
        this.#element.appendChild(calendarRow);
        calendarRow = document.createElement("div");
        calendarRow.classList.add("calendarRow");
      }
    }

    const prevMonthDays = document.querySelectorAll(".day.pastMonth");
    for (let i = prevMonthDays.length - 1; i >= 0; --i) {
      const dayNumberElem = document.createElement("span");
      dayNumberElem.classList.add("dayNumber");
      dayNumberElem.textContent = totalDaysInPrevMonth--;
      prevMonthDays[i].appendChild(dayNumberElem);
    }

    const futureMonthDays = document.querySelectorAll(".day.futureMonth");
    const TOTAL_DAYS_IN_NEXT_MONTH = document.createElement("div");
    TOTAL_DAYS_IN_NEXT_MONTH.setAttribute("total-days-in-next-month", "");
    TOTAL_DAYS_IN_NEXT_MONTH.classList.add("totalDaysInFutureMonth");
    TOTAL_DAYS_IN_NEXT_MONTH.textContent = totalDaysInNextMonth;

    futureMonthDays.forEach((futureMonthDay, i) => {
      const dayNumberElem = document.createElement("span");
      dayNumberElem.classList.add("dayNumber");
      dayNumberElem.textContent = i + 1;
      futureMonthDay.appendChild(dayNumberElem);
    });

    futureMonthDays[0].appendChild(TOTAL_DAYS_IN_NEXT_MONTH);
  }
}

const calendar = new Calendar(CALENDAR);

export default calendar;
