import { useState } from "react";
import TextArea from "@/Components/Input/TextArea";
import SelectInput from "@/Components/Input/SelectInput";
import { useDispatch, useSelector } from "react-redux";
import { useCustomedForm } from "@/helpers/customHooks";
import CustomedDialog from "@/Components/CustomedDialog";
import { addNewChannelToChannelsStore } from "@/Store/channelsSlice";
import { addJoinedChannelId } from "@/Store/joinedChannelIdsSlice";

export function CreateChannelForm({ activateButtonNode, callback = () => {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { workspacePermissions, workspace } = useSelector(
        (state) => state.workspace
    );
    const channelTypes = [
        { type: "PUBLIC", label: "Public - Anyone in " + workspace.name },
        {
            type: "PRIVATE",
            label: "Private — only specific people \n Can only be viewed or joined by invitation",
        },
    ];

    const { getValues, setValues, reset, submit, loading } = useCustomedForm(
        { name: "", type: "PUBLIC" },
        { url: route("channel.store", workspace.id), hasEchoHeader: true }
    );
    function onSubmit(e) {
        e.preventDefault();
        submit().then((response) => {
            dispatch(addNewChannelToChannelsStore(response.data?.channel));
            dispatch(addJoinedChannelId({ id: response.data?.channel?.id }));
            setIsOpen(false);
            reset();
            callback(response.data?.channel?.id);
        });
    }
    return (
        <>
            <button
                onClick={() => {
                    reset();
                    setIsOpen(true);
                }}
            >
                {activateButtonNode}
            </button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>Create channel</CustomedDialog.Title>
                {!workspacePermissions?.createChannel && (
                    <h3 className="text-lg">
                        ⚠️You are not allowed to create channels, contact admins
                        for more information.
                    </h3>
                )}
                <div
                    className={`mt-4 ${
                        !workspacePermissions?.createChannel ? "opacity-50" : ""
                    }`}
                >
                    <TextArea
                        placeholder=""
                        label="Channel name:"
                        value={getValues().name}
                        onChange={(e) => {
                            setValues("name", e.target.value);
                        }}
                        disabled={!workspacePermissions?.createChannel}
                    />
                    <SelectInput
                        label="Channel type"
                        list={channelTypes}
                        onChange={(item) => {
                            setValues("type", item.type);
                        }}
                        disabled={!workspacePermissions?.createChannel}
                    />
                </div>
                <CustomedDialog.ActionButtons
                    btnName2="Create"
                    onClickBtn2={onSubmit}
                    disabled={!workspacePermissions?.createChannel}
                    loading={loading}
                />
            </CustomedDialog>
        </>
    );
}
