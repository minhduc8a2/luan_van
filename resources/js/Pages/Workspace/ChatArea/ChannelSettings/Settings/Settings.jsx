import React from "react";
import { FiArchive } from "react-icons/fi";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { useState } from "react";
import ChangeToPrivateConfirm from "./ChangeToPrivateConfirm";
import { router, usePage } from "@inertiajs/react";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import DeleteChannel from "./DeleteChannel";
export default function Settings({ channel, channelName, workspace }) {
    const { permissions } = usePage().props;
    if (channel.is_main_channel) return "";
   
    return (
        <div className="p-6">
            <ChangeToPrivateConfirm
                channel={channel}
                channelName={channelName}
                workspace={workspace}
            />
            <Button className="!text-danger !hover:text-danger bg-transparent w-full border-t-0 !rounded-none border  border-white/15 py-4">
                <div className="flex items-center gap-x-2">
                    <FiArchive className="" /> Archive channel for everyone
                </div>
            </Button>
            {permissions.deleteChannel && (
                <DeleteChannel />
            )}
        </div>
    );
}
