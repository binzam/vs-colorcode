export interface ColorProject {
  id: string;
  name: string;
  colors: string[];
}
export interface ThemeCollection {
  mainColor: string;
  themes: Theme[];
}
export interface Theme {
  text: string;
  name: string;
  background: string;
  accent: string;
  description: string;
  role: string;
}
