
import React, { createContext } from "react";
import { FaAngleDown, FaLock } from "react-icons/fa";
import { useState } from "react";

import About from "./About/About";
import Settings from "./Settings/Settings";
import Members from "./Members/Members";
import { useSelector } from "react-redux";
import { useChannel, useChannelData } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import CustomedDialog from "@/Components/CustomedDialog";
const ChannelSettingsContext = createContext(null);
export { ChannelSettingsContext };
export default function ChannelSettings({ channelName }) {
    const { workspace } = useSelector((state) => state.workspace);
    const { channelId } = useParams();
    const { channel } = useChannel(channelId);
    const { permissions } = useChannelData(channelId);
    const [tabIndex, setTabIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <ChannelSettingsContext.Provider
            value={{ show: isOpen, setShow: setIsOpen }}
        >
            <button
                className="flex items-center gap-x-2"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-baseline gap-x-1 text-color">
                    {channel?.type == "PUBLIC" ? (
                        <span className="text-xl">#</span>
                    ) : (
                        <FaLock className="text-sm inline" />
                    )}{" "}
                    {channelName}
                </div>

                <FaAngleDown className="text-sm text-color-medium-emphasis" />
            </button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                {channel && permissions && (
                    <div className="  text-color-high-emphasis">
                        <CustomedDialog.Title>
                            <div className="flex items-baseline gap-x-2">
                                {channel.type == "PUBLIC" ? (
                                    "#"
                                ) : (
                                    <FaLock className="text-lg inline" />
                                )}{" "}
                                {channelName}
                            </div>
                        </CustomedDialog.Title>
                        <div className="flex  gap-x-4">
                            <button
                                onClick={() => setTabIndex(0)}
                                className={`${
                                    tabIndex == 0 ? " " : "border-b-transparent"
                                } border-b-2 border-primary-500 font-semibold`}
                            >
                                About
                            </button>
                            {channel.type != "DIRECT" &&
                                channel.type != "SELF" && (
                                    <button
                                        onClick={() => setTabIndex(1)}
                                        className={`${
                                            tabIndex == 1
                                                ? " "
                                                : "border-b-transparent"
                                        } border-b-2 border-primary-500 font-semibold`}
                                    >
                                        Members
                                    </button>
                                )}
                            {channel.type != "DIRECT" &&
                                channel.type != "SELF" &&
                                (permissions.updatePermissions ||
                                    permissions.changeType ||
                                    permissions.archive ||
                                    permissions.deleteChannel) && (
                                    <button
                                        onClick={() => setTabIndex(2)}
                                        className={`${
                                            tabIndex == 2
                                                ? " "
                                                : "border-b-transparent"
                                        } border-b-2 border-primary-500 font-semibold`}
                                    >
                                        Settings
                                    </button>
                                )}
                        </div>
                        <div className="pt-4  flex flex-col  h-[65vh] overflow-y-auto scrollbar">
                            {tabIndex == 0 && (
                                <div className="">
                                    <About
                                        channel={channel}
                                        channelName={channelName}
                                        onClose={close}
                                    />
                                </div>
                            )}

                            {tabIndex == 1 &&
                                channel.type != "DIRECT" &&
                                channel.type != "SELF" && <Members />}
                            {tabIndex == 2 && (
                                <Settings
                                    channel={channel}
                                    channelName={channelName}
                                    workspace={workspace}
                                />
                            )}
                        </div>
                    </div>
                )}
                <CustomedDialog.CloseButton/>
            </CustomedDialog>
        </ChannelSettingsContext.Provider>
    );
}
