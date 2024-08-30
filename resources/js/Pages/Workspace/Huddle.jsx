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
import { useEffect, useRef, useState } from "react";
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
    openCamera,
    stopStream,
} from "@/helpers/mediaHelper";

export default function Huddle() {
    const { auth } = usePage().props;
    const joinObject = useRef(null);
    const userVideoRef = useRef(null);
    const [cameraDevices, setCameraDevices] = useState([]);
    const [audioDevices, setAudioDevices] = useState([]);
    const currentCamera = useRef(null);
    const currentAudio = useRef(null);
    const [showUserVideo, setShowUserVideo] = useState(false);
    const { channel, users } = useSelector((state) => state.huddle);
    const { sideBarWidth } = useSelector((state) => state.workspaceProfile);
    const dispatch = useDispatch();

    function initStream() {
        openCamera(currentCamera.current?.deviceId, 500, 500).then((stream) => {
            userVideoRef.current.srcObject = stream;
            console.log("open stream");
        });
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
    }, [channel]);
    useEffect(() => {
        if (!channel) return;
        joinObject.current = Echo.join(`huddles.${channel.id}`);
        joinObject.current
            .here((users) => {
                dispatch(addManyHuddleUsers(users));
            })
            .joining((user) => {
                dispatch(addHuddleUser(user));
            })
            .leaving((user) => {
                dispatch(removeHuddleUser(user));
            })
            .listen("HuddleEvent", (e) => {
                // setlocalMessages((pre) => [...pre, e.message]);
                console.log(e);
            })
            .error((error) => {
                console.error(error);
            });

        return () => {
            if (channel) {
                Echo.leave(`huddles.${channel.id}`);
                joinObject.current = null;
            }
        };
    }, [channel]);
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
            <div className="p-4 flex justify-center gap-x-2 bg-white/10 mx-4 rounded-lg">
                {users.map((user) => (
                    <Avatar key={user.id} src={user.avatar_url} noStatus />
                ))}

                {showUserVideo && (
                    <video
                        ref={userVideoRef}
                        autoPlay
                        muted
                        className="w-24"
                    ></video>
                )}
            </div>
            <ul className="flex gap-x-2 items-center p-4 justify-center">
                <IconButton
                    description="Mute mic"
                    activeDescription="Unmute mic"
                >
                    <GrMicrophone />
                </IconButton>
                <IconButton
                    description="Turn on video"
                    activeDescription="Turn off video"
                    onClick={() => {
                        setShowUserVideo((pre) => !pre);
                        if (userVideoRef.current?.srcObject)
                            stopStream(userVideoRef.current.srcObject);
                        if (!showUserVideo) initStream();
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
                        <div className="flex flex-col py-2 bg-background rounded-lg text-white/85 mb-4 min-w-60 max-w-80 border border-white/15">
                            {cameraDevices.map((cam) => (
                                <CloseButton
                                    className="px-4 py-2 hover:bg-white/10 text-left"
                                    key={cam.deviceId}
                                    onClick={() => {
                                        currentCamera.current = cam;
                                    }}
                                >
                                    {cam.label}
                                </CloseButton>
                            ))}
                        </div>
                    </PopoverPanel>
                </Popover>

                <li>
                    <Button
                        className="bg-pink-600 text-sm"
                        onClick={() => dispatch(toggleHuddle())}
                    >
                        Leave
                    </Button>
                </li>
            </ul>
        </div>
    );
}
