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
    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        type: "PUBLIC",
    });
    const [success, setSuccess] = useState(false);
    function submit(e) {
        e.preventDefault();
        console.log("submit");
        post(route("channel.store", workspace.id), {
            preserveState: false,
            onSuccess: () => {
                setSuccess(true);
                reset();
            },
        });
    }
    return (
        <Form1
            success={success}
            submit={submit}
            submitting={processing}
            buttonName="Create"
            activateButtonNode={
                <div className="grid-item mt-2 px-4">
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
            {errors.server && (
                <div className="text-red-500 text-sm my-2">{errors.server}</div>
            )}
        </Form1>
    );
}
