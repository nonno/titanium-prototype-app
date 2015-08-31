var addTab = function(controllerName, title, icon){
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

var listController = addTab('list', L('lblListTab'), 'images/dark_home.png');
var mapController = addTab('map', L('lblMapTab'), 'images/dark_globe.png');
var joinController = addTab('join', L('lblJoinTab'), 'images/dark_link.png');
var infoController = addTab('info', L('lblInfoTab'), 'images/dark_info.png');


// checking of connection for showing/hiding advertisement
listController.showAdvertisement(Ti.Network.online);
mapController.showAdvertisement(Ti.Network.online);

var connectivityChange = function(e){
	if (e.online){
		Ti.API.debug(e.networkTypeName);
	}
	listController.showAdvertisement(e.online);
	mapController.showAdvertisement(e.online);
};
Ti.Network.addEventListener('change', connectivityChange);


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

$.tabGroup.open();