import React, { useMemo } from "react";

import { PiHouseLineBold, PiHouseLineFill } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";

import { Link } from "@inertiajs/react";

import Dropdown from "@/Components/Dropdown";
import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import WorkspaceListItem from "@/Components/WorkspaceListItem";

import { AddWorkspace } from "./AddWorkspace";
import { useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

import { usePage } from "@inertiajs/react";
import More from "./More";
import { setPageName } from "@/Store/pageSlice";
import UserOptions from "./UserOptions";
import { setSideBarWidth } from "@/Store/sizeSlice";
import { setLeftWindowType } from "@/Store/windowTypeSlice";
export default function SideBar({}) {
    const { auth, url, workspace, workspaces } = usePage().props;
    const { leftWindowType } = useSelector((state) => state.windowType);
    const { name: pageName } = useSelector((state) => state.page);
    const { new_count } = useSelector((state) => state.activity);

    const dispatch = useDispatch();
    const boxRef = useRef(null);
    const itemStyle = "flex flex-col items-center gap-y-2 group";
    useEffect(() => {
        dispatch(setSideBarWidth(boxRef.current.offsetWidth));
    }, []);

    return (
        <div className="flex flex-col justify-between h-full pb-8" ref={boxRef}>
            <div className="flex flex-col items-center gap-y-8 ">
                <Dropdown>
                    <Dropdown.Trigger>
                        <WorkspaceAvatar name={workspace.name} />
                    </Dropdown.Trigger>

                    <Dropdown.Content
                        align="left"
                        contentClasses="bg-background w-96 pb-4 "
                    >
                        <h2 className="text-lg p-4 pb-2 font-bold">
                            Workspace
                        </h2>
                        <hr className="opacity-10" />
                        <div className="max-h-[50vh] overflow-y-auto scrollbar">
                            {workspaces.map((wsp) => (
                                <Link
                                    href={route("workspace.show", wsp.id)}
                                    key={wsp.id}
                                >
                                    <WorkspaceListItem
                                        workspace={wsp}
                                        current={wsp.id == workspace.id}
                                    />
                                </Link>
                            ))}
                        </div>
                        <hr className="opacity-10" />

                        <AddWorkspace />
                    </Dropdown.Content>
                </Dropdown>

                <button
                    onClick={() => {
                        dispatch(setLeftWindowType("panel"));
                    }}
                    className={itemStyle}
                >
                    {leftWindowType == "panel"  ? (
                        <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/10 group-hover:scale-105 transition">
                            {" "}
                            <PiHouseLineFill className="text-lg " />{" "}
                        </div>
                    ) : (
                        <div className="p-2 rounded-lg group-hover:bg-white/10 group-hover:scale-105 transition">
                            <PiHouseLineBold className="text-lg " />
                        </div>
                    )}
                    <div className="text-xs font-semibold">Home</div>
                </button>
                {/* <button
                    onClick={() => {
                        dispatch(setPanelType("direct_messages"));
                        dispatch(setPageName("normal"));
                    }}
                    className={itemStyle}
                >
                    <div className="p-2 rounded-lg group-hover:bg-white/10 group-hover:scale-105 transition">
                        <FaRegMessage className="text-lg " />
                    </div>
                    <div className="text-xs font-semibold">DMs</div>
                </button> */}
                <button
                    onClick={() => {
                        dispatch(setLeftWindowType("activity"));
                    }}
                    className={itemStyle + " relative"}
                >
                    {leftWindowType == "activity"  ? (
                        <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/10 group-hover:scale-105 transition">
                            {" "}
                            <FaBell className="text-lg " />
                        </div>
                    ) : (
                        <div className="p-2 rounded-lg group-hover:bg-white/10 group-hover:scale-105 transition">
                            <FaRegBell className="text-lg " />
                        </div>
                    )}
                    <div className="text-xs font-semibold">Activity</div>
                    {new_count > 0 && (
                        <div className="bg-red-500 rounded-lg text-white w-4 h-4 text-xs absolute -top-2 -right-1">
                            {new_count}
                        </div>
                    )}
                </button>

                <More />
            </div>
            <div className="mx-auto">
                <UserOptions />
            </div>
        </div>
    );
}
