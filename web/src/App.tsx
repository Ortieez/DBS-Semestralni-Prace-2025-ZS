import './App.css'
import SqlJsPage from "./components/SQLDatabase.tsx"

import 'winbox/dist/css/winbox.min.css'
import WinBox from 'react-winbox'
import { useState } from "react"

function App() {

    const [notifCount, setNotifCount] = useState(0)
    const [showMail, setShowMail] = useState(false)
    const [showTerminal, setShowTerminal] = useState(false)
    const [loading, setLoading] = useState(false)

    const openApp = (who: string) => {
        if (loading) return

        setLoading(true)
        document.body.style.cursor = "wait"

        setTimeout(() => {
            switch(who) {
                case "mail":
                    setShowMail(true);
                    break;
                case "terminal":
                    setShowTerminal(true);
                    break;
            }
            setLoading(false)
            document.body.style.cursor = "default"
        }, 800)
    }

    return (
        <div className="overflow-hidden">

            {showTerminal && (
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
                    onclose={() => setShowTerminal(false)}
                >
                    <SqlJsPage/>
                </WinBox>
            )}

            {showMail && (
                <WinBox
                    width={500}
                    height={350}
                    x={50}
                    y={80}
                    title="📨 TULBird Mail"
                    onclose={() => setShowMail(false)}
                    background={"#6AA8FF"}
                >
                    <div className="p-4 text-black">
                        <h1 className="text-xl mb-3">Your Inbox</h1>
                        <p>No new messages.</p>
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
