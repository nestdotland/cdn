import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { supabase } from '@/lib/supabase';

const ARWEAVE_GATEWAY = process.env.ARWEAVE_GATEWAY;

const handler: NextApiHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const slug = req.query.s as string;
  const match = /^(?<authorName>[^\/]+)\/(?<moduleName>[^\/]+)\/(?<versionName>[^\/]+)\/(?<filepath>.*)$/.exec(slug);

  if (!match?.groups) {
    res.status(404);
    res.end('Not Found');
  } else {
    const { authorName, moduleName, versionName, filepath } = match.groups;

    if (!authorName) {
      res.status(404);
      res.end('Not Found');
    } else if (!moduleName) {
      res.status(404);
      res.end('Not Found');
    } else if (!versionName) {
      res.status(404);
      res.end('Not Found');
    } else if (!filepath) {
      res.status(404);
      res.end('Not Found');
    } else {
      let { data: Versions, error } = await supabase
        .from('Version')
        .select('manifestid')
        .eq('authorName', authorName)
        .eq('moduleName', moduleName)
        .eq('name', versionName);

      if (error) {
        res.status(500);
        res.end('Internal Server Error');
        throw new Error(`${error.message} (hint: ${error.hint})`);
      } else if (Versions.length < 1) {
        res.status(404);
        res.end('Not Found');
      } else if (Versions.length > 1) {
        // more than one versions with same primary key @@id([author, module, version, path])
        res.status(500);
        res.end('Internal Server Error');
        throw new Error(
          `Found ${Versions.length} "Versions" with primary key @@id([${authorName}, ${moduleName}, ${versionName}, ${filepath}])`
        );
      } else {
        let { data: Files, error } = await supabase
          .from('File')
          .select('*')
          .eq('authorName', authorName)
          .eq('moduleName', moduleName)
          .eq('versionName', versionName)
          .eq('path', filepath);

        if (error) {
          res.status(500);
          res.end('Internal Server Error');
          throw new Error(`${error.message} (hint: ${error.hint})`);
        } else if (Files.length < 1) {
          res.status(404);
          res.end('Not Found');
        } else if (Files.length > 1) {
          // more than one files with same primary key @@id([author, module, version, path])
          res.status(500);
          res.end('Internal Server Error');
          throw new Error(
            `Found ${Files.length} "Files" with primary key @@id([${authorName}, ${moduleName}, ${versionName}, ${filepath}])`
          );
        } else {
          const { manifestid } = Versions[0];
          const { mimeType } = Files[0];

          const data = await fetch(`https://${ARWEAVE_GATEWAY}/${manifestid}/${filepath}`);

          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', [
            'public',
            'maxage=31536000',
            's-maxage=31536000',
            'stale-while-revalidate=31536000',
            'immutable',
          ]);
          res.status(data.status);
          data.body.pipe(res);
        }
      }
    }
  }
};

export default handler;
