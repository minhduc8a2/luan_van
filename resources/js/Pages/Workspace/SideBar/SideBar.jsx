import React, { useState } from "react";

import { PiHouseLineBold, PiHouseLineFill } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";

import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import WorkspaceListItem from "@/Components/WorkspaceListItem";

import { AddWorkspace } from "@/Components/AddWorkspace";
import { useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";


import More from "./More";

import UserOptions from "./UserOptions";
import { setSideBarWidth } from "@/Store/sizeSlice";
import { setLeftWindowType } from "@/Store/windowTypeSlice";
import { Link } from "react-router-dom";

import CustomedPopover from "@/Components/CustomedPopover";
import { IoIosAdd } from "react-icons/io";
export default function SideBar({}) {
    const { workspace } = useSelector((state) => state.workspace);
    const { workspaces } = useSelector((state) => state.workspace);
    const { leftWindowType } = useSelector((state) => state.windowType);
    const [isOpen, setIsOpen] = useState(false);
    const { new_count } = useSelector((state) => state.activity);

    const dispatch = useDispatch();
    const boxRef = useRef(null);
    const itemStyle = "flex flex-col items-center gap-y-2 group";

    useEffect(() => {
        dispatch(setSideBarWidth(boxRef.current.offsetWidth));
    }, []);

    return (
        <div className="flex flex-col justify-between h-full pb-8" ref={boxRef}>
            
            <AddWorkspace isOpen={isOpen} setIsOpen={setIsOpen}/>
            <div className="flex flex-col items-center gap-y-8 ">
                <CustomedPopover
                    triggerNode={<WorkspaceAvatar name={workspace.name} color="bg-gray-300"/>}
                    anchor="bottom start"
                    className="mt-4"
                >
                    <h2 className="text-lg p-4 pb-2 font-bold text-color-high-emphasis">
                        Workspace
                    </h2>
                    <hr className="opacity-10" />
                    <div className="max-h-[50vh] overflow-y-auto scrollbar">
                        {workspaces.map((wsp) => (
                            <CustomedPopover.CloseButton key={wsp.id}>
                                <Link to={`/workspaces/${wsp.id}`}>
                                    <WorkspaceListItem
                                        workspace={wsp}
                                        current={wsp.id == workspace.id}
                                    />
                                </Link>
                            </CustomedPopover.CloseButton>
                        ))}
                    </div>
                    <hr className="opacity-10" />

                    <button
                        className="flex gap-x-2 items-center p-4 hover:bg-white/10 w-full text-color-high-emphasis"
                        onClick={() => {
                            setIsOpen(true);
                        }}
                    >
                        <IoIosAdd className="text-xl" />
                        Add workspace
                    </button>
                </CustomedPopover>
                {/* <Dropdown>
                    <Dropdown.Trigger></Dropdown.Trigger>

                    <Dropdown.Content
                        align="left"
                        contentClasses="bg-background w-96 pb-4 "
                    ></Dropdown.Content>
                </Dropdown> */}

                <button
                    onClick={() => {
                        dispatch(setLeftWindowType("panel"));
                    }}
                    className={itemStyle}
                >
                    {leftWindowType == "panel" ? (
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
                    {leftWindowType == "activity" ? (
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
