import calendar from "./classes/Calendar.js";
import {
  CLOSE_VIEW_DAY_DATA_BTN,
  DELETE_DAY_DATA_BTN,
  DOWNLOAD_DATA_BTN,
  EDIT_DAY_DATA,
  EDIT_DAY_DATA_SVG,
  LOAD_DATA_INPUT,
  LOAD_DATA_LABEL,
  NEXT_MONTH_BTN,
  PREV_MONTH_BTN,
  SAVE_DAY_DATA_BTN,
  SEARCH,
  SEARCH_RESULTS_CONTAINER,
  TOGGLE_DAY_DATA_BTN,
  VIEW_DATA_DATE,
  VIEW_DATA_WRAPPER,
  VIEW_DAY_DATA,
  VIEW_DAY_DATA_SVG,
} from "./constants.js";
import { globalState } from "./globalState.js";

SEARCH.addEventListener("submit", (e) => {
  e.preventDefault();

  globalState.searchResults = searchCalendarData(
    globalState.data,
    e.target.q.value
  );

  globalState.searchResults.forEach((searchResult, i) => {
    const [year, month, day] = searchResult.date.split("/");

    const d = new Date(year, month, day).toLocaleDateString(calendar.locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const searchResultElem = document.createElement("div");
    searchResultElem.classList.add("searchResult");

    const searchResultDataElem = document.createElement("span");
    searchResultDataElem.setAttribute("date", searchResult.date);
    searchResultDataElem.textContent = d;

    searchResultDataElem.addEventListener("click", () => {
      console.log(year, month, day);
      SEARCH_RESULTS_CONTAINER.style.display = "none";
      SEARCH.q.value = "";

      VIEW_DATA_DATE.textContent = new Date(
        year,
        month,
        day
      ).toLocaleDateString(calendar.locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      SAVE_DAY_DATA_BTN.disabled = false;
      DELETE_DAY_DATA_BTN.disabled = true;
      TOGGLE_DAY_DATA_BTN.disabled = false;

      VIEW_DATA_WRAPPER.style.display = "block";
      VIEW_DAY_DATA.style.display = "block";
      EDIT_DAY_DATA.style.display = "none";

      VIEW_DAY_DATA_SVG.style.display = "none";
      EDIT_DAY_DATA_SVG.style.display = "block";

      globalState.editViewDayDataEnabled = false;
      globalState.editViewDate = `${year}/${month}/${day}`;

      globalState.markdownContent = globalState.data[year][month][day];

      VIEW_DAY_DATA.innerHTML = marked.parse(globalState.markdownContent);

      globalState.searchResults = [];
      SEARCH_RESULTS_CONTAINER.innerHTML = "";
    });

    searchResultElem.appendChild(searchResultDataElem);

    SEARCH_RESULTS_CONTAINER.appendChild(searchResultElem);
    SEARCH_RESULTS_CONTAINER.style.display = "block";
  });
});

LOAD_DATA_INPUT.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    globalState.data = JSON.parse(text);

    LOAD_DATA_LABEL.style.display = "none";
    DOWNLOAD_DATA_BTN.style.display = "none";
    SEARCH.q.disabled = false;

    calendar.render(globalState.nav);
  } catch (error) {
    new Notification({
      text: "Couldn't load a data file",
      showProgress: false,
    });
  }
});

DOWNLOAD_DATA_BTN.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(globalState.data)], {
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

PREV_MONTH_BTN.addEventListener("click", () =>
  calendar.render(--globalState.nav)
);
NEXT_MONTH_BTN.addEventListener("click", () =>
  calendar.render(++globalState.nav)
);

DELETE_DAY_DATA_BTN.addEventListener("click", (e) => {
  const [year, month, day] = globalState.editViewDate.split("/");

  if (!globalState.data?.[year]?.[month]?.[day]) {
    closeViewDayData();
  } else {
    delete globalState.data[year][month][day];
  }
  console.log(globalState.data);
});

SAVE_DAY_DATA_BTN.addEventListener("click", () => {
  const [year, month, day] = globalState.editViewDate.split("/");
  if (globalState.data?.[year]?.[month]?.[day]) {
    globalState.data[year][month][day] = globalState.markdownContent;
  } else {
    if (!globalState.data[year]) globalState.data[year] = {};
    if (!globalState.data[year][month]) globalState.data[year][month] = {};

    globalState.data[year][month][day] = globalState.markdownContent;
  }
  LOAD_DATA_LABEL.style.display = "none";
  DOWNLOAD_DATA_BTN.style.display = "flex";
  SEARCH.q.disabled = false;

  closeViewDayData();

  calendar.render(globalState.nav);
});

TOGGLE_DAY_DATA_BTN.addEventListener("click", () => {
  globalState.editViewDayDataEnabled = !globalState.editViewDayDataEnabled;

  if (globalState.editViewDayDataEnabled) {
    VIEW_DAY_DATA_SVG.style.display = "block";
    EDIT_DAY_DATA_SVG.style.display = "none";

    EDIT_DAY_DATA.style.display = "block";
    VIEW_DAY_DATA.style.display = "none";

    EDIT_DAY_DATA.value =
      globalState.markdownContent === ""
        ? JSON.parse(globalState.data[year][month][day])
        : globalState.markdownContent;
  } else {
    VIEW_DAY_DATA_SVG.style.display = "none";
    EDIT_DAY_DATA_SVG.style.display = "block";

    EDIT_DAY_DATA.style.display = "none";
    VIEW_DAY_DATA.style.display = "block";

    VIEW_DAY_DATA.innerHTML = marked.parse(globalState.markdownContent);
  }
});

CLOSE_VIEW_DAY_DATA_BTN.addEventListener("click", () => closeViewDayData());

EDIT_DAY_DATA.addEventListener("input", (e) => {
  globalState.markdownContent = e.target.value;

  if (globalState.markdownContent.length === 0) {
    DELETE_DAY_DATA_BTN.disabled = true;
    SAVE_DAY_DATA_BTN.disabled = true;
    TOGGLE_DAY_DATA_BTN.disabled = true;
  } else {
    DELETE_DAY_DATA_BTN.disabled = false;
    SAVE_DAY_DATA_BTN.disabled = false;
    TOGGLE_DAY_DATA_BTN.disabled = false;
  }
});

EDIT_DAY_DATA.addEventListener("keydown", function (e) {
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

function closeViewDayData() {
  VIEW_DATA_WRAPPER.style.display = "none";
  EDIT_DAY_DATA.value = "";
  globalState.editViewDayDataEnabled = false;
}

function searchCalendarData(data, keyword) {
  const result = [];
  for (const year in data) {
    for (const month in data[year]) {
      for (const day in data[year][month]) {
        const text = globalState.data[year][month][day];

        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          result.push({
            date: `${year}/${month}/${day}`,
            context: text,
          });
        }
      }
    }
  }
  return result;
}
