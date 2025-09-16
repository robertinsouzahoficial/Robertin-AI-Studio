export type Mode = 'create' | 'edit';
export type CreateFunction = 'free' | 'sticker' | 'text' | 'comic' | 'thumbnail' | 'advertisement';
export type EditFunction = 'add-remove' | 'retouch' | 'style' | 'compose';

export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface FunctionCardData {
  id: CreateFunction | EditFunction;
  name: string;
  icon: JSX.Element;
  requiresTwo?: boolean;
}