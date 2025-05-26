import * as d3 from 'd3';
import './style.css';
import * as topojson from 'topojson-client';


// 0) Preparation
// --------------
let currentYear = 2019;


// 1) Data Loading
// ---------------

// Load the map data
const usMap = await d3.json('../data/states-10m.json');

const projection = d3.geoAlbersUsa();
const path = d3.geoPath().projection(projection);

// Load the shooting data
/*
    When we read a file in d3 we can use a second argument (an anonymous function)
    that gives us access to the current read row or obj. This allows us to
    restructure or manipulate our date while reading it.
 */
const shootingsData = await d3.csv('../data/shootings.csv', (row) => {
    return {
        longitude: +row['longitude'],
        latitude: +row['latitude'],
        // Instert ;
    };
});



// 2) Chart Dimensions
// --------------------

const width = window.innerWidth * 0.9;
const height = window.innerHeight * 0.7;


// 3) Create the SVG
// -------------------
const svg = d3.select('#viz')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

const bounds = svg.append('g')
    .attr('class', 'mapViz');




// 5) Draw the Data
// ----------------

// Generator just needs to know what projection to use

// Draw the map
const states = topojson.feature(usMap, usMap.objects.states);

bounds.selectAll('path')
    .data(states.features)
    .join('path')
    .attr('d', path)
    .attr('fill', '#eee')
    .attr('stroke', '#999');

const jitter = 0.1 * (Math.random() - 0.5);


// Draw deaths as circles on the map
bounds.selectAll('circle')
    .data(shootingsData)
    .join('circle')
    .attr('cx', d => {
        const coords = projection([+d.longitude + jitter, +d.latitude + jitter]);
        return coords ? coords[0] : null;
    })
    .attr('cy', d => {
        const coords = projection([+d.longitude + jitter, +d.latitude + jitter]);
        return coords ? coords[1] : null;
    })
    .attr('r', 1.5)
    .attr('fill', 'crimson')
    .attr('opacity', 0.4);
