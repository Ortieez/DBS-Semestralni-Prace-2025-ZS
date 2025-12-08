import type { State } from "./state";

export type StoryEvent = {
    type: "cutscene" | "email" | "wait_for_email_read";
    id: string;
    nextEvent?: string | null; // null means end of chain
};

export type StoryChain = {
    [key: string]: StoryEvent;
};


export const storyFlow: StoryChain = {
    // ========== PHASE 0: INTRO ==========
    
    // Game starts with intro cutscene
    start: {
        type: "cutscene",
        id: "intro",
        nextEvent: "email_rector_1"
    },
    
    // Email 1: The Call to Adventure
    email_rector_1: {
        type: "email",
        id: "rector_1",
        nextEvent: "wait_email_rector_1"
    },
    
    wait_email_rector_1: {
        type: "wait_for_email_read",
        id: "rector_1",
        nextEvent: "cutscene_narrative_bridge"
    },
    
    // Narrative bridge cutscene
    cutscene_narrative_bridge: {
        type: "cutscene",
        id: "narrative_bridge",
        nextEvent: "email_it_expert_1"
    },
    
    // Email 2: The Briefing
    email_it_expert_1: {
        type: "email",
        id: "it_expert_1",
        nextEvent: "wait_email_it_expert_1"
    },
    
    wait_email_it_expert_1: {
        type: "wait_for_email_read",
        id: "it_expert_1",
        nextEvent: "cutscene_firewall_warning"
    },
    
    // Player focused cutscene
    cutscene_firewall_warning: {
        type: "cutscene",
        id: "firewall_warning",
        nextEvent: null // Player now plays Phase 1 - no auto progression until they trigger events
    },
    
    // ========== PHASE 1: GETTING STARTED (Tutorial) ==========
    // These events are triggered by game actions, not automatically
    
    // Email 3: Hint about password protection (triggered when player fails firewall password)
    email_it_expert_2: {
        type: "email",
        id: "it_expert_2",
        nextEvent: "wait_email_it_expert_2"
    },
    
    wait_email_it_expert_2: {
        type: "wait_for_email_read",
        id: "it_expert_2",
        nextEvent: null // Continue playing
    },
    
    // Email 4: Hint system (triggered when player finds student password or unlocks PC)
    email_it_expert_3: {
        type: "email",
        id: "it_expert_3",
        nextEvent: "wait_email_it_expert_3"
    },
    
    wait_email_it_expert_3: {
        type: "wait_for_email_read",
        id: "it_expert_3",
        nextEvent: null // Continue playing
    },
    
    // ========== PHASE 2: BREAKING THE NETWORK ==========
    
    // Email 5: Escalation (triggered when firewall level 1 is beaten)
    email_it_expert_4: {
        type: "email",
        id: "it_expert_4",
        nextEvent: "wait_email_it_expert_4"
    },
    
    wait_email_it_expert_4: {
        type: "wait_for_email_read",
        id: "it_expert_4",
        nextEvent: null // Continue playing
    },
    
    // ========== PHASE 3: THE INVESTIGATION (Source Tracking) ==========
    
    // Email 6: Logs (triggered when router is unlocked and firewall level 2 is beaten)
    email_it_expert_5: {
        type: "email",
        id: "it_expert_5",
        nextEvent: "wait_email_it_expert_5"
    },
    
    wait_email_it_expert_5: {
        type: "wait_for_email_read",
        id: "it_expert_5",
        nextEvent: null // Continue playing
    },
    
    // ========== PHASE 4: THE PAYLOAD (Logic & Recursion) ==========
    
    // Email 7: The Files (triggered when infected PC is identified and firewall level 3 is beaten)
    email_it_expert_7: {
        type: "email",
        id: "it_expert_7",
        nextEvent: "wait_email_it_expert_7"
    },
    
    wait_email_it_expert_7: {
        type: "wait_for_email_read",
        id: "it_expert_7",
        nextEvent: null // Continue playing
    },
    
    // Email about firewall level 4 (can be triggered during phase 4)
    email_it_expert_6: {
        type: "email",
        id: "it_expert_6",
        nextEvent: "wait_email_it_expert_6"
    },
    
    wait_email_it_expert_6: {
        type: "wait_for_email_read",
        id: "it_expert_6",
        nextEvent: null // Continue playing
    },
    
    // ========== FINALE ==========
    
    // Victory cutscene (triggered when botnet is deleted)
    cutscene_victory: {
        type: "cutscene",
        id: "victory",
        nextEvent: null // End of game
    }
};

/**
 * Story Manager Class
 * Handles story progression and determines what should happen next
 */
export class StoryManager {
    private currentEvent: string;
    private state: State;
    
    constructor(state: State, startEvent: string = "start") {
        this.state = state;
        this.currentEvent = startEvent;
    }
    
    /**
     * Update the internal state reference
     */
    updateState(state: State) {
        this.state = state;
    }
    
    /**
     * Get the current event
     */
    getCurrentEvent(): StoryEvent | null {
        return storyFlow[this.currentEvent] || null;
    }
    
    /**
     * Get the current event key
     */
    getCurrentEventKey(): string {
        return this.currentEvent;
    }
    
    /**
     * Move to the next event in the chain
     */
    advance(): StoryEvent | null {
        const current = storyFlow[this.currentEvent];
        if (!current || !current.nextEvent) {
            return null; // End of chain
        }
        
        this.currentEvent = current.nextEvent;
        return storyFlow[this.currentEvent];
    }
    
    /**
     * Check if we should automatically progress based on current state
     * Returns the action to take (show cutscene, show email, or null)
     */
    checkForProgress(): { action: "show_cutscene" | "show_email" | null; id: string | null } {
        const event = this.getCurrentEvent();
        if (!event) return { action: null, id: null };
        
        switch (event.type) {
            case "cutscene":
                // Check if cutscene has been viewed
                const cutscene = this.state.cutscenes[event.id as keyof typeof this.state.cutscenes];
                if (!cutscene?.viewed) {
                    return { action: "show_cutscene", id: event.id };
                }
                // Cutscene already viewed, don't auto-advance (let the completion handler do it)
                return { action: null, id: null };
                
            case "email":
                // Check if email has been shown
                const email = this.state.emails[event.id as keyof typeof this.state.emails];
                if (!email?.shown) {
                    return { action: "show_email", id: event.id };
                }
                // Email already shown, don't auto-advance (let the wait handler do it)
                return { action: null, id: null };
                
            case "wait_for_email_read":
                // Check if email has been read
                const readEmail = this.state.emails[event.id as keyof typeof this.state.emails];
                if (!readEmail?.read) {
                    // Still waiting for email to be read
                    return { action: null, id: null };
                }
                // Email has been read, we can return null and let the effect handler advance
                return { action: null, id: null };
                
            default:
                return { action: null, id: null };
        }
    }
    
    /**
     * Force jump to a specific event (for admin panel)
     */
    jumpToEvent(eventKey: string) {
        if (storyFlow[eventKey]) {
            this.currentEvent = eventKey;
        }
    }
    
    /**
     * Trigger a specific story event by its event key
     * Used for gameplay-triggered events (e.g., when player beats firewall level 1)
     */
    triggerEvent(eventKey: string): boolean {
        if (storyFlow[eventKey]) {
            this.currentEvent = eventKey;
            return true;
        }
        return false;
    }
    
    /**
     * Reset to the beginning
     */
    reset() {
        this.currentEvent = "start";
    }
}

/**
 * Story Event Triggers
 * Map game actions to story events
 */
export const STORY_TRIGGERS = {
    // Phase 1
    FIREWALL_PASSWORD_FAILED: "email_it_expert_2",
    STUDENT_PASSWORD_FOUND: "email_it_expert_3",
    
    // Phase 2
    FIREWALL_1_BEATEN: "email_it_expert_4",
    
    // Phase 3
    FIREWALL_2_BEATEN: "email_it_expert_5",
    
    // Phase 4
    FIREWALL_3_BEATEN: "email_it_expert_7",
    FIREWALL_4_BEATEN: "email_it_expert_8",
    NEED_FIREWALL_4_HINT: "email_it_expert_6",
    
    // Finale
    BOTNET_DELETED: "cutscene_victory"
} as const;
