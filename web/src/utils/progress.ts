import type {Database} from "sql.js";
import {toast} from "react-toastify";
import {DB_LAST_SAVED, DB_STRING, STATE_PROGRESS} from "./const.ts";
import {type State} from "./state.ts";

const saveDatabase = (db: Database | null) => {
    if (!db) return;

    const dbUintArray = db.export();

    if (dbUintArray.length === 0) {
        return;
    }

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

const saveProgress = (state: State) => {
    localStorage.setItem(STATE_PROGRESS, JSON.stringify(state));
}

const loadProgress = (): State | null => {
    const stringedJson = localStorage.getItem(STATE_PROGRESS);
    if (!stringedJson) return null;
    return JSON.parse(stringedJson);
}

export const save = (db: Database | null, state: State) => {
    try {
        saveDatabase(db);
        saveProgress(state);
        localStorage.setItem(DB_LAST_SAVED, new Date().toISOString());
        toast.success("Successfully saved your progress!");
    } catch (e) {
        console.error(e);
        toast.error("Failed to save your progress!");
    }
}

export const load = (sql: any) => {
    try {
        const db = loadDatabase(sql);
        const state = loadProgress();
        return {db, state};
    } catch (e) {
        toast.error("Failed to load your progress!");
        console.error(e);
        return {db: null, state: null};
    }
}

export const getLastSavedTimeString = (lastSaved: string | null) => {
    return lastSaved ? new Date(lastSaved).toLocaleTimeString() + " " + new Date(lastSaved).toLocaleDateString() : "never";
}

export const clearProgress = () => {
    localStorage.removeItem(DB_STRING);
    localStorage.removeItem(DB_LAST_SAVED);
    localStorage.removeItem(STATE_PROGRESS);
}