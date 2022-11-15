import React from "react";

const Footer = () => {
    const year = new Date().getFullYear();
  
    return <footer>{`Copyright © Kilo Studio LLC. All rights reserved ${year}`}</footer>;
  };
  
  export default Footer;

