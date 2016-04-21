function drawMatrix(data, distinctIndices, amount, pcData, container, map){
	d3.select("#"+container + " svg").remove();
	var histHeight = 50;
	var margin = { top: 30, right: 20, bottom: 50, left: histHeight+10 },
          width = $("#"+container).width() - margin.left - margin.right,
          height = $("#"+container).height() - margin.top - margin.bottom,
          gridWidth = width / modelSet.length,
          gridHeight = 0.99*height / distinctIndices.length,
          legendElementWidth = gridWidth*2,
          buckets = 9,
          colors = ['#d53e4f','#f46d43','#fdae61','#fee08b','#ffffbf','#e6f598','#abdda4','#66c2a5','#3288bd'], // alternatively colorbrewer.YlGnBu[9]
          days = distinctIndices,
          times = modelSet;

    var containerGridHeight = 0.99*($("#"+container).parent().height() - margin.top - margin.bottom) / distinctIndices.length;
    gridHeight = containerGridHeight;
    if(gridHeight <= 5){
    	while(gridHeight <= 5){
    		gridHeight = 0.99*height / distinctIndices.length;
    		height+=200;
    	}
    	$("#"+container).css("height", height+"px");
    	$("#"+container).parent().css("overflow", "auto");
    	$("#"+container).parent().css("overflow-x", "hidden");
    	gridHeight = 0.99*height / distinctIndices.length;
    }
    else{
    	height = $("#"+container).parent().height() - margin.top - margin.bottom;
    	$("#"+container).css("height", height+"px");
    	$("#"+container).parent().css("overflow", "hidden");
    	gridHeight = 0.99*height / distinctIndices.length;
    }

      var svg = d3.select("#" + container).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);
      var bodyG = svg
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // var dayLabels = svg.selectAll(".dayLabel")
      //     .data(days)
      //     .enter().append("text")
      //       .text(function (d) { return d; })
      //       .attr("x", 0)
      //       .attr("y", function (d, i) { return i * gridHeight; })
      //       .style("text-anchor", "end")
      //       .attr("transform", "translate(-6," + gridHeight / 1.5 + ")");

      var timeLabels = bodyG.selectAll(".timeLabel")
          .data(times)
          .enter().append("text")
            .text(function(d) { return modelSet.indexOf(d); })
            .attr("id", function(d) { return "MatrixModel_"+d;})
            .attr("x", function(d, i) { return i * gridWidth; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridWidth / 2 + ", -6)")
            .attr("class",  "timeLabel mono axis axis-worktime");

      var heatmapChart = function(data) {
          var colorScale = d3.scale.quantile()
              .domain([d3.min(data, function(d) {return d.z_score;}), d3.max(data, function (d) { return d.z_score; })])
              .range(colors);

          var cards = bodyG.selectAll(".hour")
              .data(data);

          cards.append("title");

          var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10+gridHeight/2.0, 0])
			  .html(function(d) {
			    	return  "<p>GCM: "+ d.modelName.split("_")[0] + "</p>" + 
			    		"<p>RCM: "+ d.modelName.split("_")[1] + "</p>" +
		      			"<p>Z-Score: "+ d.z_score + "</p>";
			});

		  svg.call(tip);

          cards.enter().append("rect")
              .attr("x", function(d) { return modelSet.indexOf(d.modelName) * gridWidth; })
              .attr("y", function(d) { return distinctIndices.indexOf(d.sampleIndex) * gridHeight + gridHeight*0.01; })
              .attr("id", function(d) {return "rect_" + d.sampleIndex;})
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridWidth)
              .attr("height", gridHeight*0.8)
              .style("fill", colors[0])
              .on("mouseover", function(d) { 
              	
              });


          var amountTip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10+gridHeight/2.0, 0])
			  .html(function(d) {
			    	return  "Amount: " + d;
			});

		  svg.call(amountTip);
          var histxscale = d3.scale.linear().domain([0, Math.log(d3.max(amount))]).range([0, histHeight]);
          var hists = svg.append("g").selectAll(".histrect")
              .data(amount)
              .enter()
              .append("rect")
              .attr("x", function(d, i){ return margin.left - histxscale(Math.log(d));})
              .attr("y", function(d, i){ return i * gridHeight + gridHeight*0.01; })
              .attr("width", function(d) { return histxscale(Math.log(d));})
              .attr("height", gridHeight*0.8)
              .attr("transform", "translate(0,"+ margin.top + ")")
              .style("fill", "#636363")
              .on("mouseover", function(d){
              	amountTip.show(d);
              })
              .on("mouseout", function(d){
              	amountTip.hide();
              });
 
          cards.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.z_score); });

          cards.select("title").text(function(d) { return d.z_score; });
          
          cards.exit().remove();

          var legend = bodyG.selectAll(".legend")
              .data([d3.min(data, function(d) {return d.z_score;})].concat(colorScale.quantiles()), function(d) { return d; });

          legend.enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height+margin.bottom*0.6)
            .attr("width", legendElementWidth)
            .attr("height", 1.8*gridHeight)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + d.toFixed(2); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height+margin.bottom*0.5);

          legend.exit().remove();
      };

      heatmapChart(data);
      
      // var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
      //   .data(datasets);

      // datasetpicker.enter()
      //   .append("input")
      //   .attr("value", function(d){ return "Dataset " + d })
      //   .attr("type", "button")
      //   .attr("class", "dataset-button")
      //   .on("click", function(d) {
      //     heatmapChart(d);
      //   });
}