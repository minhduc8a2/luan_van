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
import { useRef } from "react";
export default function TipTapEditor({ onSubmit }) {
    const fileList = useRef([]);
    function submit(editor) {
        onSubmit(editor.getHTML());
        editor.commands.clearContent();
        return true;
    }
    function handleFilePicked(e) {
        const files = e.target.files;
        fileList.current = [...fileList.current, ...e.target.files];
        console.log(fileList.current);
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
    const editor = useEditor({
        extensions,
        content,
        editorProps,
        // onUpdate({ editor }) {
        //     console.log(editor.getJSON());
        // },
    });

    return (
        <div className="w-full">
            <MenuBar editor={editor} />
            <div className="max-h-96 overflow-y-auto ">
                <EditorContent editor={editor} />
            </div>
            <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <div className="">
                        <label
                            className="bg-white/10 rounded-full w-fit p-2 block"
                            htmlFor="file_upload"
                        >
                            {" "}
                            <FaPlus className="text-sm opacity-75" />
                        </label>
                        <input
                            type="file"
                            name=""
                            id="file_upload"
                            multiple
                            onChange={handleFilePicked}
                            hidden
                        />
                    </div>
                    <VscMention className="text-2xl opacity-75" />
                    <PiVideoCamera className="text-xl opacity-75" />
                    <TiMicrophoneOutline className="text-xl opacity-75" />
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
