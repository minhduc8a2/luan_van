import { useForm } from "@inertiajs/react";

import TextArea from "@/Components/Input/TextArea";
import Form1 from "@/Components/Form1";
import { router, usePage } from "@inertiajs/react";

import { useState, useEffect, useMemo } from "react";
import { SettingsButton } from "./SettingsButton";
import { useSelector } from "react-redux";
import { useChannel, useChannelData } from "@/helpers/customHooks";
export function EditDescriptionForm() {
    const { channelId } = usePage().props;
    const { channel } = useChannel(channelId);
    const { permissions } = useChannelData(channelId);
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
                disabled={!permissions.updateDescription}
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
                {!permissions.updateDescription && (
                    <h3 className="text-lg my-4">
                        ⚠️You are not allowed to edit channel description,
                        contact admins or channel managers for more information.
                    </h3>
                )}
                <TextArea
                    disabled={!permissions.updateDescription}
                    rows="2"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                />
            </Form1>
        </div>
    );
}
