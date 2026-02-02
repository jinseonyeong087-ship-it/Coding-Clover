import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/Label";
import InstructorLecture from "@/pages/instructor/InstructorLecture";

function LectureCreate() {

    const { courseId } = useParams();
    const [instructorStatus, setInstructorStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);  // 수정 모드 여부
    const [formData, setFormData] = useState(null);
    const [isDelete, setDelete] = useState(false);
    const [selectLevel, setSelectLevel] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/instructor/course/${courseId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('인증 필요: 강사로 로그인해주세요.');
                }
                if (res.status === 500) {
                    throw new Error('서버 에러: 해당 강좌가 존재하지 않거나 접근 권한이 없습니다.');
                }
                if (!res.ok) throw new Error(`에러 발생: ${res.status}`);
                return res.json();
            })
            .then((data) => setFormData(data))
            .catch((error) => console.error(error.message));
    }, [courseId]);

    const handleDelete = async () => {
        const deleteData = {
            title: formData.title,
            description: formData.description,
            level: formData.level,
            price: formData.price,
        };
        await fetch(`/instructor/course/${courseId}/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(deleteData)
        })
            .then((res) => {
                if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); }
                else { alert("삭제 성공"); navigate(() => { '/instructor/dashboard' }) }
            })
            .catch((error) => { console.error('강사 상세 데이터 로딩 실패', error); })
    };


    const handleEdit = async () => {
        const editData = {
            title: formData.title,
            description: formData.description,
            level: formData.level,
            price: formData.price,
        };
        await fetch(`/instructor/course/${courseId}/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(editData)
        })
            .then((res) => { if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); } else { alert("수정 성공") } })
            .catch((error) => { console.error('강사 상세 데이터 로딩 실패', error); })
        setIsEditing(false);  // 수정 모드 비활성화
    };

    const levelMapping = [
        { id: 1, level: 1, name: "초급" },
        { id: 2, level: 2, name: "중급" },
        { id: 3, level: 3, name: "고급" }
    ]

    const handleCheckboxChange = (level) => {
        setSelectLevel(level);
        setFormData(prev => ({ ...prev, level: level }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return '승인 대기';
            case 'APPROVED': return '승인 완료';
            case 'REJECTED': return '반려';
            default: return status;
        }
    };

    const getLevelText = (level) => {
        switch (level) {
            case 1: return '초급';
            case 2: return '중급';
            case 3: return '고급';
            default: return level;
        }
    };

    // 재심사 요청 (반려된 강좌 수정 후 재제출)
    const handleResubmit = async () => {
        const resubmitData = {
            title: formData.title,
            description: formData.description,
            level: formData.level,
            price: formData.price,
        };
        await fetch(`/instructor/course/${courseId}/resubmit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(resubmitData)
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                alert("재심사 요청이 완료되었습니다.");
                // 상태 업데이트 (PENDING으로 변경)
                setFormData(prev => ({ ...prev, proposalStatus: 'PENDING', proposalRejectReason: null }));
            })
            .catch((error) => {
                console.error('재심사 요청 실패', error);
                alert("재심사 요청에 실패했습니다.");
            });
    };

    if (!formData) {
        return <div className="p-6">로딩 중...</div>;
    }

    return (
        <>
            <section className="container mx-auto px-16 py-24">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{formData.title}</h1>
                    <div>
                        {formData.proposalStatus === 'APPROVED' ? (
                            <Button variant="outline" onClick={() => navigate('/instructor/dashboard')}>목록으로</Button>
                        ) : isEditing ? (
                            <>
                                <Button size="sm" onClick={handleEdit}>저장</Button>
                                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
                            </>
                        ) : (
                            <>
                                <Button size="sm" variant="destructive" onClick={handleDelete}>삭제</Button>
                                <Button size="sm" onClick={() => { setIsEditing(true); setSelectLevel(formData.level); }}>수정하기</Button>
                                {formData.proposalStatus === 'REJECTED' && (
                                    <Button size="sm" variant="default" onClick={handleResubmit}>재심사 요청</Button>
                                )}
                                <Button variant="outline" onClick={() => navigate('/instructor/dashboard')}>목록으로</Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {isEditing ? (
                        <>
                            <div>
                                <span className="font-semibold">난이도: </span>
                                {levelMapping.map((grade) => {
                                    return (
                                        <div className="flex justify-between items-center" key={grade.id}>
                                            <>
                                                <Checkbox checked={selectLevel === grade.level} name={grade.id} onCheckedChange={() => handleCheckboxChange(grade.level)} />
                                                <Label>{grade.name}</Label>
                                            </>
                                        </div>
                                    )
                                })}
                            </div>
                            <div>
                                <span className="font-semibold">가격: </span>
                                {formData.price?.toLocaleString()}원
                                <Input name="price" type="text" onChange={handleChange} value={formData.price} className="col-span-3" method="post" />
                            </div>
                            <div>
                                <span className="font-semibold">설명: </span>
                                <Input name="description" type="text" onChange={handleChange} value={formData.description} className="col-span-3" method="post" />
                            </div></>) : (
                        <>
                            <div>
                                <span className="font-semibold">난이도: </span>
                                {getLevelText(formData.level)}

                            </div>
                            <div>
                                <span className="font-semibold">가격: </span>
                                {formData.price?.toLocaleString()}원
                            </div>
                            <div>
                                <span className="font-semibold">설명: </span>
                                <p className="mt-2 bg-slate-50 p-4 rounded-md border">{formData.description}</p>
                            </div></>
                    )}
                    < div >
                        <span className="font-semibold">상태: </span>
                        {getStatusText(formData.proposalStatus)}
                    </div>
                </div>


            </section >

            <section className="container mx-auto px-16 py-24">
                {formData.proposalStatus === 'APPROVED' ? (
                    <>
                        <p className="text-green-600 font-medium mb-4">
                            강좌 선택 후 강의를 추가해주세요.<br></br>
                            관리자 승인 후 강의를 오픈합니다.
                        </p>
                        <InstructorLecture />
                    </>
                ) : formData.proposalStatus === 'PENDING' ? (
                    <p className="text-yellow-600">
                        강좌 개설이 승인되면 강의를 업로드할 수 있습니다.<br></br>
                        승인 이후에는 <strong>강좌명을 수정할 수 없습니다.</strong>
                    </p>
                ) : (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                        <h3 className="text-red-800 font-bold mb-2">반려 사유 안내</h3>
                        <p className="text-red-700 whitespace-pre-wrap">
                            {formData.proposalRejectReason}
                        </p>
                    </div>
                )}
            </section>


        </>
    )
}

export default LectureCreate;