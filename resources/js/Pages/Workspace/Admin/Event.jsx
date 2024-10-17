import useLoadWorkspaceData from "@/helpers/useLoadWorkspaceData";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Event() {
    const { workspaceId } = useParams();
    const loadWorkspaceData = useLoadWorkspaceData();
    useEffect(() => {
        Echo.private(`private_workspaces.${workspaceId}`).listen(
            "WorkspaceEvent",
            (e) => {
                console.log("workspaceEvent", e);
                switch (e.type) {
                    case "WorkspaceObserver_updated":
                    case "InvitationPermission_updated":
                        loadWorkspaceData();
                        break;
                }
            }
        );
    }, [workspaceId]);
    return <></>;
}
