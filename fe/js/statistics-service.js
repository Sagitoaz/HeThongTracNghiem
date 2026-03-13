/**
 * statistics-service.js — Statistics calculations
 * Depends on: DataService
 */
const StatisticsService = (function () {

  function getOverallStats() {
    var users   = DataService.getUsers().filter(function (u) { return u.role === 'user'; });
    var exams   = DataService.getExams();
    var results = DataService.getResults();
    var avg = results.length === 0 ? 0 :
      parseFloat((results.reduce(function (s, r) { return s + r.score; }, 0) / results.length).toFixed(1));

    return {
      totalUsers:    users.length,
      totalExams:    exams.length,
      totalAttempts: results.length,
      averageScore:  avg,
    };
  }

  function getStatsByExam(examId) {
    var exam    = DataService.getExamById(examId);
    var results = DataService.getResultsByExam(examId);
    if (!exam) return null;

    var avg = results.length === 0 ? 0 :
      parseFloat((results.reduce(function (s, r) { return s + r.score; }, 0) / results.length).toFixed(1));

    return {
      examId:            examId,
      examName:          exam.name,
      attempts:          results.length,
      averageScore:      avg,
      scoreDistribution: getScoreDistribution(results),
      results:           results,
    };
  }

  /**
   * Returns counts for score buckets: 0-2, 2-4, 4-6, 6-8, 8-10.
   * @param {ExamResult[]} results
   * @returns {number[]} length 5
   */
  function getScoreDistribution(results) {
    var buckets = [0, 0, 0, 0, 0];
    results.forEach(function (r) {
      var s = r.score;
      if (s < 2)      buckets[0]++;
      else if (s < 4) buckets[1]++;
      else if (s < 6) buckets[2]++;
      else if (s < 8) buckets[3]++;
      else            buckets[4]++;
    });
    return buckets;
  }

  /**
   * Filter results by optional exam, startDate, endDate.
   */
  function filterResults(examId, startDate, endDate) {
    var results = examId ? DataService.getResultsByExam(examId) : DataService.getResults();
    if (startDate) {
      results = results.filter(function (r) { return new Date(r.submittedAt) >= new Date(startDate); });
    }
    if (endDate) {
      results = results.filter(function (r) { return new Date(r.submittedAt) <= new Date(endDate); });
    }
    return results;
  }

  function getAverageScore(results) {
    if (!results || results.length === 0) return 0;
    return parseFloat((results.reduce(function (s, r) { return s + r.score; }, 0) / results.length).toFixed(1));
  }

  return {
    getOverallStats,
    getStatsByExam,
    getScoreDistribution,
    filterResults,
    getAverageScore,
  };
})();
