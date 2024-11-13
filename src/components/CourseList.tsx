import React from 'react';
import { Course, Section } from '../types';
import { Star } from 'lucide-react';

interface CourseListProps {
  courses: Course[];
  sections: Section[];
  onRateSection: (sectionId: string, rating: number) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, sections, onRateSection }) => {
  return (
    <div className="w-full max-w-4xl mt-8">
      {courses.map((course) => (
        <div key={course.id} className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">{course.name} ({course.code})</h2>
          {sections
            .filter((section) => section.courseId === course.id)
            .map((section) => (
              <div key={section.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold">Profesor: {section.professor}</p>
                <p>Horario: {section.schedule}</p>
                <p>Campus: {section.campus}</p>
                <div className="mt-2 flex items-center">
                  <span className="mr-2">Calificación:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      fill={star <= section.rating ? 'gold' : 'none'}
                      stroke="gold"
                      className="cursor-pointer"
                      onClick={() => onRateSection(section.id, star)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default CourseList;