import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import userRouter from "./Route/userRouter";
import { errorHandler } from "./exceptions/error/errorHandler";
import authRouter from "./Route/authRouth";
import { setupSwagger } from "./configs/swagger";
import documentRouter from "./Route/document.routes";
import http from "http";
import { Server } from "socket.io";
import { db } from "./configs/db";

dotenv.config();

const portEnv = process.env.PORT;
if(!portEnv){
   console.error("Error: PORT is not defined in .env file");
   process.exit(1);
}

const PORT:number = parseInt(portEnv, 10);
if(isNaN(PORT)){
   console.error("Error: PORT is not a number in .env file");
   process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});
const corsOptions = {
    origin:
    "*",
    Credentials: true,
    allowedHeaders: "*",
    methods:"GET, HEAD, PUT, PATCH, POST, DELETE"
};

app.use(cors(corsOptions));

app.use(express.json());

setupSwagger(app);

// app.use("/api/v1/courses", courseRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/login", authRouter)
app.use("/api/v1/document", documentRouter)

app.use(errorHandler)

const activeUsers: Record<string, Array<{ userId: string; name: string; cursorPosition?: number }>> = {};
const documentContent: Record<string, string> = {};
const documentHistory: Record<string, { undoStack: string[]; redoStack: string[] }> = {}; // Undo/Redo stacks

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins a document
    socket.on("join-document", async ({ documentId, userId, name }) => {
        socket.join(documentId);

        if (!activeUsers[documentId]) activeUsers[documentId] = [];
        if (!activeUsers[documentId].some(user => user.userId === userId)) {
            activeUsers[documentId].push({ userId, name, cursorPosition: 0 });
        }

        if (!documentContent[documentId]) {
            const doc = await db.document.findUnique({ where: { id: documentId } });
            documentContent[documentId] = doc?.content || "";
            documentHistory[documentId] = { undoStack: [], redoStack: [] };
        }

        socket.emit("load-document", documentContent[documentId]);
        io.to(documentId).emit("active-users", activeUsers[documentId]);

        console.log(`User ${name} joined document: ${documentId}`);
    });

    socket.on("update-cursor", ({ documentId, userId, position }) => {
        if (activeUsers[documentId]) {
            const user = activeUsers[documentId].find(user => user.userId === userId);
            if (user) user.cursorPosition = position;

            io.to(documentId).emit("cursor-move", activeUsers[documentId]);
        }
    });
    // Handle real-time document editing
    socket.on("edit-document", ({ documentId, content }) => {
        if (!documentHistory[documentId]) {
            documentHistory[documentId] = { undoStack: [], redoStack: [] };
        }

        // Push current content to undo stack before updating
        documentHistory[documentId].undoStack.push(documentContent[documentId]);

        // Clear redo stack (new changes invalidate redo history)
        documentHistory[documentId].redoStack = [];

        // Update document content
        documentContent[documentId] = content;

        // Broadcast update
        socket.to(documentId).emit("document-updated", content);

        // Auto-save document every 5 seconds
        setTimeout(async () => {
            await db.document.update({
                where: { id: documentId },
                data: { content },
            });
        }, 5000);
    });

    // Handle Undo
    socket.on("undo-document", ({ documentId }) => {
        if (!documentHistory[documentId]?.undoStack.length) return;

        // Move the last state to the redo stack
        const lastState = documentHistory[documentId].undoStack.pop();
        documentHistory[documentId].redoStack.push(documentContent[documentId]);

        // Restore document content
        if (lastState) {
            documentContent[documentId] = lastState;
            io.to(documentId).emit("document-updated", lastState);
        }
    });

    // Handle Redo
    socket.on("redo-document", ({ documentId }) => {
        if (!documentHistory[documentId]?.redoStack.length) return;

        // Move the last undone state back to undo stack
        const lastRedoState = documentHistory[documentId].redoStack.pop();
        documentHistory[documentId].undoStack.push(documentContent[documentId]);

        // Restore document content
        if (lastRedoState) {
            documentContent[documentId] = lastRedoState;
            io.to(documentId).emit("document-updated", lastRedoState);
        }
    });

    // User leaves a document
    socket.on("leave-document", ({ documentId, userId }) => {
        if (activeUsers[documentId]) {
            activeUsers[documentId] = activeUsers[documentId].filter(user => user.userId !== userId);
            io.to(documentId).emit("active-users", activeUsers[documentId]);
        }
        socket.leave(documentId);
        console.log(`User ${userId} left document: ${documentId}`);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        for (const documentId in activeUsers) {
            activeUsers[documentId] = activeUsers[documentId].filter(user => user.userId !== socket.id);
            io.to(documentId).emit("active-users", activeUsers[documentId]);
        }
        console.log("A user disconnected:", socket.id);
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})