
var gDataJSON;
var gData;

const widthMax = 1400;
const heightMax = 500;
    
const margin = {
    top: 80,
    bottom: 70,
    left: 60,
    right: 30,
}
const width = widthMax - margin.left - margin.right;
const height = heightMax - margin.top - margin.bottom;
let barWidth = 0, barHeight = 0;

const jetColor = [
    "#00007f",
    "#0000ac",
    "#0000da",
    "#0000ff",
    "#0020ff",
    "#0048ff",
    "#0070ff",
    "#0098ff",
    "#00c0ff",
    "#02e8f4",
    "#22ffd4",
    "#42ffb3",
    "#63ff93",
    "#83ff73",
    "#a3ff53",
    "#c3ff32",
    "#e4ff12",
    "#ffe500",
    "#ffc000",
    "#ff9b00",
    "#ff7600",
    "#ff5100",
    "#ff2c00",
    "#f10700",
    "#c30000",
    "#960000",
]

function preProcessData() {
    gData = gDataJSON["monthlyVariance"];
    let i = 0;
    gData.forEach((item) => {
        item["temp"] = item["variance"] + gDataJSON["baseTemperature"]
        item["index"] = i;
        i ++;
    });
    /*
        index
        month
        temp
        variance
        year
    */
   console.log(gData[0])
}


function updateDate () {
    preProcessData();
    // plot figure
    const   xMin = d3.min(gData, (d) => d["year"]-1),
            xMax = d3.max(gData, (d) => d["year"]+1),
            yMin = 1,
            yMax = 13
            tMin = d3.min(gData, (d) => d["temp"]),
            tMax = d3.max(gData, (d) => d["temp"]);
    barWidth = width / (xMax-xMin-1)
    barHeight = height / 12;

    const xScale = d3.scaleLinear()
            .domain([xMin, xMax])
            .range([0, width]);

    const yScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([0, height]);

    /* generate color map range */
    
    const tempScale = d3.scaleLinear()
                .domain([tMin, tMax])
                .range([0, jetColor.length])

    let tooltip = d3.select(".data_figure")
                    .append("div")
                    .attr("id", "tooltip")
                    .style("visibility", "hidden")

    let svg = d3.select(".data_figure")
                .append("svg")
                .attr("width", widthMax)
                .attr("height", heightMax)
                .attr("class", "data-container")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
    
    svg.append("g")
        .attr("transform", "translate(" + 0 + ", " + (height) + ")")
        .call(d3.axisBottom(xScale))
        .attr("id", "x-axis")
        .attr("class", "tick")

    svg.append("g")
        .attr("transform", "translate(" + 0 + ", " +  0 + ")")
        .call(d3.axisLeft(yScale))
        .attr("id", "y-axis")
        .attr("class", "tick")

    svg.append("text")
        .text("Month")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height/2))
        .attr("y", -50)
    
    svg.append("text")
        .text("Year")
        .attr("x", width/2)
        .attr("y", height + margin.bottom/2)
        .attr("class", "info")
        .style("font-size", "1rem")

    // plot title
    svg.append("text")
        .attr("id", "title")
        .text("Monthly Global Land-Surface Temperature")
        .attr("x", width/2)
        .attr("y", -margin.top/2)
        .style("class", "title")
        .style("font-size", "25px")
        .attr("text-anchor", "middle")

        
    svg.append("text")
        .attr("class", "subtitle")
        .text(`${xMin+1} - ${xMax-1}: base temperature ${gDataJSON["baseTemperature"]}℃`)
        .attr("x", width/2)
        .attr("y", -margin.top/2+30)
        .style("font-size", "16px")
        .attr("text-anchor", "middle")


    // plot legend
    /*
    let legendSVG = svg.append("g")
                        .attr("id", "legend")
    
    legendSVG.selectAll(".legendInfo")
            .data(legendInfo)
            .enter()
            .append("rect")
            .attr("x", width-190)
            .attr("y", (d, i) => (70+i*25))
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d) => d.color)

    legendSVG.selectAll(".legendLabel")
            .data(legendInfo)
            .enter()
            .append("text")
            .attr("x", width-170)
            .attr("y", (d, i) => (76+i*25))
            .text((d) => d.label)
            .style("font-size", "11px")
    */
    svg.selectAll(".dot")
        .data(gData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(d["year"]-1))
        .attr("y", (d, i) => yScale(d["month"]))
        .attr("class", "dot")
        .attr("data-xvalue", (d, i) => xScale(d["year"]))
        .attr("data-yvalue", (d, i) => yScale(d["temp"]))
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", (d, i) => {
            const tmp = d["temp"];
            return jetColor[Math.floor(tempScale(tmp))]
        })
        .on("mouseover", (e, d) => {
            let htmlContent = d["year"] + "-" + d3.format("02d")(d["month"]) + "<br>" +
                                d3.format(".2f")(d["temp"]) + " ℃" + "<br>" + 
                                d3.format(".2f")(d["variance"]) + "℃"

            tooltip.style("visibility", "visible")
                    .html(htmlContent)
                    .style('left', (e.pageX) + "px")
                    .style('top', (e.pageY - 100) + "px")
                    //.style('transform', 'translateX(60px)');
        })
        .on("mouseleave", (e, d) => {
            tooltip.style("visibility", "hidden")
        })
}


function getData () {
    return $.ajax({
        type: "GET",
        url: "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
        success: function (data) {
            if (typeof data === 'string') {
                gDataJSON = JSON.parse(data);
            }
         }
    });
}



$(document).ready(function() {
    getData().then(() => {
        updateDate();
    });
});