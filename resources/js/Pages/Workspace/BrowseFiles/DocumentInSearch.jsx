import React, { memo } from "react";

import { getDocumentType } from "@/helpers/fileHelpers";
import { useDispatch } from "react-redux";
import { setMedia } from "@/Store/mediaSlice";

const DocumentInSearch = memo(function ({ file, Icon, className = "" }) {
    const dispatch = useDispatch();

    return (
        <div className={className} key={"attachment_" + file.id}>
            <button
                onClick={() =>
                    dispatch(
                        setMedia({
                            type: "document",
                            url: file.url,
                            name: file.name,
                        })
                    )
                }
                className="flex items-center gap-x-4 w-full p-2 "
            >
                <div className="flex-1 items-center flex gap-x-4 min-w-0 max-w-full overflow-hidden">
                    <div className="text-link">{Icon}</div>
                    <div className="text-left flex-1 min-w-0 max-w-full truncate overflow-hidden">
                        {file.name}
                    </div>
                </div>
                <div className="text-xs text-color-medium-emphasis">
                    {getDocumentType(file.type)}
                </div>
            </button>
        </div>
    );
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.file.id === newProps.file.id;
}
export default DocumentInSearch;
