import React, { useState, useEffect } from 'react';

import './App.css';
import './fonts/stylesheet.css'
import History from './components/History'
import Workspace from './components/Workspace'
import Navbar from './components/Navbar'
import { CallAPI } from './utilities/networking';
import { useParams } from "react-router-dom";

function App() {

  let { conversionId } = useParams();

  const [refetchHistory, setRefetchHistory] = useState(false);
  const [user, setUser] = useState({});

  const makeRequest = async () => {
    const userContext = await CallAPI("/gw/user/fetch", 'POST', null);
    if(userContext.success){
        setUser(JSON.parse(userContext.data));
    }
  }

  useEffect(() => {
    makeRequest();
  }, [])


  return (
    <div className="App">
      <Navbar name={user.firstname + " " + user.lastname} />
      <div className="Tool">
        <History refetchHistory={refetchHistory} refetchedHistory={() => setRefetchHistory(false)} />
        <Workspace conversionIdURL={conversionId} fetchHistory={() => setRefetchHistory(true)} />
      </div>
    </div>
  );
}

export default App;
