class Events {
  #callbacks = [];
  #nextId = 0;
  async emit(eventName, payload) {
    const listeners = this.#callbacks.filter(
      (cb) => cb.eventName === eventName
    );

    await Promise.all(
      listeners.map((cb) => {
        try {
          return cb.callback(payload);
        } catch (error) {
          console.error(`Error in listener for ${eventName}:`, error);
        }
      })
    );
  }

  async on(eventName, caller, callback) {
    const existing = this.#callbacks.find(
      (stored) => stored.eventName === eventName && stored.caller === caller
    );

    if (existing) {
      existing.callback = callback;
      return existing.id;
    }

    const newId = ++this.#nextId;
    this.#callbacks.push({ id: newId, eventName, caller, callback });
    return newId;
  }

  off(id) {
    this.#callbacks = this.#callbacks.filter((cb) => cb.id !== id);
  }

  unsubscribe(caller) {
    this.#callbacks = this.#callbacks.filter((cb) => cb.caller !== caller);
  }
}

const events = new Events();
