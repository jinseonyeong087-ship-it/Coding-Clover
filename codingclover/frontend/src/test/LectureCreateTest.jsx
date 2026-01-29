import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LectureCreateTest = () => {
    // 강사가 개설한 강좌 목록을 저장할 상태
    const [myCourses, setMyCourses] = useState([]);
    // 입력 폼 데이터 상태
    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        orderNo: '',
        videoUrl: '',
        duration: '',
        uploadType: 'IMMEDIATE', // 기본값: 즉시 공개
        scheduledAt: ''
    });

    // 1. 페이지 로딩 시 강사가 개설한 강좌 목록을 백엔드에서 가져옴
    useEffect(() => {
        const fetchMyCourses = async () => {
            try {
                // CourseController의 @GetMapping("/instructor/course/my-list") 호출
                const response = await axios.get('/instructor/course/my-list', {
    withCredentials: true // 여기에 직접 명시
});
                setMyCourses(response.data);
            } catch (error) {
                console.error("강좌 목록을 불러오는데 실패했습니다.", error);
                if (error.response?.status === 401) {
                    alert("로그인이 필요하거나 권한이 없습니다. 강사 계정으로 로그인해주세요.");
                }
            }
        };
        fetchMyCourses();
    }, []);

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. 강의 업로드 요청 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.courseId) {
            alert("강의를 추가할 강좌를 선택해주세요.");
            return;
        }

        // 백엔드 DTO(LectureCreateRequest) 형식에 맞춰 데이터 정제
        const submitData = {
            courseId: Number(formData.courseId),
            title: formData.title,
            orderNo: Number(formData.orderNo),
            videoUrl: formData.videoUrl,
            duration: Number(formData.duration),
            uploadType: formData.uploadType, // "IMMEDIATE" 또는 "RESERVED"
            scheduledAt: formData.uploadType === 'RESERVED' ? formData.scheduledAt : null
        };

        try {
            // LectureController의 @PostMapping("/instructor/lecture/upload") 호출
            const response = await axios.post('/instructor/lecture/upload', submitData);
            alert("강의 업로드 요청 성공! 관리자 승인 완료 후 수강생에게 공개됩니다.");
            console.log("서버 응답:", response.data);
            
            // 성공 시 폼 초기화 (선택창 제외)
            setFormData(prev => ({
                ...prev,
                title: '',
                orderNo: '',
                videoUrl: '',
                duration: '',
                scheduledAt: ''
            }));
        } catch (error) {
            console.error("업로드 실패:", error);
            const errorMsg = error.response?.data || "서버 내부 오류가 발생했습니다. (500)";
            alert(`업로드 실패: ${errorMsg}`);
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '600px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>신규 강의 업로드</h2>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
                강좌를 선택하고 강의 정보를 입력하세요. <br/>
                모든 강의는 <strong>관리자 승인 후</strong> 게시됩니다.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* [핵심] 강좌 선택 드롭다운 */}
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>강좌 선택</label>
                    <select 
                        name="courseId" 
                        value={formData.courseId} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option value="">-- 강의를 올릴 강좌를 선택하세요 --</option>
                        {myCourses.map(course => (
                            <option key={course.courseId} value={course.courseId}>
                                {course.title} (ID: {course.courseId})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>강의 제목</label>
                    <input name="title" type="text" value={formData.title} placeholder="예: 1강. 환경 설정하기" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>강의 순서</label>
                        <input name="orderNo" type="number" value={formData.orderNo} placeholder="예: 1" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>영상 길이(초)</label>
                        <input name="duration" type="number" value={formData.duration} placeholder="예: 600" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                    </div>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>영상 URL</label>
                    <input name="videoUrl" type="text" value={formData.videoUrl} placeholder="YouTube 등 영상 링크" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <div style={{ padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '5px' }}>
                    <label style={{ fontWeight: 'bold' }}>공개 설정</label>
                    <select name="uploadType" value={formData.uploadType} onChange={handleChange} style={{ marginLeft: '10px', padding: '5px' }}>
                        <option value="IMMEDIATE">승인 시 즉시 공개</option>
                        <option value="RESERVED">승인 후 예약 공개</option>
                    </select>

                    {formData.uploadType === 'RESERVED' && (
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ fontSize: '0.9em', display: 'block', marginBottom: '5px' }}>공개 예정 일시</label>
                            <input name="scheduledAt" type="datetime-local" value={formData.scheduledAt} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    style={{ 
                        marginTop: '10px', 
                        padding: '15px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer' 
                    }}
                >
                    강의 업로드 승인 요청
                </button>
            </form>
        </div>
    );
};

export default LectureCreateTest;