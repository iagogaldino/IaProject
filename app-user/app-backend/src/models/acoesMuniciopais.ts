interface AcoesMunicipais {
  id: number;                  // integer, não nulo
  tipo_acao?: string;           // character varying, nulo
  ordem?: number;               // integer, nulo
  nome?: string;                // character varying, nulo
  status?: string;              // character varying, nulo
  metros?: number;              // numeric, nulo
  valor?: number;               // numeric, nulo
  recurso?: string;             // character varying, nulo
}
