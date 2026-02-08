import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Play, Clock, Video, MonitorPlay, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import Tail from "@/components/Tail";

function StudentLectureDetail() {

    const { courseId } = useParams();
    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [progressMap, setProgressMap] = useState({}); // { lectureId: { completedYn, progressRate } }
    const [completingId, setCompletingId] = useState(null); // 완료 처리 중인 강의 ID
    const [videoEnded, setVideoEnded] = useState(false); // 영상 종료 감지
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);

    // 강의 목록 조회
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
                setLectures(data);
                if (data.length > 0) {
                    setSelectedLecture(data[0]);
                }
            })
            .catch((error) => {
                console.error("Error fetching lecture detail:", error);
            });
    }, [courseId]);

    // 진도 데이터 조회
    useEffect(() => {
        if (!courseId) return;
        fetch(`/api/student/course/${courseId}/progress`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const map = {};
                data.forEach(p => {
                    map[p.lectureId] = { completedYn: p.completedYn, lastWatchedAt: p.lastWatchedAt };
                });
                setProgressMap(map);
            })
            .catch(() => {});
    }, [courseId]);

    // 강의 선택 시 시청 기록 업데이트
    const handleSelectLecture = (lec) => {
        setSelectedLecture(lec);
        fetch(`/api/student/lecture/${lec.lectureId}/watch`, {
            method: 'POST',
            credentials: 'include'
        }).catch(() => {});
    };

    // 강의 완료 처리
    const handleComplete = async (lectureId) => {
        setCompletingId(lectureId);
        try {
            const res = await fetch(`/api/student/lecture/${lectureId}/complete`, {
                method: 'POST',
                credentials: 'include'
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (err) {
            console.error('완료 처리 실패', err);
        } finally {
            setCompletingId(null);
        }
    };

    // YouTube URL에서 videoId 추출
    const extractVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|v\/|embed\/))([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };

    // YouTube IFrame API 로드 (최초 1회)
    useEffect(() => {
        if (window.YT) return;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }, []);

    // 선택된 강의 변경 시 플레이어 생성/교체
    useEffect(() => {
        if (!selectedLecture?.videoUrl) return;
        const videoId = extractVideoId(selectedLecture.videoUrl);
        if (!videoId) return;

        // 새 강의 선택 시 종료 상태 초기화
        setVideoEnded(false);

        const createPlayer = () => {
            // 기존 플레이어 제거
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }

            playerRef.current = new window.YT.Player(playerContainerRef.current, {
                videoId,
                width: '100%',
                height: '100%',
                playerVars: {
                    rel: 0,
                    modestbranding: 1,
                },
                events: {
                    onStateChange: (event) => {
                        // YT.PlayerState.ENDED === 0
                        if (event.data === 0) {
                            setVideoEnded(true);
                        }
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            window.onYouTubeIframeAPIReady = createPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [selectedLecture?.lectureId]);

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
                            <span className="text-xs text-indigo-600 font-semibold">
                                {Object.values(progressMap).filter(p => p.completedYn).length}/{lectures.length} 완료
                            </span>
                        </div>
                        {/* 전체 진도율 바 */}
                        <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{
                                    width: lectures.length > 0
                                        ? `${Math.round((Object.values(progressMap).filter(p => p.completedYn).length / lectures.length) * 100)}%`
                                        : '0%'
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {lectures.map((lec) => {
                            const isCompleted = progressMap[lec.lectureId]?.completedYn;
                            return (
                                <button
                                    key={lec.lectureId}
                                    onClick={() => handleSelectLecture(lec)}
                                    className={`flex items-center gap-3 p-4 text-left transition-colors border-b border-slate-50 ${
                                        selectedLecture?.lectureId === lec.lectureId
                                            ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                                            : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                    }`}
                                >
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isCompleted
                                            ? "bg-emerald-500 text-white"
                                            : selectedLecture?.lectureId === lec.lectureId
                                                ? "bg-indigo-500 text-white"
                                                : "bg-slate-100 text-slate-600"
                                    }`}>
                                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : lec.orderNo}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium truncate ${
                                            selectedLecture?.lectureId === lec.lectureId
                                                ? "text-indigo-700"
                                                : isCompleted ? "text-slate-500" : "text-slate-700"
                                        }`}>
                                            {lec.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {lec.duration && (
                                                <span className="text-xs text-slate-400">
                                                    {formatDuration(lec.duration)}
                                                </span>
                                            )}
                                            {isCompleted && (
                                                <span className="text-xs text-emerald-500 font-semibold">완료</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
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
                                {selectedLecture.videoUrl && extractVideoId(selectedLecture.videoUrl) ? (
                                    <div className="relative pt-[56.25%] bg-black">
                                        <div
                                            key={selectedLecture.lectureId}
                                            ref={playerContainerRef}
                                            className="absolute top-0 left-0 w-full h-full"
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

                            {/* 수강 완료 버튼 */}
                            <div className="mt-4 flex items-center gap-4">
                                {progressMap[selectedLecture.lectureId]?.completedYn ? (
                                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-semibold">
                                        <CheckCircle className="w-5 h-5" />
                                        수강 완료
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => handleComplete(selectedLecture.lectureId)}
                                        disabled={!videoEnded || completingId === selectedLecture.lectureId}
                                        className={`font-bold px-6 py-3 rounded-xl shadow-lg ${
                                            videoEnded
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {completingId === selectedLecture.lectureId ? '처리 중...' : '수강 완료'}
                                    </Button>
                                )}
                                <span className={`text-sm ${
                                    progressMap[selectedLecture.lectureId]?.completedYn
                                        ? 'text-emerald-500 font-semibold'
                                        : videoEnded ? 'text-indigo-500 font-semibold' : 'text-slate-400'
                                }`}>
                                    {progressMap[selectedLecture.lectureId]?.completedYn
                                        ? '시청을 완료했습니다.'
                                        : videoEnded
                                            ? '영상 시청이 완료되었습니다. 수강 완료 버튼을 눌러주세요!'
                                            : '영상을 끝까지 시청하면 완료 버튼이 활성화됩니다'}
                                </span>
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
