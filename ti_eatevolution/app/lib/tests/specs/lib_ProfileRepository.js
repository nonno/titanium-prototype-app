var assert = require("tests/chai").assert,
	ProfileRepository = require("ProfileRepository");

describe("ProfileRepository", function() {

	describe("getLocaleTodayTimetable", function(){

		it("should return an empty array if 'locale' doesn't define a opening timetable", function(){
			assert.lengthOf(ProfileRepository.getLocaleTodayTimetable(), 0, '()');
			assert.lengthOf(ProfileRepository.getLocaleTodayTimetable({}), 0, '{}');
			assert.lengthOf(ProfileRepository.getLocaleTodayTimetable({"aperto": null}), 0, '{"aperto": null}');
			assert.lengthOf(ProfileRepository.getLocaleTodayTimetable({"aperto": undefined}), 0, '{"aperto": undefined}');
			assert.lengthOf(ProfileRepository.getLocaleTodayTimetable({"aperto": []}), 0, '{"aperto": []}');
		});

		it("should show the timetable for the right week-day", function(){
			var now = new Date("2015-01-01T00:00:00"); // thursday
			var locale = {"aperto": [
				{"da": "0000-01-01", "a": "0000-12-31", "gg": [
					[],
					[{"da": "05:00", "a": "24:00"}],
					[{"da": "06:00", "a": "23:00"}],
					[{"da": "07:00", "a": "22:00"}], // thursday
					[{"da": "08:00", "a": "21:00"}],
					[{"da": "09:00", "a": "20:00"}],
					[{"da": "10:00", "a": "19:00"}]
				]}
			]};
			assert.deepEqual(ProfileRepository.getLocaleTodayTimetable(locale, now), [{"da": "07:00", "a": "22:00"}]);
		});
		
		it("should show the timetable for the right period of the year", function(){
			var now = new Date("2015-08-01T00:00:00"); // thursday
			var locale = {"aperto": [
				{"da": "0000-01-01", "a": "0000-05-31", "gg": [
					[],
					[{"da": "05:00", "a": "24:00"}],
					[{"da": "06:00", "a": "23:00"}],
					[{"da": "07:00", "a": "22:00"}], // thursday
					[{"da": "08:00", "a": "21:00"}],
					[{"da": "09:00", "a": "20:00"}],
					[{"da": "10:00", "a": "19:00"}]
				]},
				{"da": "0000-06-01", "a": "0000-12-31", "gg": [
					[],
					[{"da": "11:00", "a": "24:00"}],
					[{"da": "12:00", "a": "23:00"}],
					[{"da": "13:00", "a": "22:00"}],
					[{"da": "14:00", "a": "21:00"}],
					[{"da": "15:00", "a": "20:00"}], // saturday
					[{"da": "16:00", "a": "19:00"}]
				]}
			]};
			assert.deepEqual(ProfileRepository.getLocaleTodayTimetable(locale, now), [{"da": "15:00", "a": "20:00"}]);
		});
	});

	describe("getFoodTypes", function(){

		it("should return an empty array if 'locale' has no array 'cibi' or it's empty", function() {
			assert.lengthOf(ProfileRepository.getFoodTypes(), 0, "()");
			assert.lengthOf(ProfileRepository.getFoodTypes({}), 0, "{}");
			assert.lengthOf(ProfileRepository.getFoodTypes({"cibi": null}), 0, '{"cibi": null}');
			assert.lengthOf(ProfileRepository.getFoodTypes({"cibi": undefined}), 0, '{"cibi": undefined}');
			assert.lengthOf(ProfileRepository.getFoodTypes({"cibi": []}), 0, '{"cibi": []}');
		});

		it("should return an array with unique values", function() {
			var locale = {
				"cibi": [
					{"tipo": "gel"},
					{"tipo": "gel"}
				]
			};
			assert.deepEqual(ProfileRepository.getFoodTypes(locale), ["gel"]);
		});

		it("should return an array containing each values", function() {
			var locale = {
				"cibi": [
					{"tipo": "gel"},
					{"tipo": "pan"},
					{"tipo": "ins"}
				]
			};
			result = ProfileRepository.getFoodTypes(locale);
			assert.lengthOf(result, 3);
			assert.include(result, "gel");
			assert.include(result, "pan");
			assert.include(result, "ins");
		});

	});

	describe("getFoodCategories", function(){

		it("should return an empty array if 'locale' has no array 'cibi' or it's empty", function() {
			assert.lengthOf(ProfileRepository.getFoodCategories(), 0, "()");
			assert.lengthOf(ProfileRepository.getFoodCategories({}), 0, "{}");
			assert.lengthOf(ProfileRepository.getFoodCategories({"cibi": null}), 0, '{"cibi": null}');
			assert.lengthOf(ProfileRepository.getFoodCategories({"cibi": undefined}), 0, '{"cibi": undefined}');
			assert.lengthOf(ProfileRepository.getFoodCategories({"cibi": []}), 0, '{"cibi": []}');
		});

		it("should return an array with unique values", function() {
			var locale = {
				"cibi": [
					{"cat": ["gf"]},
					{"cat": ["gf"]}
				]
			};
			assert.deepEqual(ProfileRepository.getFoodCategories(locale), ["gf"]);
		});

		it("should return an array containing each values", function() {
			var locale = {
				"cibi": [
					{"cat": ["gf"]},
					{"cat": ["lf"]},
					{"cat": ["veget"]}
				]
			};
			result = ProfileRepository.getFoodCategories(locale);
			assert.lengthOf(result, 3);
			assert.include(result, "gf");
			assert.include(result, "lf");
			assert.include(result, "veget");
		});

	});

});
