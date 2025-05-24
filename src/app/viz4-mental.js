import * as d3 from "d3";

const width = 800;
const height = 400;

const visContainer = d3.select("#viz4");
const svg = visContainer
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid");

export async function initialize() {
  return [mentalBlocks, threatBars];
}

const mentalBlocks = () => {
  svg.selectAll("*").remove();
  svg
    .selectAll("circle")
    .data([1, 1, 1, 1, 1])
    .join("circle")
    .attr("cx", (d, i) => i * 120 + 60)
    .attr("cy", height / 2)
    .attr("r", 25)
    .attr("fill", "#c0392b");
};

const threatBars = () => {
  svg.selectAll("*").remove();
  svg
    .selectAll("rect")
    .data([60, 100, 80])
    .join("rect")
    .attr("x", (d, i) => i * 150 + 100)
    .attr("y", (d) => height - d)
    .attr("width", 80)
    .attr("height", (d) => d)
    .attr("fill", "#2980b9");
};
