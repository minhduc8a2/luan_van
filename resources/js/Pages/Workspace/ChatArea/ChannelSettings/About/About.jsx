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
export default function About({ channelName }) {
    const { auth, channel, channelUsers } = usePage().props;
    const directChannelUser = useMemo(
        () =>
            channel.type == "DIRECT" &&
            getDirectChannelUser(channel, channelUsers, auth.user),
        [channel, auth]
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
                    description={`${channel.user.name} on ${UTCToDateTime(
                        channel.created_at
                    )}`}
                    className={`border-t-0 ${
                        channel.is_main_channel ? "  " : ""
                    }`}
                    hasEdit={false}
                />
            )}
            {channel.type != "DIRECT" && channel.type != "SELF" && <Managers />}
            {channel.type != "DIRECT" && channel.type != "SELF" && (
                <LeaveChannel channel={channel} />
            )}
            {channel.type == "DIRECT" && (
                <div className="border border-white/15 rounded-br-lg rounded-bl-lg p-4 border-t-0">
                    <h5 className="font-bold text-white/85 text-sm">
                        Contact information
                    </h5>
                    <div className="flex mt-2 items-center gap-x-3">
                        <div className="">
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
                </div>
            )}
        </>
    );
}
