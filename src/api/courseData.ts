import { Course, Section } from '../types';

export async function fetchCourseData(): Promise<{ courses: Course[], sections: Section[] }> {
  try {
    const response = await fetch('/data.json');
    const data = await response.json();
    
    const coursesMap = new Map<string, Course>();
    const sections: Section[] = [];

    data.forEach((item: any) => {
      // Safely handle missing or malformed data
      const nrc = String(item.nrc || '').trim();
      const asignatura = String(item.asignatura || '').trim();
      const profesor = String(item.profesor === null || item.profesor === undefined || item.profesor === 'NaN' ? 'Sin profesor asignado' : item.profesor).trim();
      const horario = String(item.horario || 'Horario no especificado').trim();
      const modalidad = String(item.modalidad || 'No especificada').trim();
      const provincia = String(item.provincia || 'No especificada').trim();
      const clave = String(item.clave || nrc).trim();

      // Convert rating from "N/A" or "X/10" to new rating system
      let rating: 'positive' | 'neutral' | 'negative' | null = null;
      if (item.calificacion && item.calificacion !== 'N/A') {
        const ratingMatch = String(item.calificacion).match(/(\d+)/);
        const numericRating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
        if (numericRating >= 7) {
          rating = 'positive';
        } else if (numericRating >= 4) {
          rating = 'neutral';
        } else if (numericRating > 0) {
          rating = 'negative';
        }
      }

      // Only process items with required minimum data
      if (nrc && asignatura) {
        if (!coursesMap.has(clave)) {
          coursesMap.set(clave, {
            id: clave,
            name: asignatura,
            code: clave
          });
        }

        sections.push({
          id: `${nrc}-${clave}-${profesor}-${horario}-${provincia}`,
          courseId: clave,
          professor: profesor,
          schedule: horario,
          campus: provincia,
          rating,
          nrc,
          modalidad
        });
      }
    });

    const courses = Array.from(coursesMap.values());
    return { courses, sections };
  } catch (error) {
    console.error('Error fetching course data:', error);
    return { courses: [], sections: [] };
  }
}