import Image from "@/Components/Image";
import { usePage } from "@inertiajs/react";
import React from "react";
import EditProfile from "./EditProfile";

import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { setProfile } from "@/Store/profileSlice";

export default function Profile() {
    const { auth, default_avatar_url } = usePage().props;
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
            <Image url={auth.user.avatar_url || default_avatar_url} dimensions="w-64 h-64" className="mt-4 mx-auto"/>
            <div className="flex justify-between mt-6">
                <h3 className="text-2xl font-bold text-white/85">
                    {auth.user.name}
                </h3>
                <EditProfile
                    user={auth.user}
                    triggerButton={
                        <button className="text-link hover:underline">
                            Edit
                        </button>
                    }
                />
            </div>
        </div>
    );
}
