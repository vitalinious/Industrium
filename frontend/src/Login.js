import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const {data} = await axios.post('http://localhost:8000/api/token/', {username, password});
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + data.access;
      navigate('/dashboard');
    } catch(err){
      console.error('Login error', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Username:</label>
      <input value={username} onChange={e=>setUsername(e.target.value)} />
      <label>Password:</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}