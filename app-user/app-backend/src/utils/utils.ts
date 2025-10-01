/**
 * Extrai uma query SQL de uma string que contém um bloco ```sql ... ```
 * @param answer Texto retornado pela IA
 * @returns A query SQL extraída ou null se não encontrada
 */
export function extractSqlQuery(answer: string): string | null {
  const regex = /```sql\n([\s\S]*?)```/;
  const match = answer.match(regex);

  if (match) {
    return match[1].trim();
  } else {
    return null;
  }
}