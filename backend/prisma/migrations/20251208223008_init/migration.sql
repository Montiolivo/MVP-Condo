-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arquivos_audio` (
    `id` VARCHAR(191) NOT NULL,
    `nomeOriginal` VARCHAR(191) NOT NULL,
    `nomeArmazenado` VARCHAR(191) NOT NULL,
    `caminhoArquivo` VARCHAR(191) NOT NULL,
    `tamanhoBytes` INTEGER NOT NULL,
    `formato` VARCHAR(191) NOT NULL,
    `statusProcessamento` VARCHAR(191) NOT NULL DEFAULT 'PENDENTE',
    `idReuniaoOuTeste` VARCHAR(191) NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `transcricao` VARCHAR(191) NULL,
    `processadoEm` DATETIME(3) NULL,
    `erroProcessamento` VARCHAR(191) NULL,
    `ataGerada` BOOLEAN NOT NULL DEFAULT false,
    `textoAta` VARCHAR(191) NULL,
    `statusAta` VARCHAR(191) NULL,
    `ataGeradaEm` DATETIME(3) NULL,
    `erroAta` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `arquivos_audio` ADD CONSTRAINT `arquivos_audio_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
