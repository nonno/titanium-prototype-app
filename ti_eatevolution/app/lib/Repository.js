var getLocali;

getLocali = function(){
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json");
	
	return JSON.parse(file.read().text).locali;
};

exports.getLocali = getLocali;