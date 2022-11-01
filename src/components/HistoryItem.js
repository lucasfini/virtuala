import React, {useCallback} from 'react';
import {useNavigate} from 'react-router-dom';

function selectBackgroundColor(inputType){
  if(inputType === "twitter") {
    return "rgba(29,161,242,0.25)";
  }
  else if(inputType === "youtube") {
    return "rgba(255,0,0,0.25)";
  }
  else if(inputType === "blog") {
    return "rgba(28,117,25,0.25)";
  }
  else if(inputType === "newsletter") {
    return "rgba(129,12,90,0.25)";
  }
}

function selectMainColor(inputType){
  if(inputType === "twitter") {
    return "rgb(29,161,242)";
  }
  else if(inputType === "youtube") {
    return "rgb(255,0,0)";
  }
  else if(inputType === "blog") {
    return "rgb(28,117,25)";
  }
  else if(inputType === "newsletter") {
    return "rgb(129,12,90)";
  }
}


function HistoryItem(props) {
  const navigate = useNavigate();
  const handleOnClick = useCallback(() => navigate('/tool/' + props.id + "?from=" + props.from + "&to=" + props.to, {replace: true}), [navigate]);

  return (
    <div onClick={handleOnClick} className="HistoryItem" style={{backgroundColor: selectBackgroundColor(props.from.toLowerCase()), borderColor: selectMainColor(props.from.toLowerCase())}}>
      <span className="HistoryItemTitle noselect" style={{color: selectMainColor(props.from.toLowerCase())}}>{props.from} to {props.to}</span>
      <div className="HistoryItemInputContainer">
        <span className="HistoryItemText noselect">
          {props.input}
        </span>
      </div>
    </div>
  );
}

export default HistoryItem;
