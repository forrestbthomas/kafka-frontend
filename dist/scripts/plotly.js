var exampleSocket = new WebSocket("ws://localhost:3000")
exampleSocket.onmessage = function (event) {
	console.log(event)
Plotly.d3.csv('/data/us.csv', function(err, rows){
	function unpack(rows, key) {
		return rows.map(function(row) { return row[key]; });
	}
	var cityName = unpack(rows, 'name'),
		cityPop = unpack(rows, 'pop'),
		cityLat = unpack(rows, 'lat'),
		cityLon = unpack(rows, 'lon'),
		colors = ["rgb(255, 0, 0)", "rgb(255, 255, 0)", "rgb(35, 196, 0)", "red"],
		citySize = [],
		hoverText = [],
		scale = 5000;

	for ( var i = 0 ; i < cityPop.length; i++) {
		var currentSize = cityPop[i] / scale;
		var currentText = cityName[i] + "<br>Population: " + cityPop[i];
		citySize.push(currentSize);
		hoverText.push(currentText);
	}
	var data = [{
		type: 'scattergeo',
		locationmode: 'USA-states',
		lat: cityLat,
		lon: cityLon,
		text: hoverText,
		hoverinfo: 'text',
		marker: {
			size: citySize,
			line: {
				color: 'black',
				width: 1
			},
			color: [0,1,2,3],
			colorscale: [[0, "green"], [1, "red"]]

		}
	}];

	var layout = {
		title: '2014 US City Populations',
		showlegend: false,
		geo: {
			scope: 'usa',
			projection: {
				type: 'albers usa'
			},
			showland: true,
			landcolor: 'rgb(217, 217, 217)',
			subunitwidth: 1,
			countrywidth: 1,
			subunitcolor: 'rgb(255,255,255)',
			countrycolor: 'rgb(255,255,255)'
		},
	};

	Plotly.plot(myDiv, data, layout, {showLink: false});
});
}
