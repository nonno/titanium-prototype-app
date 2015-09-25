if (OS_IOS){ // FIXME problem with ti.ga and ti.map
	Alloy.Globals.trackerGA = require('ti.ga').createTracker({
		trackingId: Alloy.CFG.gaTrackingId,
		useSecure: true
	});
}

Alloy.Globals.Data = {};
Alloy.Globals.Data.locali = {};
Alloy.Globals.Icons = {
	logo : "\ue600",
	foodTypes : {
		cheese: "\ue600",
		cherries: "\ue601",
		cocktail: "\ue602",
		coffee: "\ue603",
		croissant: "\ue604",
		cutlery: "\ue605",
		fastFood: "\ue606",
		ham: "\ue607",
		iceCream: "\ue608",
		iceCream2: "\ue609",
		knife: "\ue60a",
		pizza: "\ue60b",
		pot: "\ue60c",
		seaFood: "\ue60d",
		steak: "\ue60e",
		sweet: "\ue60f",
		taco: "\ue610",
		teaPot: "\ue611",
		vegetables: "\ue612"
	}
};

Alloy.Globals.analyticsShowView = function(viewName){
	if (Alloy.Globals.trackerGA){
		Alloy.Globals.trackerGA.addScreenView(viewName);
	}
};
Alloy.Globals.analyticsEvent = function(params){
	params = params || {};
	params.action = params.action || '';
	params.label = params.label;
	params.value = params.value || 1;
	
	var category, eventString;
	
	category = Ti.Platform.osname;
	eventString = [category, params.action].join('-');
	
	Ti.API.debug('Feature event: ' + eventString);
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

if (!ENV_PRODUCTION && Alloy.CFG.runTests) {
	require('tests/testsRunner');
}