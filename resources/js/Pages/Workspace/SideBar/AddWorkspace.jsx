import { IoIosAdd } from "react-icons/io";

import TextArea from "@/Components/Input/TextArea";
import { useCustomedForm } from "@/helpers/customHooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";
export function AddWorkspace({isOpen,setIsOpen}) {
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
    );
}
