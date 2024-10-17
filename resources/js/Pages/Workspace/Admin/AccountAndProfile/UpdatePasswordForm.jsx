import { useRef } from "react";

import InputLabel from "@/Components/InputLabel";
import Button from "@/Components/Button";
import TextInput from "@/Components/Input/TextInput";

import { Transition } from "@headlessui/react";
import ExpandableItem from "../ExpandableItem";
import { useCustomedForm } from "@/helpers/customHooks";

export default function UpdatePasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { getValues, setValues, submit, loading, success } = useCustomedForm(
        {
            current_password: "",
            password: "",
            password_confirmation: "",
        },
        { url: route("password.update"), method: "put" }
    );

    const updatePassword = (e) => {
        e.preventDefault();
        submit();
    };

    return (
        <ExpandableItem
            header={
                <header>
                    <h2 className="text-lg font-medium text-color-high-emphasis">
                        Update Password
                    </h2>

                    <p className="mt-1 text-sm text-color-medium-emphasis">
                        Ensure your account is using a long, random password to
                        stay secure.
                    </p>
                </header>
            }
        >
            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={getValues().current_password}
                        onChange={(e) =>
                            setValues("current_password", e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={getValues().password}
                        onChange={(e) => setValues("password", e.target.value)}
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        value={getValues().password_confirmation}
                        onChange={(e) =>
                            setValues("password_confirmation", e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Button loading={loading} onClick={updatePassword}>
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
