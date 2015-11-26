var items;

items = [
	{key: "dol", text: "cibo.tipo.dol", icon: null, color: null},
	{key: "gel", text: "cibo.tipo.gel", icon: null, color: null},
	{key: "ins", text: "cibo.tipo.ins", icon: null, color: null},
	{key: "pan", text: "cibo.tipo.pan", icon: null, color: null},
	{key: "pp", text: "cibo.tipo.pp", icon: null, color: null},
	{key: "sp", text: "cibo.tipo.sp", icon: null, color: null}
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
