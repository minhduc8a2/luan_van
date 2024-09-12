import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import { router, useForm, usePage } from "@inertiajs/react";
import React from "react";
import { SettingsButton } from "./SettingsButton";
import { FaLock } from "react-icons/fa";
import TextInput from "@/Components/Input/TextInput";
import { IoPersonAddOutline } from "react-icons/io5";
import AvatarAndName from "@/Components/AvatarAndName";
import { useState } from "react";
import AddManagers from "./AddManagers";
import ErrorsList from "@/Components/ErrorsList";
import { useSelector } from "react-redux";
export default function Managers() {
    const { managers, channel } = usePage().props;
    const onlineStatusMap = useSelector((state) => state.onlineStatus);

    const [searchValue, setSearchValue] = useState("");
    const [errors, setErrors] = useState(null);
    function removeManager(user) {
        router.post(
            route("channel.remove_manager", channel.id),
            {
                user,
            },
            {
                preserveState: true,
                only: ["managers","permissions"],
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
        <OverlayPanel
            buttonNode={
                <SettingsButton
                    className={`border-t-0 ${
                        channel.is_main_channel
                            ? "rounded-bl-lg rounded-br-lg"
                            : ""
                    }`}
                    onClick={() => setErrors(null)}
                    title="Manage by"
                    description={
                        <div>
                            {managers.length == 0 &&
                                "Ask admins to add channel managers"}
                            {managers.map((user, index) => {
                                if (index == managers.length - 1)
                                    return (
                                        <span
                                            className="text-link"
                                            key={"name_" + user.id}
                                        >
                                            {user.name}
                                        </span>
                                    );
                                else if (index == managers.length - 2)
                                    return (
                                        <span key={"name_" + user.id}>
                                            <span className="text-link">
                                                {user.name}
                                            </span>{" "}
                                            and{" "}
                                        </span>
                                    );
                                else
                                    return (
                                        <span key={"name_" + user.id}>
                                            <span className="text-link">
                                                {user.name}
                                            </span>
                                            ,{" "}
                                        </span>
                                    );
                            })}
                        </div>
                    }
                />
            }
        >
            {({ close }) => (
                <div className="w-[500px] pb-4  rounded-lg bg-background">
                    <div className="text-xl flex items-baseline gap-x-2 p-6 pb-0 font-bold text-white/85">
                        People who can manage{" "}
                        <div className="flex items-center gap-x-1">
                            {channel.type != "PUBLIC" ? (
                                <span className="text-lg">#</span>
                            ) : (
                                <FaLock className="text-sm" />
                            )}{" "}
                            {channel.name}
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-white/50 pl-6">
                        {managers.length} Channel Managers
                    </div>
                    <div className="my-4 mx-6">
                        <TextInput
                            placeholder="Search Channel Managers"
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                            }}
                        />
                    </div>
                    <div className="mx-6">
                        <ErrorsList errors={errors} />
                    </div>
                    <OverlayPanel
                        buttonNode={
                            <button className="flex gap-x-4 p-4 px-6 items-center mt-6 hover:bg-white/15 w-full">
                                <div className=" rounded p-2 bg-link/15">
                                    <IoPersonAddOutline className="text-link text-xl" />
                                </div>
                                Add Channel Managers
                            </button>
                        }
                    >
                        {({ close }) => (
                            <AddManagers close={close} setErrors={setErrors} />
                        )}
                    </OverlayPanel>

                    <ul className="overflow-hidden h-[30vh]">
                        {managers
                            .filter((user) =>
                                user.name
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase())
                            )
                            .map((user) => (
                                <div
                                    className="px-6 py-4 flex justify-between items-center group hover:bg-white/15"
                                    key={"manager_" + user.id}
                                >
                                    <AvatarAndName
                                        className="h-10 w-10"
                                        user={user}
                                        isOnline={onlineStatusMap[user.id]}
                                    />
                                    <button
                                        className="text-link text-sm hover:underline hidden group-hover:block"
                                        onClick={() => removeManager(user)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                    </ul>
                </div>
            )}
        </OverlayPanel>
    );
}
