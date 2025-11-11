import { supabase } from '../app.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('permissions')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      return res.status(403).json({ error: 'Unable to verify permissions' });
    }

    const permissions = userData.permissions || [];
    
    if (!permissions.includes('ReadAll')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({ error: 'Permission check failed' });
  }
};

