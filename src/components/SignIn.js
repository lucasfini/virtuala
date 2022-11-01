import React, { useCallback, useEffect, useState } from 'react';
import Particles from "react-particles";
import { loadFull } from "tsparticles"
import {useNavigate} from 'react-router-dom';
import { CallOpenAPI } from '../utilities/networking';
import LoadingIcons from 'react-loading-icons'
import toast, { Toaster } from 'react-hot-toast';

function SignIn(props) {
  const [greetingsMessage, setGreetingsMessage] = useState("Please sign in to start using our tool.\n\nIf you don't have an account, you can create one now for free.");
  const [greetingsTitle, setGreetingsTitle] = useState("Hello! 👋");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [callingAPI, setCallingAPI] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const navigate = useNavigate();
  const navigateToTool = (conversionId) => navigate('/tool/new', {replace: true});
  const navigateToDashboard = (conversionId) => navigate('/dashboard', {replace: true});

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
  }, []);

  const hasUserBeenHereBefore = () => {
    var authToken = localStorage.getItem("authToken");


    if(authToken == "loggedout"){
      setGreetingsTitle("Hey, welcome back! 🎉");
      setGreetingsMessage("Sign in to continue where you left off!")
    }
    else if(authToken != null || authToken != undefined) {
      //May be a valid token, we should send them to the tool
      navigateToTool();
    }

  }

  const createAccount = () => {
    setIsCreatingAccount(true);
    setIsForgotPassword(false);
    setGreetingsTitle("Let's get started! 🥳");
    setGreetingsMessage("We just need a few details and then you can get started, for free!");
  }

  const signInWithAccount = () => {
    setIsCreatingAccount(false);
    setIsForgotPassword(false);
    hasUserBeenHereBefore();
  }

  const forgotPassword = () => {
    setIsForgotPassword(true);
    setIsCreatingAccount(false);
    setGreetingsTitle("We'll figure this out. 🤓");
    setGreetingsMessage("Check your email once you submit to reset your password.");
  }

  useEffect(() => {
    hasUserBeenHereBefore();
  }, [])

  const doesEmailPassCheck = (email) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  const forgotPasswordClick = async () => {
    if(callingAPI) {
      return;
    }

    setCallingAPI(true);

    var email = document.getElementById("email_forgot").value;

    if(email.trim().length == 0 || !doesEmailPassCheck(email)){
      toast("You must enter a valid email.");
      setCallingAPI(false);
      return;
    }

    var fd = new FormData();
    fd.append("email", email);

    const resp = await CallOpenAPI("/user/password/forgot", 'POST', fd);

    console.log(resp);
    setCallingAPI(false);
    if(resp.success){
      toast("Got it! Check your email.");
    }
    else{
      toast(resp.message);
    }

    document.getElementById("email_forgot").value = "";

  }

  const createAccountClick = async () => {
    if(callingAPI) {
      return;
    }

    setCallingAPI(true);

    var firstName = document.getElementById("firstname").value;
    var lastName = document.getElementById("lastname").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var subscribe = document.getElementById("subscribe").checked;

    if(firstName.trim().length == 0){
      toast("You must enter a first name.");
      setCallingAPI(false);
      return;
    }

    if(lastName.trim().length == 0){
      toast("You must enter a last name.");
      setCallingAPI(false);
      return;
    }

    if(email.trim().length == 0 || !doesEmailPassCheck(email)){
      toast("You must enter a valid email.");
      setCallingAPI(false);
      return;
    }

    if(password.trim().length == 0){
      toast("You must enter a password.");
      setCallingAPI(false);
      return;
    }

    var fd = new FormData();
    fd.append("email", email);
    fd.append("password", password);
    fd.append("firstname", firstName);
    fd.append("lastname", lastName);
    fd.append("subscribe", subscribe)

    const resp = await CallOpenAPI("/user/create", 'POST', fd);

    if(resp.success){
      localStorage.setItem("authToken", resp.token);
      navigateToTool();
    }
    else{
      setCallingAPI(false);
      toast(resp.message);
    }

  }

  const signInClick = async () => {

    if(callingAPI) {
      return;
    }

    setCallingAPI(true);

    var email = document.getElementById("email_login").value;
    var password = document.getElementById("password_login").value;

    if(email.trim().length == 0 || !doesEmailPassCheck(email)){
      toast("Please check that you have entered your email properly.");
      setCallingAPI(false);
      return;
    }

    if(password.trim().length == 0){
      setCallingAPI(false);
      return;
    }

    var fd = new FormData();
    fd.append("email", email);
    fd.append("password", password);

    const resp = await CallOpenAPI("/authentication/signin", 'POST', fd)

    if(resp.success){
      localStorage.setItem("authToken", resp.token);
      navigateToDashboard();
    }
    else{
      setCallingAPI(false);
      toast(resp.message);
    }


  }

  const onKeyDownListener = (e) => {
    if(e.keyCode==13) {
      if (isCreatingAccount) {
        createAccountClick();
      }
      else{
        signInClick();
      }
    }
  }

  return (
    <div className="SignIn">
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'white',
          color: 'black',
          fontFamily: "lorettomedium"
        }
      }}
     />
      <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
          background: {
            color: {
              value: "#0d47a1",
            },
          },
          fpsLimit: 60,
          interactivity: {
            detect_on: "canvas",
            events: {
              onclick: { enable: true, mode: "push" },
              onhover: {
                enable: true,
                mode: "attract",
                parallax: { enable: false, force: 60, smooth: 10 }
              },
              resize: true
            },
            modes: {
              push: { quantity: 4 },
              attract: { distance: 200, duration: 0.4, factor: 5 }
            }
          },
          particles: {
            color: { value: "#ffffff" },
            line_linked: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.4,
              width: 1
            },
            move: {
              attract: { enable: false, rotateX: 600, rotateY: 1200 },
              bounce: false,
              direction: "none",
              enable: true,
              out_mode: "out",
              random: false,
              speed: 2,
              straight: false
            },
            number: { density: { enable: true, value_area: 1600 }, value: 80 },
            opacity: {
              anim: { enable: false, opacity_min: 0.1, speed: 1, sync: false },
              random: false,
              value: 0.5
            },
            shape: {
              character: {
                fill: false,
                font: "Verdana",
                style: "",
                value: "*",
                weight: "400"
              },
              polygon: { nb_sides: 5 },
              stroke: { color: "#000000", width: 0 },
              type: "circle"
            },
            size: {
              anim: { enable: false, size_min: 0.1, speed: 40, sync: false },
              random: true,
              value: 5
            }
          },
          detectRetina: true,
        }}
      />
      <div className="SignInForm">
        <div className="SignInFormHeader">
          <span className="SignInFormHeaderTitle noselect">{greetingsTitle}</span>
          <span className="SignInFormHeaderText noselect">{greetingsMessage}</span>
        </div>
        {(!isCreatingAccount && !isForgotPassword) &&
          <div className="SignInFormContents">
            <input onKeyDown={onKeyDownListener} id="email_login" name="email" placeholder={"Email"} type="email" className="SignInFormInput" />
            <input onKeyDown={onKeyDownListener} id="password_login" name="password" placeholder={"Password"} type="password" className="SignInFormInput" />
            <div onClick={() => signInClick()} className="SignInFormButton noselect">
              {(callingAPI)?<LoadingIcons.TailSpin stroke="#fff" fill="#fff" style={{height: 20}} />:"Sign In"}
            </div>
            <div className="SignInFormHeaderText noselect" style={{display: 'flex', flexDirection: 'row'}}>
              or <div onClick={() => createAccount(true)} className="SignInFormCreateAccount">create an account.</div>
            </div>
            <div className="SignInFormHeaderText noselect" style={{display: 'flex', flexDirection: 'row', padding: 0}}>
              <div onClick={() => forgotPassword(true)} className="SignInFormCreateAccount">Forgot password?</div>
            </div>
          </div>
        }
        {(isCreatingAccount && !isForgotPassword) &&
          <div className="SignInFormContents">
            <input onKeyDown={onKeyDownListener} id="firstname" name="firstname" placeholder={"First Name"} type="text" className="SignInFormInput" />
            <input onKeyDown={onKeyDownListener} id="lastname" name="lastname" placeholder={"Last Name"} type="text" className="SignInFormInput" />
            <input onKeyDown={onKeyDownListener} id="email" name="email" placeholder={"Email"} type="email" className="SignInFormInput" />
            <input onKeyDown={onKeyDownListener} id="password" name="password" placeholder={"Password"} type="password" className="SignInFormInput" />
            <label className="SignInFormInputCheckbox SignInFormHeaderText noselect">
              <input name="subscribe" id="subscribe" type="checkbox" />
              Subscribe to our newsletter<br/>(We promise we won't spam you, some emails may even be written by this tool! 😉)
            </label>
            <div onClick={() => createAccountClick()} className="SignInFormButton noselect">
              {(callingAPI)?<LoadingIcons.TailSpin stroke="#fff" fill="#fff" style={{height: 20}} />:"Create Account"}
            </div>
            <div className="SignInFormHeaderText noselect" style={{display: 'flex', flexDirection: 'row'}}>
              or <div onClick={() => signInWithAccount()} className="SignInFormCreateAccount">use an existing account.</div>
            </div>
          </div>
        }
        {(!isCreatingAccount && isForgotPassword) &&
          <div className="SignInFormContents">
            <input onKeyDown={onKeyDownListener} id="email_forgot" name="email" placeholder={"Email"} type="email" className="SignInFormInput" />
            <div onClick={() => forgotPasswordClick()} className="SignInFormButton noselect">
              {(callingAPI)?<LoadingIcons.TailSpin stroke="#fff" fill="#fff" style={{height: 20}} />:"Submit"}
            </div>
            <div className="SignInFormHeaderText noselect" style={{display: 'flex', flexDirection: 'row'}}>
              or <div onClick={() => signInWithAccount()} className="SignInFormCreateAccount">use an existing account.</div>
            </div>
          </div>
        }
      </div>
      <div className="SignInLogo noselect">
        <img src="https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo1.png" style={{width: 200}} />
      </div>
    </div>
  );
}

export default SignIn;
