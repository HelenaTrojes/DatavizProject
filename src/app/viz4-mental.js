import * as d3 from "d3";

const width = 800;
const height = 450;
const margin = { top: 40, right: 120, bottom: 50, left: 60 };

const visContainer = d3.select("#chart-container");

const svg = visContainer
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

export async function initialize() {
  return [drawThreatChart];
}

const drawThreatChart = async () => {
  svg.selectAll("*").remove();

  const data = await d3.csv("/data/shootings.csv");

  const filtered = data.filter(
    (d) => d.signs_of_mental_illness !== "" && d.threat_level !== ""
  );

  const labelMap = {
    TRUE: "Shows Signs",
    FALSE: "No Signs",
  };

  const grouped = d3.rollups(
    filtered,
    (v) => {
      const total = v.length;
      const counts = d3.rollup(
        v,
        (g) => g.length,
        (d) => d.threat_level
      );
      return {
        total,
        ...Object.fromEntries(counts),
      };
    },
    (d) => labelMap[d.signs_of_mental_illness] || d.signs_of_mental_illness
  );

  const threatLevels = ["attack", "other", "undetermined"];

  const normalizedData = grouped.map(([key, value]) => {
    const entry = { group: key };
    const total = value.total;
    threatLevels.forEach((t) => {
      entry[t] = (value[t] || 0) / total;
    });
    return entry;
  });

  const x = d3
    .scaleBand()
    .domain(normalizedData.map((d) => d.group))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const y = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal().domain(threatLevels).range([
    "#5b7fa3", // attack – darkest
    "#89a7c2", // other – medium
    "#dce4ec", // undetermined – lightest
  ]);

  const stacked = d3.stack().keys(threatLevels)(normalizedData);

  const tooltip = d3.select(".tooltip");

  svg
    .append("g")
    .selectAll("g")
    .data(stacked)
    .join("g")
    .attr("fill", (d) => color(d.key))
    .selectAll("rect")
    .data((d) => d.map((segment) => ({ ...segment, key: d.key })))
    .join("rect")
    .attr("x", (d) => x(d.data.group))
    .attr("y", (d) => y(d[1]))
    .attr("height", (d) => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .style("cursor", "pointer")

    .on("mouseover", function () {
      tooltip.style("opacity", 1);
    })
    .on("mousemove", function (event, d) {
      const group = d.data.group;
      const percent = ((d[1] - d[0]) * 100).toFixed(1);
      const hasMentalIllness = group === "Shows Signs" ? "True" : "False";
      const threatLevel = d.key.charAt(0).toUpperCase() + d.key.slice(1);

      tooltip
        .html(
          `<strong>Threat Level:</strong> ${threatLevel}<br/>
       <strong>Signs of Mental Illness:</strong> ${hasMentalIllness}<br/>
       <strong>Proportion:</strong> ${percent}%`
        )
        .style("left", event.pageX + 0 + "px")
        .style("top", event.pageY - 100 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // Add axes
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5, "%"));

  // Add labels for the axis
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Proportion of Threat Classification");

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 6) // adjust this to be slightly below the x-axis
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Signs of Mental Illness");

  // the legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - margin.right + 10},${margin.top})`);

  [...threatLevels].reverse().forEach((key, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);

    g.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(key));
    g.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(key)
      .style("font-size", "12px");
  });
};
