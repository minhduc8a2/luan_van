import React from "react";
import Button from "@/Components/Button";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";

import { FaLock } from "react-icons/fa";

import useLeaveChannel from "@/helpers/useLeaveChannel";
import { useState } from "react";
import { useSelector } from "react-redux";
export default function LeaveChannel({ channel }) {
    const { workspace } = useSelector((state) => state.workspace);
    const leaveChannel = useLeaveChannel(workspace.id);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    function onSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        leaveChannel(channel.id, channel.type, true).then(() => {
            setSuccess(true);
            setProcessing(false);
        });
    }

    if (channel.is_main_channel) return "";
    if (channel.type === "PUBLIC")
        return (
            <div>
                <Button
                    className="!text-danger-500  !hover:text-danger-500 bg-transparent w-full border-none py-4 !justify-start rounded-bl-lg rounded-br-lg"
                    onClick={onSubmit}
                >
                    Leave channel
                </Button>
            </div>
        );
    else
        return (
            <OverlayNotification
                className="p-3"
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
                        className="   bg-transparent w-full rounded-none   border-none py-4 !justify-start rounded-bl-lg rounded-br-lg"
                        type="danger-text"
                        onClick={() => setSuccess(false)}
                    >
                        Leave channel
                    </Button>
                }
                submitButtonNode={
                    <Button
                        className="!bg-danger-500  relative"
                        onClick={onSubmit}
                    >
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
                </div>
            </OverlayNotification>
        );
}
