import {useState} from "react";
import {type State, state as defaultState} from "../utils/state";

interface AdminPanelProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    onTriggerEmail?: (emailId: string) => void;
    onShowCutscene?: (cutsceneId: string) => void;
}

type AdminTab = "emails" | "cutscenes" | "progress" | "state" | "reset";

export const AdminPanel = ({state, setState, onTriggerEmail, onShowCutscene}: AdminPanelProps) => {
    const [activeTab, setActiveTab] = useState<AdminTab>("emails");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        story: true,
        emails: true,
        pcs: false,
        routers: false,
        misc: false,
        cutscenes: false,
    });

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleMarkEmailShown = (emailId: string) => {
        setState({
            ...state,
            emails: {
                ...state.emails,
                [emailId]: {
                    ...state.emails[emailId as keyof typeof state.emails],
                    shown: true,
                },
            },
        });
        if (onTriggerEmail) {
            onTriggerEmail(emailId);
        }
    };

    const handleMarkEmailRead = (emailId: string) => {
        setState({
            ...state,
            emails: {
                ...state.emails,
                [emailId]: {
                    ...state.emails[emailId as keyof typeof state.emails],
                    read: true,
                },
            },
        });
    };

    const handleShowCutscene = (cutsceneId: string) => {
        setState({
            ...state,
            cutscenes: {
                ...state.cutscenes,
                [cutsceneId]: {
                    ...state.cutscenes[cutsceneId as keyof typeof state.cutscenes],
                    viewed: true,
                },
            },
        });
        if (onShowCutscene) {
            onShowCutscene(cutsceneId);
        }
    };

    const toggleStoryProgress = (key: string) => {
        setState({
            ...state,
            storyProgress: {
                ...state.storyProgress,
                [key as keyof typeof state.storyProgress]:
                    !state.storyProgress[key as keyof typeof state.storyProgress],
            },
        });
    };

    const togglePCAccess = (pcName: string) => {
        setState({
            ...state,
            pcs: {
                ...state.pcs,
                [pcName]: {
                    ...state.pcs[pcName as keyof typeof state.pcs],
                    access_granted: !state.pcs[pcName as keyof typeof state.pcs].access_granted,
                },
            },
        });
    };

    const toggleRouterAccess = (routerName: string) => {
        setState({
            ...state,
            routers: {
                ...state.routers,
                [routerName]: {
                    ...state.routers[routerName as keyof typeof state.routers],
                    unlocked: !state.routers[routerName as keyof typeof state.routers].unlocked,
                },
            },
        });
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset the game? Your username will be preserved.")) {
            setState({
                ...defaultState,
                username: state.username,
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 text-slate-100 text-xs font-sans">
            <div className="flex bg-slate-800 border-b border-slate-700 gap-0 flex-shrink-0">
                <button
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors text-center border-b-2 ${
                        activeTab === "emails"
                            ? "bg-slate-900 text-cyan-400 border-cyan-500"
                            : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                    }`}
                    onClick={() => setActiveTab("emails")}
                >
                    📧 Emails
                </button>
                <button
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors text-center border-b-2 ${
                        activeTab === "cutscenes"
                            ? "bg-slate-900 text-cyan-400 border-cyan-500"
                            : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                    }`}
                    onClick={() => setActiveTab("cutscenes")}
                >
                    🎬 Cutscenes
                </button>
                <button
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors text-center border-b-2 ${
                        activeTab === "progress"
                            ? "bg-slate-900 text-cyan-400 border-cyan-500"
                            : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                    }`}
                    onClick={() => setActiveTab("progress")}
                >
                    📊 Progress
                </button>
                <button
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors text-center border-b-2 ${
                        activeTab === "state"
                            ? "bg-slate-900 text-cyan-400 border-cyan-500"
                            : "bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700"
                    }`}
                    onClick={() => setActiveTab("state")}
                >
                    ⚙️ State
                </button>
                <button
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors text-center border-b-2 ${
                        activeTab === "reset"
                            ? "bg-red-900 text-red-300 border-red-500"
                            : "bg-slate-800 text-slate-400 border-transparent hover:bg-red-900"
                    }`}
                    onClick={() => setActiveTab("reset")}
                    title="Reset game to default state (preserves username)"
                >
                    🔄 Reset
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {activeTab === "emails" && (
                    <div className="space-y-2">
                        <div className="bg-slate-800 border border-slate-700 rounded">
                            <div
                                className="bg-slate-700 px-3 py-2 cursor-pointer flex items-center gap-2 border-b border-slate-600 hover:bg-slate-600"
                                onClick={() => toggleSection("emails")}
                            >
                                <span className="text-xs w-4 text-slate-400">
                                    {expandedSections.emails ? "▼" : "▶"}
                                </span>
                                <h3 className="font-semibold text-slate-100">Email Triggers</h3>
                            </div>
                            {expandedSections.emails && (
                                <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                                    {Object.entries(state.emails).map(([emailId, emailData]) => (
                                        <div
                                            key={emailId}
                                            className="p-2 bg-slate-900 border border-slate-700 rounded"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-slate-300 font-medium">{emailId}</span>
                                                <div className="flex gap-1 flex-wrap justify-end">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs ${
                                                            emailData.shown
                                                                ? "bg-emerald-900 text-emerald-300"
                                                                : "bg-slate-700 text-slate-400"
                                                        }`}
                                                    >
                                                        {emailData.shown ? "Shown" : "Hidden"}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs ${
                                                            emailData.read
                                                                ? "bg-emerald-900 text-emerald-300"
                                                                : "bg-slate-700 text-slate-400"
                                                        }`}
                                                    >
                                                        {emailData.read ? "Read" : "Unread"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-semibold rounded text-xs transition-colors"
                                                    onClick={() => handleMarkEmailShown(emailId)}
                                                >
                                                    Show Email
                                                </button>
                                                <button
                                                    className="px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded text-xs transition-colors"
                                                    onClick={() => handleMarkEmailRead(emailId)}
                                                >
                                                    Mark Read
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "cutscenes" && (
                    <div className="space-y-2">
                        <div className="bg-slate-800 border border-slate-700 rounded">
                            <div
                                className="bg-slate-700 px-3 py-2 cursor-pointer flex items-center gap-2 border-b border-slate-600 hover:bg-slate-600"
                                onClick={() => toggleSection("cutscenes")}
                            >
                                <span className="text-xs w-4 text-slate-400">
                                    {expandedSections.cutscenes ? "▼" : "▶"}
                                </span>
                                <h3 className="font-semibold text-slate-100">Cutscenes</h3>
                            </div>
                            {expandedSections.cutscenes && (
                                <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                                    {Object.entries(state.cutscenes).map(([cutsceneId, cutscene]) => (
                                        <div
                                            key={cutsceneId}
                                            className="p-2 bg-slate-900 border border-slate-700 rounded"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-slate-300 font-medium">{cutscene.id}</span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs ${
                                                        cutscene.viewed
                                                            ? "bg-emerald-900 text-emerald-300"
                                                            : "bg-slate-700 text-slate-400"
                                                    }`}
                                                >
                                                    {cutscene.viewed ? "Viewed" : "Not Viewed"}
                                                </span>
                                            </div>
                                            <button
                                                className="w-full px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-semibold rounded text-xs transition-colors"
                                                onClick={() => handleShowCutscene(cutsceneId)}
                                            >
                                                Show Cutscene
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "progress" && (
                    <div className="space-y-2">
                        <div className="bg-slate-800 border border-slate-700 rounded">
                            <div
                                className="bg-slate-700 px-3 py-2 cursor-pointer flex items-center gap-2 border-b border-slate-600 hover:bg-slate-600"
                                onClick={() => toggleSection("story")}
                            >
                                <span className="text-xs w-4 text-slate-400">
                                    {expandedSections.story ? "▼" : "▶"}
                                </span>
                                <h3 className="font-semibold text-slate-100">Story Progress</h3>
                            </div>
                            {expandedSections.story && (
                                <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                                    {Object.entries(state.storyProgress).map(([key, value]) => (
                                        <label key={key} className="flex items-center gap-2 cursor-pointer p-1">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={() => toggleStoryProgress(key)}
                                                className="w-4 h-4 accent-cyan-500"
                                            />
                                            <span className="text-slate-300 text-xs">{key}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded">
                            <div
                                className="bg-slate-700 px-3 py-2 cursor-pointer flex items-center gap-2 border-b border-slate-600 hover:bg-slate-600"
                                onClick={() => toggleSection("pcs")}
                            >
                                <span className="text-xs w-4 text-slate-400">
                                    {expandedSections.pcs ? "▼" : "▶"}
                                </span>
                                <h3 className="font-semibold text-slate-100">PCs Access</h3>
                            </div>
                            {expandedSections.pcs && (
                                <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                                    {Object.entries(state.pcs).map(([pcName, pcData]) => (
                                        <label
                                            key={pcName}
                                            className="flex items-center gap-2 cursor-pointer p-1"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={pcData.access_granted}
                                                onChange={() => togglePCAccess(pcName)}
                                                className="w-4 h-4 accent-cyan-500"
                                            />
                                            <span className="text-slate-300 text-xs">{pcName}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded">
                            <div
                                className="bg-slate-700 px-3 py-2 cursor-pointer flex items-center gap-2 border-b border-slate-600 hover:bg-slate-600"
                                onClick={() => toggleSection("routers")}
                            >
                                <span className="text-xs w-4 text-slate-400">
                                    {expandedSections.routers ? "▼" : "▶"}
                                </span>
                                <h3 className="font-semibold text-slate-100">Router Access</h3>
                            </div>
                            {expandedSections.routers && (
                                <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                                    {Object.entries(state.routers).map(([routerName, routerData]) => (
                                        <label
                                            key={routerName}
                                            className="flex items-center gap-2 cursor-pointer p-1"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={routerData.unlocked}
                                                onChange={() => toggleRouterAccess(routerName)}
                                                className="w-4 h-4 accent-cyan-500"
                                            />
                                            <span className="text-slate-300 text-xs">{routerName}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "state" && (
                    <div className="space-y-2">
                        <div className="bg-slate-800 border border-slate-700 rounded">
                            <div className="bg-slate-700 px-3 py-2 border-b border-slate-600">
                                <h3 className="font-semibold text-slate-100">Raw State</h3>
                            </div>
                            <div className="p-2 max-h-96 overflow-y-auto">
                                <pre className="bg-slate-950 border border-slate-700 rounded p-2 text-emerald-400 text-xs leading-relaxed font-mono overflow-x-auto whitespace-pre-wrap break-words">
                                    {JSON.stringify(state, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "reset" && (
                    <div className="space-y-4">
                        <div className="bg-red-900 border border-red-700 rounded p-4">
                            <h3 className="font-semibold text-red-200 mb-2">Reset Game State</h3>
                            <p className="text-red-100 text-xs mb-4">
                                This will reset the game to its default state. Your username will be preserved.
                            </p>
                            <button
                                onClick={handleReset}
                                className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 text-red-100 font-medium rounded transition-colors"
                            >
                                🔄 Reset Game
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
