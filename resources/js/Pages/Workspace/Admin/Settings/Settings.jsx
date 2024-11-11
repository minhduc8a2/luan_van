import SettingsTabs from "../SettingsTabs";
import { IoMdSettings } from "react-icons/io";
import ChangeWorkspaceName from "./ChangeWorkspaceName";
import DeleteWorkspace from "./DeleteWorkspace";
import InvitationPermissions from "./InvitationPermissions";
import { Head } from "@inertiajs/react";

export default function AccountAndProfile() {
    const tabs = ["Settings", "Permissions"];
    const contents = [
        <>
            <ChangeWorkspaceName />
            <hr className="my-4" />
            <DeleteWorkspace />
        </>,
        <>
            <InvitationPermissions />
        </>,
    ];
    return (
        <div className="pl-16 pt-16">
            <Head title="Settings & Permissions" />
            <div className="flex gap-x-3">
                <IoMdSettings className="text-dark-green text-4xl" />
                <h1 className="text-4xl font-bold text-color-high-emphasis">
                    Settings & Permissions
                </h1>
            </div>
            <SettingsTabs tabs={tabs} contents={contents} />
        </div>
    );
}
