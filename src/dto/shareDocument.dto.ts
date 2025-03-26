import { Role } from "@prisma/client";

export interface ShareDocumentDTO {
    documentId: string;
    userId: string;
    role: Role;
}
