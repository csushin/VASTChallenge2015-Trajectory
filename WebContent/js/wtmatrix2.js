$(document).ready(function(){
	$("#matrixTabs").tabs({
		select: function(event, ui){
            var tabNumber = ui.index;
            var tabName = $(ui.tab).text();
            
            console.log('Tab number ' + tabNumber + ' - ' + tabName + ' - clicked');
        }
	});
	loadData();
	$( "#matrix-1" ).on( "tabsactivate", function( event, ui ) {} );
})

function loadData(){
	var data = {
		timeslices: [],
		attractionlist: [],
		averagedTimeFri: [],
		averagedTimeSun: [],
		averagedTimeSat: []
	}
	d3.csv("data/timeresult_perAttraction.csv", function(csvdata){
		csvdata.forEach(function(d,i){ 
				if(+d["timeslice"]<32)
					data.averagedTimeFri[i] = +d["AverageTime"];
				if(+d["timeslice"]>=32 && +d["timeslice"]<64)
					data.averagedTimeSat[i-2752] = +d["AverageTime"];
				if(+d["timeslice"]>=64)
					data.averagedTimeSun[i-5504] = +d["AverageTime"];
		});
		drawMatrix(data.averagedTimeFri, "matrix-1");
		drawMatrix(data.averagedTimeSat, "matrix-2");
		drawMatrix(data.averagedTimeSun, "matrix-3");
	});
}

/*
Structure of data:
datas:{
	timeslices : //1d array of time slices with values are the time slices
	attractionlist // 1d array of the available attractions, with values are the attraction ids
	averagedTime // 1d array with the index as attraction 
}
*/
function drawMatrix(data, container){
	d3.select("#"+container + " svg").remove();
	var timeSlicesAmount = 32;
	var attractionsAmount = 86;
	var margin = { top: 20, right: 20, bottom: 20, left: 40},
		width = $("#"+container).width() - margin.right - margin.left,
		height = $("#"+container).height() - margin.top - margin.bottom,
		gridWidth = width*0.95 / timeSlicesAmount,
		gridHeight = height*0.95 / attractionsAmount;

	var svg = d3.select("#"+container).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);
	var bodyG = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var timeLabels = bodyG.selectAll(".timeLabel")
		.data(d3.range(0, timeSlicesAmount))
		.enter()
		.append("text")
		.text(function(d, i) { return i/2+8;})
		.attr("x", function(d, i) { return i*gridWidth;})
		.attr("y", 0)
		.style("text-anchor", "middle")
		.attr("transform", "translate("+gridWidth/2.0+",-6)")
		.attr("class", "timeLabel mono axis axis-worktime");

	// var attractionLabels = bodyG.selectAll(".attractionLabel")
	// 	.data(d3.range(0, attractionsAmount))
	// 	.enter()
	// 	.append("text")
	// 	.text(function(d, i) { return i;})
	// 	.attr("y", function(d, i) { return i*gridHeight;})
	// 	.attr("x", 0)
	// 	.style("text-anchor", "middle")
	// 	.attr("transform", "translate(0,-"+ margin.left+ ")")
	// 	.attr("class", "timeLabel mono axis axis-worktime");

	var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10+gridHeight/2.0, 0])
			  .html(function(d) {
			    	return  "<p>Attraction: " + d + "</p>";
			});

	svg.call(tip);

	var heatmapChart = function(data){
		var cards = bodyG.selectAll(".hour")
		.data(data);
		cards.append("title");
		cards.enter().append("rect")
			.attr("x", function(d, i) { return parseInt(i/attractionsAmount)*gridWidth;})
			.attr("y", function(d, i) { return (i%attractionsAmount)*gridHeight;})
			.attr("class", function(d, i) { return "hour bordered rect_"+parseInt(i%attractionsAmount);})
			.attr("width", gridWidth)
			.attr("height", gridHeight)
			.style("fill", function(d, i) { 
				var g = Math.round(255*(1.0-d/6.0)); 
				return "rgb(202," + g + ",19)";})
			.on("mouseover", function(d, i){
				tip.show(parseInt(i%attractionsAmount));
				d3.selectAll(".rect_"+parseInt(i%attractionsAmount)).style("stroke", "gray");

			})
			.on("mouseout", function(d, i){
				tip.hide();
				d3.selectAll(".rect_"+parseInt(i%attractionsAmount)).style("stroke", "#E6E6E6");
			});
	}
	heatmapChart(data);

}