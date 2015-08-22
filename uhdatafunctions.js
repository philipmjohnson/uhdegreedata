/**
 * Analytics for UH Data sets.
 * Created by philipjohnson on 8/12/15.
 */

/* globals _, uhdata */
/* exported listCampusDegrees, doctoralDegreePrograms, maxDegrees */
/* exported testdata, percentageHawaiian, totalDegreesByYear, listCampuses */

/**
 * Provides a small set of records from the UH dataset.
 * @type {string}
 */
var testdata = uhdata.slice(0, 2).concat(_.find(uhdata, isHawaiian));

// totalDegrees(data). Returns the total number of degrees awarded in the data set.
// 1. Reduce dataset by accumulating the number of awards.

/**
 * Reduction function for accumulating the number of degrees.
 * @param memo The accumulator.
 * @param record The UH Data record from which award numbers will be extracted.
 * @returns The total of the accumulator and the awards in this record.
 */
function addDegrees(memo, record) {
  if (isNaN(record["AWARDS"])) {
    throw new Error("Non-numeric AWARDS.");
  }
  return memo + record["AWARDS"];
}

/**
 * Returns true if the passed record has an AWARDS field.
 * @param record The record.
 * @returns {boolean} True if AWARDS field is present.
 */
function hasAwards(record) {
  return record.hasOwnProperty("AWARDS");
}

/**
 * Returns the total number of degrees in this data set.
 * @param data The UH dataset.
 * @returns The total number of degress.
 */
function totalDegrees(data) {
  if (!_.every(data, hasAwards)) {
    throw new Error("No AWARDS field.");
  }
  return _.reduce(data, addDegrees, 0);
}

// percentageHawaiian(data). Returns the percentage of degrees that were awarded to students of Hawaiian Legacy in
// the dataset.
// 1. Filter dataset to those records where HAWAIIAN_LEGACY === "HAWAIIAN".
// 2. Reduce that dataset to find total number of Hawaiian degrees.
// 3. Divide (2) by total number of degrees to get percentage.

/**
 * Predicate function returning true if the passed record concerns those of Hawaiian ancestry.
 * @param record The UH dataset record.
 * @returns True if concerns Hawaiian ancestry.
 */
function isHawaiian(record) {
  return record["HAWAIIAN_LEGACY"] === "HAWAIIAN";
}

/**
 * Filters dataset to those records concerning Hawaiian ancestry.
 * @param data the UH dataset.
 * @returns An array of records of those with Hawaiian ancestry.
 */
function hawaiianLegacy(data) {
  return _.filter(data, isHawaiian);
}

/**
 * Returns the total number of degrees awarded to those of Hawaiian ancestry in data.
 * @param data The UH dataset.
 * @returns Total number of degrees awarded to those of Hawaiian ancestry.
 */
function totalHawaiianLegacy(data) {
  return _.reduce(hawaiianLegacy(data), addDegrees, 0);
}

/**
 * Returns the percentage of degrees awarded to those of Hawaiian ancestry in the dataset.
 * @param data The UH dataset.
 * @returns Percentage degrees to Hawaiians.
 */
function percentageHawaiian(data) {
  return (totalHawaiianLegacy(data) / totalDegrees(data)) * 100;
}

// totalDegreesByYear(data, year). Returns the total number of degrees awarded in the passed year.
// 1. filter the dataset to those records from the passed year.
// 2. reduce to find the total number of degrees.

/**
 * Returns a predicate function that returns true if the passed record is from the given year.
 * @param year The year of interest.
 * @returns A function that returns true if the record is from the year.
 */
function makeYearFilter(year) {
  return function (record) {
    return record["FISCAL_YEAR"] === year;
  };
}

/**
 * Filters the dataset to those records from the passed year.
 * @param data The UH dataset.
 * @param year The year of interest as an integer.
 * @returns The array of records from the given year.
 */
function dataForYear(data, year) {
  return _.filter(data, makeYearFilter(year));
}

/**
 * Returns the total number of degrees awarded in the given year.
 * @param data The UH dataset.
 * @param year The year of interest.
 * @returns  The total degrees for that year.
 */
function totalDegreesByYear(data, year) {
  return _.reduce(dataForYear(data, year), addDegrees, 0);
}

// listCampuses(data). Returns an array containing all the campuses referenced in the passed dataset.
// 1. pluck the "CAMPUS" value into an array.
// 2. remove duplicates using unique().

/**
 * Returns the campuses in the passed dataset.
 * @param data The UH dataset.
 * @returns An array of strings, one for each campus in the dataset.
 */
function listCampuses(data) {
  return _.unique(_.pluck(data, "CAMPUS"));
}

// listCampusDegrees(data). Returns an object where the property keys are campuses and the values are the number of degrees awarded by the campus.
// 1. Group all of the records by campus (property keys are campuses, values are an array of records)
// 2. Reduce the array of records to total number of degrees.

/**
 * Groups the dataset by campus.
 * @param data The UH dataset.
 * @returns An object that groups the dataset records by campus.
 */
function groupByCampus(data) {
  return _.groupBy(data, "CAMPUS");
}

/**
 * Returns an object of key/value pairs. Keys are campuses, values are the number of degrees at that campus.
 * @param data The UH dataset.
 * @returns The degrees per campus.
 */
function listCampusDegrees(data) {
  return _.mapObject(groupByCampus(data),
      function (val) {
        return _.reduce(val, addDegrees, 0);
      });
}

// maxDegrees(data). Returns an integer indicating the maximum number of degrees awarded in a year.
// 1. Group all records by year.
// 2. Reduce to get object with years as key and number degrees as value.
// 3. get the max.

/**
 * Groups the dataset by year.
 * @param data The dataset.
 * @returns An object grouping the records in the dataset by year.
 */
function groupByYear(data) {
  return _.groupBy(data, "FISCAL_YEAR");
}

/**
 * Returns the maximum number of degrees awarded in a single year in the dataset.
 * @param data The UH dataset.
 * @returns The maximum number of degrees.
 */
function maxDegrees(data) {
  return _.max(_.mapObject(groupByYear(data),
      function (val) {
        return _.reduce(val, addDegrees, 0);
      }));
}

// doctoralDegreePrograms(data). Returns a list of the degree programs (“CIP_DESC”) for which a doctoral degree is granted.
// 1. Filter dataset to those records where OUTCOME === "Doctoral Degrees"
// 2. Pluck the CIP_DESC value of those records.
// 3. Remove duplicates using unique.

/**
 * Predicate function indicating if the passed record concerns a doctoral degree.
 * @param record The record of interest.
 * @returns True if concerns a doctoral degree.
 */
function isDoctoralDegree(record) {
  return record["OUTCOME"] === "Doctoral Degrees";
}

/**
 * Filters the data into those that concern a doctoral degree.
 * @param data The UH dataset.
 * @returns An array of records concerning a doctoral degree.
 */
function doctoralList(data) {
  return _.filter(data, isDoctoralDegree);
}

/**
 * Returns the list of programs with a doctoral degree.
 * @param data The UH dataset.
 * @returns A list of strings, one per program with a doctoral degree.
 */
function doctoralDegreePrograms(data) {
  return _.unique(_.pluck(doctoralList(data), "CIP_DESC"));
}


