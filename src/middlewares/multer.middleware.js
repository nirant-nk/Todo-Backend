import multer from "multer";
import path from "path";
import { fileURLToPath } from "url"; // Import utilities for file path resolution

// Create __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../public/temp")); // Adjusted for your folder structure
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

export default upload;
