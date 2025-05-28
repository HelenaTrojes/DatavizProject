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

  // mask directly to the image
  svg
    .append("image")
    .attr("href", imageUrl)
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("mask", "url(#bar-mask)");

  // labels on top of bars
  svg
    .selectAll("text.bar-label")
    .data(yearCounts)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", (d) => x(d.year) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.count) - 6)
    .attr("text-anchor", "middle")
    .text((d) => d.count)
    .style("font-size", "12px")
    .style("fill", "#111")
    .style("font-weight", "400");

  // 4. X-axis only
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
