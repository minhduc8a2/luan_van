import { IoIosAdd } from "react-icons/io";

import TextArea from "@/Components/Input/TextArea";
import { useCustomedForm } from "@/helpers/customHooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";
export function AddWorkspace() {
    const [isOpen, setIsOpen] = useState(false);
    const { submit, loading, getValues, setValues } = useCustomedForm(
        { name: "", channel: "" },
        {
            method: "post",
            url: route("workspaces.store"),
        }
    );
    const navigate = useNavigate();

    function onSubmit(e) {
        e.preventDefault();
        submit().then((response) => {
            if (response.status == 200) {
                navigate(
                    `/workspaces/${response.data.workspaceId}/channels/${response.data.main_channel_id}`
                );
            }
        });
    }
    return (
        <>
            <button
                className="flex gap-x-2 items-center p-4 hover:bg-white/10 w-full"
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                <IoIosAdd className="text-xl" />
                Add workspace
            </button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>Add workspace</CustomedDialog.Title>
                <TextArea
                    required
                    placeholder=""
                    label="Workspace name:"
                    value={getValues().name}
                    onChange={(e) => {
                        setValues("name", e.target.value);
                    }}
                />
                <TextArea
                    required
                    placeholder=""
                    label="What project are you working on?"
                    value={getValues().channel}
                    onChange={(e) => {
                        setValues("channel", e.target.value);
                    }}
                />
                <CustomedDialog.ActionButtons
                    btnName2="Add"
                    onClickBtn2={onSubmit}
                    loading={loading}
                />
            </CustomedDialog>
        </>
    );
}
