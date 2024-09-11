import { router, usePage } from "@inertiajs/react";
import React, { useRef } from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import { useDispatch } from "react-redux";
import { addActivity } from "@/Store/activitySlice";
export default function Event() {
    const { workspace, channel, auth } = usePage().props;
    const dispatch = useDispatch();
    const connectionRef = useRef(null);
    useEffect(() => {
        Echo.private("App.Models.User." + auth.user.id).notification(
            (notification) => {
                dispatch(addActivity(notification));
            }
        );
        return () => {
            Echo.leave("App.Models.User." + auth.user.id);
        };
    }, [workspace.id]);
    useEffect(() => {
        connectionRef.current = Echo.join(`workspaces.${workspace.id}`);
        connectionRef.current
            .here((users) => {
                dispatch(setManyOnline(users));
            })
            .listen("WorkspaceEvent", (e) => {
                if (e.type === "storeChannel" && e.fromUserId != auth.user.id) {
                    router.reload({ only: ["availableChannels"], preserveState: true });
                }
            })
            .error((error) => {
                console.error(error);
            });
        return () => {
            connectionRef.current = null;
            Echo.leave(`workspaces.${workspace.id}`);
        };
    }, [workspace.id]);
    useEffect(() => {
        if (connectionRef.current)
            connectionRef.current
                .joining((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: true }));
                    router.get(
                        route("channel.show", channel.id),
                        {},
                        {
                            preserveState: true,
                            only: ["channelUsers", "directChannels", "users"],
                        }
                    );
                })
                .leaving((user) => {
                    dispatch(setOnlineStatus({ user, onlineStatus: false }));
                    route("channel.show", channel.id),
                        {},
                        {
                            preserveState: true,
                            only: ["channelUsers", "directChannels", "users"],
                        };
                });
    }, [workspace.id, channel.id]);
    return <></>;
}
