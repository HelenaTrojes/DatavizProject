import * as d3 from "d3";

const width = 750;
const height = 350;

const svg = d3
  .select("#viz3")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", "#fff");

const data = [
  { race: "Black", killed: 2484, popM: 40, rate: 6.1, color: "#1d4ed8" },
  { race: "Hispanic", killed: 1717, popM: 65, rate: 2.5, color: "#ccc" },
  { race: "White", killed: 4657, popM: 191, rate: 2.4, color: "#ccc" },
  { race: "Other", killed: 380, popM: 39, rate: 0.9, color: "#ccc" },
];

export async function initialize() {
  return [drawChart, clearChart];
}

function drawChart() {
  console.log("Drawing race bar chart...");
  svg.selectAll("*").remove();

  const padding = { top: 50, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const totalPop = d3.sum(data, (d) => d.popM);

  const xScale = d3.scaleLinear().domain([0, totalPop]).range([0, chartWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.rate)])
    .range([chartHeight, 0]);

  let currentX = padding.left;

  data.forEach((d) => {
    const barWidth = xScale(d.popM);
    const barHeight = chartHeight - yScale(d.rate);

    console.log(`${d.race} → width: ${barWidth}, height: ${barHeight}`);

    svg
      .append("rect")
      .attr("x", currentX)
      .attr("y", yScale(d.rate) + padding.top)
      .attr("width", barWidth)
      .attr("height", barHeight)
      .attr("fill", d.color);

    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", yScale(d.rate) + padding.top - 28)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "0.9em")
      .text(d.race);

    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", yScale(d.rate) + padding.top - 13)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.85em")
      .text(`${d.rate} per million`);

    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", chartHeight + padding.top - 3)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.85em")
      .text(`${d.killed} killed`);

    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", chartHeight + padding.top + 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "0.75em")
      .attr("fill", "#444")
      .text(`${d.popM}M`);

    currentX += barWidth;
  });

  svg
    .append("text")
    .attr(
      "transform",
      `translate(20, ${padding.top + chartHeight / 2}) rotate(-90)`
    )
    .attr("text-anchor", "middle")
    .attr("font-size", "0.75rem")
    .attr("fill", "#555")
    .text("Higher rate of police killings →");
}

function clearChart() {
  svg.selectAll("*").transition().duration(300).attr("opacity", 0).remove();
}
