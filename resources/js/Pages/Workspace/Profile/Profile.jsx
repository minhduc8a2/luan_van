import Image from "@/Components/Image";
import { usePage } from "@inertiajs/react";
import React from "react";
import EditProfile from "./EditProfile";

import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "@/Store/profileSlice";
import EditContactInformation from "./EditContactInformation";
import { MdOutlineMail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

export default function Profile() {
    const { default_avatar_url } = usePage().props;
    const { user } = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    return (
        <div className="p-4">
            <div className="flex justify-between">
                <h1 className="font-bold text-xl text-white/85">Profile</h1>
                <button
                    className="rounded-full p-2 hover:bg-white/15"
                    onClick={() => dispatch(setProfile(null))}
                >
                    <IoClose />
                </button>
            </div>
            <Image
                url={user.avatar_url || default_avatar_url}
                dimensions="w-64 h-64"
                className="mt-4 mx-auto"
            />
            <div className="flex justify-between mt-6">
                <h3 className="text-2xl font-bold text-white/85">
                    {user.name}
                </h3>
                <EditProfile
                    user={user}
                    triggerButton={
                        <button className="text-link hover:underline">
                            Edit
                        </button>
                    }
                />
            </div>
            <div className="flex gap-x-2 items-center mt-4 text-white/85">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                Active
            </div>
            <hr className="my-4" />
            <div>
                <div className="flex justify-between mt-6">
                    <h4 className=" font-bold text-white/85">
                        Contact information
                    </h4>
                    <EditContactInformation
                        user={user}
                        triggerButton={
                            <button className="text-link hover:underline">
                                Edit
                            </button>
                        }
                    />
                </div>
                <div className="flex gap-x-4 text-white/75 items-center mt-4">
                    <div className="h-10 w-10 flex items-center justify-center bg-foreground rounded-lg">
                        <MdOutlineMail className="text-2xl" />
                    </div>
                    <div className="flex flex-col justify-between">
                        <h5 className="font-bold text-sm ">Email Address</h5>
                        <a
                            href={"mailto:" + user.email}
                            className="text-link hover:underline text-sm"
                        >
                            {user.email}
                        </a>
                    </div>
                </div>
                <div className="flex gap-x-4 text-white/75 items-center mt-4">
                    <div className="h-10 w-10 flex items-center justify-center bg-foreground rounded-lg">
                        <FaPhoneAlt className="text-" />
                    </div>
                    <div className="flex flex-col justify-between">
                        <h5 className="font-bold text-sm ">Phone</h5>
                        <a
                            href={"tel:" + user.phone}
                            className="text-link hover:underline text-sm"
                        >
                            {user.phone}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
