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
import { useEffect } from "react";
import {
    addHuddleUser,
    removeHuddleUser,
    addManyHuddleUsers,
} from "@/Store/Slices/huddleSlice";
import { useDispatch } from "react-redux";
export default function Huddle() {
    const { auth } = usePage().props;
    const { channel, users } = useSelector((state) => state.huddle);
    const { sideBarWidth } = useSelector((state) => state.workspaceProfile);
    const dispatch = useDispatch();
    useEffect(() => {
        if (channel)
            Echo.join(`huddles.${channel.id}`)
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
            if (channel) Echo.leave(`huddles.${channel.id}`);
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
                <IconButton description="More options" activable={false}>
                    <RiMore2Fill />
                </IconButton>
                <li>
                    <Button className="bg-pink-600 text-sm">Leave</Button>
                </li>
            </ul>
        </div>
    );
}
