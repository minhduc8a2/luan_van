import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import React from "react";
import { FaAngleDown } from "react-icons/fa";
import { useState } from "react";

import ChangeChannelNameForm from "./ChangeChannelNameForm";
import { EditDescriptionForm } from "./EditDescriptionForm";
import Button from "@/Components/Button";
import { usePage } from "@inertiajs/react";
import { SettingsButton } from "./SettingsButton";
import { UTCToDateTime } from "@/helpers/dateTimeHelper";
import About from "./About";
import Settings from "./Settings";
export default function ChannelSettings({ channelName }) {
    const { channel , workspace} = usePage().props;

    const [tabIndex, setTabIndex] = useState(0);
    return (
        <OverlayPanel
            buttonNode={
                <div className="flex items-center gap-x-2">
                    <div className=""># {channelName}</div>
                    <FaAngleDown className="text-sm" />
                </div>
            }
            className="p-0"
        >
            <div className="w-[500px] pt-4 px-4 m-4 text-white/85">
                <h2 className="text-2xl my-4 font-bold text-white/85">
                    # {channelName}
                </h2>
                <div className="flex gap-x-4">
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
                <div className="pt-4 flex flex-col pb-8 h-[65vh] overflow-y-auto scrollbar">
                    {tabIndex == 0 && (
                        <About channel={channel} channelName={channelName} />
                    )}
                     {tabIndex == 2 && (
                        <Settings channel={channel} channelName={channelName} workspace={workspace}/>
                    )}
                </div>
            </div>
        </OverlayPanel>
    );
}
