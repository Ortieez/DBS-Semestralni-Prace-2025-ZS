export const CREATE_SQL_TEMPLATE = `
-- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
-- Last modification date: 2025-12-07 19:43:42.84

-- tables
-- Table: Content
CREATE TABLE Content (
    id int NOT NULL CONSTRAINT content_pk PRIMARY KEY,
    content text NOT NULL
);

-- Table: Directories
CREATE TABLE Directories (
    id integer NOT NULL CONSTRAINT Directories_pk PRIMARY KEY,
    content integer,
    id_parent integer,
    locked boolean NOT NULL,
    pc_ip nvarchar(14) NOT NULL,
    CONSTRAINT FK_0 FOREIGN KEY (id_parent)
    REFERENCES Directories (id),
    CONSTRAINT FK_1 FOREIGN KEY (pc_ip)
    REFERENCES PC (IP),
    CONSTRAINT FK_2 FOREIGN KEY (content)
    REFERENCES Content (id)
);

-- Table: Firewall
CREATE TABLE Firewall (
    id integer NOT NULL CONSTRAINT Firewall_pk PRIMARY KEY,
    level integer NOT NULL,
    status varchar(8) NOT NULL
);

-- Table: Log
CREATE TABLE Log (
    id integer NOT NULL CONSTRAINT Log_pk PRIMARY KEY,
    source_ip varchar(14) NOT NULL,
    destination_ip varchar(14) NOT NULL,
    "action" varchar(20) NOT NULL,
    time datetime NOT NULL,
    Router_IP varchar(14) NOT NULL,
    CONSTRAINT Log_Router FOREIGN KEY (Router_IP)
    REFERENCES Router (IP)
);

-- Table: PC
CREATE TABLE PC (
    IP nvarchar(14) NOT NULL CONSTRAINT PC_pk PRIMARY KEY,
    router nvarchar(14) NOT NULL,
    permission integer NOT NULL,
    CONSTRAINT FK_3 FOREIGN KEY (router)
    REFERENCES Router (IP)
);

-- Table: Router
CREATE TABLE Router (
    IP varchar(14) NOT NULL CONSTRAINT Router_pk PRIMARY KEY,
    locked boolean NOT NULL
);

-- Table: User
CREATE TABLE User (
    name varchar(20) NOT NULL CONSTRAINT User_pk PRIMARY KEY,
    password varchar(20) NOT NULL,
    permission integer NOT NULL
);

-- Table: User_has_access_to_PC
CREATE TABLE User_has_access_to_PC (
    user varchar(20) NOT NULL,
    pc varchar(20) NOT NULL,
    CONSTRAINT FK_4 FOREIGN KEY (pc)
    REFERENCES PC (IP),
    CONSTRAINT FK_5 FOREIGN KEY (user)
    REFERENCES User (name)
);

-- End of file.




-- ========== GAME DATA ==========

-- Main router (from email)
INSERT INTO Router VALUES ("174.156.12.4", 0);

-- All 4 firewall levels
INSERT INTO Firewall VALUES (0, 1, "active");
INSERT INTO Firewall VALUES (1, 2, "active");
INSERT INTO Firewall VALUES (2, 3, "active");
INSERT INTO Firewall VALUES (3, 4, "active");

-- PC 1 - student PC (permission level 0)
INSERT INTO PC VALUES ("192.168.100.129", "174.156.12.4", 0);

-- Student user (default credentials)
INSERT INTO User VALUES ("student", "student", 0);

-- Level 1 users (for hashing progression)
INSERT INTO User VALUES ("alice", "hashed_pw1", 1);
INSERT INTO User VALUES ("bob", "hashed_pw2", 1);
INSERT INTO User VALUES ("charlie", "hashed_pw3", 1);

-- Users whose names start with F (for router password calculation)
INSERT INTO User VALUES ("Frank", "pw_frank", 2);
INSERT INTO User VALUES ("Fiona", "pw_fiona", 3);

-- ========== PC 1 FILES ==========

-- File 1: Contains firewall level 1 password
INSERT INTO Content VALUES (0, "CONFIDENTIAL MEMO
Date: 2025-12-01

Firewall level 1 password: FireWall1Pass

Keep this secure!");

INSERT INTO Directories VALUES (0, 0, NULL, 0, "192.168.100.129");

-- File 2: Hashing hint
INSERT INTO Content VALUES (1, "HASHING

The new hashing key for level 1 staff is set to the number of PCs in the network.");

INSERT INTO Directories VALUES (1, 1, NULL, 0, "192.168.100.129");

-- File 3: All_IPs table hint
INSERT INTO Content VALUES (2, "NEW TABLE

There is a table called All_IPs.
contents:   device_id   ip");

INSERT INTO Directories VALUES (2, 2, NULL, 0, "192.168.100.129");

-- File 4: Router password hint
INSERT INTO Content VALUES (3, "NEW ROUTER PASSWORD

Router password was set to the sum of the clearance levels of all staff whose name starts with the letter F");

INSERT INTO Directories VALUES (3, 3, NULL, 0, "192.168.100.129");
`