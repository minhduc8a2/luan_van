import { usePage } from "@inertiajs/react";
import React from "react";
import { useEffect } from "react";
import { setManyOnline, setOnlineStatus } from "@/Store/onlineStatusSlice";
import { useDispatch } from "react-redux";
export default function Event() {
    const { workspace } = usePage().props;
    const dispatch = useDispatch();
    useEffect(() => {
        Echo.join(`workspaces.${workspace.id}`)
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
    }, []);
    return <></>;
}
