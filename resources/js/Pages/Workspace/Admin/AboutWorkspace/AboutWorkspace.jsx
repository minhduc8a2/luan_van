import SettingsTabs from "../SettingsTabs";
import Overview from "./Overview";
import AdminsAndOwners from "./AdminsAndOwners";
import { IoMdInformationCircleOutline } from "react-icons/io";
import useLoadWorkspaceUsers from "@/helpers/useLoadWorkspaceUsers";
import { useEffect } from "react";

export default function AccountAndProfile() {
    const tabs = ["Overview", "Admins & Owners"];
    const contents = [
        <>
            <Overview />
        </>,
        <>
            <AdminsAndOwners />
        </>,
    ];
    const loadWorkspaceUsers = useLoadWorkspaceUsers();
    useEffect(() => {
        loadWorkspaceUsers();
    }, []);
    return (
        <div className="pl-16 pt-16">
            <div className="flex gap-x-3">
                <IoMdInformationCircleOutline className=" text-4xl text-color-medium-emphasis" />

                <h1 className="text-4xl font-bold text-color-high-emphasis">
                    About this workspace
                </h1>
            </div>
            <SettingsTabs tabs={tabs} contents={contents} />
        </div>
    );
}
