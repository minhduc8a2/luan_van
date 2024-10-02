import React from "react";
import ChannelSettings from "./ChannelSettings/ChannelSettings";
import Button from "@/Components/Button";
import TipTapEditor from "@/Components/TipTapEditor";
import { router } from "@inertiajs/react";
import { getMentionsFromContent } from "@/helpers/tiptapHelper";

export default function Editor({
    channel,
    permissions,
    isChannelMember,
    channelName,
    setFocus,
}) {
    function joinChannel() {
        router.post(
            route("channel.join", channel.id),
            {},
            {
                preserveState: true,
                only: [
                    "channels",

                    "channel",
                    "permissions",
                    "channelPermissions",
                    "channelUsers",
                ],
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
            }
        );
    }
    function onSubmit(content, fileObjects, JSONContent) {
        let mentionsList = getMentionsFromContent(JSONContent);
        if (
            content == "<p></p>" &&
            fileObjects.length == 0 &&
            mentionsList.length == 0
        )
            return;
        router.post(
            route("message.store", { channel: channel.id }),
            {
                content,
                fileObjects,
                mentionsList,
            },
            {
                only: [],
                preserveState: true,
                preserveScroll: true,
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
                onFinish: () => {
                    setFocus((pre) => pre + 1);
                },
            }
        );
    }
    return (
        <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg ">
            {permissions.chat && <TipTapEditor onSubmit={onSubmit} />}
            {!permissions.chat && !channel?.is_archived && isChannelMember && (
                <h5 className="mb-4 text-center ml-4">
                    You're not allowed to post in channel. Contact Admins or
                    Channel managers for more information!
                </h5>
            )}
            {!isChannelMember && permissions.join && (
                <div className="">
                    <div className="flex items-baseline gap-x-1 font-bold justify-center text-lg">
                        {channel.type == "PUBLIC" ? (
                            <span className="text-xl">#</span>
                        ) : (
                            <FaLock className="text-sm inline" />
                        )}{" "}
                        {channelName}
                    </div>
                    <div className="flex gap-x-4 justify-center my-4 ">
                        <ChannelSettings
                            channelName={channelName}
                            buttonNode={
                                <Button className="bg-black/15 border border-white/15">
                                    Detail
                                </Button>
                            }
                        />
                        <Button className="bg-green-900" onClick={joinChannel}>
                            Join Channel
                        </Button>
                    </div>
                </div>
            )}
            {channel?.is_archived == true && (
                <div className="mb-4 justify-center flex ml-4 items-baseline gap-x-1 text-white/75">
                    You are viewing{" "}
                    <div className="flex items-baseline gap-x-1">
                        {channel.type == "PUBLIC" ? (
                            <span className="text-xl">#</span>
                        ) : (
                            <FaLock className="text-sm inline" />
                        )}{" "}
                        {channelName}
                    </div>
                    , an archived channel
                </div>
            )}
        </div>
    );
}
