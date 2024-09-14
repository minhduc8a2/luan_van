import Button from "@/Components/Button";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { useForm, usePage } from "@inertiajs/react";
import React from "react";
import { useState } from "react";
import { FaLock } from "react-icons/fa";
export default function ChangeToPrivateConfirm({ channelName }) {
    const { channel, workspace } = usePage().props;
    const channelType =
        channel.type == "PUBLIC"
            ? "PRIVATE"
            : channel.type == "PRIVATE"
            ? "PUBLIC"
            : "";
    const { post, processing, errors, reset } = useForm({ type: channelType });
    const [success, setSuccess] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        post(route("channel.change_type", channel.id), {
            preserveState: true,
            onSuccess: () => {
                setSuccess(true);
            },
            headers: {
                "X-Socket-Id": Echo.socketId(),
            },
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
                    className=" bg-transparent w-full !rounded-none    py-4"
                    onClick={() => setSuccess(false)}
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
                <Button className="!bg-danger relative" onClick={onSubmit}>
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
                {errors?.length > 0 && (
                    <div className="my-4 text-red-500 text-sm">
                        Failed to change channel type, please try later!
                    </div>
                )}
            </div>
        </OverlayNotification>
    );
}
