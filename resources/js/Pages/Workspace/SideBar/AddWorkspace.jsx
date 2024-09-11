import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { IoIosAdd } from "react-icons/io";
import Form1 from "@/Components/Form1";
import TextArea from "@/Components/Input/TextArea";
export function AddWorkspace() {
    const { data, setData, post, processing } = useForm({
        name: "",
        channel: "",
    });
    function submit(e) {
        e.preventDefault();
        if (data.name == "" || data.channel == "") return;
        post(route("workspace.store"), {
            preserveState: false,
        });
    }
    return (
        <Form1
            submit={submit}
            submitting={processing}
            buttonName="Create"
            className="p-4"
            activateButtonNode={
                <div className="flex gap-x-2 items-center p-4 hover:bg-white/10 w-full">
                    <IoIosAdd className="text-xl" />
                    Add workspace
                </div>
            }
            title="Add Workspace"
        >
            <TextArea
                required
                placeholder=""
                label="Workspace name:"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
            />
            <TextArea
                required
                placeholder=""
                label="What project are you working on?"
                value={data.channel}
                onChange={(e) => setData("channel", e.target.value)}
            />
        </Form1>
    );
}
