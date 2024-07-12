const date_ui = document.querySelector(".date");
const month_ui = date_ui.querySelector("h3");
const year_ui = date_ui.querySelector("small");
const prev_month_btn = document.querySelector(".prev_month_btn");
const next_month_btn = document.querySelector(".next_month_btn");
const calendar = document.querySelector(".calendar");
const new_event_modal = document.querySelector("[new-event-modal]");
const event_modal = document.querySelector("[event-modal]");
const event_modal_title = event_modal.querySelector("h3");
const event_modal_description = event_modal.querySelector("p");
const title = document.querySelector("#title");
const description = document.querySelector("#description");
const data_close_new_event_modal_btn = document.querySelector(
  "[data-close-new-event-modal-btn]"
);
const data_close_event_modal_btn = document.querySelector(
  "[data-close-event-modal-btn]"
);
const data_save_event_btn = document.querySelector("[data-save-even-btn]");
const delete_event_btn = document.querySelector("[delete-event-btn]");
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let nav = 0;
let clicked = null;
let events = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : [];

prev_month_btn.addEventListener("click", () => goto(-1));
next_month_btn.addEventListener("click", () => goto(1));
data_close_new_event_modal_btn.addEventListener("click", () => close_modal(1));
data_close_event_modal_btn.addEventListener("click", () => close_modal(2));
data_save_event_btn.addEventListener("click", save_event);
delete_event_btn.addEventListener("click", () => {
  events = events.filter((e) => e.date !== clicked);
  localStorage.setItem("events", JSON.stringify(events));
  close_modal(2);
  load();
});

document.addEventListener("keydown", (e) => {
  const tagName = document.activeElement.tagName.toLowerCase();

  if (tagName === "input") return;

  switch (e.key.toLowerCase()) {
    case "k":
      nav = 0;
      load();
      break;
    case "arrowleft":
    case "j":
      goto(-1);
      break;
    case "arrowright":
    case "l":
      goto(1);
      break;
  }
});

function goto(n) {
  nav += n;
  load();
}

function close_modal(modal_type) {
  switch (modal_type) {
    case 1:
      new_event_modal.close();
      new_event_modal.style.display = "none";
      title.value = "";
      description.value = "";
      clicked = null;
    case 2:
      event_modal.close();
      event_modal.style.display = "none";
  }
}

function save_event() {
  if (!title.value) return;
  events.push({
    title: title.value,
    description: description.value,
    date: clicked,
  });
  localStorage.setItem("events", JSON.stringify(events));
  close_modal(1);
  load();
}

function load() {
  const date = new Date();

  if (nav !== 0) {
    date.setMonth(new Date().getMonth() + nav);
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const first_day = new Date(year, month, 1);
  const days_in_month = new Date(year, month + 1, 0).getDate();

  const date_string = first_day.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const padding_days = weekdays.indexOf(date_string.split(", ")[0]);

  calendar.innerHTML = "";
  for (let i = 1; i <= padding_days + days_in_month; i++) {
    const day_square = document.createElement("div");
    day_square.classList.add("day");

    if (i > padding_days) {
      day_square.textContent = i - padding_days;
      const day_string = `${month + 1}/${i - padding_days}/${year}`;
      day_square.setAttribute("date", day_string);

      const efd = events.find((ev) => ev.date === day_string);

      if (efd) {
        const event_square = document.createElement("div");
        event_square.classList.add("event");
        event_square.textContent =
          efd.title.length > 30 ? efd.title.slice(0, 30) + "..." : efd.title;
        day_square.append(event_square);

        event_square.addEventListener("click", () => {
          event_modal.showModal();
          event_modal.style.display = "flex";
          clicked = day_string;
          event_modal_title.textContent = efd.title;
          event_modal_description.textContent = efd.description;
        });
      } else {
        day_square.addEventListener("click", (e) => {
          new_event_modal.querySelector("h3").textContent = `${month + 1}/${
            i - padding_days
          }/${year}`;
          clicked = day_string;
          new_event_modal.showModal();
          new_event_modal.style.display = "flex";
        });
      }

      if (i - padding_days === day && nav === 0) {
        day_square.classList.add("current_day");
      }
    } else {
      day_square.classList.replace("day", "padding_day");
    }

    calendar.append(day_square);
  }

  month_ui.textContent = date.toLocaleDateString(undefined, {
    month: "long",
  });
  year_ui.textContent = year;
}

load();
