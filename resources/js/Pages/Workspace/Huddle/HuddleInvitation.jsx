import { router, usePage } from "@inertiajs/react";
import React from "react";
import AvatarAndName from "@/Components/AvatarAndName";
import AutocompleInput from "./AutocompleInput";
import Button from "@/Components/Button";
import { useState } from "react";
export default function HuddleInvitation({ close }) {
    const { flash } = usePage().props;
    const { channelUsers, auth, channel, data } = usePage().props;
    const [choosenUsers, setChoosenUsers] = useState({});
    function submit() {
        router.post(
            route("huddle.invitation", channel.id),
            { users: [...Object.values(choosenUsers)] },
            {
                preserveState: true,
            }
        );
    }

    if (flash.data && flash.data.type == "HUDDLE_INVITATION_RESPONSE") {
        const invitedUsers = [...Object.values(choosenUsers)];

        return (
            <div className="min-w-96 p-4 text-white/85 max-w-lg">
                <h3 className="font-bold text-xl">
                    Invite people to your huddle
                </h3>
                <div className="mt-4">
                    Invitations has been sent to{" "}
                    {invitedUsers.map((user, index) => {
                        return (
                            <span key={user.id} className="text-link">
                                {`${user.name}${
                                    index != invitedUsers.length - 1 ? ", " : ""
                                }`}
                            </span>
                        );
                    })}
                </div>
                <div className="flex justify-end gap-x-4 mt-8">
                    <Button
                        onClick={() => {
                            close();
                            flash.data = null;
                        }}
                    >
                        Close
                    </Button>
                </div>
            </div>
        );
    }
    return (
        <div className="min-w-96 p-4 text-white/85 max-w-lg">
            <h3 className="font-bold text-xl">Invite people to your huddle</h3>

            <p className="text-sm max-w-[90%]">
                {
                    "You can invite whomever you’d like to the huddle, and they’ll receive a notification to join."
                }
            </p>
            <div className="mt-4">
                <AutocompleInput
                    users={channelUsers}
                    choosenUsers={choosenUsers}
                    setChoosenUsers={(value) => setChoosenUsers(value)}
                />
            </div>
            <h4 className="text-sm font-bold mt-8">Suggested</h4>
            <ul className="mt-4 flex flex-col gap-y-4 h-40 overflow-y-auto scrollbar ">
                {channelUsers.map((user) => {
                    if (user.id == auth.user.id) return "";
                    return (
                        <li className="w-ful" key={user.id}>
                            <button
                                onClick={() => {
                                    setChoosenUsers((pre) => ({
                                        ...pre,
                                        [user.id]: user,
                                    }));
                                }}
                                className="w-full"
                            >
                                <AvatarAndName
                                    user={user}
                                    className="h-10 w-10"
                                />
                            </button>
                        </li>
                    );
                })}
            </ul>
            <div className="flex justify-end gap-x-4">
                <Button onClick={close}>Cancel</Button>
                <Button onClick={submit}>Send</Button>
            </div>
        </div>
    );
}
