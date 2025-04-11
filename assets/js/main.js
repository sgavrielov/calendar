const currentMonthElem = document.querySelector("[current-month]");
const currentYearElem = document.querySelector("[current-year]");
const prevMonthBtn = document.querySelector("[prev-btn]");
const nextMonthBtn = document.querySelector("[next-btn]");
const loadDataBtn = document.querySelector("[load-data-input]");
const downloadDataBtn = document.querySelector("[download-btn]");
const calendar = document.querySelector("[calendar]");

const viewDataContainer = document.querySelector("[view-data-container]");
const viewDataDate = document.querySelector("[view-data-date]");
const toggleEditDayDataBtn = document.querySelector(
  "[toggle-edit-day-data-btn]"
);
const viewDayData = document.querySelector("[day-data]");
const saveDayData = document.querySelector("[save-day-data-btn]");
const editDayData = document.querySelector("[edit-day-data]");
const closeViewDataBtn = document.querySelector("[close-view-data-btn]");
let editMode = false;
let markdownContent = `
# Hello 👋

This is a sample **README** file.
- Hello
  - World
`;

const locale = navigator.language || "en-US";

downloadDataBtn.style.display = "none";
let weekdays = initializeWeekdays(locale);
const weekends = new Intl.Locale(locale).weekInfo.weekend;
let nav = 0;
let editingData = {};
let data = {};
let editingDate = "";
viewDayData.innerHTML = marked.parse(markdownContent);

UI.setWeekdays(weekdays);
init(locale, nav);

saveDayData.addEventListener("click", (e) => {
  const [day, month, year] = editingDate.split("/");

  // For the saving part
  const json = JSON.stringify(markdownContent, null, 2);

  if (!data[year]) data[year] = {};
  if (!data[year][month]) data[year][month] = {};

  data[year][month][day] = json;

  downloadDataBtn.style.display = "block";
  console.log(data);

  new Notification({
    text: "Data has been saved",
    showProgress: false,
  });
});

downloadDataBtn.addEventListener("click", () => {
  const [day, month, year] = editingDate.split("/");
  const blob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${year}.json`;

  document.body.append(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

toggleEditDayDataBtn.addEventListener("click", () => {
  editMode = !editMode;

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

closeViewDataBtn.addEventListener("click", () => {
  markdownContent = "";
  viewDataContainer.style.display = "none";
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

  currentMonthElem.textContent = UI.getFormattedDate(date, locale).month;
  currentYearElem.textContent = UI.getFormattedDate(date, locale).year;

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDayDate = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const paddingDays = weekdays.indexOf(
    UI.getFormattedDate(firstDayDate, locale).weekday
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

        addNewDataBtn.addEventListener("click", () => {
          editingDate = `${i - paddingDays}/${month}/${year}`;
          viewDataDate.textContent = date.toLocaleDateString(locale, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          viewDataContainer.style.display = "block";
          viewDayData.style.display = "none";
          editDayData.style.display = "block";
          editDayData.value = markdownContent;
          toggleEditDayDataBtn.style.background = "hsl(210, 100%, 51%)";
        });

        daySquare.append(addNewDataBtn);
      }

      if (
        data[year] &&
        data[year][month] &&
        data[year][month][i - paddingDays]
      ) {
        const openDataDayBtn = document.createElement("button");
        openDataDayBtn.classList.add("dataDayBtn");
        openDataDayBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        openDataDayBtn.addEventListener("click", () => {
          editingDate = `${i - paddingDays}/${month}/${year}`;
          viewDataContainer.style.display = "block";
          viewDayData.style.display = "none";
          editDayData.style.display = "block";

          // editDayData.value = markdownContent;
          markdownContent = JSON.parse(data[year][month][i - paddingDays]);
          editDayData.value = markdownContent;
        });
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

    // const weekName = date.toLocaleDateString(locale, { weekday: "long" });
    const weekName = UI.getFormattedDate(date, locale).weekday;
    w.push(weekName);
  }

  return w.slice(firstDayIndex).concat(w.slice(0, firstDayIndex));
}
