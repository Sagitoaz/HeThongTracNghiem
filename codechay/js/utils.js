function $(sel) {
  return document.querySelector(sel);
}
function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

function uid(prefix) {
  return prefix + Math.random().toString(16).slice(2, 6).toUpperCase();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatExamType(exam) {
  return exam.type === "timed" ? `Timed (${exam.durationMin}m)` : "Free";
}

function avg(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function getQueryParam(name) {
  return new URLSearchParams(location.search).get(name);
}
