var _args = arguments[0] || {},
	App = Alloy.Globals.App, // reference to the APP singleton object
	$FM = require('favoritesmgr'),  // FavoritesManager object (see lib/utilities.js)
	locali = null,
	indexes = [];  // Array placeholder for the ListView Index (used by iOS only);

var init, preprocessForListView, onItemClick, onBookmarkClick, onSearchChange, onSearchFocus, onSearchCancel, title, currentTab;

title = (_args.title || "").toLowerCase();

Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".viewed");

onSearchChange = function(e){
	Ti.API.info(e);
	$.listView.searchText = e.source.value;
};

preprocessForListView = function(rawData) {
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

init = function(){
	var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "userData/data.json"); 
	
	locali = JSON.parse(file.read().text).locali;
	
	locali = _.sortBy(locali, function(item){
		return item.nome;
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
				if (e.direction === "left"){
					$.listView.sectionIndexTitles = indexes;
				}
				if (e.direction === "right"){
					$.listView.sectionIndexTitles = null;
				}
			});
		}
	}
	
	if (_args.title){
		$.wrapper.title = _args.title;
	}
	
	if (_args.restrictToFavorites){
		OS_IOS && ($.searchBar.showBookmark = false);
	}
};

onItemClick = function(e){
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".contact.clicked");
	
	var item = $.listView.sections[e.sectionIndex].items[e.itemIndex];
	
	currentTab.open(Alloy.createController("profile", item.properties.user).getView());
};

onBookmarkClick = function(e){
	Ti.Analytics.featureEvent(Ti.Platform.osname+"."+title+".favorites.clicked");
	
	currentTab.open(Alloy.createController("list", {restrictToFavorites:true, title:"Preferiti", displayHomeAsUp:true}).getView());
};

if (OS_IOS){
	onSearchFocus = function(e){
		$.searchBar.showBookmark = false;
		$.searchBar.showCancel = true;
	};
	
	onSearchCancel = function(e){
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

$.wrapper.addEventListener("open", function(){
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

exports.setTab = function(tab){
	currentTab = tab;
};
