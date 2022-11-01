import React, { useState, useEffect, useRef } from 'react';
import BottomSheet from 'bottom-sheet-react';
import {useNavigate} from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro' // <-- import styles to be used

function Navbar(props) {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const listRef = useRef(null);
  const buttonRef = useRef(null);
  const buttonRefMobile = useRef(null);
  const listRefMobile = useRef(null);
  const navigate = useNavigate();
  const navigateToScreen = (screenName) => navigate('/' + screenName, {replace: true});

  const handleClickOutside = (event) => {
    if (listRef.current && !listRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)
  && listRefMobile.current && !listRefMobile.current.contains(event.target) && buttonRefMobile.current && !buttonRefMobile.current.contains(event.target)) {
      setMenuIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }

  const toggleMenu = () => {
    if(!menuIsOpen){
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
    }
    else{
      document.removeEventListener("mousedown", handleClickOutside);
    }
    setMenuIsOpen(!menuIsOpen)
  }

  const cleanName = (name) => {
    if(name.toLowerCase().includes("undefined")){
      return "";
    }
    else {
      return name;
    }
  }

  return (
    <div className="Navbar">
      <span className="noselect">
        <img src="https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo1.png" style={{width: 200}} />
      </span>
      <div className="UserWrapper hideOnMobile">
        <div ref={buttonRef} onClick={() => toggleMenu()} className="UserButton">
          <span className="UserTitle noselect">
            {cleanName(props.name)}
            <FontAwesomeIcon icon={solid('chevron-down')} style={{fontSize: 10, marginLeft: 5}} />
          </span>
        </div>
        {menuIsOpen && <div ref={listRef} className="UserList">
          {(props.isAccount) && <div onClick={() => navigateToScreen("tool/new")} className="UserListItem noselect">Tool</div>}
          {(props.isAccount === undefined) && <div onClick={() => navigateToScreen("account")} className="UserListItem noselect">Account</div>}
          <div onClick={() => navigateToScreen("support")} className="UserListItem noselect">Support</div>
          <div onClick={() => navigateToScreen("signout")} className="UserListItem noselect">Sign out</div>
        </div>}
      </div>
      <div className="NavMobileWrapper showOnlyOnMobile">
        <div ref={buttonRefMobile} onClick={() => toggleMenu()} className="NavMobile noselect">
          <FontAwesomeIcon icon={solid('bars')} style={{color: "white", fontSize: 20}} />
        </div>
        {menuIsOpen &&
          <BottomSheet
          isExpandable={false}
          containerClassName={"SheetModal"}>
            <div ref={listRefMobile} className="MobileMenu">
              {(props.isAccount) && <div onClick={() => navigateToScreen("tool/new")} className="MobileMenuItem noselect">
                <FontAwesomeIcon icon={solid('Robot')} style={{color: "black", fontSize: 20}} /> Tool
              </div>}
              {(props.isAccount === undefined) && <div onClick={() => navigateToScreen("account")} className="MobileMenuItem noselect">
                <FontAwesomeIcon icon={solid('User')} style={{color: "black", fontSize: 20}} /> Account
              </div>}
              <div onClick={() => navigateToScreen("support")} className="MobileMenuItem noselect">
                <FontAwesomeIcon icon={solid('Gear')} style={{color: "black", fontSize: 20}} /> Support
              </div>
              <div onClick={() => navigateToScreen("signout")} className="MobileMenuItem noselect">
                <FontAwesomeIcon icon={solid('right-from-bracket')} style={{color: "black", fontSize: 20}} /> Sign Out
              </div>
            </div>
        </BottomSheet>}
      </div>
    </div>
  );
}

export default Navbar;
