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
            <div className="flex gap-x-4 items-center">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={
                        editor.isActive("bold")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <GoBold />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can().chain().focus().toggleItalic().run()
                    }
                    className={
                        editor.isActive("italic")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <FaItalic />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can().chain().focus().toggleStrike().run()
                    }
                    className={
                        editor.isActive("strike")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <FaStrikethrough />
                </button>

                <button
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className={
                        editor.isActive("orderedList")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <LuListOrdered />
                </button>

                <button
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className={
                        editor.isActive("bulletList")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <MdOutlineFormatListBulleted />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className={
                        editor.isActive("blockquote")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <TbBlockquote />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editor.can().chain().focus().toggleCode().run()}
                    className={
                        editor.isActive("code")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <FaCode />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    className={
                        editor.isActive("codeBlock")
                            ? "bg-white/10 p-1 rounded"
                            : "p-1"
                    }
                >
                    <PiCodeBlock />
                </button>

                <Popover className="relative flex items-center">
                    <PopoverButton>
                        <CiFaceSmile />
                    </PopoverButton>
                    <PopoverPanel anchor="bottom" className="flex flex-col">
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
import { useRef, useState, useEffect, useId } from "react";
import { router, usePage } from "@inertiajs/react";
import { isImage } from "@/helpers/fileHelpers";
import SquareImage from "./SquareImage";
import FileItem from "./FileItem";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import Mention from "@tiptap/extension-mention";
import { MentionList } from "./MentionList.jsx";

export default function TipTapEditor({
    onSubmit,
    onFilePicked,
    message = null,
}) {
    const { auth, channel, channelUsers } = usePage().props;
    const inputId = useId();
    const serverResponseFileList = useRef([]);
    const [fileList, setFileList] = useState([]);
    const mentionsListRef = useRef({});
    const abortControllers = useRef([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const inputFileRef = useRef(null);
    function handleRemoveFile(file) {
        const index = fileList.findIndex((f) => f.name == file.name);
        const controller = abortControllers.current[index];
        controller.abort();
        abortControllers.current.splice(index, 1);
        setFileList((pre) => pre.filter((f) => f.name != file.name));
        serverResponseFileList.current = serverResponseFileList.current.filter(
            (f) => f.name != file.name
        );
    }

    function resetState() {
        setFileList([]);
        serverResponseFileList.current = [];
        mentionsListRef.current = [];
    }

    function submit(editor) {
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
        setUploadProgress(0);
        setFileList((pre) => {
            let tempList = [...pre];
            Object.values(files).forEach((file) => {
                tempList.push(file);
            });
            return tempList;
        });
        const filesValues = Object.values(files);
        for (let index = 0; index < filesValues.length; index++) {
            const file = filesValues[index];
            const controller = new AbortController();
            abortControllers.current.push(controller);
            try {
                const res = await axios.postForm(
                    `/upload_file/${auth.user.id}`,
                    { file },
                    {
                        signal: controller.signal,
                        onUploadProgress: function (progressEvent) {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded / progressEvent.total) *
                                    100
                            );
                            setUploadProgress(percentCompleted);
                            if (percentCompleted == 100) {
                                console.log("Uploaded succuessfuly");
                            }
                        },
                    }
                );
                const jsonRes = await res;
                console.log(jsonRes);
                serverResponseFileList.current = [
                    ...serverResponseFileList.current,
                    ...jsonRes.data,
                ];
            } catch (error) {
                console.log("abort, continue", error);
            }
        }
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

    const content = ``;
    const editorProps = {
        attributes: {
            class: "prose prose-invert  text-white/85  focus:outline-none  ",
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
        message ? [channel.id, message.id] : [channel.id]
    );

    return (
        <div className="w-full">
            {/* <progress id="progress-bar" value={uploadProgress} max="100"></progress> */}
            <MenuBar editor={editor} />
            <div className="max-h-96 overflow-y-auto ">
                <EditorContent editor={editor} />
            </div>
            <div className="flex gap-x-2 flex-wrap">
                {fileList.map((file, index) => {
                    if (isImage(file.type)) {
                        return (
                            <SquareImage
                                size="h-16 w-16"
                                url={URL.createObjectURL(file)}
                                key={"file_" + file.name}
                                removable={true}
                                uploadable={true}
                                percentage={uploadProgress}
                                remove={() => handleRemoveFile(file)}
                            />
                        );
                    } else {
                        return (
                            <div className="" key={"file_" + file.name}>
                                <FileItem
                                    file={file}
                                    maxWidth="max-w-36"
                                    removable
                                    remove={() => handleRemoveFile(file)}
                                    uploadable={true}
                                    percentage={uploadProgress}
                                />
                            </div>
                        );
                    }
                })}
            </div>
            <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <div className="">
                        <label
                            className="bg-white/10 rounded-full w-fit p-2 block"
                            htmlFor={inputId}
                        >
                            {" "}
                            <FaPlus className="text-sm opacity-75" />
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
                    <VscMention className="text-2xl opacity-75" />
                    <PiVideoCamera className="text-xl opacity-75" />
                    <TiMicrophoneOutline className="text-xl opacity-75" />

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="flex gap-x-2 items-center">
                            |<div className="text-xs">Uploading</div>
                            <div className="w-64">
                                <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                    <div
                                        className="bg-purple-500 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    >
                                        {" "}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs">{uploadProgress}%</div>
                        </div>
                    )}
                </div>

                <div className="p-1 px-2 bg-green-800 rounded flex justify-center items-center gap-x-2">
                    <button onClick={() => submit(editor)}>
                        <IoMdSend className="text-base" />
                    </button>
                    <div className="opacity-75">|</div>
                    <FaAngleDown className="text-sm" />
                </div>
            </div>
        </div>
    );
}
