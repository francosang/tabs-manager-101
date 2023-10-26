export interface Tab {
  id: number;
  name: string;
  icon: string;
  url: string;
  lastAccessed: number;
  winId: number;
}

export interface Window {
  id: number;
  name: string;
  active: boolean;
}