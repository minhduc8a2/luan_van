import Image from "@/Components/Image";
import { router, usePage } from "@inertiajs/react";
import React from "react";
import EditProfile from "./EditProfile";

import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "@/Store/profileSlice";
import EditContactInformation from "./EditContactInformation";
import { MdOutlineMail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import Button from "@/Components/Button";
import { TbMessageCircle } from "react-icons/tb";
import { FiHeadphones, FiMoreVertical } from "react-icons/fi";
import { channelProps, getDirectChannelFromUserId } from "@/helpers/channelHelper";
import { setThreadedMessageId } from "@/Store/threadSlice";
import { toggleHuddle } from "@/Store/huddleSlice";
import MoreOptions from "./MoreOptions";

export default function Profile() {
    const { default_avatar_url, auth, directChannels } = usePage().props;
    const { user } = useSelector((state) => state.profile);
    const onlineStatusMap = useSelector((state) => state.onlineStatus);
    const { channel: huddleChannel } = useSelector((state) => state.huddle);
    const hasOwnership = auth.user.id == user.id;
    const isOnline = onlineStatusMap[user.id];
    const dispatch = useDispatch();
    function message() {
        const channel = getDirectChannelFromUserId(directChannels, user.id);
        if (!channel) return;
        dispatch(setThreadedMessageId(null));
        router.get(
            route("channels.show", {
                workspace: workspace.id,
                channel: channel.id,
            }),
            {},
            { preserveState: true,only:channelProps }
        );
    }
    function handleHuddleButtonClicked() {
        const channel = getDirectChannelFromUserId(directChannels, user.id);
        if (!channel) return;
        if (huddleChannel && huddleChannel.id != channel.id) {
            if (confirm("Are you sure you want to switch to other huddle"))
                dispatch(
                    toggleHuddle({
                        channel,
                        user: auth.user,
                    })
                );
        } else {
            dispatch(
                toggleHuddle({
                    channel,
                    user: auth.user,
                })
            );
        }
    }
    return (
        <div className="p-4">
            <div className="flex justify-between">
                <h1 className="font-bold text-xl text-white/85">Profile</h1>
                <button
                    className="rounded-full p-2 hover:bg-white/15"
                    onClick={() => dispatch(setProfile(null))}
                >
                    <IoClose />
                </button>
            </div>
            <Image
                url={user.avatar_url || default_avatar_url}
                dimensions="w-64 h-64"
                className="mt-4 mx-auto"
            />
            <div className="flex justify-between mt-6">
                <h3 className="text-2xl font-bold text-white/85">
                    {user.display_name || user.name}
                </h3>
                {hasOwnership && (
                    <EditProfile
                        user={user}
                        triggerButton={
                            <button className="text-link hover:underline">
                                Edit
                            </button>
                        }
                    />
                )}
            </div>
            <div className="flex gap-x-2 items-center mt-4 text-white/85">
                <div
                    className={`h-2 w-2 rounded-full ${
                        isOnline
                            ? "bg-green-600"
                            : "bg-transparent border border-white/15"
                    } `}
                ></div>
                {isOnline ? "Active" : "Away"}
            </div>
            {!hasOwnership && (
                <div className="flex justify-stretch gap-x-4 mt-4">
                    <Button className="w-full" onClick={message}>
                        <div className="flex gap-x-2 items-center justify-center">
                            <TbMessageCircle className="text-xl" /> Message
                        </div>
                    </Button>
                    <Button
                        className="w-full"
                        onClick={handleHuddleButtonClicked}
                    >
                        <div className="flex gap-x-2 items-center justify-center">
                            <FiHeadphones className="text-xl" />
                            Huddle
                        </div>
                    </Button>
                    <MoreOptions user={user} />
                </div>
            )}
            <hr className="my-4" />
            <div>
                <div className="flex justify-between mt-6">
                    <h4 className=" font-bold text-white/85">
                        Contact information
                    </h4>
                    {hasOwnership && (
                        <EditContactInformation
                            user={user}
                            triggerButton={
                                <button className="text-link hover:underline">
                                    Edit
                                </button>
                            }
                        />
                    )}
                </div>
                <div className="flex gap-x-4 text-white/75 items-center mt-4">
                    <div className="h-10 w-10 flex items-center justify-center bg-foreground rounded-lg">
                        <MdOutlineMail className="text-2xl" />
                    </div>
                    <div className="flex flex-col justify-between">
                        <h5 className="font-bold text-sm ">Email Address</h5>
                        <a
                            href={"mailto:" + user.email}
                            className="text-link hover:underline text-sm"
                        >
                            {user.email}
                        </a>
                    </div>
                </div>
                {user.phone
                    ? hasOwnership && (
                          <div className="flex gap-x-4 text-white/75 items-center mt-4">
                              <div className="h-10 w-10 flex items-center justify-center bg-foreground rounded-lg">
                                  <FaPhoneAlt className="text-" />
                              </div>
                              <div className="flex flex-col justify-between">
                                  <h5 className="font-bold text-sm ">Phone</h5>
                                  <a
                                      href={"tel:" + user.phone}
                                      className="text-link hover:underline text-sm"
                                  >
                                      {user.phone}
                                  </a>
                              </div>
                          </div>
                      )
                    : hasOwnership && (
                          <EditContactInformation
                              user={user}
                              triggerButton={
                                  <button className="text-link  mt-4">
                                      + Add phone
                                  </button>
                              }
                          />
                      )}
            </div>
        </div>
    );
}
