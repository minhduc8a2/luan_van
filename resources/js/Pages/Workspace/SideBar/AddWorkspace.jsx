import { IoIosAdd } from "react-icons/io";
import Form1 from "@/Components/Form1";
import TextArea from "@/Components/Input/TextArea";
import { useCustomedForm } from "@/helpers/customHooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export function AddWorkspace() {
    const {
        submit,
        loading: processing,
        getValues,
        setValues,
    } = useCustomedForm(
        { name: "", channel: "" },
        {
            method: "post",
            url: route("workspaces.store"),
        }
    );
    const navigate = useNavigate();
    const [refresh, setRefresh] = useState(0);
    function onSubmit(e) {
        e.preventDefault();
        submit().then((response) => {
            
            if (response.status==200) {
                navigate(`/workspaces/${response.data.workspaceId}/channels/${response.data.main_channel_id}`);
            }
        });
    }
    return (
        <Form1
            submit={onSubmit}
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
                value={getValues().name}
                onChange={(e) => {
                    setValues("name", e.target.value);
                    setRefresh((pre) => pre + 1);
                }}
            />
            <TextArea
                required
                placeholder=""
                label="What project are you working on?"
                value={getValues().channel}
                onChange={(e) => {
                    setValues("channel", e.target.value);
                    setRefresh((pre) => pre + 1);
                }}
            />
        </Form1>
    );
}
