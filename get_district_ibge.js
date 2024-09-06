const axios = require('axios');
const { inserirDadosMunicipios } = require('./distritos_to_db.js');



async function getmunicipios(uf) {
    try {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/distritos`);
        if (response.status === 200 && response.data) {
            const distritos = response.data;
            const promises = distritos.map(distrito => inserirDadosMunicipios(distrito));
            await Promise.all(promises);
        } else {
            console.error(`Falha ao obter os distritos para a UF ${uf}. Código de status: ${response.status}`);
        }
        console.log("Dados inseridos com sucesso na base localidades: " + uf);
    } catch (error) {
        console.error(`Erro ao obter os distritos para a UF ${uf}: ${error.message}`);
    }
}

async function getufs() {
    try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        if (response.status === 200) {
            const ufs = response.data;
            const promises = ufs.map(uf => getmunicipios(uf.id));
            await Promise.all(promises);
        } else {
            console.error(`Falha ao obter as UFs. Código de status: ${response.status}`);
        }
        console.log("Dados inseridos com sucesso na base localidades");
    } catch (error) {
        console.error(`Erro ao obter as UFs: ${error.message}`);
    }
}

getufs();
