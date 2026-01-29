import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LectureBatchTest = () => {
    const [pendingLectures, setPendingLectures] = useState([]); // 대기 중인 강의 목록
    const [selectedIds, setSelectedIds] = useState([]);        // 체크된 강의 ID들
    const [rejectReason, setRejectReason] = useState('');      // 반려 사유

    // 1. 승인 대기 중인 강의 목록 가져오기
    const fetchPendingLectures = async () => {
        try {
            const response = await axios.get('/admin/lectures/pending');
            setPendingLectures(response.data);
        } catch (error) {
            console.error("목록 로딩 실패:", error);
            alert("강의 목록을 가져오는데 실패했습니다.");
        }
    };

    useEffect(() => {
        fetchPendingLectures();
    }, []);

    // 2. 체크박스 선택/해제 로직
    const handleCheck = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 3. 일괄 승인 요청
    const handleBatchApprove = async () => {
        if (selectedIds.length === 0) return alert("승인할 강의를 선택하세요.");
        
        try {
            const response = await axios.post('/admin/lectures/batch-approve', {
                lectureIds: selectedIds
            });
            alert(response.data);
            setSelectedIds([]); // 선택 초기화
            fetchPendingLectures(); // 목록 갱신
        } catch (error) {
            alert("승인 처리 중 오류 발생");
        }
    };

    // 4. 일괄 반려 요청
    const handleBatchReject = async () => {
        if (selectedIds.length === 0) return alert("반려할 강의를 선택하세요.");
        const reason = prompt("반려 사유를 입력하세요:"); // 간단한 입력창
        
        if (!reason) return alert("사유를 입력해야 반려가 가능합니다.");

        try {
            const response = await axios.post('/admin/lectures/batch-reject', {
                lectureIds: selectedIds,
                rejectReason: reason
            });
            alert(response.data);
            setSelectedIds([]);
            fetchPendingLectures();
        } catch (error) {
            alert("반려 처리 중 오류 발생");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>관리자 강의 승인 테스트</h2>
            
            <div style={{ marginBottom: '10px' }}>
                <button onClick={handleBatchApprove} style={{ marginRight: '10px', backgroundColor: '#4CAF50', color: 'white' }}>선택 일괄 승인</button>
                <button onClick={handleBatchReject} style={{ backgroundColor: '#f44336', color: 'white' }}>선택 일괄 반려</button>
            </div>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>선택</th>
                        <th>강의 ID</th>
                        <th>제목</th>
                        <th>강사</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingLectures.length > 0 ? (
                        pendingLectures.map(lecture => (
                            <tr key={lecture.lectureId}>
                                <td style={{ textAlign: 'center' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.includes(lecture.lectureId)}
                                        onChange={() => handleCheck(lecture.lectureId)}
                                    />
                                </td>
                                <td>{lecture.lectureId}</td>
                                <td>{lecture.title}</td>
                                <td>{lecture.instructorName}</td>
                                <td>{lecture.approvalStatus}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>대기 중인 강의가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LectureBatchTest;