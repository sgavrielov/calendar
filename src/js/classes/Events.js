class Events {
  #callbacks = [];

  emit(eventName, payload) {
    this.#callbacks.forEach((stored) => {
      if (stored.eventName === eventName) {
        stored.callback(payload);
      }
    });
  }

  on(eventName, caller, callback) {
    const existing = this.#callbacks.find(
      (stored) => stored.eventName === eventName && stored.caller === caller
    );

    if (existing) {
      existing.callback = callback;
      return existing.callback;
    }

    this.#callbacks.push({ eventName, caller, callback });
  }

  off(eventName) {
    this.#callbacks = this.#callbacks.filter(
      (stored) => stored.eventName !== eventName
    );
  }

  unsubscribe(caller) {
    this.#callbacks = this.#callbacks.filter(
      (stored) => stored.caller !== caller
    );
  }
}

const events = new Events();
export default events;
