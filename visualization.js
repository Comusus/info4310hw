(function() {
  var margin = {top: 30, right: 20, bottom: 100, left: 50},
    margin2  = {top: 210, right: 20, bottom: 20, left: 50},
    width    = 764 - margin.left - margin.right,
    height   = 283 - margin.top - margin.bottom,
    height2  = 283 - margin2.top - margin2.bottom;

  var timeFormat = d3.timeFormat('%m-%d-%Y'),
    bisectDate = d3.bisector(function(d) { return d.date; }).left,
    legendFormat = d3.timeFormat('%b %d, %Y');

  var x = d3.scaleTime().range([0, width]),
    x2  = d3.scaleTime().range([0, width]),
    y   = d3.scaleLog().range([height, 0]),
    y1  = d3.scaleLog().range([height, 0]),
    y2  = d3.scaleLog().range([height2, 0]);
    y3 = d3.scaleLog().range([height2, 0]);

  var xAxis = d3.axisBottom().scale(x),
    xAxis2  = d3.axisBottom().scale(x2),
    yAxis   = d3.axisLeft().scale(y);

  var priceLine = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });


  var area2 = d3.area()
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.price); });

  var svg = d3.select('body').append('svg')
    .attr('class', 'chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom + 60);

  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
  .append('rect')
    .attr('width', width)
    .attr('height', height);

  var make_y_axis = function () {
    return d3.axisLeft()
      .scale(y)
      .ticks(3);
  };

  var focus = svg.append('g')
    .attr('class', 'focus')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var context = svg.append('g')
    .attr('class', 'context')
    .attr('transform', 'translate(' + margin2.left + ',' + (margin2.top + 60) + ')');

  var legend = svg.append('g')
    .attr('class', 'chartlegend')
    .attr('width', width)
    .attr('height', 30)
    .attr('transform', 'translate(' + margin2.left + ', 10)');

  var rangeSelection =  legend
    .append('g')
    .attr('class', 'chartrange-selection')
    .attr('transform', 'translate(110, 0)');

  d3.csv('bitcoin_cash_price.csv', parseData, function(err, data) {
    d3.csv('goldprices_usd.csv', parseData, function(err, dataGold) {
      minMonth = data.map(function(d) {
          return  d.date;
      });
      minDate = new Date(d3.min(d3.values(minMonth))).getTime();

      var data2 = [];
      for(var i =0;i<dataGold.length;i++){
        if(dataGold[i].date.getTime() > minDate){
          data2.push({
            date    : dataGold[i].date,
            price   : dataGold[i].price,
          });
        }
    };

    if (err) throw error;

    var brush = d3.brushX()
      .on('brush', brushed);

    var xRange = d3.extent(data.map(function(d) { return d.date; }));

    x.domain(xRange);
    y.domain(d3.extent(data.map(function(d) { return d.price; })));
    x2.domain(x.domain());
    y2.domain(y.domain());
    // y3.domain(d3.extent(dataGold.map(function(d) { return d.price; })));

    var min = d3.min(data.map(function(d) { return d.price; }));
    var max = d3.max(data.map(function(d) { return d.price; }));

    var range = legend.append('text')
      .text(legendFormat(new Date(xRange[0])) + ' - ' + legendFormat(new Date(xRange[1])))
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');

    focus.append('g')
        .attr('class', 'y chartgrid')
        .call(make_y_axis()
        .tickSize(-width, 0, 0)
        .tickFormat(''));

    var priceChart = focus.append('path')
        .datum(data)
        // .datum(dataGold)
        .attr('class', 'chartline chartprice--focus line')
        .attr("id", "redLine")
        .attr('d', priceLine);

        console.log(data2);

    var goldChart = focus.append('path')
        .datum(dataGold)
        .attr('class', 'chartline chartgold--focus line')
        .attr("id", "blueLine")
        .attr('d', priceLine);

    focus.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0 ,' + height + ')')
        .call(xAxis);

    focus.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(12, 0)')
        .call(yAxis);

    var helper = focus.append('g')
      .attr('class', 'charthelper')
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');

    var helperText = helper.append('text')

    var priceTooltip = focus.append('g')
      .attr('class', 'charttooltip--price')
      .append('circle')
      .style('display', 'none')
      .attr('r', 2.5);

    var priceTooltip2 = focus.append('g')
        .attr('class', 'charttooltip--price')
        .append('circle')
        .style('display', 'none')
        .attr('r', 2.5);

    var mouseArea = svg.append('g')
      .attr('class', 'chartmouse')
      .append('rect')
      .attr('class', 'chartoverlay')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .on('mouseover', function() {
        helper.style('display', null);
        priceTooltip.style('display', null);
      })
      .on('mouseout', function() {
        helper.style('display', 'none');
        priceTooltip.style('display', 'none');
      })
      .on('mousemove', mousemove);

    context.append('path')
        .datum(data)
        .attr('class', 'chartarea area')
        .attr('d', area2);

    context.append('g')
        .attr('class', 'x axis chartaxis--context')
        .attr('y', 0)
        .attr('transform', 'translate(0,' + (height2 - 22) + ')')
        .call(xAxis2);

    context.append('g')
        .attr('class', 'x brush')
        .call(brush)
      .selectAll('rect')
        .attr('y', -6)
        .attr('height', height2 + 7);

        svg.append("text")
	.attr("x", 0)
	.attr("y", height + margin.top + 10)
	.attr("class", "legend")
	.style("fill", "yellow")
	.on("click", function(){
		// Determine if current line is visible
		var active   = blueLine.active ? false : true,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.select("#blueLine").style("opacity", newOpacity);
		d3.select("#blueAxis").style("opacity", newOpacity);
		// Update whether or not the elements are active
		blueLine.active = active;
	})
	.text("Gold");

// Add the red line title
svg.append("text")
	.attr("x", 0)
	.attr("y", height + margin.top)
	.attr("class", "legend")
	.style("fill", "Blue")
	.on("click", function(){
		// Determine if current line is visible
		var active   = redLine.active ? false : true ,
		  newOpacity = active ? 0 : 1;
		// Hide or show the elements
		d3.select("#redLine").style("opacity", newOpacity);
		d3.select("#redAxis").style("opacity", newOpacity);
		// Update whether or not the elements are active
		redLine.active = active;
	})
	.text("Bitcoin");


    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]);
      var x2 = x.invert(d3.mouse(this)[0]);

      console.log(x0);
      console.log(x2);
      //gets date of mouse over
      var i = bisectDate(data, x0, 1);
      var d0 = data[i - 1];
      var d1 = data[i];
      var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      var dd = x0 - dataGold[i-1] > dataGold[i] - x0 ? dataGold[i] : dataGold[i-1]
      helperText.text(legendFormat(new Date(d.date)) + ' Bitcoin Price: ' + d.price.toFixed(2) + ' Gold Price: ' + dd.price.toFixed(2));
      priceTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.price) + ')');
    }

    function brushed() {
      var ext = brush.extent();
      var selection = d3.event.selection;
      x.domain(selection.map(x2.invert, x2));

      priceChart.attr('d', priceLine);
      goldChart.attr('d', priceLine);
      focus.select('.x.axis').call(xAxis);
      focus.select('.y.axis').call(yAxis);
    }

  })
})// end Data

  function parseData(d) {
    return {
      date    : new Date(Date.parse(d["Date"])),
      price   : Number(d["Close"]),
    }
  }

}());
