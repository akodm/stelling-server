import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import moment from 'moment';

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, REGION, BUCKET_NAME } = process.env;

interface S3configs {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

const s3Config: S3configs = {
  accessKeyId: S3_ACCESS_KEY_ID as string,
  secretAccessKey: S3_SECRET_ACCESS_KEY as string,
  region: REGION as string,
};

const AwsClient = new aws.S3(s3Config);

// multer file uploader.
export const uploader = multer({
  storage: multerS3({
    s3: AwsClient,
    bucket: BUCKET_NAME as string,
    acl: "public-read",
    key: (req, file, cd) => {
      const now = moment();
      const { mimetype, originalname } = file;
      const parseName = originalname.replace(/ /g, "");
      const [ type ] = mimetype.split("/");

      if(type === "image") {
        cd(null, `image/${now.format("YYYY-MM-DD-ddd")}/${now.format("x")}_${parseName}`);
      } else {
        cd("type missmatch. ( require image. )", undefined);
      }
    }
  })
});

// s3 file delete.
export const s3DeleteObject = (src: string) => {
  const parse = decodeURIComponent(src);

  const exec: RegExpExecArray | null = /amazonaws.com\/(.*)/.exec(parse);

  const Key = exec ? exec[1] : "";

  AwsClient.deleteObject({
    Bucket: BUCKET_NAME as string,
    Key
  }, (err) => {
    if(err) {
      console.log("s3 delete file path: ", src); 

      return { 
        result: false, 
        err 
      };
    }

    console.log("s3 delete file: ", Key);
  });

  return { 
    result: true, 
    err: false 
  };
};

// json object check.
export const objCheck = (obj: any) => {
  const keys: string[] = Object.keys(obj);

  for(let e of keys) {
    if(!obj[e] ?? obj[e] === "") {
      return e;
    }
  }

  return false;
};