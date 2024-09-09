import React from "react";
import Button from "@/Components/Button";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { useForm, usePage } from "@inertiajs/react";

import { useState } from "react";
import { FaLock } from "react-icons/fa";

export default function LeaveChannel({ channel }) {
    const { post, processing, errors, reset } = useForm({});
    const [success, setSuccess] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        post(route("channel.leave", channel.id), {
            preserveState: false,
            onSuccess: () => {
                setSuccess(true);
            },
        });
    }
    if (channel.is_main_channel) return "";
    if (channel.type === "PUBLIC")
        return (
            <div>
                <Button
                    className="!text-danger !hover:text-danger bg-transparent w-full rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg border border-t-0 border-white/15 py-4"
                    onClick={onSubmit}
                >
                    Leave channel
                </Button>
            </div>
        );
    else
        return (
            <OverlayNotification
                success={success}
                title={
                    <div className="flex items-baseline gap-x-2">
                        <span>Leave </span>
                        {channel.type == "PUBLIC" ? (
                            "#"
                        ) : (
                            <FaLock className="text-lg inline" />
                        )}{" "}
                        {channel.name}
                    </div>
                }
                buttonNode={
                    <Button
                        className="!text-danger !hover:text-danger bg-transparent w-full rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg border border-t-0 border-white/15 py-4"
                        onClick={() => setSuccess(false)}
                    >
                        Leave channel
                    </Button>
                }
                submitButtonNode={
                    <Button className="!bg-danger relative" onClick={onSubmit}>
                        {processing ? <OverlayLoadingSpinner /> : ""}
                        <span className={processing ? "invisible" : ""}>
                            Leave channel
                        </span>
                    </Button>
                }
            >
                <div className="">
                    <div>
                        When you leave a private channel, you’ll no longer be
                        able to see any of its messages. To rejoin this channel
                        later, you’ll need to be invited.
                    </div>

                    {errors?.length > 0 && (
                        <div className="my-4 text-red-500 text-sm">
                            Failed to change channel type, please try later!
                        </div>
                    )}
                </div>
            </OverlayNotification>
        );
}
