const fs = require('fs').promises;
const path = require('path');

async function deletePath(filePath) {
    try {
        const stats = await fs.lstat(filePath); // Kiểm tra thông tin về file/thư mục

        if (stats.isDirectory()) {
            const files = await fs.readdir(filePath);

            await Promise.all(
                files.map(async (file) => {
                    const curPath = path.join(filePath, file);
                    await deletePath(curPath); // Gọi lại hàm cho từng file/thư mục trong thư mục
                }),
            );

            await fs.rmdir(filePath);
            console.log(`Directory deleted: ${filePath}`);
        } else if (stats.isFile()) {
            await fs.unlink(filePath);
            console.log(`File deleted: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting ${filePath}: ${error.message}`);
    }
}

module.exports = deletePath;
