var profileTypes, defaultType;

defaultType = "ris";
profileTypes = {
	"bar": {text: "locale.tipo.bar", icon: Alloy.Globals.Icons.profileTypes.bar, color: "maroon"},
	"ff": {text: "locale.tipo.ff", icon: Alloy.Globals.Icons.profileTypes.ff, color: "orange"},
	"for": {text: "locale.tipo.for", icon: Alloy.Globals.Icons.profileTypes.for, color: "brown"},
	"gel": {text: "locale.tipo.gel", icon: Alloy.Globals.Icons.profileTypes.gel, color: "cyan"},
	"pas": {text: "locale.tipo.pas", icon: Alloy.Globals.Icons.profileTypes.pas, color: "purple"},
	"piz": {text: "locale.tipo.piz", icon: Alloy.Globals.Icons.profileTypes.piz, color: "red"},
	"ris": {text: "locale.tipo.ris", icon: Alloy.Globals.Icons.profileTypes.ris, color: "gray"},
	"ros": {text: "locale.tipo.ros", icon: Alloy.Globals.Icons.profileTypes.ros, color: "pink"},
	"tc": {text: "locale.tipo.tc", icon: Alloy.Globals.Icons.profileTypes.tc, color: "olive"}
};

exports.getTypes = function(){
	return profileTypes;
};
exports.getType = function(type){
	if (!type){
		Ti.API.warn("getType called with no type");
		return null;
	}
	return profileTypes[type];
};
exports.getDefaultType = function(){
	Ti.API.warn("Calling getDefaultType");
	
	return profileTypes[defaultType];
};
