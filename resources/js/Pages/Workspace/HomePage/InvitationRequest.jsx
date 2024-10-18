import CustomedDialog from "@/Components/CustomedDialog";
import useWorkspace from "@/helpers/useWorkspace";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function InvitationRequest() {
    const [isOpen, setIsOpen] = useState(false);
    let [searchParams, setSearchParams] = useSearchParams();
    const workspaceId = searchParams.get("workspaceId");
    const request = searchParams.get("request");
    const { workspace } = useWorkspace(workspaceId);
    useEffect(() => {
        if (request && workspaceId) {
            setIsOpen(true);
        }
    }, [request, workspaceId]);
    if (!workspace || workspace.pivot?.is_approved) return <></>;
    return (
        <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <CustomedDialog.Title>Welcome 🎉</CustomedDialog.Title>
            <p className="text-color-high-emphasis">
                Thank you for joining workspace{" "}
                <span className="font-bold capitalize text-lg">
                    {workspace?.name}
                </span>
                . Your request has been sent for admin approval!
            </p>

            <CustomedDialog.CloseButton />
        </CustomedDialog>
    );
}
