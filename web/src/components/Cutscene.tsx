import {useState, useEffect, useRef, useCallback} from "react";
import Typewriter from "typewriter-effect";
import type {State} from "../utils/state";
import logger from "../utils/logger";

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
                } else {
                    handleComplete();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isFinished]);

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsFinished(true);
            if (onComplete) onComplete();
        }, 300);
    };

    logger.log('Cutscene isFinished state:', isFinished);

    const handleTypewriterInit = useCallback((typewriter: any) => {
        const sentences = cutscene.content.split(/([.!?]\s+)/);
        let chain = typewriter;
        
        for (let i = 0; i < sentences.length; i++) {
            chain = chain.typeString(sentences[i]);
            if (i < sentences.length - 1 && sentences[i].match(/[.!?]$/)) {
                chain = chain.pauseFor(400);
            }
        }
        
        chain.callFunction(() => {
            logger.log('Setting isFinished to true from Typewriter');
            setIsFinished(true);
        }).start();
    }, [cutscene.content]);

    return (
        <div className="fixed inset-0 z-[99999] flex flex-col justify-end p-6 pointer-events-none">
            {audioUrl && (
                <audio ref={audioRef} crossOrigin="anonymous">
                    <source src={audioUrl} type="audio/mpeg" />
                </audio>
            )}

            <div 
                className={`pointer-events-auto max-w-4xl w-full self-center bg-gradient-to-b from-black to-gray-900 border-2 border-black rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            >
                <div className="px-8 py-6 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <div className="text-white text-lg leading-relaxed font-sans text-left">
                        {!hasSkipped ? (
                            <Typewriter
                                options={{
                                    strings: [cutscene.content],
                                    autoStart: false,
                                    loop: false,
                                    cursor: "▌",
                                    delay: 75,
                                    deleteSpeed: Infinity,
                                    wrapperClassName: "text-gray-100",
                                    cursorClassName: "text-gray-400",
                                }}
                                onInit={handleTypewriterInit}
                            />
                        ) : (
                            <p className="text-gray-100 whitespace-pre-wrap text-left">{cutscene.content}</p>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-t-2 border-gray-700 flex justify-between items-center">
                    {!isFinished && (
                        <div className="text-gray-400 text-sm italic flex-1">
                            ⏎ Press Enter to skip
                        </div>
                    )}
                    {isFinished && (
                        <div className="text-gray-400 text-sm italic flex-1">
                            ⏎ Press Enter to continue
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cutscene;
