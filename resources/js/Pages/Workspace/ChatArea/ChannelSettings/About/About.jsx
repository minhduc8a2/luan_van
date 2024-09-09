import React from "react";
import ChangeChannelNameForm from "./ChangeChannelNameForm";
import { EditDescriptionForm } from "./EditDescriptionForm";
import Button from "@/Components/Button";

import { SettingsButton } from "./SettingsButton";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import LeaveChannel from "./LeaveChannel";
export default function About({ channel, channelName }) {
    return (
        <>
            <ChangeChannelNameForm channelName={channelName} />
            <EditDescriptionForm channelName={channelName} />
            <SettingsButton
                title="Created by"
                description={`${channel.user.name} on ${UTCToDateTime(
                    channel.created_at
                )}`}
                className={`border-t-0 ${channel.is_main_channel?" rounded-bl-lg rounded-br-lg ":""}`}
                hasEdit={false}
            />
            <LeaveChannel channel={channel}/>
        </>
    );
}
