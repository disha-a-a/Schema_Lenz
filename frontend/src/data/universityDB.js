export const Students = [
  { student_id: "S1", name: "Alice", major: "CS", year: "Senior" },
  { student_id: "S2", name: "Bob", major: "Math", year: "Junior" },
  { student_id: "S3", name: "Charlie", major: "Physics", year: "Freshman" },
];

export const Courses = [
  { course_id: "C101", title: "Intro to DB", credits: 4, dept: "CS" },
  { course_id: "M201", title: "Linear Algebra", credits: 3, dept: "Math" },
];

export const Enrollments = [
  { student_id: "S1", course_id: "C101", grade: "A" },
  { student_id: "S1", course_id: "M201", grade: "B" },
  { student_id: "S2", course_id: "C101", grade: "B+" },
];
