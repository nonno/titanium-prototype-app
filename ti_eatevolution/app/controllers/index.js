var Repository = require('Repository');

var launch, syncInterval, listController, mapController, joinController, infoController,
	synchronize, startAutoSync, stopAutoSync, appResumed, appPaused;

syncInterval = null;
launch = true;

synchronize = function(){
	Ti.API.info('Synchronize');
	
	Repository.fetchDataOnline()
		.then(
			function(res){
				listController.refresh();
				mapController.refresh();
				
				Repository.calculateDistances();
			}, 
			function(err){
				if (err.showAlert){
					Ti.UI.createAlertDialog({
						title: '',
						message: err.message,
						buttonNames: [L('lblOk')]
					}).show();
				}
				Ti.API.debug(JSON.stringify(err.message));
			}
		);
};

startAutoSync = function(){
	Ti.API.info('Start automatic sync');
	
	synchronize();
	if (syncInterval !== null) { clearInterval(syncInterval); }
	syncInterval = setInterval(synchronize, Number(Alloy.CFG.syncronizationInterval)*(60*1000));
};
stopAutoSync = function(){
	Ti.API.info('Stop automatic sync');
	
	clearInterval(syncInterval);
};

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

appResumed = function(e){
	Ti.API.debug("App resumed");
	
	if (Alloy.CFG.syncronizationInterval){
		startAutoSync();
	}
};
Ti.App.addEventListener('resumed', appResumed);

appPaused = function(e){
	Ti.API.debug("App paused");
	
	if (Alloy.CFG.syncronizationInterval){
		stopAutoSync();
	}
};
Ti.App.addEventListener('paused', appPaused);

function init(){
	var addTab, connectivityChange;
	
	addTab = function(controllerName, title, icon){
		var controller = Alloy.createController(controllerName);
		var tab = Ti.UI.createTab({
			'title' : title,
			'icon' : icon,
			'window' : controller.getView()
		});
		if (controller.setTab){
			controller.setTab(tab);
		}
		$.tabGroup.addTab(tab);
		
		return controller;
	};
	
	Repository.fetchDataOffline();
	
	if (OS_ANDROID){
		listController = addTab('list', "", 'images/light_home.png');
		mapController = addTab('map', "", 'images/light_globe.png');
		joinController = addTab('join', "", 'images/light_link.png');
		infoController = addTab('info', "", 'images/light_info.png');
	} else {
		listController = addTab('list', L('lblListTab'), 'images/dark_home.png');
		mapController = addTab('map', L('lblMapTab'), 'images/dark_globe.png');
		joinController = addTab('join', L('lblJoinTab'), 'images/dark_link.png');
		infoController = addTab('info', L('lblInfoTab'), 'images/dark_info.png');
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
	Ti.Network.addEventListener('change', connectivityChange);
	
	if (Alloy.CFG.syncronizationInterval){
		startAutoSync();
	} else {
		synchronize();
	}
	
	$.tabGroup.open();
}

// necessary for customizing android actionbar changing tab
function onTabGroupOpen(e){
	if (OS_ANDROID){
		Alloy.Globals.currentTab=0;
		
		var activity = e.source.getActivity();
	
		activity.onCreateOptionsMenu = function(e) {
			var item, searchView;
			
			e.menu.clear();
			
			switch(Alloy.Globals.currentTab){
				case 0:
					searchView = Ti.UI.Android.createSearchView({
						hintText : L('lblSearch')
					});
					searchView.addEventListener('change', listController.onSearchChange);
					
					e.menu.add({
						title : L('lblSearch'),
						showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
						icon : Ti.Android.R.drawable.ic_menu_search,
						actionView : searchView
					});
					
					item = e.menu.add({
						title : L('lblFavorites'),
						showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
						icon : '/images/ic_action_action_bookmark.png'
					});
					item.addEventListener('click', listController.onBookmarkClick);
					break;
				case 1:
					item = e.menu.add({
						title : L('lblFavorites'),
						showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
						icon : '/images/ic_action_action_bookmark.png'
					});
					item.addEventListener('click', mapController.onBookmarkClick);
					break;
			}
		};
		
		$.tabGroup.addEventListener("focus", function(e) {
			if (typeof e.index !== "undefined"){
				activity.invalidateOptionsMenu();
				Alloy.Globals.currentTab = e.index;
			} 
		});
	}
};