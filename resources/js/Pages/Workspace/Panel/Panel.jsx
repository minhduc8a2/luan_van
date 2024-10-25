import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { LuPlus } from "react-icons/lu";

import { usePage } from "@inertiajs/react";
import { InvitationForm } from "./InvitationForm";
import { DirectChannel } from "./DirectChannel";
import { useSelector } from "react-redux";

import { CreateChannelForm } from "./createChannelForm";

import { memo, useContext, useMemo, useState, useTransition } from "react";
import { useParams } from "react-router-dom";
import useGoToChannel from "@/helpers/useGoToChannel";
import ThemeContext from "@/ThemeProvider";
import WorkspaceOptions from "./WorkspaceOptions";
import PublicChannel from "./PublicChannel";
import PrivateChannel from "./PrivateChannel";

const Panel = memo(function Panel() {
    const { auth } = usePage().props;
    const [isInvitationFormOpen, setIsInvitationFormOpen] = useState(false);
    const { workspace, workspacePermissions } = useSelector(
        (state) => state.workspace
    );
    const { channelId, workspaceId } = useParams();
    const { theme } = useContext(ThemeContext);
    const { channels } = useSelector((state) => state.channels);

    const goToChannel = useGoToChannel();
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    function changeChannel(channelId) {
        goToChannel(workspaceId, channelId);
    }
    const directChannels = useMemo(() => {
        return channels.filter((cn) => cn.type == "DIRECT");
    }, [channels]);
    const selfChannel = useMemo(() => {
        return channels.find((cn) => cn.type == "SELF");
    }, [channels]);
    const currentUser =
        useMemo(() => {
            return workspaceUsers.find((u) => u.id == auth.user.id);
        }, [workspaceUsers]) || auth.user;
    return (
        <div
            className={`${
                theme.mode ? "bg-black/35" : "bg-white/15"
            } h-full  rounded-l-lg rounded-s-lg border-r border-r-white/15`}
        >
            <div className="flex justify-between items-center p-4">
                <WorkspaceOptions workspace={workspace} />
                {/* <HiOutlinePencilAlt className="text-xl opacity-75" /> */}
            </div>
            <hr className=" opacity-10" />
            <div className="opacity-85 pl-4 pr-4 pt-4">
                <div className=" grid-item  px-4">
                    <BiMessageRoundedDetail className="text-xl" />
                    <div className="">Threads</div>
                </div>
                <div className="mt-6">
                    <div className="grid-item  px-4">
                        <div className="flex items-center">
                            <FaCaretDown className="text-lg" />
                        </div>
                        <div className="">Channels</div>
                    </div>
                    <ul className="max-h-[30vh] overflow-y-auto scrollbar">
                        {channels.map((channel) => {
                            if (channel.type === "PUBLIC")
                                return (
                                    <li key={channel.id}>
                                        <PublicChannel
                                            channel={channel}
                                            changeChannel={changeChannel}
                                        />
                                    </li>
                                );
                            else if (channel.type === "PRIVATE")
                                return (
                                    <li key={channel.id}>
                                        <PrivateChannel
                                            channel={channel}
                                            changeChannel={changeChannel}
                                        />
                                    </li>
                                );
                            else return "";
                        })}
                    </ul>
                    <CreateChannelForm
                        callback={(channelId) => changeChannel(channelId)}
                        activateButtonNode={
                            <div className="grid-item mt-2 px-4">
                                <div className="flex items-center ">
                                    <LuPlus className="text-sm" />
                                </div>
                                <div className="">Add channels</div>
                            </div>
                        }
                    />
                </div>
                <div className="mt-6">
                    <div className="grid-item px-4">
                        <div className="flex items-center ">
                            <FaCaretDown className="text-lg" />
                        </div>
                        <div className="">Direct messages</div>
                    </div>
                    <ul className="max-h-[30vh] overflow-y-auto scrollbar">
                        {directChannels.map((directCn) => {
                            const userIds = directCn.name.split("_");
                            const userId = userIds.find(
                                (id) => id != auth.user.id
                            );
                            let user;
                            if (userId) {
                                user = workspaceUsers.find(
                                    (u) => u.id == userId
                                );
                            }
                            if (!user || user.is_hidden) return "";
                            return (
                                <DirectChannel
                                    key={user.id}
                                    user={user}
                                    channel={directCn}
                                />
                            );
                        })}
                        <DirectChannel
                            isOnline={true}
                            user={{ ...currentUser, online: true }}
                            channel={selfChannel}
                        />
                    </ul>
                    {workspacePermissions?.inviteToWorkspace && (
                        <button
                            className="grid-item mt-2 px-4 w-fit"
                            onClick={() => {
                                setIsInvitationFormOpen(true);
                            }}
                        >
                            <div className="flex items-center w-full h-full">
                                <LuPlus className="text-sm" />
                            </div>
                            <div className="">Add coworkers</div>
                        </button>
                    )}
                    <InvitationForm
                        workspace={workspace}
                        isOpen={isInvitationFormOpen}
                        onClose={() => setIsInvitationFormOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
});

export default Panel;
