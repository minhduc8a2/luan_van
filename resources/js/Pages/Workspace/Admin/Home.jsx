import { Head, usePage } from "@inertiajs/react";
import React from "react";
import { IoIosArrowForward } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { LuUser2 } from "react-icons/lu";
import { RiContactsBook2Line, RiUserSettingsLine } from "react-icons/ri";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

export default function Home() {
    const { auth } = usePage().props;
    const { workspaceId } = useParams();
    const { workspacePermissions } = useSelector((state) => state.workspace);

    return (
        <div className="pl-16 pt-16">
            <Head title="Home" />
            <div className="flex gap-x-3">
                <LuUser2 className=" text-4xl text-color-medium-emphasis" />
                <h1 className="text-4xl font-bold text-color-high-emphasis">
                    Welcome,{" "}
                    <span className="capitalize">{auth.user.name}</span>!
                </h1>
            </div>
            <div className="bg-color-contrast p-4 rounded-lg w-3/4 mt-8">
                <LinkItem
                    to={`/workspaces/${workspaceId}/admin/account_profile`}
                    icon={<RiUserSettingsLine className="text-3xl" />}
                    title="Account Settings"
                    description="Edit your profile, update your email and
                                password, and manage other account settings"
                />
            </div>
            {workspacePermissions.update && (
                <div className="bg-color-contrast p-4 rounded-lg w-3/4 mt-8">
                    <LinkItem
                        to={`/workspaces/${workspaceId}/admin/settings`}
                        bgColor="bg-orange-500"
                        icon={<IoSettingsOutline className="text-3xl" />}
                        title="Settings & Permissions"
                        description="Configure your workspace settings, permissions."
                    />
                    <LinkItem
                        to={`/workspaces/${workspaceId}/admin/manage_members`}
                        bgColor="bg-dark-green"
                        icon={<RiContactsBook2Line className="text-3xl" />}
                        title="Manage Your Workspace"
                        description="Invite new members and manage user permissions."
                    />
                </div>
            )}
        </div>
    );
}

function LinkItem({ to, icon, title, description, bgColor = "bg-link" }) {
    return (
        <Link
            to={to}
            className="flex justify-between items-center p-4 hover:bg-background group"
        >
            <div className="flex gap-x-4 items-start">
                <div
                    className={`flex items-center justify-center ${bgColor} text-white rounded-lg p-2 h-12 w-12`}
                >
                    {icon}
                </div>
                <div className="">
                    <h5 className="text-2xl font-bold text-color-high-emphasis">
                        {title}
                    </h5>
                    <p className="text-lg text-color-medium-emphasis w-[90%]">
                        {description}
                    </p>
                </div>
            </div>
            <IoIosArrowForward className="text-xl group-hover:text-color-high-emphasis text-color/50" />
        </Link>
    );
}
