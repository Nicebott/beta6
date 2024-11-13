export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface Section {
  id: string;
  courseId: string;
  professor: string;
  schedule: string;
  campus: string;
  rating: 'positive' | 'neutral' | 'negative' | null;
  nrc: string;
  modalidad: string;
}

export interface SearchResult {
  courses: Course[];
  sections: Section[];
}