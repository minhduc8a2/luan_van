import { useForm } from "@inertiajs/react";

import TextArea from "@/Components/Input/TextArea";
import Form1 from "@/Components/Form1";

import { useState, useEffect, useMemo } from "react";
import { SettingsButton } from "./SettingsButton";
import {
    useChannel,
    useChannelData,
    useCustomedForm,
} from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";
import Button from "@/Components/Button";
export function EditDescriptionForm() {
    const { channelId } = useParams();
    const { channel } = useChannel(channelId);
    const { permissions } = useChannelData(channelId);
    const [isOpen, setIsOpen] = useState(false);
    const { getValues, setValues, submit, loading } = useCustomedForm(
        {
            description: channel.description,
        },
        {
            url: route("channel.edit_description", channel.id),
            hasEchoHeader: true,
        }
    );
    function onSubmit(e) {
        e.preventDefault();
        submit().then(() => setIsOpen(false));
    }

    return (
        <div>
            <SettingsButton
                onClick={() => setIsOpen(true)}
                title=" Description"
                description={channel.description}
                className="border-t-0"
            />
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>{`${
                    channel.description ? "Edit" : "Add"
                } Description`}</CustomedDialog.Title>
                {!permissions.updateDescription && (
                    <h3 className="text-lg my-4">
                        ⚠️You are not allowed to edit channel description,
                        contact admins or channel managers for more information.
                    </h3>
                )}
                <TextArea
                    disabled={!permissions.updateDescription}
                    rows="2"
                    value={getValues().description}
                    onChange={(e) => setValues("description", e.target.value)}
                />
                <div className="flex justify-end gap-x-4 mt-8">
                    <Button onClick={() => setIsOpen(false)}>Close</Button>
                    <Button onClick={onSubmit} loading={loading}>
                        {channel.description ? "Update" : "Add"}
                    </Button>
                </div>
            </CustomedDialog>
        </div>
    );
}
