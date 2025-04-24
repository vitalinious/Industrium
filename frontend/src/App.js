import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/hello/')
      .then(res => setMessage(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{message ? message : "Loading..."}</h1>
      </header>
    </div>
  );
}

export default App;
