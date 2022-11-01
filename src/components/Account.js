import React, { useState, useEffect, useRef } from 'react';

import '../App.css';
import '../fonts/stylesheet.css'
import Navbar from '../components/Navbar'
import { CallAPI } from '../utilities/networking';
import LoadingIcons from 'react-loading-icons'
import toast, { Toaster } from 'react-hot-toast';

function Account() {

  const [user, setUser] = useState({});
  const [quota, setQuota] = useState(4);
  const [usedQuota, setUsedQuota] = useState(0);
  const [planId, setPlanId] = useState(0);
  const [changePasswordIsOpen, setChangePasswordIsOpen] = useState(false);
  const [deleteAccountIsOpen, setDeleteAccountIsOpen] = useState(false);
  const [isCallingAPI, setIsCallingAPI] = useState(false);
  const changePasswordRef = useRef(null);
  const deleteAccountRef = useRef(null);

  const makeRequest = async () => {
    const userContext = await CallAPI("/gw/user/fetch", 'POST', null);
    if(userContext.success){
        setUser(JSON.parse(userContext.data));
    }
    const userQuota = await CallAPI("/gw/user/quota", 'POST', null);
    if(userQuota.success){
      var quota = JSON.parse(userQuota.data);
      setQuota(quota.max);
      setUsedQuota(quota.usedQuota);
      setPlanId(quota.planId);
    }

  }

  const cleanName = (name) => {
    if(name === undefined || name.toLowerCase().includes("undefined")){
      return "";
    }
    else {
      return name;
    }
  }

  const cleanEmail = (email) => {
    if(email === undefined || email.toLowerCase().includes("undefined")){
      return "";
    }
    else {
      return email;
    }
  }

  const getPlanName = (planId) => {
    if(planId == 0){
      return "Free";
    }
    else if(planId == 1){
      return "Basic";
    }
    else if (planId == 2){
      return "Pro";
    }
    else if(planId == 3) {
      return "Growth";
    }
    else {
      return "Custom";
    }
  }

  const getAccountCreated = () => {
    if(user === undefined || user.created === undefined) {
      return "";
    }
    return user.created.substring(0,user.created.lastIndexOf(","));
  }

  const getNewsletter = () => {
    if(user === undefined || user.newsletterSubscribed === undefined) {
      return "";
    }

    if(user.newsletterSubscribed){
      return "You are subscribed to the newsletter.";
    }
    else{
      return "You are not subscribed to the newsletter.";
    }

  }

  const getPlanRenewal = () => {
    if(user === undefined || user.nextBillingDate === undefined) {
      return "";
    }
    return user.nextBillingDate.substring(0,user.nextBillingDate.lastIndexOf(","));;
  }

  const confirmPasswordChange = async () => {

    if(isCallingAPI){
      return;
    }

    setIsCallingAPI(true);

    var oldPassword = document.getElementById("password_old").value;
    var newPassword = document.getElementById("password_new").value;
    var confirmPassword = document.getElementById("password_new_confirm").value;

    if(oldPassword.trim().length == 0){
      setIsCallingAPI(false);
      toast("You must confirm your old password.");
      return;
    }

    if(newPassword.trim().length == 0){
      setIsCallingAPI(false);
      toast("You must enter a new password");
      return;
    }

    if(confirmPassword.trim().length == 0){
      setIsCallingAPI(false);
      toast("You must confirm your new password.");
      return;
    }

    var fd = new FormData();
    fd.append("oldPassword", oldPassword);
    fd.append("password", newPassword);
    fd.append("passwordConfirmation", confirmPassword);

    const resp = await CallAPI("/user/password/change", 'POST', fd);

    console.log(resp);

    if(resp.success){
      toast(resp.message);
      toggleChangePassword(false);
    }
    else{
      if(resp.message == "Unauthorized."){
        toast("Your old password is incorrect.");
      }
      else{
        toast(resp.message);
      }
    }

    setIsCallingAPI(false);


  }

  const deleteAccount = async () => {

    if(isCallingAPI){
      return;
    }

    setIsCallingAPI(true);

    var password = document.getElementById("password_delete").value;

    if(password.trim().length == 0){
      setIsCallingAPI(false);
      toast("You must confirm your password.");
      return;
    }

    var fd = new FormData();
    fd.append("password", password);

    const resp = await CallAPI("/gw/user/delete", 'POST', fd);

    console.log(resp);

    if(resp.success){
      toast("Your account has been deleted. Redirecting...");
      toggleChangePassword(false);
      setTimeout(() => {
        window.location.href="/signout";
      }, 2500)
    }
    else{
      if(resp.message == "Unauthorized."){
        toast("Your password is incorrect.");
      }
      else{
        toast(resp.message);
      }
    }

    setIsCallingAPI(false);


  }

  useEffect(() => {
    makeRequest();
  }, [])


  const handleClickOutside = (event) => {
    if (changePasswordRef.current && !changePasswordRef.current.contains(event.target)) {
      setChangePasswordIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
    if(deleteAccountRef.current && !deleteAccountRef.current.contains(event.target)){
      setDeleteAccountIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }

  const toggleChangePassword = (open) => {
    if(open){
      setChangePasswordIsOpen(true);
      document.addEventListener("mousedown", handleClickOutside);
    }
    else{
      setChangePasswordIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }

  const toggleDeleteAccount = (open) => {
    if(open){
      setDeleteAccountIsOpen(true);
      document.addEventListener("mousedown", handleClickOutside);
    }
    else{
      setDeleteAccountIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }

  return (
    <div className="App">
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
      <Navbar isAccount name={user.firstname + " " + user.lastname} />
      <div className="AccountPage">
       <div className="AccountContainer">
        <div className="AccountPageTopLevel">
          <span className="AccountPageTitle">{cleanName(user.firstname + " " + user.lastname)}</span>
          <span className="AccountPageText" style={{marginTop: 3}}>{cleanEmail(user.email)}</span>
          <span className="AccountPageText" style={{marginTop: 3}}>Plan: {getPlanName(planId)}</span>
        </div>
        <div className="AccountPageCard">
          <span className="AccountPageMediumTitle noselect">Quota</span>
          <div className="AccountPageQuotaBar">
            <div className="AccountPageQuotaBarFill" style={{width: `${(usedQuota/quota)*100}%`}}></div>
          </div>
          <div className="AccountPageQuotaDetails">
            <span className="AccountPageText noselect">{usedQuota}/{quota}</span>
          </div>
        </div>
        <div className="AccountPageCard">
          <span className="AccountPageMediumTitle noselect">Details</span>
          <span className="AccountPageTextSimple"><span className="bold">Email:</span> {(user.emailVerified)?"Your email is verified.":"Your email is not verified."}</span>
          <span className="AccountPageTextSimple"><span className="bold">Created on:</span> {getAccountCreated()}</span>
          {(user.billingDay) && <span className="AccountPageTextSimple"><span className="bold">Plan renewal:</span> {getPlanRenewal()}</span>}
          <span className="AccountPageTextSimple"><span className="bold">Newsletter:</span> {getNewsletter()}</span>
        </div>
        <div className="AccountPageButtonContainer">
          <div className="AccountPageButton noselect">
            Change Plan
          </div>
          <div onClick={() => toggleChangePassword(true)} className="AccountPageButton noselect">
            Change Password
          </div>
        </div>
        <div className="AccountPageButtonContainer">
          <div onClick={() => toggleDeleteAccount(true)} className="AccountPageButtonDelete noselect">
            Delete Account
          </div>
        </div>
       </div>
      </div>
      {(changePasswordIsOpen) &&
      <div className="AccountModalBackground">
        <div ref={changePasswordRef} className="AccountModal">
          <div className="AccountModalTitle">
            <span className="AccountPageMediumTitle noselect">Change Password:</span>
          </div>
          <input id="password_old" name="password_old" placeholder={"Old Password"} type="password" className="SignInFormInput" />
          <input id="password_new" name="password_new" placeholder={"New Password"} type="password" className="SignInFormInput" />
          <input id="password_new_confirm" name="password_new_confirm" placeholder={"Confirm New Password"} type="password" className="SignInFormInput" />
          <div className="AccountPageButtonContainer">
            <div onClick={() => toggleChangePassword(false)} className="AccountPageButtonInverse noselect">
              <span className="AccountPageButtonInverseText">Cancel</span>
            </div>
            <div onClick={() => confirmPasswordChange()} className="AccountPageButton noselect">
              {(isCallingAPI)?<LoadingIcons.TailSpin stroke="#fff" fill="#fff" style={{height: 18}} />:"Confirm"}
            </div>
          </div>
        </div>
      </div>}
      {(deleteAccountIsOpen) &&
      <div className="AccountModalBackground">
        <div ref={deleteAccountRef} className="AccountModal">
          <div className="AccountModalTitle">
            <span className="AccountPageMediumTitle noselect">Delete Account:</span>
          </div>
          <span className="AccountPageTextSimple noselect" style={{width: '80%'}}>Type your password to confirm.</span>
          <input id="password_delete" name="password_delete" placeholder={"Password"} type="password" className="SignInFormInput" />
          <div className="AccountPageButtonContainer">
            <div onClick={() => toggleDeleteAccount(false)} className="AccountPageButtonInverse noselect">
              <span className="AccountPageButtonInverseText">Cancel</span>
            </div>
            <div onClick={() => deleteAccount()} className="AccountPageButton noselect">
              {(isCallingAPI)?<LoadingIcons.TailSpin stroke="#fff" fill="#fff" style={{height: 18}} />:"Confirm"}
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default Account;
