function InstructorNav() {
    return (
        <nav className="container mx-auto flex items-center justify-between py-3 border-b bg-background">
            <div className="flex items-center gap-6">
                <h2>Coding-Clover</h2>
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>레벨별 강좌</MenubarTrigger>
                        <MenubarContent>
                            <MenubarGroup>
                                <MenubarItem>초급</MenubarItem>
                                <MenubarItem>중급</MenubarItem>
                                <MenubarItem>고급</MenubarItem>
                            </MenubarGroup>
                            <MenubarGroup>Q&A</MenubarGroup>
                            <MenubarGroup>커뮤니티</MenubarGroup>
                            <MenubarGroup>공지사항</MenubarGroup>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>


                    </MenubarMenu>
                </Menubar>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="메뉴 검색..."
                        className="pl-9 w-48"
                    />
                </div>
                <Button variant="ghost" size="sm"><Link to="/auth/login">로그아웃</Link></Button>
                {/* 로그인 로그아웃 구현해야 함 */}
            </div>
        </nav >
    );
}

export default InstructorNav;
