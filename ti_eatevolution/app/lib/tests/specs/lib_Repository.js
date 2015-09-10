var should = require('tests/should'),
	Repository = require('Repository');

describe("Repository", function() {

	describe("getLocaleTodayTimetable", function(){

		it("should return an empty array if 'locale' doesn't define a opening timetable", function(){
			Repository.getLocaleTodayTimetable().should.be.empty;
			Repository.getLocaleTodayTimetable({}).should.be.empty;
			Repository.getLocaleTodayTimetable({"aperto":null}).should.be.empty;
			Repository.getLocaleTodayTimetable({"aperto":undefined}).should.be.empty;
			Repository.getLocaleTodayTimetable({"aperto":[]}).should.be.empty;
		});

		it("should show the timetable for the right week-day", function(){
			var now = new Date("2015-01-01T00:00:00"); // thursday
			var locale = {"aperto":[
				{"da":"0000-01-01","a":"0000-12-31","gg":[
					[],
					[{"da":"05:00","a":"24:00"}],
					[{"da":"06:00","a":"23:00"}],
					[{"da":"07:00","a":"22:00"}], // thursday
					[{"da":"08:00","a":"21:00"}],
					[{"da":"09:00","a":"20:00"}],
					[{"da":"10:00","a":"19:00"}]
				]}
			]};
			Repository.getLocaleTodayTimetable(locale, now).should.eql([{"da":"07:00","a":"22:00"}]);
		});
		
		it("should show the timetable for the right period of the year", function(){
			var now = new Date("2015-08-01T00:00:00"); // thursday
			var locale = {"aperto":[
				{"da":"0000-01-01","a":"0000-05-31","gg":[
					[],
					[{"da":"05:00","a":"24:00"}],
					[{"da":"06:00","a":"23:00"}],
					[{"da":"07:00","a":"22:00"}], // thursday
					[{"da":"08:00","a":"21:00"}],
					[{"da":"09:00","a":"20:00"}],
					[{"da":"10:00","a":"19:00"}]
				]},
				{"da":"0000-06-01","a":"0000-12-31","gg":[
					[],
					[{"da":"11:00","a":"24:00"}],
					[{"da":"12:00","a":"23:00"}],
					[{"da":"13:00","a":"22:00"}],
					[{"da":"14:00","a":"21:00"}],
					[{"da":"15:00","a":"20:00"}], // saturday
					[{"da":"16:00","a":"19:00"}]
				]}
			]};
			Repository.getLocaleTodayTimetable(locale, now).should.eql([{"da":"15:00","a":"20:00"}]);
		});
	});

	describe("getFoodTypes", function(){

		it("should return an empty array if 'locale' has no array 'cibi' or it's empty", function() {
			Repository.getFoodTypes().should.be.empty;
			Repository.getFoodTypes({}).should.be.empty;
			Repository.getFoodTypes({'cibi':null}).should.be.empty;
			Repository.getFoodTypes({'cibi':undefined}).should.be.empty;
			Repository.getFoodTypes({'cibi':[]}).should.be.empty;
		});

		it("should return an array with unique values", function() {
			var locale = {
				"cibi":[
					{"tipo":"gel"},
					{"tipo":"gel"}
				]
			};
			Repository.getFoodTypes(locale).should.eql(["gel"]);
		});

		it("should return an array containing each values", function() {
			var locale = {
				"cibi":[
					{"tipo":"gel"},
					{"tipo":"pan"},
					{"tipo":"ins"}
				]
			};
			result = Repository.getFoodTypes(locale);
			result.should.have.length(3);
			result.should.containEql("gel");
			result.should.containEql("pan");
			result.should.containEql("ins");
		});

	});

	describe("getFoodCategories", function(){

		it("should return an empty array if 'locale' has no array 'cibi' or it's empty", function() {
			Repository.getFoodCategories().should.be.empty;
			Repository.getFoodCategories({}).should.be.empty;
			Repository.getFoodCategories({'cibi':null}).should.be.empty;
			Repository.getFoodCategories({'cibi':undefined}).should.be.empty;
			Repository.getFoodCategories({'cibi':[]}).should.be.empty;
		});

		it("should return an array with unique values", function() {
			var locale = {
				"cibi":[
					{"cat":["gf"]},
					{"cat":["gf"]}
				]
			};
			Repository.getFoodCategories(locale).should.eql(["gf"]);
		});

		it("should return an array containing each values", function() {
			var locale = {
				"cibi":[
					{"cat":["gf"]},
					{"cat":["lf"]},
					{"cat":["veget"]}
				]
			};
			result = Repository.getFoodCategories(locale);
			result.should.have.length(3);
			result.should.containEql("gf");
			result.should.containEql("lf");
			result.should.containEql("veget");
		});

	});

});