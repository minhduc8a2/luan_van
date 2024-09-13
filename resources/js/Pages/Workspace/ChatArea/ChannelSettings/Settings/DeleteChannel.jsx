import React from "react";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import ErrorsList from "@/Components/ErrorsList";

export default function DeleteChannel() {
    const { channel } = usePage().props;
    const [confirm, setConfirm] = useState(false);
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    function submit(e) {
        if (!confirm) return;
        setProcessing(true);
        router.delete(
            route("channel.delete", channel.id),
            {},
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
            }
        );
    }
    return (
        <OverlayNotification
            success={success}
            className="w-[30vw] p-3"
            title={<div className=" ">Delete this channel?</div>}
            sameButtonRow={
                <div
                    className="flex gap-x-2 items-center"
                    onClick={() => {
                        setErrors(null);
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
                <Button className="!text-danger !hover:text-danger bg-transparent w-full rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg border border-t-0 border-white/15 py-4 ">
                    <div className="flex items-center gap-x-2">
                        <FaRegTrashCan className="" /> Delete this channel
                    </div>
                </Button>
            }
            submitButtonNode={
                <Button
                    loading={processing}
                    className={confirm ? "bg-danger text-white" : ""}
                    disabled={!confirm}
                    onClick={submit}
                >
                    Delete Channel
                </Button>
            }
        >
            <div className=" text-white/85 pb-4">
                {!errors && (
                    <>
                        <div className=" ">
                            When you delete a channel, all messages from this
                            channel will be removed from Slack immediately.{" "}
                            <span className="font-bold">
                                This can’t be undone.
                            </span>
                        </div>
                        <div className="mt-4">Keep in mind that:</div>
                        <ul className="list-disc ml-4 ">
                            <li>
                                Any files uploaded to this channel won’t be
                                removed
                            </li>
                            <li>
                                You can archive a channel instead without
                                removing its messages
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
