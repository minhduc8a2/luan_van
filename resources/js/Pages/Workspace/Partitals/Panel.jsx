import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { LuLock } from "react-icons/lu";
import { LuPlus } from "react-icons/lu";
import Avatar from "@/Components/Avatar";
import { usePage } from "@inertiajs/react";
export default function Panel({ workspaceName = "Main" }) {
    const { auth } = usePage().props;
    return (
        <div className="bg-secondary h-full rounded-l-lg rounded-s-lg ">
            <div className="flex justify-between items-center p-4">
                <div className="flex gap-x-1 items-center">
                    <h3 className="text-xl font-semibold">{workspaceName}</h3>
                    <IoIosArrowDown className="text-lg" />
                </div>
                <HiOutlinePencilAlt className="text-xl opacity-75" />
            </div>
            <hr className=" opacity-10" />
            <div className="opacity-85 pl-6 pt-4">
                <div className="flex gap-x-2 items-center">
                    <BiMessageRoundedDetail className="text-xl" />
                    <div className="">Threads</div>
                </div>
                <div className="mt-6">
                    <div className="grid-item">
                        <div className="flex items-center">
                            <FaCaretDown className="text-lg" />
                        </div>
                        <div className="">Channels</div>
                    </div>
                    <ul>
                        <li className="grid-item mt-2">
                            <div className="text-lg">#</div>
                            <div>all-main</div>
                        </li>
                        <li className="grid-item mt-2">
                            <div className="text-lg">#</div>
                            <div>project</div>
                        </li>
                        <li className="grid-item mt-2">
                            <div className="flex items-center">
                                <LuLock className="text-sm" />
                            </div>
                            <div className="font-semibold">work</div>
                        </li>
                    </ul>
                    <div className="grid-item mt-2">
                        <div className="flex items-center ">
                            <LuPlus className="text-sm" />
                        </div>
                        <div className="">Add channels</div>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="grid-item ">
                        <div className="flex items-center ">
                            <FaCaretDown className="text-lg" />
                        </div>
                        <div className="">Direct messages</div>
                    </div>
                    <ul>
                        
                        <li className="flex mt-2 items-center justify-start gap-x-2">
                            <div className=""><Avatar src={auth.user.avatar_url}  className="w-5 h-5" onlineClassName="scale-75" offlineClassName="scale-75" isOnline={true}/></div>
                            <div className="">{auth.user.name} <span className="opacity-75 ml-2">you</span></div>
                        </li>
                    </ul>
                    <div className="grid-item mt-2">
                        <div className="flex items-center ">
                            <LuPlus className="text-sm" />
                        </div>
                        <div className="">Add coworkers</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
