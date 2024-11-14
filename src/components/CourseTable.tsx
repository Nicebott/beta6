import React, { useState, useEffect } from 'react';
import { Course, Section } from '../types';
import { Search, Star } from 'lucide-react';
import ProfessorDetailsModal from './ProfessorDetailsModal';
import ReviewModal from './ReviewModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import toast from 'react-hot-toast';

interface ProfessorRating {
  [key: string]: {
    rating: number;
    clarity: number;
    fairness: number;
    punctuality: number;
    wouldTakeAgain: number;
  };
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('');

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
            const totals = reviews.reduce((acc, review: any) => ({
              rating: acc.rating + review.rating,
              clarity: acc.clarity + (review.clarity || 0),
              fairness: acc.fairness + (review.fairness || 0),
              punctuality: acc.punctuality + (review.punctuality || 0),
              wouldTakeAgain: acc.wouldTakeAgain + (review.wouldTakeAgain || 0)
            }), {
              rating: 0,
              clarity: 0,
              fairness: 0,
              punctuality: 0,
              wouldTakeAgain: 0
            });

            const count = reviews.length;
            ratings[professor] = {
              rating: Number((totals.rating / count).toFixed(1)),
              clarity: Number((totals.clarity / count).toFixed(1)),
              fairness: Number((totals.fairness / count).toFixed(1)),
              punctuality: Number((totals.punctuality / count).toFixed(1)),
              wouldTakeAgain: Number((totals.wouldTakeAgain / count).toFixed(1))
            };
          }
        } catch (error) {
          console.error('Error fetching ratings for professor:', professor, error);
        }
      }

      setProfessorRatings(ratings);
    };

    fetchProfessorRatings();
  }, [sections]);

  const handleRateClick = (sectionId: string, professorId: string) => {
    if (!auth.currentUser) {
      onRateSection(sectionId);
      return;
    }
    setSelectedSection(sectionId);
    setSelectedProfessor({ id: professorId, name: professorId });
    setShowReviewModal(true);
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const RatingButton = ({ professor, onClick }: { professor: string; onClick: () => void }) => {
    const ratings = professorRatings[professor];
    if (!ratings) {
      return (
        <button
          onClick={onClick}
          className={`px-3 py-1 rounded flex items-center space-x-1 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } hover:opacity-90 transition-opacity`}
        >
          <Search size={14} className="text-white" />
          <span className="text-white font-medium">Sin calificación</span>
        </button>
      );
    }

    return (
      <button
        onClick={onClick}
        className={`px-3 py-1 rounded flex items-center space-x-1 ${getRatingBadgeColor(ratings.rating)} hover:opacity-90 transition-opacity`}
      >
        <Search size={14} className="text-white" />
        <span className="text-white font-medium">
          {ratings.rating.toFixed(1)}/5
        </span>
      </button>
    );
  };

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
                        professor={section.professor}
                        onClick={() => handleRateClick(section.id, section.professor)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedProfessor && !showReviewModal && (
        <ProfessorDetailsModal
          isOpen={!!selectedProfessor}
          onClose={() => setSelectedProfessor(null)}
          darkMode={darkMode}
          professorId={selectedProfessor.id}
          professorName={selectedProfessor.name}
        />
      )}

      {showReviewModal && selectedProfessor && auth.currentUser && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedProfessor(null);
          }}
          darkMode={darkMode}
          professorId={selectedProfessor.id}
          professorName={selectedProfessor.name}
          userId={auth.currentUser.uid}
        />
      )}
    </>
  );
};

export default CourseTable;