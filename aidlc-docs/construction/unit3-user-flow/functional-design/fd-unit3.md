# Functional Design — Unit 3: User Exam Flow

## Business Rules

### BR-INDEX-01 — Exam Availability
- `free`: always available; button enabled
- `scheduled`: enabled only when `startTime` has arrived (current time ≥ startTime)
- Locked exams: button disabled, show scheduled time

### BR-INDEX-02 — Search
- Real-time filter on exam `name` and `description` (case-insensitive)

### BR-EXAM-01 — Start Exam
- Create ExamSession: `{ id, examId, userId, startTime, answers: Array(n).fill(-1), totalQuestions }`
- Persist to `localStorage[httn_exam_session]`
- Redirect to `exam.html?id=<examId>`

### BR-EXAM-02 — Resume / Already in Progress
- If `httn_exam_session` exists with same examId & userId → resume (restore timer from `startTime`)

### BR-EXAM-03 — Timer
- Total seconds = duration × 60
- Elapsed = (Date.now() - session.startTime) / 1000
- Remaining = total - elapsed (floor to 0)
- When remaining ≤ 0 → auto-submit

### BR-EXAM-04 — Save Answer
- `answers[questionIndex] = selectedOption (0-3)` — update session in localStorage immediately

### BR-EXAM-05 — Submit
- `submitExam()`:
  1. Calculate score: count answers[i] === questions[i].correctAnswer
  2. score = (correct / total) × 10 rounded 1 decimal
  3. Build ExamResult object, call DataService.saveResult()
  4. Remove `httn_exam_session` from localStorage
  5. Redirect to `result.html?id=<resultId>`

### BR-RESULT-01 — Load Result
- Read resultId from URL param
- Load ExamResult from DataService.getResults()
- Load Exam (for question details) from DataService.getExamById(result.examId)

### BR-RESULT-02 — Chart
- Chart.js Doughnut: [correct, wrong] → colors: [#28A745, #DC3545]

### BR-RESULT-03 — Review
- For each question: show question text, all options, mark user answer + correct answer

## Logic Model (Pseudocode)

### ExamService.startExam(examId, userId)
```
exam = DataService.getExamById(examId)
existing = localStorage[httn_exam_session] → parse
if existing && existing.examId === examId && existing.userId === userId:
  return existing   // resume
session = {
  id: DataService.generateId(),
  examId, userId,
  startTime: Date.now(),
  answers: new Array(exam.questions.length).fill(-1),
  totalQuestions: exam.questions.length
}
localStorage[httn_exam_session] = JSON.stringify(session)
return session
```

### ExamService.saveAnswer(questionIndex, answerIndex)
```
session = JSON.parse(localStorage[httn_exam_session])
session.answers[questionIndex] = answerIndex
localStorage[httn_exam_session] = JSON.stringify(session)
```

### ExamService.submitExam()
```
session = JSON.parse(localStorage[httn_exam_session])
exam = DataService.getExamById(session.examId)
{ score, correct, total } = calculateScore(exam.questions, session.answers)
duration = Math.floor((Date.now() - session.startTime) / 1000)
result = {
  id: DataService.generateId(),
  examId: session.examId,
  examName: exam.name,
  userId: session.userId,
  username: DataService.getUserById(session.userId).username,
  score, correct, total,
  answers: session.answers,
  submittedAt: new Date().toISOString(),
  duration
}
DataService.saveResult(result)
localStorage.removeItem('httn_exam_session')
return result
```

### ExamService.calculateScore(questions, answers)
```
correct = 0
for i in range(questions.length):
  if answers[i] === questions[i].correctAnswer: correct++
total = questions.length
score = parseFloat(((correct / total) * 10).toFixed(1))
return { score, correct, total }
```
