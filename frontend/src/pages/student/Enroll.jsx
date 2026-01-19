import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
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

  return (
    <>
      <MainNav></MainNav>
      <View>
        강좌명 : <input>{course.title}</input>
        강사명 : <input>{course.create_by}</input>
        난이도 : <input>{course.level}</input>
        목  차 : <input>{course.description}</input>
        썸네일 : <input>{course.thumbnail_url}</input>
      </View>
      <Tail></Tail>
    </>
    
  );
}

export default Enroll;