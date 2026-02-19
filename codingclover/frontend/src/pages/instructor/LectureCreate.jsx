import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Pencil, X, Check, BarChart2, DollarSign, AlignLeft, Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import LectureUpload from "@/components/LectureUpload";

function LectureCreate() {

    const { courseId } = useParams();
    const [instructorStatus, setInstructorStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isDelete, setDelete] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
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
        setIsEditing(false);
    };

    const levelMapping = [
        { id: 1, level: 1, name: "초급" },
        { id: 2, level: 2, name: "중급" },
        { id: 3, level: 3, name: "고급" }
    ];

    const handleCheckboxChange = (level) => {
        setSelectLevel(level);
        setFormData(prev => ({ ...prev, level: level }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold">승인 완료</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 border-0 font-bold">승인 대기</Badge>;
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-700 border-0 font-bold">반려됨</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-600 border-0 font-bold">{status}</Badge>;
        }
    };

    const getLevelBadge = (level) => {
        switch (level) {
            case 1: return <Badge className="bg-sky-100 text-sky-700 border-0 font-bold">초급</Badge>;
            case 2: return <Badge className="bg-violet-100 text-violet-700 border-0 font-bold">중급</Badge>;
            case 3: return <Badge className="bg-rose-100 text-rose-700 border-0 font-bold">고급</Badge>;
            default: return <Badge className="bg-gray-100 text-gray-600 border-0">{level}</Badge>;
        }
    };

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
                setFormData(prev => ({ ...prev, proposalStatus: 'PENDING', proposalRejectReason: null }));
            })
            .catch((error) => {
                console.error('재심사 요청 실패', error);
                alert("재심사 요청에 실패했습니다.");
            });
    };

    if (!formData) {
        return (
            <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">강좌 정보</p>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{formData.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                                className="h-9 px-4 text-gray-500 hover:text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50"
                            >
                                <X className="w-3.5 h-3.5 mr-1.5" />
                                취소
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleEdit}
                                className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
                            >
                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                저장
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/instructor/dashboard')}
                                className="h-9 px-4 rounded-xl border-gray-200 text-gray-600 font-bold"
                            >
                                목록으로
                            </Button>
                            {formData.proposalStatus !== 'APPROVED' && (
                                <Button
                                    size="sm"
                                    onClick={() => { setIsEditing(true); setSelectLevel(formData.level); }}
                                    className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-gray-700 text-white font-bold"
                                >
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                    수정
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Info Card */}
            <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">

                    {/* 난이도 */}
                    <div className="flex items-start gap-4 px-6 py-5">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                            <BarChart2 className="w-4 h-4 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">난이도</p>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    {levelMapping.map((grade) => (
                                        <button
                                            key={grade.id}
                                            type="button"
                                            onClick={() => handleCheckboxChange(grade.level)}
                                            className={`px-4 py-1.5 rounded-xl text-sm font-bold border transition-all
                                                ${selectLevel === grade.level
                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary/40 hover:text-primary'
                                                }`}
                                        >
                                            {grade.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                getLevelBadge(formData.level)
                            )}
                        </div>
                    </div>

                    <Separator className="bg-gray-50" />

                    {/* 가격 */}
                    <div className="flex items-start gap-4 px-6 py-5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">가격</p>
                            {isEditing ? (
                                <Input
                                    name="price"
                                    type="text"
                                    onChange={handleChange}
                                    value={formData.price}
                                    className="h-9 max-w-[200px] rounded-xl border-gray-200 text-sm font-bold"
                                />
                            ) : (
                                <span className="text-base font-bold text-gray-900">
                                    {formData.price?.toLocaleString()}
                                    <span className="text-sm font-medium text-gray-400 ml-1">P</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-gray-50" />

                    {/* 설명 */}
                    <div className="flex items-start gap-4 px-6 py-5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                            <AlignLeft className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">설명</p>
                            {isEditing ? (
                                <Input
                                    name="description"
                                    type="text"
                                    onChange={handleChange}
                                    value={formData.description}
                                    className="h-9 rounded-xl border-gray-200 text-sm"
                                />
                            ) : (
                                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                    {formData.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-gray-50" />

                    {/* 상태 */}
                    <div className="flex items-center gap-4 px-6 py-5">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                            <Activity className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">승인 상태</p>
                            {getStatusBadge(formData.proposalStatus)}
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Bottom Section */}
            <div>
                {formData.proposalStatus === 'APPROVED' ? (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                                강좌가 승인되었습니다. 강의를 추가하고 학습자들에게 오픈하세요.<br />
                                관리자 승인 후 강의가 공개됩니다.
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsAdding(!isAdding)}
                            className={`h-10 px-6 rounded-xl font-bold transition-all ${isAdding ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-primary hover:bg-primary/90 text-white'}`}
                        >
                            {isAdding ? '취소' : '+ 강의 추가'}
                        </Button>
                        {isAdding && <LectureUpload />}
                    </div>
                ) : formData.proposalStatus === 'PENDING' ? (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-700 font-medium leading-relaxed">
                            강좌 개설 심사 중입니다. 승인 후 강의를 업로드할 수 있습니다.<br />
                            승인 이후에는 <strong>강좌명을 수정할 수 없습니다.</strong>
                        </p>
                    </div>
                ) : (
                    <div className="p-5 bg-red-50 rounded-2xl border border-red-100 space-y-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <h3 className="text-sm font-bold text-red-700">반려 사유</h3>
                        </div>
                        <p className="text-sm text-red-600 whitespace-pre-wrap leading-relaxed pl-6">
                            {formData.proposalRejectReason}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LectureCreate;
