let breakLength = 5;
let sessionLength = 25;
const breakLengthDefault = 5;
const sessionLengthDefault = 25;

let timerSeconds = 0;

const initState = 0;
const sessionState = 1;
const breakState = 2;
const stopState = 3;
let timerState = initState;

let pTimer = null;


const updateSession = () => {
    $("#session-length").text(sessionLength)
    $("#break-length").text(breakLength)
}

const updateTimer = (seconds) => {
    const sec = ("000" + (seconds % 60)).slice(-2);
    const min = (seconds - sec) / 60;
    if (seconds < 60) {
        $(".display-timer").attr("style", "color: red")
    } else {
        $(".display-timer").attr("style", "color: white")
    }
    $("#time-left").text(min + ":" + sec);
}

const setSession = (state) => {
    // do nothing when timer is running
    if (timerState == sessionState ||
        timerState == breakState) {
            return;
        }
    let tmp = 0;
    switch (state) {
        case '+':
            if (sessionLength >= 60) {
                return;
            }
            tmp = 1;
            break;
        case '-':
            if (sessionLength <= 1) {
                return;
            }
            tmp = -1;
            break;
        default:
            return;
            break;
    }

    sessionLength += tmp;
    updateSession ();

    timerSeconds = sessionLength * 60;
    updateTimer (timerSeconds);
}

const warnTimeout = () => {
    const audioURL = $("#beep").attr("src");
    const audio = new Audio(audioURL);
    audio.addEventListener (
        "ended",
        () => {
            switch (timerState) {
                case sessionState:
                    runClock("break");
                    break;
                case breakState:
                    runClock("session");
                    break;
            }
        }
    )
    audio.play();
}

const updateRemainTime = () => {
    if (timerSeconds == 0) {
        clearInterval (pTimer)
        pTimer = null;

        warnTimeout ();
        return ;
    }

    timerSeconds--;
    updateTimer(timerSeconds);
    return;
}

const pauseClock = () => {
    if (pTimer !== null) {
        clearInterval (pTimer);
        pTimer = null;
    } else {
        runClock("resume")
    }
}

const runClock = (clockType) => {
    if (pTimer !== null) {
        return;
    }

    switch (clockType) {
        case "session":
            timerSeconds = sessionLength * 60;
            timerState = sessionState;
            $("#timer-label").text("Session");
            updateTimer(timerSeconds);
            break;
        case "break":
            timerSeconds = breakLength * 60;
            timerState = breakState;
            $("#timer-label").text("Break");
            updateTimer(timerSeconds);
            break;
        case "resume":
            break;
        default:
            timerSeconds = sessionLength * 60;
            timerState = sessionState;
            $("#timer-label").text("Session");
            break;
    }
    pTimer = setInterval(updateRemainTime, 1000);
    return;
}

const setBreak = (state) => {
    // do nothing when timer is running
    if (timerState == sessionState ||
        timerState == breakState) {
            return;
        }
    let tmp = 0;
    switch (state) {
        case '+':
            if (breakLength >= 60) {
                return;
            }
            tmp = 1;
            break;
        case '-':
            if (breakLength <= 1) {
                return;
            }
            tmp = -1;
            break;
        default:
            return ;
            break;
    }

    breakLength += tmp;
    updateSession ();
}

const reset = () => {
    if (pTimer !== null) {
        clearInterval(pTimer)
        pTimer = null;
    }

    sessionLength = sessionLengthDefault;
    breakLength = breakLengthDefault;
    updateSession ();

    timerSeconds = sessionLength * 60;
    updateTimer (timerSeconds);

    timerState = initState;
}

$(document).ready(function() {
    updateSession();

    timerSeconds = sessionLength * 60;
    updateTimer (timerSeconds);

    timerState = initState;
});