import useLoadWorkspaceData from "@/helpers/useLoadWorkspaceData";
import { updateWorkspace } from "@/Store/workspaceSlice";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

export default function Event() {
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
                }
            }
        );
    }, [workspaceId]);
    return <></>;
}
