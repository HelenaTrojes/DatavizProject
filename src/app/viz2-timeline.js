import * as d3 from "d3";

const width = 600;
const height = 300;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

const svg = d3
  .select("#viz2")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .style("background", "#f8f8f8");

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

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#000")
    .style("color", "#fff")
    .style("padding", "5px 10px")
    .style("border-radius", "4px")
    .style("opacity", 0);

  svg
    .selectAll("rect")
    .data(yearCounts)
    .join("rect")
    .attr("x", (d) => x(d.year))
    .attr("y", (d) => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => y(0) - y(d.count))
    .attr("fill", "#457b9d")
    .on("mouseover", (event, d) => {
      tooltip.transition().duration(100).style("opacity", 0.9);
      tooltip
        .html(`${d.year}: ${d.count} shootings`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(300).style("opacity", 0);
    });

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));
}

function noop() {
  svg.selectAll("rect").transition().duration(300).attr("opacity", 0);
}
