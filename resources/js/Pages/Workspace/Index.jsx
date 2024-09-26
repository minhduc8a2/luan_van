import React, { memo } from "react";
import SideBar from "./SideBar/SideBar";
import HeadBar from "./HeadBar";
import Panel from "./Panel/Panel";
import ChatArea from "./ChatArea/ChatArea";
import { useRef } from "react";
import Huddle from "./Huddle/Huddle";
import Event from "./Event";
import { makeStore } from "@/Store/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { setNotificationsCount } from "@/Store/activitySlice";
import { initMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";
import { setPanelWidth } from "@/Store/panelSlice";
import { setThreadWidth } from "@/Store/threadSlice";
import BrowseChannels from "./BrowseChannels/BrowseChannels";
import BrowseFiles from "./BrowseFiles/BrowseFiles";
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
            <NotificationPopup />
            <MediaModal />
        </Provider>
    );
}

function MainArea() {
    const { name: pageName } = useSelector((state) => state.page);
    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const { user: profile } = useSelector((state) => state.profile);
    const { rightWindowType } = useSelector((state) => state.windowType);
    switch (pageName) {
        case "normal":
            return (
                <>
                    <LeftWindow>
                        <Panel />
                    </LeftWindow>
                    <ChatArea />
                    {rightWindowType && (
                        <RightWindow>
                            {threadMessageId && rightWindowType == "thread" && (
                                <Thread />
                            )}
                            {profile && rightWindowType == "profile" && (
                                <Profile />
                            )}
                        </RightWindow>
                    )}
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
function NotificationPopup() {
    const notificationPopup = useSelector((state) => state.notificationPopup);
    const dispatch = useDispatch();

    return (
        <OverlaySimpleNotification
            show={notificationPopup}
            onClose={() => dispatch(setNotificationPopup(null))}
        >
            {notificationPopup?.type == "error" && (
                <h5 className="text-danger-400 text-lg">
                    {notificationPopup.message}
                </h5>
            )}
            {notificationPopup?.type == "" && (
                <h5 className=" text-lg">{notificationPopup.message}</h5>
            )}
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
