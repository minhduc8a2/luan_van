import { router, useForm, usePage } from "@inertiajs/react";
import React, { useMemo } from "react";
import AvatarAndName from "@/Components/AvatarAndName";
import AutocompleInput from "./AutocompleInput";
import Button from "@/Components/Button";
import { useState } from "react";
import { FaLock } from "react-icons/fa";
import { useSelector } from "react-redux";
import useErrorHandler from "@/helpers/useErrorHandler";
import { useParams } from "react-router-dom";

export default function AddPeople({ close, setErrors }) {
    const {channelId} = useParams()
    const {workspace} = useSelector(state=>state.workspace)
    const [choosenUsers, setChoosenUsers] = useState({});
    const { channels } = useSelector((state) => state.channels);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const channel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const [processing, setProcessing] = useState(false);
    const handleError = useErrorHandler();

    function submit() {
        setProcessing(true);
        axios
            .post(route("channel.add_users_to_channel", channel.id), {
                users: [...Object.values(choosenUsers)],
            })

            .catch(handleError)
            .finally(() => {
                setProcessing(false);
                close();
            });
    }
    return (
        <div className="min-w-96  text-color-high-emphasis max-w-lg">
            <div className="text-2xl flex items-baseline gap-x-2 p-2 pb-0 font-bold text-color-high-emphasis">
                Add people to{" "}
                <div className="flex items-center gap-x-1">
                    {channel.type == "PUBLIC" ? (
                        <span className="text-xl">#</span>
                    ) : (
                        <FaLock className="text-sm" />
                    )}{" "}
                    {channel.name}
                </div>
            </div>

            <p className="p-2">
                You can only add other people from {workspace.name} to this
                channel.
            </p>
            <div className="mt-4">
                <AutocompleInput
                    users={workspaceUsers}
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
