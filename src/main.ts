interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  date: string;
}

const dateUI = document.querySelector(".dateUI");

const prevMonthBtn = document.querySelector(".prevMonthBtn");
const nextMonthBtn = document.querySelector(".nextMonthBtn");

const calendar = document.querySelector(".calendar");

const dialog = document.querySelector("dialog");
const dateInput = dialog?.querySelector(".dateInput");
const titleInput = dialog?.querySelector(".titleInput");
const descriptionInput = dialog?.querySelector(".descriptionInput");
const closeDialogBtn = dialog?.querySelector(".closeDialogBtn");
const addAndUpdateBtn = dialog?.querySelector(".addAndUpdateBtn");
const cancelAndDeleteBtn = dialog?.querySelector(".cancelAndDeleteBtn");

const weekdays: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let nav = 0;
let clicked: null | string = null;
let eventOpend: null | number = null;
let dialogOpen = false;
let events: object[] = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events") || "{}")
  : [];

prevMonthBtn?.addEventListener("click", (): void => goto(-1));
nextMonthBtn?.addEventListener("click", (): void => goto(1));
closeDialogBtn?.addEventListener("click", closeDialog);
addAndUpdateBtn?.addEventListener("click", addAndUpdateEvent);

document.addEventListener("keydown", (e) => {
  const tag_name = document.activeElement?.tagName.toLowerCase();

  if (tag_name === "input" || tag_name === "textarea") return;
  if (dialogOpen) return;

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

function goto(n: number) {
  nav += n;
  load();
}

function closeDialog() {
  (dateInput as HTMLInputElement).value = "";
  (titleInput as HTMLInputElement).value = "";
  (descriptionInput as HTMLTextAreaElement).value = "";
  addAndUpdateBtn!.textContent = "ADD";
  cancelAndDeleteBtn!.textContent = "CANCEL";
  dialogOpen = false;
  clicked = null;
  eventOpend = null;
  dialog?.close();
}

function deleteEvent() {
  events = events.filter((e) => (e as CalendarEvent).date !== clicked);
  localStorage.setItem("events", JSON.stringify(events));
  closeDialog();
  load();
}

function addAndUpdateEvent() {
  if (!(titleInput as HTMLInputElement).value.trim()) return;
  if (eventOpend !== null) {
    const updateMe = events.find((e) => {
      if ("id" in e) {
        return e.id === eventOpend;
      }
    });
    if (updateMe) {
      (updateMe as CalendarEvent).date =
        (dateInput as HTMLInputElement).value ||
        (updateMe as CalendarEvent).date;
      (updateMe as CalendarEvent).title = (
        titleInput as HTMLInputElement
      ).value;
      (updateMe as CalendarEvent).description = (
        descriptionInput as HTMLTextAreaElement
      ).value;
    }
  } else {
    const newEvent: CalendarEvent = {
      id: new Date().getTime(),
      title: (titleInput as HTMLInputElement).value,
      description: (descriptionInput as HTMLTextAreaElement).value,
      date: clicked!,
    };
    events.push(newEvent);
  }

  cancelAndDeleteBtn?.removeEventListener("click", closeDialog);
  localStorage.setItem("events", JSON.stringify(events));
  closeDialog();
  load();
}

function load() {
  const today = new Date();

  if (nav !== 0) {
    today.setMonth(new Date().getMonth() + nav);
  }

  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const firstDay = new Date(year, month, 1).toLocaleDateString("en-US", {
    weekday: "long",
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const paddingDays = weekdays.indexOf(firstDay);

  calendar!.innerHTML = "";
  for (let i = 1; i <= paddingDays + daysInMonth; i += 1) {
    const daySquare = document.createElement("div");
    daySquare.classList.add("day");

    if (i > paddingDays) {
      const dayNumber = document.createElement("p");
      dayNumber.classList.add("dayNumber");
      dayNumber.textContent = `${i - paddingDays}`;
      daySquare.append(dayNumber);

      const dateString = dateFormat(
        new Date(year, month, i - paddingDays).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      );
      daySquare.setAttribute("date", dateString!);

      events.forEach((ev) => {
        if ((ev as CalendarEvent).date === dateString) {
          const eventSquare = document.createElement("div");
          eventSquare.classList.add("event");
          eventSquare.setAttribute("date", (ev as CalendarEvent).date);
          eventSquare.draggable = true;
          eventSquare.textContent = (ev as CalendarEvent).title;
          daySquare.append(eventSquare);

          const eventId = document.createElement("input");
          eventId.type = "number";
          eventId.id = "eventID";
          eventId.setAttribute("value", `${(ev as CalendarEvent).id}`);
          eventId.value = "";
          eventId.hidden = true;
          eventSquare.append(eventId);

          const eventDesc = document.createElement("input");
          eventDesc.id = "eventDesc";
          eventDesc.type = "text";
          eventDesc.setAttribute(
            "value",
            `${(ev as CalendarEvent).description}`
          );
          eventDesc.value = (ev as CalendarEvent).description!;
          eventDesc.hidden = true;
          eventSquare.append(eventDesc);
        }
      });

      if ((nav <= 0 && i - paddingDays < day) || nav < 0) {
        daySquare.classList.add("passedDay");
      }

      if ((nav === 0 && i - paddingDays >= day) || nav > 0) {
        daySquare.classList.add("futureDay");
        if (i - paddingDays === day && nav === 0) {
          daySquare.classList.add("currentDay");
        }
      }
    } else {
      daySquare.classList.add("pastMonth");
    }

    calendar?.append(daySquare);
  }

  dateUI!.textContent = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const futureDays = document.querySelectorAll(".futureDay");
  const eventsUI = document.querySelectorAll(".event");

  futureDays.forEach((futureDay) => {
    futureDay.addEventListener("click", (e) => {
      dialogOpen = true;
      const target = e.target as HTMLDivElement;
      const dateClicked = target.getAttribute("date");
      clicked = dateClicked;

      (dateInput as HTMLInputElement).value = dateClicked!;
      cancelAndDeleteBtn?.addEventListener("click", closeDialog);
      dialog?.showModal();
    });
  });

  eventsUI.forEach((event) => {
    event.addEventListener("click", (e) => {
      const target = e.target as HTMLDivElement;

      const eventID = target.querySelector("#eventID");
      const eventDesc = target.querySelector("#eventDesc");

      dialogOpen = true;
      clicked = target.parentElement!.getAttribute("date");
      eventOpend = Number((eventID as HTMLInputElement).getAttribute("value"));

      (dateInput as HTMLInputElement).value =
        target.parentElement!.getAttribute("date")!;
      (titleInput as HTMLInputElement).value = target.textContent!;
      (descriptionInput as HTMLTextAreaElement).value = (
        eventDesc as HTMLInputElement
      ).value;

      addAndUpdateBtn!.textContent = "UPDATE";
      cancelAndDeleteBtn!.textContent = "DELETE";

      cancelAndDeleteBtn?.addEventListener("click", deleteEvent);
      dialog?.showModal();
    });
  });

  /* Drag & Drop */
  eventsUI.forEach((eve) => {
    eve.addEventListener("dragstart", (e) => {
      const target = e.target as HTMLDivElement;
      target.classList.add("dragging");
      futureDays.forEach((futureDay) => {
        futureDay.classList.add("canDragDrop");
        (futureDay as HTMLDivElement).style.transition = "all 300ms linear";
      });
    });

    eve.addEventListener("dragend", (e) => {
      const target = e.target as HTMLDivElement;
      const targetID = target.querySelector("#eventID");
      target.classList.remove("dragging");

      const updateMe = events.find((e) => {
        if ("id" in e) {
          return e.id == targetID?.getAttribute("value");
        }
      });
      const newDate = target.parentElement?.getAttribute("date");
      (updateMe as CalendarEvent).date = newDate!;
      localStorage.setItem("events", JSON.stringify(events));

      futureDays.forEach((futureDay) => {
        futureDay.classList.remove("canDragDrop");
      });
      load();
    });
  });

  futureDays.forEach((futureDay) => {
    futureDay.addEventListener("dragover", (e) => {
      e.preventDefault();
      const target = e.target as HTMLDivElement;

      if (target.classList.contains("day")) {
        target.append(document.querySelector(".dragging") as HTMLDivElement);
      }
    });
  });
  /* Drag & Drop */
}

load();
