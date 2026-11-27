export type WorkImage = {
  id: string;
  src: string;
  alt: string;
};

export type Work = {
  id: string;
  index: string;
  title: string;
  association: string;
  year: string;
  description: string;
  technique: string;
  location: string;
  category: string;
  image: string;
  alt: string;
  hide: boolean;
  url: string;
  extraImages: WorkImage[];
  number?: string;
};
