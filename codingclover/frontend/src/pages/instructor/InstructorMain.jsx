import React from "react";
import { Link } from "react-router-dom";
import InstructorNav from "@/components/InstructorNav";
import Tail from "@/components/Tail";

function InstructorMain() {

    return (
        <>
            {/* 메뉴 컴포넌트 */}
            <InstructorNav />
            <section className="container mx-auto px-4 py-16">
                <p>get 강사가 신청한 강좌 내역이 DB에 가고 여기에 뜨려면</p>
                <Link to="/instructor/course/new">강좌 개설 신청</Link>
            </section>

            
            {/* 풋터 컴포넌트 */}
            <Tail />
        </>

    )

}

export default InstructorMain;