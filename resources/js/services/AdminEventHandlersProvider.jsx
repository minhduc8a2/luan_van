import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkspaceEventsEnum from "./Enums/WorkspaceEventsEnum";
import { useDispatch } from "react-redux";
import {
    addInvitation,
    removeInvitation,
    updateInvitation,
} from "@/Store/invitationsSlice";

export default function AdminEventHandlersProvider({ children }) {
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    useEffect(() => {
        Echo.private(`private_workspace_admin.${workspaceId}`).listen(
            "WorkspaceAdminEvent",
            (e) => {
                console.log(e);
                switch (e.type) {
                    case WorkspaceEventsEnum.INVITATION_TYPE_EMAIL_CREATED:
                    case WorkspaceEventsEnum.INVITATION_LINK_CREATED:
                        dispatch(addInvitation(e.data));
                        break;
                    case WorkspaceEventsEnum.INVITATION_LINK_UPDATED:
                    case WorkspaceEventsEnum.INVITATION_TYPE_EMAIL_UPDATED:
                        dispatch(updateInvitation(e.data));
                        break;
                    case WorkspaceEventsEnum.INVITATION_LINK_DELETED:
                    case WorkspaceEventsEnum.INVITATION_TYPE_EMAIL_DELETED:
                        dispatch(removeInvitation(e.data));
                    default:
                        break;
                }
            }
        );
        console.log("Subcribed to WorkspaceAdminEvent: " + workspaceId);
        return () => {
            console.log("Unsubcribed to WorkspaceAdminEvent: " + workspaceId);
            Echo.leave(`private_workspace_admin.${workspaceId}`);
        };
    }, [workspaceId]);
    return <>{children}</>;
}
