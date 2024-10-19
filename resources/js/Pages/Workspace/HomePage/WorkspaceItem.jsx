import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function WorkspaceItem({ workspace }) {
    return (
        <Link
            to={
                !!workspace.pivot?.is_approved && !workspace.pivot?.is_deactivated
                    ? `/workspaces/${workspace.id}/channels/${workspace.main_channel_id}`
                    : null
            }
            className={`flex justify-between py-4 items-center  px-4 ${
                !!workspace.pivot?.is_approved &&
                !workspace.pivot?.is_deactivated
                    ? "hover:bg-foreground"
                    : "opacity-75 cursor-default"
            }`}
        >
            <div className="flex gap-x-4 items-center">
                <WorkspaceAvatar name={workspace.name} />
                <h5 className="text-xl font-bold text-color-high-emphasis">
                    {workspace.name}
                </h5>
            </div>
            {!!workspace.pivot?.is_deactivated ? (
                <div className="text-color-medium-emphasis text-sm">
                    Access denied
                </div>
            ) : !!workspace.pivot?.is_approved ? (
                <FaArrowRight className="text-color-medium-emphasis" />
            ) : (
                <div className="text-color-medium-emphasis text-sm">
                    Requested
                </div>
            )}
        </Link>
    );
}
