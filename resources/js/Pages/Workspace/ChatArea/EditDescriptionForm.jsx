import { useForm } from "@inertiajs/react";

import TextArea from "@/Components/Input/TextArea";
import { FaLink } from "react-icons/fa6";
import Form1 from "@/Components/Form1";
import { router, usePage } from "@inertiajs/react";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { useState, useEffect } from "react";
export function EditDescriptionForm() {
    const { flash, channel } = usePage().props;
    const [showError, setShowError] = useState(true);
    const { data, setData, post, processing } = useForm({
        description: channel.description,
    });
    function onSubmit(e) {
        e.preventDefault();
        post(route("channel.edit_description", channel.id), {
            preserveState: true,
            onSuccess: () => {
                router.get(
                    route("channel.show", channel.id),
                    {},
                    {
                        preserveState: true,
                        preserveScroll: true,
                        only: ["channel"],
                    }
                );
            },
        });
    }
    useEffect(() => {
        setData("description", channel.description);
    }, [channel.id]);
    return (
        <div>
            {flash.data?.statusCode == 500 && (
                <OverlayNotification
                    title="Edit Description"
                    show={showError}
                    close={() => setShowError(false)}
                >
                    <div className="">
                        😵‍💫Some thing wrong with server! Try later!
                    </div>
                </OverlayNotification>
            )}
            <Form1
                success={flash.data?.statusCode != null}
                submit={onSubmit}
                buttonName="Update"
                submitting={processing}
                activateButtonNode={
                    <div
                        className=" text-link"
                        onClick={() => {
                            flash.data = null;
                            setShowError(true);
                        }}
                    >
                        Edit description
                    </div>
                }
                title={`Edit Description`}
            >
                {" "}
                <TextArea
                    rows="2"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                />
            </Form1>
        </div>
    );
}
