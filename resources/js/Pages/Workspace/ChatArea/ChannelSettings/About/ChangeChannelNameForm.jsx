import React, { useMemo } from "react";
import { useState } from "react";
import TextInput from "@/Components/Input/TextInput";
import { SettingsButton } from "./SettingsButton";
import { FaLock } from "react-icons/fa";
import {
    useChannel,
    useChannelData,
    useCustomedForm,
} from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";

export default function ChangeChannelNameForm({ channelName }) {
    const { channelId } = useParams();
    const { channel } = useChannel(channelId);
    const { permissions } = useChannelData(channelId);
    const { getValues, setValues, loading, submit } = useCustomedForm(
        {
            name: channel.name,
        },
        {
            url: route("channel.edit_name", channel.id),
        }
    );
    const [isOpen, setIsOpen] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        submit().then(() => {
            setIsOpen(false);
        });
    }
    return (
        <>
            <SettingsButton
                onClick={() => setIsOpen(true)}
                disabled={!permissions.updateName || channel.type == "DIRECT"}
                title="Channel name"
                description={
                    <div className="flex items-baseline gap-x-1">
                        {channel.type == "PUBLIC" ? (
                            <span className="text-lg">#</span>
                        ) : (
                            <FaLock className="text-sm inline" />
                        )}{" "}
                        {channelName}
                    </div>
                }
                className="rounded-tl-lg rounded-tr-lg"
            />
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>Edit Channel Name</CustomedDialog.Title>
                {!permissions.updateName && (
                    <h3 className="text-lg my-4">
                        ⚠️You are not allowed to rename channel, contact admins
                        or channel managers for more information.
                    </h3>
                )}
                <TextInput
                    disabled={!permissions.updateName}
                    row={1}
                    value={getValues().name}
                    onChange={(e) => setValues("name", e.target.value)}
                />
                <CustomedDialog.ActionButtons
                    btnName2={"Save Changes"}
                    onClickBtn2={onSubmit}
                    loading={loading}
                />
            </CustomedDialog>
        </>
    );
}
