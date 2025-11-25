create database code_intelligence;

use code_intelligence;

-- ============================
-- Tabela: usuario
-- ============================
CREATE TABLE usuario (
    usuario_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,            -- usuarioId
    nome_completo VARCHAR(150) NOT NULL,                           -- nomeCompleto
    cpf VARCHAR(11) NOT NULL UNIQUE,                               -- cpf
    email VARCHAR(150) NOT NULL UNIQUE,                            -- email
    telefone VARCHAR(20),                                          -- telefone
    perfil ENUM('admin','sindico','administrador','usuario','pendente') NOT NULL, -- perfil
    senha_hash VARCHAR(255) NOT NULL,                              -- senhaHash
    ativo BOOLEAN NOT NULL,                                        -- ativo
    primeiro_acesso BOOLEAN NOT NULL,                              -- primeiroAcesso
    tentativas_login INT NOT NULL,                                 -- tentativasLogin
    bloqueado_ate DATETIME,                                        -- bloqueadoAte
    ultimo_acesso_em DATETIME,                                     -- ultimoAcessoEm
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,                                -- dataCriacao
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP                           -- dataAtualizacao
);

-- ============================
-- Tabela: token_redefinicao_senha
-- ============================
CREATE TABLE token_redefinicao_senha (
    token_redefinicao_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- tokenRedefinicaoId
    usuario_id INT NOT NULL,                                       -- usuarioId
    token_hash VARCHAR(255) NOT NULL,                              -- tokenHash
    data_criacao DATETIME NOT NULL,                                -- dataCriacao
    data_expiracao DATETIME NOT NULL,                              -- dataExpiracao
    utilizado BOOLEAN NOT NULL,                                    -- utilizado
    origem ENUM('EsqueciSenha','PrimeiroAcesso') NOT NULL,         -- origem
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id)
);

-- ============================
-- Tabela: perfil
-- ============================
CREATE TABLE perfil (
    perfil_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,             -- perfilId
    nome_perfil VARCHAR(50) NOT NULL,                              -- nomePerfil
    descricao VARCHAR(255),                                        -- descricao
    ativo BOOLEAN NOT NULL                                         -- ativo
);

-- ============================
-- Tabela: funcionalidade
-- ============================
CREATE TABLE funcionalidade (
    funcionalidade_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,     -- funcionalidadeId
    codigo VARCHAR(100) NOT NULL,                                  -- codigo
    nome VARCHAR(100) NOT NULL,                                    -- nome
    descricao VARCHAR(255),                                        -- descricao
    ativo BOOLEAN NOT NULL                                         -- ativo
);

-- ============================
-- Tabela: perfil_permissao
-- ============================
CREATE TABLE perfil_permissao (
    perfil_permissao_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- perfilPermissaoId
    perfil_id INT NOT NULL,                                        -- perfilId
    funcionalidade_id INT NOT NULL,                                -- funcionalidadeId
    FOREIGN KEY (perfil_id) REFERENCES perfil(perfil_id),
    FOREIGN KEY (funcionalidade_id) REFERENCES funcionalidade(funcionalidade_id)
);

-- ============================
-- Tabela: condominio
-- ============================
CREATE TABLE condominio (
    condominio_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,         -- condominioId
    nome_condominio VARCHAR(255) NOT NULL,                         -- nomeCondominio
    endereco VARCHAR(255) NOT NULL,                                -- endereco
    sindico_id INT NOT NULL,                                       -- sindicoId
    administrador_id INT,                                          -- administradorId
    regimento_url_pdf VARCHAR(255),                                -- regimentoUrlPdf
    ativo BOOLEAN NOT NULL,                                        -- ativo
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,                                -- dataCriacao
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,                           -- dataAtualizacao
    FOREIGN KEY (sindico_id) REFERENCES usuario(usuario_id),
    FOREIGN KEY (administrador_id) REFERENCES usuario(usuario_id)
);

-- ============================
-- Tabela: modelo_cabecalho
-- ============================
CREATE TABLE modelo_cabecalho (
    modelo_cabecalho_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- modeloCabecalhoId
    nome_modelo VARCHAR(255) NOT NULL,                             -- nomeModelo
    logo_url VARCHAR(255),                                         -- logoUrl
    titulo_padrao VARCHAR(255) NOT NULL,                           -- tituloPadrao
    corpo_cabecalho TEXT NOT NULL,                                 -- corpoCabecalho
    ativo BOOLEAN NOT NULL                                         -- ativo
);

-- ============================
-- Tabela: modelo_descricao
-- ============================
CREATE TABLE modelo_descricao (
    modelo_descricao_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- modeloDescricaoId
    nome_modelo VARCHAR(255) NOT NULL,                             -- nomeModelo
    texto_descricao TEXT NOT NULL,                                 -- textoDescricao
    usa_reservadas BOOLEAN NOT NULL,                               -- usaReservadas
    ativo BOOLEAN NOT NULL                                         -- ativo
);

-- ============================
-- Tabela: edital
-- ============================
CREATE TABLE edital (
    edital_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,             -- editalId
    condominio_id INT NOT NULL,                                    -- condominioId
    modelo_cabecalho_id INT NOT NULL,                              -- modeloCabecalhoId
    modelo_descricao_id INT NOT NULL,                              -- modeloDescricaoId
    titulo_edital VARCHAR(255) NOT NULL,                           -- tituloEdital
    data_assembleia DATE NOT NULL,                                 -- dataAssembleia
    horario_primeira_chamada TIME NOT NULL,                        -- horarioPrimeiraChamada
    horario_segunda_chamada TIME NOT NULL,                         -- horarioSegundaChamada
    local_assembleia VARCHAR(255) NOT NULL,                        -- localAssembleia
    status ENUM('rascunho','publicado','finalizado','cancelado') NOT NULL, -- status
    texto_gerado TEXT,                                             -- textoGerado
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,                                -- dataCriacao
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,                           -- dataAtualizacao
    FOREIGN KEY (condominio_id) REFERENCES condominio(condominio_id),
    FOREIGN KEY (modelo_cabecalho_id) REFERENCES modelo_cabecalho(modelo_cabecalho_id),
    FOREIGN KEY (modelo_descricao_id) REFERENCES modelo_descricao(modelo_descricao_id)
);

-- ============================
-- Tabela: item_edital
-- ============================
CREATE TABLE item_edital (
    item_edital_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,        -- itemEditalId
    edital_id INT NOT NULL,                                        -- editalId
    ordem INT NOT NULL,                                            -- ordem
    descricao_item TEXT NOT NULL,                                  -- descricaoItem
    aprovado_ata BOOLEAN,                                          -- aprovadoAta
    FOREIGN KEY (edital_id) REFERENCES edital(edital_id)
);

-- ============================
-- Tabela: palavra_reservada_descricao
-- ============================
CREATE TABLE palavra_reservada_descricao (
    palavra_reservada_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- palavraReservadaId
    chave VARCHAR(255) NOT NULL,                                   -- chave
    descricao VARCHAR(255) NOT NULL,                               -- descricao
    origem_dado ENUM('Condominio','Edital') NOT NULL               -- origemDado
);

-- ============================
-- Tabela: nota
-- ============================
CREATE TABLE nota (
    nota_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,               -- notaId
    edital_id INT NOT NULL,                                        -- editalId
    descricao_nota TEXT NOT NULL,                                  -- descricaoNota
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,                                -- dataCriacao
    data_atualizacao DATETIME NOT NULL ON UPDATE CURRENT_TIMESTAMP,                           -- dataAtualizacao
    FOREIGN KEY (edital_id) REFERENCES edital(edital_id)
);

-- ============================
-- Tabela: item_nota
-- ============================
CREATE TABLE item_nota (
    item_nota_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,          -- itemNotaId
    nota_id INT NOT NULL,                                          -- notaId
    ordem INT NOT NULL,                                            -- ordem
    descricao_item TEXT NOT NULL,                                  -- descricaoItem
    FOREIGN KEY (nota_id) REFERENCES nota(nota_id)
);

-- ============================
-- Tabela: arquivo_audio
-- ============================
CREATE TABLE arquivo_audio (
    arquivo_audio_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,      -- arquivoAudioId
    edital_id INT NOT NULL,                                        -- editalId
    usuario_upload_id INT NOT NULL,                                -- usuarioUploadId
    caminho_arquivo VARCHAR(255) NOT NULL,                         -- caminhoArquivo
    nome_original VARCHAR(255) NOT NULL,                           -- nomeOriginal
    duracao_segundos INT,                                          -- duracaoSegundos
    tamanho_bytes BIGINT,                                          -- tamanhoBytes
    status_processamento ENUM('pendente','processando','concluido','erro') NOT NULL, -- statusProcessamento
    mensagem_erro VARCHAR(255),                                    -- mensagemErro
    data_upload DATETIME NOT NULL,                                 -- dataUpload
    data_processamento DATETIME,                                   -- dataProcessamento
    FOREIGN KEY (edital_id) REFERENCES edital(edital_id),
    FOREIGN KEY (usuario_upload_id) REFERENCES usuario(usuario_id)
);

-- ============================
-- Tabela: transcricao
-- ============================
CREATE TABLE transcricao (
    transcricao_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,        -- transcricaoId
    arquivo_audio_id INT NOT NULL,                                 -- arquivoAudioId
    texto_transcrito TEXT NOT NULL,                                -- textoTranscrito
    confianca_global DECIMAL(5,2),                                 -- confiancaGlobal
    idioma_detectado VARCHAR(10),                                  -- idiomaDetectado
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,                                -- dataCriacao
    FOREIGN KEY (arquivo_audio_id) REFERENCES arquivo_audio(arquivo_audio_id)
);

-- ============================
-- Tabela: ata
-- ============================
CREATE TABLE ata (
    ata_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,                -- ataId
    edital_id INT NOT NULL,                                        -- editalId
    transcricao_id INT,                                            -- transcricaoId
    texto_ata TEXT NOT NULL,                                       -- textoAta
    status_ata ENUM('rascunho','emValidacao','finalizada','reprovada') NOT NULL, -- statusAta
    usuario_validacao_id INT,                                      -- usuarioValidacaoId
    data_validacao DATETIME,                                       -- dataValidacao
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,      -- dataCriacao
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- dataAtualizacao
    FOREIGN KEY (edital_id) REFERENCES edital(edital_id),
    FOREIGN KEY (transcricao_id) REFERENCES transcricao(transcricao_id),
    FOREIGN KEY (usuario_validacao_id) REFERENCES usuario(usuario_id)
);

-- ============================
-- Tabela: log_acesso
-- ============================
CREATE TABLE log_acesso (
    log_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,                -- logId
    usuario_id INT NOT NULL,                                       -- usuarioId
    acao VARCHAR(255) NOT NULL,                                    -- acao
    entidade VARCHAR(255),                                         -- entidade
    entidade_id INT,                                               -- entidadeId
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,      -- dataCriacao
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id)
);

