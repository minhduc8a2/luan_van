import Button from "@/Components/Button";

import React from "react";
import { SettingsButton } from "../About/SettingsButton";
import { useState } from "react";

import {
    useChannel,
    useChannelData,
    useCustomedForm,
} from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";

export default function ChannelPermissions() {
    const [isOpen, setIsOpen] = useState(false);
    const { channelId, workspaceId } = useParams();
   
    const { permissions } = useChannelData(channelId);

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
    const {
        getValues,
        setValues,

        loading: processing,
        reset,
        submit: onSubmit,
    } = useCustomedForm(
        {
            channelPostPermission: permissions.channelPostPermission,
            addChannelMembersPermission:
                permissions.addChannelMembersPermission,
            allowHuddle: permissions.allowHuddle,
            allowThread: permissions.allowThread,
        },
        {
            method: "post",
            url: route("channel.update_permissions", {
                workspace: workspaceId,
                channel: channelId,
            }),
            hasEchoHeader: true,
        }
    );

    function submit(e) {
        e.preventDefault();
        onSubmit().then(() => {
            setIsOpen(false);
        });
    }
    function description() {
        switch (permissions.channelPostPermission) {
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
        <>
            <SettingsButton
                onClick={() => {
                    reset();
                    setIsOpen(true);
                }}
                className="border-none"
                title="Channel permissions"
                description={description()}
            />
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>
                    <div className="font-semibold ">Channel permissions</div>
                </CustomedDialog.Title>
                <div className="">
                    <h5 className=" font-bold text-color-high-emphasis">
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
                                            getValues().channelPostPermission
                                        }
                                        onChange={(e) => {
                                            setValues(
                                                "channelPostPermission",
                                                e.target.value
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor={who.value + "_who_can_post"}
                                        className="text-color-high-emphasis"
                                    >
                                        {who.title}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="mt-4">
                    <h5 className=" font-bold text-color-high-emphasis">
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
                                            getValues()
                                                .addChannelMembersPermission
                                        }
                                        onChange={(e) => {
                                            setValues(
                                                "addChannelMembersPermission",
                                                e.target.value
                                            );
                                        }}
                                    />
                                    <label
                                        htmlFor={
                                            who.value + "_who_can_add_member"
                                        }
                                         className="text-color-high-emphasis"
                                    >
                                        {who.title}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="mt-4">
                    <h5 className=" font-bold text-color-high-emphasis">
                        Allow huddles in this channel?
                    </h5>
                    <ul className="flex flex-col gap-y-2 mt-4">
                        <li className="flex gap-x-3 items-center">
                            <input
                                type="radio"
                                name="allow_huddles"
                                id="allow_huddles"
                                checked={getValues().allowHuddle}
                                onChange={(e) => {
                                    setValues("allowHuddle", true);
                                }}
                            />
                            <label htmlFor="allow_huddles"  className="text-color-high-emphasis">
                                Yes, members can start and join huddles
                            </label>
                        </li>
                        <li className="flex gap-x-3 items-center">
                            <input
                                type="radio"
                                name="allow_huddles"
                                id="not_allow_huddles"
                                checked={!getValues().allowHuddle}
                                onChange={(e) => {
                                    setValues("allowHuddle", false);
                                }}
                            />
                            <label htmlFor="not_allow_huddles"  className="text-color-high-emphasis">
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
                            checked={getValues().allowThread}
                            onChange={(e) => {
                                setValues("allowThread", e.target.checked);
                            }}
                        />
                        <div className="">
                            <label htmlFor="allow_thread" className="text-color-high-emphasis">Allow threads</label>
                            <p className="text-color-high-emphasis">
                                Everyone will be able to add replies to messages
                                posted in this channel, regardless of overall
                                posting permissions
                            </p>
                        </div>
                    </div>
                </div>
                <CustomedDialog.ActionButtons
                    btnName2={<>Save changes</>}
                    type="green"
                    loading={processing}
                    onClickBtn2={submit}
                />
            </CustomedDialog>
        </>
    );
}
