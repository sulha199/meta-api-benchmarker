import type { DataModelTransformerConfig } from "@meta/validation-core";

export interface CreateArticleDTO {
  title: string;
  content: string;
  authorId: string;
}

export const CreateArticleTransformers: DataModelTransformerConfig<CreateArticleDTO> = {
  beforeValidate: {
    title: [async (val) => val?.trim() || ""],
    content: [async (val) => val?.trim() || ""],
  },
  afterValidate: {
    title: [async (val) => val?.toUpperCase() || ""],
  },
};
