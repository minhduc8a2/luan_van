import { useState } from "react";
import TextArea from "@/Components/Input/TextArea";
import SelectInput from "@/Components/Input/SelectInput";
import { useSelector } from "react-redux";
import { useCustomedForm } from "@/helpers/customHooks";
import useErrorHandler from "@/helpers/useErrorHandler";
import CustomedDialog from "@/Components/CustomedDialog";

export function CreateChannelForm({ activateButtonNode, callback = () => {} }) {
    const [isOpen, setIsOpen] = useState(false);
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
        { url: route("channel.store", workspace.id) }
    );

    const errorHandler = useErrorHandler();
    function onSubmit(e) {
        e.preventDefault();
        submit()
            .then(() => {
                setSuccess(true);
                reset();
                callback();
            })
            .catch(errorHandler);
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
