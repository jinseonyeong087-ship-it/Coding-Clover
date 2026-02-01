import React from "react";
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarFooter
} from "@/components/ui/sidebar"

function SidebarPublic() {






    return (
        <SidebarProvider>
            <Sidebar dir="rtl" side="right">
                <SidebarHeader>메뉴바 헤더</SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>이게 메뉴인가</SidebarGroup>

                </SidebarContent>
                <SidebarFooter></SidebarFooter>
            </Sidebar>
            <SidebarInset>
                이건 뭔데
            </SidebarInset>
        </SidebarProvider>
    )
}

export default SidebarPublic;