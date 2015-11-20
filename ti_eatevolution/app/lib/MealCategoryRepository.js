var items;

items = {
	"gf": {text: "cibo.cat.gf", icon: null, color: null},
	"lf": {text: "cibo.cat.lf", icon: null, color: null},
	"mac": {text: "cibo.cat.mac", icon: null, color: null},
	"pm": {text: "cibo.cat.pm", icon: null, color: null},
	"vegan": {text: "cibo.cat.vegan", icon: null, color: null},
	"veget": {text: "cibo.cat.veget", icon: null, color: null}
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
