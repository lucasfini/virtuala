import React, { useCallback, useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';

function Signout(props) {
  const navigate = useNavigate();
  const navigateToSignIn = (conversionId) => navigate('/login', {replace: true});

  const signUserOut = () => {
    var authToken = localStorage.setItem("authToken", "loggedout");
    navigateToSignIn();
  }

  useEffect(() => {
    signUserOut();
  }, [])

  return (
    <div></div>
  );
}

export default Signout;
