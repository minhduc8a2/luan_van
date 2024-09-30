import React from "react";
import { FiArchive } from "react-icons/fi";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { useState } from "react";
import ChangeToPrivateConfirm from "./ChangeToPrivateConfirm";
import { router, usePage } from "@inertiajs/react";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import DeleteChannel from "./DeleteChannel";
import ChannelPermissions from "./ChannelPermissions";
import ArchiveChannel from "./ArchiveChannel";
import { useChannelData } from "@/helpers/customHooks";
export default function Settings({ channel, channelName, workspace }) {
    const { channelId } = usePage().props;
    const { permissions } = useChannelData(channelId);

    return (
        <div className="p-6 ">
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
