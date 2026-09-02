import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchComplianceRecord, isValidToken } from '../_lib/airtable';

// GET /api/records/:token — the only way the frontend ever touches Compliance Records data.
// The Airtable PAT lives in this function's environment only; it is never sent to the client.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = req.query.token;
  if (typeof token !== 'string' || !isValidToken(token)) {
    res.status(400).json({ error: 'Invalid token' });
    return;
  }

  try {
    const result = await fetchComplianceRecord(token);
    if (result.status === 'not_found') {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('Failed to fetch compliance record', err);
    res.status(502).json({ error: 'Upstream lookup failed' });
  }
}
