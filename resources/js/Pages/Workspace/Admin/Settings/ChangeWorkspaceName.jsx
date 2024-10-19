import React from "react";
import ExpandableItem from "../ExpandableItem";
import { useDispatch, useSelector } from "react-redux";
import { useCustomedForm } from "@/helpers/customHooks";
import { updateCurrentWorkspace } from "@/Store/workspaceSlice";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/Input/TextInput";
import Button from "@/Components/Button";
import { Transition } from "@headlessui/react";

export default function ChangeWorkspaceName() {
    const { workspace } = useSelector((state) => state.workspace);
    const { submit, loading, success, getValues, setValues } = useCustomedForm(
        { name: workspace.name },
        {
            url: route("workspaces.update", workspace.id),
            method: "patch",
        }
    );
    const dispatch = useDispatch();
    function onSubmit(e) {
        e.preventDefault();
        const oldName = workspace.name;
        dispatch(updateCurrentWorkspace({ name: getValues().name }));
        submit().catch(() => {
            dispatch(updateCurrentWorkspace({ name: oldName }));
        });
    }
    return (
        <ExpandableItem
            header={
                <header>
                    <h3 className="text-lg font-medium text-color-high-emphasis">
                        Workspace Name
                    </h3>

                    <p className="mt-1 text-sm text-color-medium-emphasis">
                        Your workspace name is{" "}
                        <span className="font-bold text-base text-color-high-emphasis capitalize">
                            {workspace.name}
                        </span>
                    </p>
                </header>
            }
        >
            <form onSubmit={onSubmit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Workspace name" />

                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full "
                        value={getValues().name}
                        onChange={(e) => setValues("name", e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Button loading={loading} onClick={onSubmit}>
                        Save
                    </Button>

                    <Transition
                        show={success}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </ExpandableItem>
    );
}
