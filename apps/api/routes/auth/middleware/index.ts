import jwt from 'jsonwebtoken';
import { verifyToken, authenticateToken } from './tokens/verifyToken.ts';
import { optionalToken } from './tokens/optionalToken.ts';
import refreshTokens from '../../../services/refreshTokenStore.ts';

// Export database-backed refresh token storage
export { refreshTokens };

export {
  verifyToken,
  authenticateToken,
  optionalToken
};

export default {
  verifyToken,
  authenticateToken,
  optionalToken,
  refreshTokens
};
