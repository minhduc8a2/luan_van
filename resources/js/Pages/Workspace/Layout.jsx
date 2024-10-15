import React, { memo, useEffect, useState } from "react";
import SideBar from "./SideBar/SideBar";
import HeadBar from "./HeadBar";
import Panel from "./Panel/Panel";

import { useRef } from "react";
import Huddle from "./Huddle/Huddle";
import Event from "./Event";
import { makeStore } from "@/Store/store";
import { Provider, useDispatch, useSelector } from "react-redux";

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
import InitData from "./InitData";
import { Outlet, useParams } from "react-router-dom";
import { setIsOnline } from "@/Store/isOnlineSlice";
import CustomedDialog from "@/Components/CustomedDialog";
import LoadingSpinner from "@/Components/LoadingSpinner";
import { IoMdCloudDownload } from "react-icons/io";
export default function Layout() {
    const { channelId } = useParams();

    const storeRef = useRef();
    if (!storeRef.current) {
        console.log("store created");
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

        if (channelId) {
            storeRef.current.dispatch(setLeftWindowType("panel"));
        }
    }
    useEffect(() => {
        const handleOnline = () => {
            console.log("You are online");
            storeRef.current.dispatch(setIsOnline({ isOnline: true }));
        };
        const handleOffline = () => {
            console.log("You are offline");
            storeRef.current.dispatch(setIsOnline({ isOnline: false }));
        };

        Echo.connector.pusher.connection.bind("connected", handleOnline);
        Echo.connector.pusher.connection.bind("disconnected", handleOffline);
        Echo.connector.pusher.connection.bind("unavailable", handleOffline);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            Echo.connector.pusher.connection.unbind("connected", handleOnline);
            Echo.connector.pusher.connection.unbind(
                "disconnected",
                handleOffline
            );
            Echo.connector.pusher.connection.unbind(
                "unavailable",
                handleOffline
            );
        };
    }, []);
    return (
        <Provider store={storeRef.current}>
            <Wrapper>
                <Outlet />
            </Wrapper>
        </Provider>
    );
}

function Wrapper({ children }) {
    const [loaded, setLoaded] = useState(false);
    return (
        <>
            <InitData loaded={loaded} setLoaded={(value) => setLoaded(value)} />
            {loaded && (
                <>
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
                </>
            )}
        </>
    );
}

function MainArea({ children }) {
    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const { userId: profile } = useSelector((state) => state.profile);
    const { rightWindowType, leftWindowType } = useSelector(
        (state) => state.windowType
    );

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
    const { type, messages, title } = useSelector(
        (state) => state.notificationPopup
    );
    const dispatch = useDispatch();
    let color;
    switch (type) {
        case "error":
            color = "text-danger-400";
            break;
        case "success":
            color = "text-blue-400";
            break;
        default:
            color = "";
            break;
    }
    return (
        <CustomedDialog
            isOpen={!!type}
            onClose={() => dispatch(setNotificationPopup(null))}
        >
            <CustomedDialog.Title>
                {title ? title : "Notifications"}
            </CustomedDialog.Title>
            <ul className="gap-y-2 flex  flex-col">
                {messages.map((message, index) => (
                    <li className={`${color} text-lg`} key={index}>
                        {message}
                    </li>
                ))}
            </ul>
            <CustomedDialog.CloseButton />
        </CustomedDialog>
    );
}
const MediaModal = memo(function MediaModal() {
    const { url, type, name } = useSelector((state) => state.media);
    const { publicAppUrl } = useSelector((state) => state.workspace);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    useEffect(() => {
        if (url) {
            setLoading(true);
        }
    }, [url]);
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
        case "document": {
            return (
                <CustomedDialog
                    isOpen={url != null}
                    onClose={() => dispatch(setMedia({}))}
                    className="flex justify-center flex-col items-center max-h-[95vh] mt-4 w-fit p-0 relative"
                >
                    <a
                        href={url}
                        download={name}
                        className="absolute top-0 -right-16 bg-white/50 p-1 rounded-full"
                    >
                        <IoMdCloudDownload className="text-2xl" />
                    </a>
                    {loading && <LoadingSpinner />}

                    <iframe
                        className={`${loading ? "invisible" : ""}`}
                        width={
                            window.innerWidth > 900
                                ? window.innerWidth / 2
                                : window.innerWidth - 200
                        }
                        onLoad={() => setLoading(false)}
                        height={window.innerHeight - 100}
                        src={`https://docs.google.com/gview?url=${
                            publicAppUrl + url
                        }&embedded=true `}
                    ></iframe>
                </CustomedDialog>
            );
        }
        default:
            return "";
    }
});
