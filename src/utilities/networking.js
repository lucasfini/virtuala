const BASE_URL = "https://kilostudios.com/va/";

const CallOpenAPI = async (api, method, data) => {

  if(method === 'POST') {
    return fetch(`${BASE_URL}${api}`, {
      method: method,
      body: data
    })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
    });
  }
  else {
    return fetch(`${BASE_URL}${api}${data}`, {
      method: method
    })
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
    });
  }

}

const CallAPI = async (api, method, data) => {

  var authToken = localStorage.getItem("authToken");

  if(authToken == null || authToken == undefined || authToken == "loggedout"){
    window.location.href="/login";
  }

  if(method === 'POST') {
    return fetch(`${BASE_URL}${api}`, {
      method: method,
      headers: {
        'Authorization': `Bearer: ${authToken}`
      },
      body: data
    })
    .then((response) => {
      if(response.headers.get('Authorization')) {
        localStorage.setItem("authToken", response.headers.get('Authorization').substring(8));
      }
      return response;
    })
    .then((response) => {
      if(response.status === 401){
        //window.location.href="/login";
        throw Error("Unauthorized request.")
      }
      return response.json()
    })
    .then((data) => {
      return data;
    })
    .catch((e) => {
      console.log(e);
    });
  }
  else {
    return fetch(`${BASE_URL}${api}${data}`, {
      method: method,
      headers: {
        'Authorization': `Bearer: ${authToken}`
      }
    })
    .then((response) => {
     
      if(response.headers.get('Authorization')) {
     
        localStorage.setItem("authToken", response.headers.get('Authorization').substring(8));
      }
      return response;
    })
    .then((response) => {
      if(response.status === 401){
        //window.location.href="/login";
        throw Error("Unauthorized request.")
      }
      return response.json()
    })
    .then((data) => {
     
      return data;
    })
    .catch((e) => {
      console.log(e);
    });
  }


}

export {CallAPI, CallOpenAPI};
