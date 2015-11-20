var items;

items = {
	"dol": {text: "cibo.tipo.dol", icon: null, color: null},
	"gel": {text: "cibo.tipo.gel", icon: null, color: null},
	"ins": {text: "cibo.tipo.ins", icon: null, color: null},
	"pan": {text: "cibo.tipo.pan", icon: null, color: null},
	"pp": {text: "cibo.tipo.pp", icon: null, color: null},
	"sp": {text: "cibo.tipo.sp", icon: null, color: null}
};

exports.list = function(){
	return items;
};
exports.get = function(key){
	if (!key){
		Ti.API.warn("get called without key");
		return null;
	}
	return items[key];
};
