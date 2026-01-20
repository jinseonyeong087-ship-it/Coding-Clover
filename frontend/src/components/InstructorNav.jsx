function InstructorNav() {
    return (
        <>
        <h2>Coding-Clover</h2>
         <Menubar>
            <MenubarMenu>
                <MenubarTrigger>레벨별 강좌</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem>
                            초급 <MenubarShortcut>⌘T</MenubarShortcut>
                        </MenubarItem>
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
        </>
    );
}

export default InstructorNav;
