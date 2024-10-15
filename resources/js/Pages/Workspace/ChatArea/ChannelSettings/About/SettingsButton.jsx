export function SettingsButton({
    onClick=()=>{},
    title,
    description,
    hasEdit = true,
    className = "",
    disabled = false,
}) {
    return (
        <div
            className={
                `${
                    disabled ? "cursor-default hover:bg-transparent" : ""
                } flex hover:bg-color/10 transition-all justify-between items-start p-4   ` +
                className
            }
            onClick={() => {
                if (disabled) return;
                onClick();
            }}
        >
            <div className="">
                <div className="font-bold text-sm ">{title}</div>
                <div className="mt-1">{description}</div>
            </div>
            <div className="text-sm text-link hover:underline">
                {hasEdit && !disabled ? "Edit" : ""}
            </div>
        </div>
    );
}
