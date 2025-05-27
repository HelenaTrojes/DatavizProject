"use strict";

import "../assets/styles/style.scss";
import { initialize as map } from "./viz1-map";
import { initialize as timeline } from "./viz2-timeline";
import { initialize as race } from "./viz3-racebar";
import { initialize as mental } from "./viz4-mental";
import { initialize as age } from "./viz5-age";
import victimNames from "../assets/police_shooting_victim_names.txt?raw";
import * as d3 from "d3";

// Visualizations
map();
timeline().then(([drawBars]) => drawBars());
race().then(([drawChart]) => drawChart());
mental();
age();

// Victim names in background
const container = document.querySelector(".background-names");
if (container) {
  const names = victimNames
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 1);

  container.innerHTML = names.map((name) => `<span>${name}</span>`).join(" ");
}

// Fatal victim count + year range in intro
function initializeIntroStats() {
  d3.csv("/data/shootings.csv").then((data) => {
    const victimCount = data.length;

    const years = data
      .map((d) => new Date(d.date).getFullYear())
      .filter((y) => !isNaN(y));
    const minYear = d3.min(years);
    const maxYear = d3.max(years);

    const countEl = document.getElementById("victim-count");
    const rangeEl = document.getElementById("year-range");

    if (countEl) countEl.textContent = victimCount.toLocaleString();
    if (rangeEl) rangeEl.textContent = `${minYear}–${maxYear}`;
  });
}

initializeIntroStats();
