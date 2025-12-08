import { useState, useRef, useEffect } from 'react';

interface PasswordPromptProps {
    onSubmit: (password: string) => void;
    onCancel: () => void;
}

export default function PasswordPrompt({ onSubmit, onCancel }: PasswordPromptProps) {
    const [password, setPassword] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onCancel}
        >
            <div 
                className="bg-gray-800 border-2 border-green-500 p-6 rounded-lg shadow-lg min-w-[400px]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4 border-b border-green-500 pb-2">
                    <h2 className="text-green-400 font-bold">Password Required</h2>
                    <button 
                        onClick={onCancel}
                        className="text-green-400 hover:text-green-300 font-bold text-xl leading-none"
                    >
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-green-400 mb-2">
                            Enter password:
                        </label>
                        <input
                            ref={inputRef}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-gray-900 text-green-400 border border-green-500 px-3 py-2 rounded focus:outline-none focus:border-green-300"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-700 text-green-400 border border-green-500 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-700 text-white border border-green-500 rounded hover:bg-green-600"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
