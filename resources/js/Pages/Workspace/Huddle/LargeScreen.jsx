import "@/../css/app.css";
import IconButton from "@/Components/IconButton";
import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import SquareImage from "@/Components/SquareImage";
import Tooltip from "@/Components/Tooltip";
import { getChannelName } from "@/helpers/channelHelper";
import {
    streamHasAudioTracks,
    streamHasVideoTracks,
} from "@/helpers/mediaHelper";
import React, { useState, useEffect } from "react";
import { CgScreen } from "react-icons/cg";
import { GrMicrophone } from "react-icons/gr";
import { MdOutlineZoomInMap, MdOutlineZoomOutMap } from "react-icons/md";
import { PiVideoCameraSlash } from "react-icons/pi";
import HuddleInvitation from "./HuddleInvitation";
import Settings from "./Settings";
import { IoMdPersonAdd } from "react-icons/io";
import Button from "@/Components/Button";
import StreamVideo from "@/Components/StreamVideo";

export default function LargeScreen({
    channel,
    workspaceUsers,
    auth,
    sideBarWidth,
    showUserVideo,
    showShareScreen,
    currentStreamRef,
    otherUserStreams,
    users,
    hasAnyVideoTrack,
    setEnableAudio,
    addTrackToStream,
    removeTrackTFromStream,
    currentAudioRef,
    leaveHuddle,
    dispatch,
    toggleHuddle,
    cameraDevices,
    audioDevices,
    setShowUserVideo,
    setShowShareScreen,
    currentVideoRef,
    enableAudio,
    exitFullScreen,
}) {
    const [mainStream, setMainStream] = useState(null);

    useEffect(() => {
        if (otherUserStreams.current.size > 0 && !mainStream) {
            const streamEntry = Array.from(
                otherUserStreams.current.entries()
            )[0];
            if (streamEntry) {
                const [_, stream] = streamEntry;
                setMainStream(stream);
            }
        }
    }, [otherUserStreams]);
    return (
        <div className="bg-primary-600 ring-black/50 ring-[40px] flex flex-col  text-white/85 z-50   rounded-xl top-8 left-8 right-8 bottom-8 fixed">
            <div className="flex justify-between p-4 items-center">
                <div className="text-sm">
                    {getChannelName(channel, workspaceUsers, auth.user)}
                </div>
                <button
                    className="hover:bg-white/15 rounded-full p-2"
                    onClick={exitFullScreen}
                >
                    <MdOutlineZoomInMap />
                </button>
            </div>
            <div className="p-4 flex justify-center gap-2 bg-white/10 mx-4 rounded-lg flex-wrap flex-1">
                {Array.from(otherUserStreams.current.entries()).map(
                    ([userId, stream]) => {
                        if (
                            streamHasAudioTracks(stream) &&
                            !streamHasVideoTracks(stream)
                        )
                            return (
                                <audio
                                    key={userId}
                                    ref={(audioElement) => {
                                        if (audioElement) {
                                            audioElement.srcObject = stream;
                                        }
                                    }}
                                    autoPlay
                                    hidden
                                ></audio>
                            );
                        else return "";
                    }
                )}
                <div className="flex-1 bg-black">
                {mainStream && (
                        <StreamVideo
                            size="w-full h-full"
                            ref={(videoElement) => {
                                if (videoElement) {
                                    videoElement.srcObject =
                                        mainStream;
                                }
                            }}
                            autoPlay
                            muted
                        />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-x-2 p-3 rounded-lg bg-black/15">
                    {(showUserVideo || showShareScreen) && (
                        <StreamVideo
                            size="w-36 h-36"
                            ref={(videoElement) => {
                                if (videoElement) {
                                    videoElement.srcObject =
                                        currentStreamRef.current;
                                }
                            }}
                            autoPlay
                            muted
                        />
                    )}
                    {Array.from(otherUserStreams.current.entries()).map(
                        ([userId, stream]) => {
                            if (streamHasVideoTracks(stream))
                                return (
                                    <StreamVideo
                                        size="w-36 h-36"
                                        key={userId}
                                        ref={(videoElement) => {
                                            if (videoElement) {
                                                videoElement.srcObject = stream;
                                            }
                                        }}
                                        autoPlay
                                    />
                                );
                            else return "";
                        }
                    )}
                    {users.map((user) => {
                        if (user.id == auth.user.id)
                            if (showUserVideo || showShareScreen) return "";
                            else
                                return (
                                    <Tooltip
                                        key={user.id}
                                        content={
                                            <button className="text-nowrap">
                                                {user.display_name || user.name}
                                            </button>
                                        }
                                    >
                                        <SquareImage
                                            url={user.avatar_url}
                                            removable={false}
                                            size={"w-36 h-36"}
                                        />
                                    </Tooltip>
                                );
                        return (
                            !streamHasVideoTracks(
                                otherUserStreams.current.get(user.id)
                            ) && (
                                <SquareImage
                                    key={user.id}
                                    url={user.avatar_url}
                                    removable={false}
                                    size={"w-36 h-36"}
                                />
                            )
                        );
                    })}
                </div>
            </div>
            <ul className="flex gap-x-2 items-center p-4 justify-center">
                <IconButton
                    description="Mute mic"
                    activeDescription="Unmute mic"
                    initActiveState={true}
                    onClick={() => {
                        setEnableAudio((pre) => {
                            return !pre;
                        });
                        if (!enableAudio) {
                            addTrackToStream("audio");
                        } else {
                            removeTrackTFromStream("audio");
                        }
                    }}
                >
                    <GrMicrophone />
                </IconButton>
                <IconButton
                    description="Turn on video"
                    activeDescription="Turn off video"
                    selfActive={false}
                    show={showUserVideo}
                    onClick={() => {
                        setShowUserVideo((pre) => {
                            return !pre;
                        });
                        if (!showUserVideo) addTrackToStream("video");
                        else removeTrackTFromStream("video");
                    }}
                >
                    <PiVideoCameraSlash />
                </IconButton>
                <IconButton
                    description="Share screen"
                    activeDescription="Stop sharing"
                    selfActive={false}
                    show={showShareScreen}
                    onClick={() => {
                        setShowShareScreen((pre) => {
                            return !pre;
                        });
                        if (!showShareScreen) addTrackToStream("screen");
                        else removeTrackTFromStream("screen");
                    }}
                >
                    <CgScreen />
                </IconButton>
                <OverlayPanel
                    buttonNode={
                        <IconButton
                            description="Invite people"
                            activable={false}
                        >
                            <IoMdPersonAdd />
                        </IconButton>
                    }
                >
                    {({ close }) => <HuddleInvitation close={close} />}
                </OverlayPanel>
                <Settings
                    audioDevices={audioDevices}
                    setAudioDevice={(au) => {
                        currentAudioRef.current = au;

                        addTrackToStream("audio");
                    }}
                    currentStreamRef={currentStreamRef}
                    cameraDevices={cameraDevices}
                    currentVideoRef={currentVideoRef}
                    currentAudioRef={currentAudioRef}
                    setVideoDevice={(cam) => {
                        currentVideoRef.current = cam;

                        if (showUserVideo || showShareScreen) {
                            addTrackToStream("video");
                        }
                    }}
                />

                <li>
                    <Button
                        className="bg-pink-600 text-sm"
                        onClick={() => {
                            leaveHuddle();
                            dispatch(toggleHuddle());
                        }}
                    >
                        Leave
                    </Button>
                </li>
            </ul>
        </div>
    );
}
