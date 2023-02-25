import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./userContext";
import Avatar from "./utilities/Avatar";
import Logo from "./utilities/Logo";
import { useMediaQuery } from 'react-responsive';
import { axiosInstance } from "./utilities/axiosInstance";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const divUnderMessageBox = useRef();


  const { username, id, setId, setUsername } = useContext(UserContext);

  useEffect(() => {

    connectToWs();

  }, []);


  const connectToWs = () => {
    const ws = new WebSocket("ws://localhost:4000");

    setWs(ws);

    ws.addEventListener("message", handleMessage);

    ws.addEventListener("close", () => {
      console.log("closed connection")
      setTimeout(() => {
        console.log("Trying to reconnect...")
        connectToWs();
      }, 2000);
    })

  }

  const showOnlinePeople = (people) => {
    // console.log(people);
    const uniquePeople = {};
    people.forEach((person) => {
      if (person.userId !== id) {
        uniquePeople[person.userId] = person.username;
      }
    });

    setOnlinePeople(uniquePeople);
  };

  const handleMessage = (e) => {

    const messageData = JSON.parse(e.data);

    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    }

    else if ("text" in messageData) {

      // console.log(messageData.sender);
      // console.log(selectedUserId);
      // console.log(messageData.sender === selectedUserId)

      if(messageData.sender === selectedUserId){
        setMessages((prev) => {
          // console.log("prev ", prev)
          // set if messageData.id not in prev data 
          console.log(messageData.sender);
          console.log(selectedUserId)
          const alreadyExist = prev.find((message) => message._id === messageData._id);
          if (!alreadyExist) {
  
            return [...prev, messageData];
          }
          return [...prev];
  
  
        });

      }
      
    }
  };

  // console.log(messages)

  const sendMessage = (e, file = null) => {
    if (e) e.preventDefault();

    if (newMessageText.trim() === "" && !file) {
      return;
    }
    const message = {
      recipient: selectedUserId,
      sender: id,
      text: newMessageText,
      file
    };
    ws.send(JSON.stringify(message));


    console.log("from outside file")
    if (file) {
      console.log("from inside file")

      axiosInstance.get(`/messages/${selectedUserId}`).then(res => {
        const { data } = res
        if (res.status === 200) {
          setMessages(data);
        }

      })
    } else {
      setMessages((prev) => [...prev, { recipient: selectedUserId, sender: id, text: newMessageText, _id: Date.now() }]);
    }
    setNewMessageText("");



  };

  const logout = async () => {
    const res = await axiosInstance.post("/auth/logout");

    if (res.data.success === true) {
      setWs(null)
      setId(null);
      setUsername(null);
    }
  }

  const sendFile = async (e) => {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = async () => {
      sendMessage(null, {
        data: reader.result,
        name: e.target.files[0].name,
      })
    }
  }

  useEffect(() => {
    const div = divUnderMessageBox.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth" });
    }

  }, [messages]);

  // show all users
  useEffect(() => {
    axiosInstance.get("/people").then((res) => {
      const { data } = res;
      const offline = data.filter((user) => user._id !== id).filter((user) => !Object.keys(onlinePeople).includes(user._id));

      setOfflinePeople(offline);


    })
  }, [onlinePeople])

  useEffect(() => {
    if (selectedUserId) {
      axiosInstance.get(`/messages/${selectedUserId}`).then(res => {
        const { data } = res
        if (res.status === 200) {
          setMessages(data);
        }


      }).catch(err => {
        console.log("printed from error.")
        if (err?.response?.data?.message === 'jwt expired') {
          // alert('Your session has expired. Please login again')
          setWs(null)
          setId(null);
          setUsername(null);
        }
      })

    }
  }, [selectedUserId])

  return (
    <div className="flex h-screen">
      <div className={`bg-blue-50 md:w-1/3 flex flex-col ${isMobile && "absolute h-full -left-52 transition-all ease-in duration-100"} ${isMobile && showSidebar && "left-0"}`}>
     
        <div className="flex-grow">
          
          <Logo />
          
          {/* online users */}

          {Object.keys(onlinePeople).map((userId) => (
            <div
              key={userId}
              onClick={() => {
                if (isMobile) {
                  setShowSidebar(false);
                }
                setSelectedUserId(userId);
              }}
              className={`border-b border-b-gray-200 py-2  pl-4  flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors ease-in duration-150 p-2 ${userId === selectedUserId
                ? "bg-blue-100 border-l-4 border-l-blue-600"
                : ""
                }`}
            >
              <div className="flex gap-2 items-center">
                <Avatar online={true} userId={userId} username={onlinePeople[userId]} />
                <span className="text-gray-800 text-sm">
                  {" "}
                  {onlinePeople[userId]}
                </span>
              </div>
            </div>
          ))}

          {/* offline users */}
          {offlinePeople.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                if (isMobile) {
                  setShowSidebar(false);
                }
                setSelectedUserId(user._id);
              }}
              className={`border-b border-b-gray-200 py-2  pl-4  flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors ease-in duration-150 p-2 ${user._id === selectedUserId
                ? "bg-blue-100 border-l-4 border-l-blue-600"
                : ""
                }`}
            >
              <div className="flex gap-2 items-center">
                <Avatar online={false} userId={user._id} username={user.username} />
                <span className="text-gray-800 text-sm">
                  {" "}
                  {user.username}
                </span>
              </div>
            </div>
          ))}

        </div>

        <div className="p-2 text-center">
        hi, {username}
          <button
            onClick={logout}
            className="text-sm text-red-600 bg-red-100 py-2 px-3">Log Out</button>

            
        </div>


      </div>


      {isMobile && (
        <div onClick={() => setShowSidebar(!showSidebar)} className="absolute left-0 w-12 h-12 flex items-center text-center justify-center cursor-pointer rounded-full p-2">


          {/* three bar */}
          {!showSidebar ?
            (<svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>)
            :
            (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )
          }







        </div>
      )}


      <div className={`flex flex-col bg-blue-100 w-full md:w-2/3 p-2 ${isMobile &&
        "w-full"}`}>
        <div className="flex-grow overflow-auto">
          {/* chat messages */}

          {!selectedUserId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-400">
                &larr; Select a person to start messaging
              </div>
            </div>
          )}
          {selectedUserId &&
            messages.map((msg, index) => (
              <div
                key={msg._id}
                className={`flex gap-2 p-2 ${msg.sender === id ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`p-2 rounded-lg ${msg.sender === id ? "bg-white rounded-br-none" : "rounded-bl-none bg-blue-600 text-white"
                    }`}
                >
                  {msg.text}
                  {msg.file && (
                    <div className="flex gap-2 items-center">

                      <a className="flex items-center gap-1 border-b" href={axiosInstance.defaults.baseURL + "/uploads/" + msg.file}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                        {msg.file}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          <div ref={divUnderMessageBox}></div>
        </div>

        {/* chat input section */}
        {selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>

            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              placeholder="type your message here"
              className="bg-white flex-grow border p-2"
            />

            <label className="p-2 cursor-pointer bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 text-gray-400">
              <input type="file" name="" id="" className="hidden" onChange={sendFile} />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>

            </label>

            <button type="submit" className="bg-blue-500 text-white p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
