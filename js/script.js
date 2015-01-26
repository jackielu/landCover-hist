// D3 code goes here - all based on examples from Scott Murray's Interactive Data Visualization for Web   http://chimera.labs.oreilly.com/books/1230000000345

//set variables for the SVG element
var w = 3600;
var h = 300;

// var wS = 800;
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

// var layerID, dataID;  //var for saving button click IDs

// var dataHist; //var for storing histogram values

//CALL THE LandCover Summary DATA
d3.json("data/landcoversumm.geojson", function(data) { //start of D3.json call

dataset = data;
//window.dataset = dataset;
//console.log(dataset);

//BAR GRAPH d3 CODE
//define variable for impervious cover
var dImperv_P = dataset.features.map(function (d) {
    return d.properties.Imperv_P
});
//window.dImperv_P = dImperv_P;
// console.log(dImperv_P);

var dGrass_P = dataset.features.map(function (d) {
    return d.properties.Grass_P
});

var dCan_P = dataset.features.map(function (d) {
    return d.properties.Can_P
});

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
        return colorImperv(d);
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


//code for creating histog

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
    .attr("fill", "#4682B4")
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
            .attr("y", function(d) {
                return h - yScale(d);
            })
            .attr("height", function(d) {
                return yScale(d);
            })
            .attr("fill", function(d) {   
                return colorCan(d);
            });

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
            .text(function(d) {
                return d3.round(d);
            })
            .attr("y", function(d) {
                return h - yScale(d) + 14;              // +14
            })
            .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
            })

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
            .attr("y", function(d) {
                return yScaleHist(d.length);
            })
            .attr("height", function(d) {
                return (h - padding) - yScaleHist(d.length);
            })
            .attr("fill", function(d){
                return colorCan(d.x);
            });

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
            .text(function(d) {
                return d3.round(d.length);
            })
            .attr("y", function(d) {
                return yScaleHist(d.length) -10;              
            });
    });//end d3.select for Can_P

d3.select("#Imperv_P") //start d3.select for #Imperv_P
    .on("click", function() {
        //Update all rects
        svgBar.selectAll("rect")
            .data(dImperv_P)
            .transition()
            .duration(1000)
            .attr("y", function(d) {
                return h - yScale(d);
            })
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
    });//end d3.select for Grass_P


// //START update on click code
// //listeners for layer li clicks
// $(".layer").on("click", function() {
//     console.log(this);
//     layerID = $(this).attr("id");
//     //window.layerID = layerID;
//     console.log(layerID);
//     //this switches the data values depending on the "id" of the clicked DOM element
//     switch(layerID){
//         case "Grass_P":
//             thisDataSet = dGrass_P;
//             break;
//         case "Imperv_P":
//             thisDataSet = dImperv_P;
//             break;
//         case "Can_P":
//             thisDataSet = dCan_P;
//             break;
//     }
//     //window.thisDataSet = thisDataSet;
//     console.log(thisDataSet);
//     // format the data into a histogram
//     dataHist = d3.layout.histogram()
//         .bins(xScaleHist.ticks(10))
//         (thisDataSet);
//     window.dataHist = dataHist;
//     // update values for yScale of histogram
//     var yScaleHist = d3.scale.linear()
//         .domain([0, d3.max(dataHist, function(d) { return d.length; })])
//         .range([h - padding, padding])
//         .nice();

//     //Update all histogram rect values with selected dataset
//     svgHist.selectAll("rect")
//         .data(dataHist)
//         .transition()
//         .duration(1000)
//         .attr("y", function(d) {
//             return yScaleHist(d.length);
//         })
//         .attr("height", function(d) {
//             return (h - padding) - yScaleHist(d.length);
//         });
//     //style all histogram rect values based on color scale for selected dataset
//     switch(layerID){
//         case "Grass_P":
//             svgHist.selectAll("rect")
//                 .attr("fill", function(d){
//                     return colorGrass(d.x);
//                 })
//                 .on('mouseover', function(d) {
//                     d3.selectAll("[fill='"+colorGrass(d.x)+"']")
//                     .style("fill","#F1B6DA");
//                 })
//                 .on('mouseout', function(d) {
//                     d3.selectAll("[fill='"+colorGrass(d.x)+"']")
//                     .style("fill", colorGrass(d.x));
//                 });
//             break;
//         case "Imperv_P":
//             svgHist.selectAll("rect")
//                 .attr("fill", function(d){
//                     return colorImperv(d.x);
//                 })
//                 .on('mouseover', function(d) {
//                     d3.selectAll("[fill='"+colorImperv(d.x)+"']")
//                     .style("fill","#F1B6DA");
//                 })
//                 .on('mouseout', function(d) {
//                     d3.selectAll("[fill='"+colorImperv(d.x)+"']")
//                     .style("fill", colorImperv(d.x));
//                 });
//             break;
//         case "Can_P":
//             svgHist.selectAll("rect")
//                 .attr("fill", function(d){
//                     return colorCan(d.x);
//                 })
//                 .on('mouseover', function(d) {
//                     d3.selectAll("[fill='"+colorCan(d.x)+"']")
//                     .style("fill","#F1B6DA");
//                 })
//                 .on('mouseout', function(d) {
//                     d3.selectAll("[fill='"+colorCan(d.x)+"']")
//                     .style("fill", colorCan(d.x));
//                 });
//             break;
//     }
//     //update histogram bar labels
//     svgHist.selectAll("text")
//         .data(dataHist)
//         .transition()
//         .duration(3000)
//         .text(function(d) {
//             return d3.round(d.length);
//         })
//         .attr("y", function(d) {
//             return yScaleHist(d.length) -10;              
//         });
//     //update histogram axis scale
//     yAxis.scale(yScaleHist);
//     yAxis2.call(yAxis);
//     //Update all BAR CHART rects
//     svgBar.selectAll("rect")
//         .data(thisDataSet)
//         .transition()
//         .duration(1000)
//         .attr("y", function(d) {
//             return h - yScale(d);
//         })
//         .attr("height", function(d) {
//             return yScale(d);
//         })
//         .attr("fill", function(d) {
//             switch(layerID){
//                 case "Grass_P":
//                     return colorGrass(d);
//                     break;
//                 case "Imperv_P":
//                     return colorImperv(d);
//                     break;
//                 case "Can_P":
//                     return  colorCan(d);
//                     break;
//             }
//         });
//     svgBar.selectAll("text")
//         .data(thisDataSet)
//         .transition()
//         .duration(3000)
//         .text(function(d) {
//             return d3.round(d);
//         })
//         .attr("y", function(d) {
//             return h - yScale(d) + 14;              // +14
//         })
//         .attr("x", function(d, i) {
//             return xScale(i) + xScale.rangeBand() / 2;
//         })
// }) //END update on click code


});  //end of D3.json call


