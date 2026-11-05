// Read csv
var width = 1920;
var height = 1280;

const svg = d3.select("body")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", `${width * 2}px`)
    .style("height", `${height * 2}px`);

d3.csv("penglings.csv", row => ({
    species: row.species,
    flipper_length_mm: Number(row.flipper_length_mm),
    body_mass_g: Number(row.body_mass_g),
    bill_length_mm: Number(row.bill_length_mm)
})).then(rows => {
    const data = rows.filter(d => 
        Number.isFinite(d.flipper_length_mm) &&
        Number.isFinite(d.body_mass_g) &&
        Number.isFinite(d.bill_length_mm)
    );

    console.log(data);
    drawGraph(data)
})
.catch(error => console.error("Could not load the csv ", error));

function drawGraph(data) {
    const margin = { top: 80, right: 60, bottom: 160, left: 120 };
    const plotRight = width - margin.right;
    const plotBottom = height - margin.bottom;

    const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.flipper_length_mm).map((value, i, extent) =>
        value + (i === 0 ? -2 : 2)
    ))
    .range([margin.left, plotRight]);

    const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.body_mass_g).map((value, i) =>
        value + (i === 0 ? -100 : 100)
    ))
    .range([plotBottom, margin.top]);

    const species = Array.from(new Set(data.map(d => d.species)));
    const color = d3.scaleOrdinal()
        .domain(species)
        .range(d3.schemeCategory10);
    const size = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.bill_length_mm))
        .range([3, 9]);

    const dots = svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.flipper_length_mm))
    .attr("cy", d => y(d.body_mass_g))
    .attr("r", d => size(d.bill_length_mm))
    .attr("fill", d => color(d.species));

    const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#313639")
    .style("color", "#f9f9f9")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("font-size", "30px")
    .style("width", "300px");

    // Hover effect: change size and tooltip to show datapoint
    dots
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", size(d.bill_length_mm) * 1.4);
            tooltip
                .html(
                    `Species: ${d.species}<br>` +
                    `Flipper length: ${d.flipper_length_mm} mm<br>` +
                    `Body mass: ${d.body_mass_g} g`
                )
                .transition()
                .duration(100)
                .style("opacity", 1);
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", `${event.pageX + 12}px`)
                .style("top", `${event.pageY + 12}px`);
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", d => size(d.bill_length_mm));
            tooltip.transition().duration(100).style("opacity", 0);
        });

    // Centered below the dot chart with x-axis
    svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", (margin.left + plotRight) / 2)
    .attr("y", height - 25)
    .text("Flipper Length (mm)")
    .style("font-size", "30px");

    svg.append("g")
    .attr("transform", `translate(0,${plotBottom})`)
    .call(d3.axisBottom(x))
    .attr("font-size", "18px")
    .attr("class", "x-axis");

    // Centered vertically beside the dot chart with y-axis
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("transform", `translate(35, ${(margin.top + plotBottom) / 2}) rotate(-90)`)
    .text("Body Mass (g)")
    .style("font-size", "30px");

    svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    .attr("font-size", "18px")
    .attr("class", "y-axis");

}
