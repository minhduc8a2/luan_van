import { MdOutlineZoomOutMap } from "react-icons/md";
import { GrMicrophone } from "react-icons/gr";
import { PiVideoCameraSlash } from "react-icons/pi";
import { CgScreen } from "react-icons/cg";
import { IoMdPersonAdd } from "react-icons/io";

import Button from "@/Components/Button";
import IconButton from "@/Components/IconButton";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    addHuddleUser,
    removeHuddleUser,
    addManyHuddleUsers,
    toggleHuddle,
} from "@/Store/huddleSlice";
import Peer from "simple-peer";
import { useDispatch, useSelector } from "react-redux";
import {
    getConnectedDevices,
    getAudioStream,
    getVideoStream,
    getScreenStream,
    streamHasVideoTracks,
    streamHasAudioTracks,
    removeVideoTracks,
    removeAudioTracks,
} from "@/helpers/mediaHelper";
import SquareImage from "@/Components/SquareImage";
import StreamVideo from "@/Components/StreamVideo";
import { router, usePage } from "@inertiajs/react";
import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import HuddleInvitation from "./HuddleInvitation";
import { getChannelName, getDirectChannelUser } from "@/helpers/channelHelper";
import Tooltip from "@/Components/Tooltip";
import Settings from "./Settings";
export default function Huddle() {
    const { auth } = usePage().props;
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { channelId: huddleChannelId, userIds } = useSelector(
        (state) => state.huddle
    );
    const { channels } = useSelector((state) => state.channels);

    const users = useMemo(() => {
        return workspaceUsers.filter((u) => userIds.find((id) => id == u.id));
    }, [workspaceUsers, userIds]);
    const channel = useMemo(() => {
        return channels.find((cn) => cn.id == huddleChannelId);
    }, [channels, huddleChannelId]);
    const otherUser = useMemo(() => {
        return getDirectChannelUser(channel, workspaceUsers, auth.user);
    }, [workspaceUsers, channel, auth.user]);
    const { sideBarWidth } = useSelector((state) => state.size);
    const [refresh, setRefresh] = useState(0);
    const [enableAudio, setEnableAudio] = useState(true);
    const joinObject = useRef(null);
    const dispatch = useDispatch();
    const currentStreamRef = useRef(null);
    const [cameraDevices, setCameraDevices] = useState([]);
    const [audioDevices, setAudioDevices] = useState([]);
    const currentVideoRef = useRef(null);
    const currentAudioRef = useRef(null);
    const peersRef = useRef(new Map());
    const otherUserStreams = useRef(new Map());
    const [showUserVideo, setShowUserVideo] = useState(false);
    const [showShareScreen, setShowShareScreen] = useState(false);

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
        [refresh]
    );

    function addTrackToStream(type) {
        if (type == "audio") {
            getAudioStream(currentAudioRef.current?.deviceId)
                .then((stream) => {
                    const audioTrack = stream.getAudioTracks()[0];
                    currentStreamRef.current.addTrack(audioTrack);
                    shouldRerender();
                    //add stream to user video elements
                    peersRef.current.forEach((peer, key) => {
                        const oldTracks =
                            currentStreamRef.current.getAudioTracks();
                        if (oldTracks.length > 0) {
                            peer.replaceTrack(
                                oldTracks[0],
                                audioTrack,
                                currentStreamRef.current
                            );
                        } else
                            peer.addTrack(audioTrack, currentStreamRef.current);
                    });
                    removeAudioTracks(currentStreamRef.current);
                    currentStreamRef.current.addTrack(audioTrack);
                })
                .catch((error) => {
                    setEnableAudio(false);
                    console.error(error);
                });
        } else if (type == "video") {
            getVideoStream(currentVideoRef.current?.deviceId, 500, 500)
                .then((stream) => {
                    const videoTrack = stream.getVideoTracks()[0];
                    shouldRerender();
                    //add stream to user video elements
                    peersRef.current.forEach((peer, key) => {
                        const oldTracks =
                            currentStreamRef.current.getVideoTracks();
                        if (oldTracks.length > 0) {
                            peer.replaceTrack(
                                oldTracks[0],
                                videoTrack,
                                currentStreamRef.current
                            );
                        } else
                            peer.addTrack(videoTrack, currentStreamRef.current);
                    });
                    removeVideoTracks(currentStreamRef.current);
                    currentStreamRef.current.addTrack(videoTrack);
                })
                .catch((error) => {
                    alert(error.message);
                    setShowUserVideo(false);
                });
        } else if (type == "screen") {
            getScreenStream()
                .then((stream) => {
                    const videoTrack = stream.getVideoTracks()[0];

                    shouldRerender();
                    //add stream to user video elements
                    peersRef.current.forEach((peer, key) => {
                        const oldTracks =
                            currentStreamRef.current.getVideoTracks();
                        if (oldTracks.length > 0) {
                            peer.replaceTrack(
                                oldTracks[0],
                                videoTrack,
                                currentStreamRef.current
                            );
                        } else
                            peer.addTrack(videoTrack, currentStreamRef.current);
                    });
                    removeVideoTracks(currentStreamRef.current);
                    currentStreamRef.current.addTrack(videoTrack);
                })
                .catch((error) => {
                    alert(error.message);
                    setShowShareScreen(false);
                });
        }
    }
    function removeTrackTFromStream(type) {
        if (type == "audio") {
            const audioTracks = currentStreamRef.current.getAudioTracks();
            audioTracks.forEach((track) => {
                currentStreamRef.current.removeTrack(track);
                track.stop();
            });
            peersRef.current.forEach((peer, key) => {
                peer.send(JSON.stringify({ type: "removeAudioTrack" }));
            });
        } else if (type == "video") {
            if (showShareScreen) {
                addTrackToStream("screen");
            } else {
                const videoTracks = currentStreamRef.current.getVideoTracks();
                videoTracks.forEach((track) => {
                    currentStreamRef.current.removeTrack(track);
                    track.stop();
                });
                peersRef.current.forEach((peer, key) => {
                    peer.send(JSON.stringify({ type: "removeVideoTrack" }));
                });
                shouldRerender();
            }
        } else if (type == "screen") {
            if (showShareScreen) {
                addTrackToStream("video");
            } else {
                const videoTracks = currentStreamRef.current.getVideoTracks();
                videoTracks.forEach((track) => {
                    currentStreamRef.current.removeTrack(track);
                    track.stop();
                });
                peersRef.current.forEach((peer, key) => {
                    peer.send(JSON.stringify({ type: "removeVideoTrack" }));
                });
                shouldRerender();
            }
        }
    }
    function leaveHuddle() {
        if (huddleChannelId) {
            Echo.leave(`huddles.${huddleChannelId}`);
            try {
                removeTrackTFromStream("video");
                removeTrackTFromStream("audio");
            } catch (error) {}
            otherUserStreams.current.clear();
            peersRef.current.clear();
            joinObject.current = null;
            setShowUserVideo(false);
            setShowShareScreen(false);
        }
    }
    useEffect(() => {
        if (!huddleChannelId) return;
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
    }, [huddleChannelId]);
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
            const jsonString = new TextDecoder().decode(data);

            try {
                data = JSON.parse(jsonString);
                if (data.type) {
                    const tracks =
                        data.type == "removeAudioTrack"
                            ? otherUserStreams.current
                                  .get(user.id)
                                  .getAudioTracks()
                            : otherUserStreams.current
                                  .get(user.id)
                                  .getVideoTracks();
                    tracks.forEach((track) => {
                        otherUserStreams.current
                            .get(user.id)
                            .removeTrack(track);
                        track.stop();
                    });
                    shouldRerender();
                }
            } catch (error) {
                console.error(error);
            }
        });
       
        peersRef.current.set(user.id, peer);
    }
    useEffect(() => {
        if (!huddleChannelId) return;
        getAudioStream(currentAudioRef.current?.deviceId).then((stream) => {
            currentStreamRef.current = stream;
            //
            joinObject.current = Echo.join(`huddles.${huddleChannelId}`);
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
                    dispatch(addHuddleUser(user.id));
                    addPeer(user, false);
                })
                .leaving((user) => {
                    dispatch(removeHuddleUser(user.id));
                    peersRef.current.get(user.id)?.destroy();
                    peersRef.current.delete(user.id);
                    otherUserStreams.current.delete(user.id);
                
                })
                .listen("HuddleEvent", (e) => {
                    // setlocalMessages((pre) => [...pre, e.message]);
                })
                .error((error) => {
                    console.error(error);
                });
        });

        return () => {
            leaveHuddle();
        };
    }, [huddleChannelId]);

    if (!huddleChannelId) return "";

    return (
        <div
            className="bg-primary-400 w-96  text-white/85  fixed bottom-12 rounded-xl"
            style={{ left: sideBarWidth + 16 }}
        >
            <div className="flex justify-between p-4 items-center">
                <div className="text-sm">
                    {getChannelName(channel, workspaceUsers, auth.user)}
                </div>
                <MdOutlineZoomOutMap />
            </div>
            <div className="p-4 flex justify-center gap-2 bg-white/10 mx-4 rounded-lg flex-wrap">
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
                                        size={
                                            hasAnyVideoTrack
                                                ? "w-36 h-36"
                                                : "w-10 h-10"
                                        }
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
                                size={
                                    hasAnyVideoTrack ? "w-36 h-36" : "w-10 h-10"
                                }
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
                    setVideoDevice={(cam) => {
                        currentVideoRef.current = cam;
                        addTrackToStream("video");
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
