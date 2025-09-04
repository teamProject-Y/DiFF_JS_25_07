import React, { useState } from "react";
import HamburgerButton from "@/common/hamMenu";
import OverlayMenu from "@/common/overlayMenu";

export default function MenusWrapper({ userEmail, blogName }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <HamburgerButton open={open} onClick={() => setOpen(v => !v)} />
            <OverlayMenu
                open={open}
                onClose={() => setOpen(false)}
                userEmail={userEmail}
                blogName={blogName}
            />
        </>
    );
}
