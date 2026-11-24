import { createServer, type IncomingMessage } from 'node:http';
import { createOfflineClearingClient } from '@aegisclear/client';
import { createClearingRouter } from './router.js';

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
}

export function startClearingNode(port = 4100) {
  const handle = createClearingRouter(createOfflineClearingClient());
  const server = createServer(async (req, res) => {
    const body = req.method === 'POST' ? await readJsonBody(req) : undefined;
    const response = await handle({ method: req.method ?? 'GET', url: req.url ?? '/', body });
    res.writeHead(response.status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(response.body));
  });
  return server.listen(port);
}
