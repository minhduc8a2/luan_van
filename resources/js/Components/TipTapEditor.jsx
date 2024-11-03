import { EditorContent, useEditor } from "@tiptap/react";
import Paragraph from "@tiptap/extension-paragraph";
import Document from "@tiptap/extension-document";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Code from "@tiptap/extension-code";
import Strike from "@tiptap/extension-strike";
import CodeBlock from "@tiptap/extension-code-block";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Link from "@tiptap/extension-link";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { GoBold } from "react-icons/go";
import { FaItalic } from "react-icons/fa";
import { FaStrikethrough } from "react-icons/fa";
import { MdOutlineFormatListBulleted } from "react-icons/md";
import { LuListOrdered } from "react-icons/lu";
import { TbBlockquote } from "react-icons/tb";
import { FaCode } from "react-icons/fa6";
import { PiCodeBlock } from "react-icons/pi";
import { FaPlus } from "react-icons/fa6";
import { VscMention } from "react-icons/vsc";
import { PiVideoCamera } from "react-icons/pi";
import { TiMicrophoneOutline } from "react-icons/ti";
import { Extension } from "@tiptap/core";
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="control-group">
            <div className="flex gap-x-4 items-center flex-wrap">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={
                        editor.isActive("bold")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <GoBold className="text-color-high-emphasis" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can().chain().focus().toggleItalic().run()
                    }
                    className={
                        editor.isActive("italic")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <FaItalic className="text-color-high-emphasis" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can().chain().focus().toggleStrike().run()
                    }
                    className={
                        editor.isActive("strike")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <FaStrikethrough className="text-color-high-emphasis" />
                </button>

                <button
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={
                        editor.isActive("orderedList")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <LuListOrdered className="text-color-high-emphasis" />
                </button>

                <button
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={
                        editor.isActive("bulletList")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <MdOutlineFormatListBulleted className="text-color-high-emphasis" />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className={
                        editor.isActive("blockquote")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <TbBlockquote className="text-color-high-emphasis" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editor.can().chain().focus().toggleCode().run()}
                    className={
                        editor.isActive("code")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <FaCode className="text-color-high-emphasis" />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={
                        editor.isActive("codeBlock")
                            ? "bg-color/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <PiCodeBlock className="text-color-high-emphasis" />
                </button>

                <Popover className="relative flex items-center">
                    <PopoverButton>
                        <CiFaceSmile className="text-color-high-emphasis" />
                    </PopoverButton>
                    <PopoverPanel anchor="bottom" className="flex flex-col ">
                        <EmojiPicker
                            data={data}
                            onEmojiSelect={(emoji) =>
                                editor
                                    .chain()
                                    .focus()
                                    .insertContent(emoji.native)
                                    .run()
                            }
                        />
                    </PopoverPanel>
                </Popover>
            </div>
        </div>
    );
};

import data from "@emoji-mart/data";
import EmojiPicker from "@emoji-mart/react";
import { CiFaceSmile } from "react-icons/ci";
import { IoMdSend } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { useRef, useState, useEffect, useId, useMemo, useContext } from "react";
import { router, usePage } from "@inertiajs/react";
import { isImage } from "@/helpers/fileHelpers";
import SquareImage from "./SquareImage";
import FileItem from "./FileItem";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import Mention from "@tiptap/extension-mention";
import { MentionList } from "./MentionList.jsx";
import Button from "./Button";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ThemeContext from "@/ThemeProvider";
export default function TipTapEditor({
    onSubmit,

    message = null,
    focus = 1,
    isEditMessage = false,
    closeEditMessageEditor = () => {},
    onlyText = false,
    channel,
    channelUsers,
}) {
    const { auth } = usePage().props;
    const { workspaceId } = useParams();
    const { theme } = useContext(ThemeContext);
    const inputId = useId();
    const serverResponseFileList = useRef([]);
    const [fileListMap, setFileListMap] = useState({});
    const mentionsListRef = useRef({});
    const abortControllers = useRef({});
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploading, setUploading] = useState(false);
    const uploadingRef = useRef(false);
    const inputFileRef = useRef(null);

    function handleRemoveFile(id) {
        abortControllers.current[id]?.abort();
        setFileListMap((pre) => ({
            ...pre,
            [id]: null,
        }));
        setUploadProgress((pre) => {
            const temp = { ...pre };
            temp[id] = null;
            return temp;
        });
      
        serverResponseFileList.current = serverResponseFileList.current.filter(
            (f) => f.id != id
        );
    }

    function resetState() {
        setFileListMap({});
        serverResponseFileList.current = [];
        mentionsListRef.current = [];
    }

    function submit(editor) {
        if (uploadingRef.current) return;
        onSubmit(
            editor.getHTML(),
            serverResponseFileList.current,
            editor.getJSON()
        );
        editor.commands.clearContent();

        resetState();
        return true;
    }
    async function handleFilePicked(e) {
        const files = e.target.files;

        // return;
        const filesWithId = Object.values(files).map((file) => ({
            id: uuidv4(),
            file,
        }));
        setFileListMap((pre) => {
            let tempList = { ...pre };
            filesWithId.forEach((fileWithId) => {
                tempList[fileWithId.id] = fileWithId.file;
            });
            return tempList;
        });

        setUploading(true);
        setUploadProgress({});
        await Promise.all(
            filesWithId.map((fileWithId, index) => {
                const controller = new AbortController();
                abortControllers.current[fileWithId.id] = controller;
                uploadingRef.current = true;
                return axios
                    .postForm(
                        route("upload_files", {
                            workspace: workspaceId,
                            user: auth.user.id,
                        }),
                        { file: fileWithId.file, id: fileWithId.id },
                        {
                            signal: controller.signal,
                            onUploadProgress: function (progressEvent) {
                                const percentCompleted = Math.ceil(
                                    (progressEvent.loaded /
                                        progressEvent.total) *
                                        100
                                );
                                setUploadProgress((pre) => {
                                    const temp = { ...pre };
                                    temp[fileWithId.id] = percentCompleted;
                                    return temp;
                                });
                            },
                        }
                    )
                    .then((response) => {
                        serverResponseFileList.current = [
                            ...serverResponseFileList.current,
                            ...response.data,
                        ];
                        uploadingRef.current = false;
                    })
                    .catch((error) => {
                        console.log("abort, continue", error);
                        uploadingRef.current = false;
                    });
            })
        );

        inputFileRef.current.value = null;
    }
    const ShiftEnterCreateExtension = Extension.create({
        addKeyboardShortcuts() {
            return {
                "Shift-Enter": ({ editor }) =>
                    editor.commands.first(({ commands }) => [
                        () => commands.newlineInCode(),
                        () => commands.splitListItem("listItem"), // This line added
                        () => commands.createParagraphNear(),
                        () => commands.liftEmptyBlock(),
                        () => commands.splitBlock(),
                    ]),
                Enter: ({ editor }) => {
                    return submit(editor);
                },
            };
        },
    });
    const extensions = [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Code,
        Strike,
        CodeBlock,
        BulletList,
        ListItem,
        OrderedList,
        ShiftEnterCreateExtension,
        Mention.configure({
            // HTMLAttributes: {
            //     class: "mention",
            // },

            renderHTML({ node }) {
                return [
                    "span",
                    {
                        "data-type": "mention",
                        class: "mention",
                    },
                    `@${node.attrs.label}`,
                ];
            },

            suggestion: {
                items: ({ query }) => {
                    return channelUsers
                        .filter(
                            (item) =>
                                item.id !== auth.user.id &&
                                item.name
                                    .toLowerCase()
                                    .startsWith(query.toLowerCase())
                        )
                        .slice(0, 5);
                },
                render: () => {
                    let reactRenderer;
                    let popup;

                    return {
                        onStart: (props) => {
                            if (!props.clientRect) {
                                return;
                            }

                            reactRenderer = new ReactRenderer(MentionList, {
                                props,
                                editor: props.editor,
                            });

                            popup = tippy("body", {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: reactRenderer.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: "manual",
                                placement: "bottom-start",
                            });
                        },

                        onUpdate(props) {
                            reactRenderer.updateProps(props);

                            if (!props.clientRect) {
                                return;
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            });
                        },

                        onKeyDown(props) {
                            if (props.event.key === "Escape") {
                                popup[0].hide();

                                return true;
                            }

                            return reactRenderer.ref?.onKeyDown(props);
                        },

                        onExit() {
                            popup[0].destroy();
                            reactRenderer.destroy();
                        },
                    };
                },
            },
        }),

        // Link.configure({
        //     openOnClick: false,
        //     autolink: true,
        //     defaultProtocol: "https",
        // }),
    ];

    const content = message?.content && isEditMessage ? message?.content : ``;
    const editorProps = {
        attributes: {
            class: `prose ${
                theme.mode ? "prose-invert" : ""
            }  text-color-high-emphasis  focus:outline-none  `,
        },
        handleKeyDown: () => {},
    };

    const editor = useEditor(
        {
            extensions,
            content,
            editorProps,

            // onUpdate({ editor }) {
            //     console.log(editor.getJSON());
            // },
        },
        message
            ? [channel.id, message?.id, channelUsers, theme]
            : [channel.id, channelUsers, theme]
    );

    useEffect(() => {
        if (editor) editor.commands.focus();
    }, [focus, editor]);
    const uploadAllProgress = useMemo(() => {
        const length = Object.values(uploadProgress).filter(
            (item) => item != null
        ).length;
        return Object.values(uploadProgress).reduce(
            (pre, progress) =>
                progress != null ? pre + Math.ceil(progress / length) : pre,
            0
        );
    }, [uploadProgress]);
    return (
        <div className="w-full">
            {/* <progress id="progress-bar" value={uploadProgress} max="100"></progress> */}
            <MenuBar editor={editor} />
            <div className="max-h-96 overflow-y-auto ">
                <EditorContent editor={editor} />
            </div>
            <div className="flex gap-2 max-h-48 overflow-y-auto scrollbar flex-wrap">
                {Object.entries(fileListMap).map(([id, file], index) => {
                    if (!file) return "";
                    if (isImage(file.type)) {
                        return (
                            <SquareImage
                                size="h-16 w-16"
                                url={URL.createObjectURL(file)}
                                key={id}
                                removable={true}
                                uploadable={true}
                                percentage={uploadProgress[id]}
                                remove={() => handleRemoveFile(id)}
                            />
                        );
                    } else {
                        return (
                            <div className="" key={id}>
                                <FileItem
                                    file={file}
                                    maxWidth="max-w-72"
                                    removable
                                    remove={() => handleRemoveFile(id)}
                                    uploadable={true}
                                    percentage={uploadProgress[id]}
                                />
                            </div>
                        );
                    }
                })}
            </div>
            {!isEditMessage && (
                <>
                    <div className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-x-4">
                            {!onlyText && (
                                <div className="">
                                    <label
                                        className="bg-color/10 rounded-full w-fit p-2 block"
                                        htmlFor={inputId}
                                    >
                                        {" "}
                                        <FaPlus className="text-sm opacity-75 text-color-medium-emphasis" />
                                    </label>
                                    <input
                                        ref={inputFileRef}
                                        type="file"
                                        name=""
                                        id={inputId}
                                        multiple
                                        onChange={handleFilePicked}
                                        hidden
                                    />
                                </div>
                            )}
                            <button
                                className="hover:bg-color/15 rounded w-fit p-1"
                                onClick={() =>
                                    editor.commands.insertContent("@")
                                }
                            >
                                <VscMention className="text-2xl opacity-75 text-color-high-emphasis" />
                            </button>
                            {!onlyText && (
                                <PiVideoCamera className="text-xl opacity-75 text-color-high-emphasis" />
                            )}
                            {!onlyText && (
                                <TiMicrophoneOutline className="text-xl opacity-75 text-color-high-emphasis" />
                            )}

                            {uploadAllProgress > 0 &&
                                uploadAllProgress < 100 && (
                                    <div className="flex gap-x-2 items-center">
                                        |
                                        <div className="text-xs text-color-medium-emphasis">
                                            Uploading
                                        </div>
                                        <div className="w-64">
                                            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                                <div
                                                    className="bg-purple-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                                                    style={{
                                                        width: `${uploadAllProgress}%`,
                                                    }}
                                                >
                                                    {" "}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            {uploadAllProgress}%
                                        </div>
                                    </div>
                                )}
                        </div>

                        <div className="p-1 px-2 bg-green-800 text-white rounded flex justify-center items-center gap-x-2">
                            <button onClick={() => submit(editor)}>
                                <IoMdSend className="text-base" />
                            </button>
                            <div className="opacity-75">|</div>
                            <FaAngleDown className="text-sm" />
                        </div>
                    </div>
                </>
            )}
            {isEditMessage && (
                <div className="py-2 flex items-center justify-end">
                    <Button
                        className="text-xs"
                        onClick={closeEditMessageEditor}
                    >
                        Close
                    </Button>
                    <Button
                        className="bg-green-900 ml-4 text-xs  !text-white"
                        onClick={() => submit(editor)}
                    >
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
}
