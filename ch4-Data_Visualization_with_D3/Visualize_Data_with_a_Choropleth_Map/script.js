
var gGeoJSON;
var gEduJSON;

const widthMax = 800;
const heightMax = 500;
    
const margin = {
    top: 80,
    bottom: 20,
    left: 60,
    right: 60,
}
const width = widthMax - margin.left - margin.right;
const height = heightMax - margin.top - margin.bottom;


function findEduDatabyID (id, key) {
    const tmp = gEduJSON.filter((d) => d.fips == id);
    if (tmp.length && tmp[0].hasOwnProperty(key)) {
        return tmp[0][key]
    }
    return "none"
}

function updateDate() {
    // tooltip
    const tooltip = d3.select(".data_figure")
                    .append("div")
                    .attr("id", "tooltip")
                    .style("visibility", "hidden")

    let svg = d3.select(".data_figure")
                .append("svg")
                .attr("width", widthMax)
                .attr("height", heightMax)
                .attr("class", "data-container")

    // plot title
    const titleStr = "United States Educational Attainment";
    const subTitleStr = "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)";
    svg.append("text")
        .attr("id", "title")
        .text(titleStr)
        .attr("x", width/2)
        .attr("y", margin.top/2-10)
        .style("class", "title")
        .style("font-size", "35px")
        .attr("text-anchor", "middle")
    svg.append("text")
        .attr("class", "subtitle")
        .text(subTitleStr)
        .attr("x", width/2)
        .attr("y", margin.top/2+20)
        .style("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("id", "description")


    const eduMin = d3.min(gEduJSON, (d) => d.bachelorsOrHigher),
            eduMean = d3.mean(gEduJSON, (d) => d.bachelorsOrHigher),
            eduMax = d3.max(gEduJSON, (d) => d.bachelorsOrHigher);

    const minColor = "#ffe5cc",
            meanColor = "#ff8000",
            maxColor = "#663300";

    const colorMap = d3.scaleLinear()
                        .domain([eduMin, eduMean, eduMax])
                        .range([minColor, meanColor, maxColor])

    const nColors = 15,
            colorWidth = 10,
            colorSpacing = height / nColors;
    getLegendData = () => {
        let output = [];
        const dx = (eduMax-eduMin)/nColors;
        for (let i = 0; i < nColors; i=i+1) {
            output.push( parseFloat( (i * dx + eduMin).toFixed(1)))
        }
        output.push(eduMax)
        return output;
    }
    legendData = getLegendData();

    const legendSVG = svg.append("g")
                            .attr("id", "legend")
                            .attr("class", "legend")
                            .attr("transform", "translate(" + (width+margin.left+10) + ", " + (margin.top) + ")");
    legendSVG.selectAll(".legend")
                .data(legendData.slice(0, -1))
                .enter()
                    .append("rect")
                    .attr("id", "legend-color")
                    .attr("fill", (d) => colorMap(d))
                    .attr("width", colorWidth)
                    .attr("height", colorSpacing)
                    .attr("y", (d, i) => i*colorSpacing)
    
    legendSVG.append("g")
                .attr("id", "legend-axis")
                .selectAll(".legend-axis")
                .data(legendData)
                .enter()
                    .append("text")
                    .text((d) => d + "%")
                    .attr("y", (d, i) => i*colorSpacing)
                    .attr("font-size", "12px")
                    .attr("transform", "translate(" + (colorWidth+5) + ", 5)")

    // plot figure
    const geoPath = d3.geoPath();

    const geoShiftStr = "translate(" + (margin.left) + "," + (margin.top) + ")";
    const countyData = topojson.feature(gGeoJSON, gGeoJSON.objects.counties);

    // scale the size to fit the SVG range
    const projection = d3.geoIdentity().
                                fitSize([width, height], countyData)
    geoPath.projection(projection)


    const countySVG = svg.append("g")
                            .attr("transform", geoShiftStr)
                            .attr("id", "counties")
    
    countySVG.selectAll("path")
                .data(countyData.features)
                .enter()
                    .append("path")
                    .attr("class", "county")
                    .attr("d", geoPath)
                    .attr("data-fips", (d) => d.id)
                    .attr("data-education", (d) => findEduDatabyID(d.id, "bachelorsOrHigher"))
                    .attr("fill", (d) => colorMap(findEduDatabyID(d.id, "bachelorsOrHigher")))
                    .on ("mouseover", (e, d) => {
                        const content = `area: ${findEduDatabyID(d.id, "area_name")}, ${findEduDatabyID(d.id, "state")} <br>
                                         degree: ${findEduDatabyID(d.id, "bachelorsOrHigher")}`
                        tooltip.html(content)
                            .style("visibility", "visible")
                            .style("left", (e.pageX+10) + "px")
                            .style("top", (e.pageY) + "px")
                            .style("z-index", "3")
                            
                    })
                    .on("mouseleave", () => {
                        tooltip.style("visibility", "hidden");
                    })
    
    
    const stateData = topojson.feature(gGeoJSON, gGeoJSON.objects.states);
    const stateSVG = svg.append("g")
                        .attr("id", "states")
                        .attr("transform", geoShiftStr)
    stateSVG.selectAll("path")
            .data(stateData.features)
            .enter()
                .append("path")
                .attr("class", "state")
                .attr("d", geoPath)
                .attr("fill", "none")
                .attr("stroke", "black")
}

function getGeoDate(){
    return $.ajax({
        type: "GET",
        url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json",
        success: function (data) {
            if (typeof data === 'string') {
                console.log("data = ", data)
                gGeoJSON = JSON.parse(data);
                console.log(gGeoJSON)
            } else if (typeof data == "object") {
                gGeoJSON = data;
            } else {
                console.log ("data has other types: " + typeof data)
            }
         }
    });
}

function getEduData() {
    return $.ajax({
        type: "GET",
        url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json",
        success: function (data) {
            if (typeof data === 'string') {
                gEduJSON = JSON.parse(data);
            } else if (typeof data == "object") {
                gEduJSON = data;
            } else {
                console.log ("data has other types: " + typeof data)
            }
         }
    });
}

$(document).ready(function() {
    getGeoDate().then(() => {
        getEduData().then (() => {
            updateDate();
        })
    })
});