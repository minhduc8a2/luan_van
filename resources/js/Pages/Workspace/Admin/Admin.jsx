import React, { useContext, useState } from "react";
import { IoPersonAddOutline, IoSettingsOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";

import InitData from "./InitData";

import { GoHome } from "react-icons/go";
import { usePage, Link as InertiaLink } from "@inertiajs/react";

import Avatar from "@/Components/Avatar";
import { LuUser2 } from "react-icons/lu";
import { PiAddressBookTabs } from "react-icons/pi";
import {
    MdLogout,
    MdOutlineDarkMode,
    MdOutlineLightMode,
    MdOutlineRocketLaunch,
} from "react-icons/md";
import NotificationPopup from "@/Components/NotificationPopup";
import { IoMdInformationCircleOutline } from "react-icons/io";
import ThemeContext from "@/ThemeProvider";
import ThemePicker from "@/Components/ThemePicker";

export default function Admin() {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            <InitData loaded={loaded} setLoaded={setLoaded} />
            {loaded && (
                <Wrapper>
                    <Outlet />
                    <NotificationPopup />
                </Wrapper>
            )}
        </>
    );
}

function Wrapper({ children }) {
    const { auth } = usePage().props;
    const { workspace } = useSelector((state) => state.workspace);
    const { theme } = useContext(ThemeContext);
    const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
    return (
        <div className="flex flex-col min-h-screen">
            <nav className="h-20 drop-shadow flex px-8 bg-color-contrast justify-between items-center ">
                <Link
                    to="home"
                    className="flex gap-x-4 items-center text-color-high-emphasis"
                >
                    <GoHome className="text-3xl " />
                    <h3 className="text-2xl font-bold capitalize">
                        {workspace.name}
                    </h3>
                </Link>
                <Link
                    to={`/workspaces/${workspace.id}/channels/${workspace.main_channel_id}`}
                    className="flex  text-color-high-emphasis items-center font-bold gap-x-2 hover:underline"
                >
                    Launch <MdOutlineRocketLaunch className="text-xl" />
                </Link>
            </nav>
            <div className="grid grid-cols-5  bg-background   flex-1 ">
                <div className="ml-8 pt-8 border-r border-r-color/15">
                    <div className="flex gap-x-4">
                        <Avatar
                            src={auth.user.avatar_url}
                            className="w-12 h-12"
                            noStatus
                        />
                        <div className="">
                            <p className=" uppercase text-color-medium-emphasis">
                                Sign In As
                            </p>
                            <p className="text-lg capitalize font-semibold text-color-high-emphasis">
                                {auth.user.display_name || auth.user.name}
                            </p>
                        </div>
                    </div>
                    <div className=" mt-8">
                        <h5 className="uppercase text-sm text-color-medium-emphasis mb-4">
                            Account
                        </h5>
                        <ul className="flex flex-col gap-y-2">
                            <PanelItem
                                icon={<GoHome />}
                                title="Home"
                                to="home"
                            />
                            <PanelItem
                                icon={<LuUser2 />}
                                title="Account & profile"
                                to="account_profile"
                            />
                            <PanelItem
                                icon={<IoMdInformationCircleOutline />}
                                title="About this workspace"
                                to="about_workspace"
                            />
                        </ul>
                    </div>
                    <div className=" mt-8">
                        <h5 className="uppercase text-sm text-color-medium-emphasis mb-4">
                            Administration
                        </h5>
                        <ul className="flex flex-col gap-y-2">
                            <PanelItem
                                icon={<IoSettingsOutline />}
                                title="Settings & permissions"
                                to="settings"
                            />
                            <PanelItem
                                icon={<PiAddressBookTabs />}
                                title="Manage members"
                                to="manage_members"
                            />
                            <PanelItem
                                icon={<IoPersonAddOutline />}
                                title="Invitations"
                                to="invitations"
                            />
                        </ul>
                    </div>
                    <div className=" mt-8">
                        <h5 className="uppercase text-sm text-color-medium-emphasis mb-4">
                            Other
                        </h5>
                        <ul className="flex flex-col gap-y-2">
                            <ThemePicker
                                isOpen={isThemePickerOpen}
                                setIsOpen={setIsThemePickerOpen}
                            />
                            <button
                                className="flex gap-x-3 text-color-medium-emphasis items-center"
                                onClick={() => setIsThemePickerOpen(true)}
                            >
                                {theme.mode ? (
                                    <MdOutlineDarkMode className="text-lg" />
                                ) : (
                                    <MdOutlineLightMode className="text-lg" />
                                )}{" "}
                                Theme
                            </button>

                            <InertiaLink
                                className="flex items-center gap-x-2 text-color-medium-emphasis"
                                href={route("logout")}
                                method="post"
                                as="button"
                                type="button"
                            >
                                Signout <MdLogout />
                            </InertiaLink>
                        </ul>
                    </div>
                </div>
                <div className="col-span-4">{children}</div>
            </div>
        </div>
    );
}
function PanelItem({ icon, title, to }) {
    return (
        <li>
            <Link to={to} className="flex gap-x-3 items-center ">
                <div className="text-color-medium-emphasis text-lg">{icon}</div>
                <div className="text-color-high-emphasis hover:underline">
                    {title}
                </div>
            </Link>
        </li>
    );
}
