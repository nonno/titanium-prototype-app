var repository = require("StaticRepository").create({
	items: [
		{key: "gf", text: "cibo.cat.gf", icon: null, color: null},
		{key: "lf", text: "cibo.cat.lf", icon: null, color: null},
		{key: "mac", text: "cibo.cat.mac", icon: null, color: null},
		{key: "pm", text: "cibo.cat.pm", icon: null, color: null},
		{key: "vegan", text: "cibo.cat.vegan", icon: null, color: null},
		{key: "veget", text: "cibo.cat.veget", icon: null, color: null}
	],
	itemFindFunction: function(item){
		return _.partial(require("ProfileRepository").hasAllMealCategories, [item.key]);
	}
});

_.extend(exports, repository);
