import express from "express";
import { DocumentController } from "../controllers/document.controller";
import { authenticateUser } from "../Middleware/auth.middleware"; 

const documentController = new DocumentController();
const documentRouter = express.Router();

documentRouter.post("/", authenticateUser, documentController.createDocument);
documentRouter.get("/", authenticateUser, documentController.getUserDocuments);
documentRouter.post("/share", authenticateUser, documentController.shareDocument);
documentRouter.get("/:documentId/users", authenticateUser, documentController.getUsersWithAccess);
documentRouter.put("/update", authenticateUser, documentController.updateDocument);
documentRouter.get("/:documentId/permissions", documentController.getDocumentPermissions);
documentRouter.post("/save", documentController.saveDocument);


export default documentRouter;
