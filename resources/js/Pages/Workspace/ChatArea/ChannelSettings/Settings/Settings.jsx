import React from "react";
import { FiArchive } from "react-icons/fi";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";

import ChangeToPrivateConfirm from "./ChangeToPrivateConfirm";
export default function Settings({ channel, channelName, workspace }) {
    return (
        <>
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
            <Button className="!text-danger !hover:text-danger bg-transparent w-full rounded-tl-none rounded-tr-none rounded-bl-lg rounded-br-lg border border-t-0 border-white/15 py-4 ">
                <div className="flex items-center gap-x-2">
                    <FaRegTrashCan className="" /> Delete this channel
                </div>
            </Button>
        </>
    );
}
