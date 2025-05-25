"use strict";

import "../assets/styles/style.scss";

import { initialize as map } from "./viz1-map";
import { initialize as timeline } from "./viz2-timeline";
import { initialize as race } from "./viz3-racebar";
import { initialize as mental } from "./viz4-mental";
import victimNames from "../assets/police_shooting_victim_names.txt?raw";

// Load all visualizations
map();
timeline();
mental();

// Initialize the timeline chart
timeline().then(([drawBars]) => drawBars());
// Initialize and draw the race chart
race().then(([drawChart]) => drawChart());

// Inject victim names into background
const container = document.querySelector(".background-names");
if (container) {
  const names = victimNames
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 1);

  container.innerHTML = names.map((name) => `<span>${name}</span>`).join(" ");
}
