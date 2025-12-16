export const CREATE_SQL_TEMPLATE = `
-- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
-- Last modification date: 2025-12-16 20:09:36.447

-- tables
-- Table: All_IPs
CREATE TABLE All_IPs (
    IP varchar(14) NOT NULL CONSTRAINT All_IPs_pk PRIMARY KEY
);

-- Table: Content
CREATE TABLE Content (
    id int NOT NULL CONSTRAINT content_pk PRIMARY KEY,
    content text NOT NULL
);

-- Table: Directories
CREATE TABLE Directories (
    id integer NOT NULL CONSTRAINT Directories_pk PRIMARY KEY,
    name varchar(50) NOT NULL,
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

-- Table: Hints
CREATE TABLE Hints (
    id integer NOT NULL CONSTRAINT Hints_pk PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL
);

-- Table: Log
CREATE TABLE Log (
    id integer NOT NULL CONSTRAINT Log_pk PRIMARY KEY,
    router_IP varchar(14) NOT NULL,
    source_ip varchar(14) NOT NULL,
    destination_ip double precision NOT NULL,
    log_message text NOT NULL,
    time datetime NOT NULL,
    CONSTRAINT Log_Router FOREIGN KEY (router_IP)
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

-- student user, heslo nešifrovaný student, uroven a permise 0
INSERT INTO User VALUES ("student", "student", 0);

-- F user, heslo šifrovaný x, uroven a permise 1
INSERT INTO User VALUES ("Finn", AES_ENCRYPT("x","abc"), 1);

-- F user, heslo šifrovaný x, uroven a permise 1
INSERT INTO User VALUES ("Frank", AES_ENCRYPT("x","car"), 1);

-- F user, heslo šifrovaný x, uroven a permise 1
INSERT INTO User VALUES ("Fiona", AES_ENCRYPT("x","tractor"), 1);

-- worker user, heslo šifrovaný x, uroven a permise 2
INSERT INTO User VALUES ("worker", AES_ENCRYPT("x","sFFFwa"), 2);

-- admin user, heslo šifrovaný Tracheobionta, uroven a permise 3
INSERT INTO User VALUES ("admin", AES_ENCRYPT("Tracheobionta", "5+pocetlogu"), 3);

-- pc 1, pod def routerem, s permisema 0 a userem student
INSERT INTO PC VALUES ("192.168.100.129", "174.156.12.4", 0);

-- pc 2, pod def routerem, s permisema 1
INSERT INTO PC VALUES ("192.168.100.130", "174.156.12.4", 1);

-- firewall 1, id 0, level 1, status "active"
INSERT INTO Firewall VALUES (0,1,"active");

-- firewall 2, id 1, level 2, status "active"
INSERT INTO Firewall VALUES (1,2,"active");

-- Soubor 1 s hash heslem pro user permise 1
INSERT INTO Directories VALUES (0,"HASHING.txt",0,NULL,0,"192.168.100.129");

-- Soubor 2 o informaci tabulky All_IPs
INSERT INTO Directories VALUES (1,"NEW_TABLE.txt",1,NULL,0,"192.168.100.130");

-- content souboru 1
INSERT INTO Content VALUES (0, "The new hashing key for level 1 staff is set to the number of PCs in the network.");

-- content souboru 2
INSERT INTO Content VALUES (1, "There is a table called All_IPs.");

INSERT INTO Log VALUES (0,"174.156.12.4", "192.168.100.132","192.168.100.130", "password for firewall level 2 changed to: Smith", GETDATE());
`;