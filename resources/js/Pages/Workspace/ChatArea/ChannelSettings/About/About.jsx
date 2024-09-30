import React, { useMemo } from "react";
import ChangeChannelNameForm from "./ChangeChannelNameForm";
import { EditDescriptionForm } from "./EditDescriptionForm";
import Button from "@/Components/Button";

import { SettingsButton } from "./SettingsButton";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import LeaveChannel from "./LeaveChannel";
import Managers from "./Managers";
import { getDirectChannelUser } from "@/helpers/channelHelper";
import { usePage } from "@inertiajs/react";
import { MdOutlineEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "@/Store/profileSlice";
import { useChannelData } from "@/helpers/customHooks";
export default function About({ channelName, onClose }) {
    const { auth, channelId } = usePage().props;
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { channels } = useSelector((state) => state.channels);
    const {permissions} = useChannelData(channelId);
    const channel = useMemo(
        () => channels.find((cn) => cn.id == channelId),
        [channels, channelId]
    );
    const channelOwner = useMemo(
        () => workspaceUsers.find((u) => u.id == channel.user_id),
        [channel, workspaceUsers]
    );
    const dispatch = useDispatch();
    const directChannelUser = useMemo(
        () =>
            channel.type == "DIRECT" &&
            getDirectChannelUser(channel, workspaceUsers, auth.user),
        [channel, auth, workspaceUsers]
    );
    return (
        <>
            <ChangeChannelNameForm channelName={channelName} />
            {channel.type != "DIRECT" && channel.type != "SELF" && (
                <EditDescriptionForm channelName={channelName} />
            )}

            {channel.type != "DIRECT" && channel.type != "SELF" && (
                <SettingsButton
                    title="Created by"
                    description={`${
                        channelOwner.display_name || channelOwner.name
                    } on ${UTCToDateTime(channel.created_at)}`}
                    className={`border-t-0 ${
                        channel.is_main_channel ? "  " : ""
                    }`}
                    hasEdit={false}
                />
            )}
            {channel.type != "DIRECT" && channel.type != "SELF" && <Managers />}
            {channel.type != "DIRECT" && channel.type != "SELF" && permissions.leave && (
                <LeaveChannel channel={channel} />
            )}
            {channel.type == "DIRECT" && (
                <div className="border border-white/15 rounded-br-lg rounded-bl-lg p-4 border-t-0">
                    <h5 className="font-bold text-white/85 text-sm">
                        Contact information
                    </h5>
                    <div className="flex mt-2 items-center gap-x-3">
                        <div className="w-6">
                            <MdOutlineEmail className="text-2xl" />
                        </div>
                        <div className="flex flex-col justify-between items-start">
                            <div className="text-sm font-semibold text-white/85">
                                Email Address
                            </div>
                            <div className="text-sm text-link">
                                {directChannelUser.email}
                            </div>
                        </div>
                    </div>
                    {directChannelUser.phone && (
                        <div className="flex mt-2 items-center gap-x-3">
                            <div className="w-6">
                                <FaPhone className="text-lg -scale-x-100 " />
                            </div>
                            <div className="flex flex-col justify-between items-start">
                                <div className="text-sm font-semibold text-white/85">
                                    Phone
                                </div>
                                <div className="text-sm text-link">
                                    {directChannelUser.phone}
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        className="text-link hover:underline font-bold mt-4"
                        onClick={() => {
                            onClose();
                            dispatch(setProfile(directChannelUser.id));
                        }}
                    >
                        View full profile
                    </button>
                </div>
            )}
        </>
    );
}
