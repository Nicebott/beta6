import React, { useState, useEffect } from 'react';
import { X, Star, ThumbsUp } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import ReviewModal from './ReviewModal';

interface Review {
  rating: number;
  comment: string;
  timestamp: string;
  userName: string;
  clarity: number;
  fairness: number;
  punctuality: number;
  wouldTakeAgain: number;
}

interface ProfessorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  professorId: string;
  professorName: string;
}

const ProfessorDetailsModal: React.FC<ProfessorDetailsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  professorId,
  professorName,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [averages, setAverages] = useState({
    rating: 0,
    clarity: 0,
    fairness: 0,
    punctuality: 0,
    wouldTakeAgain: 0
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const reviewsQuery = query(
        collection(firestore, 'reviews'),
        where('professorId', '==', professorId)
      );
      
      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsData = querySnapshot.docs.map(doc => doc.data() as Review);
      
      setReviews(reviewsData);
      
      if (reviewsData.length > 0) {
        const totals = reviewsData.reduce((acc, review) => ({
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

        const count = reviewsData.length;
        setAverages({
          rating: Number((totals.rating / count).toFixed(1)),
          clarity: Number((totals.clarity / count).toFixed(1)),
          fairness: Number((totals.fairness / count).toFixed(1)),
          punctuality: Number((totals.punctuality / count).toFixed(1)),
          wouldTakeAgain: Number((totals.wouldTakeAgain / count).toFixed(1))
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, professorId]);

  if (!isOpen) return null;

  const RatingDisplay = ({ label, value }: { label: string; value: number }) => (
    <div className="flex flex-col items-center">
      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </span>
      <div className="flex items-center">
        <span className={`text-lg font-bold mr-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={`${
                star <= value
                  ? 'text-yellow-400 fill-current'
                  : darkMode
                    ? 'text-gray-600'
                    : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`relative w-full max-w-2xl p-6 rounded-lg shadow-lg ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 ${
              darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <X size={24} />
          </button>

          <div className="mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {professorName}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <RatingDisplay label="General" value={averages.rating} />
              <RatingDisplay label="Claridad" value={averages.clarity} />
              <RatingDisplay label="Justicia" value={averages.fairness} />
              <RatingDisplay label="Puntualidad" value={averages.punctuality} />
              <RatingDisplay label="Lo tomaría de nuevo" value={averages.wouldTakeAgain} />
            </div>
            
            <div className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
            </div>

            {auth.currentUser && (
              <button
                onClick={() => setShowReviewModal(true)}
                className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-md ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <ThumbsUp size={18} />
                Calificar Profesor
              </button>
            )}
          </div>

          {loading ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Cargando reseñas...
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className={`font-medium mr-2 ${
                        darkMode ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        {review.userName || 'Usuario Anónimo'}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : darkMode
                                  ? 'text-gray-600'
                                  : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Claridad: {review.clarity}/5
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Justicia: {review.fairness}/5
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Puntualidad: {review.punctuality}/5
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Lo tomaría de nuevo: {review.wouldTakeAgain}/5
                    </div>
                  </div>
                  
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No hay reseñas disponibles para este profesor.
            </div>
          )}
        </div>
      </div>

      {showReviewModal && auth.currentUser && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            fetchReviews();
          }}
          darkMode={darkMode}
          professorId={professorId}
          professorName={professorName}
          userId={auth.currentUser.uid}
        />
      )}
    </>
  );
};

export default ProfessorDetailsModal;