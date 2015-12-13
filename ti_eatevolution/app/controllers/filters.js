var args = arguments[0] || {},
	filters = args.filters || {};

var ProfileTypeRepository = require("ProfileTypeRepository"),
	MealTypeRepository = require("MealTypeRepository"),
	MealCategoryRepository = require("MealCategoryRepository");

var getFilters, setFilters, sortFilters, profileTypeControllers, mealTypeControllers, mealCategoryControllers;

profileTypeControllers = [];
mealTypeControllers = [];
mealCategoryControllers = [];

ProfileTypeRepository.preProcessItems();
MealTypeRepository.preProcessItems();
MealCategoryRepository.preProcessItems();

getFilters = function(){
	var filters,
		tipi = [],
		tipiCibi = [],
		categorieCibi = [];
	
	_.each(profileTypeControllers, function(controller){
		if (controller.isEnabled()){ tipi.push(controller.getRepositoryKey()); }
	});
	if (!tipi.length){ tipi = undefined; }
	
	_.each(mealTypeControllers, function(controller){
		if (controller.isEnabled()){ tipiCibi.push(controller.getRepositoryKey()); }
	});
	if (!tipiCibi.length){ tipiCibi = undefined; }
	
	_.each(mealCategoryControllers, function(controller){
		if (controller.isEnabled()){ categorieCibi.push(controller.getRepositoryKey()); }
	});
	if (!categorieCibi.length){ categorieCibi = undefined; }
	
	filters = {
		"aperto": $.openSwitch.value === true ? true : undefined,
		"preferiti": $.favoritesSwitch.value === true ? true : undefined,
		"asporto": $.takeAwaySwitch.value === true ? true : undefined,
		"sedere": $.seatingSwitch.value === true ? true : undefined,
		"disabili": $.forDisabledSwitch.value === true ? true : undefined,
		"pos": $.posSwitch.value === true ? true : undefined,
		"costo": $.priceSelector.getValue(),
		"tipi": tipi,
		"tipiCibi": tipiCibi,
		"categorieCibi": categorieCibi
	};
	Ti.API.debug("getFilters: " + JSON.stringify(filters));
	
	return filters;
};

sortFilters = function(selected, a, b){
	if (
		(selected && selected.length && selected.indexOf(b.key) === -1 && selected.indexOf(a.key) > -1)
		||
		L(a.text) < L(b.text)
	){
		return -1;
	}
	if (
		(selected && selected.length && selected.indexOf(b.key) > -1 && selected.indexOf(a.key) === -1)
		||
		L(a.text) > L(b.text)
	){
		return 1;
	}
	return 0;
};

setFilters = function(filters){
	Ti.API.debug("setFilters: " + JSON.stringify(filters));
	
	var profileTypes, mealTypes, mealCategories;
	
	$.openSwitch.value = Boolean(filters.aperto);
	$.favoritesSwitch.value = Boolean(filters.preferiti);
	$.takeAwaySwitch.value = Boolean(filters.asporto);
	$.seatingSwitch.value = Boolean(filters.sedere);
	$.forDisabledSwitch.value = Boolean(filters.disabili);
	$.posSwitch.value = Boolean(filters.pos);
	if (filters.costo){ $.priceSelector.setValue(filters.costo); }
	
	profileTypeControllers = [];
	$.profileTypesContainer.removeAllChildren();
	profileTypes = _.clone(ProfileTypeRepository.list());
	if (OS_IOS) { profileTypes = profileTypes.sort(_.partial(sortFilters, filters.tipi)); }
	_.each(profileTypes, function(item){
		var controller = Alloy.createController("filterSwitch", {
			"repository": ProfileTypeRepository,
			"repositoryKey": item.key,
			"enabled": Boolean(filters.tipi && filters.tipi.indexOf(item.key) > -1)
		});
		profileTypeControllers.push(controller);
		$.profileTypesContainer.add(controller.getView());
	});

	mealTypeControllers = [];
	$.mealTypesContainer.removeAllChildren();
	mealTypes = _.clone(MealTypeRepository.list());
	if (OS_IOS) { mealTypes = mealTypes.sort(_.partial(sortFilters, filters.tipiCibi)); }
	_.each(mealTypes, function(item){
		var controller = Alloy.createController("filterSwitch", {
			"repository": MealTypeRepository,
			"repositoryKey": item.key,
			"enabled": Boolean(filters.tipiCibi && filters.tipiCibi.indexOf(item.key) > -1)
		});
		mealTypeControllers.push(controller);
		$.mealTypesContainer.add(controller.getView());
	});
	$.mealTypesLabelContainer.visible = Boolean($.mealTypesContainer.children.length);

	mealCategoryControllers = [];
	$.mealCategoriesContainer.removeAllChildren();
	mealCategories = _.clone(MealCategoryRepository.list());
	if (OS_IOS) { mealCategories = mealCategories.sort(_.partial(sortFilters, filters.categorieCibi)); }
	_.each(mealCategories, function(item){
		var controller = Alloy.createController("filterSwitch", {
			"repository": MealCategoryRepository,
			"repositoryKey": item.key,
			"enabled": Boolean(filters.categorieCibi && filters.categorieCibi.indexOf(item.key) > -1)
		});
		mealCategoryControllers.push(controller);
		$.mealCategoriesContainer.add(controller.getView());
	});
	$.mealCategoriesLabelContainer.visible = Boolean($.mealCategoriesContainer.children.length);
};

setFilters(filters);

exports.getFilters = getFilters;
exports.setFilters = setFilters;
