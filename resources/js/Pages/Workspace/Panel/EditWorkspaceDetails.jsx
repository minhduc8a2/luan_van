import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCustomedForm } from "@/helpers/customHooks";
import { updateCurrentWorkspace } from "@/Store/workspaceSlice";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/Input/TextInput";
import CustomedDialog from "@/Components/CustomedDialog";

export default function EditWorkspaceDetails({ isOpen, onClose }) {
    const { workspace } = useSelector((state) => state.workspace);
    const { submit, loading, success, getValues, setValues } = useCustomedForm(
        { name: workspace.name },
        {
            url: route("workspaces.update", workspace.id),
            method: "patch",
        }
    );
    const dispatch = useDispatch();
    function onSubmit(e) {
        e.preventDefault();
        const oldName = workspace.name;
        dispatch(updateCurrentWorkspace({ name: getValues().name }));
        submit()
            .then(() => {
                onClose();
            })
            .catch(() => {
                dispatch(updateCurrentWorkspace({ name: oldName }));
            });
    }
    return (
        <CustomedDialog isOpen={isOpen} onClose={onClose}>
            <CustomedDialog.Title>Workspace Details</CustomedDialog.Title>
            <form onSubmit={onSubmit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Workspace name" />
                    <TextInput
                        id="name"
                        type="text"
                        className=" mt-2 block w-full "
                        value={getValues().name}
                        onChange={(e) => setValues("name", e.target.value)}
                        required
                    />
                </div>
            </form>
            <CustomedDialog.ActionButtons
                btnName2="Save"
                onClickBtn2={onSubmit}
                loading={loading}
            />
        </CustomedDialog>
    );
}
