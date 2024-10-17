import Button from "@/Components/Button";
import React, { useState } from "react";
import ExpandableItem from "../ExpandableItem";
import { IoIosWarning } from "react-icons/io";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/Input/TextInput";
import { useCustomedForm } from "@/helpers/customHooks";
import { useSelector } from "react-redux";

export default function DeleteWorkspace() {
    const [isOpen, setIsOpen] = useState(false);
    const { workspace } = useSelector((state) => state.workspace);
    const { getValues, setValues, submit, loading } = useCustomedForm(
        {
            current_password: "",
        },
        { url: route("workspaces.delete", workspace.id), method: "delete" }
    );
    const [isConfirmed, setIsConfirmed] = useState(false);
    function onSubmit(e) {
        e.preventDefault();
        if (!isConfirmed) return;
        submit();
    }
    return (
        <ExpandableItem
            header={
                <header className="w-1/2">
                    <h3 className="text-lg font-medium text-color-high-emphasis">
                        Delete Workspace
                    </h3>

                    <p className="mt-1 text-sm text-color-medium-emphasis">
                        Deleting a Slack workspace cannot be undone. All
                        messages and files will be irretrievable. Please use
                        caution and consider exporting your data before
                        deletion.
                    </p>
                </header>
            }
        >
            {!isOpen && (
                <Button
                    type="danger"
                    className="h-fit w-fit mt-4"
                    onClick={() => setIsOpen(true)}
                >
                    Delete Workspace
                </Button>
            )}
            {isOpen && (
                <div className="mt-8">
                    <div className="text-3xl flex gap-x-4 font-bold text-color-high-emphasis">
                        {" "}
                        <IoIosWarning className="text-red-500 " />
                        You are deleting Main
                    </div>
                    <div className="border-l-4 pl-4 border-l-red-500 text-color-high-emphasis mt-4">
                        <h3 className="text-xl font-bold">Confirm Deletion</h3>
                        <form className="mt-4" onSubmit={onSubmit}>
                            <div className="">
                                <input
                                    type="checkbox"
                                    name="confirm"
                                    id="confirm"
                                    onChange={(e) =>
                                        setIsConfirmed(e.target.checked)
                                    }
                                />
                                <label
                                    className="ml-2 text-color-high-emphasis"
                                    htmlFor="confirm"
                                >
                                    I understand that all of my workspace’s
                                    messages and files will be deleted.
                                </label>
                            </div>
                            <div className="mt-4">
                                <InputLabel
                                    htmlFor="current_password"
                                    value="Current Password"
                                />

                                <TextInput
                                    id="current_password"
                                    value={getValues().current_password}
                                    onChange={(e) =>
                                        setValues(
                                            "current_password",
                                            e.target.value
                                        )
                                    }
                                    type="password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                            <Button
                                type="danger"
                                className="h-fit w-fit mt-4"
                                onClick={onSubmit}
                                loading={loading}
                            >
                                Delete Workspace
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </ExpandableItem>
    );
}
