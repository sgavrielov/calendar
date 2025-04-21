class UI {
  /**
   *
   * @param {HTMLDivElement} parent
   * @param {string[]} weekdays
   */
  static setWeekdays(weekdays) {
    const weekdaysContainer = document.querySelector("[weekdays]");

    weekdays.forEach((weekday) => {
      const weekdayElement = document.createElement("div");
      weekdayElement.classList.add("weekday");
      weekdayElement.textContent = weekday;
      weekdaysContainer.appendChild(weekdayElement);
    });
  }

  /**
   *
   * @param {Date} date
   * @param {string} locale
   */
  static getFormattedDate(date, locale) {
    const d = {};

    d.weekday = date.toLocaleDateString(locale, {
      weekday: "long",
    });
    d.day = date.toLocaleDateString(locale, {
      day: "numeric",
    });
    d.month = date.toLocaleDateString(locale, {
      month: "long",
    });
    d.year = date.toLocaleDateString(locale, {
      year: "numeric",
    });

    return d;
  }

  /**
   * Creates and appends a day square element to the given calendar container.
   *
   * @param {HTMLElement} calendar - The parent calendar element where the day square will be appended.
   * @param {Object} [options={}] - Configuration object for the day square.
   * @param {string} [options.date=""] - A date string in the format "YYYY/MM/DD". If provided, it sets the label and a `date` attribute.
   * @param {string} [options.classes] - Additional CSS classes to apply to the day square.
   * @param {boolean} [options.pastDays=true] - Whether to mark the day as a past day (applies 'pastDays' class).
   * @param {boolean} [options.weekend=false] - Whether to mark the day as part of a past month (applies 'pastMonth' class).
   * @param {boolean} [options.currentDay=false] - Whether to mark the day as the current day (applies 'currentDay' class).
   * @param {boolean|string} [options.containDataFile=false] - If truthy, adds a button indicating a data file exists for this day. Can also be a string representing the file name or status.
   * @param {boolean|string} [options.searched=false]
   */
  static setDaySquare(
    calendar,
    {
      date = "",
      classes,
      pastDays = true,
      weekend = false,
      currentDay = false,
      containDataFile = false,
      searched = false,
    } = {}
  ) {
    const daySquare = document.createElement("div");
    daySquare.classList = classes ? `day ${classes}` : "day";

    if (searched) {
      daySquare.style.border = "1px solid #27ae60";
    }

    if (pastDays) {
      daySquare.classList.add("pastDays");
    }

    if (weekend) {
      daySquare.classList.add("weekend");
    }

    if (currentDay) {
      daySquare.classList.add("currentDay");
    }

    if (date) {
      const [year, month, day] = date.split("/");
      const label = document.createElement("label");
      label.textContent = day;
      daySquare.appendChild(label);
      daySquare.setAttribute("date", `${year}/${month}/${day}`);
    }

    if (
      !containDataFile &&
      !daySquare.classList.contains("pastMonth") &&
      !daySquare.classList.contains("pastDays")
    ) {
      const addNewDataBtn = document.createElement("button");
      addNewDataBtn.classList.add("addNewDataBtn");
      addNewDataBtn.innerHTML = `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

      addNewDataBtn.addEventListener("click", () => {
        const viewDataDate = document.querySelector("[view-data-date]");
        const [year, month, day] = daySquare.getAttribute("date").split("/");
        viewDataDate.textContent = new Date(
          year,
          month,
          day
        ).toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        events.emit("NEW_DAY_DATA", daySquare.getAttribute("date"));
      });

      daySquare.append(addNewDataBtn);
    } else {
      if (containDataFile) {
        const openDataDayBtn = document.createElement("button");
        openDataDayBtn.classList.add("dataDayBtn");
        openDataDayBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

        openDataDayBtn.addEventListener("click", () => {
          const viewDataDate = document.querySelector("[view-data-date]");
          const [year, month, day] = daySquare.getAttribute("date").split("/");
          viewDataDate.textContent = new Date(
            year,
            month,
            day
          ).toLocaleDateString(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          events.emit("VIEW_DAY_DATA", daySquare.getAttribute("date"));
        });
        daySquare.append(openDataDayBtn);
      }
    }

    calendar.append(daySquare);
  }

  static getMonthName(locale, monthNumber) {
    const d = new Date();
    d.setMonth(monthNumber);
    return d.toLocaleDateString(locale, {
      month: "long",
    });
  }
}
