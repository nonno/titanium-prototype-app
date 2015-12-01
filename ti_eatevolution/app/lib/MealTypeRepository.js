var repository = require("StaticRepository").create({
	items: [
		{key: "dol", text: "cibo.tipo.dol", icon: null, color: null},
		{key: "gel", text: "cibo.tipo.gel", icon: null, color: null},
		{key: "ins", text: "cibo.tipo.ins", icon: null, color: null},
		{key: "pan", text: "cibo.tipo.pan", icon: null, color: null},
		{key: "pp", text: "cibo.tipo.pp", icon: null, color: null},
		{key: "sp", text: "cibo.tipo.sp", icon: null, color: null}
	],
	itemFindFunction: function(item){
		return _.partial(require("ProfileRepository").hasAllMealTypes, [item.key]);
	}
});

_.extend(exports, repository);
