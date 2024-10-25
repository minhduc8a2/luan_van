import InputError from "@/Components/InputError";
import Button from "@/Components/Button";
import TextInput from "@/Components/Input/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

import SnackLogo from "@/Components/SnackLogo";
import Layout from "./Layout";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    return (
        <Layout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData("email", e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="flex items-center justify-end mt-8">
                    <Button
                        className="ms-4"
                        loading={processing}
                        onClick={submit}
                    >
                        Email Password Reset Link
                    </Button>
                </div>
            </form>
        </Layout>
    );
}
