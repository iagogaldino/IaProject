import { Router } from 'express';
import { query } from '../services/postgresService';
import { logger } from '../services/logger';

const router = Router();

/**
 * @route POST /api/database/query
 * @desc Executa query SQL no banco de dados
 * @access Private (API Key required)
 */
router.post('/query', async (req, res) => {
  const { query: sqlQuery, requestId } = req.body;

  if (!sqlQuery || typeof sqlQuery !== 'string') {
    return res.status(400).json({
      error: 'Query is required and must be a string',
      timestamp: new Date().toISOString()
    });
  }

  try {
    logger.info('Executing database query', {
      query: sqlQuery.substring(0, 100) + '...',
      requestId
    });

    const result = await query(sqlQuery);
    
    logger.info('Database query executed successfully', {
      rowsReturned: result.rows?.length || 0,
      requestId
    });

    res.status(200).json({
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      command: result.command,
      metadata: {
        requestId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('Database query failed', error, {
      query: sqlQuery.substring(0, 100) + '...',
      requestId
    });

    res.status(500).json({
      success: false,
      error: 'Database query failed',
      details: error.message,
      timestamp: new Date().toISOString(),
      requestId
    });
  }
});

export default router;
