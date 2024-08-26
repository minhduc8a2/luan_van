import React from "react";
import FormFrameWork from "./FormFrameWork";
import Button from "./Button";
export default function Form1({
    success=false,
    children,
    buttonName,
    activateButtonNode,
    title,
    sameButtonRow,
    submit,
}) {
    return (
        <FormFrameWork buttonNode={activateButtonNode} submit={submit} success={success}>
            <div className="w-[500px] max-w-screen-sm m-4 ">
                <h2 className="text-2xl my-4 font-bold text-white/85">
                    {title}
                </h2>
                <div className="mt-8">
                    {children}
                    <div
                        className={`mt-4 flex  ${
                            sameButtonRow ? "justify-between" : "justify-end"
                        }`}
                    >
                        {sameButtonRow}
                        <Button className="text-white/65">{buttonName}</Button>
                    </div>
                </div>
            </div>
        </FormFrameWork>
    );
}
