import InputLabel from "@/Components/InputLabel";
import Button from "@/Components/Button";
import TextInput from "@/Components/Input/TextInput";
import { router, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import ExpandableItem from "../ExpandableItem";
import { useCustomedForm } from "@/helpers/customHooks";
import { useState } from "react";

export default function UpdateEmailForm() {
    const user = usePage().props.auth.user;
    const [mustVerifyEmail, setMustVerifyEmail] = useState(null);
    const [status, setStatus] = useState(null);
    const { getValues, setValues, submit, loading, success } = useCustomedForm(
        { name: user.name, email: user.email },
        { url: route("profile.update"), method: "patch" }
    );

    const onSubmit = (e) => {
        e.preventDefault();
        submit().then((response) => {
            if (response.data) {
                setMustVerifyEmail(response.data.mustVerifyEmail);
                submit().then(()=>{
                    router.reload({only:['auth'], preserveState:true})
                });
            } else setMustVerifyEmail(null);
        });
    };

    const reSendEmailVerification = () => {
        axios.post(route("verification.send"), {}).then((response) => {
            if (response.data) {
                setStatus(response.data.status);
            } else {
                setStatus(null);
            }
        });
    };
    return (
        <ExpandableItem
            header={
                <header>
                    <h3 className="text-lg font-medium text-color-high-emphasis">
                        Email Address
                    </h3>

                    <p className="mt-1 text-sm text-color-medium-emphasis">
                        Update your account's email address.
                    </p>
                </header>
            }
        >
            <form onSubmit={onSubmit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={getValues().email}
                        onChange={(e) => setValues("email", e.target.value)}
                        required
                        autoComplete="username"
                    />
                </div>
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-color-high-emphasis">
                            Your email address is unverified.
                            <button
                                onClick={reSendEmailVerification}
                                className="underline text-sm text-color-medium-emphasis hover:text-color-high-emphasis rounded-md "
                            >
                                Click here to re-send the verification email.
                            </button>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}
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
                        <p className="text-sm text-color-medium-emphasis">Saved.</p>
                    </Transition>
                </div>
            </form>
        </ExpandableItem>
    );
}
