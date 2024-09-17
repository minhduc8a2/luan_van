import Form1 from "@/Components/Form1";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { useForm } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";

export default function DeleteMessage({ message, user }) {
    const willSubmitRef = useRef(false);

    const { data, setData, delete: destroy, processing, errors } = useForm({});
    const [success, setSuccess] = useState(false);
    useEffect(() => {
        if (willSubmitRef.current) {
            destroy(route("message.delete", message.id), {
                preserveState: true,
                only: [],
            });
        }
    }, [willSubmitRef.current, message.id, destroy]);

    return (
        <Form1
            className="p-4"
            submit={() => {
                willSubmitRef.current = true;
            }}
            success={success}
            errors={errors}
            submitting={processing}
            activateButtonNode={
                <button className="hover:bg-danger hover:text-white px-4  py-2 w-full text-left text-danger-light">
                    Delete message
                </button>
            }
            title="Delete message"
            buttonName="Delete Message"
            submitButtonClassName="bg-danger"
        >
            <h5>
                Are you sure you want to delete this message? This cannot be
                undone.
            </h5>
        </Form1>
    );
}
