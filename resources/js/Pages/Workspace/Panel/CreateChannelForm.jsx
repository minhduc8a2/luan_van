import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";

import Form1 from "@/Components/Form1";
import TextArea from "@/Components/Input/TextArea";
import SelectInput from "@/Components/Input/SelectInput";
import { useSelector } from "react-redux";
import { useCustomedForm } from "@/helpers/customHooks";

export function CreateChannelForm({ activateButtonNode, callback = () => {} }) {
    const { workspacePermissions, workspace } = useSelector(
        (state) => state.workspace
    );
    const channelTypes = [
        { type: "PUBLIC", label: "Public - Anyone in " + workspace.name },
        {
            type: "PRIVATE",
            label: "Private — only specific people \n Can only be viewed or joined by invitation",
        },
    ];
    const [refresh, setRefresh] = useState(0);
    const {
        getValues,
        setValues,
        errors,
        reset,
        submit,
        loading: processing,
    } = useCustomedForm(
        { name: "", type: "PUBLIC" },
        { url: route("channel.store", workspace.id) }
    );
    const [success, setSuccess] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        submit().then(() => {
            setSuccess(true);
            reset();
            callback();
        });
    }
    return (
        <Form1
            disabled={!workspacePermissions?.createChannel}
            className="p-4"
            errors={errors}
            success={success}
            submit={onSubmit}
            submitting={processing}
            buttonName="Create"
            activateButtonNode={
                <div
                    onClick={() => {
                        reset();
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
                    value={getValues().name}
                    onChange={(e) => {
                        setValues("name", e.target.value);
                        setRefresh((pre) => pre + 1);
                    }}
                    disabled={!workspacePermissions?.createChannel}
                />
                <SelectInput
                    label="Channel type"
                    list={channelTypes}
                    onChange={(item) => {
                        setValues("type", item.type);
                        setRefresh((pre) => pre + 1);
                    }}
                    disabled={!workspacePermissions?.createChannel}
                />
            </div>
        </Form1>
    );
}
