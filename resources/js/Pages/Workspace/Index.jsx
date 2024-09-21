import React from "react";
import SideBar from "./SideBar/SideBar";
import HeadBar from "./HeadBar";
import Panel from "./Panel/Panel";
import ChatArea from "./ChatArea/ChatArea";
import { useRef } from "react";
import Huddle from "./Huddle/Huddle";
import Event from "./Event";
import { makeStore } from "@/Store/store";
import { Provider, useSelector } from "react-redux";
import { setNotificationsCount } from "@/Store/activitySlice";
import { initMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";
import { setPanelWidth } from "@/Store/panelSlice";
import { setThreadWidth } from "@/Store/threadSlice";
import BrowseChannels from "./BrowseChannels/BrowseChannels";
import BrowseFiles from "./BrowseFiles/BrowseFiles";
export default function Index({
    newNoftificationsCount,
    channels,
    directChannels,
    messages,
}) {
    const storeRef = useRef();
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore();
        //update panel width in localStorage
        try {
            const panelWidth = parseInt(localStorage.getItem("panelWidth"));
            console.log(typeof panelWidth);
            if (Number.isInteger(panelWidth))
                storeRef.current.dispatch(setPanelWidth(panelWidth));
        } catch (error) {}
        try {
            const threadWidth = parseInt(localStorage.getItem("threadWidth"));
            console.log(typeof threadWidth);
            if (Number.isInteger(threadWidth))
                storeRef.current.dispatch(setThreadWidth(threadWidth));
        } catch (error) {}

        storeRef.current.dispatch(
            setNotificationsCount(newNoftificationsCount)
        );
        channels.forEach((channel) => {
            storeRef.current.dispatch(initMessageCountForChannel(channel));
        });
        directChannels.forEach((channel) => {
            storeRef.current.dispatch(initMessageCountForChannel(channel));
        });
    }
    return (
        <Provider store={storeRef.current}>
            <Event />
            <div className="client-container bg-primary-500 text-white ">
                <div className="client-headbar ">
                    <HeadBar />
                </div>
                <div className="client-sidebar ">
                    <SideBar />
                </div>

                <div className="client-workspace-container flex flex-nowrap   rounded-lg border border-white/5 border-b-2">
                    <MainArea />
                </div>
            </div>
            <Huddle />
        </Provider>
    );
}

function MainArea() {
    const { name: pageName } = useSelector((state) => state.page);
    switch (pageName) {
        case "normal":
            return (
                <>
                    <Panel />
                    <ChatArea />
                </>
            );
        case "browseChannels":
            return <BrowseChannels />;
        case "browseFiles":
            return <BrowseFiles />;
        default:
            return "";
    }
}
