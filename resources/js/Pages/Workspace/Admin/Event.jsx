import useLoadWorkspaceData from "@/helpers/useLoadWorkspaceData";
import { updateWorkspace } from "@/Store/workspaceSlice";
import { updateWorkspaceUserInformation } from "@/Store/workspaceUsersSlice";
import { router, usePage } from "@inertiajs/react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

export default function Event() {
    const { auth } = usePage().props;
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const loadWorkspaceData = useLoadWorkspaceData();
    useEffect(() => {
        Echo.private(`private_workspaces.${workspaceId}`).listen(
            "WorkspaceEvent",
            (e) => {
                console.log("workspaceEvent", e);
                switch (e.type) {
                    case "WorkspaceObserver_updated":
                        dispatch(updateWorkspace(e.data));
                        break;
                    case "InvitationPermission_updated":
                        loadWorkspaceData("workspacePermissions");
                        break;
                    case "DeactivateUser_updated":
                        dispatch(
                            updateWorkspaceUserInformation({
                                id: e.data?.id,
                                data: e.data,
                            })
                        );
                        if (
                            e.data?.id == auth.user.id &&
                            !!e.data?.pivot?.is_deactivated
                        ) {
                            router.get(route("workspaces"));
                        }
                        break;
                    case "UserRole_updated":
                        dispatch(
                            updateWorkspaceUserInformation({
                                id: e.data?.id,
                                data: e.data,
                            })
                        );
                        break;
                }
            }
        );
    }, [workspaceId]);
    return <></>;
}
