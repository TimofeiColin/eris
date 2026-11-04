export interface ColorOption {
  name: string;
  hex: string;
  value: number;
}

export interface ColorGroupView {
  name: string;
  colors: ColorOption[];
}

export type ColorMenuMode = 'apply' | 'create';
