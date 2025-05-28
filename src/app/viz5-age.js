import * as d3 from "d3";
import ageImage from "../assets/img/graffiti.jpeg"; // import image asset

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
    // below, filter of the below 5 years olds and the faulty age values, as there are 400 something
    if (!isNaN(age) && age >= 5) {
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

  // Image mask definition
  const defs = svg.append("defs");
  const mask = defs.append("mask").attr("id", "age-mask");
  mask
    .append("rect")
    .attr("width", width)
    .attr("height", chartHeight)
    .attr("fill", "black");

  mask
    .selectAll("rect")
    .data(dataset)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.age_group))
    .attr("width", (d) => x(d.count) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", "white");

  // Background image with mask
  svg
    .append("image")
    .attr("href", ageImage)
    .attr("width", width)
    .attr("height", chartHeight)
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("mask", "url(#age-mask)");

  // Overlay colored bars
  svg
    .selectAll("rect.overlay")
    .data(dataset)
    .join("rect")
    .attr("class", "overlay")
    .attr("x", x(0))
    .attr("y", (d) => y(d.age_group))
    .attr("width", (d) => x(d.count) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", (d) =>
      d.highlight ? "rgba(29, 78, 216, 0.4)" : "rgba(203, 213, 225, 0.3)"
    );

  // Y axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left - 10},0)`)
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .selectAll("text")
    .attr("font-size", "12px");

  // Static text label
  svg
    .append("g")
    .selectAll("text.label")
    .data(dataset)
    .join("text")
    .attr("class", "label")
    .attr("x", (d) => x(d.count) + 5)
    .attr("y", (d) => y(d.age_group) + y.bandwidth() / 2 + 4)
    .attr("fill", "#666")
    .attr("font-size", "12px")
    .text((d) => (d.age_group === "0–4" ? "" : d.count)); // Hides 0–4 age group count, since that one contains faulty data, otherwise we will be looking at 400ish baby victims. Wouldn't look good for the police.

  /* // Tooltip
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

  // Hover interaction
  svg
    .selectAll("rect.interact")
    .data(dataset)
    .join("rect")
    .attr("class", "interact")
    .attr("x", x(0))
    .attr("y", (d) => y(d.age_group))
    .attr("width", (d) => x(d.count) - x(0))
    .attr("height", y.bandwidth())
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.count}</strong> victims`)
        .style("left", `${event.pageX + 14}px`)
        .style("top", `${event.pageY - 14}px`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.pageX + 14}px`)
        .style("top", `${event.pageY - 14}px`);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    }); */

  return [() => {}];
}
