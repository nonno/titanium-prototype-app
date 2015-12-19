Alloy.Globals.trackerGA = require("ti.ga").createTracker({
	trackingId: Alloy.CFG.gaTrackingId,
	useSecure: true
});

Alloy.Globals.justInstalled = false;
Alloy.Globals.loading = Alloy.createWidget("nl.fokkezb.loading");

Alloy.Globals.Data = {};
Alloy.Globals.Data.profiles = [];
Alloy.Globals.Data.filters = {};
Alloy.Globals.Data.cities = [];
Alloy.Globals.Data.orderByDistance = false;
Alloy.Globals.Data.setFilters = function(filters){
	Alloy.Globals.Data.filters = filters;
	
	Ti.App.fireEvent("filterschanged");
};
Alloy.Globals.Data.setProfiles = function(profiles, skipCitiesMapping){
	Alloy.Globals.Data.profiles = profiles;
	
	if (!skipCitiesMapping){
		Alloy.Globals.Data.cities = _.chain(profiles)
			.map(function(profile){
				return {
					"name": profile.loc,
					"province": profile.prov,
					"zipCode": profile.cap
				};
			})
			.uniq(function(city){ return city.name + city.zipCode; })
			.sortBy(function(city){ return city.name; })
			.value();
	}
};

Alloy.Globals.Icons = {};
Alloy.Globals.Icons.profileTypes = {
	"bar": "\ue600",
	"ff": "\ue601",
	"for": "\ue602",
	"gel": "\ue603",
	"pas": "\ue604",
	"piz": "\ue605",
	"ris": "\ue606",
	"ros": "\ue607",
	"tc": "\ue608"
};
Alloy.Globals.Icons.fontAwesome = {
	"search": "\uf002",
	"star": "\uf005",
	"home": "\uf015",
	"timesCircle": "\uf057",
	"checkCircle": "\uf058",
	"infoCircle": "\uf05a",
	"exlamationTriangle": "\uf071",
	"calendar": "\uf073",
	"phone": "\uf095",
	"globe": "\uf0ac",
	"filter": "\uf0b0",
	"chain": "\uf0c1",
	"cloud": "\uf0c2",
	"money": "\uf0d6",
	"caretDown": "\uf0d7",
	"envelope": "\uf0e0",
	"sort": "\uf160",
	"map": "\uf278"
};

Alloy.Globals.analyticsShowView = function(viewName){
	if (Alloy.Globals.trackerGA){
		Alloy.Globals.trackerGA.addScreenView(viewName);
	}
};
Alloy.Globals.analyticsEvent = function(params){
	params = params || {};
	params.action = params.action || "";
	params.label = params.label;
	params.value = params.value || 1;
	
	var category, eventString;
	
	category = Ti.Platform.osname;
	eventString = [category, params.action].join("-");
	
	Ti.API.debug("Feature event: " + eventString);
	Ti.Analytics.featureEvent(eventString);
	
	if (Alloy.Globals.trackerGA){
		Alloy.Globals.trackerGA.addEvent({
			category: category,
			action: params.action,
			label: params.label,
			value: params.value
		});
	}
};

Alloy.Globals.createEatEvolutionLogo = function(){
	return Ti.UI.createLabel({
		"text": "\ue600",
		"color": Alloy.CFG.iosColor,
		"font": {
			"fontFamily": "logos",
			"fontSize": 40
		}
	});
};
Alloy.Globals.createNSFLogo = function(){
	return Ti.UI.createLabel({
		"text": "\ue601",
		"color": Alloy.CFG.iosColor,
		"font": {
			"fontFamily": "logos",
			"fontSize": 40
		}
	});
};
Alloy.Globals.createModalWindowHeaderButton = function(params){
	params = params || {};
	params.backgroundImage = "none";
	params.color = params.color;
	params.backgroundColor = params.backgroundColor || "transparent";
	params.width = params.width || Ti.UI.SIZE;
	params.height = Ti.UI.FILL;
	params.left = 2;
	params.right = 2;
	
	if (!params.color){
		if (OS_IOS){
			 params.color = Alloy.CFG.iosColor;
		} else if (OS_ANDROID){
			params.color = "white";
		}
	}
	
	return Ti.UI.createButton(params);
};

if (!ENV_PRODUCTION && Alloy.CFG.runTests) {
	require("tests/testsRunner");
}
