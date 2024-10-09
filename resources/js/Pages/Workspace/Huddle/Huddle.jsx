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
    removeVideoTracks,
    removeAudioTracks,
} from "@/helpers/mediaHelper";

import { usePage } from "@inertiajs/react";

import { getDirectChannelUser } from "@/helpers/channelHelper";

import SmallScreen from "./SmallScreen";

import LargeScreen from "./LargeScreen";
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
    const [isFullScreen, setIsFullScreen] = useState(false);
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
            console.log("PEER CONNECT");
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
    if (!isFullScreen)
        return (
            <SmallScreen
                channel={channel}
                workspaceUsers={workspaceUsers}
                auth={auth}
                sideBarWidth={sideBarWidth}
                showUserVideo={showUserVideo}
                showShareScreen={showShareScreen}
                currentStreamRef={currentStreamRef}
                otherUserStreams={otherUserStreams}
                users={users}
                hasAnyVideoTrack={hasAnyVideoTrack}
                setEnableAudio={setEnableAudio}
                addTrackToStream={addTrackToStream}
                removeTrackTFromStream={removeTrackTFromStream}
                currentAudioRef={currentAudioRef}
                leaveHuddle={leaveHuddle}
                dispatch={dispatch}
                toggleHuddle={toggleHuddle}
                cameraDevices={cameraDevices}
                audioDevices={audioDevices}
                setShowUserVideo={setShowUserVideo}
                setShowShareScreen={setShowShareScreen}
                currentVideoRef={currentVideoRef}
                enableAudio={enableAudio}
                goFullScreen={() => setIsFullScreen(true)}
            />
        );
    else
        return (
            <LargeScreen
                channel={channel}
                workspaceUsers={workspaceUsers}
                auth={auth}
                sideBarWidth={sideBarWidth}
                showUserVideo={showUserVideo}
                showShareScreen={showShareScreen}
                currentStreamRef={currentStreamRef}
                otherUserStreams={otherUserStreams}
                users={users}
                hasAnyVideoTrack={hasAnyVideoTrack}
                setEnableAudio={setEnableAudio}
                addTrackToStream={addTrackToStream}
                removeTrackTFromStream={removeTrackTFromStream}
                currentAudioRef={currentAudioRef}
                leaveHuddle={leaveHuddle}
                dispatch={dispatch}
                toggleHuddle={toggleHuddle}
                cameraDevices={cameraDevices}
                audioDevices={audioDevices}
                setShowUserVideo={setShowUserVideo}
                setShowShareScreen={setShowShareScreen}
                currentVideoRef={currentVideoRef}
                enableAudio={enableAudio}
                exitFullScreen={() => setIsFullScreen(false)}
            />
        );
}
