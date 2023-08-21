
var isPlay = 0;
const notPlay = 0;
const Playing = 1;
const clickedColor = "yellow";
const unclickedColor = "gray"

const getDrumType = (drumType = "heater1") => {
    let output = {
        displayStr: "nothing",
    }
    switch (drumType) {
        case "heater1":
            output.displayStr = "Heater 1";
            break;
        case "heater2":
            output.displayStr = "Heater 2";
            break;
        case "heater3":
            output.displayStr = "Heater 3";
            break;
        case "heater4":
            output.displayStr = "Heater 4";
            break;
        case "clap":
            output.displayStr = "Clap";
            break;
        case "openHH":
            output.displayStr = "Open-HH";
            break;
        case "kickNHat":
            output.displayStr = "Kick-n'-Hat";
            break;
        case "kick":
            output.displayStr = "Kick";
            break;
        case "closedHH":
            output.displayStr = "Closed-HH";
            break;
    }

    return output;
}

function handleAudio (drumType) {
    if (isPlay == Playing) {
        return;
    }
    isPlay = Playing;
    $(`#${drumType}`).attr("style", `background-color: ${clickedColor}`);
    const audioURL = $(`#${drumType}`).children("audio").attr("src");
    let info = getDrumType(drumType);

    $("#display").text(info.displayStr)
    let audio = new Audio(audioURL)
    audio.addEventListener (
        "ended",
        () => {
            $(`#${drumType}`).attr("style", `background-color: ${unclickedColor}`);
            isPlay = notPlay;
        }
    )
    audio.play()
}