import React, { useState, useEffect, useRef } from 'react';

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

function selectDropdownBackgroundColor(inputType){
  if(inputType === "twitter") {
    return "rgba(29,161,242,0.75)";
  }
  else if(inputType === "youtube") {
    return "rgba(255,0,0,0.75)";
  }
  else if(inputType === "blog") {
    return "rgba(28,117,25,0.75)";
  }
  else if(inputType === "newsletter") {
    return "rgba(129,12,90,0.75)";
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

function selectEmoji(inputType) {
  if(inputType === "twitter") {
    return "🐦";
  }
  else if(inputType === "youtube") {
    return "📹";
  }
  else if(inputType === "blog") {
    return "🖌";
  }
  else if(inputType === "newsletter") {
    return "✉️";
  }
}

function renderOptionList(isInput, optionSelected, inputSelectedValue, inputSelectedName, func) {
  var options = [{"name": "Twitter", "value":1}, {"name": "Youtube", "value":3}, {"name": "Blog", "value":2}, {"name": "Newsletter", "value":1}]
  if(isInput) {
    return options.map((type) => {
      if(type.name.toLowerCase() !== optionSelected.toLowerCase()) {
        return (<div key={"input_" + type.name} onClick={() => func(type.name, type.value)} className="OptionListItem" style={{backgroundColor: selectDropdownBackgroundColor(type.name.toLowerCase()), color: "white", borderColor: selectMainColor(type.name.toLowerCase())}}>{`${selectEmoji(type.name.toLowerCase())} ${type.name}`}</div>)
      }
      return null;
    })
  }
  else {
    return options.map((type) => {
      if(type.name.toLowerCase() !== optionSelected.toLowerCase() && type.name.toLowerCase() !== inputSelectedName.toLowerCase() && type.value <= inputSelectedValue) {
        return (<div key={"output_" + type.name} onClick={() => func(type.name, type.value)} className="OptionListItem" style={{backgroundColor: selectDropdownBackgroundColor(type.name.toLowerCase()), color: "white", borderColor: selectMainColor(type.name.toLowerCase())}}>{`${selectEmoji(type.name.toLowerCase())} ${type.name}`}</div>)
      }
      return null;
    })
  }

}

function selectProperOutput(inputName, inputValue, func) {
  if(inputValue === 1 && inputName === "Twitter"){
    func("Newsletter", 1);
    return;
  }
  func("Twitter", 1);
  return;
}


function Option(props) {
  const [isListOpen, setIsListOpen] = useState(false);
  const [optionSelectedValue, setOptionSelectedValue] = useState((props.isInput)?2:1);
  const [optionSelected, setOptionSelected] = useState((props.isInput)?"Blog":"Twitter");
  const listRef = useRef(null);
  const buttonRef = useRef(null);

  const handleClickOutside = (event) => {
    if (listRef.current && !listRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
      setIsListOpen(false)
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }

  const toggleMenu = () => {

    if(props.disabled){
      return;
    }

    if(!isListOpen){
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
    }
    else{
      document.removeEventListener("mousedown", handleClickOutside);
    }
    setIsListOpen(!isListOpen)
  }


  useEffect(() => {
    //Check if can convert to pre-selected
    if(!props.isInput && (props.inputSelectedValue < optionSelectedValue || props.inputSelectedName === optionSelected)){
        selectProperOutput(props.inputSelectedName, props.inputSelectedValue, setNewOptionAndClose);
    }

    if(!props.isInput && props.outputName !== optionSelected) {
      setOptionSelected(props.outputName);
    }

    if(!props.isInput && props.outputValue !== optionSelectedValue) {
      setOptionSelectedValue(props.outputValue);
    }

    if(props.isInput && props.inputSelectedName !== optionSelected) {
      setOptionSelected(props.inputSelectedName);
    }

    if(props.isInput && props.inputSelectedValue !== optionSelectedValue) {
      setOptionSelectedValue(props.inputSelectedValue);
    }

  }, [props])

  const setNewOptionAndClose = (type, value) => {
    setOptionSelected(type);
    setOptionSelectedValue(value);
    setIsListOpen(false);
    props.informParent({type, value})
  }

  return (
    <div className="OptionWrapper">
      <div ref={buttonRef} onClick={() => toggleMenu()} className="Option noselect" style={{backgroundColor: selectBackgroundColor(optionSelected.toLowerCase()), color: selectMainColor(optionSelected.toLowerCase()), borderColor: selectMainColor(optionSelected.toLowerCase())}}>
        {`${selectEmoji(optionSelected.toLowerCase())} ${optionSelected}`}
      </div>
      {isListOpen &&
      (<div ref={listRef} className="OptionList">
        {renderOptionList(props.isInput, optionSelected, props.inputSelectedValue, props.inputSelectedName, setNewOptionAndClose)}
      </div>)}
    </div>
  );
}

export default Option;
