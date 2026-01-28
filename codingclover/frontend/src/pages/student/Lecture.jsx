import React from "react";
import Nav from "@/components/Nav";
import Tail from "@/components/Tail";

function Lecture() {
    <>
        <Nav />
        <section className="container mx-auto px-4 py-16">
            <p>강좌에 들어와서 강좌의 강의 상세를 보여주는 페이지
                필요한 것: 다른 강의로 이동할 수 있는 목록, 동영상, 문제 출제 페이지 있을 자리</p>

        </section>

        <Tail />
    </>

}

export default Lecture;