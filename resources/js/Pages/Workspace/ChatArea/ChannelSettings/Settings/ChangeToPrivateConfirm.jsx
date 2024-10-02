import Button from "@/Components/Button";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import useErrorHandler from "@/helpers/useErrorHandler";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useMemo } from "react";
import { useState } from "react";
import { FaLock } from "react-icons/fa";
import { useSelector } from "react-redux";
export default function ChangeToPrivateConfirm({ channelName }) {
    const { channelId, workspace } = usePage().props;
    const { channels } = useSelector((state) => state.channels);

    const channel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const channelType = useMemo(() => {
        return channel.type == "PUBLIC"
            ? "PRIVATE"
            : channel.type == "PRIVATE"
            ? "PUBLIC"
            : "";
    }, [channel]);

    const [success, setSuccess] = useState(false);

    const [processing, setProcessing] = useState(false);
    const handleError = useErrorHandler();

    function onSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        axios
            .post(route("channel.change_type", channel.id), {
                type: channelType,
            })
            .catch(handleError)
            .finally(() => {
                setSuccess(true);
                setProcessing(false);
            });
    }
    return (
        <OverlayNotification
            success={success}
            className="p-3"
            title={`Change to a ${
                channel.type == "PUBLIC" ? "private" : "public"
            } channel?`}
            buttonNode={
                <Button
                    className=" bg-transparent w-full !rounded-none    py-4 border-none !justify-start"
                    onClick={() => {
                        setSuccess(false);
                    }}
                >
                    <div className="flex items-center gap-x-2">
                        {channel.type != "PUBLIC" ? (
                            <span className="text-lg">#</span>
                        ) : (
                            <FaLock className="text-sm" />
                        )}{" "}
                        Change to a{" "}
                        {channel.type == "PUBLIC" ? "private" : "public"}{" "}
                        channel
                    </div>
                </Button>
            }
            submitButtonNode={
                <Button className="!bg-danger-500  relative" onClick={onSubmit}>
                    {processing ? <OverlayLoadingSpinner /> : ""}
                    <span className={processing ? "invisible" : ""}>
                        Change to{" "}
                        {channel.type == "PUBLIC" ? "Private" : "Public"}
                    </span>
                </Button>
            }
        >
            <div className="">
                <div>
                    Keep in mind that when you make{" "}
                    {channel.type == "PUBLIC" ? (
                        "#"
                    ) : (
                        <FaLock className="text-xs inline" />
                    )}{" "}
                    {channelName} a{" "}
                    {channel.type == "PUBLIC" ? "private" : "public"} channel:
                </div>
                <ul className="flex list-disc flex-col gap-y-2 mt-2 list-outside pl-4">
                    <li>
                        {channel.type == "PUBLIC"
                            ? " No changes will be made to the channel’s history or members."
                            : "Anyone from your workspace (except guests) can see its message history and join."}
                    </li>
                    <li>
                        {channel.type == "PUBLIC"
                            ? `All files shared in this channel up until this point
                        will be publicly accessible to everyone in ${workspace.name}.`
                            : "If you make the channel private again, it’ll be visible to anyone who’s joined the channel up until that point."}
                    </li>
                </ul>
            </div>
        </OverlayNotification>
    );
}
