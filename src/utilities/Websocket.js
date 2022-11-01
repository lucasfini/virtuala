var Stomp = require('@stomp/stompjs');
var SockJS = require('sockjs-client');
Object.assign(global, { WebSocket: require('websocket').w3cwebsocket });

const apiServer = "http://localhost:8048"; //Our Spring-Boot application's address

const stompConfig = {
    reconnectDelay: 1000,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0
}

stompConfig.webSocketFactory = () => {
  return new SockJS(
      apiServer + "/mws"
  );
};

let stompClient = new Stomp.Client(stompConfig);

const connectStomp = (setBackendMessage, conversionId) => {
  stompClient.onConnect = function(frame) {
    console.log("CONNECTED");
    stompClient.subscribe(`/conversions/${conversionId}`, (message) => {
        var dataFromServer = JSON.parse(message.body);
        setBackendMessage(dataFromServer);
    });
  }

  stompClient.onStompError = (frame) => {
    console.error(frame);
  };

  stompClient.onWebSocketError = (frame) => {
    console.error(frame);
  };

  stompClient.onWebSocketClose = (frame) => {
    console.info(frame);
  };

  stompClient.onDisconnect = (frame) => {
    console.info(frame);
  };

  //Small delay to prevent React from activating before being deactivated
  setTimeout(() => {
    stompClient.activate();
  }, 250);
}

const disconnectStomp = () => {
  stompClient.deactivate();
}

export {connectStomp, disconnectStomp};
