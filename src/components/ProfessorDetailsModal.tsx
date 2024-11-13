import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';

interface Review {
  rating: number;
  comment: string;
  timestamp: string;
  userName: string;
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
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isOpen) return;
      
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
          const average = reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length;
          setAverageRating(Number(average.toFixed(1)));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, professorId]);

  if (!isOpen) return null;

  return (
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
          <div className="flex items-center mt-2">
            <div className={`text-xl font-bold mr-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {averageRating}/5
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={`${
                    star <= averageRating
                      ? 'text-yellow-400 fill-current'
                      : darkMode
                        ? 'text-gray-600'
                        : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className={`ml-2 text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
            </span>
          </div>
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
  );
};

export default ProfessorDetailsModal;