import React from "react";
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
export default function ArchiveChannel() {
    const { channel } = usePage().props;

    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    function submit(e) {
        if (!confirm) return;
        setProcessing(true);
        router.post(
            route("channel.archive", channel.id),
            {
                status: !channel.is_archived,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => setErrors(errors),
                onSuccess: () => {
                    setSuccess(true);
                },
                onFinish: () => {
                    setProcessing(false);
                },
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }
    if (channel.is_archived) {
        return (
            <>
                <OverlaySimpleNotification
                    show={errors}
                    onClose={() => setErrors(null)}
                >
                    <ErrorsList errors={errors} />
                </OverlaySimpleNotification>
                <Button
                    className=" !hover:text-danger-500  bg-transparent w-full py-4 !rounded-none"
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
                    className=" !hover:text-danger-500  bg-transparent w-full py-4 !rounded-none"
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

                {errors && (
                    <div>
                        <ErrorsList errors={errors} />
                    </div>
                )}
            </div>
        </OverlayNotification>
    );
}
