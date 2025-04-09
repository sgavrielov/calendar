const prevMonthBtn = document.querySelector("[data-prev-btn]");
const nextMonthBtn = document.querySelector("[data-next-btn]");
const loadDataBtn = document.querySelector("[data-load-data-input]");
const calendar = document.querySelector("[data-calendar]");

// Dialog (new todo)
const newTodoDialog = document.querySelector("[data-new-todo]");
const closeNewTodoDialogBtn = document.querySelector(
  "[data-close-new-todo-dialog-btn]"
);
const newTodoDate = document.querySelector("[data-new-todo-date]");
const newTodoTitle = document.querySelector("[data-new-todo-title]");
const newTodoDesc = document.querySelector("[data-new-todo-desc]");
const saveNewTodoBtn = document.querySelector("[data-save-new-todo-btn]");
const cancelNewTodoBtn = document.querySelector("[data-cancel-new-todo-btn]");

const locale = navigator.language || "en-US";

let weekdays = initializeWeekdays(locale);
const weekends = new Intl.Locale(locale).weekInfo.weekend;
let nav = 0;
let newTodo = {};
let data = {};

UI.setWeekdays(weekdays);
init(locale, nav);

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

cancelNewTodoBtn.addEventListener("click", cancelNewTodo);
prevMonthBtn.addEventListener("click", () => init(locale, --nav));
nextMonthBtn.addEventListener("click", () => init(locale, ++nav));

closeNewTodoDialogBtn.addEventListener("click", cancelNewTodo);
saveNewTodoBtn.addEventListener("click", () => {
  newTodo.title = newTodoTitle.value;
  newTodo.desc = newTodoDesc.value;

  if (data[newTodo.year][newTodo.month][newTodo.day]) {
    data[newTodo.year][newTodo.month][newTodo.day].push({
      title: newTodo.title,
      desc: newTodo.desc,
    });
  } else {
    data[newTodo.year][newTodo.month][newTodo.day] = [
      { title: newTodo.title, desc: newTodo.desc },
    ];
  }

  new Notification({
    text: `${newTodo.title} has been saved!`,
    autoClose: 3000,
    showProgress: false,
  });

  console.log(data);

  // const json = JSON.stringify(data, null, 2);

  // const blob = new Blob([json], { type: "application/json" });
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // a.href = url;
  // a.download = `${newTodo.year}.json`;
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);
  // URL.revokeObjectURL(url);
});

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;

  if (e.key.toLowerCase() === "escape" && newTodoDialog.open) {
    cancelNewTodo();
    return;
  }

  switch (e.key.toLocaleLowerCase()) {
  }
});

function cancelNewTodo() {
  newTodoTitle.value = "";
  newTodoDesc.value = "";
  newTodoDialog.close();
}

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
        const createNewTodoBtn = document.createElement("button");
        createNewTodoBtn.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        createNewTodoBtn.classList.add("addNewTodoBtn");
        createNewTodoBtn.addEventListener("click", () => {
          // console.log(e.currentTarget.getAttribute("date")); // day/month/year
          newTodo.day = `${i - paddingDays}`;
          newTodo.year = year;
          newTodo.month = month;

          newTodoDate.textContent = new Date(
            year,
            month,
            i - paddingDays
          ).toLocaleDateString(locale, {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          newTodoDialog.showModal();
        });
        daySquare.append(createNewTodoBtn);
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
