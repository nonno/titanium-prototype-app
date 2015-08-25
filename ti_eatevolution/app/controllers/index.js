Alloy.Globals.Navigator = {
	open: function(controller, payload){
		var newController = Alloy.createController(controller, payload || {});
		var win = newController.getView();
		
		if (OS_IOS && newController.backButtonContainer){
			newController.backButtonContainer.visible = true;
			newController.backButtonContainer.height = Ti.UI.SIZE;
		}
		
		if (payload.displayHomeAsUp){
			win.addEventListener('open',function(evt){
				var activity=win.activity;
				if (activity){
					activity.actionBar.displayHomeAsUp=payload.displayHomeAsUp;
					activity.actionBar.onHomeIconItemSelected=function(){
						evt.source.close();
					};
				}
			});
		}
		win.open();
	}
};

$.tabGroup.open();