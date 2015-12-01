var repository = require("StaticRepository").create({
	items: [
		{key: "bar", text: "locale.tipo.bar", icon: Alloy.Globals.Icons.profileTypes.bar, color: "maroon"},
		{key: "ff", text: "locale.tipo.ff", icon: Alloy.Globals.Icons.profileTypes.ff, color: "orange"},
		{key: "for", text: "locale.tipo.for", icon: Alloy.Globals.Icons.profileTypes.for, color: "brown"},
		{key: "gel", text: "locale.tipo.gel", icon: Alloy.Globals.Icons.profileTypes.gel, color: "cyan"},
		{key: "pas", text: "locale.tipo.pas", icon: Alloy.Globals.Icons.profileTypes.pas, color: "purple"},
		{key: "piz", text: "locale.tipo.piz", icon: Alloy.Globals.Icons.profileTypes.piz, color: "red"},
		{key: "ris", text: "locale.tipo.ris", icon: Alloy.Globals.Icons.profileTypes.ris, color: "gray"},
		{key: "ros", text: "locale.tipo.ros", icon: Alloy.Globals.Icons.profileTypes.ros, color: "pink"},
		{key: "tc", text: "locale.tipo.tc", icon: Alloy.Globals.Icons.profileTypes.tc, color: "olive"}
	],
	defaultKey: "res",
	itemFindFunction: function(item){
		return _.partial(require("ProfileRepository").filterForTypes, [item.key]);
	}
});

_.extend(exports, repository);
