import React, { memo } from "react";
import SideBar from "./SideBar/SideBar";
import HeadBar from "./HeadBar";
import Panel from "./Panel/Panel";

import { useRef } from "react";
import Huddle from "./Huddle/Huddle";
import Event from "./Event";
import { makeStore } from "@/Store/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { setNotificationsCount } from "@/Store/activitySlice";
import { initMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";
import OverlaySimpleNotification from "@/Components/Overlay/OverlaySimpleNotification";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import { setMedia } from "@/Store/mediaSlice";
import Image from "@/Components/Image";
import Video from "@/Components/Video";
import Thread from "./ChatArea/Thread";
import RightWindow from "./RightWindow";
import { setLeftWindowWidth, setRightWindowWidth } from "@/Store/sizeSlice";
import LeftWindow from "./LeftWindow";
import Profile from "./Profile/Profile";
import Activity from "./Activity/Activity";
import { usePage } from "@inertiajs/react";
import { setLeftWindowType } from "@/Store/windowTypeSlice";
export default function Layout({ children }) {
    const { newNoftificationsCount, channels, directChannels, channel } =
        usePage().props;
    const storeRef = useRef();
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = makeStore();
        //update panel width in localStorage
        try {
            const leftWindowWidth = parseInt(
                localStorage.getItem("leftWindowWidth")
            );
            console.log(typeof leftWindowWidth);
            if (Number.isInteger(leftWindowWidth))
                storeRef.current.dispatch(setLeftWindowWidth(leftWindowWidth));
        } catch (error) {}

        try {
            const rightWindowWidth = parseInt(
                localStorage.getItem("rightWindowWidth")
            );
            console.log(typeof rightWindowWidth);
            if (Number.isInteger(rightWindowWidth))
                storeRef.current.dispatch(
                    setRightWindowWidth(rightWindowWidth)
                );
        } catch (error) {}
        storeRef.current.dispatch(
            setNotificationsCount(newNoftificationsCount)
        );
        if (channel) {
            storeRef.current.dispatch(setLeftWindowType("panel"));
        }
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
                    <MainArea>{children}</MainArea>
                </div>
            </div>
            <Huddle />
            <NotificationPopup />
            <MediaModal />
        </Provider>
    );
}

function MainArea({ children }) {
    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const { user: profile } = useSelector((state) => state.profile);
    const { rightWindowType, leftWindowType } = useSelector(
        (state) => state.windowType
    );
    let mainWindow = "";
    // switch (pageName) {
    //     case "browseChannels":
    //         mainWindow = <BrowseChannels />;
    //         break;
    //     case "browseFiles":
    //         mainWindow = <BrowseFiles />;
    //         break;
    //     default:
    //         mainWindow = <ChatArea />;
    //         break;
    // }
    return (
        <>
            {leftWindowType && (
                <LeftWindow>
                    {leftWindowType == "panel" && <Panel />}
                    {leftWindowType == "activity" && <Activity />}
                </LeftWindow>
            )}
            {children}
            {rightWindowType && (
                <RightWindow>
                    {threadMessageId && rightWindowType == "thread" && (
                        <Thread />
                    )}
                    {profile && rightWindowType == "profile" && <Profile />}
                </RightWindow>
            )}
        </>
    );
}
function NotificationPopup() {
    const { type, messages } = useSelector((state) => state.notificationPopup);
    const dispatch = useDispatch();

    return (
        <OverlaySimpleNotification
            show={type}
            onClose={() => dispatch(setNotificationPopup(null))}
        >
            <ul className="gap-y-2 flex flex-col">
                {messages.map((message) => (
                    <li
                        className={`${
                            type == "error" ? "text-danger-400" : ""
                        } text-lg`}
                        key={message}
                    >
                        {message}
                    </li>
                ))}
            </ul>
        </OverlaySimpleNotification>
    );
}
const MediaModal = memo(function MediaModal() {
    const { url, type, name } = useSelector((state) => state.media);
    const dispatch = useDispatch();
    switch (type) {
        case "image": {
            return (
                <div className="">
                    {url && (
                        <Image
                            fullScreenMode
                            url={url}
                            name={name}
                            onFullScreenClose={() => dispatch(setMedia({}))}
                        />
                    )}
                </div>
            );
        }
        case "video": {
            return (
                <div>
                    {url && (
                        <Video
                            src={url}
                            fullScreenMode
                            onFullScreenClose={() => dispatch(setMedia({}))}
                        />
                    )}
                </div>
            );
        }
        default:
            return "";
    }
});
