import "@/../css/app.css";
import IconButton from "@/Components/IconButton";

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
import { IoCloseCircle } from "react-icons/io5";
import UserAvatar from "./UserAvatar";
import CustomedDialog from "@/Components/CustomedDialog";

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
    const [isHover, setIsHover] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
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
        if (showUserVideo || showShareScreen) {
            if (
                currentStreamRef.current &&
                (!mainStream || !streamHasVideoTracks(mainStream))
            ) {
                setMainStream(currentStreamRef.current);
            }
        }
    }, [otherUserStreams, showUserVideo, showShareScreen]);
    return (
        <div className="bg-primary-600 ring-black/50 ring-[40px] flex flex-col  text-color-high-emphasis z-50   rounded-xl top-8 left-8 right-8 bottom-8 fixed">
            <div className="flex justify-between p-4 items-center">
                <div className="text-sm">
                    {getChannelName(channel, workspaceUsers, auth.user)}
                </div>
                <button
                    className="hover:bg-color/15 rounded-full p-2"
                    onClick={exitFullScreen}
                >
                    <MdOutlineZoomInMap />
                </button>
            </div>
            <div className=" flex justify-center gap-2 pb-4 mx-4 rounded-lg flex-wrap flex-1">
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

                <div className="flex-1  group/main_stream gap-4 relative overflow-hidden flex items-center justify-center">
                    {(!mainStream || !streamHasVideoTracks(mainStream)) &&
                        users.map((user) => {
                            if (user.id == auth.user.id)
                                return (
                                    <UserAvatar
                                        user={user}
                                        key={user.id}
                                        size="h-64 w-64"
                                    />
                                );
                            return (
                                !streamHasVideoTracks(
                                    otherUserStreams.current.get(user.id)
                                ) && (
                                    <UserAvatar
                                        user={user}
                                        key={user.id}
                                        size="h-64 w-64"
                                    />
                                )
                            );
                        })}
                    {mainStream && streamHasVideoTracks(mainStream) && (
                        <video
                            className="mx-auto h-full w-auto max-w-full object-contain rounded-lg"
                            ref={(videoElement) => {
                                if (videoElement) {
                                    videoElement.srcObject = mainStream;
                                }
                            }}
                            autoPlay
                            muted
                        />
                    )}

                    <ul
                        className={`group-hover/main_stream:flex ${
                            isHover ? "flex" : "hidden"
                        } gap-x-2 items-center p-4 px-6 justify-center bg-black/75 rounded-xl absolute bottom-6 left-1/2 -translate-x-1/2 `}
                    >
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
                                if (!showShareScreen)
                                    addTrackToStream("screen");
                                else removeTrackTFromStream("screen");
                            }}
                        >
                            <CgScreen />
                        </IconButton>
                        <>
                            <IconButton
                                description="Invite people"
                                activable={false}
                                onClick={() => setIsOpen(true)}
                            >
                                <IoMdPersonAdd />
                            </IconButton>
                            <CustomedDialog
                                isOpen={isOpen}
                                onClose={() => setIsOpen(false)}
                            >
                                <HuddleInvitation
                                    close={() => setIsOpen(false)}
                                />
                               
                            </CustomedDialog>
                        </>

                        <div className="flex items-center h-full">
                            <Settings
                                zIndex="z-50"
                                setIsHover={setIsHover}
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
                        </div>

                        <li>
                            <Button
                                className="bg-pink-600 text-sm"
                                onClick={() => {
                                    leaveHuddle();
                                    exitFullScreen();
                                    dispatch(toggleHuddle());
                                }}
                            >
                                Leave
                            </Button>
                        </li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-x-2 p-3  bg-black/15">
                    {(showUserVideo || showShareScreen) && (
                        <button
                            onClick={() =>
                                setMainStream(currentStreamRef.current)
                            }
                            className="w-min h-min"
                        >
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
                        </button>
                    )}
                    {Array.from(otherUserStreams.current.entries()).map(
                        ([userId, stream]) => {
                            if (streamHasVideoTracks(stream))
                                return (
                                    <button
                                        className="w-min h-min"
                                        onClick={() => setMainStream(stream)}
                                        key={userId}
                                    >
                                        <StreamVideo
                                            size="w-36 h-36"
                                            ref={(videoElement) => {
                                                if (videoElement) {
                                                    videoElement.srcObject =
                                                        stream;
                                                }
                                            }}
                                            autoPlay
                                        />
                                    </button>
                                );
                            else return "";
                        }
                    )}
                    {users.map((user) => {
                        if (user.id == auth.user.id)
                            if (showUserVideo || showShareScreen) return "";
                            else
                                return <UserAvatar user={user} key={user.id} />;
                        return (
                            !streamHasVideoTracks(
                                otherUserStreams.current.get(user.id)
                            ) && <UserAvatar user={user} key={user.id} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
