import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";

export const MentionList = forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index) => {
        const item = props.items[index];

        if (item) {
            props.command({ id: item.id, label: item.name });
        }
    };

    const upHandler = () => {
        setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length
        );
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === "ArrowUp") {
                upHandler();
                return true;
            }

            if (event.key === "ArrowDown") {
                downHandler();
                return true;
            }

            if (event.key === "Enter") {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <div className="tiptap-dropdown-menu">
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        className={index === selectedIndex ? "is-selected" : ""}
                        key={item.id}
                        onClick={() => selectItem(index)}
                    >
                        {item.name}
                    </button>
                ))
            ) : (
                <div className="item px-4">No result</div>
            )}
        </div>
    );
});
