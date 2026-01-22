import React, { useState } from 'react';
import AdminNav from '@/components/AdminNav';
import Tail from '@/components/Tail';

function AdminMain() {

    const course = useState();
    
    


    return (
        <>
        <AdminNav />
        <section className="container mx-auto px-4 py-16">
            <p>관리자가 승인하는 곳</p>
        </section>

        
        <Tail />
        </>
        
    )

}
// 강사메인화면

export default AdminMain;