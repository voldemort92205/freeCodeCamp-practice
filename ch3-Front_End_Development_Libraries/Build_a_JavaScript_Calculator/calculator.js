let currentVal = "";
let accuVal = "";
let dotAppear = false;

const valType = 1;
const operatorType = 2;
const initType = 0;
let currentType = initType;

const nElement = -20;

const updateScreen = () => {
    
    $("#display-button").text(currentVal.slice(nElement))
    $("#display").text(accuVal.slice(nElement))
}

const insertVal = (val = "0") => {
    switch (val) {
        case ".":
            if (dotAppear) {
                return;
            }
            dotAppear = true;
            break;
        default:
            break;
    }

    if (currentType == valType) {
        currentVal += val;
    } else {
        currentVal = val;
    }
    accuVal += val;
    currentType = valType;
    updateScreen()
}

const updateOperator = (operator) => {
    currentVal = operator;
    accuVal = accuVal.slice(0, -1) + operator;
    updateScreen();
}

const insertOperator = (operator) => {
    if (operator == undefined){
        return;
    } else if (operator != "-" && accuVal == "") {
        return
    }

    switch (operator) {
        case "+":
        case "*":
        case "/":
            if (currentType == operatorType) {
                updateOperator(operator);
                return;
            } else if (currentType == valType && currentVal == "-") {
                return;
            }
            currentVal = operator;
            currentType = operatorType;
            break;
        case '-':
            if (currentType == valType && currentVal == "-") {
                return;
            }

            if (currentType == initType) {
                // if user press '-' first
                currentType = valType;
            } else {
                currentType = currentType == operatorType ?
                            valType : operatorType;
            }
            currentVal = operator;           
            break;
        default:
            break;
    }

    accuVal += operator;
    updateScreen()

    if (currentType == operatorType) {
        dotAppear = false;
    }
}

const resetVal = () => {
    currentVal = "";
    accuVal = "0";
    dotAppear = false
    updateScreen ();

    accuVal = "";
}

const submit = () => {
    currentVal = "";
    accuVal = eval(accuVal).toString();
    dotAppear = false;
    currentType = initType;
    updateScreen ();

    accuVal = "";
}