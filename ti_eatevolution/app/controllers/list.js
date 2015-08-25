var _args = arguments[0] || {},
	App = Alloy.Globals.App, // reference to the APP singleton object
	$FM = require('favoritesmgr'),  // FavoritesManager object (see lib/utilities.js)
	locali = null,
	indexes = [];  // Array placeholder for the ListView Index (used by iOS only);
	
var title = (_args.title || "").toLowerCase();

Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".viewed");


/** 
 * Function to inialize the View, gathers data from the flat file and sets up the ListView
 */
function init(){
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json"); 
	
	locali = JSON.parse(file.read().text).locali;
	
	locali = _.sortBy(locali, function(item){
		return item.nome
	});
	
	if (locali) {
		indexes = [];
		var sections = [];
		
		// Group the data by first letter of last name to make it easier to create sections.
		var groups  = _.groupBy(locali, function(item){
		 	return item.nome.charAt(0);
		});

		_.each(groups, function(group){
			var dataToAdd = preprocessForListView(group);

			if(dataToAdd.length < 1) return;
			
			indexes.push({
				index: indexes.length,
				title: group[0].nome.charAt(0)
			});

			var sectionHeader = Ti.UI.createView({
				backgroundColor: "#ececec",
				width: Ti.UI.FILL,
				height: 30
			});

			var sectionLabel = Ti.UI.createLabel({
				text: group[0].nome.charAt(0),
				left: 20,
				font:{
					fontSize: 20
				},
				color: "#666"
			});
			sectionHeader.add(sectionLabel);

			var section = Ti.UI.createListSection({
				headerView: sectionHeader
			});
			section.items = dataToAdd;

			sections.push(section);
		});

		$.listView.sections = sections;
		
		if (OS_IOS) {
			$.wrapper.addEventListener("swipe", function(e){
				if(e.direction === "left"){
					$.listView.sectionIndexTitles = indexes;
				}
				if(e.direction === "right"){
					$.listView.sectionIndexTitles = null;
				}
			});
		}
	}
	
	if(_args.title){
		$.wrapper.title = _args.title;
	}
	
	if(_args.restrictToFavorites){
		OS_IOS && ($.searchBar.showBookmark = false);
	} else {
		if(OS_IOS){
			$.wrapper.leftNavButton = Ti.UI.createLabel({
				text: "\ue601",
				color: "#C41230",
				font:{
					fontFamily:"icomoon",
					fontSize:36
				}
			});
		}
	}
};

/**
 *	Convert an array of data from a JSON file into a format that can be added to the ListView
 * 
 * 	@param {Object} Raw data elements from the JSON file.
 */
var preprocessForListView = function(rawData) {
	if (_args.restrictToFavorites) {
		rawData = _.filter(rawData, function(item){
			return $FM.exists(item.id);
		});
	}
	
	return _.map(rawData, function(item) {
		var isFavorite = $FM.exists(item.id);
		
		return {
			template: isFavorite ? "favoriteTemplate" : "userTemplate",
			properties: {
				searchableText: item.nome + ' ' + item.email,
				user: item,
				editActions: [
					{title: isFavorite ? "- Preferito" : "+ Preferito", color: isFavorite ? "#C41230" : "#038BC8" }
				],
				canEdit:true
			},
			nome: {text: item.nome},
			telefono: {text: item.tel},
			indirizzo: {text: item.ind}
		};
	});	
};

/**
 * This function handles the click events for the rows in the ListView.
 * We want to capture the user property associated with the row, and pass
 * it into the profile View
 * 
 * @param {Object} Event data passed to the function
 */
function onItemClick(e){
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".contact.clicked");
	
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	
	Alloy.Globals.Navigator.open("profile", item.properties.user);
}

var onSearchChange, onSearchFocus, onSearchCancel;

/**
 * Handles the favorite icon click event. Launches this same control as a child window, but limits the view
 * to only favoitems.
 * 
 * @param {Object} Event data passed to the function
 */
var onBookmarkClick = function onClick (e){
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".favorites.clicked");
	
	Alloy.Globals.Navigator.open("list", {restrictToFavorites:true, title:"Preferiti", displayHomeAsUp:true});
};

/**
 * Handles the SearchBar OnChange event
 * 
 * @description On iOS we want the search bar to always be on top, so we use the onchange event to tie it back
 * 				to the ListView
 * 
 * @param {Object} Event data passed to the function
 */
onSearchChange = function onChange(e){
	$.listView.searchText = e.source.value;
};
	
if (OS_IOS){
	onSearchFocus = function onFocus(e){
		$.searchBar.showBookmark = false;
		$.searchBar.showCancel = true;
	};
	
	onSearchCancel = function onCancel(e){
		if (!_args.restrictToFavorites){
			$.searchBar.showBookmark = true;
			$.searchBar.showCancel = false;
		}
		$.searchBar.blur();
	};
	
	// FIXME - Add Comments
	function onRowAction(e){
		var row = e.section.getItemAt(e.itemIndex);
		var id = row.properties.user.id;
		
		if (e.action === "+ Preferito") {
			$FM.add(id);
		} else {
			$FM.remove(id);
		}
		
		$.listView.editing = false;
		init();
	}
	$.listView.addEventListener("rowAction", onRowAction);
}

$.wrapper.addEventListener("open", function onWindowOpen(){
	if (OS_ANDROID && _args.restrictToFavorites){
		var activity = $.wrapper.getActivity();
		activity.onCreateOptionsMenu = function(e) {
	 		e.menu.clear();
		};
		activity.invalidateOptionsMenu();
	}
});

Ti.App.addEventListener("refresh-data", function(e){
	init();
});

init();