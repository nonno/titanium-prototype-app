var FavoritesManager = {
	// Reference to the local storage array that persists between sessions
	favorites: Ti.App.Properties.getList("favorites", []),
	
	exists: function _exists(id){
		return _.find(this.favorites, function(item){
			return id === item;
		});
	},
	
	add: function _push(id){
		if (!this.exists(id)){
			this.favorites.push(id);
		}
		Ti.App.Properties.setList("favorites", this.favorites);
	},
	
	remove: function _remove(id){
		this.favorites = _.difference(this.favorites, [id]);

		Ti.App.Properties.setList("favorites", this.favorites);
	}
};
module.exports = FavoritesManager;
