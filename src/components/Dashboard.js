import React, { useState, useEffect, useRef } from "react";

import "../App.css";
import "../fonts/stylesheet.css";
import Navbar from "../components/Navbar";
import { CallAPI } from "../utilities/networking";
import LoadingIcons from "react-loading-icons";
import toast, { Toaster } from "react-hot-toast";
import { render } from "@testing-library/react";


function Dashboard(props) {
  // State Variables
  const [user, setUser] = useState({});
  const [commands, setCommands] = useState([{}]);
  const [connectedServices, setConnectedServices] = useState([
    
    {
      serviceId: 1,
      serviceName: "Github",
      image: require("../images/github.png")
  
    },
    {
      serviceId: 2,
      serviceName: "Notion",
      image: require("../images/notion.png")
    },

    {
      serviceId: 3,
      serviceName: "Google",
      image: require("../images/google.jpg")
    },
    {
      serviceId: 4,
      serviceName: "Other",
      image: require("../images/other.png")
    }

  
  
  ]);
  const [SelectFields, setSelectField] = useState([{}]);
  const [makeup, setMakeup] = useState([]);
  const [commandTitle, setCommandTitle] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Boolean State Variables
  const [addCommandIsOpen, setAddCommandIsOpen] = useState(false);
  const [addConnectedServiceIsOpen, setAddConnectedServiceIsOpen] =useState(false);
  const [addEdit, setAddEdit] = useState(false);
  const [isCallingAPI, setIsCallingAPI] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);


  // References
  const addCommandRef = useRef(null);

  //1.  Grabs User data
  const makeRequest = async () => {
    const userContext = await CallAPI("gw/user/fetch", "POST", null);
    if (userContext.success) {
      setUser(JSON.parse(userContext.data));
    }

    // Fetches All User commands
    const userCommands = await CallAPI("gw/commands/fetch/all", "GET", "");
    if (userCommands.success) {
      setCommands(JSON.parse(userCommands.data));
      setSelectField([{}]);
      onCommandTitleChange("");
    }

    // Fetch Service Data
    const connectedServices = await CallAPI("gw/services/fetch/all", "GET", "");
    if (connectedServices.success) {
     // setConnectedServices(JSON.parse(connectedServices.data));
      console.log(JSON.parse(connectedServices.data));
    }
  

    const history = await CallAPI("gw/history/fetch", "GET", "");
    if (history.success) {
      console.log(history.data);
    }
  };
  // GET request for specific Command
  const makeIdRequest = async (id) => {
    const userMakeup = await CallAPI("gw/commands/fetch/" + id, "GET", "");
    var selectedFields = [];
    if (userMakeup.success) {
      console.log(userMakeup.data);
      setMakeup(JSON.parse(userMakeup.data));
      const make = JSON.parse(userMakeup.data).makeup.split(",");
      for (var j = 0; j < make.length; j++) {
        selectedFields.push(make[j]);
      }
      setSelectField(selectedFields);
    }

    setIsEditing(true);
  };

  //2. Create User Command
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
    onCommandTitleChange(makeup.commandName);
    toggleAddCommand(true);
    toggleEditCommand(true);

    // const resp = await CallAPI("/gw/commands/edit", "POST", fd);
  };

  // 3.1 Complete User Command Edit
  const completeEdit = async () => {
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
      commandId: makeup.commandId,
      commandName: document.getElementById("command_title").value,
      markup: markup,
    };

    var fd = new FormData();
    fd.append("commandName", body.commandName);
    fd.append("makeup", body.markup);
    fd.append("commandId", body.commandId);

    const resp = await CallAPI("/gw/commands/edit", "POST", fd);

    console.log(resp);

    if (resp.success) {
      toast(resp.message);
      makeRequest();
      toggleAddCommand(false);
    } else {
      if (resp.message == "Unauthorized.") {
        toast("Command cannot Edit");
      } else {
        toast(resp.message);
      }
    }
    setIsCallingAPI(false);
    setIsEditing(false);
  };

  //4. Delete User Commands
  const deleteUserCommand = async () => {
    if (isCallingAPI) {
      return;
    }

    setIsCallingAPI(true);

    var fd = new FormData();
    fd.append("commandId", makeup.commandId);

    const resp = await CallAPI("gw/commands/delete/", "POST", fd);

    if (resp.success) {
      toast(resp.message);
      makeRequest();
      toggleAddCommand(false);
    } else {
      if (resp.message == "Unauthorized.") {
        toast("Command cannot Delete");
      } else {
        toast(resp.message);
      }
    }

    makeRequest();

    toggleAddCommand(false);
    toggleEditCommand(false);
    toggleDeleteButton(false);
    setIsCallingAPI(false);
  };

  const addSelectField = () => {
    setSelectField((e) => [...e, { options: commands }]);
  };

  const onCommandTitleChange = (value) => {
    setCommandTitle(value);
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
      if (deleteClicked === true){
        toggleDeleteButton(false);
      }
      makeRequest();
      setAddCommandIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const toggleConnectedServices = (open) => {
    if (open) {
      setAddConnectedServiceIsOpen(true);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      makeRequest();
      setAddConnectedServiceIsOpen(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const toggleEditCommand = (open) => {
    if (open) {
      setAddEdit(true);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      setAddEdit(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const toggleDeleteButton = (open) => {
    if (open) {
      setDeleteClicked(true);
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      setDeleteClicked(false);
      document.removeEventListener("mousedown", handleClickOutside);
    }
  };

  const renderSelectedFields = () => {
    return SelectFields.map((data, index) => {
      return (
        <div className="col-2 p-0 m-2" key={index}>
          <select
            className="form-select m-2"
            id={"selectedOption-" + index}
            defaultValue={data}
     
          >
            {commands.map((dataCommands, indexCommands) => {
              return (
                <option
                  id={"option-" + indexCommands + "-" + dataCommands.commandId}
                  key={indexCommands}
                 className="m-2"
                  value={dataCommands.commandId}
                >
                  {dataCommands.commandName}
                </option>
              );
            })}
          </select>
        </div>
      );
    });
  };

  const renderCommandList = () => {
    return commands.filter((val)=> {
      if (searchInput == ""){
        return val
      }else if (val.commandName.toLowerCase().includes(searchInput.toLowerCase())){
        return val
      }
    }).map((data, index) => {
      return (
        <div className="col-2 d-flex align-items-center" key={index}>
          <button
            onClick={() => makeIdRequest(data.commandId)}
            id={"commandButton-" + index}
            type="button"
            className="DashboardPageCommandButton p-2 "
          >
            {data.commandName}
          </button>
        </div>
      );
    });
  };

  const renderConnectedServices = () => {
    return connectedServices.map((data, index) => {
      return (
        <div className="col-2 d-flex align-items-center" key={index}>
          <button
            id={"serviceButton-" + index}
            type="button"
            className= 'DashboardPageCommandButton'
          >
            <img className="DashboardServicesImg" src={data.image}></img>
            {data.serviceName}
          </button>
        </div>
      );
    });
  };


  useEffect(() => {
    makeRequest();
  }, []);

  useEffect(() => {
    if (isEditing == true) {
      editUserCommand();
    }
  }, [makeup]);

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
        {!addCommandIsOpen && !addConnectedServiceIsOpen && (
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 d-flex align-items-center ">
                <span className="DashboardPageTitle m-2">Commands </span>
                <button
                  onClick={() => toggleAddCommand(true)}
                  className=" noselect DashboardPageCommandButton"
                >
                  +
                </button>
              </div>
            </div>
            <div className="row align-items-center">
              <div className="col-4 d-flex align-items-center ">
                <input
                  type="text"
                  className="m-2 input-group-text "
                  placeholder="Search here"
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
            </div>
            <div className="row align-items-center">{renderCommandList()}</div>
            <div className="row align-items-center">
              <div className="col-12 d-flex align-items-center">
                <span className="DashboardPageTitle m-3">
                  Connected Services{" "}
                </span>
              </div>
            </div>
            <div className="row align-items-center">
              {renderConnectedServices()}
            </div>
          </div>
        )}
        {addConnectedServiceIsOpen && (
          <div>
              
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
                  className="DashboardInput input-group-text "
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
              {deleteClicked && (
               <div className="d-flex align-items-center justify-content-between  alert alert-danger m-2" role="alert">
              Are you sure you want to delete this command?
              <div> 
              <button className="btn btn-danger m-2 " onClick={() => deleteUserCommand()}> Yes </button>
              <button className="btn btn-success m-2 " onClick={() => toggleDeleteButton(false)}> No </button>
            </div>
             </div>
              )}
              <div className="col-12">
                <div className="AccountPageButtonContainer">
                  {addEdit && (
                    <div
                      onClick={() => toggleDeleteButton(true)}
                      className="DashboardPageButton noselect"
                    >
                      Delete
                    </div>
                  )}
                  <div
                    onClick={ () => toggleAddCommand(false)}
                    className="DashboardPageButton noselect"
                  >
                    Cancel
                  </div>
                  {addEdit && (
                    <div
                      onClick={() => completeEdit()}
                      className="DashboardPageButton noselect"
                    >
                      {isCallingAPI ? (
                        <LoadingIcons.TailSpin
                          stroke="#fff"
                          fill="#fff"
                          style={{ height: 18 }}
                        />
                      ) : (
                        "Edit"
                      )}
                    </div>
                  )}
                  {!addEdit && (
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
                  )}
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
