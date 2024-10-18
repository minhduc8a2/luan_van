import CustomedDialog from "@/Components/CustomedDialog";
import { useCustomedForm } from "@/helpers/customHooks";
import useSuccessHandler from "@/helpers/useSuccessHandler";
import React from "react";
import { useSelector } from "react-redux";

export default function ChangeAccountType({ isOpen, onClose, user }) {
    const { workspace } = useSelector((state) => state.workspace);
    const { getValues, setValues, submit, loading } = useCustomedForm(
        {
            role:
                workspace.user_id == user.id
                    ? "OWNER"
                    : user.workspaceRole.name,
            userId: user.id,
        },
        {
            url: route("workspaces.changeMemberRole", workspace.id),
            method: "patch",
        }
    );
    const successHandler = useSuccessHandler(
        "Update account type successfully!"
    );
    function onSubmit(e) {
        e.preventDefault();
        submit()
            .then(successHandler)
            .finally(() => onClose());
    }
    return (
        <CustomedDialog isOpen={isOpen} onClose={onClose}>
            <CustomedDialog.Title>Change account type</CustomedDialog.Title>
            <p className="text-color-high-emphasis">
                Select the account type{" "}
                <span className="text-color-high-emphasis font-bold capitalize">
                    {user.display_name || user.name}
                </span>{" "}
                should have for{" "}
                <span className="text-color-high-emphasis font-bold capitalize">
                    {workspace.name}
                </span>
                .
            </p>
            <h5 className="font-bold text-color-high-emphasis mt-4">
                Choose account type
            </h5>
            <form className="flex flex-col gap-y-2 mt-2">
                <div className="flex items-center gap-x-3">
                    <input
                        type="radio"
                        name="role"
                        id="owner"
                        value="OWNER"
                        checked={getValues().role == "OWNER"}
                        onChange={(e) => setValues("role", e.target.value)}
                    />
                    <label htmlFor="owner" className="">
                        Workspace Owner
                    </label>
                </div>
                <div className="flex items-center gap-x-3">
                    <input
                        type="radio"
                        name="role"
                        id="admin"
                        value="ADMIN"
                        checked={getValues().role == "ADMIN"}
                        onChange={(e) => setValues("role", e.target.value)}
                    />
                    <label htmlFor="admin" className="">
                        Workspace Admin
                    </label>
                </div>
                <div className="flex items-center gap-x-3">
                    <input
                        type="radio"
                        name="role"
                        id="member"
                        value="MEMBER"
                        checked={getValues().role == "MEMBER"}
                        onChange={(e) => setValues("role", e.target.value)}
                    />
                    <label htmlFor="member" className="">
                        Regular member
                    </label>
                </div>
            </form>
            <CustomedDialog.ActionButtons
                btnName2="Save"
                onClickBtn2={onSubmit}
                type="green"
                loading={loading}
            />
        </CustomedDialog>
    );
}
