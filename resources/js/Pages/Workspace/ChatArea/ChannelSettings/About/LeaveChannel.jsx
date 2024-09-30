import React from "react";
import Button from "@/Components/Button";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";

import { FaLock } from "react-icons/fa";
import { useCustomedForm } from "@/helpers/customHooks";
import { router } from "@inertiajs/react";
import { removeChannel } from "@/Store/channelsSlice";

export default function LeaveChannel({ channel }) {
    const {
        success,
        loading: processing,

        submit,
    } = useCustomedForm(
        {},
        {
            url: route("channel.leave", channel.id),
            method: "post",
        }
    );
    function onSubmit(e) {
        e.preventDefault();
        submit().then((response) => {
            if (response.data) {
                if (channel.type == "PRIVATE") {
                    dispatch(removeChannel(cn.id));
                    router.get(
                        route("channels.show", {
                            workspace: workspace.id,
                            channel: mainChannel.id,
                        }),
                        {},
                        {
                            preserveState: true,
                        }
                    );
                } else {
                    loadChannelRelatedData([
                        "permissions",
                        "channelPermissions",
                    ]);
                }
            }
        });
    }

    if (channel.is_main_channel) return "";
    if (channel.type === "PUBLIC")
        return (
            <div>
                <Button
                    className="!text-danger-500  !hover:text-danger-500 bg-transparent w-full rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg border border-t-0 border-white/15 py-4 !justify-start"
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
                        className="!text-danger-500 !hover:text-danger-500  bg-transparent w-full rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg border border-t-0 border-white/15 py-4"
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
