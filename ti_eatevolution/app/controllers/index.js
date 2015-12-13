var ProfileRepository = require("ProfileRepository");

var launch, syncInterval, listController, mapController, infoController, orientationchange,
	synchronize, startAutoSync, stopAutoSync, appResumed, appPaused, init, onTabGroupOpen;

var TAB_LIST = 0,
	TAB_MAP = 1,
	TAB_INFO = 2;

syncInterval = null;
launch = true;

synchronize = function(){
	Ti.API.info("Synchronize");
	
	ProfileRepository.fetchDataOnline()
		.then(
			function(){
				listController.refresh();
				mapController.refresh();
				
				ProfileRepository.calculateDistances();
			},
			function(err){
				if (err.showAlert){
					Ti.UI.createAlertDialog({
						title: "",
						message: err.message,
						buttonNames: [L("lblOk")]
					}).show();
				}
				Ti.API.debug(JSON.stringify(err.message));
			}
		);
};

startAutoSync = function(){
	Ti.API.info("Start automatic sync");
	
	synchronize();
	if (syncInterval !== null) { clearInterval(syncInterval); }
	syncInterval = setInterval(synchronize, Number(Alloy.CFG.syncronizationInterval) * (60 * 1000));
};
stopAutoSync = function(){
	Ti.API.info("Stop automatic sync");
	
	clearInterval(syncInterval);
};

appResumed = function(){
	Ti.API.debug("App resumed");
	
	if (Alloy.CFG.syncronizationInterval){
		startAutoSync();
	}
};
Ti.App.addEventListener("resumed", appResumed);

appPaused = function(){
	Ti.API.debug("App paused");
	
	if (Alloy.CFG.syncronizationInterval){
		stopAutoSync();
	}
};
Ti.App.addEventListener("paused", appPaused);

init = function(){
	var addTab, connectivityChange;
	
	addTab = function(controllerName, title, icon){
		var controller = Alloy.createController(controllerName);
		var tab = Ti.UI.createTab({
			"title": title,
			"icon": icon,
			"window": controller.getView()
		});
		if (controller.setTab){
			controller.setTab(tab);
		}
		$.tabGroup.addTab(tab);
		
		return controller;
	};
	
	ProfileRepository.fetchDataOffline();
	
	if (OS_ANDROID){
		listController = addTab("list", "", "images/light_home.png");
		mapController = addTab("map", "", "images/light_globe.png");
		infoController = addTab("info", "", "images/light_info.png");
	} else {
		listController = addTab("list", L("lblListTab"), "images/dark_home.png");
		mapController = addTab("map", L("lblMapTab"), "images/dark_globe.png");
		infoController = addTab("info", L("lblInfoTab"), "images/dark_info.png");
	}
	
	// checking of connection for showing/hiding advertisement
	if (listController){ listController.showAdvertisement(Ti.Network.online); }
	if (mapController){ mapController.showAdvertisement(Ti.Network.online); }
	
	connectivityChange = function(e){
		if (e.online){
			Ti.API.debug(e.networkTypeName);
		}
		if (listController){ listController.showAdvertisement(e.online); }
		if (mapController){ mapController.showAdvertisement(e.online); }
	};
	Ti.Network.addEventListener("change", connectivityChange);
	
	if (Alloy.CFG.syncronizationInterval){
		startAutoSync();
	} else {
		synchronize();
	}
	
	$.tabGroup.activeTab = Alloy.Globals.justInstalled ? TAB_INFO : TAB_LIST;
	$.tabGroup.open();
};

// necessary for customizing android actionbar changing tab
onTabGroupOpen = function(e){
	if (OS_ANDROID){
		Alloy.Globals.currentTab = 0;
		
		var activity = e.source.getActivity();
	
		activity.onCreateOptionsMenu = function(createOptionEvent) {
			createOptionEvent.menu.clear();
			
			if (Alloy.Globals.currentTab === TAB_LIST){
				(function(menu){
					var item = menu.add({
						title: Alloy.Globals.Data.orderByDistance ? L("lblOrderByName") : L("lblOrderByDistance"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
					});
					item.addEventListener("click", function(){
						listController.orderByDistance({
							"onComplete": function(){
								item.title = Alloy.Globals.Data.orderByDistance ? L("lblOrderByName") : L("lblOrderByDistance");
							}
						});
					});
				}(createOptionEvent.menu));
			}
			if (Alloy.Globals.currentTab === TAB_LIST || Alloy.Globals.currentTab === TAB_MAP){
				(function(menu){
					var item = menu.add({
						title: L("lblReloadData"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
					});
					item.addEventListener("click", function(){
						mapController.refresh();
						listController.refresh();
					});
				}(createOptionEvent.menu));
				
				(function(menu){
					var item = menu.add({
						title: L("lblFilters"),
						icon: "/images/ic_action_search.png",
						showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS
					});
					item.addEventListener("click", function(){
						if (Alloy.Globals.currentTab === TAB_LIST){ listController.onFiltersClick(); }
						if (Alloy.Globals.currentTab === TAB_MAP){ mapController.onFiltersClick(); }
					});
				}(createOptionEvent.menu));
			}
			if (Alloy.Globals.currentTab === TAB_INFO){
				(function(menu){
					var item = menu.add({
						title: L("lblMoreInfoOrganization"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
					});
					item.addEventListener("click", function(){
						infoController.webOrganization();
					});
				}(createOptionEvent.menu));
				
				(function(menu){
					var item = menu.add({
						title: L("lblMoreInfoCampaign"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
					});
					item.addEventListener("click", function(){
						infoController.webCampaign();
					});
				}(createOptionEvent.menu));
				
				(function(menu){
					var item = menu.add({
						title: L("lblToJoin"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
					});
					item.addEventListener("click", infoController.toJoin);
				}(createOptionEvent.menu));
			}
		};
		
		$.tabGroup.addEventListener("focus", function(focusEvent) {
			if (typeof focusEvent.index !== "undefined"){
				activity.invalidateOptionsMenu();
				Alloy.Globals.currentTab = focusEvent.index;
			}
		});
	}
};

orientationchange = function(){
	if (listController){ listController.showAdvertisement(Ti.Network.online); }
	if (mapController){ mapController.showAdvertisement(Ti.Network.online); }
};
Ti.Gesture.addEventListener("orientationchange", orientationchange);

$.tabGroup.addEventListener("close", function(){
	Ti.Gesture.removeEventListener("orientationchange", orientationchange);
});

if (!ENV_PRODUCTION && Alloy.CFG.runTests) {
	launch = false;
	Ti.App.addEventListener("testsExecutionComplete", function testsExecutionComplete() {
		Ti.App.removeEventListener("testsExecutionComplete", testsExecutionComplete);
		init();
	});
}
if (launch) {
	init();
}
