if (OS_IOS){
	var googleAnalytics = require('ti.ga');
	googleAnalytics.setDispatchInterval(30);
	
	Alloy.Globals.trackerGA = googleAnalytics.createTracker({
		trackingId: Alloy.CFG.gaTrackingId,
		useSecure: true
	});
}

Alloy.Globals.featureEvent = function(params){
	params = params || {};
	params.category = params.category || '';
	params.action = params.action || '';
	params.label = params.label;
	params.value = params.value || 1;
	
	var eventValues, eventString, eventProperties;
	
	eventValues = [params.category, params.action];
	if (params.label){
		eventValues.push(params.label);
	}
	
	eventString = eventValues.join('.');
	
	eventProperties = {
		category: "" + params.category,
		action: "" + params.action,
		value: params.value
	};
	if (params.label){
		eventProperties.label = "" + params.label;
	}
	
	Ti.API.debug('Feature event: ' + eventString);
	Ti.Analytics.featureEvent(eventString);
	
	if (Alloy.Globals.trackerGA){
		Alloy.Globals.trackerGA.addEvent(eventProperties);
	}
};

if (!ENV_PRODUCTION && Alloy.CFG.runTests) {
	require('tests/testsRunner');
}