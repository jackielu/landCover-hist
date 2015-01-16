D3 code for bar charts and histograms of 2010 NYC landcover data (by NTA) 

Live on gh-pages at http://jackielu.github.io/landCover-hist/


COMPLETED BITS
1) includes "updates on click" functionality 
2) color for histogram are cover type specific
3) have clicks also update the main bar chart
4) break code up into different files


IN PROGRESS
...  add hover interactivity between the histogram (1st graph) and the bar graph (2nd graph)
--> issue:  adding mouseover and mouseout events works OK on the initial set of rects in the histogram; but adding mouseover and mouseout events with "switch" functions seems to break the updating in the bar chart
    ** you can see how this breaks by uncommenting the code in lines 289-320 in script.js  **



TO BE DONE BITS
...  add the cover types that remain
...  work in the skeleton styling
...  add the map
...  add zoom on NTA click
...  add pop-up graph for NTA
...  add new layers