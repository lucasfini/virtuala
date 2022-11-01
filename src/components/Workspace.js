import React, { useRef, useState, useEffect, useCallback } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingIcons from 'react-loading-icons'
import toast, { Toaster } from 'react-hot-toast';
import FilterInputString from  '../utilities/InputFilter';
import { CallAPI } from '../utilities/networking';
import {connectStomp, disconnectStomp} from '../utilities/Websocket';
import {useNavigate} from 'react-router-dom';

import Option from './Option';

function Workspace(props) {
  const [inputValue, setInputValue] = useState(2);
  const [inputValueName, setInputValueName] = useState("Blog");
  const [inputSubmitted, setInputSubmitted] = useState(false);
  const [inputReturned, setInputReturned] = useState(false);
  const [outputRating, setOutputRating] = useState(0);
  const [outputHasReturned, setOutputHasReturned] = useState(false);
  const [outputValueName, setOutputValueName] = useState("Twitter");
  const [outputValue, setOutputValue] = useState(1);
  const [inputContent, setInputContent] = useState(props?.inputContent ?? '');
  const [textareaContent, setTextareaContent] = useState(props?.textAreaContent ?? '');
  const [conversionId, setConversionId] = useState(props?.conversionId ?? "")
  const [outputText, setOutputText] = useState("");
  const [backendMessage, setBackendMessage] = useState({});
  const [isConnectedToStomp,setIsConnectedToStomp] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [conversionIdURL, setConversionIdURL] = useState("new");

  const navigate = useNavigate();
  const navigateToNewItem = (conversionId) => navigate('/tool/' + conversionId, {replace: true});

  useEffect(() => {

    if(props.conversionIdURL == "" || props.conversionIdURL == null || props.conversionIdURL == undefined){
      setConversionIdURL("new");
      window.history.replaceState(null, "", "/tool/new");
      clearScreen(true);
    }
    else if(conversionIdURL !== props.conversionIdURL || forceRefresh) {

      if(forceRefresh){
        setForceRefresh(false);
      }

      if(isConnectedToStomp) {
        setIsConnectedToStomp(false);
        disconnectStomp();
      }

      if(props.conversionIdURL === "new"){
        setConversionIdURL("new");
        clearScreen(true);
      }
      else{
        var url_string = window.location.href;
        var url = new URL(url_string);
        var from = url.searchParams.get("from");
        var to = url.searchParams.get("to");
        setConversionIdURL(props.conversionIdURL);

        if(from !== null){
          setInputValue(getProperValue(from));
          setInputValueName(getProperName(from));
        }

        if(to !== null){
          setOutputValueName(getProperName(to));
          setOutputValue(getProperValue(to));
        }

        getHistoryItem(props.conversionIdURL);
      }

    }
  }, [props.conversionIdURL, forceRefresh])

  useEffect(() => {
    if(isConnectedToStomp){
      handleWSSMessage(backendMessage);
      disconnectStomp();
    }
  }, [backendMessage]);

  const clearScreen = (resetOptions) => {
    //Restore defaults
    if(resetOptions){
      setInputValue(2);
      setInputValueName("Blog");
      setOutputValue(1);
      setOutputValueName("Twitter");
    }

    setOutputRating(0);
    setInputSubmitted(false);
    setInputReturned(false);
    setOutputHasReturned(false);

    //Clean inputs/outputs
    setOutputText("");
    setInputContent("");
    setTextareaContent("");
  }

  const getProperName = (optName) => {
    if(optName.toLowerCase() === "youtube") {
      return "Youtube";
    }
    else if(optName.toLowerCase() === "blog") {
      return "Blog";
    }
    else if(optName.toLowerCase() === "newsletter") {
      return "Newsletter";
    }
    else if(optName.toLowerCase() === "twitter") {
      return "Twitter";
    }
    return "Blog";
  }

  const getProperValue = (optName) => {
    if(optName.toLowerCase() === "youtube") {
      return 3;
    }
    else if(optName.toLowerCase() === "blog") {
      return 2;
    }
    else if(optName.toLowerCase() === "newsletter") {
      return 1;
    }
    else if(optName.toLowerCase() === "twitter") {
      return 1;
    }
    return 1;
  }

  const collectInputValue = (type) => {
    setInputValue(type.value);
    setInputValueName(type.type);

    if(conversionIdURL !== "new"){
      clearScreen(false);
      window.history.replaceState(null, "", "/tool/new");
      setConversionIdURL("new");
    }

  }

  const collectOutputValue = (type) => {
    console.log(type);
    setOutputValueName(type.type);
  }

  const submitInput = async () => {

    if(inputSubmitted) {
      return;
    }

    let inputString = "";
    if(inputValueName === "Youtube" || inputValueName === "Twitter"){
      inputString = inputContent.trim();
    }
    else{
      inputString = textareaContent.trim();
    }

    var pass = FilterInputString(inputString, inputValueName.toLowerCase());

    if(!pass) {
      toast('There is a problem with your input.');
      return;
    }

    //Reset required inputs
    setOutputText("");
    setOutputHasReturned(false);
    setOutputRating(0);

    let fd = new FormData();
    fd.append("from", inputValueName.toLowerCase());
    fd.append("to", outputValueName.toLowerCase());
    fd.append("input", inputString);

    const resp = await CallAPI("/gw/convert", 'POST', fd);

    if(resp.success){
      setConversionId(resp.data);
      toast("Your input is converting, hang tight!");
      setInputSubmitted(true);
      props.fetchHistory();

      //Listen for response on wss
      setIsConnectedToStomp(true);
      connectStomp(setBackendMessage, resp.data);

    }
    else{
      toast(resp.message);
    }

  }

  const clickedInput = () => {
    if (inputSubmitted && inputReturned) {
      setInputSubmitted(false);
      setInputReturned(false);
    }
  }

  const rateOuput = (val) => {
    if(outputRating === val){
      return;
    }
    setOutputRating(val);
    toast('Thank you for rating your output!');
    let fd = new FormData();
    fd.append("rating", val);
    fd.append("conversionId", conversionId);
    CallAPI("/gw/rate/output", 'POST', fd)
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText);
    toast('Copied to clipboard!');
  }

  const onChangeOutputArea = (e) => {
    var currentText = e.target.value;
    setOutputText(currentText);
  }

  const unescapeInputText = (message) => {
    if(message == undefined) {
      return "";
    }

    return `${message.replaceAll("\\r\\n", "\n").replaceAll("\\r", "\n").replaceAll("\\n", "\n")}`;
  }

  const unescapeOutputText = (message) => {
    if(message == undefined) {
      return "";
    }

    console.log(message.replace(/"/g, '&quot;'));

    var text = message;//JSON.parse(`"${message.replace(/"/g, '&quot;')}"`);

    return `${text.replaceAll("\\r\\n", "\n").replaceAll("\\r", "\n").replaceAll("\\n", "\n").replaceAll("&quot;", '"')}`;
  }

  const getHistoryItem = async (conversionIdFromUrl) => {
    const data = await CallAPI("/gw/history/fetch/", 'GET', conversionIdFromUrl);
    if(data.success) {
      const historicalItemData = JSON.parse(data.data);

      console.log(historicalItemData);

      if(historicalItemData == null) {
        toast("There was an error fetching this content. It likely failed to generate.");
        return;
      }

      setConversionId(historicalItemData.conversionId);

      //If no output and didError is false, then we subscribe to wss
      if(historicalItemData.conversionOutput === undefined && historicalItemData.didError === false){
        setOutputText("");
        toast("Your output is still generating, hang tight!");
        setInputReturned(false);
        setInputSubmitted(true);
        setOutputHasReturned(false);
        setIsConnectedToStomp(true);
        //Listen for response on wss
        connectStomp(setBackendMessage, historicalItemData.conversionId);
      }
      else{
        setOutputText(unescapeOutputText(historicalItemData.conversionOutput));
        setInputReturned(true);
        setOutputHasReturned(true);
      }

      var split = historicalItemData.conversionType.split("-");
      setInputValue(getProperValue(split[0]));
      setInputValueName(getProperName(split[0]));
      setOutputValue(getProperValue(split[1]));
      setOutputValueName(getProperName(split[1]));

      if(split[0] == "youtube" || split[0] == "twitter"){
        setInputContent(unescapeInputText(historicalItemData.conversionInput));
      }
      else{
        setTextareaContent(unescapeInputText(historicalItemData.conversionInput));
      }

      setOutputRating(historicalItemData.conversionRating);

    }
    else{
      toast("There was an error fetching this item.");
    }
  }

  const handleWSSMessage = async (message) => {
    if(message.success){
      console.log(conversionIdURL);
      console.log(message.conversionId);
      if(conversionIdURL == message.conversionId){
        console.log("should force a refresh");
        setForceRefresh(true);
        return;
      }
      navigateToNewItem(message.conversionId)
    }
    else {
      if (message.message === undefined || message.message.trim().length == 0) {
        return;
      }
      toast(message.message);
    }
  }

  return (
    <div className="Workspace container noselect">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'black',
            color: 'white',
            fontFamily: "lorettomedium"
          }
        }}
       />
      <div className="OptionsContainer">
        <Option disabled={(inputSubmitted && !inputReturned)} isInput={true} inputSelectedName={inputValueName} inputSelectedValue={inputValue} informParent={(type) => collectInputValue(type)} />
        <span className="OptionText">to</span>
        <Option disabled={(inputSubmitted && !inputReturned)} isInput={false} outputValue={outputValue} outputName={outputValueName} inputSelectedName={inputValueName} inputSelectedValue={inputValue} informParent={(type) => collectOutputValue(type)} />
      </div>
      <span className="ToolTitleText">Input:</span>
      <div className="InputContainer">
      { (inputValueName === "Youtube" || inputValueName === "Twitter")?
        <div className="InputArea">
          <input onInput={e => setInputContent(e.target.value)} value={inputContent} disabled={(inputSubmitted && !inputReturned)} onClick={() => clickedInput()} rows={1} className="InputTextArea" />
          <div onClick={() => submitInput()} className="InputFetchButton">
          {(inputSubmitted && !inputReturned)?

              (inputValueName === "Youtube")?
                <LoadingIcons.SpinningCircles style={{height: 20, left: -10}} stroke="rgba(255,255,255,0.75)" />
              :
              (inputValueName === "Blog")?
                <LoadingIcons.Grid style={{height: 20, left: -10}} />
              :
              (inputValueName === "Twitter")?
                <LoadingIcons.Circles style={{height: 20, left: -10}} />
              :
                <LoadingIcons.Bars style={{height: 20, left: -10}} />
            :
            <FontAwesomeIcon icon={solid('cloud-arrow-up')} style={{color: "white"}} />
          }
          </div>
        </div>
      :
        <div className="InputArea">
          <textarea onInput={e => setTextareaContent(e.target.value)} value={textareaContent} disabled={(inputSubmitted && !inputReturned)} onClick={() => clickedInput()} className="InputTextArea TextArea" style={(inputSubmitted || inputReturned)?{height: 50}:{}}>
          </textarea>
          <div onClick={() => submitInput()} className="InputFetchButton TextAreaVersion" style={(inputSubmitted || inputReturned)?{height: 74}:{}}>
            {(inputSubmitted && !inputReturned)?

                (inputValueName === "Youtube")?
                  <LoadingIcons.SpinningCircles style={{height: 20, left: -10}} />
                :
                (inputValueName === "Blog")?
                  <LoadingIcons.Grid style={{height: 20, left: -10}} />
                :
                (inputValueName === "Twitter")?
                  <LoadingIcons.Circles style={{height: 20, left: -10}} />
                :
                  <LoadingIcons.Bars style={{height: 20, left: -10}} />

              :
              <FontAwesomeIcon icon={solid('cloud-arrow-up')} style={{color: "white"}} />
            }
          </div>
        </div>

      }
      </div>
      <span className="ToolTitleText">Output:</span>
      <div className="OutputContainer">
        <div className="InputArea">
          <textarea accept-charset="UTF-8" value={outputText} onChange={onChangeOutputArea} disabled={(inputSubmitted && !inputReturned)} className="InputTextArea TextArea" style={(!outputHasReturned)?{height: 50}:{}}>
          </textarea>
          <div className="OutputButtonArea TextAreaVersion" style={(!outputHasReturned)?{height: 74}:{}}>
          {(outputHasReturned) &&
            <div className="OutputRating">
              <div onClick={() => rateOuput(1)} className="OutputRatingItem">
                <FontAwesomeIcon icon={solid('thumbs-up')} className={(outputRating === 1)?"ThumbsUpRatingSolid":"ThumbsUpRating"} style={{height: 20, marginBottom: 10}} />
              </div>
              <div onClick={() => rateOuput(-1)} className="OutputRatingItem">
                <FontAwesomeIcon icon={solid('thumbs-down')} className={(outputRating === -1)?"ThumbsDownRatingSolid":"ThumbsDownRating"} style={{height: 20, marginBottom: 10}} />
              </div>
              <div onClick={() => copyOutput()} className="OutputRatingItem">
                <FontAwesomeIcon icon={solid('copy')} className="CopyOutput" style={{height: 20}} />
              </div>
            </div>
          }
          </div>
        </div>
      </div>
      <div onClick={() => navigateToNewItem("new")} className="NewInputButton noselect">
        <FontAwesomeIcon icon={solid('plus')} style={{height: 20}} />
      </div>
    </div>
  );
}

export default Workspace;
