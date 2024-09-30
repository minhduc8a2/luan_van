import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";

import Form1 from "@/Components/Form1";
import TextArea from "@/Components/Input/TextArea";
import SelectInput from "@/Components/Input/SelectInput";
import { useSelector } from "react-redux";

export function CreateChannelForm({ activateButtonNode, callback = () => {} }) {
    const { workspace } = usePage().props;
    const { workspacePermissions } = useSelector((state) => state.workspace);
    const channelTypes = [
        { type: "PUBLIC", label: "Public - Anyone in " + workspace.name },
        {
            type: "PRIVATE",
            label: "Private — only specific people \n Can only be viewed or joined by invitation",
        },
    ];
    const { data, setData, post, processing, reset, errors, clearErrors } =
        useForm({
            name: "",
            type: "PUBLIC",
        });
    const [success, setSuccess] = useState(false);
    function submit(e) {
        e.preventDefault();
        post(route("channel.store", workspace.id), {
            preserveState: true,
            only: ["channels"],
            onSuccess: () => {
                setSuccess(true);
                reset();
            },
            headers: {
                "X-Socket-Id": Echo.socketId(),
            },
            onFinish: () => {
                callback();
            },
        });
    }
    return (
        <Form1
            disabled={!workspacePermissions?.createChannel}
            className="p-4"
            errors={errors}
            success={success}
            submit={submit}
            submitting={processing}
            buttonName="Create"
            activateButtonNode={
                <div
                    onClick={() => {
                        clearErrors();
                        setSuccess(false);
                    }}
                >
                    {activateButtonNode}
                </div>
            }
            title="Add channel"
        >
            {!workspacePermissions?.createChannel && (
                <h3 className="text-lg">
                    ⚠️You are not allowed to create channels, contact admins for
                    more information.
                </h3>
            )}
            <div
                className={`mt-4 ${
                    !workspacePermissions?.createChannel ? "opacity-50" : ""
                }`}
            >
                <TextArea
                    placeholder=""
                    label="Channel name:"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    disabled={!workspacePermissions?.createChannel}
                />
                <SelectInput
                    label="Channel type"
                    list={channelTypes}
                    onChange={(item) => setData("type", item.type)}
                    disabled={!workspacePermissions?.createChannel}
                />
            </div>
        </Form1>
    );
}
