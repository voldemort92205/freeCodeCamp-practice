
var gDataJSON;
var gData;

const widthMax = 1400;
const heightMax = 500;
    
const margin = {
    top: 80,
    bottom: 80,
    left: 60,
    right: 30,
}
const width = widthMax - margin.left - margin.right;
const height = heightMax - margin.top - margin.bottom;
let barWidth = 0, barHeight = 0;

const jetColor = [
    "#00007f",
    "#00009f",
    "#0000bf",
    "#0000de",
    "#0000fe",
    "#000cff",
    "#0028ff",
    "#0044ff",
    "#0060ff",
    "#007cff",
    "#0098ff",
    "#00b4ff",
    "#00d0ff",
    "#05ecf1",
    "#1cffda",
    "#32ffc3",
    "#49ffad",
    "#5fff96",
    "#76ff80",
    "#8dff69",
    "#a3ff53",
    "#baff3c",
    "#d0ff25",
    "#e7ff0f",
    "#feed00",
    "#ffd300",
    "#ffb900",
    "#ff9f00",
    "#ff8500",
    "#ff6b00",
    "#ff5100",
    "#ff3700",
    "#ff1d00",
    "#ec0300",
    "#cc0000",
    "#ac0000",
    "#8d0000",        
]
const colorScaleBase = 15; // handel scale


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
}


function updateDate () {
    preProcessData();
    // plot figure
    const   xMin = d3.min(gData, (d) => d["year"]-1),
            xMax = d3.max(gData, (d) => d["year"]+1),
            yMin = 1,
            yMax = 13
            tMin = 2.,
            tMax = 12.3;
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
                .range([0, jetColor.length * colorScaleBase])

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

    const monInd = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5];
    const monName = d3.utcFormat("%b")
    svg.append("g")
        .attr("transform", "translate(" + 0 + ", " +  0 + ")")
        .call(d3.axisLeft(yScale)
                .tickValues(monInd)
                .tickFormat((d, i) => {
                    let tmp = new Date(0);
                    tmp.setMonth(i);
                    return monName(tmp);
                }))
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
        .attr("id", "description")


    // plot legend: colormap
    let legendSVG = svg.append("g")
                        .attr("id", "legend")
    legendSVG.append("g")
        .attr("transform", "translate(" + 0 + ", " + (height+margin.top*0.75) + ")")
        .call(d3.axisBottom(tempScale))
        .attr("id", "legend")
        .attr("class", "legend")
    legendSVG.selectAll(".legendColor")
            .data(jetColor)
            .enter()
            .append("rect")
            .attr("x", (d, i) => (0 + i * colorScaleBase))
            .attr("y", (height+margin.top*0.5))
            .attr("width", colorScaleBase)
            .attr("height", 20)
            .attr("fill", (d) => d)

    // plot data
    svg.selectAll(".cell")
        .data(gData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(d["year"]-1))
        .attr("y", (d, i) => yScale(d["month"]))
        .attr("class", "cell")
        .attr("data-year", (d, i) => d["year"])
        .attr("data-temp", (d, i) => d["temp"])
        .attr("data-mon", (d, i) => d["mon"])
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", (d, i) => {
            const tmp = d["temp"];
            return jetColor[Math.floor(tempScale(tmp)/colorScaleBase)]
        })
        .on("mouseover", (e, d) => {
            let htmlContent = d["year"] + "-" + d3.format("02d")(d["month"]) + "<br>" +
                                d3.format(".2f")(d["temp"]) + " ℃" + "<br>" + 
                                d3.format(".2f")(d["variance"]) + "℃"

            tooltip.style("visibility", "visible")
                    .html(htmlContent)
                    .style('left', (e.pageX) + "px")
                    .style('top', (e.pageY - 100) + "px")
                    .attr("data-year", d["year"])
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