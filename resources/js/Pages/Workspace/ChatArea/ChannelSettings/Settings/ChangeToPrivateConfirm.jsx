import Button from "@/Components/Button";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { useForm } from "@inertiajs/react";
import React from "react";
import { useState } from "react";
import { FaLock } from "react-icons/fa";
export default function ChangeToPrivateConfirm({
    channel,
    channelName,
    workspace,
}) {
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
        });
    }
    return (
        <OverlayNotification
            success={success}
            title={`Change to a ${
                channel.type == "PUBLIC" ? "private" : "public"
            } channel?`}
            buttonNode={
                <Button
                    className=" bg-transparent w-full rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border  border-white/15 py-4"
                    onClick={() => setSuccess(false)}
                >
                    <div className="flex items-center gap-x-2">
                        <FaLock /> Change to a{" "}
                        {channel.type == "PUBLIC" ? "private" : "public"}{" "}
                        channel
                    </div>
                </Button>
            }
            submitButtonNode={
                <Button className="!bg-danger relative" onClick={onSubmit}>
                    {processing ? <OverlayLoadingSpinner /> : ""}
                    Change to {channel.type == "PUBLIC" ? "Private" : "Public"}
                </Button>
            }
        >
            <div className="">
                <div>
                    Keep in mind that when you make{" "}
                    {channel.type == "PUBLIC" ? (
                        "#"
                    ) : (
                        <LuLock className="text-sm inline" />
                    )}{" "}
                    {channelName} a{" "}
                    {channel.type == "PUBLIC" ? "private" : "public"} channel:
                </div>
                <ul className="flex list-disc flex-col gap-y-2 mt-2 list-outside pl-4">
                    <li>
                        No changes will be made to the channel’s history or
                        members
                    </li>
                    <li>
                        All files shared in this channel up until this point
                        will be publicly accessible to everyone in{" "}
                        {workspace.name}
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
