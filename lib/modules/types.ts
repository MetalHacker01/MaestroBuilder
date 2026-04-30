export type FieldType =
  | "text"
  | "richtext"
  | "color"
  | "number"
  | "select"
  | "url"
  | "image-url"
  | "align"
  | "spacing";

export type Spacing = { t: number; r: number; b: number; l: number };
export type Align = "left" | "center" | "right";

export type FieldSchema =
  | {
      type: "text" | "richtext" | "url" | "image-url";
      label: string;
      default: string;
      group?: string;
      placeholder?: string;
    }
  | {
      type: "color";
      label: string;
      default: string;
      group?: string;
    }
  | {
      type: "number";
      label: string;
      default: number;
      group?: string;
      min?: number;
      max?: number;
      step?: number;
      unit?: string;
    }
  | {
      type: "select";
      label: string;
      default: string;
      group?: string;
      options: { label: string; value: string }[];
    }
  | {
      type: "align";
      label: string;
      default: Align;
      group?: string;
    }
  | {
      type: "spacing";
      label: string;
      default: Spacing;
      group?: string;
    };

export type ModuleCategory =
  | "preheader"
  | "logo"
  | "banner"
  | "body"
  | "footer"
  | "spacer";

export type ModuleProps = Record<string, unknown>;

export type Module = {
  id: string;
  category: ModuleCategory;
  label: string;
  description?: string;
  thumbnail?: string;
  schema: Record<string, FieldSchema>;
  render: (props: ModuleProps) => string;
};

export type ModuleInstance = {
  uid: string;
  moduleId: string;
  props: ModuleProps;
};

export type Theme = {
  darkMode?: boolean;
  /** Optional accent override applied in dark mode for links / button text. */
  darkAccent?: string;
};

export type Template = {
  version: 1;
  name?: string;
  theme?: Theme;
  instances: ModuleInstance[];
};
