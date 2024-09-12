import React from "react";
import SideBar from "./SideBar/SideBar";
import HeadBar from "./HeadBar";
import Panel from "./Panel/Panel";
import ChatArea from "./ChatArea/ChatArea";
import { useRef } from "react";
import Huddle from "./Huddle/Huddle";
import Event from "./Event";
import { makeStore } from "@/Store/store";
import { Provider } from "react-redux";
import { setActivity } from "@/Store/activitySlice";
import { initMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";
export default function Index({ notifications, channels }) {
    console.log(channels);
    const storeRef = useRef();
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore();
        storeRef.current.dispatch(setActivity(notifications));

        channels.forEach((channel) => {
            storeRef.current.dispatch(initMessageCountForChannel(channel));
        });
    }
    return (
        <Provider store={storeRef.current}>
            <Event />
            <div className="client-container bg-primary text-white ">
                <div className="client-headbar ">
                    <HeadBar />
                </div>
                <div className="client-sidebar ">
                    <SideBar />
                </div>

                <div className="client-workspace-container grid grid-cols-4  rounded-lg border border-white/5 border-b-2">
                    <Panel />
                    <ChatArea />
                </div>
            </div>
            <Huddle />
        </Provider>
    );
}
