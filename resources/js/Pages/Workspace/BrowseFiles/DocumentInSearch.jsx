import React, { memo, useState } from "react";
import { IoMdCloudDownload } from "react-icons/io";
import { getDocumentType } from "@/helpers/fileHelpers";
import { useSelector } from "react-redux";
import CustomedDialog from "@/Components/CustomedDialog";
import LoadingSpinner from "@/Components/LoadingSpinner";
const DocumentInSearch = memo(function ({ file, Icon, className = "" }) {
    const { publicAppUrl } = useSelector((state) => state.workspace);
    const [openOverlay, setOpenOverlay] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <div className={className} key={"attachment_" + file.id}>
            <button
                onClick={() => setOpenOverlay(true)}
                className="flex items-center gap-x-4 w-full  "
            >
                <div className="flex-1 items-center flex gap-x-4 min-w-0 max-w-full overflow-hidden">
                    <div className="text-link">{Icon}</div>
                    <div className="text-left flex-1 min-w-0 max-w-full truncate overflow-hidden">
                        {file.name}
                    </div>
                </div>
                <div className="text-xs text-white/75">
                    {getDocumentType(file.type)}
                </div>
            </button>

            <CustomedDialog
                isOpen={openOverlay}
                onClose={() => setOpenOverlay(false)}
                className="flex justify-center flex-col items-center max-h-[95vh] mt-4 w-fit p-0"
            >
                <a
                    href={file.url}
                    download={true}
                    className="absolute top-4 right-4"
                >
                    <IoMdCloudDownload className="text-3xl" />
                </a>
                {loading && <LoadingSpinner />}

                <iframe
                    className={`${loading ? "invisible" : ""}`}
                    width={
                        window.innerWidth > 900
                            ? window.innerWidth / 2
                            : window.innerWidth - 200
                    }
                    onLoad={() => setLoading(false)}
                    height={window.innerHeight - 100}
                    src={`https://docs.google.com/gview?url=${
                        publicAppUrl + file.url
                    }&embedded=true `}
                ></iframe>
            </CustomedDialog>
        </div>
    );
}, arePropsEqual);
function arePropsEqual(oldProps, newProps) {
    return oldProps.file.id === newProps.file.id;
}
export default DocumentInSearch;
