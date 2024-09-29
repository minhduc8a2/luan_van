import { router, usePage } from "@inertiajs/react";
import React, { useMemo, useRef } from "react";
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";



import { isHiddenUser } from "@/helpers/userHelper";
import { setThreadedMessageId } from "@/Store/threadSlice";
import { addMessageCountForChannel } from "@/Store/channelsSlice";
export default function Events() {
    const { workspace, channelId, auth } = usePage().props;
    const dispatch = useDispatch();
    const connectionRef = useRef(null);
    const { channels } = useSelector((state) => state.channels);
    const directChannels = useMemo(
        () => channels.filter((cn) => cn.type == "DIRECT"),
        [channels]
    );

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
    }, [workspace.id, channel]);

  

    return <></>;
}
