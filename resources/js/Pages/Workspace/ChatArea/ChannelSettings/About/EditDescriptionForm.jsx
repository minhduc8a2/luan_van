import TextArea from "@/Components/Input/TextArea";
import { useState } from "react";
import { SettingsButton } from "./SettingsButton";
import {
    useChannel,
    useChannelData,
    useCustomedForm,
} from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";

export function EditDescriptionForm() {
    const { channelId, workspaceId } = useParams();
    const { channel } = useChannel(channelId);
    const { permissions } = useChannelData(channelId);
    const [isOpen, setIsOpen] = useState(false);
    const { getValues, setValues, submit, loading } = useCustomedForm(
        {
            description: channel.description,
        },
        {
            url: route("channel.edit_description", {
                workspace: workspaceId,
                channel: channelId,
            }),
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
                hasEdit={permissions.updateDescription}
                disabled={!permissions.updateDescription}
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

                <CustomedDialog.ActionButtons
                    btnName2={channel.description ? "Update" : "Add"}
                    onClickBtn2={onSubmit}
                    loading={loading}
                />
            </CustomedDialog>
        </div>
    );
}
