import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import { usePage } from "@inertiajs/react";
import React from "react";
import { SettingsButton } from "./SettingsButton";
import { FaLock } from "react-icons/fa";
import TextInput from "@/Components/Input/TextInput";
import { IoPersonAddOutline } from "react-icons/io5";
import AvatarAndName from "@/Components/AvatarAndName";
import { useState } from "react";
import AddManagers from "./AddManagers";
export default function Managers() {
    const { managers, channel } = usePage().props;
    const [searchValue, setSearchValue] = useState("");
    return (
        <OverlayPanel
            buttonNode={
                <SettingsButton
                    title="Manage by"
                    description={
                        <div>
                            {managers.map((user, index) => {
                                if (index == managers.length - 1)
                                    return (
                                        <span className="text-link" key={user.id}>
                                            {user.name}
                                        </span>
                                    );
                                else if (index == managers.length - 2)
                                    return (
                                        <>
                                            <span className="text-link" key={user.id}>
                                                {user.name}
                                            </span>{" "}
                                            and{" "}
                                        </>
                                    );
                                return (
                                    <>
                                        <span className="text-link" key={user.id}>
                                            {user.name}
                                        </span>
                                        ,{" "}
                                    </>
                                );
                            })}
                        </div>
                    }
                />
            }
        >
            {({ close }) => (
                <div className="w-[500px] pb-4  rounded-lg bg-background">
                    <div className="text-xl flex items-baseline gap-x-2 p-6 pb-0 font-bold text-white/85">
                        People who can manage{" "}
                        <div className="flex items-center gap-x-1">
                            {channel.type != "PUBLIC" ? (
                                <span className="text-lg">#</span>
                            ) : (
                                <FaLock className="text-sm" />
                            )}{" "}
                            {channel.name}
                        </div>
                    </div>
                    <div className="text-sm font-semibold text-white/50 pl-6">
                        {managers.length} Channel Managers
                    </div>
                    <div className="my-4 mx-6">
                        <TextInput
                            placeholder="Search Channel Managers"
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                            }}
                        />
                    </div>
                    <OverlayPanel
                        buttonNode={
                            <button className="flex gap-x-4 p-4 px-6 items-center mt-6 hover:bg-white/15 w-full">
                                <div className=" rounded p-2 bg-link/15">
                                    <IoPersonAddOutline className="text-link text-xl" />
                                </div>
                                Add Channel Managers
                            </button>
                        }
                    >
                        {({ close }) => <AddManagers close={close} />}
                    </OverlayPanel>

                    <ul className="overflow-hidden h-[30vh]">
                        {managers
                            .filter((user) =>
                                user.name
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase())
                            )
                            .map((user) => (
                                <div
                                    className="px-6 py-4 flex justify-between items-center group hover:bg-white/15"
                                    key={user.id}
                                >
                                    <AvatarAndName
                                        className="h-10 w-10"
                                        user={user}
                                    />
                                    <button className="text-link text-sm hover:underline hidden group-hover:block">
                                        Remove
                                    </button>
                                </div>
                            ))}
                    </ul>
                </div>
            )}
        </OverlayPanel>
    );
}
