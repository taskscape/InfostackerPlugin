export class FileSizeLimitError extends Error {
    constructor(message = "File size exceeds the specified limit") {
        super(message);
        this.name = "FileSizeLimitError";
    }
}