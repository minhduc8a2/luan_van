import { usePage } from "@inertiajs/react";
import React from "react";
import { FaToggleOff } from "react-icons/fa6";
import Message from "../ChatArea/Message/Message";
import { FiHeadphones } from "react-icons/fi";
import Avatar from "@/Components/Avatar";
export default function Activity() {
    const { notifications } = usePage().props;
    return (
        <div className="bg-secondary h-full rounded-l-lg rounded-s-lg ">
            <div className="flex justify-between items-end p-4">
                <h3 className="text-xl font-semibold">Activity</h3>

                <div className="flex gap-x-2 items-center">
                    <div className="text-sm  text-white/60">Unreads</div>
                    <FaToggleOff className="text-2xl text-white/60" />
                </div>
            </div>
            <hr className="opacity-15 " />
            <ul className="">
                {notifications.map((notification) => {
                    const { type } = notification;
                    if (type == "huddle_invitation_notification") {
                        const { fromUser, toUser, channel, workspace } =
                            notification.data;
                        return (
                            <li className="p-4 pl-8  hover:bg-white/15 border-b border-white/15">
                                <div className="flex gap-x-2 items-center mb-4">
                                    <FiHeadphones />
                                    <div className="">Huddle</div>
                                </div>
                                <div className={`message-container   `}>
                                    <Avatar
                                        src={"/storage/bot.png"}
                                        className="w-8 h-8"
                                        noStatus={true}
                                    />
                                    <div className="mx-3 ">
                                        <div className="flex gap-x-2 items-end">
                                            <div className="text-sm font-bold">
                                                Snackbot
                                            </div>
                                            <div className="text-xs">
                                                {/* {UTCToTime(message.updated_at)} */}
                                                7:00 PM
                                            </div>
                                        </div>
                                        <div className="">
                                            {`${fromUser.name} has invited you to join huddle in channel `}{" "}
                                            <span className="font-bold">
                                                {channel.name}
                                            </span>{" "}
                                            (
                                            <span className="">
                                                {workspace.name}
                                            </span>
                                            )
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
}
