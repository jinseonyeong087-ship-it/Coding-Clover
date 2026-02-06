import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Play, Clock, Video, MonitorPlay, Users } from "lucide-react";
import Nav from "@/components/Nav";
import Tail from "@/components/Tail";

function StudentLectureDetail() {

    const { courseId } = useParams();
    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);

    useEffect(() => {
        fetch(`/student/lecture/${courseId}/lectures`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Lecture Detail Data:", data);
                setLectures(data);
                if (data.length > 0) {
                    setSelectedLecture(data[0]);
                }
            })
            .catch((error) => {
                console.error("Error fetching lecture detail:", error);
            });
    }, [courseId]);

    // YouTube URL → embed URL 변환
    const toEmbedUrl = (url) => {
        if (!url) return "";
        if (url.includes("/embed/")) return url;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/))([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    // 재생 시간 포맷
    const formatDuration = (seconds) => {
        if (!seconds) return "";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}분 ${sec}초`;
    };

    return (
        <>
            <Nav />
            <div className="flex flex-1 h-full">
                {/* 왼쪽: 강의 목록 */}
                <div className="w-80 border-r border-slate-200 overflow-y-auto bg-white">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-bold text-lg text-slate-800">강의 목록</h2>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-slate-500">{lectures.length}개의 강의</p>
                            <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                <Users className="w-3 h-3" />
                                24명 수강중
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {lectures.map((lec) => (
                            <button
                                key={lec.lectureId}
                                onClick={() => setSelectedLecture(lec)}
                                className={`flex items-center gap-3 p-4 text-left transition-colors border-b border-slate-50 ${
                                    selectedLecture?.lectureId === lec.lectureId
                                        ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                                        : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                }`}
                            >
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    selectedLecture?.lectureId === lec.lectureId
                                        ? "bg-indigo-500 text-white"
                                        : "bg-slate-100 text-slate-600"
                                }`}>
                                    {lec.orderNo}
                                </span>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                        selectedLecture?.lectureId === lec.lectureId
                                            ? "text-indigo-700"
                                            : "text-slate-700"
                                    }`}>
                                        {lec.title}
                                    </p>
                                    {lec.duration && (
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {formatDuration(lec.duration)}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                        {lectures.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                등록된 강의가 없습니다.
                            </div>
                        )}
                    </div>
                </div>

                {/* 오른쪽: 강의 상세 */}
                <div className="flex-1 overflow-y-auto">
                    {selectedLecture ? (
                        <div className="flex flex-col gap-6 p-6 md:p-8">
                            <div className="border-b border-indigo-100/50 pb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Play className="w-3 h-3 fill-current" />
                                        {selectedLecture.orderNo}강
                                    </span>
                                </div>
                                <h3 className="font-bold text-2xl md:text-3xl text-slate-800 leading-tight">
                                    {selectedLecture.title}
                                </h3>
                                {selectedLecture.duration && (
                                    <div className="flex items-center gap-2 mt-4 text-slate-500 text-sm font-medium">
                                        <Clock className="w-4 h-4 text-indigo-400" />
                                        <span>재생 시간: <span className="text-slate-700">{formatDuration(selectedLecture.duration)}</span></span>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-indigo-200 ring-4 ring-white">
                                {selectedLecture.videoUrl ? (
                                    <div className="relative pt-[56.25%] bg-black">
                                        <iframe
                                            key={selectedLecture.lectureId}
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={toEmbedUrl(selectedLecture.videoUrl)}
                                            title="강의 영상"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-slate-100/50 flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                                            <Video className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="font-medium">영상이 준비 중입니다</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                    <MonitorPlay className="w-5 h-5" />
                                    학습 포인트
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    이 강의를 통해 학습할 수 있는 주요 내용입니다. 집중해서 수강해주세요.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-32 text-center">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                                <Play className="w-10 h-10 text-indigo-300 ml-1" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">강의를 선택해주세요</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                왼쪽 목록에서 수강하고 싶은 강의를 클릭하면 상세 내용과 영상을 확인할 수 있습니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <Tail />
        </>
    );
}

export default StudentLectureDetail;
