import { setManyOnline, setOnlineStatus } from "@/Store/OnlineStatusSlice";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

export default function OnlineStatusProvider({ children }) {
    const dispatch = useDispatch();
    const { workspaceId } = useParams();
    const connectionRef = useRef(null);
    useEffect(() => {
        if (!workspaceId) {
            console.error("No workspaceId provided");
            return;
        }
        connectionRef.current = Echo.join(`workspaces.${workspaceId}`)
            .here((users) => {
                dispatch(setManyOnline(users));
            })
            .joining((user) => {
                dispatch(setOnlineStatus({ user, onlineStatus: true }));
            })
            .leaving((user) => {
                dispatch(setOnlineStatus({ user, onlineStatus: false }));
            })

            .error((error) => {
                console.error(error);
            });
        console.log("Subscribed to workspace users' online status.");
        return () => {
            if (connectionRef.current) {
                connectionRef.current.leave();
                connectionRef.current = null;
                console.log(
                    "Unsubscribed from workspace users' online status."
                );
            }
        };
    }, [workspaceId, dispatch]);
    return <>{children}</>;
}
