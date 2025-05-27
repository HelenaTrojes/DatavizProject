import * as d3 from "d3";
import iconPerson from "../assets/man.svg?raw";

export async function initialize() {
  const container = d3.select("#weapons-chart-container");
  const raw = await d3.csv("/data/shootings.csv");

  function categorize(armed) {
    const val = armed.toLowerCase();
    if (val.includes("gun") || val.includes("firearm")) return "Gun";
    if (
      val.includes("knife") ||
      val.includes("machete") ||
      val.includes("sword")
    )
      return "Knife";
    if (val.includes("car") || val.includes("vehicle") || val.includes("truck"))
      return "Car";
    if (val.includes("unarmed")) return "Unarmed";
    if (val.includes("toy") || val.includes("replica") || val.includes("fake"))
      return "Toy/Replica Gun";
    if (
      val.includes("taser") ||
      val.includes("shovel") ||
      val.includes("hammer") ||
      val.includes("blunt") ||
      val.includes("bat") ||
      val.includes("pipe") ||
      val.includes("stick")
    )
      return "Other";
    return "Other";
  }

  function getScaledSample(data, total = 48) {
    const filtered = data.filter(
      (d) => d.armed && d.armed.trim().toLowerCase() !== "unknown"
    );

    const counts = d3.rollups(
      filtered,
      (v) => v.length,
      (d) => categorize(d.armed)
    );

    const sum = d3.sum(counts, (d) => d[1]);

    let scaled = counts.map(([category, count]) => ({
      category,
      count: Math.round((count / sum) * total),
    }));

    const delta = total - d3.sum(scaled, (d) => d.count);
    if (delta !== 0) scaled[0].count += delta;

    const colorMap = {
      Gun: "#222",
      Knife: "#b03a2e",
      Car: "#e67e22",
      Unarmed: "#7f8c8d",
      "Toy/Replica Gun": "#bd9f46",
      Other: "#2980b9",
    };

    return scaled
      .map((d) => ({ ...d, color: colorMap[d.category] || "#555" }))
      .sort((a, b) => b.count - a.count);
  }

  function draw(data) {
    container.selectAll("svg").remove();

    const iconSize = 60;
    const gap = 5;
    const iconsPerRow = 5;
    const groupPadding = 60;

    const columnWidth = iconsPerRow * (iconSize + gap);
    const maxRows = Math.max(
      ...data.map((d) => Math.ceil(d.count / iconsPerRow))
    );

    const visualHeight = maxRows * (iconSize + gap) + 150;
    const height = visualHeight + 30; // viewBox height includes extra bottom space

    const width = data.length * (columnWidth + groupPadding);

    const svg = container
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("margin", "0 auto");

    const g = svg.append("g").attr("transform", "translate(0,10)");

    data.forEach((group, i) => {
      const startX = i * (columnWidth + groupPadding);
      const iconsInRow = Math.min(group.count, iconsPerRow);
      const usedWidth = iconsInRow * (iconSize + gap) - gap;

      const groupG = g.append("g").attr("transform", `translate(${startX}, 0)`);

      for (let j = 0; j < group.count; j++) {
        const col = j % iconsPerRow;
        const row = Math.floor(j / iconsPerRow);
        const x = col * (iconSize + gap);
        const y = visualHeight - 100 - row * (iconSize + gap); // bottom-up

        const icon = groupG
          .append("g")
          .attr("transform", `translate(${x}, ${y})`)
          .attr("class", "person-icon");

        const svgNode = new DOMParser().parseFromString(
          iconPerson,
          "image/svg+xml"
        ).documentElement;

        svgNode.setAttribute("width", iconSize);
        svgNode.setAttribute("height", iconSize);
        svgNode.setAttribute("fill", group.color);
        svgNode.setAttribute("stroke", "#fff");
        svgNode.setAttribute("stroke-width", "1");
        svgNode.style.pointerEvents = "none";

        icon.node().appendChild(svgNode);
      }

      groupG
        .append("text")
        .attr("x", usedWidth / 2)
        .attr("y", visualHeight - 10) // safe from clipping
        .attr("text-anchor", "middle")
        .text(group.category)
        .attr("font-size", "2rem")
        .attr("font-weight", "700")
        .attr("fill", "#111")
        .attr("font-family", "Newsreader, serif");
    });
  }

  draw(getScaledSample(raw, 48));
}
