import TextInput from "@/Components/Input/TextInput";
import { IoPersonAddOutline } from "react-icons/io5";
import { useState } from "react";
import ErrorsList from "@/Components/ErrorsList";
import AddPeople from "./AddPeople";
import Member from "./Member";

import { useChannelData, useChannelUsers } from "@/helpers/customHooks";

import useErrorHandler from "@/helpers/useErrorHandler";
import { useParams } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";

export default function Members() {
    const [errors, setErrors] = useState(null);
    const { channelId, workspaceId } = useParams();

    const { permissions } = useChannelData(channelId);
    const { channelUsers } = useChannelUsers(channelId);
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const handleError = useErrorHandler();
    function removeChannelManager(user) {
        axios
            .post(
                route("channels.removeManager", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {
                    user,
                }
            )
            .catch(handleError);
    }
    function makeChannelManager(user) {
        axios
            .post(
                route("channels.addManagers", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {
                    users: [user],
                }
            )
            .catch(handleError);
    }
    function removeFromChannel(user) {
        axios
            .post(
                route("channel.remove_user_from_channel", {
                    workspace: workspaceId,
                    channel: channelId,
                }),
                {
                    user,
                }
            )
            .catch(handleError);
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
                <>
                    <button
                        className="flex gap-x-4 p-4 px-6 items-center mt-6 hover:bg-color/15 w-full"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className=" rounded p-2 bg-link/15">
                            <IoPersonAddOutline className="text-link text-xl" />
                        </div>
                        Add People
                    </button>
                    <CustomedDialog
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    >
                        <AddPeople close={() => setIsOpen(false)} />
                    </CustomedDialog>
                </>
            )}

            <ul className="overflow-hidden h-[30vh]">
                {channelUsers
                    .filter((user) => {
                        const lowerCaseValue = searchValue.toLowerCase();
                        return (
                            user.display_name
                                ?.toLowerCase()
                                .includes(lowerCaseValue) ||
                            user.name.toLowerCase().includes(lowerCaseValue)
                        );
                    })
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
