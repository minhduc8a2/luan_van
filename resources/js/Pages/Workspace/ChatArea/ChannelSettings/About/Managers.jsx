import React, { useMemo } from "react";
import { SettingsButton } from "./SettingsButton";
import { FaLock } from "react-icons/fa";
import TextInput from "@/Components/Input/TextInput";
import { IoPersonAddOutline } from "react-icons/io5";
import AvatarAndName from "@/Components/AvatarAndName";
import { useState } from "react";
import AddManagers from "./AddManagers";
import ErrorsList from "@/Components/ErrorsList";
import { useSelector } from "react-redux";
import { useChannel, useChannelData, useManagers } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import useErrorHandler from "@/helpers/useErrorHandler";
import CustomedDialog from "@/Components/CustomedDialog";
export default function Managers() {
    const { channelId, workspaceId } = useParams();
    const { channel } = useChannel(channelId);
    const { permissions } = useChannelData(channelId);
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    const { managers } = useManagers(channelId);
    const [searchValue, setSearchValue] = useState("");
    const [errors, setErrors] = useState(null);
    const errorHandler = useErrorHandler();
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenAddManager, setIsOpenAddManager] = useState(false);
    function removeManager(user) {
        axios
            .post(
                route("channels.removeManager", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {
                    user,
                },
                {
                    headers: {
                        "X-Socket-Id": Echo.socketId(),
                    },
                }
            )
            .catch(errorHandler);
    }
    return (
        <>
            <SettingsButton
                disabled={!permissions.addManagers}
                className={`border-t-0 ${
                    channel.is_main_channel ? "rounded-bl-lg rounded-br-lg" : ""
                }`}
                onClick={() => setIsOpen(true)}
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
                                        {user.display_name || user.name}
                                    </span>
                                );
                            else if (index == managers.length - 2)
                                return (
                                    <span key={"name_" + user.id}>
                                        <span className="text-link">
                                            {user.display_name || user.name}
                                        </span>{" "}
                                        and{" "}
                                    </span>
                                );
                            else
                                return (
                                    <span key={"name_" + user.id}>
                                        <span className="text-link">
                                            {user.display_name || user.name}
                                        </span>
                                        ,{" "}
                                    </span>
                                );
                        })}
                    </div>
                }
            />
            <CustomedDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="px-0 w-fit"
            >
                <div className="w-[500px] pb-4  rounded-lg bg-background">
                    <div className="text-xl flex items-baseline gap-x-2 p-6 pb-0 font-bold text-color-high-emphasis">
                        People who can manage{" "}
                        <div className="flex items-center gap-x-1">
                            {channel.type == "PUBLIC" ? (
                                <span className="text-lg">#</span>
                            ) : (
                                <FaLock className="text-sm" />
                            )}{" "}
                            {channel.name}
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-color-medium-emphasis pl-6">
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
                    {permissions.addManagers && (
                        <>
                            <button
                                className="flex gap-x-4 p-4 px-6 text-color-high-emphasis items-center mt-6 hover:bg-color/15 w-full"
                                onClick={() => setIsOpenAddManager(true)}
                            >
                                <div className=" rounded p-2 bg-link/15">
                                    <IoPersonAddOutline className="text-link text-xl" />
                                </div>
                                Add Channel Managers
                            </button>
                            <CustomedDialog
                                isOpen={isOpenAddManager}
                                onClose={() => setIsOpenAddManager(false)}
                                className="px-0 w-fit"
                            >
                                <AddManagers
                                    close={() => setIsOpenAddManager(false)}
                                />
                            </CustomedDialog>
                        </>
                    )}

                    <ul className="overflow-hidden h-[30vh]">
                        {managers
                            .filter((user) => {
                                const lowerCaseValue =
                                    searchValue.toLowerCase();
                                return (
                                    user.display_name
                                        ?.toLowerCase()
                                        .includes(lowerCaseValue) ||
                                    user.name
                                        .toLowerCase()
                                        .includes(lowerCaseValue)
                                );
                            })
                            .map((user) => (
                                <div
                                    className="px-6 py-4 flex justify-between items-center group hover:bg-color/15"
                                    key={"manager_" + user.id}
                                >
                                    <AvatarAndName
                                        className="h-10 w-10"
                                        user={user}
                                        isOnline={onlineStatusMap[user.id]}
                                    />
                                    {permissions.addManagers && (
                                        <button
                                            className="text-link text-sm hover:underline hidden group-hover:block"
                                            onClick={() => removeManager(user)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                    </ul>
                </div>
            </CustomedDialog>
        </>
    );
}
