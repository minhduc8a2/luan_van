import CustomedDialog from "@/Components/CustomedDialog";
import { useCustomedForm } from "@/helpers/customHooks";
import useSuccessHandler from "@/helpers/useSuccessHandler";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

export default function DeactivateUser({ isOpen, onClose, user }) {
    const { workspace } = useSelector((state) => state.workspace);
    const { submit, loading, reset } = useCustomedForm(
        { userId: user.id, wantDeactivate: !user.pivot.is_deactivated },
        {
            url: route("workspaces.deactivateUser", workspace.id),
            method: "patch",
        }
    );
    const deactivateSuccessHandler = useSuccessHandler(
        "Deactivate user successfully!"
    );
    const activateSuccessHandler = useSuccessHandler(
        "Activate user successfully!"
    );
    function onSubmit(e) {
        e.preventDefault();
        const is_deactivated = user.pivot.is_deactivated;
        submit()
            .then(
                is_deactivated
                    ? activateSuccessHandler
                    : deactivateSuccessHandler
            )
            .finally(() => {
                onClose();
            });
    }
    useEffect(() => {
        reset();
    }, [isOpen]);
    return (
        <CustomedDialog isOpen={isOpen} onClose={onClose}>
            <CustomedDialog.Title>
                {user.pivot.is_deactivated
                    ? "Activate account"
                    : "Deactivate user?"}
            </CustomedDialog.Title>
            <p className="text-color-high-emphasis">
                {user.pivot.is_deactivated
                    ? `Activate ${
                          user.display_name || user.name
                      }’s account for this workspace?`
                    : "What happens when an account is deactivated?"}
            </p>
            {!user.pivot.is_deactivated && (
                <ul className="list-disc pl-4 mt-4">
                    <li>
                        The member will no longer be able to sign in to the
                        workspace.
                    </li>
                    <li>
                        The member’s messages and files will still be accessible
                        in Slack.
                    </li>
                </ul>
            )}

            <CustomedDialog.ActionButtons
                btnName2={user.pivot.is_deactivated ? "Activate" : "Deactivate"}
                onClickBtn2={onSubmit}
                loading={loading}
                type={user.pivot.is_deactivated ? "green" : "danger"}
            />
        </CustomedDialog>
    );
}
