export type FileType = {
    id: string;
    filename: string;
    fullName: string;
    timestamp: Date | string | null;
    downloadURL: string;
    type: string;
    size: number;
}