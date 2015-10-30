var assert = require("tests/chai").assert,
	VersionChecker = require("VersionChecker");

// major[.minor[.maintenance[.build]]]
describe("VersionChecker", function() {
	
	describe("Validation", function() {
		
		it("should check that version has maximum four parts divided by a point", function(){
			assert.isTrue(VersionChecker.validate("1.0.0.0"), "1.0.0.0");
			
			assert.isFalse(VersionChecker.validate("1.0.0.0.0"), "1.0.0.0.0");
		});
		
		it("should check that there is a major version", function(){
			assert.isTrue(VersionChecker.validate("1"), "1");
			
			assert.isFalse(VersionChecker.validate(""), "");
		});
		
		it("should check that first three parts are numbers", function(){
			assert.isTrue(VersionChecker.validate("1.0.0.0"), "1.0.0.0");
			
			assert.isFalse(VersionChecker.validate("1.a.0.0"), "1.a.0.0");
			assert.isFalse(VersionChecker.validate("1.0.a.0"), "1.0.a.0");
		});
		
		it("should check that last part can be numeric or not", function(){
			assert.isTrue(VersionChecker.validate("1.0.0.a"), "1.0.0.a");
			
			assert.isTrue(VersionChecker.validate("1.0.0.0"), "1.0.0.0");
		});
		
	});
	
	describe("Compare", function() {
		
		it("should check major version first", function(){
			assert.equal(VersionChecker.compare("0.2", "1.1.1"), 2);
			assert.equal(VersionChecker.compare("1.1.1", "0.2"), 1);
		});
		
		it("should check minor version if major is the same", function(){
			assert.equal(VersionChecker.compare("1.2", "1.1.1"), 1);
			assert.equal(VersionChecker.compare("1.1.1", "1.2"), 2);
		});
		
		it("should check maintenance version if major and minor are the same", function(){
			assert.equal(VersionChecker.compare("1.1.2", "1.1.1"), 1);
			assert.equal(VersionChecker.compare("1.1.1", "1.1.2"), 2);
		});
		
		it("should check build if major, minor and maintenance are the same", function(){
			assert.equal(VersionChecker.compare("1.1.1.b", "1.1.1.a"), 1);
			assert.equal(VersionChecker.compare("1.1.1.a", "1.1.1.b"), 2);
		});
	
	});
});