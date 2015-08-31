var getLocali;

getLocali = function(){
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json");
	
	return JSON.parse(file.read().text).locali;
};

tipoToString = function(tipo){
	return L('lblTipo' + tipo.substring(0,1).toUpperCase() + tipo.substring(1));
};

exports.getLocali = getLocali;
exports.tipoToString = tipoToString;