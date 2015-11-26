var items;

items = [
	{key: "gf", text: "cibo.cat.gf", icon: null, color: null},
	{key: "lf", text: "cibo.cat.lf", icon: null, color: null},
	{key: "mac", text: "cibo.cat.mac", icon: null, color: null},
	{key: "pm", text: "cibo.cat.pm", icon: null, color: null},
	{key: "vegan", text: "cibo.cat.vegan", icon: null, color: null},
	{key: "veget", text: "cibo.cat.veget", icon: null, color: null}
];

items = items.sort(function(a, b){
	if (L(a.text) < L(b.text)){ return -1; }
	if (L(a.text) > L(b.text)){ return 1; }
	return 0;
});

exports.list = function(){
	return items;
};
exports.get = function(key){
	if (!key){
		Ti.API.warn("get called without key");
		return null;
	}
	return _.find(items, function(item){ return item.key === key; });
};
