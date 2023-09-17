
var gDataJSON;
var gData;

const widthMax = 900;
const heightMax = 600;
    
const margin = {
    top: 80,
    bottom: 150,
    left: 60,
    right: 60,
}
const width = widthMax - margin.left - margin.right;
const height = heightMax - margin.top - margin.bottom;

const urlParams = new URLSearchParams(window.location.search);

const dataSrc = {
    "video": {
        url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
        title: "Video Game Sales",
        subtitle: "Top 100 Most Sold Video Games Grouped by Platform",
    },
    "movie": {
        url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
        title: "Movie Sales",
        subtitle: "Top 100 Highest Grossing Movies Grouped By Genre",
    },
    "kickstarter": {
        url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
        title: "Kickstarter Pledges",
        subtitle: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    },
};

let currentType = "video";

function preProcessData() {
    gData = gDataJSON;
}


function updateDate () {
    preProcessData();
 
    // color map
    let colorMap = d3.scaleOrdinal().range(d3.schemeCategory20c);

    // generate data for treemap
    const root = d3.hierarchy(gData)
                    .sum((d) => d.value)
                    .sort((a, b) => b.value - a.value);

    const treemap = d3.treemap()
                        .size([width, height])
                        .paddingInner(1) (root);

    const categories = treemap.leaves()
                                .map((d) => d.data.category)
                                .filter((d, i, arr) => {
                                    return arr.indexOf(d) === i;
                                    });

    // tooltip
    const tooltip = d3.select(".data_figure")
                        .append("div")
                        .attr("id", "tooltip")
                        .style("visibility", "hidden")

    // kernel SVG
    const svg = d3.select(".data_figure")
                    .append("svg")
                    .attr("width", widthMax)
                    .attr("height", heightMax)
                    .attr("class", "data-container")

    // plot title
    svg.append("text")
        .attr("id", "title")
        .text(dataSrc[currentType].title)
        .attr("x", width/2)
        .attr("y", margin.top/2-10)
        .style("class", "title")
        .style("font-size", "25px")
        .attr("text-anchor", "middle")

    svg.append("text")
        .attr("class", "subtitle")
        .text(dataSrc[currentType].subtitle)
        .attr("x", width/2)
        .attr("y", margin.top/2+20)
        .style("font-size", "16px")
        .attr("text-anchor", "middle")
        .attr("id", "description")


    // generate figure
    const figSVG = svg.append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    const leaf = figSVG.selectAll(".leaf")
                    .data(treemap.leaves())
                    .enter().append("g")
                    .attr("transform", d => `translate(${d.x0},${d.y0})`)
                    .on("mouseover", (d) => {
                        const content = `name: ${d.data.name}<br>
                                         category: ${d.data.category}<br>
                                         value: ${d.data.value}`;
                        tooltip.html(content)
                                .style("visibility", "visible")
                                .style("left", (d3.event.pageX-20) + "px")
                                .style("top", d3.event.pageY + "px")
                                .style("z-index", "3")
                                .attr("data-value", d.data.value)
                    })
                    .on("mouseleave", (d) => {
                        tooltip.style("visibility", "hidden");
                    })

    // plot color
    leaf.append("rect")
        .attr("width", (d) => (d.x1 - d.x0))
        .attr("height", (d) => (d.y1 - d.y0))
        .attr("fill", (d) => colorMap(d.parent.data.name))
        .attr("stroke", "white")
        .attr("stroke-width", "1")
        .attr("class", "tile")
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.data.value);

    // write data
    leaf.append("text")
        .attr("class", "leaf-info")
        .selectAll("tspan")
        .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
        .attr("x", 3)
        .attr("y", (d, i) => { return 13 + i * 10;})
        .text((d) => d)


    // create legend block
    const nCols = 6,
            legendColLength = width / nCols,
            legendColorSize = 12,
            legendDHeight = 20;

    const legend = svg.append("g")
                        .attr("id", "legend")
                        .attr("transform", "translate(" + (margin.left) + "," + (height+margin.top+50) + ")")
                        .selectAll("#legend")
                        .data(categories)
                        .enter().append("g")
                        .attr("transform", (d,i) => {
                                const dx = (i%nCols) * legendColLength;
                                const dy = Math.floor(i/nCols) * (legendColorSize + legendDHeight) + 20
                                return `translate(${dx}, ${dy})`
                            })

    legend.append("rect")
            .attr("width", legendColorSize)
            .attr("height", legendColorSize)
            .attr("fill", (d) => colorMap(d))
            .attr("class", "legend-item");
    
    legend.append("text")
            .attr("x", legendColorSize+5)
            .attr("y", legendColorSize)
            .attr("font-size", "14px")
            .text((d) => d)
}


function getData () {
    currentType = urlParams.get("data");
    if (! dataSrc.hasOwnProperty(currentType)) {
        currentType = "video";
    }
    return $.ajax({
        type: "GET",
        url: dataSrc[currentType].url,
        success: function (data) {
            if (typeof data === 'string') {
                gDataJSON = JSON.parse(data);
            } else if (typeof data === "object") {
                gDataJSON = data
            } else {
                console.log("data with other format: " + typeof data)
            }
         }
    });
}



$(document).ready(function() {
    getData().then(() => {
        updateDate();
    });
});