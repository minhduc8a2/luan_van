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
export default function Settings({ channel, channelName, workspace }) {
    const { permissions } = usePage().props;

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
                <hr />
                <Button className=" !hover:text-danger bg-transparent w-full py-4 !rounded-none">
                    <div className="flex items-center gap-x-2 text-danger">
                        <FiArchive className="" /> Archive channel for everyone
                    </div>
                </Button>

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
