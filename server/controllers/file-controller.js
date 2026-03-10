const fileService = require('../service/file-service');

class FileController {
    async uploadFile(req, res, next) {
        try {
            const { file } = req.files;
            const fileName = await fileService.saveFile(file);
            return res.json({ url: `${process.env.API_URL}/${fileName}` });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new FileController();
