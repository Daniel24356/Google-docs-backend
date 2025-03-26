import { PrismaClient, Document, DocumentUser, DocumentPermission } from "@prisma/client";
import { DocumentService } from "../document.service";
import { ShareDocumentDTO } from "../../dto/shareDocument.dto";
import { SaveDocumentDTO } from "../../dto/saveDocument.dto";

const prisma = new PrismaClient();

export class DocumentServiceImpl implements DocumentService {
    async createDocument(userId: string, title: string, content?: string): Promise<Document> {
        return await prisma.document.create({
            data: { title, content, ownerId: userId },
        });
    }

    async getUserDocuments(userId: string): Promise<Document[]> {
        return await prisma.document.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { permissions: { some: { userId } } }, // Shared documents
                ],
            },
            include: {
                owner: { select: { name: true, email: true } },
                permissions: { include: { user: { select: { name: true, email: true } } } },
            },
        });
    }

    async shareDocument(documentId: string, email: string, role: "VIEWER" | "EDITOR"): Promise<void> {
        const userToShare = await prisma.user.findUnique({ where: { email } });
        if (!userToShare) throw new Error("User not found");

        const existingPermission = await prisma.documentUser.findFirst({
            where: { userId: userToShare.id, documentId },
        });

        if (existingPermission) throw new Error("User already has access");

        await prisma.documentUser.create({
            data: {
                userId: userToShare.id,
                documentId,
                role,
            },
        });
    }

    async getUsersWithAccess(documentId: string): Promise<DocumentUser[]> {
        return await prisma.documentUser.findMany({
            where: { documentId },
            include: { user: { select: { id: true, name: true, email: true } } },
        });
    }

    async updateDocument(documentId: string, content: string): Promise<Document> {
        return await prisma.document.update({
            where: { id: documentId },
            data: { content },
        });
    }

    async getDocumentPermissions(documentId: string): Promise<DocumentPermission[]> {
        return await prisma.documentPermission.findMany({
            where: { documentId },
            include: { user: true },
        });
    }

    async saveDocument(data: SaveDocumentDTO): Promise<Document> {
        const { documentId, content } = data;
    
        // Find existing document
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        });
        
        if (!document) throw new Error("Document not found");
    
        // Update the document content
        return await prisma.document.update({
          where: { id: documentId },
          data: { content },
        });
      }
}
