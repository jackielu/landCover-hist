D3 code for bar charts and histograms of 2010 NYC landcover data (by NTA) 

Live on gh-pages at http://jackielu.github.io/landCover-hist/


COMPLETED BITS
1) includes "updates on click" functionality 
2) color for histogram are cover type specific
3) have clicks also update the main bar chart
4) break code up into different files
5) hover interactivity btwn histogram and bar graph
6) transitions to axis
7) added map and interactivity



IN PROGRESS  

Implement zoom to bounding box on click as per
http://bl.ocks.org/mbostock/4699541
  ? should you get rid of leaflet?  do you need it here?
  ? or do you combine the "clicked" bounding box code with that in http://bost.ocks.org/mike/leaflet/

  -> actually this one is better  http://bl.ocks.org/mbostock/9656675


NOT FINISHED STUFF
... update clicks to also update map data

... adding axes to the graphs.  need to add in missing "g" elements and a proper set of margins, maybe?

... have ticks - where are the lines??

*** not working properly *** occassionally when the buttons are clicked - color ramps for the histogram or bar chart does not completely update.



TO BE DONE BITS
...  add the cover types that remain
...  work in the skeleton styling
...  add pop-up graph for NTA
...  add new layers