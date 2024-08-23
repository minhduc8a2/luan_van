import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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

const extensions = [
    StarterKit,
    Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
    }),
];

const content = `
 
  `;
const editorProps = {
    attributes: {
        class: "prose prose-sm sm:prose-base text-white/85 lg:prose-base xl:prose-base m-5 focus:outline-none m-2",
    },
};
import data from "@emoji-mart/data";
import EmojiPicker from "@emoji-mart/react";
import { CiFaceSmile } from "react-icons/ci";
export default function TipTapEditor() {
    const editor = useEditor({
        extensions,
        content,
        editorProps,
        onUpdate({ editor }) {
            console.log(editor.getJSON());
        },
    });

    return (
        <div className="">
            <MenuBar editor={editor} />
            <div className="max-h-96 overflow-y-auto ">
                <EditorContent editor={editor} />
            </div>
            <div className="py-2 flex items-center gap-x-4">
                <div className="bg-white/10 rounded-full w-fit p-2">
                    {" "}
                    <FaPlus className="text-sm opacity-75" />
                </div>
                <VscMention className="text-2xl opacity-75"/>
                <PiVideoCamera className="text-xl opacity-75"/>
                <TiMicrophoneOutline className="text-xl opacity-75"/>
            </div>
        </div>
    );
}
