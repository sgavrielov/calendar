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
const deleteDayDataBtn = document.querySelector("[delete-day-data-btn]");
const saveDayDataBtn = document.querySelector("[save-day-data-btn]");
const editDayData = document.querySelector("[edit-day-data]");
const closeViewDataBtn = document.querySelector("[close-view-data-btn]");

const locale = navigator.language || "en-US";
const weekends = new Intl.Locale(locale).weekInfo.weekend;

let weekdays = initializeWeekdays(locale);
let editMode = false;
let markdownContent = "";
let nav = 0;
let data = {};
let editingDate = "";
let newDayData = false;

downloadDataBtn.style.display = "none";
deleteDayDataBtn.style.display = "none"; // should be visible only if there is data file
UI.setWeekdays(weekdays);
init(locale, nav);

events.on("VIEW_DAY_DATA", viewDayData, (date) => {
  editMode = false;
  viewDataContainer.style.display = "block";
  editDayData.style.display = "none";
  viewDayData.style.display = "block";
  toggleEditDayDataBtn.style.background = "hsl(0, 0%, 5%)";

  const [year, month, day] = date.split("/");
  editingDate = date;

  if (markdownContent !== "" || newDayData) {
    viewDayData.innerHTML = marked.parse(markdownContent);
  } else {
    deleteDayDataBtn.style.display = "flex";
    viewDayData.innerHTML = marked.parse(JSON.parse(data[year][month][day]));
  }
});

events.on("EDIT_DAY_DATA", viewDayData, (date) => {
  editMode = true;
  viewDataContainer.style.display = "block";
  editDayData.style.display = "block";
  viewDayData.style.display = "none";
  toggleEditDayDataBtn.style.background = "hsl(210, 100%, 51%)";

  if (newDayData) {
    editDayData.value = markdownContent;
  } else {
    const [year, month, day] = date.split("/");
    editingDate = date;
    deleteDayDataBtn.style.display = "flex";
    // editDayData.value = JSON.parse(data[year][month][day]);
    editDayData.value =
      markdownContent === ""
        ? JSON.parse(data[year][month][day])
        : markdownContent;
  }
});

events.on("NEW_DAY_DATA", viewDayData, (date) => {
  newDayData = true;
  editMode = true;
  viewDataContainer.style.display = "block";
  editDayData.style.display = "block";
  viewDayData.style.display = "none";
  toggleEditDayDataBtn.style.background = "hsl(210, 100%, 51%)";

  editingDate = date;
});

events.on("CLOSE_DAY_DATA", closeViewDataBtn, () => {
  markdownContent = "";
  editingDate = "";
  editDayData.value = "";
  newDayData = false;

  viewDataContainer.style.display = "none";
  deleteDayDataBtn.style.display = "none";
});

events.on("SAVE_DAY_DATA", saveDayDataBtn, () => {
  const [year, month, day] = editingDate.split("/");

  // For the saving part
  const json = JSON.stringify(markdownContent, null, 2);

  if (!data[year]) data[year] = {};
  if (!data[year][month]) data[year][month] = {};

  data[year][month][day] = json;

  downloadDataBtn.style.display = "block";

  new Notification({
    text: "Data has been saved",
    showProgress: false,
  });

  init(locale, nav);
});

events.on("DELETE_DAY_DATA", deleteDayDataBtn, () => {
  const [year, month, day] = editingDate.split("/");
  delete data[year][month][day];

  new Notification({
    text: "Data has been deleted successfully",
    showProgress: false,
  });

  events.emit("CLOSE_DAY_DATA");
  downloadDataBtn.style.display = "block";
  init(locale, nav);
});

deleteDayDataBtn.addEventListener("click", () => {
  events.emit("DELETE_DAY_DATA");
});

saveDayDataBtn.addEventListener("click", (e) => {
  events.emit("SAVE_DAY_DATA", "");
});

downloadDataBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";

  document.body.append(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

toggleEditDayDataBtn.addEventListener("click", () => {
  editMode = !editMode;

  if (editMode) {
    events.emit("EDIT_DAY_DATA", editingDate);
  } else {
    events.emit("VIEW_DAY_DATA", editingDate);
  }
});

editDayData.addEventListener("input", (e) => {
  markdownContent = e.target.value;
});

editDayData.addEventListener("keydown", function (e) {
  if (e.key.toLowerCase() === "tab") {
    e.preventDefault();

    const start = this.selectionStart;
    const end = this.selectionEnd;

    const tab = "\t";

    this.value =
      this.value.substring(0, start) + tab + this.value.substring(end);
    this.selectionStart = this.selectionEnd;
  }
});

closeViewDataBtn.addEventListener("click", () => {
  events.emit("CLOSE_DAY_DATA", "");
});

loadDataBtn.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    data = JSON.parse(text);

    init(locale, nav);
  } catch (error) {
    new Notification({
      text: "Couldn't load a data file",
      showProgress: false,
    });
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

  prevMonthBtn.textContent = UI.getMonthName(locale, month - 1);
  nextMonthBtn.textContent = UI.getMonthName(locale, month + 1);

  calendar.innerHTML = "";
  for (let i = 1; i <= paddingDays + daysInMonth; ++i) {
    if (i > paddingDays) {
      let hasData =
        Object.keys(data).length !== 0 &&
        data[year] &&
        data[year][month] &&
        data[year][month][i - paddingDays];

      UI.setDaySquare(calendar, {
        date: `${year}/${month}/${i - paddingDays}`,
        pastDays: nav < 0 || (nav <= 0 && i - paddingDays < day),
        weekend: weekends.includes(((i - 1) % 7) + 1),
        currentDay: nav === 0 && i - paddingDays === day,
        containDataFile: hasData ? data[year][month][i - paddingDays] : false,
      });
    } else {
      UI.setDaySquare(calendar, { classes: "pastMonth" });
    }
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
