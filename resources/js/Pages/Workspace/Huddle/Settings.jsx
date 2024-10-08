import IconButton from "@/Components/IconButton";
import { checkDeviceInUse } from "@/helpers/mediaHelper";
import {
    CloseButton,
    Popover,
    PopoverButton,
    PopoverPanel,
} from "@headlessui/react";
import React, { useState } from "react";
import { RiMore2Fill } from "react-icons/ri";

export default function Settings({
    audioDevices,
    setAudioDevice,
    currentStreamRef,
    cameraDevices,
    setVideoDevice,
    currentVideoRef,
    currentAudioRef,
}) {
    const [refresh, setRefresh] = useState(0);
    return (
        <Popover className="relative ">
            <PopoverButton className="block">
                <IconButton description="More options" activable={false}>
                    <RiMore2Fill />
                </IconButton>
            </PopoverButton>
            <PopoverPanel anchor="bottom start">
                <div className="flex flex-col py-2 bg-background z-30 relative rounded-lg text-white/85 mb-4 min-w-60 max-w-80 border border-white/15 ">
                    <h5 className="text-lg px-4 font-bold">Audio devices</h5>
                    {audioDevices.map((au) => (
                        <CloseButton
                            className="px-6 py-2 hover:bg-white/10 text-left text-sm"
                            key={au.deviceId}
                            onClick={() => {
                                setAudioDevice(au);
                                setRefresh((pre) => pre + 1);
                            }}
                        >
                            {au.label}
                            {checkDeviceInUse(
                                "audio",
                                currentStreamRef.current,
                                au.deviceId
                            ) ? (
                                <span className="font-bold text-cyan-400">
                                    {" - In use"}
                                </span>
                            ) : currentAudioRef.current?.deviceId == au.deviceId ? (
                                <span className="font-bold text-cyan-400">
                                    {" - current"}
                                </span>
                            ) : (
                                ""
                            )}
                        </CloseButton>
                    ))}
                    <hr className="my-2 opacity-15" />
                    <h5 className="text-lg px-4 font-bold">Video devices</h5>
                    {cameraDevices.map((cam) => (
                        <CloseButton
                            className="px-6 py-2 hover:bg-white/10 text-left text-sm"
                            key={cam.deviceId}
                            onClick={() => {
                                setVideoDevice(cam);
                                setRefresh((pre) => pre + 1);
                            }}
                        >
                            {cam.label}
                            {checkDeviceInUse(
                                "video",
                                currentStreamRef.current,
                                cam.deviceId
                            ) ? (
                                <span className="font-bold text-cyan-400">
                                    {" - In use"}
                                </span>
                            ) : currentVideoRef.current?.deviceId == cam.deviceId ? (
                                <span className="font-bold text-cyan-400">
                                    {" - current"}
                                </span>
                            ) : (
                                ""
                            )}
                        </CloseButton>
                    ))}
                </div>
            </PopoverPanel>
        </Popover>
    );
}
