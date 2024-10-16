import InputLabel from "@/Components/InputLabel";
import Button from "@/Components/Button";
import TextInput from "@/Components/Input/TextInput";
import { router, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import ExpandableItem from "../ExpandableItem";
import { useCustomedForm } from "@/helpers/customHooks";

export default function UpdateProfileForm() {
    const user = usePage().props.auth.user;

    const { getValues, setValues, submit, loading, success } = useCustomedForm(
        {
            name: user.name,
            display_name: user.display_name,
            phone: user.phone,
            email: user.email,
        },
        { url: route("profile.update"), method: "patch" }
    );

    const onSubmit = (e) => {
        e.preventDefault();
        submit().then(() => {
            router.reload({ only: ["auth"], preserveState: true });
        });
    };

    return (
        <ExpandableItem
            header={
                <header>
                    <h3 className="text-lg font-medium text-gray-900">
                        Profile Information
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                        Update your account's information.
                    </p>
                </header>
            }
        >
            <form onSubmit={onSubmit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={getValues().name}
                        onChange={(e) => setValues("name", e.target.value)}
                        required
                        autoComplete="name"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="display_name" value="Display name" />

                    <TextInput
                        id="display_name"
                        type="text"
                        className="mt-1 block w-full"
                        value={getValues().display_name}
                        onChange={(e) =>
                            setValues("display_name", e.target.value)
                        }
                        autoComplete="name"
                    />
                </div>
                <div>
                    <InputLabel htmlFor="phone" value="Phone" />
                       
                    <TextInput
                        id="phone"
                        type="tel"
                        max={20}
                        className="mt-1 block w-full"
                        value={getValues().phone}
                        onChange={(e) => setValues("phone", e.target.value)}
                        autoComplete="phone"
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
