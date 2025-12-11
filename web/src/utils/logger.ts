// Simple logger utility that respects DEBUG flag
// Enable with: localStorage.setItem('DEBUG', 'true') or by adding ?debug=true to URL

const isDebugEnabled = (): boolean => {
    // Check URL parameter
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.has('debug')) return true;
        
        // Check localStorage
        return localStorage.getItem('DEBUG') === 'true';
    }
    return false;
};

export const logger = {
    log: (...args: any[]) => {
        if (isDebugEnabled()) {
            console.log('[DEBUG]', ...args);
        }
    },
    warn: (...args: any[]) => {
        if (isDebugEnabled()) {
            console.warn('[DEBUG WARN]', ...args);
        }
    },
    error: (...args: any[]) => {
        if (isDebugEnabled()) {
            console.error('[DEBUG ERROR]', ...args);
        }
    },
    info: (...args: any[]) => {
        if (isDebugEnabled()) {
            console.info('[DEBUG INFO]', ...args);
        }
    },
    group: (label: string) => {
        if (isDebugEnabled()) {
            console.group(`[DEBUG] ${label}`);
        }
    },
    groupEnd: () => {
        if (isDebugEnabled()) {
            console.groupEnd();
        }
    },
    table: (data: any) => {
        if (isDebugEnabled()) {
            console.table(data);
        }
    },
};

// Enable/disable debug mode from console
if (typeof window !== 'undefined') {
    (window as any).DEBUG = {
        enable: () => localStorage.setItem('DEBUG', 'true'),
        disable: () => localStorage.removeItem('DEBUG'),
        toggle: () => {
            const current = localStorage.getItem('DEBUG') === 'true';
            localStorage.setItem('DEBUG', current ? 'false' : 'true');
            console.log(`Debug mode is now ${!current ? 'enabled' : 'disabled'}`);
        },
    };
}

export default logger;
