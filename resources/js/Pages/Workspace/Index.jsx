import React from "react";
import SideBar from "./Partitals/Sidebar";
import HeadBar from "./Partitals/Headbar";
import Panel from "./Partitals/Panel";
import ChatArea from "./Partitals/ChatArea";

export default function Index({ auth, workspaceName }) {
    return (
        <div className="client-container bg-primary text-white">
            <div className="client-headbar ">
                <HeadBar />
            </div>
            <div className="client-sidebar ">
                <SideBar user={auth.user} workspaceName={workspaceName}/>
            </div>
            <div className="client-workspace-container grid grid-cols-4 rounded-lg border border-white/5 border-b-2">
                <Panel />
                <div className="col-span-3">
                    <ChatArea />
                </div>
            </div>
        </div>
    );
}
