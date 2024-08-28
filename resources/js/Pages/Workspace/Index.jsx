import React from "react";
import SideBar from "./SideBar";
import HeadBar from "./HeadBar";
import Panel from "./Panel/Panel";
import ChatArea from "./ChatArea/ChatArea";
import PageContext from "@/Contexts/PageContext";
import { useState, useEffect } from "react";
export default function Index({
    auth,
    workspace,
    channels,
    channel,
    messages,
    users,
    channelUsers,
    workspaces,
    directChannels,
    selfChannel,
}) {
    const [workspaceUsers, setWorkspaceUsers] = useState(
        users.map((user) => ({ ...user, online: false }))
    );
    useEffect(() => {
        setWorkspaceUsers((pre) => {
            return users.map((user) => {
                if (pre.find((u) => u.id == user.id && u.online))
                    user.online = true;
                return user;
            });
        });
    }, [users]);
    useEffect(() => {
        Echo.join(`workspaces.${workspace.id}`)
            .here((users) => {
                setWorkspaceUsers((pre) => {
                    return pre.map((user) => {
                        if (users.find((u) => u.id == user.id))
                            user.online = true;
                        return user;
                    });
                });
            })
            .joining((user) => {
                setWorkspaceUsers((pre) => {
                    const temp = [...pre];
                    let userIndex = pre.findIndex((u) => u.id == user.id);
                    if (userIndex) temp[userIndex].online = true;
                    return temp;
                });
            })
            .leaving((user) => {
                setWorkspaceUsers((pre) => {
                    const temp = [...pre];
                    let userIndex = pre.findIndex((u) => u.id == user.id);
                    if (userIndex) temp[userIndex].online = false;
                    return temp;
                });
            })
            .listen("WorkspaceEvent", (e) => {
                // setlocalMessages((pre) => [...pre, e.message]);
                console.log(e);
            })
            .error((error) => {
                console.error(error);
            });
    }, []);
    return (
        <PageContext.Provider
            value={{
                auth,
                workspace,
                channels,
                channel,
                messages,
                users: workspaceUsers,
                channelUsers,
                workspaces,
                directChannels,
                selfChannel,
            }}
        >
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
        </PageContext.Provider>
    );
}
