import { useForm } from "@inertiajs/react";

import TextArea from "@/Components/Input/TextArea";
import Form1 from "@/Components/Form1";
import { router, usePage } from "@inertiajs/react";

import { useState, useEffect } from "react";
import { SettingsButton } from "./SettingsButton";
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
            only: ["channel"],
            onSuccess: () => {
                setSuccess(true);
            },
        });
    }

    useEffect(() => {
        setData("description", channel.description);
    }, [channel.id]);
    return (
        <div>
            <Form1
                className="p-4"
                errors={errors}
                success={success}
                submit={onSubmit}
                buttonName={channel.description ? "Update" : "Add"}
                submitting={processing}
                activateButtonNode={
                    <SettingsButton
                        onClick={() => setSuccess(false)}
                        title=" Description"
                        description={channel.description}
                        className="border-t-0"
                    />
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
