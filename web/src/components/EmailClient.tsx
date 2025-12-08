import {useState} from "react";
import {emails as emailTemplates} from "../utils/state";
import type {State} from "../utils/state";
import {replaceUsername} from "../utils/utils.ts";

interface EmailClientProps {
    gameState: State;
    onEmailRead?: (emailId: string) => void;
    onMarkAsRead?: (emailId: string) => void;
}

type Folder = "inbox" | "sent" | "drafts" | "spam" | "trash";

export const EmailClient = ({gameState, onEmailRead, onMarkAsRead}: EmailClientProps) => {
    const [selectedFolder, setSelectedFolder] = useState<Folder>("inbox");
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

    const getEmailsForFolder = (folder: Folder) => {
        if (folder === "inbox") {
            return Object.entries(emailTemplates.emails)
                .filter(([id]) => {
                    return gameState.emails[id as keyof typeof gameState.emails]?.shown
                })
                .map(([id, email]) => ({
                    id,
                    ...email,
                }));
        }
        return [];
    };

    const emailList = getEmailsForFolder(selectedFolder);
    const selectedEmail = selectedEmailId ? emailTemplates.emails[selectedEmailId as keyof typeof emailTemplates.emails] : null;

    const folders: Array<{ id: Folder; label: string; icon: string }> = [
        {id: "inbox", label: "Inbox", icon: "📥"},
        {id: "sent", label: "Sent", icon: "📤"},
        {id: "drafts", label: "Drafts", icon: "📋"},
        {id: "spam", label: "Spam", icon: "⚠️"},
        {id: "trash", label: "Trash", icon: "🗑️"},
    ];

    const handleEmailClick = (emailId: string) => {
        setSelectedEmailId(emailId);
        if (onEmailRead) {
            onEmailRead(emailId);
        }
    };

    return (
        <div className="flex h-full bg-gray-100 text-gray-900 text-sm font-sans">
            <div className="flex flex-col w-40 bg-gray-50 border-r border-gray-300">
                <div className="px-3 py-2 border-b border-gray-300 bg-gray-100">
                    <h3 className="font-semibold text-gray-800 text-xs">Folders</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {folders.map((folder) => (
                        <div
                            key={folder.id}
                            className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-xs transition-colors ${
                                selectedFolder === folder.id
                                    ? "bg-blue-600 text-white font-medium border-l-3 border-blue-700"
                                    : "hover:bg-gray-200 text-gray-700"
                            }`}
                            onClick={() => {
                                setSelectedFolder(folder.id);
                                setSelectedEmailId(null);
                            }}
                        >
                            <span className="text-sm">{folder.icon}</span>
                            <span>{folder.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex flex-col flex-1 border-r border-gray-300 overflow-hidden">
                    <div
                        className="grid grid-cols-[1.5fr_2fr_0.8fr] gap-2 px-3 py-2 bg-gray-100 border-b border-gray-300 font-semibold text-gray-700 text-xs sticky top-0 shrink-0">
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">From</div>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap">Subject</div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {emailList.length > 0 ? (
                            emailList.map((email) => (
                                <div
                                    key={email.id}
                                    className={`grid grid-cols-[1.5fr_2fr_0.8fr] gap-2 px-3 py-2 border-b border-gray-200 cursor-pointer transition-colors text-xs ${
                                        selectedEmailId === email.id
                                            ? "bg-blue-500 text-white"
                                            : gameState.emails[email.id as keyof typeof gameState.emails]?.read
                                                ? "hover:bg-gray-200 text-gray-700"
                                                : "hover:bg-gray-200 text-gray-900 font-semibold"
                                    }`}
                                    onClick={() => handleEmailClick(email.id)}
                                >
                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                        {email.from}
                                    </div>
                                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                                        {email.subject}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                <p>No emails in {selectedFolder}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col flex-1 bg-white overflow-hidden">
                    {selectedEmail ? (
                        <>
                            <div className="px-3 py-3 border-b border-gray-300 bg-gray-50 text-xs flex-shrink-0">
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-700">From:</span>{" "}
                                    <span className="text-gray-700">{selectedEmail.from}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-700">Subject:</span>{" "}
                                    <span className="text-gray-700">{selectedEmail.subject}</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-3 py-3">
                                <pre
                                    className="font-mono text-xs whitespace-pre-wrap break-words text-gray-800 leading-relaxed">
                                    {replaceUsername(gameState.username || '', selectedEmail.body)}
                                </pre>
                            </div>
                            <div className="px-3 py-3 border-t border-gray-300 bg-gray-50 flex justify-end">
                                {!gameState.emails[selectedEmailId as keyof typeof gameState.emails]?.read && onMarkAsRead && (
                                    <button
                                        onClick={() => selectedEmailId && onMarkAsRead(selectedEmailId)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                                {gameState.emails[selectedEmailId as keyof typeof gameState.emails]?.read && (
                                    <span className="text-gray-500 text-xs italic">Email marked as read</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                            <p>Select an email to read</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailClient;
