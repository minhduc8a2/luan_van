import React from "react";
import OverlayPanel from "@/Components/Overlay/OverlayPanel";
import Button from "@/Components/Button";
export default function Form1({
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
        <OverlayPanel
            buttonNode={activateButtonNode}
            submit={submit}
            success={success}
        >
            <form action="" onSubmit={submit}>
                <div className="w-[500px] max-w-screen-sm m-4 ">
                    <h2 className="text-2xl my-4 font-bold text-white/85">
                        {title}
                    </h2>
                    <div className="mt-8">
                        {children}
                        <div
                            className={`mt-4 flex  ${
                                sameButtonRow
                                    ? "justify-between"
                                    : "justify-end"
                            }`}
                        >
                            {sameButtonRow}
                            <Button
                                className="text-white/65"
                                loading={submitting}
                            >
                                {buttonName}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </OverlayPanel>
    );
}
