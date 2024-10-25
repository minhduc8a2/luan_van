import React, { useContext } from "react";
import Button from "@/Components/Button";

import { FaLock } from "react-icons/fa";

import useLeaveChannel from "@/helpers/useLeaveChannel";
import { useState } from "react";
import { useSelector } from "react-redux";
import CustomedDialog from "@/Components/CustomedDialog";
import { ChannelSettingsContext } from "../ChannelSettings";
export default function LeaveChannel({ channel }) {
    const { workspace } = useSelector((state) => state.workspace);
    const {setShow} = useContext(ChannelSettingsContext)
    const leaveChannel = useLeaveChannel(workspace.id);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        leaveChannel(channel.id, channel.type, true).then(() => {
            setSuccess(true);
            setProcessing(false);
            setShow(false)
        });
    }

    if (channel.type === "PUBLIC")
        return (
            <div>
                <Button
                    className="!text-danger-500  !hover:text-danger-500 bg-transparent w-full border-none py-4 !justify-start rounded-bl-lg rounded-br-lg"
                    onClick={onSubmit}
                    loading={processing}
                >
                    Leave channel
                </Button>
            </div>
        );
    else
        return (
            <>
                <Button
                    className="   bg-transparent w-full rounded-none   border-none py-4 !justify-start rounded-bl-lg rounded-br-lg"
                    type="danger-text"
                    onClick={() => setIsOpen(true)}
                >
                    Leave channel
                </Button>
                <CustomedDialog
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                >
                    <CustomedDialog.Title>
                        {" "}
                        <div className="flex items-baseline gap-x-2">
                            <span>Leave </span>
                            {channel.type == "PUBLIC" ? (
                                "#"
                            ) : (
                                <FaLock className="text-lg inline" />
                            )}{" "}
                            {channel.name}
                        </div>
                    </CustomedDialog.Title>

                    <div>
                        When you leave a private channel, you’ll no longer be
                        able to see any of its messages. To rejoin this channel
                        later, you’ll need to be invited.
                    </div>
                    <CustomedDialog.ActionButtons
                        btnName2={"Leave"}
                        onClickBtn2={onSubmit}
                        loading={processing}
                        type="danger"
                    />
                </CustomedDialog>
            </>
        );
}
