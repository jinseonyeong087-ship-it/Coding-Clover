import React from "react";
import InstructorNav from "../../components/InstructorNav";
import Tail from "../../components/Tail";

function InstructorMain() {

    return (
        <>
            {/* 메뉴 컴포넌트 */}
            <InstructorNav></InstructorNav>
            {/* 풋터 컴포넌트 */}
            <Tail></Tail>
        </>

    )

}

export default InstructorMain;