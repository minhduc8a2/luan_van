import React from "react";

import ChangeToPrivateConfirm from "./ChangeToPrivateConfirm";

import DeleteChannel from "./DeleteChannel";
import ChannelPermissions from "./ChannelPermissions";
import ArchiveChannel from "./ArchiveChannel";
import { useChannelData } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
export default function Settings({ channel, channelName, workspace }) {
   
    const {channelId} = useParams()
    const { permissions } = useChannelData(channelId);

    return (
        <div className=" ">
            <div className="border border-white/15 rounded-lg overflow-hidden">
                {permissions.updatePermissions && <ChannelPermissions />}

                {permissions.changeType && (
                    <>
                        {permissions.updatePermissions && <hr />}
                        <ChangeToPrivateConfirm
                            channel={channel}
                            channelName={channelName}
                            workspace={workspace}
                        />
                    </>
                )}

                {permissions.archive && (
                    <>
                        <hr />
                        <ArchiveChannel />
                    </>
                )}

                {permissions.deleteChannel && (
                    <>
                        <hr />
                        <DeleteChannel />
                    </>
                )}
            </div>
        </div>
    );
}
