
var gGDPDataJSON;
var gGDPData;

const width = 650;
const height = 300;
const padding = 60;
const hPadding = 60,
    wPadding = 60;

let barWidth = 1;

const preProcessData = () => {
    let i = 0;
    gGDPData = gGDPDataJSON["data"].map((item) => {
        let tmp = item[0].split("-")
        let seasonName, timeIndex;
        switch (tmp[1]) {
            case "01":
                seasonName = "Q1";
                timeIndex = 0.0;
                break;
            case "04":
                seasonName = "Q2";
                timeIndex = 0.25;
                break;
            case "07":
                seasonName = "Q3";
                timeIndex = 0.50;
                break;
            case "10":
                seasonName = "Q4";
                timeIndex = 0.75
                break;
        }
        timeIndex += parseInt(tmp[0])
        i ++;

        return {"xIndex": timeIndex,
                "gdp": item[1], 
                "xLabel": seasonName, 
                "rawDate": item[0],
                "dataIndex": i-1};
                
    })

    barWidth = width / gGDPData.length
}


function updateGDPDate () {
    preProcessData ();
    // plot figure

    const   gdpMax = d3.max(gGDPData, (d) => d["gdp"]),
            gdpMin = d3.min(gGDPData, (d) => d["gdp"]),
            tMin = d3.min(gGDPData, (d) => d["xIndex"]),
            tMax = d3.max(gGDPData, (d) => d["xIndex"])

    // 18064.7 243.1 2015.5 1947
    // console.log(gdpMax, gdpMin, tMax, tMin);
    
    const yScale = d3.scaleLinear()
                    .domain([0, gdpMax])
                    .range([height-0, 0]);

    const xScale = d3.scaleLinear()
                    .domain([tMin, tMax])
                    .range([wPadding, width]);

    let tooltip = d3.select(".data_figure")
                    .append("div")
                    .attr("id", "tooltip")
                    .style("visibility", "hidden")

    let svg = d3.select(".data_figure")
                .append("svg")
                .attr("width", width+wPadding)
                .attr("height", height+hPadding)
                .attr("class", "data-container");
    


    svg.append("g")
        .attr("transform", "translate(" + (0) + ", " + (height+0) + ")")
        .call(d3.axisBottom(xScale))
        .attr("id", "x-axis")
        .attr("class", "tick")
        
    svg.append("g")
        .attr("transform", "translate(" + hPadding + ", " +  0 + ")")
        .call(d3.axisLeft(yScale))
        .attr("id", "y-axis")
        .attr("class", "tick")

    svg.append("text")
        .text("Gross Domestic Product")
        .attr("transform", "rotate(-90)")
        .attr("x", -170)
        .attr("y", 80)

    svg.append("text")
        .text("More Information: http://www.bea.gov/national/pdf/nipaguid.pdf")
        .attr("x", width/2)
        .attr("y", height+40)
        .attr("class", "info")

    // create rect
    svg.selectAll("rect")
        .data(gGDPData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(d["xIndex"]))
        .attr("y", (d, i) =>  yScale(d["gdp"]))
        .attr("width", barWidth)
        .attr("height", (d, i) => height-yScale(d["gdp"]))
        .attr("fill", "DeepSkyBlue")
        .attr("class", "bar")
        .attr("data-date", (d, i) => d["rawDate"])
        .attr("data-gdp", (d, i) => d["gdp"])
        .attr("data-index", (d, i) => i)
        .on("mouseover", (e, d) => {
            let timeStamp = Math.floor(d["xIndex"]).toString() + " " + d["xLabel"]
            tooltip.style("visibility", "visible")
                    .html(timeStamp + "<br>$ " + d["gdp"] + " Billion")
                    .style('left', d["dataIndex"] * barWidth + -10 + 'px')
                    .style('top', height - 50 + 'px')
                    .style('transform', 'translateX(60px)');
        })
        .on("mouseleave", (e, d) => {
            tooltip.style("visibility", "hidden")
        })




}


function getGDPData () {
    return $.ajax({
        type: "GET",
        url: 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json',
        success: function (data) {
            if (typeof data === 'string') {
                gGDPDataJSON = JSON.parse(data);
            }
         }
    });
}



$(document).ready(function() {
    getGDPData().then(() => {
        updateGDPDate();
    });
});