export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label {...props} className={`block font-medium text-sm text-color-medium-emphasis ` + className}>
            {value ? value : children}
        </label>
    );
}
