import { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";

import Form1 from "@/Components/Form1";
import TextArea from "@/Components/Input/TextArea";
import SelectInput from "@/Components/Input/SelectInput";
import { LuPlus } from "react-icons/lu";
export function CreateChannelForm() {
    const { workspace } = usePage().props;
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
        });
    }
    return (
        <Form1
            className="p-4"
            errors={errors}
            success={success}
            submit={submit}
            submitting={processing}
            buttonName="Create"
            activateButtonNode={
                <div
                    className="grid-item mt-2 px-4"
                    onClick={() => {
                        clearErrors();
                        setSuccess(false);
                    }}
                >
                    <div className="flex items-center ">
                        <LuPlus className="text-sm" />
                    </div>
                    <div className="">Add channels</div>
                </div>
            }
            title="Add channel"
        >
            <TextArea
                error={errors.name}
                placeholder=""
                label="Channel name:"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
            />
            <SelectInput
                label="Channel type"
                list={channelTypes}
                onChange={(item) => setData("type", item.type)}
            />
        </Form1>
    );
}
