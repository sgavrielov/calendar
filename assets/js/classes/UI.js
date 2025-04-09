class UI {
  /**
   *
   * @param {HTMLDivElement} parent
   * @param {string[]} weekdays
   */
  static setWeekdays(weekdays) {
    const weekdaysContainer = document.querySelector("[data-weekdays]");

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
  static setViewingDate(date, locale) {
    const currentMonthElem = document.querySelector("[data-current-month]");
    const currentYearElem = document.querySelector("[data-current-year]");

    currentMonthElem.textContent = date.toLocaleDateString(locale, {
      month: "long",
    });
    currentYearElem.textContent = date.toLocaleDateString(locale, {
      year: "numeric",
    });
  }
}
