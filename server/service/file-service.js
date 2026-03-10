const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class FileService {
    saveFile(file) {
        try {
            const fileExtension = path.extname(file.name);
            const fileName = uuid.v4() + fileExtension;
            const filePath = path.resolve('static', fileName);
            if (!fs.existsSync(path.dirname(filePath))){
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            file.mv(filePath);
            return fileName;
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new FileService();
