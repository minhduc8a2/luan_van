import Avatar from "@/Components/Avatar";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    CloseButton,
} from "@headlessui/react";
import { IoIosMore } from "react-icons/io";
import { LuPlus } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import { TbStack2 } from "react-icons/tb";

import { useDispatch } from "react-redux";
import { setLeftWindowType, setRightWindowType } from "@/Store/windowTypeSlice";
import { router, usePage } from "@inertiajs/react";
import { RiContactsBook3Line } from "react-icons/ri";
export default function More() {
    const { workspace } = usePage().props;
    const dispatch = useDispatch();
    function switchPage() {
        dispatch(setLeftWindowType(null));
        dispatch(setRightWindowType(null));
    }
    return (
        <Popover className="relative group">
            <PopoverButton className="focus:outline-none ">
                <div className="flex flex-col items-center gap-y-2 ">
                    <div className="p-2 rounded-lg group-hover:bg-white/10 group-data-[open]:bg-white/10 group-hover:scale-105 transition">
                        <IoIosMore className="text-lg " />
                    </div>
                    <div className="text-xs font-semibold">More</div>
                </div>
            </PopoverButton>
            <PopoverPanel
                anchor="right "
                className="flex flex-col  bg-foreground ml-2 rounded-lg min-w-96"
            >
                {({ close }) => (
                    <>
                        <h5 className="text-lg text-white font-bold p-4 pb-0">
                            More
                        </h5>
                        <ul className="pb-4">
                            <li>
                                <MoreButton
                                    onClick={() => {
                                        switchPage("browseFiles");
                                        router.get(
                                            route("files.index", workspace.id),
                                            {},
                                            {
                                                preserveState: true,
                                                only: [],
                                                onFinish: () => {
                                                    switchPage();
                                                },
                                            }
                                        );
                                        close();
                                    }}
                                    title="Files"
                                    description="Documents, clips, attachments"
                                    iconNode={<TbStack2 />}
                                />
                            </li>
                            <li>
                                <MoreButton
                                    onClick={() => {
                                        router.get(
                                            route(
                                                "channels.index",
                                                workspace.id
                                            ),
                                            {},
                                            {
                                                preserveState: true,
                                                only: [],
                                                onFinish: () => {
                                                    switchPage();
                                                },
                                            }
                                        );
                                        close();
                                    }}
                                    title="Channels"
                                    description="Browse your team's conversations"
                                    iconNode={<IoSearch />}
                                />
                            </li>
                            <li>
                                <MoreButton
                                    onClick={() => {
                                        router.get(
                                            route(
                                                "users.browseUsers",
                                                workspace.id
                                            ),
                                            {},
                                            {
                                                preserveState: true,
                                                only: [],
                                                onFinish: () => {
                                                    switchPage();
                                                },
                                            }
                                        );
                                        close();
                                    }}
                                    title="People"
                                    description="Your team and user groups"
                                    iconNode={<RiContactsBook3Line />}
                                />
                            </li>
                        </ul>
                    </>
                )}
            </PopoverPanel>
        </Popover>
    );
}

function MoreButton({ title, description, iconNode, ...props }) {
    return (
        <button
            className="w-full px-4 py-2 flex flex-nowrap items-center gap-x-4 group/more_button transition hover:bg-white/10"
            {...props}
        >
            <div className="h-10 w-10 bg-primary-400 group-hover/more_button:bg-primary-300 transition rounded-lg text-lg p-1 flex items-center justify-center ">
                {iconNode}
            </div>
            <div className="flex flex-col justify-between text-left">
                <div className="font-semibold">{title}</div>
                <div className="text-sm">{description}</div>
            </div>
        </button>
    );
}
