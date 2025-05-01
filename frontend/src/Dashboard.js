import React, {useEffect,useState} from 'react';
import axios from 'axios';

export default function Dashboard(){
  const [msg, setMsg] = useState('');
  useEffect(()=>{
    axios.get('http://localhost:8000/api/')
      .then(res=>setMsg(res.data.message))
      .catch(err=>console.error(err));
  },[]);
  return <div>{msg}</div>;
}