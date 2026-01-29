import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TestInstructorCourseEdit = () => {
    const { courseId } = useParams(); // URL에서 courseId 가져오기
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [rejectReason, setRejectReason] = useState(null); // 반려 사유 상태
    const [status, setStatus] = useState(''); // 현재 승인 상태

    // 수정할 강좌 데이터 상태
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        level: 1, // 1: 초급, 2: 중급, 3: 고급
        price: 0,
        thumbnailUrl: ''
    });

    // 1. 기존 강좌 정보 불러오기
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // 강좌 상세 조회 API 호출 (기존에 만들어둔 조회 API 활용)
                // 주의: 본인의 강좌인지 체크하는 로직이 백엔드에 있어야 함
                const response = await axios.get(`/instructor/course/${courseId}`);
                navigate('/test/manage');
                const data = response.data;

                // 폼 데이터 초기화
                setFormData({
                    title: data.title,
                    description: data.description,
                    level: data.level,
                    price: data.price,
                    thumbnailUrl: data.thumbnailUrl
                });

                // 반려 사유 및 상태 저장
                setRejectReason(data.proposalRejectReason);
                setStatus(data.proposalStatus);
                setLoading(false);

            } catch (error) {
                console.error("강좌 정보 로딩 실패", error);
                alert("강좌 정보를 불러오지 못했습니다.");
                navigate('/instructor/manage'); // 실패 시 목록으로 이동
            }
        };

        fetchCourse();
    }, [courseId, navigate]);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. 수정 및 재승인 요청 핸들러
    const handleUpdate = async (e) => {
        e.preventDefault();

        // 유효성 검사 (간단 예시)
        if (!formData.title || !formData.description) {
            alert("제목과 설명은 필수입니다.");
            return;
        }

        if (!window.confirm("수정된 내용으로 다시 승인 요청을 보내시겠습니까?")) return;

        try {
            // [PUT] 기존 강좌 ID로 업데이트 요청
            // 백엔드에서는 이 요청을 받으면 내용을 수정하고 status를 PENDING으로 변경해야 함
            await axios.put(`/instructor/course/${courseId}/resubmit`, formData);
            
            alert("수정이 완료되었습니다. 관리자에게 승인 요청이 전송되었습니다.");
            navigate('/instructor/manage'); // 통합 관리 페이지로 이동

        } catch (error) {
            console.error("수정 실패", error);
            const msg = error.response?.data || "서버 오류";
            alert(`수정 실패: ${msg}`);
        }
    };

    if (loading) return <div>로딩 중...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>강좌 수정 및 재승인 요청</h2>
            
            {/* [핵심] 반려 사유 표시 영역 */}
            {status === 'REJECTED' && rejectReason && (
                <div style={{ 
                    backgroundColor: '#fff5f5', 
                    border: '1px solid #ffcccc', 
                    color: '#cc0000', 
                    padding: '15px', 
                    borderRadius: '5px', 
                    marginBottom: '20px',
                    fontWeight: 'bold'
                }}>
                    🛑 반려 사유: {rejectReason}
                    <div style={{ fontSize: '0.9em', marginTop: '5px', color: '#555', fontWeight: 'normal' }}>
                        * 아래 내용을 수정하여 다시 제출하면 관리자가 재검토합니다.
                    </div>
                </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 제목 */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>강좌 제목</label>
                    <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>

                {/* 설명 */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>강좌 설명</label>
                    <textarea 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows="5"
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* 난이도 */}
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>난이도</label>
                        <select 
                            name="level" 
                            value={formData.level} 
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="1">초급</option>
                            <option value="2">중급</option>
                            <option value="3">고급</option>
                        </select>
                    </div>

                    {/* 수강료 */}
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>수강료 (원)</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={formData.price} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                </div>

                {/* 썸네일 URL */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>썸네일 이미지 URL</label>
                    <input 
                        type="text" 
                        name="thumbnailUrl" 
                        value={formData.thumbnailUrl} 
                        onChange={handleChange} 
                        placeholder="https://example.com/image.jpg"
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>

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
                        style={{ flex: 2, padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1em' }}
                    >
                        수정 완료 및 재승인 요청
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TestInstructorCourseEdit;