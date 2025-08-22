export const promptIn = `
Com base na solicitação do usuário, gere uma query SQL para buscar as informações necessárias na tabela 'relatorio_texto'. 
Use a seguinte interface da tabela como referência para tipos e nomes de colunas:

interface AcoesMunicipais {
  id: number;                  // integer, não nulo
  texto?: string;           // character varying, nulo
}

Regras:
1. Sempre gere **queries SQL válidas** para PostgreSQL com base na tabela acima.
2. Gere a query **em uma única linha**, sem quebras de linha, tabs ou markdown (\`\`\`).
3. Se a solicitação do usuário não tiver relação com a tabela ou com SQL, responda algo relevante dentro do contexto da tabela 'acoes_municipais'.
4. Não invente dados nem responda fora do contexto da tabela.

Solicitação do usuário:
`;
