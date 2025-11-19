/**
 * Interface for agent configuration service
 * Follows Interface Segregation Principle
 */
export interface IAgentConfigService {
  /**
   * Gets the agent de primeiro contato (first contact agent)
   */
  getAgentDePrimeiroContato(): any;

  /**
   * Gets the analista sobre obras agent
   */
  getAnalistaSobreObras(): any;

  /**
   * Gets the analista sobre pavimentação agent
   */
  getAnalistaSobrePavimentacao(): any;

  /**
   * Gets the agent informativo
   */
  getAgentInformativo(): any;

  /**
   * Gets the response formatter agent
   */
  getResponseFormatter(): any;

  /**
   * Creates a new runner instance
   */
  createRunner(): any;

  /**
   * Gets the file search tool
   */
  getFileSearchTool(): any;
}

