export const CREATE_SQL_TEMPLATE = `
-- Created by Redgate Data Modeler (https://datamodeler.redgate-platform.com)
-- Last modification date: 2025-12-05 10:48:09.949

-- tables
-- Table: Directories
CREATE TABLE Directories (
    id integer NOT NULL CONSTRAINT Directories_pk PRIMARY KEY,
    content integer,
    id_parent integer,
    locked boolean NOT NULL,
    id_PC nvarchar(14) NOT NULL,
    CONSTRAINT FK_0 FOREIGN KEY (id_parent)
    REFERENCES Directories (id),
    CONSTRAINT FK_1 FOREIGN KEY (id_PC)
    REFERENCES PC (IP),
    CONSTRAINT FK_2 FOREIGN KEY (content)
    REFERENCES content (id)
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
    hidden boolean NOT NULL,
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
    permision integer NOT NULL
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

-- Table: content
CREATE TABLE content (
    id int NOT NULL CONSTRAINT content_pk PRIMARY KEY,
    content text NOT NULL
);

-- End of file.`