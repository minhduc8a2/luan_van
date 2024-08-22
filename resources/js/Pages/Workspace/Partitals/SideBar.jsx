import Avatar from "@/Components/Avatar";
import React from "react";
import { FaRegMessage } from "react-icons/fa6";
import { PiHouseLineBold, PiHouseLineFill } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import { usePage } from "@inertiajs/react";
import { LuPlus } from "react-icons/lu";
import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
export default function SideBar({ user }) {
    const { url } = usePage();
    const itemStyle = "flex flex-col items-center gap-y-2";
    return (
        <div className="flex flex-col justify-between h-full pb-8">
            <div className="flex flex-col items-center gap-y-8 ">
                <WorkspaceAvatar name={"Main"} />
                <div className={itemStyle}>
                    {url == "/workspace" ? (
                        <div className="p-2 rounded-lg bg-white/10">
                            {" "}
                            <PiHouseLineFill className="text-lg " />{" "}
                        </div>
                    ) : (
                        <PiHouseLineBold className="text-lg " />
                    )}
                    <div className="text-xs font-semibold">Home</div>
                </div>
                <div className={itemStyle}>
                    <FaRegMessage className="text-lg " />
                    <div className="text-xs font-semibold">DMs</div>
                </div>
                <div className={itemStyle}>
                    <FaRegBell className="text-lg " />
                    <div className="text-xs font-semibold">Activity</div>
                </div>
                <div className={itemStyle}>
                    <IoIosMore className="text-lg " />
                    <div className="text-xs font-semibold">More</div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-y-2">
                <div className="p-2 bg-white/25 rounded-full">
                    <LuPlus className="text-xl opacity-75"/>
                </div>
                <Avatar src={user.avatar_url} className="mt-2" />
            </div>
        </div>
    );
}
