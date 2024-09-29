import AvatarAndName from "@/Components/AvatarAndName";
import Button from "@/Components/Button";
import AutocompleInput from "@/Components/Input/AutocompleInput";
import Overlay from "@/Components/Overlay/Overlay";
import TipTapEditor from "@/Components/TipTapEditor";
import { channelProps, getDirectChannelUser } from "@/helpers/channelHelper";
import { router, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useMemo, useState } from "react";
import { FaLock } from "react-icons/fa";
import Message from "../Message";
import { useDispatch, useSelector } from "react-redux";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import { getMentionsFromContent } from "@/helpers/tiptapHelper";
import { setThreadedMessageId } from "@/Store/threadSlice";

export default function ForwardMessage({ message, show, onClose }) {
    const dispatch = useDispatch();
    const { directChannels, auth, channelUsers, channel } = usePage().props;
    const { channels } = useSelector((state) => state.channels);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    const [choosenChannelsList, setChoosenChannelsList] = useState([]);
    function changeChannel(channel) {
        dispatch(setThreadedMessageId(null));
        router.get(
            route("channels.show", {
                workspace: workspace.id,
                channel: channel.id,
            }),
            {},
            { preserveState: true, only: channelProps }
        );
    }
    function onSubmit(content, _, JSONContent) {
        if (choosenChannelsList.length < 1) return;
        let mentionsList = getMentionsFromContent(JSONContent);
        router.post(
            route("message.store", { channel: channel.id }),
            {
                content,
                channelId: choosenChannelsList[0].id,
                forwardedMessageId: message.id,
                mentionsList,
            },
            {
                only: [],
                preserveState: true,
                preserveScroll: true,
                headers: {
                    "X-Socket-Id": Echo.socketId(),
                },
                onError: (errors) =>
                    dispatch(
                        setNotificationPopup({
                            type: "error",
                            messages: Object.values(errors),
                        })
                    ),
                onSuccess: () => {
                    changeChannel(choosenChannelsList[0]);
                },
            }
        );
    }

    function handleChooseChannel(cn) {
        if (choosenChannelsList.length > 0) return;
        setChoosenChannelsList([cn]);
    }
    useEffect(() => {
        setChoosenChannelsList([]);
    }, [message]);

    if (!message) return "";
    const user = channelUsers.filter((mem) => mem.id === message.user_id)[0];
    return (
        <Overlay show={show} onClose={onClose}>
            <div
                className={
                    "w-[30vw] max-w-screen-sm m-4 bg-background py-3 px-6 rounded-lg"
                }
            >
                <h2 className="text-2xl my-4 font-bold text-white/85">
                    Forward this message
                </h2>
                <AutocompleInput
                    choosenList={choosenChannelsList}
                    inputPlaceholder="Add by name or channel"
                    renderChoosenList={() =>
                        choosenChannelsList.map((item) => {
                            if (item.type == "DIRECT") {
                                const userIds = item.name.split("_");
                                const userId = userIds.find(
                                    (id) => id != auth.user.id
                                );
                                let user = workspaceUsers.find(
                                    (u) => u.id == userId
                                );
                                return (
                                    <AutocompleInput.InputItem
                                        onRemove={() =>
                                            setChoosenChannelsList([])
                                        }
                                        key={item.id}
                                    >
                                        <AvatarAndName
                                            user={user}
                                            className="h-4 w-4"
                                        />
                                    </AutocompleInput.InputItem>
                                );
                            } else
                                return (
                                    <AutocompleInput.InputItem
                                        onRemove={() =>
                                            setChoosenChannelsList([])
                                        }
                                        key={item.id}
                                    >
                                        <div className="flex items-baseline gap-x-1">
                                            {item.type == "PUBLIC" ? (
                                                <span className="text-xl">
                                                    #
                                                </span>
                                            ) : (
                                                <FaLock className="text-sm inline" />
                                            )}{" "}
                                            {item.name}
                                        </div>
                                    </AutocompleInput.InputItem>
                                );
                        })
                    }
                    renderDropListFn={(inputValue) => {
                        if (!inputValue && choosenChannelsList.length > 0)
                            return "";
                        return channels
                            .filter((item) =>
                                item.name
                                    .toLowerCase()
                                    .includes(inputValue.toLowerCase())
                            )
                            .map((item) => {
                                if (item.type == "DIRECT") {
                                    const userIds = item.name.split("_");
                                    const userId = userIds.find(
                                        (id) => id != auth.user.id
                                    );
                                    let user = workspaceUsers.find(
                                        (u) => u.id == userId
                                    );
                                    return (
                                        <button
                                            key={item.id}
                                            className="hover:bg-white/15 p-2 px-4"
                                            onClick={() =>
                                                handleChooseChannel(item)
                                            }
                                        >
                                            <AvatarAndName
                                                user={user}
                                                className="h-6 w-6"
                                                noStatus={true}
                                            />
                                        </button>
                                    );
                                } else
                                    return (
                                        <button
                                            className="flex items-baseline gap-x-1 hover:bg-white/15 px-4 py-1"
                                            key={item.id}
                                            onClick={() =>
                                                handleChooseChannel(item)
                                            }
                                        >
                                            {item.type == "PUBLIC" ? (
                                                <span className="text-xl">
                                                    #
                                                </span>
                                            ) : (
                                                <FaLock className="text-sm inline" />
                                            )}{" "}
                                            {item.name}
                                        </button>
                                    );
                            });
                    }}
                />
                <div className="border border-white/15 p-4 pb-2 mt-4 rounded-lg ">
                    <TipTapEditor onSubmit={onSubmit} onlyText />
                </div>
                <div className="max-h-[35vh] overflow-y-auto scrollbar mt-4 border-l-4 border-l-white/15 relative">
                    <Message
                        noToolbar
                        threadStyle={true}
                        message={message}
                        user={user}
                        hasChanged={true}
                        index={0}
                    />
                </div>
                <div className="mt-8">
                    <div
                        className={`mt-4 flex justify-end
                            `}
                    >
                        <div className="flex gap-x-4">
                            <Button
                                className="text-white/65"
                                onClick={(e) => {
                                    console.log("close form");
                                    e.preventDefault();
                                    onClose();
                                }}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Overlay>
    );
}
