import Button from "@/Components/Button";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import React from "react";
import { SettingsButton } from "../About/SettingsButton";
import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";

export default function ChannelPermissions() {
    const { channel, channelPermissions } = usePage().props;
    const [success, setSuccess] = useState(false);
    const whoes = [
        {
            value: "everyone",
            title: "Everyone",
        },
        {
            value: "everyone_except_guests",
            title: "Everyone, except guests",
        },
        {
            value: "channel_managers_only",
            title: "Channel Managers only",
        },
    ];
    const { data, setData, post, processing, errors } = useForm({
        channelPostPermission: channelPermissions.channelPostPermission,
        addChannelMembersPermission:
            channelPermissions.addChannelMembersPermission,
        allowHuddle: channelPermissions.allowHuddle,
        allowThread: channelPermissions.allowThread,
    });

    function submit(e) {
        e.preventDefault();
        post(route("channel.update_permissions", channel.id), {
            preserveState: true,
            only: ["permissions", "channelPermissions"],
            onSuccess: () => {
                setSuccess(true);
            },
            headers: {
                "X-Socket-Id": Echo.socketId(),
            },
        });
    }
    function description() {
        switch (channelPermissions.channelPostPermission) {
            case "everyone":
                return "Everyone can post";
            case "everyone_except_guests":
                return "Everyone, except guests, can post";

            case "channel_managers_only":
                return "Only channel managers can post.";

            default:
                return "";
        }
    }
    return (
        <OverlayNotification
            success={success}
            buttonNode={
                <SettingsButton
                    onClick={() => {
                        setSuccess(false);
                    }}
                    className="border-none"
                    title="Channel permissions"
                    description={description()}
                />
            }
            title={<div className="font-semibold ">Channel permissions</div>}
            submitButtonNode={
                <Button onClick={submit} loading={processing}>
                    Save changes
                </Button>
            }
            className="p-3 pb-6"
        >
            <div className=" pb-4">
                <div className="">
                    <h5 className=" font-bold ">
                        Who can post in this channel?
                    </h5>
                    <ul className="flex flex-col gap-y-2 mt-4">
                        {whoes.map((who) => {
                            return (
                                <li
                                    className="flex gap-x-3 items-center"
                                    key={who.value + "who_can_post"}
                                >
                                    <input
                                        type="radio"
                                        name="who_can_post"
                                        id={who.value + "_who_can_post"}
                                        value={who.value}
                                        checked={
                                            who.value ==
                                            data.channelPostPermission
                                        }
                                        onChange={(e) => {
                                            setData(
                                                "channelPostPermission",
                                                e.target.value
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor={who.value + "_who_can_post"}
                                    >
                                        {who.title}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="mt-4">
                    <h5 className=" font-bold ">
                        Who can add new member to this channel?
                    </h5>
                    <ul className="flex flex-col gap-y-2 mt-4">
                        {whoes.map((who, index) => {
                            if (index == 0) return "";
                            return (
                                <li
                                    className="flex gap-x-3 items-center"
                                    key={who.value + "who_can_add_members"}
                                >
                                    <input
                                        type="radio"
                                        name="who_can_add_member"
                                        id={who.value + "_who_can_add_member"}
                                        value={who.value}
                                        checked={
                                            who.value ==
                                            data.addChannelMembersPermission
                                        }
                                        onChange={(e) => {
                                            setData(
                                                "addChannelMembersPermission",
                                                e.target.value
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor={
                                            who.value + "_who_can_add_member"
                                        }
                                    >
                                        {who.title}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="mt-4">
                    <h5 className=" font-bold ">
                        Allow huddles in this channel?
                    </h5>
                    <ul className="flex flex-col gap-y-2 mt-4">
                        <li className="flex gap-x-3 items-center">
                            <input
                                type="radio"
                                name="allow_huddles"
                                id="allow_huddles"
                                checked={data.allowHuddle}
                                onChange={(e) => setData("allowHuddle", true)}
                            />
                            <label htmlFor="allow_huddles">
                                Yes, members can start and join huddles
                            </label>
                        </li>
                        <li className="flex gap-x-3 items-center">
                            <input
                                type="radio"
                                name="allow_huddles"
                                id="not_allow_huddles"
                                checked={!data.allowHuddle}
                                onChange={(e) => setData("allowHuddle", false)}
                            />
                            <label htmlFor="not_allow_huddles">
                                No, members can’t start or join huddles
                            </label>
                        </li>
                    </ul>
                    <hr className="my-4" />
                    <div className="flex items-start gap-x-3">
                        <input
                            type="checkbox"
                            name=""
                            id="allow_thread"
                            className="mt-1"
                            checked={data.allowThread}
                            onChange={(e) =>
                                setData("allowThread", e.target.checked)
                            }
                        />
                        <div className="">
                            <label htmlFor="allow_thread">Allow threads</label>
                            <p>
                                Everyone will be able to add replies to messages
                                posted in this channel, regardless of overall
                                posting permissions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </OverlayNotification>
    );
}
