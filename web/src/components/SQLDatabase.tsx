import {useState, useEffect, useRef} from "react"
import {type Database} from "sql.js"
import type {State} from "../utils/state"
import PasswordPrompt from "./PasswordPrompt"
import logger from "../utils/logger"

interface HistoryEntry {
    input: string
    output: Array<{ columns: string[]; values: any[][] }> | null
    error: string | null
    connectedTo: string | null
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

interface StoryTriggers {
    onFirewallPasswordFailed: () => void;
    onStudentPasswordFound: () => void;
    onFirewall1Beaten: () => void;
    onFirewall2Beaten: () => void;
    onFirewall3Beaten: () => void;
    onFirewall4Beaten: () => void;
    onFirewall4HintNeeded: () => void;
    onBotnetDeleted: () => void;
}

function checkCommandPermissions(
    normalizedCmd: string, 
    isLocal: boolean, 
    gameState: State,
    // @ts-ignore - Used in permission checking for command context
    connectedTo: string | null
): { allowed: boolean; errorMessage: string } {
    
    const cmdType = normalizedCmd.split(' ')[0]
    
    // //THIS WHOLE SECTION COULD BE REMOVED
    // //---------------------------------------------------------------------------------------------------------------
    // const localOnlyCommands = ['SELECT', 'INSERT']
    // const remoteOnlyCommands = ['UPDATE', 'DELETE']
    
    // if (isLocal && remoteOnlyCommands.includes(cmdType)) {
    //     return {
    //         allowed: false,
    //         errorMessage: `ERROR: ${cmdType} commands can only be executed on remote connections.\nPlease CONNECT to a remote server first.`
    //     }
    // }
    
    // if (!isLocal && localOnlyCommands.includes(cmdType)) {
    //     return {
    //         allowed: false,
    //         errorMessage: `ERROR: ${cmdType} commands can only be executed on local database.\nPlease DISCONNECT from remote server first.`
    //     }
    // }
    // //-------------------------------------*END OF REMOVABLE SECTION *---------------------------------------------
    
    if (normalizedCmd.includes('LOGS')) {
        if (!gameState.storyProgress.unlocked_any_router) {
            return {
                allowed: false,
                errorMessage: 'ERROR: Access to Logs table denied.\nYou need to unlock a router first to access network logs.'
            }
        }
    }
    
    if (normalizedCmd.includes('ALL_IPS')) {
        if (!gameState.storyProgress.unlocked_pc_1 && !gameState.storyProgress.unhashed_level_1_passwords) {
            return {
                allowed: false,
                errorMessage: 'ERROR: Table All_IPs not found.\nHint: You may discover this table in PC files.'
            }
        }
    }
    
    if (normalizedCmd.includes('HINTS')) {
        if (!gameState.emails.it_expert_3.read && !gameState.emails.it_expert_3.shown) {
            return {
                allowed: false,
                errorMessage: 'ERROR: Table Hints not found.\nWait for more information from the IT expert.'
            }
        }
    }
    
    if (!isLocal && cmdType === 'UPDATE') {
        if (normalizedCmd.includes('FIREWALL')) {
            if (normalizedCmd.includes('LEVEL') && normalizedCmd.includes('1')) {
                return { allowed: true, errorMessage: '' }
            }
            if (normalizedCmd.includes('LEVEL') && normalizedCmd.includes('2')) {
                if (!gameState.storyProgress.firewall_1_beaten) {
                    return {
                        allowed: false,
                        errorMessage: 'ERROR: Cannot access Firewall level 2.\nYou must deactivate level 1 first.'
                    }
                }
            }
            if (normalizedCmd.includes('LEVEL') && normalizedCmd.includes('3')) {
                if (!gameState.storyProgress.firewall_2_beaten) {
                    return {
                        allowed: false,
                        errorMessage: 'ERROR: Cannot access Firewall level 3.\nYou must deactivate level 2 first.'
                    }
                }
            }
            if (normalizedCmd.includes('LEVEL') && normalizedCmd.includes('4')) {
                if (!gameState.storyProgress.firewall_3_beaten) {
                    return {
                        allowed: false,
                        errorMessage: 'ERROR: Cannot access Firewall level 4.\nYou must deactivate level 3 first.'
                    }
                }
            }
        }
        
        if (normalizedCmd.includes('ROUTERS')) {
            if (!gameState.storyProgress.unhashed_level_1_passwords) {
                return {
                    allowed: false,
                    errorMessage: 'ERROR: Access to Routers table denied.\nYou need higher clearance to modify routers.'
                }
            }
        }
        
        if (normalizedCmd.includes('USERS') && normalizedCmd.includes('AES_DECRYPT')) {
            return { allowed: false, errorMessage: 'ERROR: Cannot modify Users table on remote connection.\nPlease DISCONNECT first.' }
        }
    }
    
    if (cmdType === 'DELETE') {
        if (normalizedCmd.includes('DIRECTORIES')) {
            if (!gameState.storyProgress.firewall_4_beaten) {
                return {
                    allowed: false,
                    errorMessage: 'ERROR: Access denied. All firewall levels must be deactivated first.'
                }
            }
            if (!gameState.storyProgress.identified_infected_pc) {
                return {
                    allowed: false,
                    errorMessage: 'ERROR: Cannot delete files without proper authorization.\nIdentify the infected PC first.'
                }
            }
        }
    }
    
    return { allowed: true, errorMessage: '' }
}

export default function SqlJsPage(props: { 
    loadedDb: Database | null; 
    storyTriggers: StoryTriggers;
    gameState: State;
}) {
    const [db, setDb] = useState<Database | null>(null)
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0 })
    const [tables, setTables] = useState<string[]>([])
    const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({})
    const [connectedTo, setConnectedTo] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [userPermission, setUserPermission] = useState<number>(0)
    const [pendingCommand, setPendingCommand] = useState<string | null>(null)
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
    const [showConnectionPrompt, setShowConnectionPrompt] = useState(true)
    const [connectionIp, setConnectionIp] = useState('')
    const [connectionError, setConnectionError] = useState('')
    const [passwordContext, setPasswordContext] = useState<'firewall' | 'pc_access' | 'router' | null>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    const SQL_KEYWORDS = [
        'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
        'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'LEFT', 'RIGHT',
        'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'LIMIT',
        'OFFSET', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'BETWEEN',
        'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'HAVING', 'CONNECT', 'DISCONNECT',
        'AES_ENCRYPT', 'AES_DECRYPT'
    ]

    useEffect(() => {
        if (!props.loadedDb) return

        setDb(props.loadedDb)

        try {
            const tablesResult = props.loadedDb.exec(
                "SELECT name FROM sqlite_master WHERE type='table'"
            )
            if (tablesResult.length > 0) {
                const tableNames = tablesResult[0].values.map(row => row[0] as string)
                setTables(tableNames)

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
            logger.error('Error loading schema:', err)
        }
    }, [props.loadedDb])

    const getContextualSuggestions = (text: string): Suggestion[] => {
        const words = text.trim().split(/\s+/)
        const lastWord = words[words.length - 1]?.toUpperCase() || ''
        const prevWord = words[words.length - 2]?.toUpperCase() || ''

        // THIS SHOULD PREVENT FURTHER SUGGESTING A WORD, TAHT IS ALREADY TYPED IN
        // THUS ALLOWING THE USER TO RUN THE CODE WITHOUT ADDING ";" AT THE END
    
        if (SQL_KEYWORDS.includes(lastWord)) return []

        if (!lastWord && !text.endsWith(' ')) return []

        const suggestions: Suggestion[] = []

        // After FROM, JOIN, or INTO - suggest tables
        if (['FROM', 'JOIN', 'INTO', 'UPDATE', 'TABLE'].includes(prevWord)) {
            tables.forEach(table => {
                // THIS SHOULD PREVENT FURTHER SUGGESTING A WORD, TAHT IS ALREADY TYPED IN
                // THUS ALLOWING THE USER TO RUN THE CODE WITHOUT ADDING ";" AT THE END
    
                if (table === lastWord) return []

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
                        // THIS SHOULD PREVENT FURTHER SUGGESTING A WORD, TAHT IS ALREADY TYPED IN
                        // THUS ALLOWING THE USER TO RUN THE CODE WITHOUT ADDING ";" AT THE END
    
                        if (col === lastWord) return []

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
        
        // Calculate cursor position for suggestions dropdown
        if (inputRef.current && sugs.length > 0) {
            const textarea = inputRef.current
            const cursorPos = textarea.selectionStart
            const textBeforeCursor = value.substring(0, cursorPos)
            const lines = textBeforeCursor.split('\n')
            const currentLine = lines.length - 1
            const lineHeight = 20 // Matches the leading-5 class (1.25rem * 16px = 20px)
            
            setSuggestionsPosition({
                top: (currentLine + 1) * lineHeight,
                left: 0
            })
        }
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

    const handlePasswordSubmit = (password: string) => {
        if (!db || !pendingCommand) return

        const normalizedPendingCmd = pendingCommand.trim().replace(/\s+/g, ' ').toUpperCase()
        
        // Close the password prompt
        setShowPasswordPrompt(false)
            
        // Handle firewall password on remote connection
        if (connectedTo && connectedTo !== '174.156.12.4' && passwordContext === 'firewall') {
                // Check if it's an UPDATE Firewall command
                if (normalizedPendingCmd.includes('UPDATE') && 
                    normalizedPendingCmd.includes('FIREWALL')) {
                    
                    // Extract the firewall level from the command
                    const levelMatch = pendingCommand.match(/level\s*=\s*(\d+)/i)
                    const level = levelMatch ? parseInt(levelMatch[1]) : null
                    
                    if (!level) {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: 'ERROR: Cannot determine firewall level',
                                connectedTo: connectedTo,
                            },
                        ])
                        setPendingCommand(null)
                        setPasswordContext(null)
                        return
                    }
                    
                    // Get the correct password from game state
                    let correctPassword: string | null = null
                    if (level === 1) correctPassword = props.gameState.misc.known_firewall_passwords.f1
                    else if (level === 2) correctPassword = props.gameState.misc.known_firewall_passwords.f2
                    else if (level === 3) correctPassword = props.gameState.misc.known_firewall_passwords.f3
                    else if (level === 4) correctPassword = props.gameState.misc.known_firewall_passwords.f4
                    
                    // Check if player knows the password yet
                    if (!correctPassword) {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: 'ACCESS DENIED\nIncorrect password',
                                connectedTo: connectedTo,
                            },
                        ])
                        setPendingCommand(null)
                        setPasswordContext(null)
                        
                        // Trigger the story event for failed password
                        if (level === 1) {
                            props.storyTriggers.onFirewallPasswordFailed()
                        }
                        
                        return
                    }
                    
                    // Validate the entered password
                    if (password !== correctPassword) {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: 'ACCESS DENIED\nIncorrect password',
                                connectedTo: connectedTo,
                            },
                        ])
                        setPendingCommand(null)
                        setPasswordContext(null)
                        return
                    }
                    
                    // Password is correct - execute the UPDATE command
                    try {
                        db!.exec(pendingCommand)
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: `ACCESS PERMITTED\nFirewall level ${level} deactivated`,
                                connectedTo: connectedTo,
                            },
                        ])
                        
                        // Trigger story events for successful firewall deactivation
                        if (level === 1) props.storyTriggers.onFirewall1Beaten()
                        else if (level === 2) props.storyTriggers.onFirewall2Beaten()
                        else if (level === 3) props.storyTriggers.onFirewall3Beaten()
                        else if (level === 4) props.storyTriggers.onFirewall4Beaten()
                        
                    } catch (err) {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: err instanceof Error ? err.toString() : String(err),
                                connectedTo: connectedTo,
                            },
                        ])
                    }
                    
                    setPendingCommand(null)
                    setPasswordContext(null)
                    return
                }
            }
            
            // Handle PC access password (INSERT INTO User_has_access_to_PC)
            if (passwordContext === 'pc_access' && normalizedPendingCmd.includes('INSERT')) {
                // Extract username from the INSERT command
                // Expected format: INSERT INTO User_has_access_to_PC VALUES ("ip", "username")
                // Or: INSERT INTO User_has_access_to_PC VALUES ("username", "ip") depending on column order
                // Table definition: user, pc
                const valuesMatch = pendingCommand.match(/VALUES\s*\(\s*["']?([^"',)]+)["']?\s*,\s*["']?([^"',)]+)["']?\s*\)/i)
                
                if (!valuesMatch) {
                    setHistory((prev) => [
                        ...prev,
                        {
                            input: '',
                            output: null,
                            error: 'Invalid INSERT statement format',
                            connectedTo: connectedTo,
                        },
                    ])
                    setPendingCommand(null)
                    setPasswordContext(null)
                    return
                }
                
                // Check which value is the username by trying both
                let username = valuesMatch[1]
                let passwordQuery = `SELECT password FROM User WHERE name = '${username}'`
                
                // Query the database for the user's password
                try {
                    let result = db!.exec(passwordQuery)
                    
                    // If first value didn't match a user, try the second value
                    if (result.length === 0 || result[0].values.length === 0) {
                        username = valuesMatch[2]
                        passwordQuery = `SELECT password FROM User WHERE name = '${username}'`
                        result = db!.exec(passwordQuery)
                    }
                    
                    if (result.length === 0 || result[0].values.length === 0) {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: 'ACCESS DENIED\nUser not found',
                                connectedTo: connectedTo,
                            },
                        ])
                        setPendingCommand(null)
                        setPasswordContext(null)
                        return
                    }
                    
                    const correctPassword = result[0].values[0][0] as string
                    
                    if (password !== correctPassword) {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: 'ACCESS DENIED\nIncorrect password',
                                connectedTo: connectedTo,
                            },
                        ])
                        setPendingCommand(null)
                        setPasswordContext(null)
                        return
                    }
                    
                    // Password is correct - reconstruct and execute the INSERT command with proper quoting
                    // This fixes cases where user typed VALUES ("ip", student) without quotes
                    const ip = valuesMatch[1] === username ? valuesMatch[2] : valuesMatch[1]
                    const correctedInsert = `INSERT INTO User_has_access_to_PC VALUES ('${username}', '${ip}')`
                    
                    try {
                        db!.exec(correctedInsert)
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: 'PC access granted',
                                connectedTo: connectedTo,
                            },
                        ])
                        
                        // TODO: Trigger story event for PC unlock
                    } catch (execErr) {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: '',
                                output: null,
                                error: execErr instanceof Error ? execErr.toString() : String(execErr),
                                connectedTo: connectedTo,
                            },
                        ])
                    }
                    
                } catch (err) {
                    setHistory((prev) => [
                        ...prev,
                        {
                            input: '',
                            output: null,
                            error: err instanceof Error ? err.toString() : String(err),
                            connectedTo: connectedTo,
                        },
                    ])
                }
                
                setPendingCommand(null)
                setPasswordContext(null)
                return
            }
            
            // Handle router password
            if (passwordContext === 'router' && normalizedPendingCmd.includes('UPDATE')) {
                // Extract router IP from the command
                const ipMatch = pendingCommand.match(/ip\s*=\s*["']([^"']+)["']/i)
                const routerIp = ipMatch ? ipMatch[1] : null
                
                if (!routerIp) {
                    setHistory((prev) => [
                        ...prev,
                        {
                            input: '',
                            output: null,
                            error: 'ERROR: Cannot determine router IP',
                            connectedTo: connectedTo,
                        },
                    ])
                    setPendingCommand(null)
                    setPasswordContext(null)
                    return
                }
                
                // Check if player knows the router password
                const correctPassword = props.gameState.misc.known_router_password
                
                if (!correctPassword || password !== correctPassword) {
                    setHistory((prev) => [
                        ...prev,
                        {
                            input: '',
                            output: null,
                            error: 'ACCESS DENIED\nIncorrect password',
                            connectedTo: connectedTo,
                        },
                    ])
                    setPendingCommand(null)
                    setPasswordContext(null)
                    return
                }
                
                // Password is correct - execute the UPDATE command
                try {
                    db!.exec(pendingCommand)
                    setHistory((prev) => [
                        ...prev,
                        {
                            input: '',
                            output: null,
                            error: `ACCESS TO ${routerIp} PERMITTED`,
                            connectedTo: connectedTo,
                        },
                    ])
                    
                    // Update game state to track unlocked router
                    props.gameState.storyProgress.unlocked_any_router = true
                    
                } catch (err) {
                    setHistory((prev) => [
                        ...prev,
                        {
                            input: '',
                            output: null,
                            error: err instanceof Error ? err.toString() : String(err),
                            connectedTo: connectedTo,
                        },
                    ])
                }
                
                setPendingCommand(null)
                setPasswordContext(null)
                return
            }
            
            // If we got here, cleanup
            setPendingCommand(null)
            setPasswordContext(null)
        }

        const handlePasswordCancel = () => {
            setShowPasswordPrompt(false)
            setPendingCommand(null)
            setPasswordContext(null)
            
            // Optionally show cancelled message in history
            setHistory((prev) => [
                ...prev,
                {
                    input: '',
                    output: null,
                    error: 'Password prompt cancelled',
                    connectedTo: connectedTo,
                },
            ])
        }

    const runCommand = (cmd: string) => {
        if (!db) return
        
        const normalizedCmd = cmd.trim().replace(/\s+/g, ' ').toUpperCase()
        
        // Allow only CONNECT command when not connected
        if (!connectedTo && !normalizedCmd.startsWith('CONNECT')) {
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: 'ERROR: Not connected to any database.\nUse CONNECT <ip_address> to connect first.',
                    connectedTo: null,
                },
            ])
            return
        }
        
        const isLocal = !connectedTo || connectedTo === '174.156.12.4'

        // Handle LOGIN command
        if (cmd.toUpperCase().startsWith('LOGIN')) {
            const parts = cmd.trim().split(/\s+/)
            const username = parts[1]
            const password = parts[2]
            
            if (!username || !password) {
                setHistory((prev) => [
                    ...prev,
                    {
                        input: cmd,
                        output: null,
                        error: 'Usage: LOGIN <username> <password>',
                        connectedTo: connectedTo,
                    },
                ])
                return
            }
            
            try {
                // Query user from database
                const userQuery = `SELECT name, password, permission FROM User WHERE name = '${username}'`
                const result = db.exec(userQuery)
                
                if (result.length === 0 || result[0].values.length === 0) {
                    setHistory((prev) => [
                        ...prev,
                        {
                            input: cmd,
                            output: null,
                            error: 'LOGIN FAILED\nUser not found',
                            connectedTo: connectedTo,
                        },
                    ])
                    return
                }
                
                const userData = result[0].values[0]
                const dbPassword = userData[1] as string
                const permission = userData[2] as number
                
                // Check password (handle both plain and encrypted)
                if (password !== dbPassword) {
                    // Try decrypting if it's encrypted
                    try {
                        const decryptQuery = `SELECT AES_DECRYPT('${dbPassword}', '${password.length}')`
                        const decryptResult = db.exec(decryptQuery)
                        const decrypted = decryptResult[0]?.values[0]?.[0] as string
                        
                        if (decrypted !== password) {
                            setHistory((prev) => [
                                ...prev,
                                {
                                    input: cmd,
                                    output: null,
                                    error: 'LOGIN FAILED\nIncorrect password',
                                    connectedTo: connectedTo,
                                },
                            ])
                            return
                        }
                    } catch {
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: cmd,
                                output: null,
                                error: 'LOGIN FAILED\nIncorrect password',
                                connectedTo: connectedTo,
                            },
                        ])
                        return
                    }
                }
                
                // Login successful
                setCurrentUser(username)
                setUserPermission(permission)
                setHistory((prev) => [
                    ...prev,
                    {
                        input: cmd,
                        output: null,
                        error: null,
                        connectedTo: connectedTo,
                    },
                ])
                setHistory((prev) => [
                    ...prev,
                    {
                        input: '',
                        output: null,
                        error: `LOGIN SUCCESSFUL\nWelcome ${username}\nPermission level: ${permission}`,
                        connectedTo: connectedTo,
                    },
                ])
                return
            } catch (err) {
                setHistory((prev) => [
                    ...prev,
                    {
                        input: cmd,
                        output: null,
                        error: `LOGIN ERROR\n${err instanceof Error ? err.message : String(err)}`,
                        connectedTo: connectedTo,
                    },
                ])
                return
            }
        }

        // Check permissions based on story progress and connection context
        const permissionCheck = checkCommandPermissions(normalizedCmd, isLocal, props.gameState, connectedTo)
        if (!permissionCheck.allowed) {
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: permissionCheck.errorMessage,
                    connectedTo: connectedTo,
                },
            ])
            return
        }

        // Handle CONNECT command
        if (cmd.toUpperCase().startsWith('CONNECT')) {
            const parts = cmd.trim().split(/\s+/)
            const address = parts[1] || '174.156.12.4'
            
            // Validate IP address format
            const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
            const match = address.match(ipPattern)
            
            if (!match) {
                setConnectionError('Invalid IP address format. Expected: xxx.xxx.xxx.xxx')
                setHistory((prev) => [
                    ...prev,
                    {
                        input: cmd,
                        output: null,
                        error: 'Invalid IP address format. Expected format: xxx.xxx.xxx.xxx',
                        connectedTo: null,
                    },
                ])
                return
            }
            
            // Check each octet is between 0-255
            const octets = [match[1], match[2], match[3], match[4]].map(Number)
            if (octets.some(octet => octet > 255)) {
                setConnectionError('Invalid IP address. Each octet must be between 0 and 255.')
                setHistory((prev) => [
                    ...prev,
                    {
                        input: cmd,
                        output: null,
                        error: 'Invalid IP address. Each octet must be between 0 and 255.',
                        connectedTo: null,
                    },
                ])
                return
            }
            
            // Check if user has permission to access this PC
            if (address !== '174.156.12.4') {
                try {
                    // Get PC permission level
                    const pcQuery = `SELECT permission FROM PC WHERE IP = '${address}'`
                    const pcResult = db.exec(pcQuery)
                    
                    if (pcResult.length === 0 || pcResult[0].values.length === 0) {
                        setConnectionError('PC not found in network')
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: cmd,
                                output: null,
                                error: 'ERROR: PC not found in network',
                                connectedTo: null,
                            },
                        ])
                        return
                    }
                    
                    const pcPermission = pcResult[0].values[0][0] as number
                    
                    // Check if current user has sufficient permission
                    if (currentUser && userPermission < pcPermission) {
                        setConnectionError(`Access denied: insufficient permissions (required: ${pcPermission}, you have: ${userPermission})`)
                        setHistory((prev) => [
                            ...prev,
                            {
                                input: cmd,
                                output: null,
                                error: `ACCESS DENIED\nInsufficient permissions to access ${address}\nRequired permission level: ${pcPermission}\nYour permission level: ${userPermission}`,
                                connectedTo: null,
                            },
                        ])
                        return
                    }
                } catch (err) {
                    logger.error('Error checking PC permissions:', err)
                }
            }
            
            setConnectedTo(address)
            setConnectionError('')
            setConnectionIp('')
            setShowConnectionPrompt(false)
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: null,
                    connectedTo: null,
                },
            ])
            return
        }

        // Handle DISCONNECT command
        if (cmd.toUpperCase().startsWith('DISCONNECT')) {
            const previousConnection = connectedTo
            setConnectedTo(null)
            setShowConnectionPrompt(true)
            setConnectionIp('')
            setConnectionError('')
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: null,
                    connectedTo: previousConnection,
                },
            ])
            return
        }
        
        // Intercept SELECT queries on Content table to filter based on story progress
        if (normalizedCmd.includes('SELECT') && normalizedCmd.includes('FROM CONTENT')) {
            // Determine which content IDs should be visible based on firewall progress
            let maxContentId = 0 // Content 0 (firewall 1 password) is always visible
            
            if (props.gameState.storyProgress.firewall_1_beaten) maxContentId = 1 // Content 1 (hashing hint)
            if (props.gameState.storyProgress.firewall_2_beaten) maxContentId = 2 // Content 2 (All_IPs hint)
            if (props.gameState.storyProgress.firewall_3_beaten) maxContentId = 3 // Content 3 (router password hint)
            
            // Modify the query to add WHERE clause filtering
            let modifiedCmd = cmd
            
            // Check if there's already a WHERE clause
            if (normalizedCmd.includes('WHERE')) {
                // Add AND condition to existing WHERE clause
                modifiedCmd = cmd.replace(/WHERE/i, `WHERE id <= ${maxContentId} AND`)
            } else {
                // Check if there's an ORDER BY, LIMIT, or end of statement
                if (normalizedCmd.includes('ORDER BY')) {
                    modifiedCmd = cmd.replace(/ORDER BY/i, `WHERE id <= ${maxContentId} ORDER BY`)
                } else if (normalizedCmd.includes('LIMIT')) {
                    modifiedCmd = cmd.replace(/LIMIT/i, `WHERE id <= ${maxContentId} LIMIT`)
                } else if (normalizedCmd.includes('GROUP BY')) {
                    modifiedCmd = cmd.replace(/GROUP BY/i, `WHERE id <= ${maxContentId} GROUP BY`)
                } else {
                    // No special clauses, just append WHERE at the end
                    modifiedCmd = cmd.trim()
                    if (modifiedCmd.endsWith(';')) {
                        modifiedCmd = modifiedCmd.slice(0, -1) + ` WHERE id <= ${maxContentId};`
                    } else {
                        modifiedCmd = modifiedCmd + ` WHERE id <= ${maxContentId}`
                    }
                }
            }
            
            // Execute the modified command instead
            cmd = modifiedCmd
        }

        // Check if INSERT INTO User_has_access_to_PC requires password
        if (normalizedCmd.includes('INSERT') && normalizedCmd.includes('USER_HAS_ACCESS_TO_PC')) {
            // Show the command in history
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: null,
                    connectedTo: connectedTo,
                },
            ])
            
            setPendingCommand(cmd)
            setPasswordContext('pc_access')
            setShowPasswordPrompt(true)
            return
        }

        // Check if UPDATE Routers requires password
        if (normalizedCmd.includes('UPDATE') && normalizedCmd.includes('ROUTERS')) {
            // Show the command in history
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: null,
                    connectedTo: connectedTo,
                },
            ])
            
            setPendingCommand(cmd)
            setPasswordContext('router')
            setShowPasswordPrompt(true)
            return
        }

        // Check if UPDATE Firewall command requires password (remote only)
        if (connectedTo && connectedTo !== '174.156.12.4' && normalizedCmd.includes('UPDATE') && normalizedCmd.includes('FIREWALL')) {
            // Show the command in history
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: null,
                    connectedTo: connectedTo,
                },
            ])
            
            setPendingCommand(cmd)
            setPasswordContext('firewall')
            setShowPasswordPrompt(true)
            return
        }
        
        // Check if UPDATE command requires password (remote only, non-firewall)
        if (connectedTo && connectedTo !== '174.156.12.4' && normalizedCmd.includes('UPDATE') && !normalizedCmd.includes('FIREWALL')) {
            // Show the command in history
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: null,
                    connectedTo: connectedTo,
                },
            ])
            
            setPendingCommand(cmd)
            setPasswordContext('firewall')
            setShowPasswordPrompt(true)
            return
        }

        try {
            const result = db.exec(cmd)
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: result,
                    error: null,
                    connectedTo: connectedTo,
                },
            ])
            
            // Check query results for story triggers
            checkQueryResults(cmd, result, normalizedCmd)
            
        } catch (err) {
            setHistory((prev) => [
                ...prev,
                {
                    input: cmd,
                    output: null,
                    error: err instanceof Error ? err.toString() : String(err),
                    connectedTo: connectedTo,
                },
            ])
        }
    }
    
    const checkQueryResults = (_cmd: string, result: Array<{ columns: string[]; values: any[][] }>, normalizedCmd: string) => {
        // Detect student password query (SELECT password FROM User WHERE name = 'student')
        // Check if query selects password from User table and references 'student' user
        if (normalizedCmd.includes('SELECT') && 
            normalizedCmd.includes('PASSWORD') && 
            normalizedCmd.includes('USER') &&
            (normalizedCmd.includes('STUDENT') || normalizedCmd.includes("'STUDENT'") || normalizedCmd.includes('"STUDENT"'))) {
            if (result.length > 0 && result[0].values.length > 0) {
                const password = result[0].values[0][0]
                if (String(password).toLowerCase() === 'student' && !props.gameState.storyProgress.found_student_password) {
                    props.gameState.storyProgress.found_student_password = true
                    props.storyTriggers.onStudentPasswordFound()
                }
            }
        }
        
        // Detect file content queries (SELECT content FROM Directories or Content)
        if (normalizedCmd.includes('SELECT') && normalizedCmd.includes('CONTENT')) {
            if (result.length > 0 && result[0].values.length > 0) {
                // Check each row of content for password hints
                for (const row of result[0].values) {
                    const originalContent = String(row[0] || '')
                    const content = originalContent.toLowerCase()
                    
                    // Check for firewall level 1 password patterns
                    // Example: "firewall level 1 password: xyz123"
                    // Use case-insensitive search but extract from original content to preserve case
                    const fw1Match = content.match(/firewall\s+level\s+1\s+password[:\s]+([^\s\n]+)/i)
                    if (fw1Match && !props.gameState.misc.known_firewall_passwords.f1) {
                        // Extract password from original content at the same position
                        const matchIndex = content.indexOf(fw1Match[0])
                        const passwordStart = content.indexOf(fw1Match[1], matchIndex)
                        const password = originalContent.substring(passwordStart, passwordStart + fw1Match[1].length)
                        // Update game state with discovered password
                        props.gameState.misc.known_firewall_passwords.f1 = password
                        // Note: In a real app, you'd use a proper state setter
                        // For now this mutates the state directly which will work
                    }
                    
                    // Similar patterns for other firewall levels
                    const fw2Match = content.match(/firewall\s+level\s+2\s+password[:\s]+([^\s\n]+)/i)
                    if (fw2Match && !props.gameState.misc.known_firewall_passwords.f2) {
                        const matchIndex = content.indexOf(fw2Match[0])
                        const passwordStart = content.indexOf(fw2Match[1], matchIndex)
                        props.gameState.misc.known_firewall_passwords.f2 = originalContent.substring(passwordStart, passwordStart + fw2Match[1].length)
                    }
                    
                    const fw3Match = content.match(/firewall\s+level\s+3\s+password[:\s]+([^\s\n]+)/i)
                    if (fw3Match && !props.gameState.misc.known_firewall_passwords.f3) {
                        const matchIndex = content.indexOf(fw3Match[0])
                        const passwordStart = content.indexOf(fw3Match[1], matchIndex)
                        props.gameState.misc.known_firewall_passwords.f3 = originalContent.substring(passwordStart, passwordStart + fw3Match[1].length)
                    }
                    
                    const fw4Match = content.match(/firewall\s+level\s+4\s+password[:\s]+([^\s\n]+)/i)
                    if (fw4Match && !props.gameState.misc.known_firewall_passwords.f4) {
                        const matchIndex = content.indexOf(fw4Match[0])
                        const passwordStart = content.indexOf(fw4Match[1], matchIndex)
                        props.gameState.misc.known_firewall_passwords.f4 = originalContent.substring(passwordStart, passwordStart + fw4Match[1].length)
                    }
                }
            }
        }
        
        // Detect hashing key query (SELECT COUNT(*) FROM PCs)
        if (normalizedCmd.includes('SELECT') && normalizedCmd.includes('COUNT') && normalizedCmd.includes('PCS')) {
            if (result.length > 0 && result[0].values.length > 0) {
                const count = result[0].values[0][0]
                if (!props.gameState.misc.known_hashing_key) {
                    props.gameState.misc.known_hashing_key = String(count)
                    props.gameState.storyProgress.found_hashing_key = true
                }
            }
        }
        
        // Detect router password query (SUM of levels for users starting with 'F')
        if (normalizedCmd.includes('SELECT') && normalizedCmd.includes('SUM') && normalizedCmd.includes('LEVEL') && 
            (normalizedCmd.includes('LIKE') || normalizedCmd.includes('F%'))) {
            if (result.length > 0 && result[0].values.length > 0) {
                const sum = result[0].values[0][0]
                if (!props.gameState.misc.known_router_password) {
                    props.gameState.misc.known_router_password = String(sum)
                    props.gameState.storyProgress.found_router_password = true
                }
            }
        }
        
        // Detect successful botnet script deletion
        if (normalizedCmd.includes('DELETE') && normalizedCmd.includes('DIRECTORIES')) {
            // Check if this is deleting the botnet script file
            // The script should specify which file ID is the botnet
            // For now, we'll trigger if the DELETE was successful (no error thrown)
            if (!props.gameState.storyProgress.deleted_botnet_script) {
                props.gameState.storyProgress.deleted_botnet_script = true
                props.storyTriggers.onBotnetDeleted()
            }
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
            } else if (e.key === 'Tab') {
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
            e.currentTarget.style.height = 'auto'
            setShowSuggestions(false)
        }
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
                        <span className="text-green-300">{currentUser ? `${currentUser}@${entry.connectedTo || 'sql'}` : (entry.connectedTo ? `${entry.connectedTo}@sql` : 'sql')}&gt;</span>{" "}
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
                    
                    {entry.input.toUpperCase().startsWith('CONNECT') && !entry.error && (
                        <div className="text-green-400">Connected successfully to {entry.input.trim().split(/\s+/)[1] || '174.156.12.4'}</div>
                    )}
                    
                    {entry.input.toUpperCase().startsWith('DISCONNECT') && !entry.error && (
                        <div className="text-green-400">Disconnected successfully</div>
                    )}
                </div>
            ))}

            <div className="flex relative">
                <span className="text-green-300 mr-1">{currentUser ? `${currentUser}@${connectedTo || 'sql'}` : (connectedTo ? `${connectedTo}@sql` : 'sql')}&gt;</span>
                <div className="relative flex-1">
                    <textarea
                        ref={inputRef}
                        onKeyDown={onKeyDown}
                        onInput={(e) => {
                            const target = e.currentTarget;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                            updateSuggestions(target.value);
                        }}
                        className="bg-black text-green-400 outline-none resize-none w-full min-h-[20px] leading-5"
                        placeholder="Type SQL command... (Shift+Enter for new line, Enter to execute)"
                        rows={1}
                        style={{height: 'auto'}}
                    />

                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            ref={suggestionsRef}
                            className="absolute left-0 bg-gray-900 border border-green-400 rounded shadow-lg z-10 min-w-[200px]"
                            style={{
                                top: `${suggestionsPosition.top}px`,
                                left: `${suggestionsPosition.left}px`
                            }}
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
            
            {showConnectionPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border-2 border-green-400 rounded p-6 min-w-[400px]">
                        <h2 className="text-green-400 text-xl mb-4 font-bold">ENTER AN IP TO CONNECT TO SQL TERMINAL</h2>
                        <input
                            type="text"
                            value={connectionIp}
                            onChange={(e) => {
                                setConnectionIp(e.target.value)
                                setConnectionError('')
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (connectionIp.trim()) {
                                        runCommand(`CONNECT ${connectionIp.trim()}`);
                                    }
                                }
                            }}
                            className="w-full bg-black text-green-400 border border-green-400 rounded px-3 py-2 outline-none focus:border-green-300"
                            placeholder="e.g., 174.156.12.4"
                            autoFocus
                        />
                        {connectionError && (
                            <div className="text-red-500 text-sm mt-2 mb-2">{connectionError}</div>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    if (connectionIp.trim()) {
                                        runCommand(`CONNECT ${connectionIp.trim()}`);
                                    }
                                }}
                                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {showPasswordPrompt && (
                <PasswordPrompt 
                    onSubmit={handlePasswordSubmit}
                    onCancel={handlePasswordCancel}
                />
            )}
        </div>
    )
}