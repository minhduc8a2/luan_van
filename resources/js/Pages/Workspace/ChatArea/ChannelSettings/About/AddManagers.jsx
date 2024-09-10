import { router, useForm, usePage } from "@inertiajs/react";
import React from "react";
import AvatarAndName from "@/Components/AvatarAndName";
import AutocompleInput from "./AutocompleInput";
import Button from "@/Components/Button";
import { useState } from "react";
import { FaLock } from "react-icons/fa";
import ErrorsList from "@/Components/ErrorsList";
export default function AddManagers({ close, setErrors }) {
    const { channelUsers, auth, channel } = usePage().props;
    const [choosenUsers, setChoosenUsers] = useState({});

    const [processing, setProcessing] = useState(false);

    function submit() {
        setProcessing(true);
        router.post(
            route("channel.add_managers", channel.id),
            {
                users: [...Object.values(choosenUsers)],
            },
            {
                preserveState: true,
                onSuccess: () => {
                    router.reload({
                        only: ["managers"],
                    });
                },
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
                Add Channel Managers for{" "}
                <div className="flex items-center gap-x-1">
                    {channel.type != "PUBLIC" ? (
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
