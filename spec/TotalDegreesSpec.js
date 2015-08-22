describe("TotalDegrees", function() {
  var testdata = uhdata.slice(0, 2).concat(_.find(uhdata, isHawaiian));

  it("should be able to find the total of all degrees", function() {
    expect(totalDegrees(testdata)).toEqual(403);
  });

  var noAwardsField = testdata.concat({foo:"bar"});

  it("should throw an error when AWARDS field is missing", function() {
    expect(function(){totalDegrees(noAwardsField);}).toThrowError("AWARDS field missing");
  });

  var nonNumberAwards = testdata.concat({"AWARDS":"bar"});

  it("should throw an error when AWARDS field has non-numeric value", function() {
    expect(function(){totalDegrees(nonNumberAwards);}).toThrowError("AWARDS field has non-numeric value");
  });


});
