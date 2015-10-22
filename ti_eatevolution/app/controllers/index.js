var Repository = require("Repository");

var launch, syncInterval, listController, mapController, joinController, infoController, orientationchange,
	synchronize, startAutoSync, stopAutoSync, appResumed, appPaused, init, onTabGroupOpen;

var TAB_LIST = 0,
	TAB_MAP = 1;

syncInterval = null;
launch = true;

synchronize = function(){
	Ti.API.info("Synchronize");
	
	Repository.fetchDataOnline()
		.then(
			function(){
				listController.refresh();
				mapController.refresh();
				
				Repository.calculateDistances();
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
	
	Repository.fetchDataOffline();
	
	if (OS_ANDROID){
		listController = addTab("list", "", "images/light_home.png");
		mapController = addTab("map", "", "images/light_globe.png");
		//joinController = addTab("join", "", "images/light_link.png");
		//infoController = addTab("info", "", "images/light_info.png");
	} else {
		listController = addTab("list", L("lblListTab"), "images/dark_home.png");
		mapController = addTab("map", L("lblMapTab"), "images/dark_globe.png");
		//joinController = addTab("join", L("lblJoinTab"), "images/dark_link.png");
		//infoController = addTab("info", L("lblInfoTab"), "images/dark_info.png");
	}
	
	// checking of connection for showing/hiding advertisement
	listController.showAdvertisement(Ti.Network.online);
	mapController.showAdvertisement(Ti.Network.online);
	
	connectivityChange = function(e){
		if (e.online){
			Ti.API.debug(e.networkTypeName);
		}
		listController.showAdvertisement(e.online);
		mapController.showAdvertisement(e.online);
	};
	Ti.Network.addEventListener("change", connectivityChange);
	
	if (Alloy.CFG.syncronizationInterval){
		startAutoSync();
	} else {
		synchronize();
	}
	
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
					var searchView = Ti.UI.Android.createSearchView({
						hintText: L("lblSearch")
					});
					searchView.addEventListener("change", listController.onSearchChange);
					
					menu.add({
						title: L("lblSearch"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
						icon: Ti.Android.R.drawable.ic_menu_search,
						actionView: searchView
					});
				}(createOptionEvent.menu));
				
				(function(menu){
					var item = menu.add({
						title: Alloy.Globals.Data.orderByDistance ? L("lblOrderByName") : L("lblOrderByDistance"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
					});
					item.addEventListener("click", function(){
						Repository.calculateDistances().then(
							function(){
								Alloy.Globals.Data.orderByDistance = !Alloy.Globals.Data.orderByDistance;
								
								listController.refresh();
								
								item.title = Alloy.Globals.Data.orderByDistance ? L("lblOrderByName") : L("lblOrderByDistance");
							},
							function(err){
								Ti.API.warn(err);
								
								Ti.UI.createAlertDialog({
									title: "",
									message: L("msgCurrentLocationUnavailable"),
									buttonNames: [L("lblOk")]
								}).show();
							}
						);
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
						title: Alloy.Globals.Data.favorites ? L("lblShowAll") : L("lblShowOnlyFavorites"),
						showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER
					});
					item.addEventListener("click", function(){
						Alloy.Globals.Data.favorites = !Alloy.Globals.Data.favorites;
						
						listController.onBookmarkClick();
						mapController.onBookmarkClick();
						
						item.title = Alloy.Globals.Data.favorites ? L("lblShowAll") : L("lblShowOnlyFavorites");
					});
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

orientationchange = function(e){
	listController.showAdvertisement(Ti.Network.online);
	mapController.showAdvertisement(Ti.Network.online);
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
