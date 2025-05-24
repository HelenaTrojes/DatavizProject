import * as d3 from "d3";

const width = 960;
const height = 600;

const svg = d3
  .select("#viz")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid");

const projection = d3
  .geoAlbersUsa()
  .scale(1200)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

let data, latestYear;

// Load data + draw outline + store for future use
export async function initialize() {
  data = await d3.csv("/data/shootings.csv", (d) => {
    d.latitude = +d.latitude;
    d.longitude = +d.longitude;
    d.parsedDate = new Date(d.date);
    d.year = d.parsedDate.getFullYear();
    return d;
  });

  latestYear = d3.max(data, (d) => d.year);

  const us = await d3.json("/data/us-states.json");

  svg
    .append("g")
    .selectAll("path")
    .data(us.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "#f1f1f1")
    .attr("stroke", "#ccc");

  return [showAllDots, showLatestDots, clearDots];
}

function showAllDots() {
  svg.selectAll("circle").remove();

  svg
    .append("g")
    .selectAll("circle")
    .data(data.filter((d) => !isNaN(d.latitude) && !isNaN(d.longitude)))
    .join("circle")
    .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
    .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
    .attr("r", 2)
    .attr("fill", "gray")
    .attr("opacity", 0.4);
}

function showLatestDots() {
  const filtered = data.filter((d) => d.year === latestYear);

  const dots = svg.selectAll("circle").data(filtered, (d) => d.date + d.name);

  dots
    .enter()
    .append("circle")
    .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
    .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
    .attr("r", 0)
    .attr("fill", "#e63946")
    .attr("opacity", 0)
    .transition()
    .duration(600)
    .attr("r", 3)
    .attr("opacity", 0.85);

  dots.exit().transition().duration(300).attr("opacity", 0).remove();
}

function clearDots() {
  svg
    .selectAll("circle")
    .transition()
    .duration(300)
    .attr("opacity", 0)
    .remove();
}
