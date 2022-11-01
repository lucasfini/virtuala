import React, { useEffect, useState, useRef } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro' // <-- import styles to be used
import LoadingIcons from 'react-loading-icons'

import HistoryItem from './HistoryItem'
import { CallAPI } from '../utilities/networking';

function History(props) {
  const listInnerRef = useRef(null);

  const [historicalItems, setHistoricalItems] = useState([]);
  const [page, setPage] = useState(0);
  const [callingHistoryAPI, setCallingHistoryAPI] = useState(false);
  const [pageLength, setPageLength] = useState(10);

  const makeRequest = async (force) => {
    if((callingHistoryAPI || pageLength < 10) && (force === undefined)){
      return;
    }
    setCallingHistoryAPI(true);
    let resp;
    if(force === true){
      resp = await CallAPI("/gw/history/fetch", "GET", `?page=0`);
    }
    else{
      resp = await CallAPI("/gw/history/fetch", "GET", `?page=${page}`);
    }

    if(resp.success){
      var data = JSON.parse(resp.data);
      if(page === 0 || force === true){
        setHistoricalItems(data);
      }
      else{
        setHistoricalItems([...historicalItems, ...data]);
      }
      setPageLength(data.length)
    }
    if(force === true){
      setPage(1);
    }
    else{
      setPage(page+1);
    }
    setCallingHistoryAPI(false);
  }

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight) {
        makeRequest();
      }
    }
  };

  useEffect(() => {
    makeRequest();
  }, []);

  useEffect(() => {
    //Check if can convert to pre-selected
    if(props.refetchHistory) {
      makeRequest(true);
      props.refetchedHistory();
    }

  }, [props])

  const renderHistory = () => {
    return historicalItems.map((item) => {
      var split = item.conversionType.split("-");
      var from = split[0].charAt(0).toUpperCase() + split[0].slice(1);
      var to = split[1].charAt(0).toUpperCase() + split[1].slice(1);
      return (
        <HistoryItem key={item.conversionId} id={item.conversionId} from={from} to={to} input={item.conversionInput} />
      )
    })
  }

  return (
    <div ref={listInnerRef} onScroll={() => onScroll()} className="HistoryBar container">
      <div className="HistoryTitleContainer">
        <span className="HistoryTitle noselect">
          <FontAwesomeIcon icon={solid('clock-rotate-left')} style={{fontSize: 18, marginRight: 5}} /> History
        </span>
      </div>
      <div className="HistoryItemContainer">
        {renderHistory()}
        {callingHistoryAPI &&
          <div style={{height: 50, width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <LoadingIcons.TailSpin stroke="#000" fill="#000" style={{height: 30}} />
          </div>}
      </div>
      {(pageLength == 10) && <div className="LoadMoreButtonContainer"><div onClick={() => makeRequest()} className="LoadMoreButton noselect">Load More</div></div>}
    </div>
  );
}

export default History;
