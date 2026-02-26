export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyles = "px-6 py-3 rounded-lg font-medium transition-colors";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: "border border-gray-300 text-gray-900 hover:bg-gray-100",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
