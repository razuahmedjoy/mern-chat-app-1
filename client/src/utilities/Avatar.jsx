import React from "react";

const colors = ["bg-red-200", "bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-purple-200", "bg-pink-200", "bg-indigo-200", "bg-gray-200"];
const Avatar = ({ userId, username }) => {
  const userIdbase10 = parseInt(userId, 16);
  console.log(userIdbase10)
  const colorIndex = userIdbase10 % 8;
  console.log(colorIndex)
  const bgcolor = colors[colorIndex] || "bg-red-200";
  console.log(bgcolor);
  return (
    <div
      className={`w-8 h-8 flex justify-center items-center ${bgcolor} rounded-full`}
    >
      <div className="w-full text-center">{username[0]}</div>
    </div>
  );
};

export default Avatar;
