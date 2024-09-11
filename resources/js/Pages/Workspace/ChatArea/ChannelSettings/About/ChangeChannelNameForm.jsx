import React from "react";
import Form1 from "@/Components/Form1";

import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import TextInput from "@/Components/Input/TextInput";
import { SettingsButton } from "./SettingsButton";
import { FaLock } from "react-icons/fa";
export default function ChangeChannelNameForm({ channelName }) {
    const { channel } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: channelName,
    });
    const [success, setSuccess] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        post(route("channel.edit_name", channel.id), {
            preserveState: true,
            onSuccess: () => {
                setSuccess(true);
            },
            onFinish: () => {
                console.log("errors");
                reset();
            },
        });
    }
    return (
        <Form1
            className="p-4"
            errors={errors}
            success={success}
            submit={onSubmit}
            submitting={processing}
            title="Rename this channel"
            buttonName="Save changes"
            activateButtonNode={
                <SettingsButton
                    onClick={() => setSuccess(false)}
                    title="Channel name"
                    description={
                        <div className="flex items-baseline gap-x-1">
                            {channel.type == "PUBLIC" ? (
                                <span className="text-lg">#</span>
                            ) : (
                                <FaLock className="text-sm inline" />
                            )}{" "}
                            {channelName}
                        </div>
                    }
                    className="rounded-tl-lg rounded-tr-lg"
                />
            }
        >
            <TextInput
                row={1}
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
            />
        </Form1>
    );
}
