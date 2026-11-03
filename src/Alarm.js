const alarmLoudSound = new Audio("./public/audio/alarm.mp3");

export default class Alarm extends HTMLElement {
  #intervalCallback;
  #intervalId = 0;

  constructor() {
    super();
    this.addEventListener("click", this);
    this.duration = 60 * 1000;
    this.#intervalCallback = () => {
      let isRinging = false;

      this.alarms.forEach((alarm) => {
        const { value } = alarm.querySelector("input");
        const date =
            new Date(value).getTime() ||
            new Date(`${new Date().toLocaleDateString()} ${value}`).getTime();

        if (date) {
          const delta = Date.now() - date;

          if (delta > 0 && delta < this.duration) {
            isRinging = true;

            if (!alarm.hasAttribute("ringing")) {
              alarm.setAttribute("ringing", "");
              this.dispatchEvent(
                  new CustomEvent("ring", { bubbles: true, detail: alarm })
              );
            }

            return;
          }
        }

        alarm.removeAttribute("ringing");
      });

      if (isRinging && alarmLoudSound.paused) {
        alarmLoudSound.currentTime = 0;
        alarmLoudSound.play();
      } else if (!isRinging) {
        alarmLoudSound.pause();
        alarmLoudSound.currentTime = 0;
      }
    };
  }

  get alarms() {
    return [...this.querySelector(".items").children];
  }

  get duration() {
    return Number(this.getAttribute("duration"));
  }

  set duration(value) {
    this.setAttribute("duration", value);
  }

  add() {
    const alarm = this.querySelector("template").content.cloneNode(true);
    this.querySelector(".items").appendChild(alarm);
  }

  connectedCallback() {
    if (!this.#intervalId) {
      this.#intervalId = setInterval(this.#intervalCallback, 1000);
    }
  }

  delete(alarm) {
    this.querySelector(".items").removeChild(alarm);
  }

  disconnectedCallback() {
    clearInterval(this.#intervalId);
  }

  handleEvent(event) {
    const { target } = event;
    const { classList } = target;
    if (classList.contains("add")) {
      this.add();
    } else if (classList.contains("delete")) {
      this.delete(this.alarms.find((alarm) => alarm.contains(target)));
    } else if (classList.contains("pause")) {
      this.pause(this.alarms.find((alarm) => alarm.contains(target)));
    } else if (classList.contains("start")) {
      this.start(this.alarms.find((alarm) => alarm.contains(target)));
    }
  }

  pause(alarm) {
    if (this.alarms.includes(alarm)) {
      alarm.setAttribute("paused", "");
    }
  }

  start(alarm) {
    if (this.alarms.includes(alarm)) {
      alarm.removeAttribute("paused");
    }
  }
}
