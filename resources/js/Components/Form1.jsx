import React from "react";
import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import Button from "@/Components/Button";
export default function Form1({
    errors={},
    success = false,
    children,
    buttonName,
    activateButtonNode,
    title,
    sameButtonRow,
    submit,
    submitting = false,
}) {
    return (
        <OverlayPanel buttonNode={activateButtonNode} success={success}>
            {({ close }) => (
                <form action="" onSubmit={submit}>
                    <div className="w-[500px] max-w-screen-sm m-4 ">
                        <h2 className="text-2xl my-4 font-bold text-white/85">
                            {title}
                        </h2>
                        <div className="mt-8">
                            {children}
                            {errors &&
                                Object.values(errors).map((error, index) => (
                                    <div
                                        className="my-4 text-red-500 text-sm"
                                        key={index}
                                    >
                                        {error}
                                    </div>
                                ))}
                            <div
                                className={`mt-4 flex  ${
                                    sameButtonRow
                                        ? "justify-between"
                                        : "justify-end"
                                }`}
                            >
                                {sameButtonRow}
                                <div className="flex gap-x-4">
                                    <Button
                                        className="text-white/65"
                                        onClick={(e) => {
                                            console.log("close form");
                                            e.preventDefault();
                                            close();
                                        }}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        className="text-white/65"
                                        loading={submitting}
                                        onClick={submit}
                                    >
                                        {buttonName}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </OverlayPanel>
    );
}
