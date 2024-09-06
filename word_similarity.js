const axios = require('axios');
const { SequenceMatcher } = require('difflib');
const {inserirDadosMunicipios} = require('./distritos_to_db.js');

async function getDistritos() {
    try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/50/distritos');
        if (response.status === 200) {
            const distritos = response.data.map(dist => dist.municipio.nome);
            distritos.sort();
            return distritos;
        } else {
            console.error('Falha ao obter os distritos. Código de status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter os distritos:', error.message);
        return null;
    }
}

async function getmunicipios() {
    try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/33/distritos');
        if (response.status === 200) {
           // Obtenha os dados da resposta e converta-os para um array
           const distritos = Object.values(response.data);
            
           // Itere sobre os distritos e insira cada um deles na base de dados
           for (const distrito of distritos) {
               await inserirDadosMunicipios(distrito); 
           }
        } else {
            console.error('Falha ao obter os distritos. Código de status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter os distritos:', error.message);
        return null;
    }
}

function similarStrings(toCompare, toMatch) {
    // Remove excess whitespace
    toCompare = toCompare.trim();
    toMatch = toMatch.trim();
    const similarity = new SequenceMatcher(null, toCompare, toMatch);
    return similarity.ratio();
}

async function calculeSimilarity(texto, distritos) {
    const top5 = [];
    for (const municipio of distritos) {
        const similar = similarStrings(municipio, texto);
        if (similar > 0.600) {
            top5.push({ municipio, similar });
            if (top5.length === 5) {
                return top5;
            }
        }
    }
    return top5;
}

async function main() {
    const distritos = await getDistritos();
    if (distritos !== null) {
        console.log('Resultado da similaridade:', await calculeSimilarity('Parana', distritos));
    }
}

// getmunicipios();
main();
