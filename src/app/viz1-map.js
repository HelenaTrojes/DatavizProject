import * as d3 from "d3";
import * as topojson from "topojson-client";

export async function initialize() {
  const container = d3.select("#viz");

  // Read actual container width (not window width)
  const containerWidth = container.node().getBoundingClientRect().width;
  const width = containerWidth;
  const height = window.innerHeight * 0.7;

  const us = await d3.json("/data/states-10m.json");
  const shootings = await d3.csv("/data/shootings.csv", (d) => ({
    longitude: +d.longitude,
    latitude: +d.latitude,
  }));

  const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  const svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g").attr("class", "map");

  const states = topojson.feature(us, us.objects.states);

  g.selectAll("path")
    .data(states.features)
    .join("path")
    .attr("d", path)
    .attr("fill", "#f5f5f5")
    .attr("stroke", "#aaa");

  const jitterAmount = 0.1;

  g.selectAll("circle")
    .data(shootings)
    .join("circle")
    .attr("cx", (d) => {
      const coords = projection([
        d.longitude + jitterAmount * (Math.random() - 0.5),
        d.latitude + jitterAmount * (Math.random() - 0.5),
      ]);
      return coords ? coords[0] : null;
    })
    .attr("cy", (d) => {
      const coords = projection([
        d.longitude + jitterAmount * (Math.random() - 0.5),
        d.latitude + jitterAmount * (Math.random() - 0.5),
      ]);
      return coords ? coords[1] : null;
    })
    .attr("r", 2)
    .attr("fill", "crimson")
    .attr("opacity", 0.5);
}
