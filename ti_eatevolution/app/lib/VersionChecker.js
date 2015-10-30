var separatorChar = ".";

function IsNumeric(input){
	return /(0|[1-9]\d*)/.test(input);
}

exports.validate = function(version){
	if (!version){ return false; }
	
	var parts = version.split(separatorChar);
	
	if (parts.length > 4){ return false; }
	if (parts.length < 1){ return false; }
	
	if (!IsNumeric(parts[0])){ return false; }
	if (parts.length > 1 && !IsNumeric(parts[1])){ return false; }
	if (parts.length > 2 && !IsNumeric(parts[2])){ return false; }
	
	return true;
};

exports.compare = function(ver1, ver2){
	if (!exports.validate(ver1) || !exports.validate(ver2)){
		throw {"message": "Illegal version numbers"};
	}
	
	var parts1, parts2, i;
	
	parts1 = ver1.split(separatorChar);
	while (parts1.length < 4){
		parts1.push("");
	}
	
	parts2 = ver2.split(separatorChar);
	while (parts2.length < 4){
		parts2.push("");
	}
	
	for (i = 0; i < 4; i++){
		if (parts1[i] > parts2[i]){
			return 1;
		} else if (parts1[i] < parts2[i]){
			return 2;
		}
	}
	
	return 0;
};
