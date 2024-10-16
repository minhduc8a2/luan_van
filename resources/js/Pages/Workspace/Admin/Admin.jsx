import React, { useRef, useState } from "react";
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { Provider, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import InitData from "./InitData";
import { makeStore } from "@/Store/store";
import { GoHome } from "react-icons/go";
import { usePage } from "@inertiajs/react";

import Avatar from "@/Components/Avatar";
import { LuUser2 } from "react-icons/lu";
import { PiAddressBookTabs } from "react-icons/pi";

export default function Admin() {
    const [loaded, setLoaded] = useState(false);
    const storeRef = useRef();
    if (!storeRef.current) {
        console.log("store created");
        storeRef.current = makeStore();
    }

    return (
        <Provider store={storeRef.current}>
            <InitData loaded={loaded} setLoaded={setLoaded} />
            {loaded && (
                <Wrapper>
                    <Outlet />
                </Wrapper>
            )}
        </Provider>
    );
}

function Wrapper({ children }) {
    const { auth } = usePage().props;
    const { workspace } = useSelector((state) => state.workspace);
    return (
        <div className="flex flex-col min-h-screen">
            <nav className="h-20 shadow flex px-8 bg-color-contrast">
                <Link to="home" className="flex gap-x-4 items-center text-color-high-emphasis">
                    <GoHome className="text-3xl " />
                    <h3 className="text-2xl font-bold capitalize">
                        {workspace.name}
                    </h3>
                </Link>
            </nav>
            <div className="grid grid-cols-4 pt-8 bg-background   flex-1 ">
                <div className="ml-8">
                    <div className="flex gap-x-4">
                        <Avatar
                            src={auth.user.avatar_url}
                            className="w-12 h-12"
                            noStatus
                        />
                        <div className="">
                            <p className=" uppercase">Sign In As</p>
                            <p className="text-lg capitalize font-semibold">
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
                        </ul>
                    </div>
                    <div className=" mt-8">
                        <h5 className="uppercase text-sm text-color-medium-emphasis mb-4">
                            Administration
                        </h5>
                        <ul className="flex flex-col gap-y-2">
                            <PanelItem
                                icon={<IoSettingsOutline />}
                                title="Settings"
                                to="settings"
                            />
                            <PanelItem
                                icon={<PiAddressBookTabs />}
                                title="Manage members"
                                to="manage_members"
                            />
                        </ul>
                    </div>
                </div>
                <div className="col-span-3">{children}</div>
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
