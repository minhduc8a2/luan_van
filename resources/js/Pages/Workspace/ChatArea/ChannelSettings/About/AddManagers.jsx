import { router, useForm, usePage } from "@inertiajs/react";
import React from "react";

import AutocompleInput from "./AutocompleInput";
import Button from "@/Components/Button";
import { useState } from "react";
import { FaLock } from "react-icons/fa";

import { useChannel, useChannelUsers } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import useErrorHandler from "@/helpers/useErrorHandler";
export default function AddManagers({ close, setErrors }) {
    const { channelId } = useParams();
    const { channelUsers } = useChannelUsers(channelId);
    const { channel } = useChannel(channelId);
    const [choosenUsers, setChoosenUsers] = useState({});

    const [processing, setProcessing] = useState(false);
    const errorHandler = useErrorHandler();
    function submit() {
        setProcessing(true);
        axios
            .post(route("channels.addManagers", channel.id), {
                users: [...Object.values(choosenUsers)],
            })
            .then(() => {
                setProcessing(false);
                close();
            })
            .catch(errorHandler);
    }
    return (
        <div className="min-w-96 p-4 text-white/85 max-w-lg">
            <div className="text-2xl flex items-baseline gap-x-2 p-2 pb-0 font-bold text-white/85">
                Add Channel Managers for{" "}
                <div className="flex items-center gap-x-1">
                    {channel.type == "PUBLIC" ? (
                        <span className="text-lg">#</span>
                    ) : (
                        <FaLock className="text-sm" />
                    )}{" "}
                    {channel.name}
                </div>
            </div>

            <p className="p-2">
                Channel Managers must be existing members of this channel.
            </p>
            <div className="mt-4">
                <AutocompleInput
                    users={channelUsers}
                    choosenUsers={choosenUsers}
                    setChoosenUsers={(value) => setChoosenUsers(value)}
                />
            </div>
            
            <div className="flex justify-end gap-x-4 mt-8">
                <Button onClick={close}>Cancel</Button>
                <Button loading={processing} onClick={submit}>
                    Add
                </Button>
            </div>
        </div>
    );
}
