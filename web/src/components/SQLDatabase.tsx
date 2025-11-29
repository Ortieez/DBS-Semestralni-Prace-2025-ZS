import { useState, useEffect, useRef } from "react"
import initSqlJs, { type Database } from "sql.js"

interface HistoryEntry {
    input: string
    output: Array<{ columns: string[]; values: any[][] }> | null
    error: string | null
}

interface ResultTableProps {
    columns: string[]
    values: any[][]
}

export default function SqlJsPage() {
    const [db, setDb] = useState<Database | null>(null)
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        initSqlJs({
            locateFile: (file) => `https://sql.js.org/dist/${file}`,
        })
            .then((SQL) => setDb(new SQL.Database()))
            .catch((err) => console.error(err))
    }, [])

    const runCommand = (cmd: string) => {
        if (!db) return

        try {
            const result = db.exec(cmd)
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: result,
                    error: null,
                },
            ])
        } catch (err) {
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: err instanceof Error ? err.toString() : String(err),
                },
            ])
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            const command = e.currentTarget.value.trim()
            if (command.length > 0) runCommand(command)
            e.currentTarget.value = ""
        }
    }

    const ResultTable = ({ columns, values }: ResultTableProps) => (
        <table className="border-collapse mt-1">
            <thead>
            <tr>
                {columns.map((c) => (
                    <th key={c} className="pr-3 text-green-400">{c}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {values.map((row, i) => (
                <tr key={i}>
                    {row.map((cell, j) => (
                        <td key={j} className="pr-3 text-white">{cell}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    )

    if (!db)
        return (
            <div className="w-full h-full bg-black text-green-400 p-4">
                loading...
            </div>
        )

    return (
        <div className="w-full h-full bg-black text-green-400 p-4 font-mono text-sm overflow-auto">

            {history.map((entry, i) => (
                <div key={i} className="mb-2">
                    <div>
                        <span className="text-green-300">sql&gt;</span>{" "}
                        {entry.input}
                    </div>

                    {entry.error && (
                        <div className="text-red-400">{entry.error}</div>
                    )}

                    {entry.output &&
                        entry.output.map((res, rIndex) => (
                            <ResultTable
                                key={rIndex}
                                columns={res.columns}
                                values={res.values}
                            />
                        ))}
                </div>
            ))}

            <div className="flex">
                <span className="text-green-300 mr-1">sql&gt;</span>
                <textarea
                    ref={inputRef}
                    onKeyDown={onKeyDown}
                    className="bg-black text-green-400 outline-none resize-none w-full h-5 leading-5"
                />
            </div>
        </div>
    )
}