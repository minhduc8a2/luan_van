import { router, usePage } from "@inertiajs/react";
import React, { useMemo, useRef } from "react";
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { addMessageCountForChannel } from "@/Store/newMessageCountsMapSlice";

import { isHiddenUser } from "@/helpers/userHelper";
import { setThreadedMessageId } from "@/Store/threadSlice";
export default function Events() {
    const {
        workspace,
        channelId,
        auth,
        

        directChannels,
    } = usePage().props;
    const dispatch = useDispatch();
    const connectionRef = useRef(null);
    const { channels } = useSelector((state) => state.channels);

    const channel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
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
                                    channel: channels.find(
                                        (cn) => cn.is_main_channel
                                    ),
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
                        if (
                            channel.id ==
                            channels.find((cn) => cn.is_main_channel)
                        ) {
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
    }, [workspace.id,  channel]);

    useEffect(() => {
        channels.forEach((cn) => {
            Echo.private(`private_channels.${cn.id}`).listen(
                "MessageEvent",
                (e) => {
                    if (e.message?.user_id != auth.user.id)
                        if (cn.id != channel.id)
                            if (
                                e.type == "newMessageCreated" &&
                                !isHiddenUser(
                                    workspaceUsers,
                                    e.message?.user_id
                                )
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
    }, [channels, channel, directChannels, workspaceUsers]);

    return <></>;
}
