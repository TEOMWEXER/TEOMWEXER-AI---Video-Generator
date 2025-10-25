
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type VideoAspectRatio = "16:9" | "9:16";

export type Style = "Realistic" | "Anime" | "Cyberpunk" | "Noir" | "Documentary";

export type ActiveTab = "generate" | "video";
