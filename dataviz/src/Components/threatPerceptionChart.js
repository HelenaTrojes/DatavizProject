import * as d3 from 'd3';

async function drawChart() {
  const data = await d3.csv('/dataset.csv');

  // Filter out empty rows
  const filtered = data.filter(d => d.signs_of_mental_illness !== '' && d.threat_level !== '');

  // Group and normalize data
  const grouped = d3.rollups(
    filtered,
    v => {
      const total = v.length;
      const counts = d3.rollup(
        v,
        g => g.length,
        d => d.threat_level
      );
      return {
        total,
        ...Object.fromEntries(counts)
      };
    },
    d => d.signs_of_mental_illness
  );

  const threatLevels = ['attack', 'other', 'undetermined'];

  const normalizedData = grouped.map(([key, value]) => {
    const entry = { group: key };
    const total = value.total;
    threatLevels.forEach(t => {
      entry[t] = (value[t] || 0) / total;
    });
    return entry;
  });

  // SVG setup
  const chartWidth = 500;
  const width = chartWidth + 150;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };

  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // X and Y axis
  const x = d3.scaleBand()
    .domain(normalizedData.map(d => d.group))
    .range([margin.left, chartWidth - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal()
    .domain(threatLevels)
    .range(['#d73027', '#fee08b', '#4575b4']);

  const stacked = d3.stack()
    .keys(threatLevels)(normalizedData);

  // Draw bars
  svg.append('g')
    .selectAll('g')
    .data(stacked)
    .join('g')
    .attr('fill', d => color(d.key))
    .selectAll('rect')
    .data(d => d)
    .join('rect')
    .attr('x', d => x(d.data.group))
    .attr('y', d => y(d[1]))
    .attr('height', d => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth());

  // x axis
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", height - 7) // just below the x-axis
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Signs of Mental Illness");

  // y axis
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5, "%"));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Percentage of Threat Level");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 3)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Threat Level by Mental Illness Status");

  // Adding gridlines 
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(y)
        .tickValues(y.ticks().filter(tick => tick > 0))
        .tickSize(-chartWidth + margin.left + margin.right) // extend line across chart
        .tickFormat('') // hide tick text (we already have it)
    )
    .selectAll("line")
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "3,3");

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${chartWidth + 10},${margin.top})`);

  threatLevels.forEach((key, i) => {
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


  // Adding tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "5px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  svg.append('g')
    .selectAll('g')
    .data(stacked)
    .join('g')
    .attr('fill', d => color(d.key))
    .selectAll('rect')
    .data(d => d)
    .join('rect')
    .attr('x', d => x(d.data.group))
    .attr('y', d => y(d[1]))
    .attr('height', d => y(d[0]) - y(d[1]))
    .attr('width', x.bandwidth())

    .on("mouseover", function (event, d) {
      const threat = d3.select(this.parentNode).datum().key;
      const mentalIllness = d.data.group;
      const value = ((d[1] - d[0]) * 100).toFixed(1) + '%';

      d3.select(this)
        .transition()
        .duration(200)
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .style("cursor", "pointer");

      tooltip.transition().duration(200).style("opacity", 0.95);
      tooltip.html(`
    <strong>Threat Level:</strong> ${threat}<br/>
    <strong>Signs of Mental Illness:</strong> ${mentalIllness}<br/>
    <strong>Proportion:</strong> ${value}
  `)
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 35) + "px");
    })



    .on("mousemove", function (event) {
      tooltip.style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 35) + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("stroke", null)
        .attr("stroke-width", null);

      tooltip.transition().duration(200).style("opacity", 0);
    });

}

drawChart();
