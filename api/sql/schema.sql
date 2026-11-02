-- Schéma BikeAssist (Azure SQL). Idempotent : peut être relancé sans effet de bord.
-- Chaque ligne appartient à un utilisateur (user_id = identifiant SWA Microsoft).

IF OBJECT_ID(N'dbo.bikes', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.bikes (
        seq           BIGINT IDENTITY(1, 1) NOT NULL,
        user_id       NVARCHAR(128)  NOT NULL,
        id            NVARCHAR(64)   NOT NULL,
        name          NVARCHAR(120)  NOT NULL,
        type          NVARCHAR(20)   NOT NULL,
        brand         NVARCHAR(80)   NOT NULL,
        model         NVARCHAR(120)  NOT NULL,
        distance      FLOAT          NOT NULL CONSTRAINT DF_bikes_distance DEFAULT (0),
        gamme_name    NVARCHAR(120)  NOT NULL,
        added_on      DATETIME2(3)   NOT NULL,
        last_service  DATE           NULL,
        CONSTRAINT PK_bikes PRIMARY KEY (user_id, id)
    );
END;
GO

IF OBJECT_ID(N'dbo.bike_parts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.bike_parts (
        seq           BIGINT IDENTITY(1, 1) NOT NULL,
        user_id       NVARCHAR(128)  NOT NULL,
        bike_id       NVARCHAR(64)   NOT NULL,
        part_id       INT            NOT NULL,
        name          NVARCHAR(160)  NOT NULL,
        distance      FLOAT          NOT NULL CONSTRAINT DF_bike_parts_distance DEFAULT (0),
        max_distance  FLOAT          NOT NULL,
        is_actif      BIT            NOT NULL CONSTRAINT DF_bike_parts_actif DEFAULT (1),
        CONSTRAINT PK_bike_parts PRIMARY KEY (user_id, bike_id, part_id),
        CONSTRAINT FK_bike_parts_bikes FOREIGN KEY (user_id, bike_id)
            REFERENCES dbo.bikes (user_id, id) ON DELETE CASCADE
    );
END;
GO

IF OBJECT_ID(N'dbo.rides', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.rides (
        seq           BIGINT IDENTITY(1, 1) NOT NULL,
        user_id       NVARCHAR(128)  NOT NULL,
        id            NVARCHAR(64)   NOT NULL,
        bike_id       NVARCHAR(64)   NOT NULL,
        name          NVARCHAR(160)  NOT NULL,
        bike_name     NVARCHAR(120)  NOT NULL,
        date_label    NVARCHAR(40)   NOT NULL,
        distance      FLOAT          NOT NULL,
        CONSTRAINT PK_rides PRIMARY KEY (user_id, id),
        CONSTRAINT FK_rides_bikes FOREIGN KEY (user_id, bike_id)
            REFERENCES dbo.bikes (user_id, id) ON DELETE CASCADE
    );
END;
GO

-- Pas de clé étrangère : les entretiens sont conservés après suppression d'un vélo.
IF OBJECT_ID(N'dbo.maintenance_entries', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.maintenance_entries (
        seq               BIGINT IDENTITY(1, 1) NOT NULL,
        user_id           NVARCHAR(128)  NOT NULL,
        id                NVARCHAR(64)   NOT NULL,
        bike_id           NVARCHAR(64)   NOT NULL,
        bike_name         NVARCHAR(120)  NOT NULL,
        bike_distance     FLOAT          NOT NULL,
        part_id           INT            NOT NULL,
        part_name         NVARCHAR(160)  NOT NULL,
        previous_distance FLOAT          NOT NULL,
        new_distance      FLOAT          NOT NULL,
        entry_date        DATE           NOT NULL,
        note              NVARCHAR(500)  NOT NULL,
        CONSTRAINT PK_maintenance_entries PRIMARY KEY (user_id, id)
    );
END;
GO
