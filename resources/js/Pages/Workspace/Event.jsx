import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    updateUsersOnlineStatus,
    addJustJoinedUserToWorkspace,
    removeJustLeavedUserToWorkspace,
    setDirectChannels,
} from "@/Store/Slices/workspaceProfileSlice";
export default function Event() {
    const { workspace } = useSelector((state) => state.workspaceProfile);
    const dispatch = useDispatch();
    async function getDirectChannels() {
        try {
            const res = await axios.get(
                route("workspace.direct_channels", workspace.id)
            );
            const jsonRes = await res;
            if (jsonRes.data) dispatch(setDirectChannels(jsonRes.data));
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        Echo.join(`workspaces.${workspace.id}`)
            .here((users) => {
                dispatch(updateUsersOnlineStatus(users));
            })
            .joining((user) => {
                console.log(user);
                getDirectChannels();
                dispatch(addJustJoinedUserToWorkspace(user));
            })
            .leaving((user) => {
                getDirectChannels();
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
