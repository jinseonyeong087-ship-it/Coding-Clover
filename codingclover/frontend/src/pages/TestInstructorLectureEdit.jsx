import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TestInstructorLectureEdit = () => {
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [usedOrders, setUsedOrders] = useState([]); // 이미 사용 중인 순서 번호들
    
    // 강의 데이터 상태
    const [formData, setFormData] = useState({
        courseId: null,
        title: '',
        orderNo: 1,
        videoUrl: '',
        duration: 0,
        uploadType: 'IMMEDIATE',
        scheduledAt: '',
        approvalStatus: '',
        rejectReason: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. 현재 수정하려는 강의 상세 정보 가져오기
                const lecResponse = await axios.get(`/instructor/lecture/${lectureId}`);
                const lecture = lecResponse.data;

                setFormData({
                    courseId: lecture.courseId, // 중요: 형제 강의를 찾기 위해 필요
                    title: lecture.title,
                    orderNo: lecture.orderNo,
                    videoUrl: lecture.videoUrl,
                    duration: lecture.duration,
                    uploadType: lecture.uploadType || 'IMMEDIATE',
                    scheduledAt: lecture.scheduledAt || '',
                    approvalStatus: lecture.approvalStatus,
                    rejectReason: lecture.rejectReason
                });

                // 2. 같은 강좌에 속한 다른 강의들의 순서 번호 가져오기 (중복 방지용)
                // 백엔드에 해당 강좌의 강의 리스트를 주는 API가 있어야 합니다.
                const listResponse = await axios.get(`/instructor/course/${lecture.courseId}/lectures`);
                const allLectures = listResponse.data;

                // 나 자신(현재 수정 중인 강의)을 제외한 나머지 강의들의 순서 번호만 추출
                const othersOrders = allLectures
                    .filter(l => l.lectureId !== Number(lectureId)) 
                    .map(l => l.orderNo);
                
                setUsedOrders(othersOrders);
                setLoading(false);

            } catch (error) {
                console.error("데이터 로딩 실패", error);
                alert("강의 정보를 불러오지 못했습니다.");
                navigate('/test/manage');
            }
        };

        loadData();
    }, [lectureId, navigate]);

    // 입력값 변경
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 수정 요청 전송
    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!window.confirm("수정된 내용으로 다시 승인 요청을 보내시겠습니까?")) return;

        try {
            // [PUT] 재승인 요청 (백엔드에서 status -> PENDING, rejectReason -> null 처리 필요)
            await axios.put(`/instructor/lecture/${lectureId}/resubmit`, {
                ...formData,
                orderNo: Number(formData.orderNo),
                duration: Number(formData.duration)
            });
            
            alert("강의 수정 및 재승인 요청 완료!");
            navigate('/instructor/manage');
        } catch (error) {
            console.error("수정 실패", error);
            alert("수정 요청 실패: " + (error.response?.data || "서버 오류"));
        }
    };

    if (loading) return <div>로딩 중...</div>;

    // 순서 선택지 생성 (예: 1강 ~ 30강)
    const orderOptions = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>강의 수정 (재승인 요청)</h2>

            {/* [핵심] 반려 사유 표시 */}
            {formData.approvalStatus === 'REJECTED' && formData.rejectReason && (
                <div style={{ 
                    backgroundColor: '#fff5f5', 
                    border: '1px solid #ffcccc', 
                    color: '#cc0000', 
                    padding: '15px', 
                    borderRadius: '5px', 
                    marginBottom: '20px' 
                }}>
                    <strong>🛑 반려 사유:</strong> {formData.rejectReason}
                </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 강의 순서 (핵심 로직 적용) */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>강의 순서</label>
                    <select 
                        name="orderNo" 
                        value={formData.orderNo} 
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                        {orderOptions.map(num => {
                            const isTaken = usedOrders.includes(num); // 이미 사용 중인지 확인
                            return (
                                <option 
                                    key={num} 
                                    value={num} 
                                    disabled={isTaken} // 사용 중이면 선택 불가
                                    style={isTaken ? { color: '#ccc' } : {}}
                                >
                                    {num}강 {isTaken ? '(이미 존재하는 강의)' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* 강의 제목 */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>강의 제목</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>

                {/* 영상 URL */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>영상 URL</label>
                    <input 
                        type="text" 
                        name="videoUrl" 
                        value={formData.videoUrl} 
                        onChange={handleChange} 
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>

                {/* 영상 길이 */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>영상 길이 (초)</label>
                    <input 
                        type="number" 
                        name="duration" 
                        value={formData.duration} 
                        onChange={handleChange} 
                        required
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>

                {/* 버튼 그룹 */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button 
                        type="button" 
                        onClick={() => navigate('/instructor/manage')}
                        style={{ flex: 1, padding: '15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        취소
                    </button>
                    <button 
                        type="submit" 
                        style={{ flex: 2, padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        수정 완료 (재승인 요청)
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestInstructorLectureEdit;