import React from "react";
import SideBar from "./Partitals/Sidebar";
import HeadBar from "./Partitals/Headbar";
import Panel from "./Partitals/Panel";
import ChatArea from "./Partitals/ChatArea/ChatArea";

export default function Index({
    auth,
    workspace,
    channels,
    channel,
    messages,
    users,
    members,
    workspaces,
}) {
    return (
        <div className="client-container bg-primary text-white ">
            <div className="client-headbar ">
                <HeadBar />
            </div>
            <div className="client-sidebar ">
                <SideBar
                    user={auth.user}
                    workspace={workspace}
                    workspaces={workspaces}
                />
            </div>
            <div className="client-workspace-container grid grid-cols-4 rounded-lg border border-white/5 border-b-2">
                <Panel
                    channels={channels}
                    currentChannel={channel}
                    workspace={workspace}
                    users={users}
                />

                <ChatArea
                    channelName={channel.name}
                    workspace={workspace}
                    channel={channel}
                    messages={messages}
                    members={members}
                />
            </div>
        </div>
    );
}
