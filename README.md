hopscotch
=========
jquery.hopscotch.js: v1.0.1:21/4/2014
 * http://easyresponsive.com/hopscotch
 * 
 * Copyright 2015 James Ellis-Jones
 * Licensed under Eclipse Public License v1.0 http://www.eclipse.org/legal/epl-v10.html
 
 Depends on jquery and http://benalman.com/projects/jquery-resize-plugin/

Contains two jquery extensions

.hopscotchLayout(layoutIndex, substituteSelector)

Scans children of jQuery object this is called on and looks for 'data-grid-location' attribute.  This contains a string specifying how this child is positioned in a series of indexed layouts.  The specification for each indexed layout is separated by a semicolon:
<layout0>;<layout1>;<layout2> etc
Each layout part specifies a series of coordinates, the first is the row number, the second the column number within that row, the third the row number within that column etc.
<rowindex>,<colindex>,<innerrowindex>,<innercolindex>,<secondinnerrowindex> etc
Normally columns are allocated equal percentage space across the row and rows fit the size of their longest column.  This behaviour can be modified by an integer space weighting (defaults to 1) which multiplies the space allocated to that column.
<colindex>:<space weighting>

Also hopscotchLayout will assign values to attributes according to the layoutIndex.  If an element has an attribute:
data-hs[number]-<attributename>
the plugin will assign the value given for that attribute to the attribute names <attributename> when the index is the optional [number].  If number is omitted, the plugin will assign the value of that attribute to <attributename> in the absence of another specific attribute for the current layoutIndex.  If the optional 'substituteSelector' argument is supplied, only elements matching that selector will be checked, which will increase efficiency.

HopscotchLayout preserves events and jQuery data on laid out elements through the layout process.

.hopscotchResize([width0, width1], substituteSelector, onChangeCallback)

Uses the plugin at http://benalman.com/projects/jquery-resize-plugin/ to be notified about width changes of the jQuery object this is called on.  The width is mapped to an index based on the interval boundaries in the array which is the first argument:
width < width0 -> 0, width0 <= width < width1 -> 1, ... , widthn <= width -> n
When the index changes the plugin calls hopscotchLayout with the new index and the (optional) substituteSelector value, and then calls onChangeCallback (if supplied).

You can also bind to a custom event 'hopscotch:layout' to run an event handler whenever the layout is changed in this way.

hopscotchResize can be applied to multiple nested elements.

For a less technical description with examples, go to http://www.easyresponsive.com/hopscotch