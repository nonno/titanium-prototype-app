var assert = require("tests/chai").assert,
	ProfileRepository = require("ProfileRepository");

describe("Data test", function() {

	describe("remote data.json", function(){
		var Request = require("Request");
		
		it("should be in the remote directory", function(done) {
			Request.get(Alloy.CFG.dataUrl, {
				"success": function(res){
					assert(1 === 1, "File present");
					done();
				},
				"error": function(err){
					assert(1 === 0, "File not present");
					done();
				}
			});
		});
		
		it("should be well formed and contains locali", function(done) {
			Request.get(Alloy.CFG.dataUrl, {
				"success": function(res){
					try {
						var data = JSON.parse(res);
						
						assert(1 === 1, "File well formed");
					} catch(err){
						assert(1 === 0, "File not well formed");
					}
					assert.isAbove(data.locali.length, 0, "At least one locale is present");
					done();
				},
				"error": function(err){
					done();
				}
			});
		});
		
		it("should have the same app's version", function(done) {
			Request.get(Alloy.CFG.dataUrl, {
				"success": function(res){
					var data = JSON.parse(res);
					if (OS_IOS){
						assert.equal(data.currentIosVersion, Ti.App.version);
					}
					if (OS_ANDROID){
						assert.equal(data.currentAndroidVersion, Ti.App.version);
					}
					done();
				},
				"error": function(err){
					done();
				}
			});
		});
	});

	describe("local data.json", function(){
		
		it("should be inside assets directory", function() {
			assert.isTrue(ProfileRepository.getAssetDataFile().exists());
		});
		
		it("should be well formed", function() {
			try {
				var data = JSON.parse(ProfileRepository.getAssetDataFile().read().text);
				
				assert(1 === 1, "File well formed");
			} catch(err){
				assert(1 === 0, "File not well formed");
			}
		});
	});

});
