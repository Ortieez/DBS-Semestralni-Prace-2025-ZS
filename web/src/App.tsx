import './App.css'
import SqlJsPage from "./components/SQLDatabase.tsx"

import 'winbox/dist/css/winbox.min.css'
import WinBox from 'react-winbox'
import {useEffect, useState} from "react"
import initSqlJs, {type Database} from "sql.js";

const DB_STRING = "sqliteDb";

function App() {

    const [notifCount, setNotifCount] = useState(0)
    const [showApp, setShowApp] = useState({
        mail: false,
        terminal: false,
        menu: false
    })
    const [loading, setLoading] = useState(false)
    const [db, setDb] = useState<Database | null>(null)
    const [sql, setSQL] = useState(null);


    useEffect(() => {
        initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`,
        })
            .then((SQL) => {
                setDb(new SQL.Database());
                // @ts-ignore
                setSQL(SQL);
            })
            .catch((err) => console.error(err))
    }, [])

    const openApp = (who: string) => {
        if (loading) return

        setLoading(true)
        document.body.style.cursor = "wait"

        setTimeout(() => {
            switch(who) {
                case "mail":
                    setShowApp({ ...showApp, mail: true });
                    break;
                case "terminal":
                    setShowApp({ ...showApp, terminal: true });
                    break;
                case "menu":
                    setShowApp({ ...showApp, menu: true });
                    break;
            }
            setLoading(false)
            document.body.style.cursor = "default"
        }, 800)
    }

    const saveDatabase = (db: Database | null) => {
        if (!db) return;

        const dbUintArray = db.export();
        const dbBase64 = btoa(
            dbUintArray.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        localStorage.setItem(DB_STRING, dbBase64);
    };

    const loadDatabase = (SQL: any): Database | null => {
        const dbBase64 = localStorage.getItem('sqliteDb');
        if (!dbBase64) return null;

        const binaryString = atob(dbBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new SQL.Database(bytes);
    };

    return (
        <div className="overflow-hidden">

            {showApp.terminal && (
                <WinBox
                    width={600}
                    height={400}
                    x="center"
                    y={30}
                    noFull={true}
                    title="💻 SQL Terminal"
                    top={0}
                    right={0}
                    bottom={0}
                    left={0}
                    border={4}
                    background={"#808080"}
                    onclose={() => setShowApp({ ...showApp, terminal: false})}
                >
                    <SqlJsPage loadedDb={db}/>
                </WinBox>
            )}

            {showApp.mail && (
                <WinBox
                    width={500}
                    height={350}
                    x={50}
                    y={80}
                    title="📨 TULBird Mail"
                    onclose={() => setShowApp({ ...showApp, mail: false})}
                    background={"#6AA8FF"}
                >
                    <div className="p-4 text-black">
                        <h1 className="text-xl mb-3">Your Inbox</h1>
                        <p>No new messages.</p>
                    </div>
                </WinBox>
            )}

            {showApp.menu && (
                <WinBox
                    width={350}
                    height={200}
                    x={50}
                    y={80}
                    title="⚙️ Menu"
                    noResize={true}
                    noFull={true}
                    noMax={true}
                    onclose={() => setShowApp({ ...showApp, menu: false})}
                    background={"#0F0F0F"}
                >
                    <div className="p-4 text-black flex flex-col gap-4">
                        <button onClick={() => saveDatabase(db)} className={"p-4 bg-black text-white rounded-md hover:bg-gray-500 transition-all cursor-pointer"}>Save progress</button>
                        <button onClick={() => {
                            const db = loadDatabase(sql);
                            setDb(db);
                        }}  className={"p-4 bg-black text-white rounded-md hover:bg-gray-500 transition-all cursor-pointer"}>Load progress</button>
                    </div>
                </WinBox>
            )}

            <div
                id="apps"
                className="absolute top-0 left-0 m-4 flex flex-row gap-8 z-10"
            >
                <div className="relative w-24 h-24 hover:bg-gray-600 rounded-md cursor-pointer
                    flex flex-col items-center justify-center select-none"
                     onDoubleClick={() => openApp("terminal")}
                >
                    <img src="./terminal.png" className="w-10 h-10" alt=""/>
                    <span className="text-white mt-1">SQL Terminal</span>
                </div>

                <div
                    onDoubleClick={() => openApp("mail")}
                    className="relative w-24 h-24 hover:bg-gray-600 rounded-md cursor-pointer
                    flex flex-col items-center justify-center select-none"
                >
                    {notifCount > 0 && (
                        <span className="
                           absolute -top-0.5 -right-0.5 bg-red-500 text-white
                           text-xs w-5 h-5 rounded-full flex items-center justify-center
                           border border-black
                       ">
                           {notifCount}
                       </span>
                    )}

                    <img src="./fm_logo.png" className="w-10 h-10" alt=""/>
                    <span className="text-white mt-1">TULBird</span>
                </div>

                <div
                    onDoubleClick={() => openApp("menu")}
                    className="relative w-24 h-24 hover:bg-gray-600 rounded-md cursor-pointer
                    flex flex-col items-center justify-center select-none"
                >
                    {notifCount > 0 && (
                        <span className="
                           absolute -top-0.5 -right-0.5 bg-red-500 text-white
                           text-xs w-5 h-5 rounded-full flex items-center justify-center
                           border border-black
                       ">
                           {notifCount}
                       </span>
                    )}

                    <img src="./gear.png" className="w-10 h-10" alt=""/>
                    <span className="text-white mt-1">Menu</span>
                </div>
            </div>

            <button
                onClick={() => setNotifCount(n => n + 1)}
                className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded z-20"
            >
                Add Notification
            </button>

            <img
                src="./tul_hack.png"
                className="absolute inset-0 w-full h-full object-cover -z-10"
                alt=""
            />
        </div>
    )
}

export default App
