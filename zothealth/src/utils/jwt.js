const jwt = require('jsonwebtoken');
function issueAccessToken(userId){ return jwt.sign({}, process.env.JWT_ACCESS_SECRET, { subject: userId, expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }); }
function issueRefreshToken(userId){
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || '7d';
  const token = jwt.sign({}, process.env.JWT_REFRESH_SECRET, { subject: userId, expiresIn });
  const now = new Date(); const expiresAt = new Date(now.getTime() + parseDurationMs(expiresIn));
  return { refreshToken: token, expiresAt };
}
const refreshCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/auth', maxAge: parseDurationMs(process.env.JWT_REFRESH_EXPIRES || '7d') };
function parseDurationMs(str){ const m=/^(\d+)([smhd])$/.exec(str); if(!m) return 7*24*60*60*1000; const num=parseInt(m[1],10); const unit=m[2]; const mult= unit==='s'?1000:unit==='m'?60000:unit==='h'?3600000:86400000; return num*mult; }
module.exports = { issueAccessToken, issueRefreshToken, refreshCookieOptions };
