import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Video,
    Clock,
    Save,
    Send,
    Calendar,
    AlertCircle,
    Loader2,
    Play,
    CheckCircle2
} from "lucide-react";

function LectureUpload({ courseInfo, courseId: courseIdProp, nextOrderNo, onUploaded }) {
    const params = useParams();
    const courseId = courseIdProp || params.courseId;

    const navigate = useNavigate();
    const [durationLoading, setDurationLoading] = useState(false);
    const debounceTimer = useRef(null);
    const [existingLectures, setExistingLectures] = useState([]);
    const MAX_ORDER = 30;

    // 신규 강의 추가용 폼 데이터
    const [formData, setFormData] = useState({
        title: '',
        orderNo: nextOrderNo?.toString() || '',
        videoUrl: '',
        duration: '',
        uploadType: 'IMMEDIATE',
        scheduledAt: '',
    });

    // 컴포넌트 마운트 시 기존 강의 목록 조회
    useEffect(() => {
        if (!courseId) return;
        fetch(`/instructor/course/${courseId}/lectures`, {
            credentials: 'include'
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => setExistingLectures(data))
            .catch(() => setExistingLectures([]));
    }, [courseId]);

    // 유튜브 ID 추출 유틸리티
    const getYoutubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // 초 → "n분 n초" 포맷
    const formatDuration = (totalSeconds) => {
        const sec = Number(totalSeconds);
        if (!sec || sec <= 0) return '';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        if (m > 0 && s > 0) return `${m}분 ${s}초`;
        if (m > 0) return `${m}분`;
        return `${s}초`;
    };

    // 유튜브 재생 시간 자동 조회
    const fetchDuration = async (url) => {
        if (!url) return;
        setDurationLoading(true);
        try {
            const res = await fetch(`/api/youtube/duration?url=${encodeURIComponent(url)}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const seconds = await res.json();
                if (seconds > 0) {
                    setFormData(prev => ({ ...prev, duration: seconds }));
                }
            }
        } catch (err) {
            console.error('재생 시간 자동 조회 실패', err);
        } finally {
            setDurationLoading(false);
        }
    };

    // 영상 URL 변경 핸들러
    const handleVideoUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, videoUrl: url }));

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchDuration(url);
        }, 800);
    };

    // 새로운 강의 추가
    const handleAddLecture = async () => {
        if (!formData.title.trim()) { alert('강의 제목을 입력해주세요.'); return; }
        if (!formData.orderNo) { alert('강의 순서를 선택해주세요.'); return; }
        if (!formData.videoUrl.trim()) { alert('영상 URL을 입력해주세요.'); return; }
        if (formData.uploadType === 'RESERVED' && !formData.scheduledAt) { alert('공개 예정일을 입력해주세요.'); return; }

        const addData = {
            courseId: Number(courseId),
            title: formData.title,
            orderNo: Number(formData.orderNo),
            videoUrl: formData.videoUrl,
            duration: Number(formData.duration),
            uploadType: formData.uploadType,
            scheduledAt: formData.uploadType === 'RESERVED' && formData.scheduledAt ? formData.scheduledAt : null
        };

        try {
            const res = await fetch(`/instructor/lecture/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(addData)
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || '강의 추가 실패');
            }
            alert('강의 정보가 제출되었습니다.');
            if (onUploaded) onUploaded();
        } catch (err) {
            alert(err.message || '강의 추가에 실패했습니다.');
        }
    };

    const handleSaveDraft = async () => {
        if (!formData.title && !formData.videoUrl) {
            alert('최소한 강의 제목 또는 영상 URL을 입력해주세요.');
            return;
        }
        const draftData = {
            courseId: Number(courseId),
            title: formData.title || '',
            orderNo: formData.orderNo ? Number(formData.orderNo) : 0,
            videoUrl: formData.videoUrl || null,
            duration: formData.duration ? Number(formData.duration) : null,
            uploadType: formData.uploadType || 'IMMEDIATE',
            scheduledAt: formData.uploadType === 'RESERVED' ? formData.scheduledAt : null
        };
        try {
            const res = await fetch('/instructor/lecture/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(draftData)
            });
            if (!res.ok) throw new Error('임시 저장 실패');
            alert('임시 저장되었습니다.');
            if (onUploaded) onUploaded();
        } catch (err) {
            alert(err.message || '임시 저장에 실패했습니다.');
        }
    };

    const youtubeId = getYoutubeId(formData.videoUrl);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-bold text-gray-700">강의 제목</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="예: [기초] 변수와 데이터 타입 이해하기"
                                className="h-11 bg-white border-gray-200 focus:ring-purple-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-700">강의 순서</Label>
                                <select
                                    value={formData.orderNo}
                                    onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_0.5rem_center]"
                                >
                                    <option value="" disabled>순서 선택</option>
                                    {Array.from({ length: MAX_ORDER }, (_, i) => i + 1).map(num => {
                                        const existing = existingLectures.find(l => l.orderNo === num);
                                        return (
                                            <option key={num} value={num.toString()} disabled={!!existing}>
                                                {num}강 {existing ? `(등록됨: ${existing.title})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-gray-700">업로드 유형</Label>
                                <select
                                    value={formData.uploadType}
                                    onChange={(e) => setFormData({ ...formData, uploadType: e.target.value })}
                                    className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%221.67%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-no-repeat bg-[right_0.5rem_center]"
                                >
                                    <option value="IMMEDIATE">즉시 공개</option>
                                    <option value="RESERVED">예약 공개</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="videoUrl" className="text-sm font-bold text-gray-700">영상 URL</Label>
                            <div className="relative">
                                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="videoUrl"
                                    value={formData.videoUrl}
                                    onChange={handleVideoUrlChange}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="pl-10 h-11 bg-white border-gray-200 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-sm font-bold text-gray-700 flex justify-between">
                                재생 시간 (초)
                                {formData.duration > 0 && (
                                    <Badge variant="secondary" className="bg-purple-50 text-purple-600 border-0 font-medium">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formatDuration(formData.duration)}
                                    </Badge>
                                )}
                            </Label>
                            <div className="relative">
                                {durationLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin" />}
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="h-11 bg-white border-gray-200 focus:ring-purple-500"
                                    placeholder={durationLoading ? "추출 중..." : "직접 입력도 가능합니다"}
                                />
                            </div>
                        </div>

                        {formData.uploadType === 'RESERVED' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="scheduledAt" className="text-sm font-bold text-gray-700">공개 예정일</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="scheduledAt"
                                        type="datetime-local"
                                        value={formData.scheduledAt}
                                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                        className="pl-10 h-11 bg-white border-gray-200"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    <Label className="text-sm font-bold text-gray-700">미리보기</Label>
                    <Card className="bg-gray-100 border-dashed border-2 border-gray-200 aspect-video flex flex-col items-center justify-center overflow-hidden relative group">
                        {youtubeId ? (
                            <iframe
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title="Video preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="text-center p-8">
                                <Play className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-sm text-gray-400 font-medium">영상 URL을 입력하면<br />여기에 미리보기가 표시됩니다.</p>
                            </div>
                        )}
                        <Badge className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white border-0">
                            {youtubeId ? '미리보기 활성' : '대기 중'}
                        </Badge>
                    </Card>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-amber-900 leading-tight">주의사항</p>
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                                모든 강의는 관리자의 승인을 거쳐 공개됩니다. <br />
                                부적절한 콘텐츠가 포함된 경우 반려될 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
                <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    className="h-12 px-6 font-bold border-gray-200 hover:bg-gray-50 text-gray-600"
                >
                    <Save className="w-4 h-4 mr-2" />
                    임시 저장
                </Button>
                <Button
                    onClick={handleAddLecture}
                    className="h-12 px-8 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                >
                    <Send className="w-4 h-4 mr-2" />
                    승인 요청하기
                </Button>
            </div>
        </div>
    );
}

export default LectureUpload;
