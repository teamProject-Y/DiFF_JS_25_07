import React from "react";
import "./overlayMenu.css";
import {motion} from "framer-motion";
import HamburgerButton from "@/common/HamMenu";
import Link from "next/link";

function AnimatedMenuItem({num, label, outline}) {
    return (
        <motion.div
            className="menu-row"
            initial={{opacity: 0, x: -60}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.4}}
            whileHover={{
                scale: 1.10,
                // color: "#ffd600",
                // textShadow: "0 0 8px #fff"
            }}
        >
            <span className="menu-num">{num}</span>
            <span className={`menu-item${outline ? " menu-outline" : ""}`}>{label}</span>
        </motion.div>
    );
}

function OverlayMenu({open, onClose, userEmail, blogName}) {
    if (!open) return null;
    return (
        <div className="overlay-menu">
            <div className="overlay-box">
                <div className="overlay-left">
                    <Link href="/">
                        <AnimatedMenuItem num="0001" label="DOCS"/></Link>
                    <Link href="/DiFF/docs/intro">
                        <AnimatedMenuItem num="0010" label="CONTACT"/></Link>
                    <Link href="/@modal/(..)DiFF/member/login">
                        <AnimatedMenuItem num="0011" label="START"/></Link>
                    <Link href="/DiFF/member/profile">
                        <AnimatedMenuItem num="0100" label="MYPAGE"/>
                    </Link>
                </div>
                <div className="overlay-right">
                    <div>
                        <div className="info-title">EMAIL</div>
                        <div className="info-desc">{userEmail}</div>
                    </div>
                    <div style={{marginTop: 32}}>
                        <div className="info-title">VLOG</div>
                        <div className="info-desc">VLOG</div>
                    </div>
                </div>
                <div className="fixed right-6 bottom-6 flex flex-col items-end gap-4 z-50">
                    <HamburgerButton open={true} onClick={onClose}/>
                </div>
            </div>
        </div>
    );
}

export default OverlayMenu;
