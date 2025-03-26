import { Document, DocumentUser, DocumentPermission } from "@prisma/client";
import { ShareDocumentDTO } from "../dto/shareDocument.dto";
import { SaveDocumentDTO } from "../dto/saveDocument.dto";

export interface DocumentService {
    createDocument(userId: string, title: string, content?: string): Promise<Document>;
    getUserDocuments(userId: string): Promise<Document[]>;
    shareDocument(documentId: string, email: string, role: "VIEWER" | "EDITOR"): Promise<void>;
    getUsersWithAccess(documentId: string): Promise<DocumentUser[]>;
    updateDocument(documentId: string, content: string): Promise<Document>;
    // shareDocument(data: ShareDocumentDTO): Promise<DocumentPermission>;
    getDocumentPermissions(documentId: string): Promise<DocumentPermission[]>;
    saveDocument(data: SaveDocumentDTO): Promise<Document>;
}
