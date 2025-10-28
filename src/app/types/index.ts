export type Article = {
  id: string;
  title: string;
  cover_image_url: string | null;
  created_at: string;
};

export type ArticleImage = {
  id: string;
  article_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

export type ArticleBlock = {
  id: string;
  article_id: string;
  block_type: "text" | "text_image" | "image" | "patterned";
  text_content: string | null;
  image_url: string | null;
  images: string[] | null;
  sort_order: number;
  created_at: string;
};
