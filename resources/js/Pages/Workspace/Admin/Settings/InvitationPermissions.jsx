import Button from "@/Components/Button";

import ExpandableItem from "../ExpandableItem";

import { useCustomedForm } from "@/helpers/customHooks";

import useSuccessHandler from "@/helpers/useSuccessHandler";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function InvitationPermissions() {
    const { workspaceId } = useParams();
    const { workspacePermissions } = useSelector((state) => state.workspace);
    const { submit, loading, setValues, getValues } = useCustomedForm(
        {
            requiredAdminApproval:
                workspacePermissions.isInvitationToWorkspaceWithAdminApprovalRequired,
        },
        {
            url: route("workspaces.updateInvitationPermission", workspaceId),
            method: "patch",
        }
    );
    const successHandler = useSuccessHandler("Update Invitation permission successfully!");
    function onSubmit(e) {
        e.preventDefault();
        submit().then(successHandler);
    }
    return (
        <ExpandableItem
            header={
                <header className="w-1/2">
                    <h3 className="text-lg font-medium text-color-high-emphasis">
                        Invitations
                    </h3>

                    <p className="mt-1 text-sm text-color-medium-emphasis">
                        By default, any member can invite new people to your
                        workspace. If you’d like, you can change this so
                        invitations require admin approval.
                    </p>
                </header>
            }
        >
            <form>
                <div className="flex gap-x-2 items-center mt-4">
                    <input
                        type="checkbox"
                        id="require"
                        checked={getValues().requiredAdminApproval}
                        onChange={(e) =>
                            setValues("requiredAdminApproval", e.target.checked)
                        }
                    />
                    <label
                        htmlFor="require"
                        className="text-color-high-emphasis"
                    >
                        Require admin approval
                    </label>
                </div>
                <Button
                    type="green"
                    className="mt-4 w-fit"
                    onClick={onSubmit}
                    loading={loading}
                >
                    Save
                </Button>
            </form>
        </ExpandableItem>
    );
}
