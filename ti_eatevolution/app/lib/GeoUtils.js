var R = 6371;
var pigreco = Math.PI;

var calculateDistance = function(pointA, pointB) {
	pointA = pointA || {
		latitude: 0,
		longitude: 0
	};
	pointB = pointB || {
		latitude: 0,
		longitude: 0
	};

	var distance;
	if (!pointA.latitude || !pointA.longitude || !pointB.latitude || !pointB.longitude) {
		distance = Number.POSITIVE_INFINITY;
	} else {
		//converte i gradi in radianti
		var latAlfa = pigreco * pointA.latitude / 180;
		var latBeta = pigreco * pointB.latitude / 180;
		var lonAlfa = pigreco * pointA.longitude / 180;
		var lonBeta = pigreco * pointB.longitude / 180;

		//calcola l'angolo compreso phi
		var fi = Math.abs(lonAlfa - lonBeta);

		//calcola il terzo lato del triangolo sferico
		var p = Math.acos(Math.sin(latBeta) * Math.sin(latAlfa) + Math.cos(latBeta) * Math.cos(latAlfa) * Math.cos(fi));

		//Calcola la distanza sulla superficie terrestre R = ~6371 km
		distance = p * R;
	}
	return distance;
};

exports.calculateDistance = calculateDistance;
