import React, { useMemo } from "react";
import Button from "@/Components/Button";
import { useState } from "react";
import { FiArchive } from "react-icons/fi";
import { RiInboxUnarchiveLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useErrorHandler from "@/helpers/useErrorHandler";
import CustomedDialog from "@/Components/CustomedDialog";
export default function ArchiveChannel() {
    const { channelId } = useParams();

    const { channels } = useSelector((state) => state.channels);

    const channel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const errorHandler = useErrorHandler();

    const [isOpen, setIsOpen] = useState(false);
    function submit(e) {
        if (!confirm) return;
        setProcessing(true);

        axios
            .post(
                route("channels.archive", channel.id),
                {
                    status: !channel.is_archived,
                },
                {
                    headers: {
                        "X-Socket-Id": Echo.socketId(),
                    },
                }
            )
            .then(() => {
                setSuccess(true);
            })
            .catch(errorHandler)
            .finally(() => {
                setProcessing(false);
            });
    }
    if (channel.is_archived) {
        return (
            <>
                <Button
                    type="danger-text"
                    className="   w-full py-4 !rounded-none border-none flex !justify-start"
                    loading={processing}
                    onClick={submit}
                >
                    {channel.is_archived ? (
                        <div className="flex items-center gap-x-2">
                            <RiInboxUnarchiveLine className="" /> Unarchive this
                            channel
                        </div>
                    ) : (
                        <div className="flex items-center gap-x-2 text-danger-500 ">
                            <FiArchive className="" /> Archive channel for
                            everyone
                        </div>
                    )}
                </Button>
            </>
        );
    }
    return (
        <>
            <Button
                type="danger-text"
                className="   w-full py-4 !rounded-none border-none flex !justify-start"
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                {channel.is_archived ? (
                    <div className="flex items-center gap-x-2">
                        <RiInboxUnarchiveLine className="" /> Unarchive this
                        channel
                    </div>
                ) : (
                    <div className="flex items-center gap-x-2 ">
                        <FiArchive className="" /> Archive channel for everyone
                    </div>
                )}
            </Button>

            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>
                    {" "}
                    <div className=" ">
                        {" "}
                        {channel.is_archived
                            ? "Unarchive this channel?"
                            : "Archive this channel?"}
                    </div>
                </CustomedDialog.Title>
                <div className=" text-color-high-emphasis pb-4">
                    {!errors && (
                        <>
                            <div className=" ">
                                When you archive a channel, it’s archived for
                                everyone. That means…
                            </div>

                            <ul className="list-disc ml-4 ">
                                <li>
                                    No one will be able to send messages to the
                                    channel
                                </li>
                                <li>
                                    You’ll still be able to find the channel’s
                                    contents via search. And you can always
                                    unarchive the channel in the future, if
                                    you’d like.
                                </li>
                            </ul>
                        </>
                    )}
                </div>

                <CustomedDialog.ActionButtons
                    btnName2={
                        channel.is_archived
                            ? "Unarchive Channel"
                            : "Archive Channel"
                    }
                    loading={processing}
                    onClickBtn2={submit}
                    type={channel.is_archived ? "" : "danger"}
                />
            </CustomedDialog>
        </>
    );
}
