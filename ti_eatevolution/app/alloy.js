Alloy.Globals.trackerGA = require('ti.ga').createTracker({
	trackingId: Alloy.CFG.gaTrackingId,
	useSecure: true
});

Alloy.Globals.Data = {};
Alloy.Globals.Data.locali = {};
Alloy.Globals.Data.favorites = false;
Alloy.Globals.Data.orderByDistance = false;

Alloy.Globals.Icons = {
	"profileTypes": {
		"bar": "\ue600",
		"ff": "\ue601",
		"for": "\ue602",
		"gel": "\ue603",
		"pas": "\ue604",
		"piz": "\ue605",
		"ris": "\ue606",
		"ros": "\ue607",
		"tc": "\ue608"
	},
	"fontAwesome": {
		"star": "\uf005",
		"home": "\uf015",
		"timesCircle": "\uf057",
		"checkCircle": "\uf058",
		"exlamationTriangle": "\uf071",
		"calendar": "\uf073",
		"phone": "\uf095",
		"globe": "\uf0ac",
		"cloud": "\uf0c2",
		"money": "\uf0d6",
		"caretDown": "\uf0d7",
		"envelope": "\uf0e0",
		"map": "\uf278"
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