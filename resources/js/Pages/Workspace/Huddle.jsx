import { MdOutlineZoomOutMap } from "react-icons/md";
import { GrMicrophone } from "react-icons/gr";
import { PiVideoCameraSlash } from "react-icons/pi";
import { CgScreen } from "react-icons/cg";
import { IoMdPersonAdd } from "react-icons/io";
import { RiMore2Fill } from "react-icons/ri";
import Button from "@/Components/Button";
import IconButton from "@/Components/IconButton";
import { useSelector } from "react-redux";
import { usePage } from "@inertiajs/react";
import Avatar from "@/Components/Avatar";
import {
    Popover,
    PopoverButton,
    PopoverPanel,
    CloseButton,
} from "@headlessui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    addHuddleUser,
    removeHuddleUser,
    addManyHuddleUsers,
    toggleHuddle,
} from "@/Store/Slices/huddleSlice";
import Peer from "simple-peer";
import { useDispatch } from "react-redux";
import {
    getConnectedDevices,
    getAudioStream,
    getVideoStream,
    checkDeviceInUse,
    streamHasVideoTracks,
    streamHasAudioTracks,
} from "@/helpers/mediaHelper";
import SquareImage from "@/Components/SquareImage";
import StreamVideo from "@/Components/StreamVideo";

export default function Huddle() {
    const { auth } = usePage().props;
    const [refresh, setRefresh] = useState(0);
    const [enableAudio, setEnableAudio] = useState(true);
    const joinObject = useRef(null);

    const currentStreamRef = useRef(null);
    const [cameraDevices, setCameraDevices] = useState([]);
    const [audioDevices, setAudioDevices] = useState([]);
    const currentVideoRef = useRef(null);
    const currentAudioRef = useRef(null);
    const peersRef = useRef(new Map());
    const otherUserStreams = useRef(new Map());
    const [showUserVideo, setShowUserVideo] = useState(false);
    const { channel, users } = useSelector((state) => state.huddle);
    const { sideBarWidth } = useSelector((state) => state.workspaceProfile);
    const dispatch = useDispatch();
    function shouldRerender() {
        setRefresh((pre) => pre + 1);
    }
    const hasAnyVideoTrack = useMemo(
        function () {
            for (const [key, stream] of otherUserStreams.current) {
                if (streamHasVideoTracks(stream)) {
                    return true;
                }
            }
            if (streamHasVideoTracks(currentStreamRef.current)) return true;
            return false;
        },
        [refresh, showUserVideo]
    );

    function addTrackToStream(type) {
        if (type == "audio") {
            getAudioStream(currentAudioRef.current?.deviceId).then((stream) => {
                const audioTrack = stream.getAudioTracks()[0];
                currentStreamRef.current.addTrack(audioTrack);
                peersRef.current.forEach((value, key) => {
                    value.addTrack(audioTrack, currentStreamRef.current);
                });
            });
        } else if (type == "video") {
            getVideoStream(currentVideoRef.current?.deviceId, 500, 500).then(
                (stream) => {
                    const videoTrack = stream.getVideoTracks()[0];
                    currentStreamRef.current.addTrack(videoTrack);
                    //add stream to user video elements
                    peersRef.current.forEach((value, key) => {
                        value.addTrack(videoTrack, currentStreamRef.current);
                    });
                }
            );
        }
    }
    function removeTrackTFromStream(type) {
        if (type == "audio") {
            const audioTracks = currentStreamRef.current.getAudioTracks();
            audioTracks.forEach((track) => {
                currentStreamRef.current.removeTrack(track);
                track.stop();
            });
            peersRef.current.forEach((value, key) => {
                value.send({ type: "removeAudioTrack" });
            });
        } else if (type == "video") {
            const videoTracks = currentStreamRef.current.getVideoTracks();
            videoTracks.forEach((track) => {
                currentStreamRef.current.removeTrack(track);
                track.stop();
            });
            peersRef.current.forEach((value, key) => {
                value.send({ type: "removeVideoTrack" });
            });
        }
    }

    useEffect(() => {
        if (!channel) return;
        async function getMediaDevices() {
            const _cameraDevices = await getConnectedDevices("videoinput");
            const _audioDevices = await getConnectedDevices("audioinput");
            setCameraDevices(_cameraDevices);
            setAudioDevices(_audioDevices);
        }
        getMediaDevices();
        // navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        //     userVideoRef.current.srcObject = stream;
        // });
    }, [channel?.id]);
    function addPeer(user, initiator) {
        var peer = new Peer({
            initiator,
            stream: currentStreamRef.current,
        });
        peer.on("signal", (data) => {
            joinObject.current.whisper("signal." + user.id, {
                fromUserId: auth.user.id,
                signal: data,
            });
        });
        peer.on("connect", () => {
            console.log("CONNECT");
        });

        peer.on("stream", (stream) => {
            otherUserStreams.current.set(user.id, stream);
            console.log("Received stream." + user.id);
            shouldRerender();
        });
        peer.on("track", (track, stream) => {
            otherUserStreams.current.set(user.id, stream);
            console.log("Received track." + user.id + " - type: " + track.kind);

            shouldRerender();
        });
        peer.on("data", (data) => {
            if (data.type) {
                const tracks =
                    data.type == "removeAudioTrack"
                        ? otherUserStreams.current.get(user.id).getAudioTracks()
                        : otherUserStreams.current
                              .get(user.id)
                              .getVideoTracks();
                tracks.forEach((track) => {
                    otherUserStreams.current.get(user.id).removeTrack(track);
                    track.stop();
                });
                shouldRerender();
            }
        });
        peer.on("close", () => {
            peersRef.current.get(user.id)?.destroy();
            peersRef.current.delete(user.id);
            otherUserStreams.current.delete(user.id);
            shouldRerender();
        });
        peersRef.current.set(user.id, peer);
    }
    useEffect(() => {
        if (!channel) return;
        getAudioStream(currentAudioRef.current?.deviceId).then((stream) => {
            currentStreamRef.current = stream;
            //
            joinObject.current = Echo.join(`huddles.${channel.id}`);
            joinObject.current.listenForWhisper(
                "signal." + auth.user.id,
                (e) => {
                    const peer = peersRef.current.get(e.fromUserId);
                    peer.signal(e.signal);
                }
            );
            joinObject.current
                .here((users) => {
                    dispatch(addManyHuddleUsers(users));
                    users
                        .filter((user) => user.id != auth.user.id)
                        .forEach((user) => {
                            addPeer(user, true);
                        });
                })
                .joining((user) => {
                    dispatch(addHuddleUser(user));
                    addPeer(user, false);
                })
                .leaving((user) => {
                    dispatch(removeHuddleUser(user));
                })
                .listen("HuddleEvent", (e) => {
                    // setlocalMessages((pre) => [...pre, e.message]);
                })
                .error((error) => {
                    console.error(error);
                });
        });

        return () => {
            if (channel) {
                Echo.leave(`huddles.${channel.id}`);

                joinObject.current = null;
            }
        };
    }, [channel?.id]);
    if (!channel) return "";
    return (
        <div
            className="bg-primary-light w-96  text-white/85  fixed bottom-12 rounded-xl"
            style={{ left: sideBarWidth + 16 }}
        >
            <div className="flex justify-between p-4 items-center">
                <div className="text-sm">{channel.name}</div>
                <MdOutlineZoomOutMap />
            </div>
            <div className="p-4 flex justify-center gap-2 bg-white/10 mx-4 rounded-lg flex-wrap">
                {showUserVideo && (
                    <StreamVideo
                        className="w-36"
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
                        if (
                            streamHasAudioTracks(stream) &&
                            !streamHasVideoTracks(stream)
                        )
                            return (
                                <audio
                                    key={userId}
                                    ref={(videoElement) => {
                                        if (videoElement) {
                                            videoElement.srcObject = stream;
                                        }
                                    }}
                                    autoPlay
                                    hidden
                                ></audio>
                            );
                        else return "";
                    }
                )}
                {Array.from(otherUserStreams.current.entries()).map(
                    ([userId, stream]) => {
                        if (streamHasVideoTracks(stream))
                            return (
                                <StreamVideo
                                    className="w-36"
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
                        if (showUserVideo) return "";
                        else
                            return (
                                <SquareImage
                                    key={user.id}
                                    url={user.avatar_url}
                                    removable={false}
                                    size={hasAnyVideoTrack ? "w-36" : "w-10"}
                                />
                            );
                    return (
                        !streamHasVideoTracks(
                            otherUserStreams.current.get(user.id)
                        ) && (
                            <SquareImage
                                key={user.id}
                                url={user.avatar_url}
                                removable={false}
                                size={hasAnyVideoTrack ? "w-36" : "w-10"}
                            />
                        )
                    );
                })}
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
                >
                    <CgScreen />
                </IconButton>
                <IconButton description="Invite people" activable={false}>
                    <IoMdPersonAdd />
                </IconButton>
                <Popover className="relative">
                    <PopoverButton>
                        {" "}
                        <IconButton
                            description="More options"
                            activable={false}
                        >
                            <RiMore2Fill />
                        </IconButton>
                    </PopoverButton>
                    <PopoverPanel anchor="bottom start">
                        <div className="flex flex-col py-2 bg-background rounded-lg text-white/85 mb-4 min-w-60 max-w-80 border border-white/15 ">
                            <h5 className="text-lg px-4 font-bold">
                                Audio devices
                            </h5>
                            {audioDevices.map((au) => (
                                <CloseButton
                                    className="px-6 py-2 hover:bg-white/10 text-left text-sm"
                                    key={au.deviceId}
                                    onClick={() => {
                                        currentAudioRef.current = au;
                                    }}
                                >
                                    {au.label}
                                    {checkDeviceInUse(
                                        "audio",
                                        currentStreamRef.current,
                                        au.deviceId
                                    ) && (
                                        <span className="font-bold text-cyan-400">
                                            {" - In use"}
                                        </span>
                                    )}
                                </CloseButton>
                            ))}
                            <hr className="my-2 opacity-15" />
                            <h5 className="text-lg px-4 font-bold">
                                Video devices
                            </h5>
                            {cameraDevices.map((cam) => (
                                <CloseButton
                                    className="px-6 py-2 hover:bg-white/10 text-left text-sm"
                                    key={cam.deviceId}
                                    onClick={() => {
                                        currentVideoRef.current = cam;
                                    }}
                                >
                                    {cam.label}
                                    {checkDeviceInUse(
                                        "video",
                                        currentStreamRef.current,
                                        cam.deviceId
                                    ) && (
                                        <span className="font-bold text-cyan-400">
                                            {" - In use"}
                                        </span>
                                    )}
                                </CloseButton>
                            ))}
                        </div>
                    </PopoverPanel>
                </Popover>

                <li>
                    <Button
                        className="bg-pink-600 text-sm"
                        onClick={() => {
                            removeTrackTFromStream("video");
                            removeTrackTFromStream("audio");
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
