import { NextFunction, Request, Response } from "express";
import { DocumentServiceImpl } from "../service/implementation/document.service.impl";
import { CustomRequest } from "../Middleware/auth.middleware";

export class DocumentController {
    private documentService: DocumentServiceImpl;

    constructor() {
        this.documentService = new DocumentServiceImpl();
    }

    public createDocument = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { title, content } = req.body;
            const userId = req.userAuth || ''

            const document = await this.documentService.createDocument(userId, title, content);
            res.status(201).json(document);
        } catch (error) {
            next(error);
        }
    };

    public getUserDocuments = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.userAuth || '';

            const documents = await this.documentService.getUserDocuments(userId);
            res.json(documents);
        } catch (error) {
            next(error);
        }
    };

    public shareDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { documentId, email, role } = req.body;

            await this.documentService.shareDocument(documentId, email, role);
            res.json({ message: "Document shared successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getUsersWithAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { documentId } = req.params;

            const users = await this.documentService.getUsersWithAccess(documentId);
            res.json(users);
        } catch (error) {
            next(error);
        }
    };

    public updateDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { documentId, content } = req.body;
            const updatedDocument = await this.documentService.updateDocument(documentId, content);
            res.json(updatedDocument);
        } catch (error) {
            next(error);
        }
    };
    
    public getDocumentPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { documentId } = req.params;
            const permissions = await this.documentService.getDocumentPermissions(documentId);
            res.status(200).json(permissions);
        } catch (error) {
            next(error);
        }
    };

    public saveDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const document = await this.documentService.saveDocument(req.body);
          res.status(200).json({ message: "Document saved successfully", document });
        } catch (error) {
          next(error);
        }
      };
}
