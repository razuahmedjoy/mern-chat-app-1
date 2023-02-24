import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./userContext";
import Avatar from "./utilities/Avatar";
import Logo from "./utilities/Logo";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId,setSelectedUserId] = useState(null)

  const { username,id } = useContext(UserContext);
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  const showOnlinePeople = (people) => {
    // console.log(people);
    const uniquePeople = {};
    people.forEach((person) => {
      if(person.userId !== id){
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
  };



  return (
    <div className="flex h-screen">
      <div className="bg-blue-50 w-1/3">

       <Logo/>
        {/* online users */}
        
        {Object.keys(onlinePeople).map((userId) => (
          <div key={userId} onClick={()=>setSelectedUserId(userId)} 
          className={`border-b border-b-gray-200 py-2  pl-4  flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors ease-in duration-150 p-2 ${userId === selectedUserId ? "bg-blue-100 border-l-4 border-l-blue-600":""}`}>
            
            <div className="flex gap-2 items-center">
              <Avatar userId={userId} username={onlinePeople[userId]} />
                <span className="text-gray-800 text-sm"> {onlinePeople[userId]}</span>
              
            </div>
          </div>
        ))}

      </div>

      <div className="flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">
          {/* chat messages */}

          {!selectedUserId && 
          <div className="flex h-full items-center justify-center">
            <div className="text-gray-400">&larr; Select a person to start messaging</div>
            </div>}
        </div>


        {/* chat input section */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="type your message here"
            className="bg-white flex-grow border p-2"
          />
          <button className="bg-blue-500 text-white p-2">
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
        </div>
      </div>
    </div>
  );
};

export default Chat;
