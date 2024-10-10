import React, { useMemo } from "react";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import ErrorsList from "@/Components/ErrorsList";
import { FiArchive } from "react-icons/fi";
import { RiInboxUnarchiveLine } from "react-icons/ri";
import Overlay from "@/Components/Overlay/Overlay";
import OverlaySimpleNotification from "@/Components/Overlay/OverlaySimpleNotification";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import useErrorHandler from "@/helpers/useErrorHandler";
import { updateChannelInformation } from "@/Store/channelsSlice";
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
    const dispatch = useDispatch();
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
                    className=" !hover:text-danger-500  bg-transparent w-full py-4 !rounded-none border-none flex !justify-start"
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
        <OverlayNotification
            success={success}
            className="min-w-[30vw] max-w-[50vw] p-3 pb-6"
            title={
                <div className=" ">
                    {" "}
                    {channel.is_archived
                        ? "Unarchive this channel?"
                        : "Archive this channel?"}
                </div>
            }
            buttonNode={
                <Button
                    className=" !hover:text-danger-500  bg-transparent w-full py-4 !rounded-none border-none !justify-start"
                    onClick={() => {
                        setSuccess(false);
                        setErrors(null);
                    }}
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
            }
            submitButtonNode={
                <Button
                    loading={processing}
                    className={
                        channel.is_archived ? "" : "!bg-danger-500  text-white"
                    }
                    disabled={!confirm}
                    onClick={submit}
                >
                    {channel.is_archived
                        ? "Unarchive Channel"
                        : "Archive Channel"}
                </Button>
            }
        >
            <div className=" text-white/85 pb-4">
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
                                unarchive the channel in the future, if you’d
                                like.
                            </li>
                        </ul>
                    </>
                )}
            </div>
        </OverlayNotification>
    );
}
