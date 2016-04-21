$(document).ready(function(){
	loadData();
})

function loadData(){
	var data = {
		timeslices: [],
		attractionlist: [],
		averagedTime: []
	}
	d3.csv("data/timeresult_perAttraction.csv", function(csvdata){
		csvdata.forEach(function(d,i){ 
				data.averagedTime[i] = d["AverageTime"];
		});
		drawMatrix(data, "matrix");
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
	var timeSlicesAmount = 96;
	var attractionsAmount = 86;
	var margin = { top: 20, right: 20, bottom: 20, left: 20},
		width = $("#"+container).width() - margin.right - margin.left,
		height = $("#"+container).height() - margin.top - margin.bottom,
		gridWidth = width*0.95 / timeSlicesAmount,
		gridHeight = height*0.95 / attractionsAmount;

	var svg = d3.select("#"+container).append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);
	var bodyG = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var timeslices = data.timeslices;
	var timeLabels = bodyG.selectAll(".timeLabel")
		.data(d3.range(0, timeSlicesAmount))
		.enter()
		.append("text")
		.text(function(d, i) { return i;})
		.attr("x", function(d, i) { return i*gridWidth;})
		.attr("y", 0)
		.style("text-anchor", "middle")
		.attr("transform", "translate("+gridWidth/2.0+",-6)")
		.attr("class", "timeLabel mono axis axis-worktime");

	var heatmapChart = function(data){
		var cards = bodyG.selectAll(".hour")
		.data(data);
		cards.append("title");
		cards.enter().append("rect")
			.attr("x", function(d, i) { return (i%timeSlicesAmount)*gridWidth;})
			.attr("y", function(d, i) { return (i/timeSlicesAmount)*gridHeight;})
			.attr("id", function(d, i) { return "rect_"+i;})
			.attr("class", "hour bordered")
			.attr("width", gridWidth)
			.attr("height", gridHeight)
			.style("fill", function(d, i) { 
				var g = 255*(1.0-Number(d)/6.0); 
				return "rgb(202," + g + ",19)";});
	}
	heatmapChart(data.averagedTime);

}