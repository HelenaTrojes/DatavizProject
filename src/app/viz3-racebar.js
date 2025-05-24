import * as d3 from "d3";

const width = 800;
const height = 400;

const svg = d3
  .select("#viz3")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", "#fff");

const data = [
  { race: "Black", killed: 2484, popM: 40, rate: 6.1, color: "#1d4ed8" },
  { race: "Hispanic", killed: 1717, popM: 65, rate: 2.5, color: "#ccc" },
  {
    race: "White, non-Hispanic",
    killed: 4657,
    popM: 191,
    rate: 2.4,
    color: "#ccc",
  },
  { race: "Other & multi", killed: 380, popM: 39, rate: 0.9, color: "#ccc" },
];

export async function initialize() {
  return [drawChart, clearChart];
}

function drawChart() {
  svg.selectAll("*").remove();

  const padding = { top: 50, right: 30, bottom: 60, left: 80 };
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

    // Bar
    svg
      .append("rect")
      .attr("x", currentX)
      .attr("y", yScale(d.rate) + padding.top)
      .attr("width", barWidth)
      .attr("height", barHeight)
      .attr("fill", d.color);

    // Text: rate per million (top)
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", yScale(d.rate) + padding.top - 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .text(`${d.rate} per million`);

    // Text: race (bold)
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", yScale(d.rate) + padding.top - 8)
      .attr("text-anchor", "middle")
      .attr("font-weight", "700")
      .attr("font-size", "13px")
      .text(d.race);

    // Text: killed count (inside bar or below)
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", chartHeight + padding.top - 3)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(`${d.killed} killed`);

    // Text: population (bottom line)
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", chartHeight + padding.top + 14)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#555")
      .text(`${d.popM}M`);

    currentX += barWidth;
  });

  // Left-side label
  svg
    .append("text")
    .attr("x", 15)
    .attr("y", padding.top + chartHeight / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#555")
    .attr("transform", `rotate(-90, 15, ${padding.top + chartHeight / 2})`)
    .text("Higher rate of police killings →");
}

function clearChart() {
  svg.selectAll("*").transition().duration(300).attr("opacity", 0).remove();
}
