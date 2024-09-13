import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import { router, usePage } from "@inertiajs/react";

import TextInput from "@/Components/Input/TextInput";
import { IoPersonAddOutline } from "react-icons/io5";
import { useState } from "react";
import ErrorsList from "@/Components/ErrorsList";
import AddPeople from "./AddPeople";
import Member from "./Member";
export default function Members() {
    const [errors, setErrors] = useState(null);
    const { managers, channel, channelUsers, permissions } = usePage().props;
    const [searchValue, setSearchValue] = useState("");
    function removeChannelManager(user) {
        router.post(
            route("channel.remove_manager", channel.id),
            {
                user,
            },
            {
                preserveState: true,
                only: ["managers", "permissions"],
                onError: (errors) => {
                    setErrors(errors);
                },
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }
    function makeChannelManager(user) {
        router.post(
            route("channel.add_managers", channel.id),
            {
                users: [user],
            },
            {
                preserveState: true,
                only: ["managers"],
                onError: (errors) => {
                    setErrors(errors);
                },
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }
    function removeFromChannel(user) {
        router.post(
            route("channel.remove_user_from_channel", channel.id),
            {
                user,
            },
            {
                preserveState: true,
                only: ["channelUsers", "permissions", "messages"],
                onError: (errors) => {
                    setErrors(errors);
                },
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }

    return (
        <div className="">
            <div className="my-4 mx-6">
                <TextInput
                    placeholder="Find members"
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                    }}
                />
            </div>
            <div className="mx-6">
                <ErrorsList errors={errors} />
            </div>
            {permissions.addUsersToChannel && (
                <OverlayPanel
                    buttonNode={
                        <button className="flex gap-x-4 p-4 px-6 items-center mt-6 hover:bg-white/15 w-full">
                            <div className=" rounded p-2 bg-link/15">
                                <IoPersonAddOutline className="text-link text-xl" />
                            </div>
                            Add People
                        </button>
                    }
                >
                    {({ close }) => (
                        <AddPeople close={close} setErrors={setErrors} />
                    )}
                </OverlayPanel>
            )}

            <ul className="overflow-hidden h-[30vh]">
                {channelUsers
                    .filter((user) =>
                        user.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                    )
                    .map((user) => (
                        <Member
                            key={"manager_" + user.id}
                            user={user}
                            makeChannelManager={makeChannelManager}
                            removeFromChannel={removeFromChannel}
                            removeChannelManager={removeChannelManager}
                        />
                    ))}
            </ul>
        </div>
    );
}
