import React from "react";
import { FiArchive } from "react-icons/fi";
import Button from "@/Components/Button";
import { FaRegTrashCan } from "react-icons/fa6";
import { BiLockAlt } from "react-icons/bi";

import OverlayNotification from "@/Components/Overlay/OverlayNotification";
export default function Settings({ channel, channelName, workspace }) {
    return (
        <>
            <OverlayNotification
                title="Change to a private channel?"
                buttonNode={
                    <Button className=" bg-transparent w-full rounded-tl-lg rounded-tr-lg rounded-bl-none rounded-br-none border  border-white/15 py-4">
                        <div className="flex items-center gap-x-2">
                            <BiLockAlt /> Change to a private channel
                        </div>
                    </Button>
                }
                submitButtonNode={
                    <Button className="!bg-danger ">Change to Private</Button>
                }
            >
                <div className="">
                    <p>
                        Keep in mind that when you make # {channelName} a
                        private channel:
                    </p>
                    <ul className="flex list-disc flex-col gap-y-2 mt-2 list-outside pl-4">
                        <li>
                            No changes will be made to the channel’s history or
                            members
                        </li>
                        <li>
                            All files shared in this channel up until this point
                            will be publicly accessible to everyone in{" "}
                            {workspace.name}
                        </li>
                    </ul>
                </div>
            </OverlayNotification>
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
