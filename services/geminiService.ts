
import { GoogleGenAI } from "@google/genai";
import { BannerContent, ImageAspect } from "../types";
import { storageService } from "./storageService";

interface GenerationResult {
  images: string[];
  content: BannerContent;
}

// Helper to get initialized Gemini client
const getGeminiClient = () => {
  const settings = storageService.getSettings();
  // Prioritize key from Admin Settings, fallback to env variable
  const apiKey = settings.googleApiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Chave da API do Google não configurada. Configure no Painel Admin.");
  }
  return new GoogleGenAI({ apiKey });
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

export const generateBackgroundFromText = async (
  offerText: string,
  highlightText: string,
  aspect: ImageAspect = ImageAspect.SQUARE,
  customImagePrompt: string = '',
  referenceImage: string | null = null,
  skipImageGeneration: boolean = false,
  isPro: boolean = false,
  offerStyle: string = 'custom',
  isolateProduct: boolean = false,
  brandColor: string | undefined = undefined // New param
): Promise<GenerationResult> => {
  
  // 1. Determine Style Modifiers
  let styleKeywords = "";
  switch (offerStyle) {
    case 'luxury':
      styleKeywords = "luxury, elegant, gold and black textures, marble, cinematic lighting, expensive look, bokeh";
      break;
    case 'gourmet':
      styleKeywords = "delicious, gourmet food photography, steam, fresh ingredients, warm lighting, wooden table, appetizing";
      break;
    case 'tech':
      styleKeywords = "futuristic, cyberpunk, neon lights, blue and purple glow, high tech, sleek, modern";
      break;
    case 'minimal':
      styleKeywords = "minimalist, clean lines, vast white space, soft shadows, studio lighting, pastel tones, modern design";
      break;
    case 'organic':
      styleKeywords = "nature, eco friendly, green leaves, sunlight, wooden texture, fresh, organic product photography";
      break;
    default:
      styleKeywords = "";
  }

  // 2. Isolate Product Modifier
  const isolationInstruction = isolateProduct 
    ? "SOLID PLAIN BACKGROUND, product photography studio isolation, neutral background color, no distractions in background, clean cut"
    : "";

  // Brand Color Modifier
  const brandInstruction = brandColor 
    ? `IMPORTANT: The brand color is ${brandColor}. Try to incorporate this color subtly in the background, lighting, or accents.`
    : "";

  // Quality modifiers based on plan
  const qualityInstruction = isPro 
    ? "Visual Quality: MASTERPIECE, 8k resolution, highly detailed, cinematic lighting, award winning photography."
    : "Visual Quality: Standard resolution, simple layout, plain lighting, fast render.";

  const visualStyle = isPro
    ? "Use dynamic angles, depth of field (bokeh) and dramatic studio lighting."
    : "Use simple flat lighting and basic centered composition.";

  // 3. Define Prompt for Text Analysis & Image Prompt Creation
  const systemPrompt = `
    Você é um Copywriter Criativo de Elite e Designer Visual.
    Sua missão: Transformar ofertas comuns em anúncios.
    
    ENTRADA:
    - Oferta: "${offerText}"
    - Destaque sugerido: "${highlightText}"
    - Pedido visual: "${customImagePrompt}"
    - Estilo Solicitado: "${offerStyle}"
    
    DIRETRIZES DE COPYWRITING:
    1. ZERO REDUNDÂNCIA: Nunca repita na Headline o que já está óbvio na imagem ou no subtexto.
    2. GATILHOS MENTAIS: Troque descrições técnicas por sensações e benefícios.
    3. VOCABULÁRIO DE IMPACTO: Use palavras poderosas.
    
    REGRAS ESTRUTURAIS (JSON):
    1. HEADLINE (Máx 4 palavras): O gancho principal.
    2. SUBTEXT (Lista Vertical): Separe itens com \\n.
    3. HIGHLIGHT: Use "${highlightText}" se existir.
    
    REGRAS VISUAIS (Prompt de Imagem) - Nível do Usuário: ${isPro ? 'PRO' : 'GRÁTIS'}:
    1. Crie um prompt em INGLÊS.
    2. INCORPORE O ESTILO: ${styleKeywords}
    3. ${isolationInstruction}
    4. ${brandInstruction}
    5. ${visualStyle}
    6. ${qualityInstruction}
    7. ENQUADRAMENTO: Use "Wide Shot", "Zoom Out", "Uncropped".
    8. ESPAÇO NEGATIVO: Obrigatório deixar espaço para texto.
    
    RETORNE APENAS JSON NESTE FORMATO:
    {
      "headline": "Texto Criativo",
      "subtext": "Benefício 1\\nBenefício 2",
      "highlight": "Destaque",
      "imagePrompt": "English description..."
    }
  `;

  try {
    // --- STEP 1: TEXT & PROMPT GENERATION (Gemini 2.5 Flash) ---
    // Initialize AI Client Dynamically
    const ai = getGeminiClient();
    const modelId = 'gemini-2.5-flash';
    
    const parts: any[] = [{ text: systemPrompt }];
    
    if (referenceImage) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: referenceImage.split(',')[1]
        }
      });
      parts.push({ text: "Analise a imagem acima. O usuário quer RECRIAR esta imagem mantendo o objeto. Crie um 'imagePrompt' para isso combinado com: " + customImagePrompt });
    }

    const textResponse = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        responseMimeType: 'application/json'
      }
    });

    let resultJson: any;
    try {
      resultJson = JSON.parse(cleanText(textResponse.text || '{}'));
    } catch (e) {
      console.error("JSON Parse Error", e);
      resultJson = {
        headline: offerText.split('\n')[0].substring(0, 20),
        subtext: offerText,
        highlight: highlightText || "Oferta",
        imagePrompt: "Simple background"
      };
    }

    // --- STEP 2: IMAGE GENERATION (4 VARIANTS) ---
    let generatedImages: string[] = [];

    if (!skipImageGeneration) {
      const ratioMap: Record<string, string> = {
        [ImageAspect.SQUARE]: '1:1',
        [ImageAspect.PORTRAIT]: '9:16',
        [ImageAspect.LANDSCAPE]: '16:9'
      };
      
      const safeFramingKeywords = isPro 
        ? "wide shot, uncropped, zoom out, safe margin, full bleed, 8k, photorealistic, cinematic" 
        : "wide shot, uncropped, zoom out, standard quality";
        
      // Combine custom prompt + style keywords + isolation instructions
      const imagePrompt = `${resultJson.imagePrompt}. ${styleKeywords}. ${isolationInstruction}. ${brandInstruction}`;

      // Function to generate a single image (wrapped for Promise.all)
      const generateSingleImage = async (index: number): Promise<string | null> => {
        try {
          const imageParts: any[] = [];
          if (referenceImage) {
             imageParts.push({
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: referenceImage.split(',')[1]
                }
             });
             imageParts.push({ 
               text: `Generate a variation (Variant ${index + 1}). Keep main subject. ${imagePrompt}, ${safeFramingKeywords}` 
             });
          } else {
             imageParts.push({ text: `Variant ${index + 1}. ${imagePrompt}, ${safeFramingKeywords}` });
          }

          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: { parts: imageParts },
            config: {
              imageConfig: {
                 aspectRatio: ratioMap[aspect] as any,
              }
            }
          });

          for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
            }
          }
          return null;
        } catch (imgError: any) {
          console.warn(`Gemini Image Variant ${index} Error:`, imgError);
          // Fallback to Pollinations with different seed
          return await generatePollinationsImage(imagePrompt, aspect, index * 100);
        }
      };

      // Run 4 generations in parallel
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
      content: {
        headline: resultJson.headline || "Oferta",
        subtext: resultJson.subtext || offerText,
        highlight: resultJson.highlight || highlightText || "Confira"
      }
    };

  } catch (error: any) {
    console.error("Critical Service Error:", error);
    const fallbackImg = await generatePollinationsImage("abstract gradient background", aspect, 999);
    return {
      images: [fallbackImg],
      content: {
        headline: "Erro na IA",
        subtext: offerText,
        highlight: "Tente Novamente"
      }
    };
  }
};

export const regenerateCopy = async (offerText: string, offerStyle: string): Promise<BannerContent> => {
    const ai = getGeminiClient();
    
    const prompt = `
      Você é um especialista em Copywriting para Varejo.
      Reescreva o texto para esta oferta: "${offerText}"
      Estilo: ${offerStyle}
      
      Regras:
      1. Headline curta (max 4 palavras) e impactante.
      2. Subtexto persuasivo e direto.
      3. Destaque (Highlight) deve ser o preço ou uma chamada de ação curtíssima.
      
      Responda APENAS JSON:
      {
        "headline": "...",
        "subtext": "...",
        "highlight": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    try {
        const json = JSON.parse(cleanText(response.text || '{}'));
        return {
            headline: json.headline || "Oferta",
            subtext: json.subtext || offerText,
            highlight: json.highlight || "Confira"
        };
    } catch (e) {
        return {
            headline: "Nova Oferta",
            subtext: offerText,
            highlight: "Confira"
        };
    }
};
