var R = 6371;
var pigreco = Math.PI;

var calculateDistance = function(pointA, pointB) {
	pointA = pointA || {
		latitude : 0,
		longitude : 0
	};
	pointB = pointB || {
		latitude : 0,
		longitude : 0
	};

	var distance;
	if (!pointA.latitude || !pointA.longitude || !pointB.latitude || !pointB.longitude) {
		distance = Number.POSITIVE_INFINITY;
	} else {
		//converte i gradi in radianti
		var lat_alfa = pigreco * pointA.latitude / 180;
		var lat_beta = pigreco * pointB.latitude / 180;
		var lon_alfa = pigreco * pointA.longitude / 180;
		var lon_beta = pigreco * pointB.longitude / 180;

		//calcola l'angolo compreso phi
		var fi = Math.abs(lon_alfa - lon_beta);

		//calcola il terzo lato del triangolo sferico
		var p = Math.acos(Math.sin(lat_beta) * Math.sin(lat_alfa) + Math.cos(lat_beta) * Math.cos(lat_alfa) * Math.cos(fi));

		//Calcola la distanza sulla superficie terrestre R = ~6371 km
		distance = p * R;
	}
	return distance;
}; 


exports.calculateDistance = calculateDistance;