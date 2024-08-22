import React from "react";
import SideBar from "./Partitals/Sidebar";
import HeadBar from "./Partitals/Headbar";

export default function Index({ auth }) {
    return (
        <div className="client-container bg-primary text-white">
            <div className="client-headbar ">
                <HeadBar />
            </div>
            <div className="client-sidebar ">
                <SideBar user={auth.user} />
            </div>
            <div className="client-workspace-container ">Main</div>
        </div>
    );
}
