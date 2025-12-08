export const state = {
    username: null,
    currentStoryEvent: "start", // Track current position in story flow
    storyProgress: {
        firewall_1_beaten: false,
        firewall_2_beaten: false,
        firewall_3_beaten: false,
        firewall_4_beaten: false,

        connected_to_main_ip: false,

        found_student_password: false,
        unlocked_pc_1: false,

        found_notes_list: false,
        read_any_hint: false,

        found_hashing_key: false,
        unhashed_level_1_passwords: false,

        found_router_password: false,
        unlocked_any_router: false,

        accessed_logs: false,
        identified_infected_pc: false,
        deleted_botnet_script: false
    },

    emails: {
        rector_1: {shown: false, read: false},
        it_expert_1: {shown: false, read: false},
        it_expert_2: {shown: false, read: false},
        it_expert_3: {shown: false, read: false},
        it_expert_4: {shown: false, read: false},
        it_expert_5: {shown: false, read: false},
        it_expert_6: {shown: false, read: false},
        it_expert_7: {shown: false, read: false}
    },

    pcs: {
        pc_1: {
            access_granted: false,
            files_viewed: []
        },
        pc_2: {
            access_granted: false,
            files_viewed: []
        },
        pc_3: {
            access_granted: false,
            files_viewed: []
        }
    },

    routers: {
        router_1: {
            ip: null,
            unlocked: false
        },
        router_2: {
            ip: null,
            unlocked: false
        }
    },

    misc: {
        known_main_ip: "174.156.12.4",
        known_hashing_key: null as string | null,
        known_router_password: null as string | null,
        known_firewall_passwords: {
            f1: null as string | null,
            f2: null as string | null,
            f3: null as string | null,
            f4: null as string | null
        }
    },

    cutscenes: {
        intro: {
            id: "intro",
            content: "Saturday evening. You're sitting in your cozy bedroom, enjoying a well deserved rest time.\nThe rain softly drizzels outside and harmonises with your favorite relaxing music. The\nscent of a freshly brewed tea fills the air.\n ... \n\n Suddenly, a notification interrupts your thoughts…",
            viewed: false
        },
        narrative_bridge: {
            id: "narrative_bridge",
            content: "This really wasn't your plan for Saturday evening, but as the rector said: You're their only hope...\n\n*sigh* \"Looks like I have no choice…\"",
            viewed: false
        },
        firewall_warning: {
            id: "firewall_warning",
            content: "\"Great. So the IT expert is lost, and they want ME to figure it out… Whatever, I'll do my best.\"\n\nYou take one last look outside, and then you fire up a terminal. Laser focused.",
            viewed: false
        },
        student_found: {
            id: "student_found",
            content: "You search through the database and find it - the default student credentials hidden in plain sight.\n\n*whispers* \"student\"... of course. How did they miss that?",
            viewed: false
        },
        router_unlock: {
            id: "router_unlock",
            content: "The router's defenses crumble under your command.\n\nRouter access granted.\n\nThe network logs are now within your reach.",
            viewed: false
        },
        infected_found: {
            id: "infected_found",
            content: "There it is. Buried in the network logs, a single machine behaving suspiciously.\nUnusual traffic patterns. Constant outbound connections.\nRapid data exfiltration attempts.",
            viewed: false
        },
        victory: {
            id: "victory",
            content: "With surgical precision, you delete the malicious script.\n\nThe infection dies.\n\nThe botnet falls silent.\n\nAll across the TUL network, systems stabilize. Firewalls lower.\nThe attack is over.\n\nYou did it. Against all odds, you saved the university.",
            viewed: false
        }
    }
}

export type State = typeof state;

export const emails = {
    "emails": {
        "rector_1": {
            "from": "rector@tul.cz",
            "subject": "!URGENT! University under attack",
            "body": "TUL is under attack! A vile university has shattered our infrastructure with a devastating\nbotnet attack. Our best IT specialist is doing his best to stop it, but he got stuck.\nHe will do his best to help you.\n\nHelp me <username>, you're my only hope...\n\nDesperatly,\n\nRector"
        },

        "it_expert_1": {
            "from": "itexpert@tul.cz",
            "subject": "botnet",
            "body": "Hello <username>,\n\nI don't like to admit it, but I'm lost. Hope you can help me. The attack is comming from\nthis IP address: ? 174.156.12.4 ? We have to figure out, which device is the source and\ndelete the botnet script. They have a nasty firewall however. We need to dispose it first.\nThis should work:\n\nUPDATE Firewall\nSET status = 'inactive'\nWHERE level = 1"
        },

        "it_expert_2": {
            "from": "itexpert@tul.cz",
            "subject": "firewall",
            "body": "Sorry, forgot to tell you… The firewall is password protected. I wasn't able to find the\ncorrect password yet. Perhaps some hints could be hidden in some files on the local PCs.\nYou could try to access a PC with the default username \"student\"..."
        },

        "it_expert_3": {
            "from": "itexpert@tul.cz",
            "subject": "notes",
            "body": "Oh, one more thing. All of my notes are here for you. Maybe they could help. You can\naccess the list of available notes with this command:\n\nSELECT id, title\nFROM Hints\n\nAnd to access a specific note, use this one:\n\nSELECT text\nFROM Hints\nWHERE id = <id of desired hint>\n\nor\n\nSELECT text\nFROM Hints\nWHERE title = <title of desired hint>\n\n\nGood luck, youngster!"
        },

        "it_expert_4": {
            "from": "itexpert@tul.cz",
            "subject": "next step",
            "body": "Wow, good job. In the meantime, I was trying to break into one of the routers. No success\nyet. Maybe you will be luckier. If you can pull this of, we will gain access to the logs.\nMight be useful.\n\nAlso it looks like the firewall is multi-level. I'm affraid, we'll have to deactivate\nall of the layers..."
        },

        "it_expert_5": {
            "from": "itexpert@tul.cz",
            "subject": "next step",
            "body": "You're doing great! Now we have access to the network logs. Those could help with spotting\na suspiciously behaving device. That might be our beloved Botnet-spreading friend...\n\nLet's go, you've got this!"
        },

        "it_expert_6": {
            "from": "itexpert@tul.cz",
            "subject": "firewall level 4",
            "body": "The botnet corrupted the last level of the firewall. It seems like it set the password to\nthe number of directories with null content on the computer (in the local network) that its\nsource PC sent the last PING log..."
        },

        "it_expert_7": {
            "from": "itexpert@tul.cz",
            "subject": "The Files",
            "body": "Yes! You found it!\n\nWoah... There's a load of files on the PC. One of them has to be the Botnet script. We've\ngot work to do. Be careful, though. Deleting any other file could result in us being sued..."
        }
    }
};

export type Emails = typeof emails;