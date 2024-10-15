import React, { useMemo, useContext } from "react";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { useState } from "react";

import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useErrorHandler from "@/helpers/useErrorHandler";
import useSuccessHandler from "@/helpers/useSuccessHandler";

import { ChannelSettingsContext } from "../ChannelSettings";
import CustomedDialog from "@/Components/CustomedDialog";
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
    const [isOpen, setIsOpen] = useState(false);
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
        <>
            <Button
                type="danger-text"
                onClick={() => setIsOpen(true)}
                className="border-none !justify-start rounded-none"
            >
                <div className="flex items-center gap-x-2  py-2 ">
                    <FaRegTrashCan className="" /> Delete this channel
                </div>
            </Button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>
                    <div className=" ">Delete this channel?</div>
                </CustomedDialog.Title>
                <div className=" text-color-high-emphasis pb-4">
                    <div className=" ">
                        When you delete a channel, all messages from this
                        channel will be removed from Slack immediately.{" "}
                        <span className="font-bold">This can’t be undone.</span>
                    </div>
                    <div className="mt-4">Keep in mind that:</div>
                    <ul className="list-disc ml-4 ">
                        <li>
                            Any files uploaded to this channel won’t be removed
                        </li>
                        <li>
                            You can archive a channel instead without removing
                            its messages
                        </li>
                    </ul>
                </div>
                <div className="flex items-center justify-between mt-8">
                    <div className="flex gap-x-2 items-center text-color-high-emphasis">
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
                    <CustomedDialog.ActionButtons
                        className="!mt-0"
                        btnName2="Delete Channel"
                        type="danger"
                        loading={processing}
                        onClickBtn2={submit}
                        disabled={!confirm}
                    />
                </div>
            </CustomedDialog>
        </>
    );
}
