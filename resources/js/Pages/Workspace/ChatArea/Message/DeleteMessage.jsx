import Form1 from "@/Components/Form1";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { deleteMessage } from "@/Store/messagesSlice";
import { deleteThreadMessage, setThreadedMessageId } from "@/Store/threadSlice";
import { useForm } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DeleteMessage({ message, user }) {
    const [willSubmit, setWillSubmit] = useState(false);
    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const { data, setData, delete: destroy, processing, errors } = useForm({});
    const [success, setSuccess] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {
        if (willSubmit) {
            destroy(route("message.delete", message.id), {
                preserveState: true,
                only: [],
                onSuccess: () => {
                    setSuccess(true);

                    dispatch(deleteMessage(message.id));
                    dispatch(deleteThreadMessage(message.id));
                    if (threadMessageId == message.id)
                        dispatch(setThreadedMessageId(null));
                },
            });
            setWillSubmit(false);
        }
    }, [willSubmit, message.id]);

    return (
        <Form1
            className="p-4"
            submit={() => {
                setWillSubmit(true);
            }}
            success={success}
            errors={errors}
            submitting={processing}
            activateButtonNode={
                <button className="hover:bg-danger-500  hover:text-white px-4  py-2 w-full text-left text-danger-400">
                    Delete message
                </button>
            }
            title="Delete message"
            buttonName="Delete Message"
            submitButtonClassName="bg-danger-500 "
        >
            <h5>
                Are you sure you want to delete this message? This cannot be
                undone.
            </h5>
        </Form1>
    );
}
