// src/common/HamburgerMenu.jsx
import React from "react";
import "./HamMenu.css";

export default function HamburgerMenu({ open, onClick }) {
    return (
        <button
            className={`hamburger-btn ${open ? "open" : ""}`}
            onClick={onClick}
            aria-label="메뉴 열기"
            type="button"
        >
            <span className="bar"></span>
            <span className="bar"></span>
        </button>
    );
}
