import React from "react";
import { Link } from "react-router-dom";
import InstructorNav from "@/components/InstructorNav";
import Tail from "@/components/Tail";

function InstructorMain() {

    return (
        <>
            {/* 메뉴 컴포넌트 */}
            <InstructorNav></InstructorNav>
            <p>강사 메인화면</p>
            <Link to="/instructor/course/new">강좌 개설 신청</Link>
            {/* 풋터 컴포넌트 */}
            <Tail></Tail>
        </>

    )

}

export default InstructorMain;