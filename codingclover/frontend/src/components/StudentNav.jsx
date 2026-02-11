import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/Menubar"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Search } from "lucide-react"
import Logout from "@/components/Logout"
import axios from 'axios';
import coinImg from '../img/coin.png';
import NotificationDropdown from './NotificationDropdown';

function StudentNav() {
    const [loginId, setLoginId] = useState(false);
    const [users, setUsers] = useState({ name: '' });
    const [keyword, setKeyword] = useState("");
    const [points, setPoints] = useState(0);
    const [isLoadingPoints, setIsLoadingPoints] = useState(false);
    const navigate = useNavigate();

    // 백엔드에서 실제 포인트 잔액 가져오기
    const fetchUserPoints = async () => {
        try {
            setIsLoadingPoints(true);
            const response = await axios.get('/api/wallet/balance', {
                withCredentials: true
            });
            console.log('DB에서 가져온 포인트:', response.data.balance);
            setPoints(response.data.balance || 0);

            // DB에서 성공적으로 가져왔으면 localStorage도 동기화
            localStorage.setItem('userPoints', (response.data.balance || 0).toString());

        } catch (error) {
            console.error('포인트 조회 실패:', error);
            console.log('백엔드 연결 실패로 0P 표시');
            // 백엔드 연결 실패 시 0P 표시
            setPoints(0);
            localStorage.removeItem('userPoints');  // 부정확한 데이터 제거
        } finally {
            setIsLoadingPoints(false);
        }
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            const storedLoginId = localStorage.getItem("loginId");
            const storedUsers = localStorage.getItem("users");

            if (storedLoginId === "true" && storedUsers) {
                setLoginId(true);
                const parsedUsers = JSON.parse(storedUsers);
                setUsers(parsedUsers);
                console.log("현재 로그인한 사용자:", parsedUsers);

                // 로그인 상태면 실제 포인트 조회 (초기값 0P에서 시작)
                setPoints(0);
                await fetchUserPoints();
            }

            // 소셜 로그인 리다이렉트 처리 (세션 확인)
            if (!storedLoginId || !storedUsers) {
                try {
                    const res = await fetch('/auth/status', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include' // 세션 쿠키 포함 필수
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.loggedIn) {
                            localStorage.setItem("loginId", "true");
                            localStorage.setItem("users", JSON.stringify(data.user));
                            if (!localStorage.getItem("userPoints")) {
                                localStorage.setItem("userPoints", "0");
                            }

                            setLoginId(true);
                            setUsers(data.user);
                            setPoints(parseInt(localStorage.getItem("userPoints") || "0"));
                            console.log("소셜 로그인 감지 및 정보 갱신:", data.user);

                            // 상태 갱신을 위해 새로고침 (선택 사항, 필요시 주석 해제)
                            // window.location.reload(); 
                        }
                    }
                } catch (e) {
                    console.error("Login status check failed:", e);
                }
            }
        };

        checkLoginStatus();

        // 결제 완료 후 포인트 업데이트를 위한 이벤트 리스너
        const handlePointsUpdate = async () => {
            // DB에서 최신 포인트 다시 조회
            await fetchUserPoints();
        };

        // 사용자 정보 업데이트를 위한 이벤트 리스너
        const handleUserInfoUpdate = () => {
            const storedUsers = localStorage.getItem("users");
            if (storedUsers) {
                try {
                    const parsedUsers = JSON.parse(storedUsers);
                    setUsers(parsedUsers);
                    console.log("사용자 정보 업데이트:", parsedUsers);
                } catch (error) {
                    console.error("사용자 정보 업데이트 실패:", error);
                }
            }
        };

        window.addEventListener('pointsUpdated', handlePointsUpdate);
        window.addEventListener('userInfoUpdated', handleUserInfoUpdate);

        return () => {
            window.removeEventListener('pointsUpdated', handlePointsUpdate);
            window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
        };
    }, []);

    // 저장할 때: JSON.stringify()로 객체 → 문자열 변환
    // 불러올 때: JSON.parse()로 문자열 → 객체 변환
    // container mx-auto px-4 py-16

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md shadow-sm transition-all">
            {/* 로고 + 메뉴바 */}
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity no-underline">
                        Coding-Clover
                    </Link>

                    <Menubar className="border-none shadow-none bg-transparent">
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer"
                             onClick={() => { navigate('/course/level/0') }}>전체 강좌</MenubarTrigger>
                            <MenubarContent>
                                <MenubarGroup>
                                    <MenubarItem onClick={() => { navigate('/course/level/1') }}>초급</MenubarItem>
                                    <MenubarItem onClick={() => { navigate('/course/level/2') }}>중급</MenubarItem>
                                    <MenubarItem onClick={() => { navigate('/course/level/3') }}>고급</MenubarItem>
                                </MenubarGroup>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/coding-test') }}>코딩테스트</MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer">커뮤니티</MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem onClick={() => { navigate('/student/qna') }}>Q&A</MenubarItem>
                                <MenubarItem onClick={() => { navigate('/student/community') }}>자유게시판</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/notice') }}>공지사항</MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <MenubarTrigger className="cursor-pointer" onClick={() => { navigate('/payment') }}>포인트충전</MenubarTrigger>
                        </MenubarMenu>
                        <MenubarMenu>
                            <Link
                                to="/student/mypage"
                                className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                마이페이지
                            </Link>
                        </MenubarMenu>
                    </Menubar>
                </div>

                {/* 검색 & 로그인 */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="강좌 검색..."
                            className="pl-9 w-64 bg-secondary/50 border-transparent focus:bg-background transition-all"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && keyword.trim()) {
                                    navigate(`/test/search?category=COURSE&keyword=${encodeURIComponent(keyword)}`);
                                }
                            }} />
                    </div>
                    {!loginId ? (
                        <Button size="sm" variant="default" className="font-semibold"><Link to="/auth/login">로그인</Link></Button>)
                        : (<>
                            <NotificationDropdown />
                            <div className="flex items-center gap-3 pl-2 border-l border-border/50">
                                {/* 포인트 표시 */}
                                <div
                                    className="flex items-center cursor-pointer gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
                                    onClick={() => navigate('/student/points')}
                                >
                                    <img
                                        src={coinImg}
                                        alt="코인"
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-semibold text-primary">
                                        {isLoadingPoints ? '...' : `${points.toLocaleString()}P`}
                                    </span>
                                </div>

                                {/* 사용자 이름 */}
                                <span className="text-sm font-medium text-foreground">{users.name}님</span>
                            </div>
                            <Logout />
                        </>)}
                </div>
            </div>
        </nav>
    );
}

export default StudentNav;
