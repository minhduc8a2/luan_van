import Avatar from "@/Components/Avatar";
import React from "react";
import { FaRegMessage } from "react-icons/fa6";
import { PiHouseLineBold, PiHouseLineFill } from "react-icons/pi";
import { FaRegBell } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import { Link, usePage } from "@inertiajs/react";
import { LuPlus } from "react-icons/lu";
import Dropdown from "@/Components/Dropdown";
import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import WorkspaceListItem from "@/Components/WorkspaceListItem";
import { IoIosAdd } from "react-icons/io";
import Form1 from "@/Components/Form1";
import TextArea from "@/Components/Input/TextArea";
import { useContext, useEffect, useRef } from "react";
import PageContext from "@/Contexts/PageContext";

export default function SideBar() {
    const { workspace, workspaces, setSideBarWidth } = useContext(PageContext);
    const { auth } = usePage().props;
    const { url } = usePage();
    const boxRef = useRef(null);
    const itemStyle = "flex flex-col items-center gap-y-2 group";
    useEffect(() => {
        setSideBarWidth(boxRef.current.offsetWidth);
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

                <div className={itemStyle}>
                    {url == "/workspace" ? (
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
                </div>
                <div className={itemStyle}>
                    <div className="p-2 rounded-lg group-hover:bg-white/10 group-hover:scale-105 transition">
                        <FaRegMessage className="text-lg " />
                    </div>
                    <div className="text-xs font-semibold">DMs</div>
                </div>
                <div className={itemStyle}>
                    <div className="p-2 rounded-lg group-hover:bg-white/10 group-hover:scale-105 transition">
                        <FaRegBell className="text-lg " />
                    </div>
                    <div className="text-xs font-semibold">Activity</div>
                </div>
                <div className={itemStyle}>
                    <div className="p-2 rounded-lg group-hover:bg-white/10 group-hover:scale-105 transition">
                        <IoIosMore className="text-lg " />
                    </div>
                    <div className="text-xs font-semibold">More</div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-y-2">
                <div className="p-2 bg-white/25 rounded-full">
                    <LuPlus className="text-xl opacity-75" />
                </div>
                <Avatar
                    src={auth.user.avatar_url}
                    className="mt-2"
                    isOnline={true}
                />
            </div>
        </div>
    );
}
import { useState } from "react";
import { useForm } from "@inertiajs/react";
function AddWorkspace() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        channel: "",
    });
    const [success, setSuccess] = useState(false);
    function submit(e) {
        e.preventDefault();
        post(route("workspace.store"), {
            onSuccess: () => {
                reset();
                setSuccess(true);
            },
        });
    }
    return (
        <Form1
            success={success}
            submit={submit}
            buttonName="Create"
            activateButtonNode={
                <div className="flex gap-x-2 items-center p-4 hover:bg-white/10 w-full">
                    <IoIosAdd className="text-xl" />
                    Add workspace
                </div>
            }
            title="Add Workspace"
        >
            <TextArea
                placeholder=""
                label="Workspace name:"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
            />
            <TextArea
                placeholder=""
                label="What project are you working on?"
                value={data.channel}
                onChange={(e) => setData("channel", e.target.value)}
            />
        </Form1>
    );
}
