import { useForm } from "@inertiajs/react";

import TextArea from "@/Components/Input/TextArea";
import { FaLink } from "react-icons/fa6";
import Form1 from "@/Components/Form1";
import { router, usePage } from "@inertiajs/react";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { useState, useEffect } from "react";
export function EditDescriptionForm() {
    const { channel } = usePage().props;
    const [success, setSuccess] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        description: channel.description,
    });
    function onSubmit(e) {
        e.preventDefault();
        post(route("channel.edit_description", channel.id), {
            preserveState: true,
            headers: {
                "X-Socket-Id": Echo.socketId(),
            },
            onSuccess: () => {
                setSuccess(true);
                router.get(
                    route("channel.show", {
                        workspace: workspace.id,
                        channel: channel.id,
                    }),
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                        only: ["channel"],
                    }
                );
            },
        });
    }

    useEffect(() => {
        setData("description", channel.description);
    }, [channel.id]);
    return (
        <div>
            <Form1
                className="p-3"
                errors={errors}
                success={success}
                submit={onSubmit}
                buttonName={channel.description ? "Update" : "Add"}
                submitting={processing}
                activateButtonNode={
                    <div
                        className=" text-link"
                        onClick={() => {
                            setSuccess(false);
                        }}
                    >
                        {channel.description ? "Edit" : "Add"} description
                    </div>
                }
                title={`${channel.description ? "Edit" : "Add"} Description`}
            >
                {" "}
                <TextArea
                    rows="2"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                />
            </Form1>
        </div>
    );
}
