export function DesktopIcon({
                                icon,
                                label,
                                onClick,
                                notifCount = 0,
                            }: {
    icon: string;
    label: string;
    onClick: () => void;
    notifCount?: number;
}) {
    return (
        <div
            onClick={onClick}
            className="relative w-24 h-24 hover:bg-gray-600 hover:text-white text-black rounded-md cursor-pointer flex flex-col items-center justify-center select-none transition-colors"
        >
            {notifCount > 0 && (
                <span
                    className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border border-black">
          {notifCount}
        </span>
            )}
            <img src={icon} className="w-10 h-10 object-contain" alt=""/>
            <span className="mt-1 text-sm">{label}</span>
        </div>
    );
}