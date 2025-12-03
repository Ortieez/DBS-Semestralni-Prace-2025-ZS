import {useState, useEffect, useRef} from "react"
import {type Database} from "sql.js"

interface HistoryEntry {
    input: string
    output: Array<{ columns: string[]; values: any[][] }> | null
    error: string | null
}

interface ResultTableProps {
    columns: string[]
    values: any[][]
}

interface Suggestion {
    text: string
    type: 'keyword' | 'table' | 'column'
    description?: string
}

export default function SqlJsPage(props: { loadedDb: Database | null }) {
    const [db, setDb] = useState<Database | null>(null)
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [tables, setTables] = useState<string[]>([])
    const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({})
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    const SQL_KEYWORDS = [
        'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
        'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'LEFT', 'RIGHT',
        'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'LIMIT',
        'OFFSET', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN',
        'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'HAVING'
    ]

    useEffect(() => {
        if (!props.loadedDb) return

        setDb(props.loadedDb)

        // Get all tables
        try {
            const tablesResult = props.loadedDb.exec(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            if (tablesResult.length > 0) {
                const tableNames = tablesResult[0].values.map(row => row[0] as string)
                setTables(tableNames)

                // Get columns for each table
                const cols: Record<string, string[]> = {}
                tableNames.forEach(table => {
                    if (!props.loadedDb) return;

                    const colResult = props.loadedDb.exec(`PRAGMA table_info(${table})`)
                    if (colResult.length > 0) {
                        cols[table] = colResult[0].values.map(row => row[1] as string)
                    }
                })
                setTableColumns(cols)
            }
        } catch (err) {
            console.error('Error loading schema:', err)
        }
    }, [props.loadedDb])

    const getContextualSuggestions = (text: string): Suggestion[] => {
        const words = text.trim().split(/\s+/)
        const lastWord = words[words.length - 1]?.toUpperCase() || ''
        const prevWord = words[words.length - 2]?.toUpperCase() || ''

        if (!lastWord && !text.endsWith(' ')) return []

        const suggestions: Suggestion[] = []

        // After FROM, JOIN, or INTO - suggest tables
        if (['FROM', 'JOIN', 'INTO', 'UPDATE', 'TABLE'].includes(prevWord)) {
            tables.forEach(table => {
                if (table.toUpperCase().startsWith(lastWord)) {
                    suggestions.push({text: table, type: 'table'})
                }
            })
        }
        // After SELECT or WHERE - suggest columns from mentioned tables
        else if (['SELECT', 'WHERE', 'SET', 'ON'].includes(prevWord) || text.includes('SELECT')) {
            const mentionedTables = words.filter(w => tables.includes(w))
            mentionedTables.forEach(table => {
                tableColumns[table]?.forEach(col => {
                    if (col.toUpperCase().startsWith(lastWord)) {
                        suggestions.push({
                            text: col,
                            type: 'column',
                            description: `from ${table}`
                        })
                    }
                })
            })
        }

        // Always suggest keywords
        SQL_KEYWORDS.forEach(keyword => {
            if (keyword.startsWith(lastWord) && !suggestions.find(s => s.text === keyword)) {
                suggestions.push({text: keyword, type: 'keyword'})
            }
        })

        return suggestions.slice(0, 10)
    }

    const updateSuggestions = (value: string) => {
        const sugs = getContextualSuggestions(value)
        setSuggestions(sugs)
        setShowSuggestions(sugs.length > 0)
        setSelectedIndex(0)
    }

    const applySuggestion = (suggestion: Suggestion) => {
        if (!inputRef.current) return

        const value = inputRef.current.value
        const words = value.split(/\s+/)
        const lastWord = words[words.length - 1] || ''

        // Replace last word with suggestion
        const newValue = value.slice(0, -lastWord.length) + suggestion.text
        inputRef.current.value = newValue
        inputRef.current.focus()

        setShowSuggestions(false)
        updateSuggestions(newValue + ' ')
    }

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
        if (showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % suggestions.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                if (suggestions.length > 0) {
                    e.preventDefault()
                    applySuggestion(suggestions[selectedIndex])
                    return
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false)
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            const command = e.currentTarget.value.trim()
            if (command.length > 0) runCommand(command)
            e.currentTarget.value = ""
            setShowSuggestions(false)
        }
    }

    const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        updateSuggestions(e.currentTarget.value)
    }

    const ResultTable = ({columns, values}: ResultTableProps) => (
        <table className="border-collapse mt-1">
            <thead>
            <tr>
                {columns.map((c) => (
                    <th key={c} className="pr-3 text-green-400 text-left">{c}</th>
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

            <div className="flex relative">
                <span className="text-green-300 mr-1">sql&gt;</span>
                <div className="relative flex-1">
                    <textarea
                        ref={inputRef}
                        onKeyDown={onKeyDown}
                        onInput={onInput}
                        className="bg-black text-green-400 outline-none resize-none w-full h-5 leading-5"
                        placeholder="Type SQL command... (Tab to autocomplete)"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute left-0 top-6 bg-gray-900 border border-green-400 rounded shadow-lg z-10 min-w-[200px]"
                        >
                            {suggestions.map((suggestion, idx) => (
                                <div
                                    key={idx}
                                    className={`px-3 py-1 cursor-pointer flex items-center justify-between ${
                                        idx === selectedIndex ? 'bg-green-900' : 'hover:bg-gray-800'
                                    }`}
                                    onClick={() => applySuggestion(suggestion)}
                                >
                                    <span className={
                                        suggestion.type === 'keyword' ? 'text-yellow-400' :
                                            suggestion.type === 'table' ? 'text-blue-400' :
                                                'text-purple-400'
                                    }>
                                        {suggestion.text}
                                    </span>
                                    {suggestion.description && (
                                        <span className="text-xs text-gray-500 ml-2">
                                            {suggestion.description}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}