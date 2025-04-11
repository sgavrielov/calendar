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
}
