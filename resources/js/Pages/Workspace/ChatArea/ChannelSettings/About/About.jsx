import React, { useContext, useMemo } from "react";
import ChangeChannelNameForm from "./ChangeChannelNameForm";
import { EditDescriptionForm } from "./EditDescriptionForm";

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
import { useParams } from "react-router-dom";
import { ChannelSettingsContext } from "../ChannelSettings";
export default function About({ channelName }) {
    const { auth } = usePage().props;
    const { channelId } = useParams();
    const {setShow} = useContext(ChannelSettingsContext)
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { channels } = useSelector((state) => state.channels);
    const { permissions } = useChannelData(channelId);
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
        <div className="border border-color/15 rounded-lg ">
            <ChangeChannelNameForm channelName={channelName} />
            {channel.type != "DIRECT" && channel.type != "SELF" && (
                <>
                    <hr />
                    <EditDescriptionForm channelName={channelName} />
                </>
            )}

            {channel.type != "DIRECT" && channel.type != "SELF" && (
                <>
                    <hr />

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
                </>
            )}
            {channel.type != "DIRECT" && channel.type != "SELF" && (
                <>
                    <hr />

                    <Managers />
                </>
            )}
            {permissions.leave && (
                <>
                    <hr />

                    <LeaveChannel channel={channel} />
                </>
            )}
            {channel.type == "DIRECT" && (
                <div className="border border-color/15 rounded-br-lg rounded-bl-lg p-4 border-t-0">
                    <h5 className="font-bold text-color-high-emphasis text-sm">
                        Contact information
                    </h5>
                    <div className="flex mt-2 items-center gap-x-3">
                        <div className="w-6">
                            <MdOutlineEmail className="text-2xl" />
                        </div>
                        <div className="flex flex-col justify-between items-start">
                            <div className="text-sm font-semibold text-color-high-emphasis">
                                Email Address
                            </div>
                            <a href={"mailto:"+directChannelUser.email}  className="text-sm text-link">
                                {directChannelUser.email}
                            </a>
                        </div>
                    </div>
                    {directChannelUser.phone && (
                        <div className="flex mt-2 items-center gap-x-3">
                            <div className="w-6">
                                <FaPhone className="text-lg -scale-x-100 " />
                            </div>
                            <div className="flex flex-col justify-between items-start">
                                <div className="text-sm font-semibold text-color-high-emphasis">
                                    Phone
                                </div>
                                <a href={"tel:"+directChannelUser.phone} className="text-sm text-link">
                                    {directChannelUser.phone}
                                </a>
                            </div>
                        </div>
                    )}
                    <button
                        className="text-link hover:underline font-bold mt-4"
                        onClick={() => {
                            setShow(false)
                            dispatch(setProfile(directChannelUser.id));
                        }}
                    >
                        View full profile
                    </button>
                </div>
            )}
        </div>
    );
}
