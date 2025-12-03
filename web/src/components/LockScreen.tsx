import {useState} from "react";
import {toast} from "react-toastify";
import {clearProgress} from "../utils/progress.ts";

export function LockScreen({onUnlock, savedUsername}: {
    onUnlock: (username: string) => void,
    savedUsername: string | null
}) {
    const [username, setUsername] = useState(savedUsername ?? "");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [dots, setDots] = useState("");
    const [showDecision, setShowDecision] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoggingIn(true);

        let dotCount = 0;
        const dotInterval = setInterval(() => {
            dotCount++;
            setDots("•".repeat(dotCount));

            if (dotCount >= 8) {
                clearInterval(dotInterval);
                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => onUnlock(username), 800);
                }, 300);
            }
        }, 150);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Fade to black overlay */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-700 ${
                    fadeOut ? "opacity-100" : "opacity-0"
                } pointer-events-none`}
            />

            <div className="relative h-full flex flex-col items-center justify-center">
                {/* User Avatar Circle */}
                <div className="mb-8">
                    <div
                        className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ea7603] to-[#c95f02] flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                        {username ? username[0].toUpperCase() : "?"}
                    </div>
                </div>

                {/* Login Form */}
                {!isLoggingIn ? (
                    <form onSubmit={handleLogin} className="w-80 space-y-4">
                        <div className="text-center mb-6">
                            <h2 className="text-white text-2xl font-light mb-2">
                                {username || "Guest User"}
                            </h2>
                        </div>

                        <input
                            type="text"
                            value={username}
                            disabled={savedUsername !== null}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className={`w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-black placeholder-gray-300 rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-[#ea7603] focus:border-transparent ${savedUsername !== null && "opacity-50 cursor-not-allowed"}`}

                            autoFocus
                        />

                        <button
                            type="submit"
                            disabled={!username.trim()}
                            className="w-full px-4 py-3 bg-[#ea7603] hover:bg-[#ff8805] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 font-medium"
                        >
                            Log In
                        </button>

                        {
                            !showDecision ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        toast.warning("Switching users will erase all progress made so far. And create a new session for a new user. Are you sure you want to continue?", {delay: 10000});
                                        setShowDecision(true);
                                    }}
                                    disabled={!username.trim()}
                                    className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 font-medium"
                                >
                                    Switch User
                                </button>
                            ) : (
                                <div className={"flex flex-row gap-4"}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            clearProgress();
                                            window.location.reload();
                                        }}
                                        disabled={!username.trim()}
                                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 font-medium"
                                    >
                                        Yes, switch user
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDecision(false);
                                        }}
                                        disabled={!username.trim()}
                                        className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 font-medium"
                                    >
                                        No, i'm scared.
                                    </button>
                                </div>
                            )
                        }
                    </form>
                ) : (
                    <div className="w-80 space-y-4">
                        <div className="text-center mb-6">
                            <h2 className="text-white text-2xl font-light mb-2">
                                {username}
                            </h2>
                        </div>

                        {/* Password dots animation */}
                        <div
                            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg border border-white border-opacity-20 min-h-[48px] flex items-center">
                            <span className="text-black text-2xl tracking-wider">{dots}</span>
                        </div>

                        <div className="text-center text-gray-300 text-sm animate-pulse">
                            Logging in...
                        </div>
                    </div>
                )}

                {/* Bottom text */}
                <div className="absolute bottom-8 text-center text-white text-opacity-60 text-sm">
                    Signing into fm.tul.cz network
                </div>
            </div>
        </div>
    );

}
