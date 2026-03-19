export type SkillCategory =
  | "programming"
  | "frontend"
  | "backend"
  | "qa"
  | "devops"
  | "database"
  | "cloud"
  | "tools"
  | "methodology";

export type SkillDefinition = {
  id: string;
  name: string;
  category: SkillCategory;
  synonyms?: string[];
  parentId?: string;
};
