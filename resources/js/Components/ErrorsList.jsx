import React from "react";

export default function ErrorsList({ errors }) {
    if (errors)
        return (
            <>
                {errors &&
                    Object.values(errors).map((error, index) => (
                        <div className="my-3 text-red-500 text-sm" key={index}>
                            {error}
                        </div>
                    ))}
            </>
        );
    else return "";
}
