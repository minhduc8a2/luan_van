import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Button from "@/Components/Button";
import TextInput from "@/Components/Input/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { GrGroup } from "react-icons/gr";
import Layout from "./Layout";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <Layout>
            <form
                onSubmit={submit}
                className="w-full sm:max-w-md mt-6 px-6 py-4   overflow-hidden sm:rounded-lg"
            >
                <div>
                    <TextInput
                        id="name"
                        name="name"
                        placeHolder="Name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <TextInput
                        id="email"
                        placeHolder="example@gmail.com"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData("email", e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <TextInput
                        id="password"
                        placeHolder="Password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <TextInput
                        placeHolder="Confirm password"
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <Button className="mt-8" disabled={processing} onClick={submit}>
                    Register
                </Button>
                <Link
                    href={route("login")}
                    className="mt-8 block underline text-sm text-link   rounded-md  "
                >
                    Already registered?
                </Link>
            </form>
        </Layout>
    );
}
