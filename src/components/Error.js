import React, { useCallback, useEffect, useState } from 'react';
import Particles from "react-particles";
import { loadFull } from "tsparticles"
import {useNavigate} from 'react-router-dom';

function Error(props) {

  const navigate = useNavigate();
  const navigateToTool = (conversionId) => navigate('/tool/new', {replace: true});

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
  }, []);

  return (
    <div className="SignIn">
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
        <span className="SignInFormHeaderTitle noselect">Oops, there was an error. 😕</span>
        <div onClick={() => navigateToTool()} style={{marginBottom: 25, cursor: 'pointer', textDecoration: "underline", color:"blue", paddingTop: 5}}><span className="SignInFormHeaderText noselect">Take me back to the tool.</span></div>
      </div>
    </div>
      <div className="SignInLogo noselect">
        <img src="https://placeholder.com/wp-content/uploads/2018/10/placeholder.com-logo1.png" style={{width: 200}} />
      </div>
    </div>
  );
}

export default Error;
