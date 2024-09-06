const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/localidades.db');

let transactionInProgress = false;

async function inserirDadosMunicipios(dados) {
    try {
        const { id: regiao_id, nome: regiao_nome, sigla } = dados.municipio.microrregiao.mesorregiao.UF.regiao;
        const { id: uf_id, nome: uf_nome, sigla: uf_sigla } = dados.municipio.microrregiao.mesorregiao.UF;
        const { id: mesorregiao_id, nome: mesorregiao_nome } = dados.municipio.microrregiao.mesorregiao;
        const { id: microrregiao_id, nome: microrregiao_nome } = dados.municipio.microrregiao;
        const { id: municipio_id, nome: municipio_nome } = dados.municipio;
        const { id: distrito_id, nome: distrito_nome } = dados;

		 // Espera até que a transação anterior termine
		 while (transactionInProgress) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        transactionInProgress = true;

        await runInTransaction(async () => {
            await inserirDadosRegiao({ regiao_id, regiao_nome, sigla });
            await inserirDadosUf({ uf_id, uf_nome, uf_sigla, regiao_id });
            await inserirDadosMesorregiao({ mesorregiao_id, mesorregiao_nome, uf_id });
            await inserirDadosMicrorregiao({ microrregiao_id, microrregiao_nome, mesorregiao_id });
            await inserirDadosMunicipio({ municipio_id, municipio_nome, microrregiao_id });
            await inserirDadosDistrito({ distrito_id, distrito_nome, municipio_id });
        });

    } catch (error) {
        console.error("Erro ao inserir dados na base distritos", error);
    } finally {
        transactionInProgress = false;
    }
}

function runInTransaction(callback) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject(err);

                callback()
                    .then(() => {
                        db.run("COMMIT", (err) => {
                            if (err) return reject(err);
                            resolve();
                        });
                    })
                    .catch((err) => {
                        db.run("ROLLBACK", (rollbackErr) => {
                            if (rollbackErr) console.error("Failed to rollback transaction", rollbackErr);
                            reject(err);
                        });
                    });
            });
        });
    });
}

function inserirDadosRegiao(dados) {
    const { regiao_id, regiao_nome, sigla } = dados;

    const query = `
        INSERT OR IGNORE INTO regioes (regiao_id, nome, sigla)
        VALUES (?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
        db.run(query, [regiao_id, regiao_nome, sigla], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function inserirDadosUf(dados) {
    const { uf_id, uf_nome, uf_sigla, regiao_id } = dados;

    const query = `
        INSERT OR IGNORE INTO ufs (uf_id, nome, sigla, regiao_id)
        VALUES (?, ?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
        db.run(query, [uf_id, uf_nome, uf_sigla, regiao_id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function inserirDadosMesorregiao(dados) {
    const { mesorregiao_id, mesorregiao_nome, uf_id } = dados;

    const query = `
        INSERT OR IGNORE INTO mesorregioes (mesorregiao_id, nome, uf_id)
        VALUES (?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
        db.run(query, [mesorregiao_id, mesorregiao_nome, uf_id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function inserirDadosMicrorregiao(dados) {
    const { microrregiao_id, microrregiao_nome, mesorregiao_id } = dados;

    const query = `
        INSERT OR IGNORE INTO microrregioes (microrregiao_id, nome, mesorregiao_id)
        VALUES (?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
        db.run(query, [microrregiao_id, microrregiao_nome, mesorregiao_id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function inserirDadosMunicipio(dados) {
    const { municipio_id, municipio_nome, microrregiao_id } = dados;

    const query = `
        INSERT OR IGNORE INTO municipios (municipio_id, nome, microrregiao_id)
        VALUES (?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
        db.run(query, [municipio_id, municipio_nome, microrregiao_id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function inserirDadosDistrito(dados) {
    const { distrito_id, distrito_nome, municipio_id } = dados;

    const query = `
        INSERT OR IGNORE INTO distritos (distrito_id, nome, municipio_id)
        VALUES (?, ?, ?);
    `;

    return new Promise((resolve, reject) => {
        db.run(query, [distrito_id, distrito_nome, municipio_id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

module.exports = { inserirDadosMunicipios };
