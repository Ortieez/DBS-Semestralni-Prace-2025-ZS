import {useState, useEffect, useRef} from "react";
import Typewriter from "typewriter-effect";
import type {State} from "../utils/state";

interface CutsceneProps {
    cutsceneId: string;
    gameState: State;
    audioUrl?: string;
    onComplete?: () => void;
    onSkip?: () => void;
}

export const Cutscene = ({cutsceneId, gameState, audioUrl, onComplete, onSkip}: CutsceneProps) => {
    const [isFinished, setIsFinished] = useState(false);
    const [hasSkipped, setHasSkipped] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const cutscene = gameState.cutscenes[cutsceneId as keyof typeof gameState.cutscenes];

    if (!cutscene) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-black text-white">
                <p>Cutscene not found: {cutsceneId}</p>
            </div>
        );
    }

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        if (audioRef.current && audioUrl) {
            audioRef.current.play().catch(() => {
                // Audio playback failed (may be blocked by browser autoplay policy)
            });
        }
    }, [audioUrl]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (!isFinished) {
                    setHasSkipped(true);
                    setIsFinished(true);
                    if (onSkip) onSkip();
                } else {
                    setIsFinished(true);
                    if (onComplete) onComplete();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isFinished, onSkip, onComplete]);

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsFinished(true);
            if (onComplete) onComplete();
        }, 300);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none">
            {audioUrl && (
                <audio ref={audioRef} crossOrigin="anonymous">
                    <source src={audioUrl} type="audio/mpeg" />
                </audio>
            )}

            <div 
                className={`pointer-events-auto max-w-4xl w-full bg-gradient-to-b from-black to-gray-900 border-2 border-black rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            >
                <div className="px-8 py-6 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <div className="text-white text-lg leading-relaxed font-sans">
                        {!hasSkipped ? (
                            <Typewriter
                                options={{
                                    strings: [cutscene.content],
                                    autoStart: true,
                                    loop: false,
                                    cursor: "▌",
                                    delay: 50,
                                    deleteSpeed: Infinity,
                                    wrapperClassName: "text-gray-100",
                                    cursorClassName: "text-gray-400",
                                }}
                                onInit={(typewriter) => {
                                    typewriter
                                        .typeString(cutscene.content)
                                        .callFunction(() => {
                                            setIsFinished(true);
                                        })
                                        .start();
                                }}
                            />
                        ) : (
                            <p className="text-gray-100 whitespace-pre-wrap">{cutscene.content}</p>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-t-2 border-gray-700 flex justify-between items-center">
                    <div className="text-gray-400 text-sm italic">
                        {!isFinished ? (
                            <span>⏎ Press Enter to skip</span>
                        ) : (
                            <span>⏎ Press Enter to continue</span>
                        )}
                    </div>

                    {isFinished && (
                        <button
                            onClick={handleComplete}
                            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold transition-all shadow-lg"
                        >
                            Continue →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cutscene;
