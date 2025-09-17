import React, { useState, useCallback, useEffect } from 'react';
import type { Mode, CreateFunction, EditFunction, ImageData, FunctionCardData } from './types';
// FIX: Removed `initGemini` as it's no longer needed. Gemini service is now auto-initialized.
import { generateImageFromText, editImageWithPrompt } from '@services/geminiService';

// --- ICON COMPONENTS ---
const PromptIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19h16M6 3h12v14H6z"/><path d="M8 7h8M8 11h8"/>
  </svg>
);
const StickerIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3h7l7 7v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"/>
    <path d="M14 3v5a2 2 0 0 0 2 2h5"/>
  </svg>
);
const LogoIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M10 6v12M14 6v12M6 18h12"/>
  </svg>
);
const ComicIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h12v10H3z"/><path d="M15 7l6-2v10l-6 2z"/><path d="M5 9h8M5 12h6"/>
  </svg>
);
const ThumbnailIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
);
const AdvertisementIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11v2a2 2 0 0 0 2 2h2l4 4V5l-4 4H5a2 2 0 0 0-2 2z"/>
    <path d="M14 5a4 4 0 0 1 0 14"/>
    <path d="M18 9a8 8 0 0 1 0 6"/>
  </svg>
);
const AddRemoveIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const RetouchIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22l6-6"/><path d="M3 16l5 5"/><path d="M14.5 2.5l7 7-9.5 9.5H5v-7z"/>
  </svg>
);
const StyleIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a7 7 0 1 1-10.8-8.4"/>
  </svg>
);
const ComposeIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="7" width="10" height="10" rx="1"/><rect x="11" y="3" width="10" height="10" rx="1"/>
  </svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

// --- CONSTANTS ---
const createFunctions: FunctionCardData[] = [
  { id: 'free', name: 'Prompt', icon: <PromptIcon /> },
  { id: 'sticker', name: 'Figura', icon: <StickerIcon /> },
  { id: 'text', name: 'Logo', icon: <LogoIcon /> },
  { id: 'comic', name: 'Desenho', icon: <ComicIcon /> },
  { id: 'thumbnail', name: 'Thumbnail', icon: <ThumbnailIcon /> },
  { id: 'advertisement', name: 'Publicidade', icon: <AdvertisementIcon /> },
];

const editFunctions: FunctionCardData[] = [
  { id: 'add-remove', name: 'Adicionar', icon: <AddRemoveIcon /> },
  { id: 'retouch', name: 'Retoque', icon: <RetouchIcon /> },
  { id: 'style', name: 'Estilo', icon: <StyleIcon /> },
  { id: 'compose', name: 'Mesclar', icon: <ComposeIcon />, requiresTwo: true },
];

// --- HELPER COMPONENTS (defined outside App to prevent re-renders) ---
interface FunctionCardProps {
  data: FunctionCardData;
  isActive: boolean;
  onClick: () => void;
}
const FunctionCard: React.FC<FunctionCardProps> = ({ data, isActive, onClick }) => (
    <div
      className={`function-card p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center ${isActive ? 'bg-[#0878d8]/10 border-[#0878d8] text-[#0878d8]' : 'bg-gray-800 border-gray-700 hover:border-[#0878d8] hover:bg-gray-700/50'}`}
      onClick={onClick}
    >
        <div className="icon">{data.icon}</div>
        <div className="name font-semibold text-sm">{data.name}</div>
    </div>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  // FIX: Removed state related to API key management to align with security guidelines.
  // The API key is now handled exclusively via environment variables.

  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<Mode>('create');
  const [activeCreateFunc, setActiveCreateFunc] = useState<CreateFunction>('free');
  const [activeEditFunc, setActiveEditFunc] = useState<EditFunction>('add-remove');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  
  const [image1, setImage1] = useState<ImageData | null>(null);
  const [image2, setImage2] = useState<ImageData | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const showTwoImagesSection = mode === 'edit' && activeEditFunc === 'compose';
  const showSingleImageUpload = mode === 'edit' && activeEditFunc !== 'compose';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageSlot: 1 | 2 | 'single') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              const imageData: ImageData = {
                  base64: base64String,
                  mimeType: file.type,
                  name: file.name
              };
              if (imageSlot === 1) setImage1(imageData);
              else if (imageSlot === 2) setImage2(imageData);
              else setImage1(imageData);
          };
          reader.readAsDataURL(file);
      }
  };

  const getFullPrompt = useCallback(() => {
    if (mode === 'create') {
        switch (activeCreateFunc) {
            case 'sticker': return `Die-cut sticker of ${prompt}, cartoon style, vibrant colors, white background, high quality.`;
            case 'text': return `Minimalist vector logo for a company called "${prompt}", clean, black and white, professional design.`;
            case 'comic': return `Comic book style panel of ${prompt}, vibrant colors, dynamic action, detailed illustration.`;
            case 'thumbnail': return `High-quality, clickable YouTube thumbnail for a video titled "${prompt}". Visually appealing, vibrant colors, clear subject, and text that is easy to read.`;
            case 'advertisement': return `High-quality, professional advertisement image for a product/service described as: ${prompt}. Focus on appealing visuals, clear product presentation, and a persuasive mood.`;
            default: return prompt;
        }
    } else { // edit mode
        switch (activeEditFunc) {
            case 'retouch': return `Subtly retouch this image to enhance its quality, fix minor blemishes, and improve lighting. Do not make major changes.`;
            case 'style': return `Redraw this image in the style of ${prompt}.`;
            case 'compose': return `Creatively merge the first image with the second image. The theme is: ${prompt}.`;
            default: return prompt; // for add-remove
        }
    }
  }, [prompt, mode, activeCreateFunc, activeEditFunc]);

  const generateImage = async () => {
      setError('');
      if (!prompt) {
          setError('Por favor, insira um prompt.');
          return;
      }
      if (mode === 'edit' && !image1) {
          setError('Por favor, carregue uma imagem para editar.');
          return;
      }
      if (showTwoImagesSection && (!image1 || !image2)) {
          setError('Por favor, carregue duas imagens para mesclar.');
          return;
      }

      setIsLoading(true);
      setGeneratedImage(null);

      try {
          const fullPrompt = getFullPrompt();
          let resultUrl: string;
          if (mode === 'create') {
              resultUrl = await generateImageFromText(fullPrompt, aspectRatio);
          } else {
              resultUrl = await editImageWithPrompt(fullPrompt, image1!, image2);
          }
          setGeneratedImage(resultUrl);
          setHistory(prev => [resultUrl, ...prev].slice(0, 20));
          if (window.innerWidth < 768) {
              setIsMobileModalOpen(true);
          }
      } catch (e: any) {
          setError(`Ocorreu um erro: ${e.message}`);
      } finally {
          setIsLoading(false);
      }
  };
  
  const downloadImage = () => {
      if (generatedImage) {
          const link = document.createElement('a');
          link.href = generatedImage;
          link.download = 'generated-image.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  const editCurrentImage = () => {
      if (generatedImage) {
          const data = generatedImage.split(',')[1];
          const mimeType = generatedImage.match(/:(.*?);/)?.[1] || 'image/png';
          setImage1({ base64: data, mimeType, name: 'generated-image.png' });
          setMode('edit');
          setActiveEditFunc('add-remove');
          setGeneratedImage(null);
      }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  useEffect(() => {
    // Reset images when switching modes or functions
    setImage1(null);
    setImage2(null);
    setGeneratedImage(null);
  }, [mode, activeCreateFunc, activeEditFunc]);

  useEffect(() => {
    // Set default aspect ratio based on create function
    if (mode === 'create') {
        if (activeCreateFunc === 'thumbnail') {
            setAspectRatio('16:9');
        } else {
            setAspectRatio('1:1');
        }
    }
  }, [activeCreateFunc, mode]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white font-sans">
      {/* Left Panel */}
      <div className="left-panel md:w-1/3 lg:w-1/4 xl:w-1/5 p-6 bg-black border-r border-gray-800 flex flex-col futuristic-scrollbar overflow-y-auto">
        <header>
          <h1 className="panel-title text-2xl font-bold text-[#0878d8]">Robertin AI Studio</h1>
          <p className="panel-subtitle text-sm text-gray-400 mb-6">Gerador profissional de imagens</p>
        </header>

        <div className="prompt-section mb-6">
          <div className="section-title font-semibold mb-2 text-gray-300">Qual a sua ideia:</div>
          <textarea
            id="prompt"
            className="prompt-input w-full h-24 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-[#0878d8] transition-colors duration-200 resize-none"
            placeholder="Ex: Um mestre da IA demitindo 30 empregados..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
        </div>
        
        <div className="mode-toggle mb-6 flex bg-gray-800 rounded-lg p-1 border border-gray-700">
          <button
            className={`mode-btn w-1/2 p-2 rounded-md font-bold transition-colors duration-300 ${mode === 'create' ? 'bg-[#0878d8] text-white' : 'hover:bg-gray-700'}`}
            data-mode="create"
            onClick={() => setMode('create')}
          >
            CRIAR
          </button>
          <button
            className={`mode-btn w-1/2 p-2 rounded-md font-bold transition-colors duration-300 ${mode === 'edit' ? 'bg-[#0878d8] text-white' : 'hover:bg-gray-700'}`}
            data-mode="edit"
            onClick={() => setMode('edit')}
          >
            EDITAR
          </button>
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <div className="dynamic-content flex-grow flex flex-col">
            {mode === 'create' && (
                <>
                    <div id="createFunctions" className="functions-section mb-6">
                        <div className="functions-grid grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {createFunctions.map(func => (
                                <FunctionCard key={func.id} data={func} isActive={activeCreateFunc === func.id} onClick={() => setActiveCreateFunc(func.id as CreateFunction)} />
                            ))}
                        </div>
                    </div>
                    <div className="aspect-ratio-section mb-6">
                        <div className="section-title font-semibold mb-2 text-gray-300">Proporção da Imagem</div>
                        <div className="flex gap-3">
                            {(['1:1', '16:9', '9:16'] as const).map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio)}
                                    className={`flex-1 p-2 rounded-lg font-semibold text-sm border-2 transition-colors duration-200 ${
                                        aspectRatio === ratio
                                        ? 'bg-[#0878d8]/10 border-[#0878d8] text-[#0878d8]'
                                        : 'bg-gray-800 border-gray-700 hover:border-[#0878d8] hover:bg-gray-700/50'
                                    }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {mode === 'edit' && !showTwoImagesSection && (
                <div id="editFunctions" className="functions-section mb-6">
                    <div className="functions-grid grid grid-cols-2 gap-3">
                        {editFunctions.map(func => (
                            <FunctionCard key={func.id} data={func} isActive={activeEditFunc === func.id} onClick={() => setActiveEditFunc(func.id as EditFunction)} />
                        ))}
                    </div>
                </div>
            )}
            
            {showTwoImagesSection && (
              <div id="twoImagesSection" className="functions-section mb-6">
                <div className="section-title font-semibold mb-2 text-gray-300">Duas Imagens Necessárias</div>
                <div className='flex gap-3'>
                    <div className="upload-area-dual flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#0878d8]" onClick={() => document.getElementById('imageUpload1')?.click()}>
                        {!image1 ? <>
                            <UploadIcon className='w-8 h-8 text-gray-400 mb-2'/>
                            <span className='font-bold'>Primeira Imagem</span>
                            <span className="upload-text text-xs text-gray-500">Clique para selecionar</span>
                        </> : <img id="imagePreview1" src={`data:${image1.mimeType};base64,${image1.base64}`} className="image-preview w-full h-24 object-cover rounded-md"/>}
                         <input type="file" id="imageUpload1" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 1)} />
                    </div>
                    <div className="upload-area-dual flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#0878d8]" onClick={() => document.getElementById('imageUpload2')?.click()}>
                        {!image2 ? <>
                            <UploadIcon className='w-8 h-8 text-gray-400 mb-2'/>
                            <span className='font-bold'>Segunda Imagem</span>
                            <span className="upload-text text-xs text-gray-500">Clique para selecionar</span>
                        </> : <img id="imagePreview2" src={`data:${image2.mimeType};base64,${image2.base64}`} className="image-preview w-full h-24 object-cover rounded-md"/>}
                        <input type="file" id="imageUpload2" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 2)} />
                    </div>
                </div>
                <button className="back-btn mt-4 text-[#0878d8] hover:opacity-80" onClick={() => setActiveEditFunc('add-remove')}>← Voltar para Edição</button>
              </div>
            )}
            
            {showSingleImageUpload && (
                <div id="uploadArea" className="upload-area flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-[#0878d8]" onClick={() => document.getElementById('imageUpload')?.click()}>
                    {!image1 ? <>
                        <UploadIcon className='w-10 h-10 text-gray-400 mb-2'/>
                        <span className='font-bold'>Clique ou arraste uma imagem</span>
                        <span className="upload-text text-xs text-gray-500">PNG, JPG, WebP (máx. 10MB)</span>
                    </> : <img id="imagePreview" src={`data:${image1.mimeType};base64,${image1.base64}`} className="image-preview w-full h-32 object-cover rounded-md"/>}
                    <input type="file" id="imageUpload" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'single')} />
                </div>
            )}
        </div>
        
        <div className="mt-auto pt-6"> {/* Wrapper for bottom content */}
            <div className="history-section mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="section-title font-semibold text-gray-300 text-sm">Histórico</div>
                    {history.length > 0 && (
                        <button onClick={clearHistory} className="text-gray-400 hover:text-red-400 transition-colors" title="Limpar histórico">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {history.length > 0 ? (
                    <div className="history-grid futuristic-scrollbar flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {history.map((imgSrc, index) => (
                            <img
                                key={index}
                                src={imgSrc}
                                alt={`Generated image ${index + 1}`}
                                className={`flex-shrink-0 w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all ${
                                    generatedImage === imgSrc ? 'border-[#0878d8]' : 'border-transparent hover:border-gray-500'
                                }`}
                                onClick={() => setGeneratedImage(imgSrc)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 text-center py-2 bg-gray-800/50 rounded-lg">Seu histórico aparecerá aqui.</p>
                )}
            </div>

            {error && <p className="text-red-400 text-sm my-4">{error}</p>}
            
            <button id="generateBtn" className="generate-btn w-full bg-[#0878d8] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#076abf] transition-colors duration-300 flex items-center justify-center disabled:bg-gray-500" onClick={generateImage} disabled={isLoading}>
              {isLoading ? <div className="spinner w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : <span className="btn-text">Gerar Imagem</span>}
            </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel flex-grow p-6 flex items-center justify-center bg-black relative">
        {!generatedImage && !isLoading && (
            <div id="resultPlaceholder" className="result-placeholder text-center text-gray-500">
                <div className="result-placeholder-icon text-6xl mb-4">🎨</div>
                <div>Sua obra de arte aparecerá aqui</div>
            </div>
        )}
        {isLoading && (
            <div id="loadingContainer" className="loading-container text-center">
                <div className="loading-spinner w-16 h-16 border-8 border-[#0878d8] border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="loading-text text-lg text-[#0878d8]">Gerando sua imagem...</div>
            </div>
        )}
        {generatedImage && (
            <div id="imageContainer" className="image-container relative w-full h-full flex items-center justify-center">
                <img id="generatedImage" src={generatedImage} alt="Generated art" className="generated-image max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-[#0878d8]/20"/>
                <div className="image-actions absolute bottom-4 right-4 hidden md:flex gap-3">
                    <button className="action-btn bg-gray-800/80 p-3 rounded-full hover:bg-[#0878d8] hover:text-white transition-all" title="Editar" onClick={editCurrentImage}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button className="action-btn bg-gray-800/80 p-3 rounded-full hover:bg-[#0878d8] hover:text-white transition-all" title="Download" onClick={downloadImage}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                </div>
            </div>
        )}
      </div>
      
      {/* Mobile Modal */}
      {isMobileModalOpen && generatedImage && (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black/90 flex flex-col p-4 z-50 md:hidden">
            <div className="modal-content flex-grow flex items-center justify-center">
                 <img id="modalImage" src={generatedImage} alt="Generated art" className="modal-image max-w-full max-h-full object-contain rounded-lg"/>
            </div>
            <div className="modal-actions grid grid-cols-3 gap-3 mt-4">
                 <button className="modal-btn edit flex items-center justify-center gap-2 bg-gray-700 p-3 rounded-lg font-semibold" onClick={() => { editCurrentImage(); setIsMobileModalOpen(false); }}>Editar</button>
                 <button className="modal-btn download flex items-center justify-center gap-2 bg-gray-700 p-3 rounded-lg font-semibold" onClick={downloadImage}>Salvar</button>
                 <button className="modal-btn new flex items-center justify-center gap-2 bg-[#0878d8] text-white p-3 rounded-lg font-bold" onClick={() => { setGeneratedImage(null); setIsMobileModalOpen(false); setPrompt(''); }}>Nova Imagem</button>
            </div>
        </div>
      )}

    </div>
  );
}