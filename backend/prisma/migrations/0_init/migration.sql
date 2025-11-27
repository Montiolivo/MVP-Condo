-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "arquivos_audio" (
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
    CONSTRAINT "arquivos_audio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
