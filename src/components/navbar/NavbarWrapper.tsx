"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";
import Navbar from "./Navbar";

/**
 * NavbarWrapper - A client component that wraps the Navbar with AppContext
 * This ensures the navbar uses the global handle state and impacts all pages
 */
const NavbarWrapper: React.FC = () => {
    const { handle, loadingUser, errorUser, setHandleAndFetch, clearUser } = useAppContext();

    return (
        <>
        <Navbar
            handle={handle ?? undefined}
            onHandleSubmit={setHandleAndFetch}
            onHandleClear={clearUser}
            userLoading={loadingUser}
        />
        {errorUser && <div role="alert" className="border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{errorUser}</div>}
        </>
    );
};

export default NavbarWrapper;
