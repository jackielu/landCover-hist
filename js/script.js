//d3 + Leaflet code based heavily on http://bost.ocks.org/mike/leaflet/

//SET UP OUR Leaflet map
var map = L.map('map',{zoomControl:false}).setView([40.7056258,-73.97968], 11)

var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    minZoom: 10,
    maxZoom: 18
}).addTo(map);


//this adds a new zoom control in the specified position.  requires setting zoomControl:false in L.map
L.control.zoom({position: "topright"}).addTo(map);


//Add SVG element for map to Leaflet’s overlay pane. Leaflet automatically repositions the overlay pane when the map pans. SVG dimensions are set dynamically b/c they change on zoom. 
var svgMap = d3.select(map.getPanes().overlayPane)
    .append("svg");

//"g" group element used to translate so that top-left corner of the SVG, ⟨0,0⟩, corresponds to Leaflet’s layer origin. The leaflet-zoom-hide class hides overlay during Leaflet’s zoom animation.
var gMap = svgMap.append("g")
    .attr("class", "leaflet-zoom-hide");



// D3 graph / histogram code here all based on examples from Scott Murray's Interactive Data Visualization for Web   http://chimera.labs.oreilly.com/books/1230000000345 and D3.js Tips and Tricks by Malcolm Maclean

//define the margin of the SVG element that is appended to the DOM as per Bostock's margin convention http://bl.ocks.org/mbostock/3019563
var margin = {top: 30, right: 20, bottom: 30, left: 50};

//dimension of the SVG rectangle for the bar chart
var w = 3600 - margin.left - margin.right;
var h = 300 - margin.top - margin.bottom;

// //set variables for the SVG element
// var w = 3600;
// var h = 300;

var wH = 900;

var padding = 30;

//create the SVG element appended to the body of the page
var svgBar = d3.select("#barDiv")
.append("svg")
.attr("width", w)
.attr("height", h);

var svgHist = d3.select("#histDiv")
.append("svg")
.attr("width", wH)
.attr("height", h);

var barPadding = 2;

var dataset;
var dataset2;



//CALL THE LandCover Summary DATA
d3.json("data/landcoversumm.geojson", function(data) { //start of D3.json call

dataset = data;
//window.dataset = dataset;
//console.log(dataset);

//define variable for impervious cover
var dImperv_P = dataset.features.map(function (d) { return d.properties.Imperv_P });
//window.dImperv_P = dImperv_P;
// console.log(dImperv_P);

var dGrass_P = dataset.features.map(function (d) { return d.properties.Grass_P });

var dCan_P = dataset.features.map(function (d) { return d.properties.Can_P });

//SET UP THE COLOR SCALES THAT TAKE INPUT VALUE AND OUTPUT A COLOR
//color scale for Imperv_P value
var colorImperv = d3.scale.quantize()
    .range(["#b0aa9e","#9d9f9c","#8b9498","#798993","#677d8d", "#567287","#46687f","#365d77","#26526d","#144763"])
    .domain([0, 100]);

//color scale for the Can_P value
var colorCan = d3.scale.quantize()
    .range(["#adac8f", "#98a381", "#849974", "#718e67", "#5f845b", "#4e794f", "#3e6e44", "#2g633a", "#205831", "#124d28"])
    .domain([0, 100]);

//color scale for Grass_P value
var colorGrass = d3.scale.quantize()
    .range(["#e5e09b", "#cfcb8b", "#b9b67b", "#a4a16c", "#8f8d5d", "#7b794f", "#676641", "#545434", "#424227", "#31311c"])
    .domain([0, 100]);


//CODE FOR MAP
// create a d3.geo.path to convert GeoJSON to SVG:
var transform = d3.geo.transform({point: projectPoint}),
    path = d3.geo.path().projection(transform);

// create path elements for each of the features using D3’s data join:
var feature = gMap.selectAll("path")
    .data(dataset.features)
    .enter()
    .append("path")
    .attr("d",path)
    .attr("fill", function (d) { return colorImperv(d.properties.Imperv_P) })
    // .on('mouseover', function (d) {
    //     d3.selectAll("[fill='"+colorImperv(d.properties.Imperv_P)+"']")
    //     .style("fill","#F1B6DA");
    // })
    // .on('mouseout', function (d) {
    //     d3.selectAll("[fill='"+colorImperv(d.properties.Imperv_P)+"']")
    //     .style("fill",colorImperv(d.properties.Imperv_P));
    // })
    ;


// //assign a class to a D3 feature based on data attributes
// feature.attr('id',function(d) {return d.properties.UniqueID;})
//   .attr('class', function(d) {return d.properties.Imperv_P;})
//   .attr('bin', function(d) {return colorCan(d.properties.Imperv_P);});

map.on("viewreset", reset);
reset();

// Reposition the SVG to cover the features.  Comput the projected bounding box of our features using our custom transform to convert the longitude and latitude to pixels:
function reset() {
    var bounds = path.bounds(dataset),
      topLeft = bounds[0],
      bottomRight = bounds[1];
      //here we are setting width and height of the attribute layer based on the bounds.  

    //set the dimensions of the SVG with sufficient padding to display features above or to the left of the origin. this is part of "viewreset" event so SVG is repositioned and re-rendered whenever the map zooms
    svgMap .attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");
    gMap   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    //this is actually where we draw the shape on the map; out of the data that we passed turn this into an SVG attribute
    feature.attr("d", path);
}

// Use Leaflet to implement a D3 geometric transformation. 
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}


//d3 CODE FOR BAR CHART
//define axes scales
var xScale = d3.scale.ordinal()
    .domain(d3.range(dImperv_P.length))  //this creates as many values as the dataset is long
    .rangeRoundBands([0, w], 0.05);

var yScale = d3.scale.linear()
    .domain([0, d3.max(dImperv_P)])
    .range([0, h]);

//create the bars
svgBar.selectAll("rect")
    .data(dImperv_P)
    .enter()
    .append("rect")
    .attr("x", function(d, i) {
        return xScale(i);
    })
    .attr("y", function(d) {
        return h - yScale(d);
    })
    .attr("width", xScale.rangeBand())
    .attr("height", function(d) {
        return yScale(d);
    })
    .attr("fill", function(d) {
        return colorImperv(d)
    })
    .on('mouseover', function (d) {
        d3.selectAll("[fill='"+colorImperv(d)+"']")
        .style("fill","#F1B6DA");
    })
    .on('mouseout', function (d) {
        d3.selectAll("[fill='"+colorImperv(d)+"']")
        .style("fill",colorImperv(d));
    });

    
//create text labels
svgBar.selectAll("text")
    .data(dImperv_P)
    .enter()
    .append("text")
    .text(function(d) { return d3.round(d); })
    .attr("x", function(d, i) { return xScale(i) + (w / dImperv_P.length - barPadding) / 2; })
    .attr("y", function(d) { return h - yScale(d) + 14; })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "white")
    .attr("text-anchor", "middle");

//create the x axis
xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .ticks(function(d) { return dImperv_P.length; })
  // .tickFormat(function(d) { return d + "%"; });

xAxis2 = svgBar.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + ( h - padding ) + ")")
    .call(xAxis);


//CODE FOR HISTOGRAM
//define the histogram buckets and set xScale 
var xScaleHist = d3.scale.linear()
    .domain([0,100])
    .range([padding, wH - padding]);

//bin the impervious cover values
var dImpervHist = d3.layout.histogram()
    .bins(xScaleHist.ticks(10))
    (dImperv_P);

//bin the grass cover values
var dGrassHist = d3.layout.histogram()
    .bins(xScaleHist.ticks(10))
    (dGrass_P);

//bin the canopy cover values
var dCanHist = d3.layout.histogram()
    .bins(xScaleHist.ticks(10))
    (dCan_P);

//define the range for the y axis on the histogram (dependent on binned data)
var yScaleHist = d3.scale.linear()
    .domain([0, d3.max(dImpervHist, function(d) { return d.length; })])
    .range([h - padding, padding])
    .nice();

//window.dImpervHist = dImpervHist;

//create the bars
svgHist.selectAll("rect")
    .data(dImpervHist)
    .enter()
    .append("rect")
    .attr("x", function(d) { return xScaleHist(d.x)})
    .attr("y", function(d) {
        return yScaleHist(d.length);
    })
    .attr("width", xScaleHist(dImpervHist[0].dx)/2)
    .attr("height", function(d) {
        return (h - padding) - yScaleHist(d.length);
    })
    .attr("fill", function(d) {
        return colorImperv(d.x);
    })
    .on('mouseover', function (d) {
        d3.selectAll("[fill='"+colorImperv(d.x)+"']")
        .style("fill","#F1B6DA");
        // console.log(d3.selectAll("[bin='"+colorCan(d.x)+"']"))
    })
    .on('mouseout', function (d) {
        d3.selectAll("[fill='"+colorImperv(d.x)+"']")
        .style("fill",colorImperv(d.x));
    });

//create text labels
svgHist.selectAll("text")
    .data(dImpervHist)
    .enter()
    .append("text")
    .text(function(d) {
        return d3.round(d.length);
        })
    .attr("x", function(d) {
        return xScaleHist(d.x) + xScaleHist(dImpervHist[0].dx)/4 ;
        })
    .attr("y", function(d) {
        return yScaleHist(d.length) -10;              
        })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "#fff")
    .attr("text-anchor", "middle");

//create the y axis
var yAxisHist = d3.svg.axis()
    .scale(yScaleHist)
    .orient("left")

//append the y axis to the SVG
var yAxisHist2 = svgHist.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxisHist);

//  D3 based CODE FOR UPDATE ON CLICK
d3.select("#Can_P") //start d3.select for #Can_P
    .on("click", function() {
        //Update all rects
        svgBar.selectAll("rect")
            .data(dCan_P)
            .transition()
            .duration(1000)
            .attr("y", function(d) { return h - yScale(d); })
            .attr("height", function(d) { return yScale(d); })
            .attr("fill", function(d) { return colorCan(d); });

        svgBar.selectAll("rect")
            .on('mouseover', function (d) {
                d3.selectAll("[fill='"+colorCan(d)+"']")
                .style("fill","#F1B6DA");
            })
            .on('mouseout', function (d) {
                d3.selectAll("[fill='"+colorCan(d)+"']")
                .style("fill",colorCan(d));
            });

        svgBar.selectAll("text")
            .data(dCan_P)
            .transition()
            .duration(3000)
            .text(function(d) { return d3.round(d); })
            .attr("y", function(d) { return h - yScale(d) + 14; })
            .attr("x", function(d, i) { return xScale(i) + xScale.rangeBand() / 2; })

        yScaleHist = d3.scale.linear()
            .domain([0, d3.max(dCanHist, function(d) { return d.length; })])
            .range([h - padding, padding])
            .nice();

        //update histogram axis scale
        yAxisHist.scale(yScaleHist);
        yAxisHist2.transition().duration(3000).call(yAxisHist);

        svgHist.selectAll("rect")
            .data(dCanHist)
            .transition()
            .duration(1000)
            .attr("y", function(d) { return yScaleHist(d.length); })
            .attr("height", function(d) { return (h - padding) - yScaleHist(d.length); })
            .attr("fill", function(d){ return colorCan(d.x); });

        svgHist.selectAll("rect")
            .on('mouseover', function(d) {
                d3.selectAll("[fill='"+colorCan(d.x)+"']")
                .style("fill","#F1B6DA");
            })
            .on('mouseout', function(d) {
                d3.selectAll("[fill='"+colorCan(d.x)+"']")
                .style("fill", colorCan(d.x));
            });
        //update histogram bar labels
        svgHist.selectAll("text")
            .data(dCanHist)
            .transition()
            .duration(3000)
            .text(function(d) { return d3.round(d.length); })
            .attr("y", function(d) { return yScaleHist(d.length) -10; });
        //update the map
        gMap.selectAll("path")
            .transition()
            .duration(2000)
            .attr("fill", function (d) { return colorCan(d.properties.Can_P) })

    });//end d3.select for Can_P

d3.select("#Imperv_P") //start d3.select for #Imperv_P
    .on("click", function() {
        //Update all rects
        svgBar.selectAll("rect")
            .data(dImperv_P)
            .transition()
            .duration(1000)
            .attr("y", function(d) { return h - yScale(d); })
            .attr("height", function(d) {
                return yScale(d);
            })
            .attr("fill", function(d) {   
                return colorImperv(d);
            });

        svgBar.selectAll("rect")
            .on('mouseover', function (d) {
                d3.selectAll("[fill='"+colorImperv(d)+"']")
                .style("fill","#F1B6DA");
            })
            .on('mouseout', function (d) {
                d3.selectAll("[fill='"+colorImperv(d)+"']")
                .style("fill",colorImperv(d));
            });
        
        svgBar.selectAll("text")
            .data(dImperv_P)
            .transition()
            .duration(3000)
            .text(function(d) {
                return d3.round(d);
            })
            .attr("y", function(d) {
                return h - yScale(d) + 14;             
            })
            .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
            })

        yScaleHist = d3.scale.linear()
            .domain([0, d3.max(dImpervHist, function(d) { return d.length; })])
            .range([h - padding, padding])
            .nice();

        //update histogram axis scale
        yAxisHist.scale(yScaleHist);
        yAxisHist2.transition().duration(3000).call(yAxisHist);

        svgHist.selectAll("rect")
            .data(dImpervHist)
            .transition()
            .duration(1000)
            .attr("y", function(d) {
                return yScaleHist(d.length);
            })
            .attr("height", function(d) {
                return (h - padding) - yScaleHist(d.length);
            })
            .attr("fill", function(d){
                return colorImperv(d.x);
            });

        svgHist.selectAll("rect")
            .on('mouseover', function(d) {
                d3.selectAll("[fill='"+colorImperv(d.x)+"']")
                .style("fill","#F1B6DA");
            })
            .on('mouseout', function(d) {
                d3.selectAll("[fill='"+colorImperv(d.x)+"']")
                .style("fill", colorImperv(d.x));
            });
        //update histogram bar labels
        svgHist.selectAll("text")
            .data(dImpervHist)
            .transition()
            .duration(3000)
            .text(function(d) {
                return d3.round(d.length);
            })
            .attr("y", function(d) {
                return yScaleHist(d.length) -10;              
            });
        //update the map
        gMap.selectAll("path")
            .transition()
            .duration(2000)
            .attr("fill", function (d) { return colorImperv(d.properties.Imperv_P) })
    });//end d3.select for Imperv_P

d3.select("#Grass_P") //start d3.select for #Grass_P
    .on("click", function() {
        //Update all rects
        svgBar.selectAll("rect")
            .data(dGrass_P)
            .transition()
            .duration(1000)
            .attr("y", function(d) {
                return h - yScale(d);
            })
            .attr("height", function(d) {
                return yScale(d);
            })
            .attr("fill", function(d) {   
                return colorGrass(d);
            });

        svgBar.selectAll("rect")
            .on('mouseover', function (d) {
                d3.selectAll("[fill='"+colorGrass(d)+"']")
                .style("fill","#F1B6DA");
            })
            .on('mouseout', function (d) {
                d3.selectAll("[fill='"+colorGrass(d)+"']")
                .style("fill",colorGrass(d));
            });
        
        svgBar.selectAll("text")
            .data(dGrass_P)
            //.attr("d",dGrass_P)
            .transition()
            .duration(3000)
            .text(function(d) {
                return d3.round(d);
            })
            .attr("y", function(d) {
                return h - yScale(d) + 14;             
            })
            .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
            })

        yScaleHist = d3.scale.linear()
            .domain([0, d3.max(dGrassHist, function(d) { return d.length; })])
            .range([h - padding, padding])
            .nice();

        //update histogram axis scale
        yAxisHist.scale(yScaleHist);
        yAxisHist2.transition().duration(3000).call(yAxisHist);

        svgHist.selectAll("rect")
            .data(dGrassHist)
            .transition()
            .duration(1000)
            .attr("y", function(d) {
                return yScaleHist(d.length);
            })
            .attr("height", function(d) {
                return (h - padding) - yScaleHist(d.length);
            })
            .attr("fill", function(d){
                return colorGrass(d.x);
            });

        svgHist.selectAll("rect")
            .on('mouseover', function(d) {
                d3.selectAll("[fill='"+colorGrass(d.x)+"']")
                .style("fill","#F1B6DA");
            })
            .on('mouseout', function(d) {
                d3.selectAll("[fill='"+colorGrass(d.x)+"']")
                .style("fill", colorGrass(d.x));
            });
        //update histogram bar labels
        svgHist.selectAll("text")
            .data(dGrassHist)
            .transition()
            .duration(3000)
            .text(function(d) {
                return d3.round(d.length);
            })
            .attr("y", function(d) {
                return yScaleHist(d.length) -10;              
            });
        //update the map
        gMap.selectAll("path")
            .transition()
            .duration(2000)
            .attr("fill", function (d) { return colorGrass(d.properties.Grass_P) })
    });//end d3.select for Grass_P

});  //end of D3.json call


