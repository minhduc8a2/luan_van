import React from "react";
import ChangeChannelNameForm from "./ChangeChannelNameForm";
import { EditDescriptionForm } from "./EditDescriptionForm";
import Button from "@/Components/Button";

import { SettingsButton } from "./SettingsButton";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
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
                className="border-t-0"
                hasEdit={false}
            />
            <Button className="!text-danger !hover:text-danger bg-transparent w-full rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg border border-t-0 border-white/15 py-4">
                Leave channel
            </Button>
        </>
    );
}
