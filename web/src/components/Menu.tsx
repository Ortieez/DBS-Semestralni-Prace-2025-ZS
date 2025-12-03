import type {Database} from "sql.js";
import {DB_LAST_SAVED} from "../utils/const.ts";
import {useState} from "react";
import {toast} from 'react-toastify';
import {getLastSavedTimeString, load, save} from "../utils/progress.ts";
import type {State} from "../utils/state.ts";

export type MenuProps = {
    db: Database | null,
    sql: any,
    state: State,

    setDb: React.Dispatch<React.SetStateAction<Database | null>>,
    setState: React.Dispatch<React.SetStateAction<State>>
}

const Menu = (props: MenuProps) => {
    const [lastSaved, setLastSaved] = useState<string | null>(getLastSavedTimeString(localStorage.getItem(DB_LAST_SAVED)));

    return (
        <div className="p-4 text-black flex flex-col gap-4 h-full">
            <button onClick={() => {
                save(props.db, props.state);
                setLastSaved(getLastSavedTimeString(localStorage.getItem(DB_LAST_SAVED)));
            }}
                    className={"p-4 bg-black text-white rounded-md h-[50%] hover:bg-gray-500 transition-all cursor-pointer"}>Save
                progress <br/> <span className={"text-gray-400"}>(last save {lastSaved})</span></button>
            <button onClick={() => {
                let data = load(props.sql);
                if (data.db) props.setDb(data.db);
                if (data.state) props.setState(data.state);

                if (data.db || data.state) {
                    toast.success("Successfully loaded your progress!");
                } else {
                    toast.error("Failed to load your progress!");
                }

            }}
                    className={"p-4 bg-black text-white rounded-md h-[50%] hover:bg-gray-500 transition-all cursor-pointer"}>Load
                progress
            </button>
        </div>
    )
}

export default Menu;