import { setThreadMessage } from "@/Store/threadSlice";
import React from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import Message from "./Message/Message";
import { usePage } from "@inertiajs/react";
import TipTapEditor from "@/Components/TipTapEditor";
export default function Thread() {
    const dispatch = useDispatch();
    const { message } = useSelector((state) => state.thread);
    const { channelUsers } = usePage().props;
    const user = channelUsers.filter((mem) => mem.id === message.user_id)[0];
    return (
        <div className="min-w-[35%] bg-background">
            <div className="p-4 z-10">
                <div className="flex justify-between font-bold text-lg opacity-75 items-center">
                    <div className="">Thread</div>
                    <button
                        onClick={() => dispatch(setThreadMessage(null))}
                        className="hover:bg-white/15 rounded-lg p-2"
                    >
                        <IoClose className="text-xl" />
                    </button>
                </div>
            </div>
            <Message
                threadStyle={true}
                message={message}
                user={user}
                hasChanged={true}
                index={0}
            />
            <div className="m-6 border border-white/15 pt-4 px-2 rounded-lg">
                <TipTapEditor onSubmit={(a, b) => onSubmit(a, b)} />
            </div>
        </div>
    );
}
