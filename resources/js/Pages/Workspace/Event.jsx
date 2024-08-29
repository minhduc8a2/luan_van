import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    updateUsersOnlineStatus,
    addJustJoinedUserToWorkspace,
    removeJustLeavedUserToWorkspace,
} from "@/Store/Slices/workspaceProfileSlice";
export default function Event() {
    const { workspace } = useSelector((state) => state.workspaceProfile);
    const dispatch = useDispatch();
    useEffect(() => {
        Echo.join(`workspaces.${workspace.id}`)
            .here((users) => {
                dispatch(updateUsersOnlineStatus(users));
            })
            .joining((user) => {
                dispatch(addJustJoinedUserToWorkspace(user));
            })
            .leaving((user) => {
                dispatch(removeJustLeavedUserToWorkspace(user));
            })
            .listen("WorkspaceEvent", (e) => {
                // setlocalMessages((pre) => [...pre, e.message]);
                console.log(e);
            })
            .error((error) => {
                console.error(error);
            });
    }, []);
    return <></>;
}
