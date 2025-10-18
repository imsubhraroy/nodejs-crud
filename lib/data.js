
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const lib = {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

lib.baseDir = path.join(__dirname, '/../.data/');

// create file
lib.create = (dir, file, data, callback) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, (errors) => {
                if (!errors) {
                    fs.close(fileDescriptor, (error) => {
                        if (!error) {
                            callback(false);
                        } else {
                            callback('Error Closing new File');
                        }
                    });
                } else {
                    callback('Error Writing to new file');
                }
            });
        } else {
            callback(`Could not create new file ${err}`);
        }
    })
}

// read file data
lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', (err, data) => {
        callback(err, data);
    })
}

// update exiting file 
lib.update = (dir, file, data, callback) => {
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            fs.ftruncate(fileDescriptor, (err1) => {
                if (!err1) {
                    fs.writeFile(fileDescriptor, stringData, (errors) => {
                        if (!errors) {
                            fs.close(fileDescriptor, (error) => {
                                if (!error) {
                                    callback(false);
                                } else {
                                    callback('Error Closing new File');
                                }
                            });
                        } else {
                            callback('Error Writing to new file');
                        }
                    });
                } else {
                    callback(err1);
                };
            })
        } else {
            callback(err);
        }
    });
}

//Delete file
lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    })
}

//list all the file in the directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir + dir + '/', (err, files) => {
        if (!err && files && files.length > 0) {
            let trimmedFile = [];
            files.forEach((file) => {
                trimmedFile.push(file.replace('.json', ''))
            });
            callback(false, trimmedFile);
        } else {
            callback('Error reading directory');
        }
    })
}

export default lib;