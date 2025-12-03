import {useEffect, useState} from "react";
import initSqlJs, {type Database} from "sql.js";
import WinBox from "react-winbox";
import {Slide, ToastContainer} from "react-toastify";
import "winbox/dist/css/winbox.min.css";
import "./App.css";
import SqlJsPage from "./components/SQLDatabase.tsx";
import Menu from "./components/Menu.tsx";
import {state, type State} from "./utils/state.ts";
import {load, save, saveNotepad} from "./utils/progress.ts";
import {useInterval} from "./components/hooks/useInterval.tsx";
import {LockScreen} from "./components/LockScreen.tsx";
import {DesktopIcon} from "./components/DesktopIcon.tsx";
import Notepad from "./components/Notepad.tsx";
import {NOTEPAD_DATA} from "./utils/const.ts";


function App() {
    const [isLocked, setIsLocked] = useState(true);
    const [notifCount, _setNotifCount] = useState(0); // use later
    const [progress, setProgress] = useState<State>(state);
    const [showApp, setShowApp] = useState({
        mail: false,
        terminal: false,
        menu: false,
        notepad: false,
    });
    const [loading, setLoading] = useState(false);
    const [loadingWebsite, setLoadingWebsite] = useState(true);
    const [db, setDb] = useState<Database | null>(null);
    const [sql, setSQL] = useState(null);
    const [notepad, setNotepad] = useState(() => {
        return localStorage.getItem(NOTEPAD_DATA) || "";
    });

    useInterval(() => {
        if (progress.username) {
            save(db, progress, notepad);
        }
    }, 5 * 60 * 1000); // needs milliseconds 5 minutes = 5 * 60 * 1000

    useEffect(() => {
        saveNotepad(notepad);
    }, [notepad]);

    useEffect(() => {
        initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`,
        })
            .then((SQL) => {
                const loadedData = load(SQL);
                setLoadingWebsite(false);

                setDb(loadedData.db || new SQL.Database());

                if (loadedData.state) setProgress(loadedData.state);

                if (loadedData.notepad) setNotepad(loadedData.notepad);

                setSQL(SQL as any);
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (!isLocked) save(db, progress, notepad);
    }, [isLocked]);

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
        <div className="overflow-hidden">
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

            {/* SQL Terminal Window */}
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
                    <SqlJsPage loadedDb={db}/>
                </WinBox>
            )}

            {/* Mail Window */}
            {showApp.mail && (
                <WinBox
                    width={500}
                    height={350}
                    x={50}
                    y={80}
                    title="📨 TULBird Mail"
                    background="#6AA8FF"
                    onclose={() => closeApp("mail")}
                >
                    <div className="p-4 text-black">
                        <h1 className="text-xl mb-3">Your Inbox</h1>
                        <p>No new messages.</p>
                    </div>
                </WinBox>
            )}

            {/* Menu Window */}
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
                    <Menu db={db} sql={sql} setDb={setDb} state={progress} setState={setProgress}/>
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

            {/* Desktop Icons */}
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
                    notifCount={notifCount}
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
            </div>
        </div>
    );
}

export default App;