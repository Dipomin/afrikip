import { NextApiRequest, NextApiResponse } from 'next';
import FTPClient from 'ftp';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;

  if (!path) {
    res.status(400).json({ error: "Path query parameter is required" });
    return;
  }

  const client = new FTPClient();

  client.on('ready', () => {
    client.list(path as string, (err, list) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const files = list.map(file => ({
        name: file.name,
        path: `${path}/${file.name}`,
        isDirectory: file.type === 'd',
      }));

      res.status(200).json(files);
      client.end();
    });
  });

  client.on('error', (err) => {
    res.status(500).json({ error: err.message });
    client.end();
  });

  client.connect({
    host: 'lia.ci',
    user: 'wakiliarchive',
    password: 'gmaRZ5qK@',
  });
}
