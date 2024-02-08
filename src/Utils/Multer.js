import multerS3 from "multer-s3";
import crypto from "crypto";
import aws from "aws-sdk";
import "dotenv/config";
import AWSCredentials from "../aws-env";

aws.config.update({
    accessKeyId: AWSCredentials.AWS_ACCESS_KEY,
    secretAccessKey: AWSCredentials.AWS_SECRET_KEY,
    region: AWSCredentials.AWS_DEFAULT_REGION
});

export default {
    storage: multerS3({
        s3: new aws.S3(),
        bucket: 'justeat-dwdm',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err) {
                    cb(err);
                }
                const fileName = hash.toString("hex") + "." + file.originalname.split(".")[file.originalname.split(".").length-1];
                req.fileName = fileName;
                cb(null, fileName);
            });
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            "image/jpeg",
            "image/png"
        ];

        if(allowedMimes.includes(file.mimetype)){
            cb(null, true);
        }else{
            cb(new Error("Invalid MIME type"));
        }
    }
}