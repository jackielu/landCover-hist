// D3 code goes here - all based on examples from Scott Murray's Interactive Data Visualization for Web   http://chimera.labs.oreilly.com/books/1230000000345

//set variables for the SVG element
var w = 3600;
var h = 300;

var wS = 800;

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

var dataset, dataset2;

var layerID, dataID;  //var for saving button click IDs

var dataHist; //var for storing histogram values

//CALL THE LandCover Summary DATA
d3.json("data/landcoversumm.geojson", function(data) {
dataset = data;
//window.dataset = dataset;
//console.log(dataset);

//code for creating the bar graph
var dImperv_P = dataset.features.map(function (d) {
    return d.properties.Imperv_P
});
window.dImperv_P = dImperv_P;
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

var xScale = d3.scale.ordinal()
    .domain(d3.range(dImperv_P.length))
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
    });

    
//create text labels
svgBar.selectAll("text")
    .data(dImperv_P)
    .enter()
    .append("text")
    .text(function(d) {
        return d3.round(d);
        })
    .attr("x", function(d, i) {
        return xScale(i) + (w / dImperv_P.length - barPadding) / 2;
        })
    .attr("y", function(d) {
        return h - yScale(d) + 14;              // +14
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("fill", "white")
    .attr("text-anchor", "middle");

d3.select("p")
    .on("click", function() {

    //New values for dataset
    var dCan_P = dataset.features.map(function (d) {
            return d.properties.Can_P
        });

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
        .attr("fill", function(d) {   // <-- Down here!
            return "rgb(0, 0, " + (d * 10) + ")";
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
    });

//code for creating histogram
var xScaleHist = d3.scale.linear()
    .domain([0,100])
    .range([padding, wH - padding]);

var dImpervHist = d3.layout.histogram()
    .bins(xScaleHist.ticks(10))
    (dImperv_P);

var yScaleHist = d3.scale.linear()
    .domain([0, d3.max(dImpervHist, function(d) { return d.length; })])
    .range([h - padding, padding])
    .nice();

window.dImpervHist = dImpervHist;

//create the bars
svgHist.selectAll("rect")
    .data(dImpervHist)
    .enter()
    .append("rect")
    // .attr("x", function(d, i) {
    //     return xScaleHist(i);
    // })
    .attr("x", function(d) { return xScaleHist(d.x)})
    .attr("y", function(d) {
        return yScaleHist(d.length);
    })
    .attr("width", xScaleHist(dImpervHist[0].dx)/2)
    //.attr("width", xScaleHist(wS / dImpervHist.length))
    //.attr("width", dImpervHist[0].dx)
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

var yAxis = d3.svg.axis()
    .scale(yScaleHist)
    .orient("left")

var yAxis2 = svgHist.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);


//START update on click code
//listeners for layer li clicks
$(".layer").on("click", function() {
    console.log(this)

    layerID = $(this).attr("id");
    window.layerID = layerID;

    //this switches the data values depending on the "id" of the clicked DOM element
    switch(layerID){
        case "Grass_P":
            thisDataSet = dGrass_P;
            break;
        case "Imperv_P":
            thisDataSet = dImperv_P;
            break;
        case "Can_P":
            thisDataSet = dCan_P;
            break;
    }

    window.thisDataSet = thisDataSet;

    // format the data into a histogram
    dataHist = d3.layout.histogram()
        .bins(xScaleHist.ticks(10))
        (thisDataSet);

    window.dataHist = dataHist;

    var yScaleHist = d3.scale.linear()
        .domain([0, d3.max(dataHist, function(d) { return d.length; })])
        .range([h - padding, padding])
        .nice();

    //Update all histogram rects
    svgHist.selectAll("rect")
        .data(dataHist)
        .transition()
        .duration(1000)
        .attr("y", function(d) {
            return yScaleHist(d.length);
        })
        .attr("height", function(d) {
            return (h - padding) - yScaleHist(d.length);
        })
        .attr("fill", function(d) {
            switch(layerID){
                case "Grass_P":
                    return colorGrass(d.x);
                    break;
                case "Imperv_P":
                    return colorImperv(d.x);
                    break;
                case "Can_P":
                    return colorCan(d.x);
                    break;
            }
        // })
        // .on('mouseover', function(d) {
        //     switch(layerID){
        //         case "Grass_P":
        //             d3.selectAll("[fill='"+colorGrass(d.x)+"']")
        //                 .style("fill","#F1B6DA");
        //             break;
        //         case "Imperv_P":
        //             d3.selectAll("[fill='"+colorImperv(d.x)+"']")
        //                 .style("fill","#F1B6DA");
        //             break;
        //         case "Can_P":
        //             d3.selectAll("[fill='"+colorCan(d.x)+"']")
        //                 .style("fill","#F1B6DA");
        //             break;
        //     }
        // })
        // .on('mouseout', function(d) {
        //     switch(layerID){
        //         case "Grass_P":
        //             d3.selectAll("[fill='"+colorGrass(d.x)+"']")
        //                 .style("fill", colorGrass(d.x));
        //             break;
        //         case "Imperv_P":
        //             d3.selectAll("[fill='"+colorImperv(d.x)+"']")
        //                 .style("fill", colorImperv(d.x));
        //             break;
        //         case "Can_P":
        //             d3.selectAll("[fill='"+colorCan(d.x)+"']")
        //                 .style("fill", colorCan(d.x));
        //             break;
        //     }
        });

    //update histogram bar labels
    svgHist.selectAll("text")
        .data(dataHist)
        .transition()
        .duration(3000)
        .text(function(d) {
            return d3.round(d.length);
        })
        .attr("y", function(d) {
            return yScaleHist(d.length) -10;              
        });

    //update histogram axis scale
    yAxis.scale(yScaleHist);
    yAxis2.call(yAxis);

    //Update all BAR CHART rects
    svgBar.selectAll("rect")
        .data(thisDataSet)
        .transition()
        .duration(1000)
        .attr("y", function(d) {
            return h - yScale(d);
        })
        .attr("height", function(d) {
            return yScale(d);
        })
        .attr("fill", function(d) {
            switch(layerID){
                case "Grass_P":
                    return colorGrass(d);
                    break;
                case "Imperv_P":
                    return colorImperv(d);
                    break;
                case "Can_P":
                    return  colorCan(d);
                    break;
            }
        });
    

    svgBar.selectAll("text")
        .data(thisDataSet)
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
}) //END update on click code

});

