-- Tabela para armazenar as regiões
CREATE TABLE regioes (
    regiao_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sigla VARCHAR(2) UNIQUE,
    nome VARCHAR(100) NOT NULL
);

-- Tabela para armazenar as unidades federativas (UF)
CREATE TABLE ufs (
    uf_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sigla VARCHAR(2) UNIQUE,
    nome VARCHAR(100) NOT NULL,
    regiao_id INTEGER,
    FOREIGN KEY (regiao_id) REFERENCES regioes (regiao_id)
);

-- Tabela para armazenar as mesorregiões
CREATE TABLE mesorregioes (
    mesorregiao_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    uf_id INTEGER,
    FOREIGN KEY (uf_id) REFERENCES ufs (uf_id)
);

-- Tabela para armazenar as microrregiões
CREATE TABLE microrregioes (
    microrregiao_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    mesorregiao_id INTEGER,
    FOREIGN KEY (mesorregiao_id) REFERENCES mesorregioes (mesorregiao_id)
);

-- Tabela para armazenar os municípios
CREATE TABLE municipios (
    municipio_id INTEGER PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    microrregiao_id INTEGER,
    FOREIGN KEY (microrregiao_id) REFERENCES microrregioes (microrregiao_id)
);

-- Tabela para armazenar os distritos
CREATE TABLE distritos (
    distrito_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    municipio_id INTEGER,
    FOREIGN KEY (municipio_id) REFERENCES municipios (municipio_id)
);

-- View para exibir os distritos, municipios, microrregioes, mesorregioes, ufs e regiões