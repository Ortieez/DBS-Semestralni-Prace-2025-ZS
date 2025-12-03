import {useState} from "react";

function Notepad(props: { savedNotes: string, setNotepad: React.Dispatch<React.SetStateAction<string>> }) {
    const [text, setText] = useState(props.savedNotes || "");
    const [fileMenuOpen, setFileMenuOpen] = useState(false);

    const onButtonSaveClick = () => {
        props.setNotepad(text);
        setFileMenuOpen(false);
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Menu Bar */}
            <div className="bg-white border-b border-gray-200 px-2 py-1 text-sm flex gap-4">
                <div
                    className="relative"
                    onMouseEnter={() => setFileMenuOpen(true)}
                    onMouseLeave={() => setFileMenuOpen(false)}
                >
                    <span className="hover:bg-blue-100 px-2 cursor-default">File</span>
                    {fileMenuOpen && (
                        <div
                            className="absolute top-full left-0 bg-white border border-gray-300 shadow-lg py-1 min-w-[180px] z-10">
                            <div
                                onClick={onButtonSaveClick}
                                className="px-4 py-1 hover:bg-blue-100 cursor-default flex justify-between"
                            >
                                <span>Save</span>
                            </div>
                            <hr className="my-1 border-gray-200"/>
                            <div className="px-4 py-1 hover:bg-blue-100 cursor-default text-gray-400">
                                New
                            </div>
                            <div className="px-4 py-1 hover:bg-blue-100 cursor-default text-gray-400">
                                Open...
                            </div>
                            <div className="px-4 py-1 hover:bg-blue-100 cursor-default text-gray-400">
                                Save As...
                            </div>
                        </div>
                    )}
                </div>
                <span className="hover:bg-blue-100 px-2 cursor-default">Edit</span>
                <span className="hover:bg-blue-100 px-2 cursor-default">Format</span>
                <span className="hover:bg-blue-100 px-2 cursor-default">View</span>
                <span className="hover:bg-blue-100 px-2 cursor-default">Help</span>
            </div>

            {/* Text Area */}
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 w-full p-2 resize-none border-none outline-none font-mono text-sm"
                style={{
                    fontFamily: 'Consolas, "Courier New", monospace',
                    fontSize: '11pt'
                }}
            />

            {/* Status Bar */}
            <div
                className="bg-gray-50 border-t border-gray-200 px-3 py-1 text-xs text-gray-600 flex justify-between items-center">
                <div className="flex gap-4">
                    <span>Ln {text.split('\n').length}, Col {text.length - text.lastIndexOf('\n')}</span>
                </div>
                <div>
                    <span>UTF-8</span>
                </div>
            </div>
        </div>
    );
}

export default Notepad;