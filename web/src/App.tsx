import {useEffect, useRef, useState} from "react";
import initSqlJs, {type Database} from "sql.js";
import WinBox from "react-winbox";
import {Slide, ToastContainer} from "react-toastify";
import "winbox/dist/css/winbox.min.css";
import "./App.css";
import SqlJsPage from "./components/SQLDatabase.tsx";
import Menu from "./components/Menu.tsx";
import EmailClient from "./components/EmailClient.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import Cutscene from "./components/Cutscene.tsx";
import {state, type State} from "./utils/state.ts";
import {load, save, saveNotepad} from "./utils/progress.ts";
import {useInterval} from "./components/hooks/useInterval.tsx";
import {useStoryTriggers} from "./components/hooks/useStoryTriggers.tsx";
import {LockScreen} from "./components/LockScreen.tsx";
import {DesktopIcon} from "./components/DesktopIcon.tsx";
import Notepad from "./components/Notepad.tsx";
import {NOTEPAD_DATA} from "./utils/const.ts";
import {CREATE_SQL_TEMPLATE} from "./utils/templateDB/create.ts";
import {StoryManager} from "./utils/storyFlow.ts";
import logger from "./utils/logger.ts";

function App() {
    const [isLocked, setIsLocked] = useState(true);
    const [progress, setProgress] = useState<State>(state);
    const [currentCutscene, setCurrentCutscene] = useState<string | null>(null);
    const [showApp, setShowApp] = useState({
        mail: false,
        terminal: false,
        menu: false,
        notepad: false,
        admin: false,
    });
    const [loading, setLoading] = useState(false);
    const [loadingWebsite, setLoadingWebsite] = useState(true);
    const [db, setDb] = useState<Database | null>(null);
    const [sql, setSQL] = useState(null);
    const [notepad, setNotepad] = useState(() => {
        return localStorage.getItem(NOTEPAD_DATA) || "";
    });
    const minimizedWindowsRef = useRef<Array<{id: string, state: any}>>([])

    // Helper function to get/store winbox instances
    const getWindowByTitle = (title: string) => {
        const elements = document.querySelectorAll('.winbox');
        for (const el of elements) {
            const titleEl = el.querySelector('.wb-title');
            if (titleEl && titleEl.textContent?.includes(title)) {
                logger.log(`Found window: ${title}`, (el as any).winbox);
                return (el as any).winbox;
            }
        }
        logger.log(`Window not found: ${title}`);
        return null;
    };

    const minimizeAllWindows = () => {
        logger.log('Minimizing all windows...');
        minimizedWindowsRef.current = [];
        const windowTitles = ['SQL', 'TULBird', 'Menu', 'Notepad', 'Admin'];
        windowTitles.forEach(title => {
            const winbox = getWindowByTitle(title);
            if (winbox && !winbox.hidden && !winbox.min) {
                logger.log(`Minimizing: ${title}`);
                minimizedWindowsRef.current.push({
                    id: title,
                    state: {x: winbox.x, y: winbox.y, width: winbox.width, height: winbox.height}
                });
                winbox.minimize();
            }
        });
    };

    const restoreAllWindows = () => {
        logger.log('Restoring windows...', minimizedWindowsRef.current);
        minimizedWindowsRef.current.forEach(({id}) => {
            const winbox = getWindowByTitle(id);
            if (winbox) {
                logger.log(`Restoring: ${id}`);
                winbox.restore();
            }
        });
        minimizedWindowsRef.current = [];
    };

    const storyManagerRef = useRef<StoryManager | null>(null);
    if (!storyManagerRef.current) {
        storyManagerRef.current = new StoryManager(progress, progress.currentStoryEvent);
    }

    const storyTriggers = useStoryTriggers({
        storyManager: storyManagerRef.current,
        setProgress,
    });

    useInterval(() => {
        if (progress.username && !isLocked) {
            save(db, progress, notepad);
        }
    }, 5 * 60 * 1000); // needs milliseconds, 5 minutes = 5 * 60 * 1000

    useEffect(() => {
        saveNotepad(notepad, true);
    }, [notepad]);

    useEffect(() => {
        initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`,
        })
            .then((SQL) => {
                const loadedData = load(SQL);
                setLoadingWebsite(false);

                if (loadedData.db) {
                    setDb(loadedData.db);
                } else {
                    let tempDB = new SQL.Database();
                    tempDB!.exec(CREATE_SQL_TEMPLATE);
                    setDb(tempDB);
                }

                if (loadedData.state) setProgress(loadedData.state);

                if (loadedData.notepad) setNotepad(loadedData.notepad);

                setSQL(SQL as any);
            })
            .catch((err) => logger.error(err));
    }, []);

    useEffect(() => {
        if (!isLocked) save(db, progress, notepad);
    }, [isLocked]);

    // Minimize windows when cutscene starts
    useEffect(() => {
        if (currentCutscene) {
            minimizeAllWindows();
        }
    }, [currentCutscene]);

    useEffect(() => {
        if (isLocked || !storyManagerRef.current) return;

        storyManagerRef.current.updateState(progress);

        const action = storyManagerRef.current.checkForProgress();

        if (action.action === "show_cutscene" && action.id) {
            setCurrentCutscene(action.id);
        } else if (action.action === "show_email" && action.id) {
            const emailId = action.id as keyof typeof progress.emails;
            storyManagerRef.current.advance();
            setProgress((prev) => ({
                ...prev,
                emails: {
                    ...prev.emails,
                    [emailId]: {
                        ...prev.emails[emailId],
                        shown: true,
                    },
                },
                currentStoryEvent: storyManagerRef.current!.getCurrentEventKey(),
            }));
        }
    }, [progress, isLocked]);

    const openApp = (appName: keyof typeof showApp) => {
        if (loading) return;

        setLoading(true);
        document.body.style.cursor = "wait";

        setTimeout(() => {
            setShowApp((prev) => ({...prev, [appName]: true}));
            setLoading(false);
            document.body.style.cursor = "default";
        }, 800);
    };

    const closeApp = (appName: keyof typeof showApp) => {
        setShowApp((prev) => ({...prev, [appName]: false}));
    };

    const handleUnlock = (user: string) => {
        // @ts-ignore - progress.username can be null and can be also string, it is accounted for in the code.
        setProgress({...progress, username: user});
        setIsLocked(false);
    };

    if (loadingWebsite) return <div className="text-center">Loading...</div>;

    const unreadEmailCount = Object.entries(progress.emails).filter(
        ([, emailData]) => emailData.shown && !emailData.read
    ).length;

    if (isLocked) {
        return (
            <>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable={false}
                    pauseOnHover={false}
                    theme="dark"
                    transition={Slide}
                    style={{zIndex: 9999}}
                />
                <LockScreen onUnlock={handleUnlock} savedUsername={progress.username}/>
            </>
        );
    }

    return (
        <div className="fixed inset-0 overflow-hidden">
            <img 
                src="/background.webp" 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover"
                style={{zIndex: -1}}
            />
            {currentCutscene && (
                <Cutscene
                    cutsceneId={currentCutscene}
                    gameState={progress}
                    onComplete={() => {
                        // Restore minimized windows
                        restoreAllWindows();

                        storyManagerRef.current!.advance();
                        setProgress((prev) => ({
                            ...prev,
                            cutscenes: {
                                ...prev.cutscenes,
                                [currentCutscene]: {
                                    ...prev.cutscenes[currentCutscene as keyof typeof prev.cutscenes],
                                    viewed: true,
                                },
                            },
                            currentStoryEvent: storyManagerRef.current!.getCurrentEventKey(),
                        }));
                        setCurrentCutscene(null);
                    }}
                    onSkip={() => {
                        storyManagerRef.current!.advance();
                        setProgress((prev) => ({
                            ...prev,
                            cutscenes: {
                                ...prev.cutscenes,
                                [currentCutscene]: {
                                    ...prev.cutscenes[currentCutscene as keyof typeof prev.cutscenes],
                                    viewed: true,
                                },
                            },
                            currentStoryEvent: storyManagerRef.current!.getCurrentEventKey(),
                        }));
                        setCurrentCutscene(null);
                    }}
                />
            )}

            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="dark"
                transition={Slide}
                style={{zIndex: 9999}}
            />

            {showApp.terminal && (
                <WinBox
                    width={600}
                    height={400}
                    x="center"
                    y={30}
                    noFull={true}
                    title="💻 SQL Terminal"
                    border={4}
                    background="#808080"
                    onclose={() => closeApp("terminal")}
                >
                    <SqlJsPage loadedDb={db} storyTriggers={storyTriggers} gameState={progress}/>
                </WinBox>
            )}

            {showApp.mail && (
                <WinBox
                    width={800}
                    height={500}
                    x={50}
                    y={80}
                    title="📨 TULBird Mail"
                    background="#6AA8FF"
                    onclose={() => closeApp("mail")}
                >
                    <EmailClient
                        gameState={progress}
                        onMarkAsRead={(emailId) => {
                            storyManagerRef.current!.advance();
                            setProgress((prev) => ({
                                ...prev,
                                emails: {
                                    ...prev.emails,
                                    [emailId]: {
                                        ...prev.emails[emailId as keyof typeof prev.emails],
                                        read: true,
                                    },
                                },
                                currentStoryEvent: storyManagerRef.current!.getCurrentEventKey(),
                            }));
                        }}
                    />
                </WinBox>
            )}

            {showApp.menu && (
                <WinBox
                    width={350}
                    height={300}
                    x={50}
                    y={80}
                    title="⚙️ Menu"
                    noFull={true}
                    noMax={true}
                    background="#0F0F0F"
                    onclose={() => closeApp("menu")}
                >
                    <Menu
                        db={db}
                        sql={sql}
                        setDb={setDb}
                        state={progress}
                        setState={setProgress}
                        notepad={notepad}
                        setNotepad={setNotepad}
                    />
                </WinBox>
            )}

            {showApp.notepad && (
                <WinBox
                    width={600}
                    height={400}
                    x={50}
                    y={80}
                    title="📝 Notepad"
                    noFull={true}
                    noMax={true}
                    background="#357EC7"
                    onclose={() => closeApp("notepad")}
                >
                    <Notepad savedNotes={notepad} setNotepad={setNotepad}/>
                </WinBox>
            )}

            {showApp.admin && (
                <WinBox
                    width={700}
                    height={500}
                    x={100}
                    y={100}
                    title="⚙️ Admin Panel"
                    background="#0f172a"
                    onclose={() => closeApp("admin")}
                >
                    <AdminPanel
                        state={progress}
                        setState={setProgress}
                        onTriggerEmail={(emailId) => {
                            setProgress((prev) => ({
                                ...prev,
                                emails: {
                                    ...prev.emails,
                                    [emailId]: {
                                        ...prev.emails[emailId as keyof typeof prev.emails],
                                        shown: true,
                                    },
                                },
                            }));
                        }}
                        onShowCutscene={(cutsceneId) => {
                            setCurrentCutscene(cutsceneId);
                        }}
                    />
                </WinBox>
            )}

            <div id="apps" className="absolute top-0 left-0 m-4 flex flex-row gap-8 z-10">
                <DesktopIcon
                    icon="./terminal.png"
                    label="SQL Terminal"
                    onClick={() => openApp("terminal")}
                />
                <DesktopIcon
                    icon="./fm_logo.png"
                    label="TULBird"
                    onClick={() => openApp("mail")}
                    notifCount={unreadEmailCount}
                />
                <DesktopIcon
                    icon="./gear.png"
                    label="Menu"
                    onClick={() => openApp("menu")}
                />
                <DesktopIcon
                    icon="./notepad.png"
                    label="Notepad"
                    onClick={() => openApp("notepad")}
                />
                <DesktopIcon
                    icon="./gear.png"
                    label="Admin"
                    onClick={() => openApp("admin")}
                />
                </div>
        </div>
    );
}

export default App;