const prevMonthBtn = document.querySelector("[prev-btn]");
const nextMonthBtn = document.querySelector("[next-btn]");
const loadDataBtn = document.querySelector("[load-data-input]");
const calendar = document.querySelector("[calendar]");

const toggleEditDayDataBtn = document.querySelector(
  "[toggle-edit-day-data-btn]"
);
const viewDayData = document.querySelector("[day-data]");
const editDayData = document.querySelector("[edit-day-data]");
let editMode = false;
let markdownContent = `
# Hello 👋

This is a sample **README** file.
- Hello
  - World
`;

const locale = navigator.language || "en-US";

let weekdays = initializeWeekdays(locale);
const weekends = new Intl.Locale(locale).weekInfo.weekend;
let nav = 0;
let newTodo = {};
let data = {};
viewDayData.innerHTML = marked.parse(markdownContent);

UI.setWeekdays(weekdays);
init(locale, nav);

toggleEditDayDataBtn.addEventListener("click", () => {
  editMode = !editMode;
  console.log(editMode);

  if (editMode) {
    viewDayData.style.display = "none";
    editDayData.style.display = "block";
    editDayData.value = markdownContent;
    toggleEditDayDataBtn.style.background = "hsl(210, 100%, 51%)";
  } else {
    viewDayData.innerHTML = marked.parse(markdownContent);
    viewDayData.style.display = "block";
    editDayData.style.display = "none";
    toggleEditDayDataBtn.style.background = "hsl(0, 0%, 5%)";
  }
});

editDayData.addEventListener("input", (e) => {
  markdownContent = e.target.value;
});

loadDataBtn.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    data = JSON.parse(text);

    init(locale, nav);
  } catch (error) {
    console.log("ERROR");
  }
});

prevMonthBtn.addEventListener("click", () => init(locale, --nav));
nextMonthBtn.addEventListener("click", () => init(locale, ++nav));

function init(locale, nav) {
  const date = new Date();

  if (nav !== 0) {
    date.setMonth(new Date().getMonth() + nav);
  }

  UI.setViewingDate(date, locale);

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const paddingDays = weekdays.indexOf(
    firstDay.toLocaleDateString(locale, { weekday: "long" })
  );

  calendar.innerHTML = "";
  for (let i = 1; i <= paddingDays + daysInMonth; ++i) {
    const daySquare = document.createElement("div");
    daySquare.classList.add("day");
    if (i > paddingDays) {
      daySquare.textContent = i - paddingDays;
      daySquare.setAttribute("date", `${i - paddingDays}/${month}/${year}`);

      if (nav < 0 || (nav <= 0 && i - paddingDays < day)) {
        daySquare.classList.add("pastMonth");
      } else {
        const addNewDataBtn = document.createElement("button");
        addNewDataBtn.classList.add("addNewDataBtn");
        addNewDataBtn.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        daySquare.append(addNewDataBtn);
      }

      if (
        data[year] &&
        data[year][month] &&
        data[year][month][i - paddingDays]
      ) {
        const openDataDayBtn = document.createElement("button");
        openDataDayBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        daySquare.append(openDataDayBtn);
      }

      const w = ((i - 1) % 7) + 1;
      if (weekends.includes(w)) {
        daySquare.classList.add("weekend");
      }

      if (nav === 0 && i - paddingDays === day) {
        daySquare.classList.add("currentDay");
      }
    } else {
      daySquare.classList.add("pastMonth");
    }
    calendar.append(daySquare);
  }
}

function initializeWeekdays(locale = navigator.language) {
  const firstDayIndex = new Intl.Locale(locale).weekInfo.firstDay;
  const w = [];

  for (let i = 0; i < 7; ++i) {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay() + i);

    const weekName = date.toLocaleDateString(locale, { weekday: "long" });
    w.push(weekName);
  }

  return w.slice(firstDayIndex).concat(w.slice(0, firstDayIndex));
}
