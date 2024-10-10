import React, { useMemo, useContext } from "react";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { useState } from "react";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";

import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useErrorHandler from "@/helpers/useErrorHandler";
import useSuccessHandler from "@/helpers/useSuccessHandler";

import { ChannelSettingsContext } from "../ChannelSettings";
export default function DeleteChannel() {
    const { channelId } = useParams();
    const { setShow } = useContext(ChannelSettingsContext);

    const { channels } = useSelector((state) => state.channels);
    const channel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const [confirm, setConfirm] = useState(false);

    const [processing, setProcessing] = useState(false);
    const errorHandler = useErrorHandler();
    const successHandler = useSuccessHandler("Channel deleted successfully!");

    function submit(e) {
        if (!confirm) return;
        setProcessing(true);
        axios
            .delete(route("channel.delete", channel.id), {
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            })
            .then((response) => {
                setShow(false);
                successHandler(response);
            })
            .catch(errorHandler)
            .finally(() => {
                setProcessing(false);
            });
    }
    return (
        <OverlayNotification
            className="min-w-[30vw] p-3"
            title={<div className=" ">Delete this channel?</div>}
            sameButtonRow={
                <div
                    className="flex gap-x-2 items-center"
                    onClick={() => {
                        setSuccess(false);
                    }}
                >
                    <input
                        type="checkbox"
                        name=""
                        id="delete-channel-confirm"
                        onChange={(e) => {
                            setConfirm(e.target.checked);
                        }}
                    />
                    <label htmlFor="delete-channel-confirm">
                        Yes, permanently delete the channel
                    </label>
                </div>
            }
            buttonNode={
                <Button className=" !hover:text-danger-500  bg-transparent w-full !rounded-none py-4 border-none !justify-start">
                    <div className="flex items-center gap-x-2 text-danger-500 ">
                        <FaRegTrashCan className="" /> Delete this channel
                    </div>
                </Button>
            }
            submitButtonNode={
                <Button
                    loading={processing}
                    className={confirm ? " !bg-danger-500  text-white" : ""}
                    disabled={!confirm}
                    onClick={submit}
                >
                    Delete Channel
                </Button>
            }
        >
            <div className=" text-white/85 pb-4">
                <div className=" ">
                    When you delete a channel, all messages from this channel
                    will be removed from Slack immediately.{" "}
                    <span className="font-bold">This can’t be undone.</span>
                </div>
                <div className="mt-4">Keep in mind that:</div>
                <ul className="list-disc ml-4 ">
                    <li>Any files uploaded to this channel won’t be removed</li>
                    <li>
                        You can archive a channel instead without removing its
                        messages
                    </li>
                </ul>
            </div>
        </OverlayNotification>
    );
}
