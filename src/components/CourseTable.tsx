import React, { useState, useEffect } from 'react';
import { Course, Section } from '../types';
import { Search } from 'lucide-react';
import ProfessorDetailsModal from './ProfessorDetailsModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';

interface ProfessorRating {
  [key: string]: number;
}

interface CourseTableProps {
  courses: Course[];
  sections: Section[];
  onRateSection: (sectionId: string) => void;
  darkMode: boolean;
}

const CourseTable: React.FC<CourseTableProps> = ({ courses, sections, onRateSection, darkMode }) => {
  const [selectedProfessor, setSelectedProfessor] = useState<{ id: string; name: string } | null>(null);
  const [professorRatings, setProfessorRatings] = useState<ProfessorRating>({});

  useEffect(() => {
    const fetchProfessorRatings = async () => {
      const uniqueProfessors = [...new Set(sections.map(section => section.professor))];
      const ratings: ProfessorRating = {};

      for (const professor of uniqueProfessors) {
        try {
          const reviewsQuery = query(
            collection(firestore, 'reviews'),
            where('professorId', '==', professor)
          );
          
          const querySnapshot = await getDocs(reviewsQuery);
          const reviews = querySnapshot.docs.map(doc => doc.data());
          
          if (reviews.length > 0) {
            const average = reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / reviews.length;
            ratings[professor] = Number(average.toFixed(1));
          }
        } catch (error) {
          console.error('Error fetching ratings for professor:', professor, error);
        }
      }

      setProfessorRatings(ratings);
    };

    fetchProfessorRatings();
  }, [sections]);

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const RatingButton = ({ rating, onClick }: { rating: number | null; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded flex items-center space-x-1 ${
        rating
          ? getRatingBadgeColor(rating)
          : darkMode
            ? 'bg-gray-700'
            : 'bg-gray-200'
      } hover:opacity-90 transition-opacity`}
    >
      <Search size={14} className="text-white" />
      <span className="text-white font-medium">
        {rating ? `${rating.toFixed(1)}/10` : 'Sin calificación'}
      </span>
    </button>
  );

  return (
    <>
      <div className={`overflow-x-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg w-full mt-8`} translate="no">
        <table className="min-w-full table-auto">
          <thead className={`${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-600'} uppercase text-sm leading-normal`}>
            <tr>
              <th className="py-3 px-2 sm:px-4 text-left">NRC</th>
              <th className="py-3 px-2 sm:px-4 text-left">Asignatura</th>
              <th className="py-3 px-2 sm:px-4 text-left">Profesor</th>
              <th className="py-3 px-2 sm:px-4 text-left">Campus</th>
              <th className="py-3 px-2 sm:px-4 text-left">Horario</th>
              <th className="py-3 px-2 sm:px-4 text-center">Calificación</th>
            </tr>
          </thead>
          <tbody className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm font-light`}>
            {sections.map((section) => {
              const course = courses.find(c => c.id === section.courseId);
              if (!course) return null;

              const professorRating = professorRatings[section.professor];
              const normalizedRating = professorRating ? (professorRating * 2) : null; // Convert 5-star to 10-point scale

              return (
                <tr 
                  key={section.id}
                  className={`border-b ${
                    darkMode 
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <td className="py-3 px-2 sm:px-4 text-left whitespace-nowrap">
                    <span className="font-medium">{section.nrc}</span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-left">
                    <span className="font-medium">{course.name} ({course.code})</span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-left">
                    <div className="flex items-center space-x-2">
                      <span>{section.professor}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedProfessor({
                            id: section.professor,
                            name: section.professor
                          })}
                          className={`p-1 rounded-full hover:bg-opacity-10 ${
                            darkMode
                              ? 'hover:bg-gray-300 text-gray-400 hover:text-gray-300'
                              : 'hover:bg-gray-500 text-gray-500 hover:text-gray-700'
                          }`}
                          title="Ver detalles del profesor"
                        >
                          <Search size={16} />
                        </button>
                        {professorRating && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getRatingBadgeColor(professorRating)}`}>
                            {professorRating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-left">
                    <span>{section.campus}</span>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-left">
                    <span>{section.schedule} ({section.modalidad})</span>
                  </td>
                  <td className="py-3 px-2 sm:px-4">
                    <div className="flex justify-center">
                      <RatingButton
                        rating={normalizedRating}
                        onClick={() => {
                          setSelectedProfessor({
                            id: section.professor,
                            name: section.professor
                          });
                          onRateSection(section.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedProfessor && (
        <ProfessorDetailsModal
          isOpen={!!selectedProfessor}
          onClose={() => setSelectedProfessor(null)}
          darkMode={darkMode}
          professorId={selectedProfessor.id}
          professorName={selectedProfessor.name}
        />
      )}
    </>
  );
};

export default CourseTable;