
function updatePreview () {
    const markdownRaw = document.getElementById("editor").value
    const markdownText = marked.parse(markdownRaw)
    //console.log (markdownText)

    //$("#editor").text(markdownRaw)
    document.getElementById("preview").innerHTML = markdownText;
}

$(document).ready(function() {
    updatePreview();
});