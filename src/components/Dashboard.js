import React, { useState, useEffect, useRef } from "react";

import "../App.css";
import "../fonts/stylesheet.css";
import Navbar from "../components/Navbar";
import { CallAPI } from "../utilities/networking";
import LoadingIcons from "react-loading-icons";
import toast, { Toaster } from "react-hot-toast";
import { render } from "@testing-library/react";

function Dashboard(props) {
  const [user, setUser] = useState({});
  const [commands, setCommands] = useState([{}]);
  const [SelectFields, setSelectField] = useState([{}]);
  const [addCommandIsOpen, setAddCommandIsOpen] = useState(false);
  const [makeup, setMakeup] = useState([]);
  const [addDeleteButton, setAddDeleteButton] = useState(false);
  const [isCallingAPI, setIsCallingAPI] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [commandTitle, setCommandTitle] = useState("");
  const addCommandRef = useRef(null);


  //1.  Grabs User data
  const makeRequest = async () => {
    const userContext = await CallAPI("gw/user/fetch", "POST", null);
    if (userContext.success) {
      setUser(JSON.parse(userContext.data));
    }

    const userCommands = await CallAPI("gw/commands/fetch/all", "GET", "");
    if (userCommands.success) {
      setCommands(JSON.parse(userCommands.data));
      setSelectField([{ options: JSON.parse(userCommands.data) }]);
    }

  };

  const makeIdRequest = async (id) =>{
   
   
    const userMakeup = await CallAPI("gw/commands/fetch/" + id, "GET", "");
    if (userMakeup.success) {
      console.log(userMakeup.data);
        setMakeup(JSON.parse(userMakeup.data));
        const make = (JSON.parse(userMakeup.data).makeup.split(','));
        for (var j = 1; j < make.length; j++) {
          setSelectField((e) => [...e, { options: commands }]);
        }
  }

  setIsEditing(true);


}

  //2. Create command Function
  const createUserCommands = async () => {
    var markup = "";

    if (isCallingAPI) {
      return;
    }

    setIsCallingAPI(true);

    for (var x = 0; x < SelectFields.length; x++) {
      var pickedOption = document.getElementById("selectedOption-" + x).value;
      markup += pickedOption + ",";
    }
    markup = markup.slice(0, -1);

    var body = {
      commandName: document.getElementById("command_title").value,
      markup: markup,
    };

    var fd = new FormData();
    fd.append("commandName", body.commandName);
    fd.append("makeup", body.markup);

    const resp = await CallAPI("/gw/commands/create", "POST", fd);

    console.log(resp);

    if (resp.success) {
      toast(resp.message);
      makeRequest();
      toggleAddCommand(false);
    } else {
      if (resp.message == "Unauthorized.") {
        toast("Command cannot created");
      } else {
        toast(resp.message);
      }
    }
    setIsCallingAPI(false);
  };

  //3.  Edit Command Function
  const editUserCommand = () => {
    if (isCallingAPI) {
      return;
    }
    setIsCallingAPI(true);
    onCommandTitleChange(makeup.commandName);
    toggleAddCommand(true);
    toggleDeleteCommand(true);
    for (var i = 0; i < SelectFields.length; i++) {
 
      console.log( document.getElementById("selectedOption-0"));
      for (var j = 0; j < SelectFields[0].options.length; j++) {
       //   document.getElementById("selectedOption-" + i).options.item(j).setAttribute("selected",'selected');
        
      }
    

  }
    setIsEditing(false);
    setIsCallingAPI(false);
    // const resp = await CallAPI("/gw/commands/edit", "POST", fd);
  };

  const addSelectField = () => {
    setSelectField((e) => [...e, { options: commands }]);
  };

  const onCommandTitleChange = (value) => {
    setCommandTitle(value);
  };

  const onSetMakeup = (value) => {
    setMakeup((e) => [...e, { options: value }]);
  };

  const completeEdit = async (makeup) => {};

  const deleteUserCommand = async () => {
    if (isCallingAPI) {
      return;
    }

    setIsCallingAPI(true);
    var commandId = localStorage.getItem("id");

    var fd = new FormData();
    fd.append("commandId", commandId);

    const userDelete = await CallAPI("gw/commands/delete/", "POST", fd);
    if (userDelete.success) {
      makeRequest();
      toggleAddCommand(false);
      toggleDeleteCommand(false);
    }

    setIsCallingAPI(false);
  };

  const removeoptionFields = (index) => {
    const rows = [...SelectFields];
    rows.splice(index, 1);
    setSelectField(rows);
  };

  const handleClickOutside = (event) => {
    if (
      addCommandRef.current &&
      !addCommandRef.current.contains(event.target)
    ) {
      setAddCommandIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const toggleAddCommand = (open) => {
    if (open) {
      setAddCommandIsOpen(true);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      makeRequest();
      setAddCommandIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const toggleDeleteCommand = (open) => {
    if (open) {
      setAddDeleteButton(true);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      setAddDeleteButton(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const renderSelectedFields = () => {


    return SelectFields.map((data, index) => {
      return (
        <div className="col-2 p-0" key={index}>
          <select className="form-select" id={"selectedOption-" + index}>
            {SelectFields[index].options.map((data, index) => {
              return (
                <option
                  id={"option-" + index}
                  key={index}
                  value={data.commandId}
                >
                  {data.commandName}
                </option>
              );
            })}
          </select>
        </div>
      );
    });
  };

  useEffect(() => {
    makeRequest();
    
  }, []);


  useEffect(() =>{
   console.log(makeup);
   console.log(SelectFields);

    if (isEditing == true)
    {
      editUserCommand();
    }



  },[makeup]);

  return (
    <div className="App">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "white",
            color: "black",
            fontFamily: "lorettomedium",
          },
        }}
      />
      <Navbar isAccount name={user.firstname + " " + user.lastname} />
      <div className="DashboardPage">
        {!addCommandIsOpen && (
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 d-flex align-items-center ">
                <span className="DashboardPageTitle m-3">Commands </span>
                <span
                  onClick={() => toggleAddCommand(true)}
                  className="DashboardPageButtonPlus noselect"
                >
                  +
                </span>
              </div>
            </div>
            <div className="row align-items-center">
              {commands.map((data, index) => {
                return (
                  <div className="col-2 d-flex align-items-center" key={index}>
                    <button
                      onClick={() => makeIdRequest(data.commandId)}
                      id={"commandButton-" + index}
                      type="button"
                      className="DashboardPageCommandButton "
                    >
                      {data.commandName}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="row">
              <div className="col-12">
                <span className="DashboardPageTitle"> Connected Services</span>
              </div>
            </div>
          </div>
        )}

        {addCommandIsOpen && (
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12">
                <span className="DashboardPageLargeTitle noselect">Create</span>
              </div>

              <div className="col-12 align-self-end">
                <span
                  style={{
                    whitespace: "nowrap",
                  }}
                  className="DashboardPageMediumTitle noselect"
                >
                  When I say ...
                </span>
              </div>
              <div className="col-12">
                <input
                  id="command_title"
                  name="command_title"
                  value={commandTitle}
                  onChange={(e) => onCommandTitleChange(e.target.value)}
                  placeholder={"Command Title"}
                  className="DashboardInput"
                ></input>
              </div>
              <div className="col-12">
                <span
                  style={{ whitespace: "nowrap" }}
                  className="DashboardPageMediumTitle noselect"
                >
                  do...
                </span>
              </div>
              <div className="row ">
                <div className="col-10 d-flex ">{renderSelectedFields()}</div>
                <div className="col-1 p-0">
                  <button onClick={addSelectField} className="btn btn-light">
                    +
                  </button>
                </div>

                <div className="col-1 p-0">
                  {SelectFields.length !== 1 ? (
                    <button
                      onClick={removeoptionFields}
                      className="btn btn-light"
                    >
                      -
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="AccountPageButtonContainer">
                  {addDeleteButton && (
                    <div
                      onClick={() => deleteUserCommand()}
                      className="DashboardPageButton noselect"
                    >
                      Delete
                    </div>
                  )}
                  <div
                    onClick={() => toggleAddCommand(false)}
                    className="DashboardPageButton noselect"
                  >
                    Cancel
                  </div>
                  <div
                    onClick={() => createUserCommands()}
                    className="DashboardPageButton noselect"
                  >
                    {isCallingAPI ? (
                      <LoadingIcons.TailSpin
                        stroke="#fff"
                        fill="#fff"
                        style={{ height: 18 }}
                      />
                    ) : (
                      "Confirm"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
