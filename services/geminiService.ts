
import { GoogleGenAI } from "@google/genai";
import { BannerContent, ImageAspect, OfferAudit, SocialPost, DayPlan, SalesScripts } from "../types";

interface GenerationResult {
  images: string[];
  content: BannerContent;
  audit: OfferAudit;
  socialPost: SocialPost;
  calendar: DayPlan[];
  salesScripts: SalesScripts;
}

// Helper to get initialized Gemini client
const getGeminiClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey: apiKey });
};

// Helper to clean JSON string
const cleanText = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// Helper for Pollinations.ai (Fallback)
const generatePollinationsImage = async (prompt: string, aspect: ImageAspect, seedOffset: number): Promise<string> => {
  const width = aspect === ImageAspect.PORTRAIT ? 768 : aspect === ImageAspect.LANDSCAPE ? 1280 : 1024;
  const height = aspect === ImageAspect.PORTRAIT ? 1344 : aspect === ImageAspect.LANDSCAPE ? 720 : 1024;
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000) + seedOffset;
  return `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
};

export const checkConnection = async (providedKey?: string): Promise<boolean> => {
  try {
    const key = providedKey || process.env.API_KEY;
    if (!key) return false;
    
    const ai = getGeminiClient(key);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: 'ping' }] },
    });
    return !!response.text;
  } catch (e) {
    console.error("AI Connection Check Failed", e);
    return false;
  }
};

export const generateMarketingVideo = async (
    apiKey: string,
    prompt: string,
    aspect: ImageAspect = ImageAspect.LANDSCAPE
): Promise<string> => {
    if (!apiKey) throw new Error("API Key para vídeo não fornecida");

    const ai = getGeminiClient(apiKey);
    
    // Map aspect to Veo supported formats (16:9 or 9:16)
    // Default to 16:9 if square or landscape
    const videoAspect = aspect === ImageAspect.PORTRAIT ? '9:16' : '16:9'; 

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `Cinematic commercial advertisement, high quality, advertising style: ${prompt}`,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: videoAspect as any
        }
    });

    // Poll until done
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Falha ao gerar vídeo.");

    // Append API Key to fetch securely
    const videoUrl = `${downloadLink}&key=${apiKey}`;
    return videoUrl;
};

export const generateBackgroundFromText = async (
  apiKey: string,
  offerText: string,
  highlightText: string,
  aspect: ImageAspect = ImageAspect.SQUARE,
  customImagePrompt: string = '',
  referenceImage: string | null = null,
  skipImageGeneration: boolean = false,
  isPro: boolean = false,
  offerStyle: string = 'custom',
  isolateProduct: boolean = false,
  brandColor: string | undefined = undefined,
  salesStrategy: string = 'benefit',
  isFullCampaign: boolean = false // Novo parametro para controlar complexidade
): Promise<GenerationResult> => {
  
  if (!apiKey) throw new Error("API Key não fornecida");

  // 1. Determine Style Modifiers - Standard High Quality
  let styleKeywords = "";
  switch (offerStyle) {
    case 'luxury':
      styleKeywords = "luxury product photography, elegant, gold and black textures, marble, cinematic lighting, expensive look, bokeh, sharp focus";
      break;
    case 'gourmet':
      styleKeywords = "delicious gourmet food photography, macro shot, steam rising, fresh ingredients, warm lighting, appetizing, depth of field";
      break;
    case 'tech':
      styleKeywords = "futuristic technology product shot, neon lighting, blue and purple glow, sleek, metallic reflections, dark modern background";
      break;
    case 'minimal':
      styleKeywords = "minimalist product photography, clean white background, soft lighting, simple composition, modern design, pastel tones";
      break;
    case 'organic':
      styleKeywords = "natural organic product photography, sunlight, leaves and wood textures, fresh, morning dew, soft natural lighting, eco friendly";
      break;
    case 'rustic':
      styleKeywords = "rustic vintage style, aged wood background, warm tungsten lighting, cozy atmosphere, handmade feel, brown tones";
      break;
    case 'pop':
      styleKeywords = "pop art style, vibrant colors, hard lighting, strong shadows, halftone patterns, comic book aesthetic, bold outlines, energetic";
      break;
    case 'corporate':
      styleKeywords = "corporate professional setting, modern office background, glass and steel, cool blue lighting, clean, trustworthy";
      break;
    case 'fitness':
      styleKeywords = "fitness gym atmosphere, dark background, rim lighting, dynamic energy, sweat texture, high contrast, motivation";
      break;
    case 'kids':
      styleKeywords = "playful kids style, bright pastel colors, soft lighting, balloons and toys background, happy atmosphere, 3d render style";
      break;
    default:
      styleKeywords = "professional product photography, studio lighting, sharp focus, high quality";
  }

  // 2. Sales Strategy Modifiers (Copywriting Tone)
  let strategyInstruction = "";
  switch (salesStrategy) {
      case 'urgency': strategyInstruction = "Foque na ESCASSEZ e TEMPO LIMITADO. Use palavras como 'Só hoje', 'Últimas unidades'."; break;
      case 'exclusive': strategyInstruction = "Foque na EXCLUSIVIDADE e PREMIUM. Use tom sofisticado."; break;
      case 'social_proof': strategyInstruction = "Foque em POPULARIDADE e CONFIANÇA. Use 'O mais vendido', 'Favorito dos clientes'."; break;
      case 'benefit': default: strategyInstruction = "Foque no BENEFÍCIO DIRETO e TRANSFORMAÇÃO para o cliente."; break;
  }

  const isolationInstruction = isolateProduct 
    ? "solid plain background, product isolation, no background distractions, commercial catalog style"
    : "blurred background, depth of field (bokeh) to highlight the subject";

  const brandInstruction = brandColor 
    ? `IMPORTANT: Incorporate the brand color ${brandColor} into the lighting or background accents.`
    : "";

  // Standard Quality Instruction
  const qualityInstruction = isPro 
    ? "Visual Quality: 8k resolution, photorealistic, professional photography, highly detailed, sharp focus."
    : "Visual Quality: High quality product photo, clear lighting, sharp details.";

  // Define tasks based on whether it is a full campaign or just a quick post
  const tasksPrompt = isFullCampaign ? `
    TAREFA 4: PLANEJAMENTO SEMANAL (Valor Agregado)
    Crie 5 ideias de posts para o usuário postar nos dias seguintes para vender este mesmo produto.
    - calendar: Array com 5 objetos {day, theme, idea}. Themes ex: "Educativo", "Prova Social", "Bastidores".

    TAREFA 5: SCRIPTS DE WHATSAPP (Valor Agregado)
    Crie 3 scripts prontos para copiar e colar no WhatsApp.
    - approach: Script para enviar para quem perguntou "preço?".
    - objection: Script para quem disse "tá caro".
    - closing: Script de fechamento com escassez "vai acabar".
  ` : `
    TAREFA 4: PLANEJAMENTO SEMANAL
    Retorne array vazio [] para calendar.
    TAREFA 5: SCRIPTS DE WHATSAPP
    Retorne strings vazias para salesScripts.
  `;

  // 3. Define Prompt for Multi-Tasking (Copy, Image, Audit, Caption)
  const systemPrompt = `
    Você é um Diretor de Marketing e Design de IA.
    
    ENTRADA DO USUÁRIO:
    - Oferta: "${offerText}"
    - Preço/Destaque: "${highlightText}"
    - Estilo Visual: "${offerStyle}"
    - Estratégia de Venda: "${strategyInstruction}"
    - Pedido extra imagem: "${customImagePrompt}"
    
    TAREFA 1: COPYWRITING (Banner)
    Crie o texto para o banner seguindo a estratégia "${strategyInstruction}".
    - Headline: Máx 4 palavras. Impactante.
    - Subtext: Benefícios curtos (separados por \\n).
    - Highlight: O preço ou chamada forte.

    TAREFA 2: COACH DE VENDAS (Auditoria)
    Analise a oferta original do usuário.
    - Dê uma nota de 0 a 100 (score).
    - Liste 2 pontos fortes (strengths).
    - Liste 2 melhorias urgentes (improvements) para vender mais.
    - Um veredito curto de 1 frase (verdict).

    TAREFA 3: POST SOCIAL (Instagram/Zap)
    Crie uma legenda vendedora para essa oferta.
    - Use emojis.
    - Texto persuasivo curto.
    - 5 Hashtags relevantes.

    ${tasksPrompt}

    TAREFA 6: PROMPT VISUAL (Inglês)
    Crie um prompt VISUAL DETALHADO para gerar a imagem de fundo.
    - Descreva a iluminação, texturas e composição.
    - Baseie-se no estilo: ${styleKeywords}
    - ${isolationInstruction}
    - ${brandInstruction}

    RETORNE APENAS JSON NESTE FORMATO EXATO:
    {
      "banner": { "headline": "...", "subtext": "...", "highlight": "..." },
      "audit": { "score": 85, "strengths": ["...", "..."], "improvements": ["...", "..."], "verdict": "..." },
      "social": { "caption": "...", "hashtags": ["#...", "#..."] },
      "calendar": [
         { "day": "Dia 1", "theme": "...", "idea": "..." },
         ...
      ],
      "salesScripts": {
         "approach": "...",
         "objection": "...",
         "closing": "..."
      },
      "imagePrompt": "English prompt..."
    }
  `;

  try {
    // --- STEP 1: TEXT GENERATION (Gemini 2.5 Flash) ---
    const ai = getGeminiClient(apiKey);
    const modelId = 'gemini-2.5-flash';
    
    const parts: any[] = [{ text: systemPrompt }];
    
    if (referenceImage) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: referenceImage.split(',')[1]
        }
      });
      parts.push({ text: "Analise a imagem acima. O usuário quer RECRIAR esta imagem mantendo o objeto. Adapte o 'imagePrompt' para isso." });
    }

    const textResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: { responseMimeType: 'application/json' }
    });

    let resultJson: any;
    try {
      resultJson = JSON.parse(cleanText(textResponse.text || '{}'));
    } catch (e) {
      console.error("JSON Parse Error", e);
      resultJson = {
        banner: { headline: "Oferta", subtext: offerText, highlight: highlightText },
        audit: { score: 50, strengths: ["Produto claro"], improvements: ["Seja mais específico"], verdict: "Oferta básica." },
        social: { caption: offerText, hashtags: ["#oferta"] },
        calendar: [],
        salesScripts: { approach: "", objection: "", closing: "" },
        imagePrompt: "Simple background"
      };
    }

    // Ensure structure exists even if AI hallucinates structure
    const content = resultJson.banner || { headline: "Oferta", subtext: offerText, highlight: highlightText };
    const audit = resultJson.audit || { score: 70, strengths: ["Boa intenção"], improvements: ["Melhorar clareza"], verdict: "Pode melhorar." };
    const socialPost = resultJson.social || { caption: offerText, hashtags: [] };
    const calendar = resultJson.calendar || [];
    const salesScripts = resultJson.salesScripts || { approach: "Olá!", objection: "Podemos negociar.", closing: "Últimas peças." };

    // --- STEP 2: IMAGE GENERATION ---
    let generatedImages: string[] = [];

    if (!skipImageGeneration) {
      const ratioMap: Record<string, string> = {
        [ImageAspect.SQUARE]: '1:1',
        [ImageAspect.PORTRAIT]: '9:16',
        [ImageAspect.LANDSCAPE]: '16:9'
      };
      
      // CONSTRUCT PROMPT
      const imagePrompt = `Professional commercial photography of ${offerText}. ${resultJson.imagePrompt}. ${styleKeywords}. ${isolationInstruction}. ${brandInstruction}. ${qualityInstruction}`;

      const generateSingleImage = async (index: number): Promise<string | null> => {
        try {
          const imageParts: any[] = [];
          if (referenceImage) {
             imageParts.push({
                inlineData: { mimeType: 'image/jpeg', data: referenceImage.split(',')[1] }
             });
             imageParts.push({ text: `Variant ${index + 1}. ${imagePrompt}` });
          } else {
             imageParts.push({ text: `Variant ${index + 1}. ${imagePrompt}` });
          }

          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: { parts: imageParts },
            config: { imageConfig: { aspectRatio: ratioMap[aspect] as any } }
          });

          for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
          return null;
        } catch (imgError: any) {
          console.warn(`Gemini Image Variant ${index} Error:`, imgError);
          return await generatePollinationsImage(imagePrompt, aspect, index * 100);
        }
      };

      const imagePromises = Array(4).fill(0).map((_, i) => generateSingleImage(i));
      const results = await Promise.all(imagePromises);
      generatedImages = results.filter((img): img is string => img !== null);
      
      if (generatedImages.length === 0) {
        generatedImages.push(await generatePollinationsImage(imagePrompt || "abstract", aspect, 0));
      }

    } else {
      generatedImages = [];
    }

    return {
      images: generatedImages,
      content,
      audit,
      socialPost,
      calendar,
      salesScripts
    };

  } catch (error: any) {
    console.error("Critical Service Error:", error);
    const fallbackImg = await generatePollinationsImage("abstract gradient background", aspect, 999);
    return {
      images: [fallbackImg],
      content: { headline: "Erro na IA", subtext: offerText, highlight: "Tente Novamente" },
      audit: { score: 0, strengths: [], improvements: ["Erro de conexão"], verdict: "Erro" },
      socialPost: { caption: "Erro ao gerar legenda.", hashtags: [] },
      calendar: [],
      salesScripts: { approach: "Erro", objection: "Erro", closing: "Erro" }
    };
  }
};

export const regenerateCopy = async (apiKey: string, offerText: string, offerStyle: string): Promise<BannerContent> => {
    const ai = getGeminiClient(apiKey);
    const prompt = `Reescreva oferta: "${offerText}". Estilo: ${offerStyle}. JSON: {headline, subtext, highlight}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    try {
        return JSON.parse(cleanText(response.text || '{}'));
    } catch (e) {
        return { headline: "Nova Oferta", subtext: offerText, highlight: "Confira" };
    }
};
