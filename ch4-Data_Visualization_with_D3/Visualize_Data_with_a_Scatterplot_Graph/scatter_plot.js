
var gDataJSON;
var gData;

const widthMax = 600;
const heightMax = 400;

const noDopingColor = "orange",
        dopingColor = "blue";

const dotR = "5";
    
const margin = {
    top: 50,
    bottom: 30,
    left: 60,
    right: 30,
}

const width = widthMax - margin.left - margin.right;
const height = heightMax - margin.top - margin.bottom;

function preProcessData() {
    gData = gDataJSON;
    let i = 0;
    gData.forEach((item) => {
        const tmp = item["Time"].split(":")
        item["TimeObj"] = new Date(2000, 1, 1, 0, tmp[0], tmp[1]);
        item["index"] = i;
        i ++;
    });
}


function updateDate () {
    preProcessData();
    // plot figure

    const legendInfo = [
        {
            "label": "No doping allegations",
            "color": noDopingColor,
        },
        {
            "label": "Riders with doping allegations",
            "color": dopingColor
        }
    ]

    const   xMin = d3.min(gData, (d) => d["Year"]-1),
            xMax = d3.max(gData, (d) => d["Year"]+1);

    const xScale = d3.scaleLinear()
            .domain([xMin, xMax])
            .range([0, width]);

    const yScale = d3.scaleLinear()
            .domain(d3.extent(gData, (d) => d.TimeObj))
            .range([height, 0]);


    const MSFormat = d3.timeFormat("%M:%S")
    

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
        .call(d3.axisLeft(yScale).tickFormat(MSFormat))
        .attr("id", "y-axis")
        .attr("class", "tick")

    svg.append("text")
        .text("Time (minute)")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height/2))
        .attr("y", -50)
    
    svg.append("text")
        .text("Year")
        .attr("x", width/2)
        .attr("y", height + margin.bottom)
        .attr("class", "info")
        .style("font-size", "1rem")

    // plot title
    svg.append("text")
        .attr("id", "title")
        .text("Doping in Professional Bicycle Racing")
        .attr("x", width/2)
        .attr("y", -margin.top/2)
        .style("class", "title")
        .style("font-size", "25px")
        .attr("text-anchor", "middle")

    svg.append("text")
        .attr("class", "subtitle")
        .text("35 Fastest times up Alpe d'Huez")
        .attr("x", width/2)
        .attr("y", -margin.top/2+30)
        .style("font-size", "16px")
        .attr("text-anchor", "middle")



    // plot legend
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
    
    svg.selectAll(".dot")
        .data(gData)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => xScale(d["Year"]))
        .attr("cy", (d, i) => height-yScale(d["TimeObj"]))
        .attr("r", dotR)
        .attr("class", "dot")
        .attr("data-xvalue", (d, i) => xScale(d["Year"]))
        .attr("data-yvalue", (d, i) => yScale(d["TimeObj"]))
        .attr("fill", (d, i) => {
            if (d["Doping"] !== "") {
                return dopingColor;
            } else {
                return noDopingColor;
            }
        })
        .on("mouseover", (e, d) => {
            let timeStamp = Math.floor(d["xIndex"]).toString() + " " + d["xLabel"]
            let htmlContent = d["Name"] + ": " + d["Nationality"] + "<br>" +
                                "Year: " + d["Year"] + ", " + "Time: " + d["Time"]
            if (d["Doping"] !== "") {
                htmlContent += "<br><br>" + d["Doping"]
            }
            tooltip.style("visibility", "visible")
                    .html(htmlContent)
                    .style('left', (e.pageX - 80) + "px")
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
        url: "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json",
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