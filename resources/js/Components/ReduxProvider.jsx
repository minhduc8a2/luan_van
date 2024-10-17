import { makeStore } from "@/Store/store";
import React, { useRef } from "react";
import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
export default function ReduxProvider() {
    const storeRef = useRef();
    if (!storeRef.current) {
        console.log("store created");
        storeRef.current = makeStore();
    }

    return (
        <Provider store={storeRef.current}>
            <Outlet />
        </Provider>
    );
}
