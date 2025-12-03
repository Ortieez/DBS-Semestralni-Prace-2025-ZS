export const state = {
    username: null,
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
        rector_mail_1: {shown: false, read: false},
        it_expert_mail_1: {shown: false, read: false},
        it_expert_mail_2: {shown: false, read: false},
        it_expert_mail_3: {shown: false, read: false},
        it_expert_mail_4: {shown: false, read: false}
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
        known_hashing_key: null,
        known_router_password: null,
        known_firewall_passwords: {
            f1: null,
            f2: null,
            f3: null,
            f4: null
        }
    },

    cutscenes: {
        intro: {
            id: "intro",
            content: "Saturday evening. You're sitting in your cozy bedroom, enjoying a well deserved rest time.\nThe rain softly drizzels outside and harmonises with your favorite relaxing music. The\nscent of a freshly brewed tea fills the air.\n…",
            viewed: false
        },
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
        }
    }
};

export type Emails = typeof emails;