-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_arquivos_audio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomeOriginal" TEXT NOT NULL,
    "nomeArmazenado" TEXT NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "formato" TEXT NOT NULL,
    "statusProcessamento" TEXT NOT NULL DEFAULT 'PENDENTE',
    "idReuniaoOuTeste" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "transcricao" TEXT,
    "processadoEm" DATETIME,
    "erroProcessamento" TEXT,
    "ataGerada" BOOLEAN NOT NULL DEFAULT false,
    "textoAta" TEXT,
    "statusAta" TEXT,
    "ataGeradaEm" DATETIME,
    "erroAta" TEXT,
    CONSTRAINT "arquivos_audio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_arquivos_audio" ("caminhoArquivo", "createdAt", "erroProcessamento", "formato", "id", "idReuniaoOuTeste", "nomeArmazenado", "nomeOriginal", "processadoEm", "statusProcessamento", "tamanhoBytes", "transcricao", "updatedAt", "usuarioId") SELECT "caminhoArquivo", "createdAt", "erroProcessamento", "formato", "id", "idReuniaoOuTeste", "nomeArmazenado", "nomeOriginal", "processadoEm", "statusProcessamento", "tamanhoBytes", "transcricao", "updatedAt", "usuarioId" FROM "arquivos_audio";
DROP TABLE "arquivos_audio";
ALTER TABLE "new_arquivos_audio" RENAME TO "arquivos_audio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
