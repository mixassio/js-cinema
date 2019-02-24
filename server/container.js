import dotenv from 'dotenv';
import debug from 'debug';

const logger = debug('app');
dotenv.config();

export default { logger };
