import * as express from 'express';
import * as Busboy from 'busboy';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export const uploadMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const busboy = new Busboy({
      headers: req.headers,
      limits: {
        fileSize: 10 * 1024 * 1024,
      }
    });
  
    const fields: any = {};
    const files: any = [];
    const fileWrites: any = [];
    const tmpdir = os.tmpdir();
  
    busboy.on('field', (key, value) => {
      fields[key] = value;
    });
  
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const filepath = path.join(tmpdir, filename);
      console.log(`Handling file upload field ${fieldname}: ${filename} (${filepath})`);
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
  
      fileWrites.push(new Promise((resolve, reject) => {
        file.on('end', () => writeStream.end());
        writeStream.on('finish', () => {
          fs.readFile(filepath, (err, buffer) => {
            const size = Buffer.byteLength(buffer);
            console.log(`${filename} is ${size} bytes`);
            if (err) {
              return reject(err);
            }
  
            files.push({
              fieldname,
              originalname: filename,
              encoding,
              mimetype,
              buffer,
              size,
            });
  
            try {
              fs.unlinkSync(filepath);
            } catch (error) {
              return reject(error);
            }
  
            resolve();
          });
        });
        writeStream.on('error', reject);
      }));
    });
  
    busboy.on('finish', () => {
      Promise.all(fileWrites)
        .then(() => {
          req.body = fields;
          // @ts-ignore
          req.files = files;
          next();
        })
        .catch(next);
    });
    
    // @ts-ignore
    busboy.end(req.rawBody);
  }
