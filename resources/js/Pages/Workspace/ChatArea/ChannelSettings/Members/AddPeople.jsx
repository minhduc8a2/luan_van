import { router, useForm, usePage } from "@inertiajs/react";
import React from "react";
import AvatarAndName from "@/Components/AvatarAndName";
import AutocompleInput from "./AutocompleInput";
import Button from "@/Components/Button";
import { useState } from "react";
import { FaLock } from "react-icons/fa";

export default function AddPeople({ close, setErrors }) {
    const { channelUsers, auth, channel, users, workspace } = usePage().props;
    const [choosenUsers, setChoosenUsers] = useState({});

    const [processing, setProcessing] = useState(false);

    function submit() {
        setProcessing(true);
        router.post(
            route("channel.add_users_to_channel", channel.id),
            {
                users: [...Object.values(choosenUsers)],
            },
            {
                preserveState: true,
                only: ["channelUsers"],
                onError: (errors) => {
                    setErrors(errors);
                },
                onFinish: () => {
                    setProcessing(false);
                    close();
                },
            }
        );
    }
    return (
        <div className="min-w-96 p-4 text-white/85 max-w-lg">
            <div className="text-2xl flex items-baseline gap-x-2 p-2 pb-0 font-bold text-white/85">
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
                You can only add other people from {workspace.name} to this channel.
            </p>
            <div className="mt-4">
                <AutocompleInput
                    users={users}
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
