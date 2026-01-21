# Coding-Clover URL & API Specification

## Common Area (Login/Non-login)
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Home | / | GET | - | X | X |
| All Courses | /course | GET | - | X | X |
| Beginner Courses | /course/level/1 | GET | - | X | X |
| Intermediate Courses | /course/level/2 | GET | - | X | X |
| Advanced Courses | /course/level/3 | GET | - | X | X |
| Community Main | /community | GET | - | X | X |
| Community Post List | /community/posts | GET | - | X | X |
| Community Post Detail | /community/posts/{id} | GET | id | X | X |
| Notice List | /notice | GET | - | X | X |
| Notice Detail | /notice/{id} | GET | id | X | X |
| Login (Log) | /auth/login | POST | login_id, password | X | X |
| Register Screen | /auth/register | GET | - | O | X |
| Register Action | /auth/register | POST | login_id, password, name, email, education_level, interest_category | X | O |
| Social Login | /auth/oauth | GET | provider | X | O |
| My Page | /mypage | GET | - | X | X |
| Profile Edit Screen | /mypage/profile | GET | - | O | X |
| Profile Edit Action | /mypage/profile | POST | name, email, (STUDENT) education_level, interest_category, (INSTRUCTOR) bio, career_years, (ADMIN) department | O | O |
| Password Change Screen | /mypage/password | GET | - | O | X |
| Password Change Action | /mypage/password | POST | password | O | O |

## Student Area
### Dashboard / Course
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Dashboard | /student/dashboard | GET | - | X | X |
| My Courses | /student/course | GET | - | X | X |
| Active Courses | /student/course/active | GET | - | X | X |
| Completed Courses | /student/course/completed | GET | - | X | X |
| Course Detail | /student/course/{courseId} | GET | courseId | X | X |
| Lecture List | /student/course/{courseId}/lectures | GET | courseId | X | X |
| Watch Lecture | /student/lecture/{lectureId} | GET | lectureId | X | X |
| Enroll (Log) | /student/course/{courseId}/enroll | POST | courseId | X | O |
| Cancel Enrollment | /student/course/{courseId}/cancel | POST | courseId | X | O |

### Coding Practice
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Problem List | /student/problem | GET | - | X | X |
| Problem by Level | /student/problem/level/{level} | GET | level | X | X |
| Problem Detail | /student/problem/{problemId} | GET | problemId | X | X |
| Submit Code | /student/problem/{problemId}/submit | POST | problemId, source_code | O | O |

### Exam / Evaluation
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Exam List | /student/exam | GET | - | X | X |
| Take Exam Screen | /student/exam/{examId} | GET | examId | X | X |
| Submit Exam | /student/exam/{examId} | POST | examId, answers | X | O |
| Exam Result | /student/exam/{examId}/result | GET | examId | X | X |

### History
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Study Log | /student/history | GET | - | X | X |
| Exam History | /student/history/exam | GET | - | X | X |

### Payment
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Payment History | /student/payment | GET | - | X | X |
| Purchase Ticket | /student/payment/purchase | POST | product_id | X | O |
| Refund History | /student/payment/refunds | GET | - | X | X |

### Q/A
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| My Questions | /student/qna | GET | - | X | X |
| New Question | /student/qna/new | POST | course_id, question | O | O |
| Question Detail | /student/qna/{id} | GET | id | X | X |

## Instructor Area
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Dashboard | /instructor/dashboard | GET | - | X | X |
| Manage Courses | /instructor/course | GET | - | X | X |
| Request New Course | /instructor/course/new | POST | title, description, level, price | O | O |
| Course Detail | /instructor/course/{id} | GET | id | X | X |
| Manage Lectures | /instructor/lecture | GET | - | X | X |
| Upload Lecture | /instructor/lecture/upload | POST | course_id, title, video_url, order_no | O | O |
| Exam List for Course | /instructor/course/{courseId}/exam | GET | courseId | X | X |
| Exam Attempts | /instructor/course/{courseId}/exam/{examId}/attempts | GET | courseId, examId | X | X |
| Attempt Detail | /instructor/course/{courseId}/exam/{examId}/attempts/{attemptId} | GET | courseId, examId, attemptId | X | X |
| Manage Exams | /instructor/exam | GET | - | X | X |
| New Exam | /instructor/exam/new | POST | title, time_limit, level, pass_score | O | O |
| Exam Detail | /instructor/exam/{id} | GET | id | X | X |
| Manage Q&A | /instructor/qna | GET | - | X | X |
| Answer Q&A | /instructor/qna/{id} | POST | answer | O | O |

## Admin Area
| Task | URL | Method | Parameter | Input Screen | Redirect |
|---|---|---|---|---|---|
| Dashboard | /admin/dashboard | GET | - | X | X |
| Manage Users | /admin/users | GET | - | X | X |
| Manage Students | /admin/users/students | GET | - | X | X |
| Manage Instructors | /admin/users/instructors | GET | - | X | X |
| Manage Courses | /admin/course | GET | - | X | X |
| Pending Courses | /admin/course/pending | GET | - | X | X |
| Approve Course | /admin/course/{id}/approve | POST | id | X | O |
| Reject Course | /admin/course/{id}/reject | POST | id, reason | O | O |
| Close Course | /admin/course/{id}/close | POST | id | X | O |
| Manage Lectures | /admin/lectures | GET | - | X | X |
| Block Lecture | /admin/lectures/{id}/inactive | POST | id | X | O |
| Payment History | /admin/payment | GET | - | X | X |
| Community Mgmt | /admin/community | GET | - | X | X |
| Problem Mgmt | /admin/problem | GET | - | X | X |
| Question Mgmt | /admin/problem/questions | GET | - | X | X |
| Logs | /admin/logs | GET | - | X | X |
| Exam Logs | /admin/logs/exams | GET | - | X | X |
| Manage Notices | /admin/notice | GET | - | X | X |
