import { NextApiHandler, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { supabase } from '@/lib/supabase';

const handler: NextApiHandler = async (req, res) => {
  const slug = req.query.s as string;
  const match = /^([^\/@]+)\/([^\/@]+)@([^\/]+)\/(.*)$/.exec(slug);

  if (!match) {
    res.status(400);
    res.end(`Invalid URL`);
  } else {
    const [, authorName, moduleName, versionName, filepath] = match;

    if (!authorName) {
      res.status(400);
      res.end(`Author not provided!`);
    } else if (!moduleName) {
      res.status(400);
      res.end(`Module not provided!`);
    } else if (!versionName) {
      res.status(400);
      res.end(`Version not provided!`);
    } else if (!filepath) {
      res.status(400);
      res.end(`Path not provided!`);
    } else {
      let { data: Files, error } = await supabase
        .from('File')
        .select('url, mimeType')
        .eq('authorName', authorName)
        .eq('moduleName', moduleName)
        .eq('versionName', versionName)
        .eq('path', filepath);

      if (error) {
        res.status(500);
        res.end(`Internal Server Error`);
        throw new Error(`${error.message} (hint: ${error.hint})`);
      } else if (Files.length < 1) {
        res.status(404);
        res.end('Not Found');
      } else if (Files.length > 1) {
        // more than one files with same primary key @@id([author, module, version, path])
        res.status(500);
        res.end(`Internal Server Error`);
        console.error("Wait, that's illegal!!!");
        throw new Error(
          `Found ${Files.length} "Files" with primary key @@id([${authorName}, ${moduleName}, ${versionName}, ${filepath}])`
        );
      } else {
        const { url, mimeType } = Files[0];

        const data = await fetch(url);

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', [
          'public',
          'maxage=21600',
          's-maxage=21600',
          'stale-while-revalidate=21600',
          'immutable',
        ]);

        res.status(data.status);
        data.body.pipe(res);
      }
    }
  }
};

export default handler;
