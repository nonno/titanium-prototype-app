exports.getOSMajorVersion = function(){
	var result = Ti.Platform.version;
	if (result.indexOf('.') >= 0){
		result = result.split('.')[0];
	}
	return Number(result);
};