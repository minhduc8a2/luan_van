import React, { useEffect, useState } from "react";
import icon from "@/../images/icon.png";
import banner from "@/../images/banner.png";
import Button from "@/Components/Button";
import WorkspaceAvatar from "@/Components/WorkspaceAvatar";
import { FaArrowRight } from "react-icons/fa";
import { AddWorkspace } from "@/Components/AddWorkspace";
import { usePage, Link as InertiaLink } from "@inertiajs/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setWorkspaces } from "@/Store/workspaceSlice";
import { Link } from "react-router-dom";

export default function HomePage() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const { workspaces } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    useEffect(() => {
        axios.get(route("workspaces")).then((response) => {
            dispatch(setWorkspaces({ workspaces: response.data.workspaces }));
        });
    }, []);
    // useEffect(() => {
    //     Echo.private("App.Models.User." + auth.user.id).notification(
    //         (notification) => {
    //             console.log(notification);
    //             const { changesType } = notification;

    //         }
    //     );
    // }, []);
    return (
        <div className="min-h-screen ">
            <AddWorkspace isOpen={isOpen} setIsOpen={setIsOpen} />
            <div className="bg-background ">
                <div className="text-3xl pt-16 font-extrabold  flex justify-center items-center gap-x-2">
                    {" "}
                    <img src={icon} alt="icon" className="h-8 w-8" />
                    Snack
                </div>
                <div className="bg-color-contrast py-2 px-4 rounded-full w-fit mx-auto mt-4 text-color-medium-emphasis flex items-center text-sm gap-x-2">
                    Sign in as
                    <span className="font-bold text-color-high-emphasis">
                        {auth.user.email}
                    </span>
                    <InertiaLink
                        method="post"
                        as="button"
                        type="button"
                        href={route("logout")}
                        className="text-link text-sm"
                    >
                        Change
                    </InertiaLink>
                </div>
                <div className="mx-auto w-1/2 grid grid-cols-2 mt-24 gap-x-8">
                    <div className="">
                        <h1 className="font-bold text-5xl">
                            Create new a workspace
                        </h1>
                        <p className="text-lg text-color-high-emphasis mt-4">
                            Slack gives your team a home — a place where they
                            can talk and work together. To create a new
                            workspace, click the button below.
                        </p>
                        <Button
                            className="bg-primary-400 text-white mt-8"
                            onClick={() => setIsOpen(true)}
                        >
                            Create a Workspace
                        </Button>
                    </div>
                    <img src={banner} alt="banner" className="w-full" />
                </div>
                <div className="mx-auto translate-y-1/2 bg-color-contrast w-fit p-4 rounded-full font-bold text-color-medium-emphasis">
                    OR
                </div>
            </div>
            <div className="bg-color-contrast">
                <h2 className="text-center mt-16 font-bold text-lg text-color-high-emphasis">
                    Open a workspace
                </h2>
                <div className="border rounded border-color/15 pt-4  flex flex-col w-[600px] max-w-full mt-6 mx-auto ">
                    <div className="px-4">
                        Workspaces for{" "}
                        <span className="font-bold">{auth.user.email}</span>
                    </div>
                    <hr className="mt-4" />
                    <ul>
                        {workspaces.length == 0 && (
                            <div className="text-sm my-4 text-center text-color-medium-emphasis">
                                No workspace yet.{" "}
                                <button
                                    className="text-link hover:underline"
                                    onClick={() => setIsOpen(true)}
                                >
                                    Create one
                                </button>
                            </div>
                        )}
                        {workspaces.map((workspace, index) => (
                            <>
                                <WorkspaceItem
                                    workspace={workspace}
                                    key={workspace.id}
                                />
                                {index != workspaces.length - 1 && <hr />}
                            </>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function WorkspaceItem({ workspace }) {
    return (
        <Link
            to={`/workspaces/${workspace.id}/channels/${workspace.main_channel_id}`}
            className="flex justify-between py-4 items-center hover:bg-foreground px-4"
        >
            <div className="flex gap-x-4 items-center">
                <WorkspaceAvatar name={workspace.name} />
                <h5 className="text-xl font-bold text-color-high-emphasis">
                    {workspace.name}
                </h5>
            </div>
            <FaArrowRight className="text-color-medium-emphasis" />
        </Link>
    );
}
