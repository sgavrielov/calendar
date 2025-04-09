const currentMonthElem = document.querySelector("[data-current-month]");
const currentYearElem = document.querySelector("[data-current-year]");
const prevMonthBtn = document.querySelector("[data-prev-btn]");
const nextMonthBtn = document.querySelector("[data-next-btn]");
const weekdaysElem = document.querySelector("[data-weekdays]");
const calendar = document.querySelector("[data-calendar]");
const newTodoDialog = document.querySelector("[data-new-todo]");
const closeDialogBtn = document.querySelector(
  "[data-close-new-todo-dialog-btn]"
);
const newTodoTitle = document.querySelector("[data-todo-title]");
const newTodoDesc = document.querySelector("[data-todo-desc]");
const saveNewTodoBtn = document.querySelector("[data-save-new-todo-btn]");
const cancelNewTodoBtn = document.querySelector("[data-cancel-new-todo-btn]");

const locale = navigator.languages;

let weekdays = getWeekdays(locale);
let nav = 0;
let newTodo = {};

const data = {
  2025: {
    4: {
      1: [{ title: "FIRST", description: "First desc" }],
      7: [{ title: "SECOND", description: "second desc" }],
    },
  },
};

prevMonthBtn.addEventListener("click", () => load(--nav));
nextMonthBtn.addEventListener("click", () => load(++nav));
closeDialogBtn.addEventListener("click", () => {
  newTodoTitle.value = "";
  newTodoDesc.value = "";

  newTodoDialog.close();
});

saveNewTodoBtn.addEventListener("click", () => {
  newTodo.title = newTodoTitle.value;
  newTodo.desc = newTodoDesc.value;

  const json = JSON.stringify(newTodo, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${newTodo.year}.json`;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

weekdays = rotateWeekdays(getStartOfWeek(new Date()).getDay(), locale);
weekdays.forEach((weekday) => {
  const elem = document.createElement("div");
  elem.classList.add("weekday");
  elem.textContent = weekday;
  weekdaysElem.append(elem);
});

function rotateWeekdays(startDayIndex = 0) {
  return weekdays.slice(startDayIndex).concat(weekdays.slice(0, startDayIndex));
}

async function loadFile(year) {
  try {
    const response = await fetch(`./data/${year}.json`);

    if (!response.ok) {
      throw new Error(
        `Failed to load file: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err.message);
  }
}

async function load() {
  const date = new Date();
  const lang = navigator.language || "en-US";

  if (nav !== 0) {
    date.setMonth(new Date().getMonth() + nav);
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const first_day = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  currentMonthElem.textContent = date.toLocaleDateString(lang, {
    month: "long",
  });

  currentYearElem.textContent = date.toLocaleDateString(lang, {
    year: "numeric",
  });

  const paddingDays = weekdays.indexOf(
    first_day.toLocaleDateString(lang, { weekday: "long" })
  );

  const data = await loadFile(year);
  const currentMonthData = data[year][month];
  // console.log(currentMonthData);

  calendar.innerHTML = "";
  for (let i = 1; i <= paddingDays + daysInMonth; ++i) {
    const daySquare = document.createElement("div");
    daySquare.classList.add("day");
    if (i > paddingDays) {
      daySquare.textContent = i - paddingDays;
      daySquare.setAttribute("date", `${i - paddingDays}/${month}/${year}`);

      if (currentMonthData && currentMonthData[i - paddingDays]) {
        const de = document.createElement("div");
        de.classList.add("de");
        de.textContent = currentMonthData[i - paddingDays].length;
        daySquare.append(de);
        // console.log(currentMonthData[i - paddingDays].length);
      }

      if (nav === 0 && i - paddingDays === day) {
        daySquare.classList.add("currentDay");
        // console.log(i);
      }

      daySquare.addEventListener("click", (e) => {
        // console.log(e.currentTarget.getAttribute("date"));
        new Notification({
          text: e.currentTarget.getAttribute("date"),
          autoClose: 3000,
          showProgress: false,
        });

        newTodo.year = year;
        newTodo.month = month;

        newTodoDialog.showModal();
      });
    } else {
      daySquare.classList.add("pastMonth");
    }
    calendar.append(daySquare);
  }
}

function getDayData(day) {
  if (currentMonthData && currentMonthData[day]) {
    const de = document.createElement("div");
    de.classList.add("de");
    de.textContent = currentMonthData[day].length;
    daySquare.append(de);
    // console.log(currentMonthData[i - paddingDays].length);
  }
}

function getWeekdays(locale) {
  const baseDate = new Date();
  const w = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);

    const weekday = date.toLocaleDateString(locale, { weekday: "long" });
    w.push(weekday);
  }

  return w;
}

function getStartOfWeek(date) {
  const inputDate = new Date(date);
  const day = inputDate.getDay();

  const firstDay = new Intl.Locale(locale).weekInfo.firstDay;

  const diff = (day - firstDay + 7) % 7;

  inputDate.setDate(inputDate.getDate() - diff);

  return inputDate;
}

load(nav);
