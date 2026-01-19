import React, { useState } from 'react';
import MainNav from '../../components/StudentNav';
import Tail from '../../components/Tail';

function Enroll() {
  let [course, setCourse] = useState({
    title: '',
    create_by: '',
    level: '1, 2, 3',
    description: '',
    thumbnail_url: ''
  });

  <script src="http://localhost:8097"></script>

  return (
    <>
      <MainNav></MainNav>
      <div>
        <p>강좌명 : </p><input>{setCourse.title}</input>
        <p>강사명 : </p><input>{setCourse.create_by}</input>
        <p>난이도 : </p><input>{setCourse.level}</input>
        <p>목  차 : </p><input>{setCourse.description}</input>
        <p>썸네일 : </p><input>{setCourse.thumbnail_url}</input>
      </div>
      <Tail></Tail>
    </>
    
  );
}

export default Enroll;