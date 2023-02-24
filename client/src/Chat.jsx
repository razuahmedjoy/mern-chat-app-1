import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./userContext";
import Avatar from "./utilities/Avatar";
import Logo from "./utilities/Logo";
import { useMediaQuery } from 'react-responsive';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  const [showSidebar,setShowSidebar] = useState(!isMobile);

  const divUnderMessageBox = useRef();

  console.log(isMobile)

  const { username, id } = useContext(UserContext);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

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
    } else if ("text" in messageData) {

     
      // console.log(messageData.id)
     
      setMessages((prev) => {
        console.log("prev ",prev)
        // set if messageData.id not in prev data 
        const alreadyExist = prev.find((message)=>message.id === messageData.id);
        if(!alreadyExist){

          return [...prev, messageData];
        }
        return [...prev];
        
     

        

      });
    }
  };

  // console.log(messages)
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessageText.trim() === "") {
      return;
    }
    const message = {
      recipient: selectedUserId,
      sender: id,
      text: newMessageText,
    };
    ws.send(JSON.stringify(message));
    setNewMessageText("");
    setMessages((prev) => [...prev, { ...message }]);
    
  

  };

  useEffect(() => {
    const div = divUnderMessageBox.current;
    if(div){
      div.scrollIntoView({ behavior: "smooth" });
    }

  }, [messages]);

  return (
    <div className="flex h-screen">
      <div className={`bg-blue-50 md:w-1/3 ${isMobile && "absolute h-full -left-52 transition-all ease-in duration-100"} ${isMobile && showSidebar && "left-0"}`}>
        <Logo />
        {/* online users */}

        {Object.keys(onlinePeople).map((userId) => (
          <div
            key={userId}
            onClick={() => {
              if(isMobile){
                setShowSidebar(false);
              }
              setSelectedUserId(userId);
            }}
            className={`border-b border-b-gray-200 py-2  pl-4  flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors ease-in duration-150 p-2 ${
              userId === selectedUserId
                ? "bg-blue-100 border-l-4 border-l-blue-600"
                : ""
            }`}
          >
            <div className="flex gap-2 items-center">
              <Avatar userId={userId} username={onlinePeople[userId]} />
              <span className="text-gray-800 text-sm">
                {" "}
                {onlinePeople[userId]}
              </span>
            </div>
          </div>
        ))}
      </div>


      {isMobile && (
        <div onClick={()=>setShowSidebar(!showSidebar)} className="absolute left-0 w-12 h-12 flex items-center text-center justify-center cursor-pointer rounded-full p-2">
      
            
            {/* three bar */}
            {!showSidebar ? 
            (  <svg
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
                key={index}
                className={`flex gap-2 p-2 ${
                  msg.sender === id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    msg.sender === id ? "bg-white rounded-br-none" : "rounded-bl-none bg-blue-600 text-white"
                  }`}
                >
                  {msg.text}
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
