import { usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addWorkspaceUser,
    updateWorkspaceUserInformation,
} from "@/Store/workspaceUsersSlice";
import { addNewChannelToChannelsStore } from "@/Store/channelsSlice";

import { addUsersToChannel } from "@/Store/channelsDataSlice";
import { useNavigate, useParams } from "react-router-dom";
import useLoadWorkspaceData from "@/helpers/useLoadWorkspaceData";
import { updateCurrentWorkspace } from "@/Store/workspaceSlice";
import useReloadLoadedChannelsDataPermissions from "@/helpers/useReloadLoadedChannelsDataPermissions";
import useLoadWorkspaces from "@/helpers/useLoadWorkspaces";
import WorkspaceEventsEnum from "@/services/Enums/WorkspaceEventsEnum";
export default function WorkspaceEventHandlersProvider({ children }) {
    const { auth } = usePage().props;
    const { channelId, workspaceId } = useParams();
    const { workspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    const channelsData = useSelector((state) => state.channelsData);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { threadMessageId } = useSelector((state) => state.thread);
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const reloadLoadedChannelsDataPermissions =
        useReloadLoadedChannelsDataPermissions(workspaceId);
    const loadWorkspaceData = useLoadWorkspaceData();
    const channelsDataRef = useRef(null);
    const channelsRef = useRef(null);
    const workspaceUsersRef = useRef(null);
    const threadMessageIdRef = useRef(null);
    const channelIdRef = useRef(null);
    const huddleChannelIdRef = useRef(null);
    const mainChannelIdRef = useRef(null);
    const reloadLoadedChannelsDataPermissionsRef = useRef(null);
    const navigate = useNavigate();
    const loadWorkspaces = useLoadWorkspaces();
    const connectionRef = useRef(null);
    useEffect(() => {
        reloadLoadedChannelsDataPermissionsRef.current =
            reloadLoadedChannelsDataPermissions;
    }, [reloadLoadedChannelsDataPermissions]);
    useEffect(() => {
        channelsDataRef.current = channelsData;
    }, [channelsData]);

    useEffect(() => {
        channelsRef.current = channels;
    }, [channels]);
    useEffect(() => {
        workspaceUsersRef.current = workspaceUsers;
    }, [workspaceUsers]);

    useEffect(() => {
        threadMessageIdRef.current = threadMessageId;
    }, [threadMessageId]);

    useEffect(() => {
        channelIdRef.current = channelId;
    }, [channelId]);

    useEffect(() => {
        huddleChannelIdRef.current = huddleChannelId;
    }, [huddleChannelId]);

    useEffect(() => {
        mainChannelIdRef.current = workspace?.main_channel_id;
    }, [workspace]);
    useEffect(() => {
        if (!workspaceId) {
            console.error("No workspaceId provided");
            return;
        }
        connectionRef.current = Echo.private(
            `private_workspaces.${workspaceId}`
        ).listen("WorkspaceEvent", (e) => {
            console.log("workspaceEvent", e);
            switch (e.type) {
                case WorkspaceEventsEnum.WORKSPACE_UPDATED:
                    dispatch(updateCurrentWorkspace(e.data));
                    break;
                case WorkspaceEventsEnum.INVITATION_PERMISSIONS_UPDATED:
                    loadWorkspaceData("workspacePermissions");
                    break;
                case WorkspaceEventsEnum.DEACTIVATE_USER_UPDATED:
                    dispatch(
                        updateWorkspaceUserInformation({
                            id: e.data?.id,
                            data: e.data,
                        })
                    );
                    if (
                        e.data?.id == auth.user.id &&
                        !!e.data?.pivot?.is_deactivated
                    ) {
                        loadWorkspaces().then(() => navigate("/workspaces"));
                    }
                    break;
                case WorkspaceEventsEnum.ACCEPT_JOINING_REQUEST:
                    e.data?.forEach((user) =>
                        dispatch(
                            updateWorkspaceUserInformation({
                                id: user.id,
                                data: user,
                            })
                        )
                    );

                    break;
                case WorkspaceEventsEnum.USER_ROLE_UPDATED:
                    dispatch(
                        updateWorkspaceUserInformation({
                            id: e.data?.id,
                            data: e.data,
                        })
                    );
                    if (auth.user.id == e.data?.id) {
                        reloadLoadedChannelsDataPermissionsRef.current();
                        loadWorkspaceData("workspacePermissions");
                    }
                    break;
                case WorkspaceEventsEnum.STORE_CHANNEL:
                    const newChannel = e.data;
                    if (
                        newChannel.type == "DIRECT" &&
                        newChannel.name
                            .split("_")
                            .some((id) => id == auth.user.id)
                    ) {
                        dispatch(addNewChannelToChannelsStore(e.data));
                    }
                    break;

                case WorkspaceEventsEnum.USER_UPDATED:
                    dispatch(
                        updateWorkspaceUserInformation({
                            id: e.data.id,
                            data: e.data,
                        })
                    );
                    break;
                case WorkspaceEventsEnum.NEW_USER_JOIN_WORKSPACE:
                    dispatch(addWorkspaceUser(e.data));
                    dispatch(
                        addUsersToChannel({
                            id: mainChannelIdRef.current,
                            userIds: [e.data.id],
                        })
                    );
                    break;
                default:
                    break;
            }
        });
        console.log("Subcribed to workspace: ", workspaceId);
        return () => {
            Echo.leave(`private_workspaces.${workspaceId}`);
            console.log("Unsubcribed from workspace: ", workspaceId);
        };
    }, [workspaceId, auth.user.id]);
    return <>{children}</>;
}
