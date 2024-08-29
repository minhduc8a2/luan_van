import React from "react";
import SideBar from "./SideBar";
import HeadBar from "./HeadBar";
import Panel from "./Panel/Panel";
import ChatArea from "./ChatArea/ChatArea";

import { useRef } from "react";

import { setChannel } from "@/Store/Slices/channelSlice";
import { setWorkspaceProfile } from "@/Store/Slices/workspaceProfileSlice";
import { makeStore } from "@/Store/store";
import { Provider } from "react-redux";
import Event from "./Event";
export default function Index({
    workspace,
    channels,
    users,
    workspaces,
    directChannels,
    selfChannel,
}) {
    const storeRef = useRef(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
        storeRef.current.dispatch(
            setChannel(channels.find((channel) => channel.type == "PUBLIC"))
        );
        storeRef.current.dispatch(
            setWorkspaceProfile({
                workspace,
                channels,
                users: users.map((user) => ({ ...user, online: false })),
                workspaces,
                directChannels,
                selfChannel,
                sideBarWidth: 0,
            })
        );
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

                <div className="client-workspace-container grid grid-cols-4 rounded-lg border border-white/5 border-b-2">
                    <Panel />
                    <ChatArea />
                </div>
            </div>
        </Provider>
    );
}
