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
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-background ">
            <div className="flex items-baseline gap-x-2 mb-8">
                <GrGroup className=" text-xl" />{" "}
                <Link href="/" className=" font-bold text-3xl">
                    Snack
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4   overflow-hidden sm:rounded-lg">
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
                    className="border-2 border-color/15 p-3 rounded-full  w-full flex justify-center font-bold gap-x-4"
                >
                    <img src={google} className="w-6 h-6" /> Sign in with Google
                </a>
                <a
                    href="/auth/facebook/redirect"
                    type="button"
                    className="mt-4 border-2 border-color/15 p-3 rounded-full  w-full flex justify-center font-bold gap-x-4"
                >
                    <FaFacebook className="text-blue-600 text-2xl" /> Sign in
                    with Facebook
                </a>
                <div className="flex  items-center gap-x-4 mt-4">
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
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    submit(e);
                                }
                            }}
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="block mt-4">
                        <label className="flex items-center">
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
                    <Button className="mt-4" loading={processing} type="submit">
                        Log in
                    </Button>
                    <div className=" mt-4">
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="underline text-sm   rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
