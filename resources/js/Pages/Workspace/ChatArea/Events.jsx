import { router, usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { addMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";

import { isHiddenUser } from "@/helpers/userHelper";
import { setThreadedMessageId } from "@/Store/threadSlice";
export default function Events() {
    const {
        workspace,
        channel,
        auth,
        channels,
        
        directChannels,
        mainChannelId,
    } = usePage().props;
    const dispatch = useDispatch();
    const connectionRef = useRef(null);
    const { channel: huddleChannel } = useSelector((state) => state.huddle);
    const {workspaceUsers} = useSelector(state=>state.workspaceUsers)
    useEffect(() => {
        connectionRef.current = Echo.private(
            `private_workspaces.${workspace.id}`
        );
        connectionRef.current
            .listen("WorkspaceEvent", (e) => {
                switch (e.type) {
                    case "ChannelObserver_deleteChannel":
                        if (channel?.id == e?.data) {
                            dispatch(setThreadedMessageId(null));
                            router.visit(
                                route("channels.show", {
                                    workspace: workspace.id,
                                    channel: mainChannelId,
                                }),
                                {
                                    preserveState: true,
                                }
                            );
                        } else {
                            router.reload({
                                only: ["channels"],
                                preserveState: true,
                            });
                        }
                        break;
                    case "newUserJoinWorkspace":
                        if (channel.id == mainChannelId) {
                            router.reload({
                                only: [
                                    "directChannels",
                                    "users",
                                    "channelUsers",
                                ],
                                preserveState: true,
                            });
                        } else
                            router.reload({
                                only: ["directChannels", "users"],
                                preserveState: true,
                            });
                        break;
                }
            })
            .error((error) => {
                console.error(error);
            });
        return () => {
            connectionRef.current = null;
            Echo.leave(`private_workspaces.${workspace.id}`);
        };
    }, [workspace.id, huddleChannel, channel]);

    useEffect(() => {
        channels.forEach((cn) => {
            Echo.private(`private_channels.${cn.id}`).listen(
                "MessageEvent",
                (e) => {
                    if (e.message?.user_id != auth.user.id)
                        if (cn.id != channel.id)
                            if (
                                e.type == "newMessageCreated" &&
                                !isHiddenUser(workspaceUsers, e.message?.user_id)
                            )
                                dispatch(addMessageCountForChannel(cn));
                }
            );
        });
        directChannels.forEach((cn) => {
            Echo.private(`private_channels.${cn.id}`).listen(
                "MessageEvent",
                (e) => {
                    if (e.message?.user_id != auth.user.id)
                        if (cn.id != channel.id)
                            if (e.type == "newMessageCreated")
                                dispatch(addMessageCountForChannel(cn));
                }
            );
        });
        return () => {
            channels.forEach((cn) => {
                Echo.leave(`private_channels.${cn.id}`);
            });
            directChannels.forEach((cn) => {
                Echo.leave(`private_channels.${cn.id}`);
            });
        };
    }, [channels, channel, directChannels, users]);

    return <></>;
}
