import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Button from "@/Components/Button";
import TextInput from "@/Components/Input/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import google from "@/../images/google.png";

import { GrGroup } from "react-icons/gr";
import { FaFacebook } from "react-icons/fa";
import SnackLogo from "@/Components/SnackLogo";
import Layout from "./Layout";
export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <Layout>
            <Head title="Log in" />
            {flash.message && <div class="alert">{flash.message}</div>}
            {status && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {status}
                </div>
            )}
            <a
                href="/auth/google/redirect"
                type="button"
                className="border-2 border-color/15 p-3 rounded-full  w-full flex justify-center font-bold gap-x-4 text-color-medium-emphasis"
            >
                <img src={google} className="w-6 h-6" /> Sign in with Google
            </a>
            <a
                href="/auth/facebook/redirect"
                type="button"
                className="mt-4 border-2 border-color/15 p-3 rounded-full  w-full flex justify-center font-bold gap-x-4 text-color-medium-emphasis"
            >
                <FaFacebook className="text-blue-600 text-2xl" /> Sign in with
                Facebook
            </a>
            <div className="flex  items-center gap-x-4 mt-4 text-color-medium-emphasis">
                <hr className="w-full " />
                OR
                <hr className="w-full " />
            </div>
            <form onSubmit={submit} className="mt-4">
                <div>
                    <TextInput
                        placeholder="example@gmail.com"
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full "
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <TextInput
                        placeholder="Password"
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full "
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                submit(e);
                            }
                        }}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block mt-4">
                    <label className="flex items-center text-color-medium-emphasis">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm ">Remember me</span>
                    </label>
                </div>
                <Button
                    className="mt-4"
                    loading={processing}
                    type="submit"
                    onClick={submit}
                >
                    Log in
                </Button>
                <div className="flex  justify-between mt-8">
                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="underline text-sm text-link   rounded-md  "
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <Link
                        href={route("register")}
                        className="underline text-sm text-link   rounded-md  "
                    >
                        Create an account
                    </Link>
                </div>
            </form>
        </Layout>
    );
}
