const date_ui = document.querySelector(".date");
const month_ui = date_ui.querySelector("h3");
const year_ui = date_ui.querySelector("small");

const prev_month_btn = document.querySelector(".prev_month_btn");
const next_month_btn = document.querySelector(".next_month_btn");

const calendar = document.querySelector(".calendar");

const new_event_modal = document.querySelector("[new-event-modal]");
const nem_title_input = new_event_modal.querySelector("#title");
const nem_description_input = new_event_modal.querySelector("#description");
const nem_close_btn = new_event_modal.querySelector(
  "[close-new-event-modal-btn]"
);
const data_save_event_btn = new_event_modal.querySelector("[save-even-btn]");

const event_modal = document.querySelector("[event-modal]");
const event_modal_title = event_modal.querySelector("h3");
const event_modal_description = event_modal.querySelector("p");
const event_modal_close_btn = event_modal.querySelector(
  "[close-event-modal-btn]"
);
const delete_event_btn = event_modal.querySelector("[delete-event-btn]");

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
let modal_open = false;

prev_month_btn.addEventListener("click", () => goto(-1));
next_month_btn.addEventListener("click", () => goto(1));
nem_close_btn.addEventListener("click", () => close_modal(1));
event_modal_close_btn.addEventListener("click", () => close_modal(2));
data_save_event_btn.addEventListener("click", save_event);
delete_event_btn.addEventListener("click", delete_event);

document.addEventListener("keydown", (e) => {
  const tag_name = document.activeElement.tagName.toLowerCase();

  if (tag_name === "input" || tag_name === "textarea") return;
  if (modal_open) return;

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
  modal_open = false;
  switch (modal_type) {
    case 1:
      new_event_modal.close();
      new_event_modal.style.display = "none";
      nem_title_input.value = "";
      nem_description_input.value = "";
      clicked = null;
    case 2:
      event_modal.close();
      event_modal.style.display = "none";
  }
}

function save_event() {
  if (!nem_title_input.value) return;
  events.push({
    title: nem_title_input.value,
    description: nem_description_input.value,
    date: clicked,
  });
  localStorage.setItem("events", JSON.stringify(events));
  close_modal(1);
  load();
}

function delete_event() {
  events = events.filter((e) => e.date !== clicked);
  localStorage.setItem("events", JSON.stringify(events));
  close_modal(2);
  load();
}

function dragDropEvent() {
  const days = document.querySelectorAll(".canDragDrop");
  const evts = document.querySelectorAll(".event");

  let oldDate = undefined;

  evts.forEach((ev) => {
    ev.addEventListener("dragstart", (e) => {
      e.target.classList.add("dragging");
      oldDate = e.target.parentElement.getAttribute("date");
    });

    ev.addEventListener("dragend", (e) => {
      e.target.classList.remove("dragging");
      const efd = events.find((oldEvent) => oldEvent.date === oldDate);
      const newDate = e.target.parentElement.getAttribute("date");
      efd.date = newDate;
      localStorage.setItem("events", JSON.stringify(events));
      oldDate = undefined;
    });
  });

  days.forEach((day) => {
    day.addEventListener("dragover", (e) => {
      e.preventDefault();
      day.append(document.querySelector(".dragging"));
    });
  });
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

      if (i >= padding_days + day) {
        day_square.classList.add("canDragDrop");
      }

      const efd = events.find((ev) => ev.date === day_string);

      if (efd) {
        const event_square = document.createElement("div");
        event_square.classList.add("event");
        event_square.textContent =
          efd.title.length > 30 ? efd.title.slice(0, 30) + "..." : efd.title;
        day_square.append(event_square);
        event_square.draggable = true;

        event_square.addEventListener("click", () => {
          modal_open = true;
          event_modal.showModal();
          event_modal.style.display = "flex";
          clicked = day_string;
          event_modal_title.textContent = efd.title;
          event_modal_description.textContent = efd.description;
        });
      } else {
        day_square.addEventListener("click", () => {
          modal_open = true;
          new_event_modal.querySelector("h3").textContent = day_string;
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
dragDropEvent();
