// src/components/CustomButton.js
import React from "react";

function CustomButton({ type = "button", label, className, onClick }) {
  return (
    <button type={type} className={`btn ${className}`} onClick={onClick}>
      {label}
    </button>
  );
}

export default CustomButton;
