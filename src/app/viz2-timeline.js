import * as d3 from "d3";
import imageUrl from "../assets/img/tlpic.jpg";

const width = 700;
const height = 300;
const margin = { top: 20, right: 20, bottom: 40, left: 40 };

const svg = d3
  .select("#timeline-chart-container")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("display", "block")
  .style("margin", "0 auto");

let yearCounts = [];

export async function initialize() {
  const data = await d3.csv("/data/shootings.csv", (d) => {
    d.year = new Date(d.date).getFullYear();
    return d;
  });

  const grouped = d3.rollup(
    data,
    (v) => v.length,
    (d) => d.year
  );
  yearCounts = Array.from(grouped, ([year, count]) => ({ year, count })).sort(
    (a, b) => a.year - b.year
  );

  return [drawBars, noop];
}

function drawBars() {
  svg.selectAll("*").remove();

  const x = d3
    .scaleBand()
    .domain(yearCounts.map((d) => d.year))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(yearCounts, (d) => d.count)])
    .range([height - margin.bottom, margin.top]);

  // 1. Define a mask (bars = visible, rest = hidden)
  const defs = svg.append("defs");
  const mask = defs.append("mask").attr("id", "bar-mask");

  mask
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "black");

  mask
    .selectAll("rect")
    .data(yearCounts)
    .join("rect")
    .attr("x", (d) => x(d.year))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(d.count))
    .attr("fill", "white");

  // 2. Apply mask directly to the image
  svg
    .append("image")
    .attr("href", imageUrl)
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("mask", "url(#bar-mask)");

  // 3. Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip speech-bubble")
    .style("opacity", 0);

  // 4. Transparent interaction rectangles
  svg
    .selectAll("rect.interact")
    .data(yearCounts)
    .join("rect")
    .attr("class", "interact")
    .attr("x", (d) => x(d.year))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(d.count))
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      const rect = event.target.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      tooltip
        .html(`${d.count} victims`)
        .style("left", `${rect.left + rect.width / 2}px`)
        .style("top", `${rect.top + scrollY - 42}px`)
        .style("transform", "translateX(-50%)")
        .transition()
        .duration(150)
        .style("opacity", 1);
    })
    .on("mouseout", () => {
      tooltip.transition().duration(150).style("opacity", 0);
    });

  // 5. X-axis only
  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickSize(0))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-size", "13px"));
}

function noop() {
  svg.selectAll("rect").transition().duration(300).attr("opacity", 0);
}
