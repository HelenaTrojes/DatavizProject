import * as d3 from "d3";

const margin = { top: 20, right: 40, bottom: 40, left: 80 };
const width = 800;

const svg = d3
  .select("#age-chart-container")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${500}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

export async function initialize() {
  const data = await d3.csv("/data/shootings.csv");

  const bins = [
    { label: "0–4", min: 0, max: 4 },
    { label: "5–9", min: 5, max: 9 },
    { label: "10–14", min: 10, max: 14 },
    { label: "15–19", min: 15, max: 19 },
    { label: "20–24", min: 20, max: 24 },
    { label: "25–29", min: 25, max: 29 },
    { label: "30–34", min: 30, max: 34 },
    { label: "35–39", min: 35, max: 39 },
    { label: "40–44", min: 40, max: 44 },
    { label: "45–49", min: 45, max: 49 },
    { label: "50–54", min: 50, max: 54 },
    { label: "55–59", min: 55, max: 59 },
    { label: "60–64", min: 60, max: 64 },
    { label: "65–69", min: 65, max: 69 },
    { label: "70–74", min: 70, max: 74 },
    { label: "75–79", min: 75, max: 79 },
    { label: "80–84", min: 80, max: 84 },
    { label: "85+", min: 85, max: Infinity },
  ];

  const counts = Object.fromEntries(bins.map((b) => [b.label, 0]));

  for (const d of data) {
    const age = +d.age;
    if (!isNaN(age) && age >= 5 && age <= 100) {
      const bin = bins.find((b) => age >= b.min && age <= b.max);
      if (bin) counts[bin.label]++;
    }
  }

  const dataset = bins.map((b) => ({
    age_group: b.label,
    count: counts[b.label],
    highlight: ["20–24", "25–29", "30–34", "35–39"].includes(b.label),
  }));

  const chartHeight = dataset.length * 24 + margin.top + margin.bottom;
  svg.attr("height", chartHeight);
  svg.selectAll("*").remove();

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.count)])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleBand()
    .domain(dataset.map((d) => d.age_group))
    .range([margin.top, chartHeight - margin.bottom])
    .padding(0.2);

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip-age")
    .style("position", "absolute")
    .style("background", "#000")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "13px")
    .style("white-space", "nowrap")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Bars
  svg
    .selectAll("rect.bar")
    .data(dataset)
    .join("rect")
    .attr("class", "bar")
    .attr("x", x(0))
    .attr("y", (d) => y(d.age_group))
    .attr("width", (d) => x(d.count) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => (d.highlight ? "#1d4ed8" : "#cbd5e1"))
    .attr("style", "cursor: pointer;")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("fill", d.highlight ? "#2563eb" : "#94a3b8");

      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.count}</strong> victims`)
        .style("left", `${event.pageX + 14}px`)
        .style("top", `${event.pageY - 14}px`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.pageX + 14}px`)
        .style("top", `${event.pageY - 14}px`);
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", d.highlight ? "#1d4ed8" : "#cbd5e1");

      tooltip.transition().duration(150).style("opacity", 0);
    });

  svg
    .append("g")
    .attr("transform", `translate(${margin.left - 10},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
    .attr("font-size", "12px");

  return [() => {}];
}
