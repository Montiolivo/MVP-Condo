import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Verifica se a API Key do Groq está configurada
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Gera uma ata estruturada a partir do texto da transcrição
 * @param transcricao Texto completo da transcrição
 * @returns Objeto com a ata gerada
 */
export async function generateAta(transcricao: string): Promise<{ ata: string }> {
  if (!isGroqConfigured()) {
    throw new Error('API Key do Groq não está configurada. Configure GROQ_API_KEY no arquivo .env');
  }

  if (!transcricao || transcricao.trim().length === 0) {
    throw new Error('Transcrição vazia ou inválida');
  }

  // Limitar tamanho da transcrição para evitar erro 413
  const maxTranscricaoLength = 12000; // ~3000 tokens
  const transcricaoTruncada = transcricao.length > maxTranscricaoLength 
    ? transcricao.substring(0, maxTranscricaoLength) + '\n\n[TRANSCRIÇÃO TRUNCADA - CONTEÚDO MUITO LONGO]'
    : transcricao;

  const prompt = `Analise a transcrição e gere uma ata formal com seções: ABERTURA, PRESENTES, PAUTA, DISCUSSÕES, DECISÕES, ENCERRAMENTO.

TRANSCRIÇÃO:
${transcricaoTruncada}

Gere a ata:`;

  try {
    console.log('🤖 Iniciando geração da ata com Groq...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Assistente especializado em atas de reunião de condomínios.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 4000, // Reduzido para caber no limite
      top_p: 1,
      stream: false,
    });

    const ataGerada = chatCompletion.choices[0]?.message?.content || '';

    if (!ataGerada || ataGerada.trim().length === 0) {
      throw new Error('Groq retornou uma resposta vazia');
    }

    console.log('✅ Ata gerada com sucesso');
    console.log(`📊 Tamanho da ata: ${ataGerada.length} caracteres`);

    return {
      ata: ataGerada.trim(),
    };
  } catch (error: any) {
    console.error('❌ Erro ao gerar ata:', error);

    // Tratamento de erros específicos do Groq
    if (error.status === 401) {
      throw new Error('API Key do Groq inválida');
    } else if (error.status === 429) {
      throw new Error('Limite de requisições do Groq excedido. Tente novamente em alguns instantes.');
    } else if (error.status === 500) {
      throw new Error('Erro interno do servidor Groq');
    }

    throw new Error(`Erro ao gerar ata: ${error.message}`);
  }
}
