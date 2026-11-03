const base = import.meta.env.BASE_URL;
const sounds = [];

export function createSound(name, { formats = ["mp3", "ogg"] } = {}) {
    const audio = new Audio();
    const types = { ogg: 'audio/ogg; codecs="vorbis"', mp3: "audio/mpeg" };
    const fmt = formats.find((f) => audio.canPlayType(types[f]) !== "") ?? formats.at(-1);
    audio.src = `${base}audio/${name}.${fmt}`;
    audio.preload = "auto";

    // Fallback to alarm.mp3 if sound file fails to load
    audio.onerror = () => {
        if (!audio.src.endsWith("alarm.mp3")) {
            audio.src = `${base}audio/alarm.mp3`;
        }
    };

    sounds.push(audio);
    return {
        play() {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        },
        stop() {
            audio.pause();
            audio.currentTime = 0;
        },
        get paused() { return audio.paused; },
    };
}

function unlock() {
    sounds.forEach((a) => a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => {}));
    removeEventListener("pointerdown", unlock);
    removeEventListener("keydown", unlock);
}
addEventListener("pointerdown", unlock);
addEventListener("keydown", unlock);