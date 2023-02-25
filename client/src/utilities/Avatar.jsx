import React from "react";

const colors = ["bg-red-200", "bg-blue-200", "bg-green-200", "bg-pink-200", "bg-orange-200", "bg-purple-200", "bg-indigo-200", "bg-gray-200"];
const Avatar = ({ userId="", username="", online }) => {
  const userIdbase10 = parseInt(userId, 16);

  const colorIndex = username.length > 7 ? username.length % 8 : username.length;

  const bgcolor = colors[colorIndex];

  return (
    <div
      className={`w-8 h-8 flex relative justify-center items-center ${bgcolor} rounded-full`}
    >

      <div className="w-full text-center">{username[0]}</div>
      <div className={`absolute w-3 h-3 ${online ? "bg-green-500" :"bg-gray-400"} bottom-0 right-0 rounded-full border border-white shadow shadow-white`}></div>
      
    </div>
  );
};

export default Avatar;
