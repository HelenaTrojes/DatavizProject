import * as d3 from "d3";

const width = 800;
const height = 420;

const svg = d3
  .select("#race-chart-container")
  .append("svg")
  .attr("width", "100%")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("display", "block")
  .style("margin", "0 auto")
  .style("background", "rgba(255, 255, 255, 0.1)")
  .style("backdrop-filter", "blur(6px)")
  .style("-webkit-backdrop-filter", "blur(6px)")
  .style("border-radius", "6px");

const racePopulation = {
  Black: 40,
  Hispanic: 65,
  White: 191,
  Other: 39,
};

const raceLabels = {
  Black: "Black",
  Hispanic: "Hispanic",
  White: "White, non-Hispanic",
  Other: "Other & multi",
};

const raceColors = {
  Black: "#1d4ed8", // blue
  Hispanic: "#ddd",
  White: "#ddd",
  Other: "#ddd",
};

const codeToGroup = {
  B: "Black",
  H: "Hispanic",
  W: "White",
  A: "Other",
  N: "Other",
  O: "Other",
};

export async function initialize() {
  const data = await d3.csv("/data/shootings.csv");

  const raceCounts = d3.rollup(
    data,
    (v) => v.length,
    (d) => {
      const code = d.race?.trim();
      return codeToGroup[code] || null;
    }
  );

  const chartData = Array.from(raceCounts, ([race, killed]) => {
    if (!racePopulation[race]) return null;
    const popM = racePopulation[race];
    return {
      race,
      killed,
      popM,
      rate: +(killed / popM).toFixed(1),
      label: raceLabels[race],
      color: raceColors[race],
    };
  }).filter(Boolean);

  chartData.sort((a, b) => b.rate - a.rate);

  return [() => drawChart(chartData), clearChart];
}

function drawChart(data) {
  svg.selectAll("*").remove();

  const padding = { top: 50, right: 30, bottom: 70, left: 80 };
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

    // Top label: race
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", yScale(d.rate) + padding.top - 33)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "bold")
      .text(d.label);

    // Top label: rate
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", yScale(d.rate) + padding.top - 18)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(`${d.rate} per million per year`);

    // Inside bar: killed
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", yScale(d.rate) + padding.top + barHeight / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#000")
      .text(`${d.killed} killed`);

    // Bottom: population
    svg
      .append("text")
      .attr("x", currentX + barWidth / 2)
      .attr("y", chartHeight + padding.top + 16)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#555")
      .text(`${d.popM}M`);

    currentX += barWidth;
  });

  // Vertical axis label — moved closer to the left edge of the bars
  const axisLabelX = padding.left - 20;

  svg
    .append("text")
    .attr("x", axisLabelX)
    .attr("y", padding.top + chartHeight / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#888")
    .attr(
      "transform",
      `rotate(-90, ${axisLabelX}, ${padding.top + chartHeight / 2})`
    )
    .text("Higher rate of police killings →");

  // Bottom axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 35)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#888")
    .text("U.S. Population");
}

function clearChart() {
  svg.selectAll("*").transition().duration(300).attr("opacity", 0).remove();
}
