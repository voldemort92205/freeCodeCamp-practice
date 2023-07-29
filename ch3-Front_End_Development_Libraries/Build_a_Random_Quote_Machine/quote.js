
var gQuoteDataBase;

colorLists = [
    "brown",
    "purple",
    "darkcyan",
]

function getQuoteDataBase() {
    return $.ajax({
        type: "GET",
        url: 'https://gist.githubusercontent.com/camperbot/5a022b72e96c4c9585c32bf6a75f62d9/raw/e3c6895ce42069f0ee7e991229064f167fe8ccdc/quotes.json',
        success: function (data) {
            if (typeof data === 'string') {
                gQuoteDataBase = JSON.parse(data);
            }
         }
    });
}

const getNextColor = () => {
    const ind = Math.floor(Math.random() * colorLists.length);
    return colorLists[ind]
}

const getNextQuote = () => {
    const ind = Math.floor(Math.random() * gQuoteDataBase["quotes"].length);
    return gQuoteDataBase["quotes"][ind]
}


function updateQuote() {
    
    const currentColor = getNextColor();
    const backgroundColor = "background-color: " + currentColor + "; "
    const fontColor = "color: " + currentColor;

    const currentQuote = getNextQuote();
    const quoteText = currentQuote["quote"]
    const quoteAuthor = currentQuote["author"]


    $("#text").text(quoteText);
    $("#author").text(quoteAuthor);
    $("#twitter-quote").attr("href",
        "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent('"' + quoteText + '" ' + quoteAuthor));
    $("body").attr("style", backgroundColor + fontColor)
    $("button").attr("style", backgroundColor)
    
}

$(document).ready(function() {
    getQuoteDataBase().then(() => {
        updateQuote();
    });
    $('#new-quote').on('click', updateQuote);
});