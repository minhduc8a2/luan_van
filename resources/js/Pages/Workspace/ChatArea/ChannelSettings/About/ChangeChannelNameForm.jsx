import React, { useMemo } from "react";
import Form1 from "@/Components/Form1";

import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import TextInput from "@/Components/Input/TextInput";
import { SettingsButton } from "./SettingsButton";
import { FaLock } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useChannel, useChannelData } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
export default function ChangeChannelNameForm({ channelName }) {
    const { channelId } = useParams();
    const { channel } = useChannel(channelId);
    const {  permissions } =
        useChannelData(channelId);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: channel.name,
    });
    const [success, setSuccess] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        post(route("channel.edit_name", channel.id), {
            preserveState: true,
            only: ["channel", "channels"],
            onSuccess: () => {
                setSuccess(true);
            },

            headers: {
                "X-Socket-Id": Echo.socketId(),
            },
        });
    }
    return (
        <Form1
            disabled={!permissions.updateName || channel.type == "DIRECT"}
            className="p-4"
            errors={errors}
            success={success}
            submit={onSubmit}
            submitting={processing}
            title="Rename this channel"
            buttonName="Save changes"
            activateButtonNode={
                <SettingsButton
                    disabled={
                        !permissions.updateName || channel.type == "DIRECT"
                    }
                    onClick={() => {
                        setSuccess(false);
                    }}
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
            {!permissions.updateName && (
                <h3 className="text-lg my-4">
                    ⚠️You are not allowed to rename channel, contact admins or
                    channel managers for more information.
                </h3>
            )}
            <TextInput
                disabled={!permissions.updateName}
                row={1}
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
            />
        </Form1>
    );
}
