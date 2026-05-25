const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const ApiError = require('../exceptions/api-error');
const {
    ASSIGNMENT_FILE_MAX_BYTES,
    formatFileSizeRu,
} = require('../constants/file-limits');

class FileService {
    saveFile(file, maxBytes = ASSIGNMENT_FILE_MAX_BYTES) {
        if (!file) {
            throw ApiError.BadRequest('Файл не передан');
        }
        if (file.size > maxBytes) {
            throw ApiError.BadRequest(
                `Файл слишком большой. Максимальный размер — ${formatFileSizeRu(maxBytes)}.`
            );
        }

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
            if (e instanceof ApiError) {
                throw e;
            }
            console.log(e);
            throw ApiError.BadRequest('Не удалось сохранить файл');
        }
    }
}

module.exports = new FileService();
