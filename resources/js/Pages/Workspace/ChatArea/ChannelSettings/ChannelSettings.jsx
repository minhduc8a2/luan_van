import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import React from "react";
import { FaAngleDown, FaLock } from "react-icons/fa";
import { useState } from "react";

import { usePage } from "@inertiajs/react";

import About from "./About/About";
import Settings from "./Settings/Settings";
import Members from "./Members/Members";
export default function ChannelSettings({ channelName }) {
    const { channel, workspace } = usePage().props;
    const [tabIndex, setTabIndex] = useState(0);
    return (
        <OverlayPanel
            buttonNode={
                <div className="flex items-center gap-x-2">
                    <div className="flex items-baseline gap-x-1">
                        {channel.type == "PUBLIC" ? (
                            <span className="text-xl">#</span>
                        ) : (
                            <FaLock className="text-sm inline" />
                        )}{" "}
                        {channelName}
                    </div>

                    <FaAngleDown className="text-sm" />
                </div>
            }
            className="p-0"
        >
            <div className="w-[548px]  text-white/85">
                <h2 className="text-2xl p-6 font-bold text-white/85">
                    <div className="flex items-baseline gap-x-2">
                        {channel.type == "PUBLIC" ? (
                            "#"
                        ) : (
                            <FaLock className="text-lg inline" />
                        )}{" "}
                        {channelName}
                    </div>
                </h2>
                <div className="flex px-6 gap-x-4">
                    <button
                        onClick={() => setTabIndex(0)}
                        className={`${
                            tabIndex == 0 ? " " : "border-b-transparent"
                        } border-b-2`}
                    >
                        About
                    </button>
                    <button
                        onClick={() => setTabIndex(1)}
                        className={`${
                            tabIndex == 1 ? " " : "border-b-transparent"
                        } border-b-2`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setTabIndex(2)}
                        className={`${
                            tabIndex == 2 ? " " : "border-b-transparent"
                        } border-b-2`}
                    >
                        Settings
                    </button>
                </div>
                <div className="pt-4  flex flex-col pb-8 h-[65vh] overflow-y-auto scrollbar">
                    {tabIndex == 0 && (
                       <div className="px-6"><About channel={channel} channelName={channelName} /></div> 
                    )}

                    {tabIndex == 1 && <Members />}
                    {tabIndex == 2 && (
                        <Settings
                            channel={channel}
                            channelName={channelName}
                            workspace={workspace}
                        />
                    )}
                </div>
            </div>
        </OverlayPanel>
    );
}
