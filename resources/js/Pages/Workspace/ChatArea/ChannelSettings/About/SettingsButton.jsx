export function SettingsButton({
    onClick,
    title,
    description,
    hasEdit = true,
    className = "",
}) {
    return (
        <div
            className={
                "flex hover:bg-white/10 transition-all justify-between items-start p-4 border border-white/15  " +
                className
            }
            onClick={onClick}
        >
            <div className="">
                <div className="font-bold text-sm ">{title}</div>
                <div className="">{description}</div>
            </div>
            <div className="text-sm text-link hover:underline">{hasEdit ? "Edit" : ""}</div>
        </div>
    );
}
