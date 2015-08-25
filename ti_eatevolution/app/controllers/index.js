Alloy.Globals.Navigator = {
	navGroup: $.nav,
	
	open: function(controller, payload){
		var win = Alloy.createController(controller, payload || {}).getView();
		
		if (OS_IOS){
			$.nav.openWindow(win);
		} else {
			// added this property to the payload to know if the window is a child
			if (payload.displayHomeAsUp){
				
				win.addEventListener('open',function(evt){
					var activity=win.activity;
					activity.actionBar.displayHomeAsUp=payload.displayHomeAsUp;
					activity.actionBar.onHomeIconItemSelected=function(){
						evt.source.close();
					};
				});
			}
			win.open();
		}
	}
};


// Open appropriate start window
if (OS_IOS){
	$.nav.open();
} else {
	/**
	 * FIXME Removing Loading Animation on IOS until TIMOB-19214 is fixed
	 * https://jira.appcelerator.org/browse/TIMOB-19214
	 */
	var loadingView = Alloy.createController("loader");
	loadingView.getView().open();
	loadingView.start(); 
	
	setTimeout(function(){
		loadingView.finish(function(){
			
			if (OS_IOS){
				$.nav.open()
			} else{
				$.index.getView().open();
			} 
			
			loadingView.getView().close();
			loadingView = null;
		});
	}, 1500);
}
