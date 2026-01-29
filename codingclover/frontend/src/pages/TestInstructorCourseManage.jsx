import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TestInstructorCourseManage = () => {
    const navigate = useNavigate();

    // 강좌 목록 상태
    const [courses, setCourses] = useState([]);
    // 아코디언 펼침 상태 (클릭된 강좌 ID 저장)
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    // 강좌별 강의 목록 캐시 (Map 형태: { courseId: [lectures] })
    const [lecturesMap, setLecturesMap] = useState({});

    const [loading, setLoading] = useState(true);

    // 1. 초기 강좌 목록 불러오기
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // 강사 본인의 강좌 리스트 조회 API
            const response = await axios.get('/instructor/course/my-list');
            setCourses(response.data);
            setLoading(false);
        } catch (error) {
            console.error("강좌 목록 로딩 실패", error);
            alert("강좌 목록을 불러오지 못했습니다.");
            setLoading(false);
        }
    };

    // 2. 강좌 클릭 시 강의 목록 불러오기 (아코디언 토글)
    const toggleAccordion = async (courseId) => {
        if (expandedCourseId === courseId) {
            setExpandedCourseId(null); // 이미 열려있으면 닫기
            return;
        }

        setExpandedCourseId(courseId); // 열기

        // 이미 불러온 적 있는 강의 목록이면 API 호출 스킵
        if (lecturesMap[courseId]) return;

        try {
            // 해당 강좌의 강의 목록 조회 API 호출
            // (백엔드에 GET /instructor/course/{courseId}/lectures 엔드포인트가 필요합니다)
            const response = await axios.get(`/instructor/course/${courseId}/lectures`);
            setLecturesMap(prev => ({ ...prev, [courseId]: response.data }));
        } catch (error) {
            console.error("강의 목록 로딩 실패", error);
            alert("강의 목록을 불러오는데 실패했습니다.");
        }
    };

    // 상태 뱃지 컴포넌트
    const StatusBadge = ({ status }) => {
        let color = '#666';
        let text = status;
        let bgColor = '#eee';

        if (status === 'APPROVED') {
            color = '#28a745';
            bgColor = '#d4edda';
            text = '승인 완료';
        } else if (status === 'PENDING') {
            color = '#ffc107';
            bgColor = '#fff3cd';
            text = '승인 대기';
        } else if (status === 'REJECTED') {
            color = '#dc3545';
            bgColor = '#f8d7da';
            text = '반려됨 (수정 필요)';
        }

        return (
            <span style={{
                backgroundColor: bgColor,
                color: color,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.8em',
                fontWeight: 'bold',
                border: `1px solid ${color}`
            }}>
                {text}
            </span>
        );
    };

    if (loading) return <div>데이터를 불러오는 중...</div>;

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '15px' }}>내 강좌/강의 통합 관리</h2>

            {courses.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>등록된 강좌가 없습니다.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {courses.map(course => (
                        <div key={course.courseId} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>

                            {/* [강좌 헤더] 클릭 시 아코디언 토글 */}
                            <div
                                style={{
                                    padding: '20px',
                                    backgroundColor: '#f8f9fa',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => toggleAccordion(course.courseId)}
                            >
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0' }}>
                                        {course.title}
                                        <span style={{ fontSize: '0.8em', color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>
                                            (ID: {course.courseId})
                                        </span>
                                    </h3>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <StatusBadge status={course.proposalStatus} />
                                        {/* 강좌가 반려된 경우 수정 버튼 노출 */}
                                        {course.proposalStatus === 'REJECTED' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 아코디언 토글 방지
                                                    navigate(`/test/instructor/course/edit/${course.courseId}`);
                                                }}
                                                style={{
                                                    padding: '5px 10px',
                                                    fontSize: '0.8em',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                강좌 수정 및 재승인 요청
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.5em', color: '#666' }}>
                                    {expandedCourseId === course.courseId ? '▲' : '▼'}
                                </div>
                            </div>

                            {/* [강의 리스트] 아코디언 바디 */}
                            {expandedCourseId === course.courseId && (
                                <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #ddd' }}>
                                    <h4 style={{ marginTop: 0, color: '#555' }}>📂 포함된 강의 목록</h4>

                                    {lecturesMap[course.courseId] && lecturesMap[course.courseId].length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid #eee', color: '#888', fontSize: '0.9em' }}>
                                                    <th style={{ textAlign: 'left', padding: '10px' }}>순서</th>
                                                    <th style={{ textAlign: 'left', padding: '10px' }}>강의 제목</th>
                                                    <th style={{ textAlign: 'center', padding: '10px' }}>영상 길이</th>
                                                    <th style={{ textAlign: 'center', padding: '10px' }}>상태</th>
                                                    <th style={{ textAlign: 'center', padding: '10px' }}>관리</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lecturesMap[course.courseId].map(lecture => (
                                                    <tr key={lecture.lectureId} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '10px' }}>{lecture.orderNo}강</td>
                                                        <td style={{ padding: '10px' }}>
                                                            {lecture.title}
                                                            {/* 강의가 반려된 경우 사유 미리보기 (선택사항) */}
                                                            {lecture.approvalStatus === 'REJECTED' && lecture.rejectReason && (
                                                                <div style={{ fontSize: '0.8em', color: '#dc3545', marginTop: '2px' }}>
                                                                    └ 사유: {lecture.rejectReason}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>{lecture.duration}초</td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            <StatusBadge status={lecture.approvalStatus} />
                                                        </td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            {/* 강의가 반려된 경우에만 수정 버튼 활성화 */}
                                                            {lecture.approvalStatus === 'REJECTED' ? (
                                                                <button
                                                                    onClick={() => navigate(`/test/lecture/edit/${lecture.lectureId}`)}
                                                                    style={{
                                                                        padding: '5px 10px',
                                                                        backgroundColor: 'white',
                                                                        border: '1px solid #dc3545',
                                                                        color: '#dc3545',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9em'
                                                                    }}
                                                                >
                                                                    수정
                                                                </button>
                                                            ) : (
                                                                <span style={{ color: '#ccc', fontSize: '0.9em' }}>수정 불가</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p style={{ color: '#888', fontStyle: 'italic', padding: '10px' }}>
                                            등록된 강의가 없습니다.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestInstructorCourseManage;