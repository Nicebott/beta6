import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GraduationCap, Menu, X, Moon, Sun, LogIn, UserCircle } from 'lucide-react';
import SearchBar from './components/SearchBar';
import CourseTable from './components/CourseTable';
import Pagination from './components/Pagination';
import Chat from './components/Chat';
import LoadingSpinner from './components/LoadingSpinner';
import AuthModal from './components/AuthModal';
import ProfileDropdown from './components/ProfileDropdown';
import { Course, Section } from './types';
import { fetchCourseData } from './api/courseData';
import { removeDiacritics } from './utils/stringUtils';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';

const ALL_CAMPUSES = [
  'Santo Domingo',
  'Santiago',
  'San Fco de Macorís',
  'Puerto Plata',
  'San Juan',
  'Barahona',
  'Mao',
  'Hato Mayor',
  'Higüey',
  'Bonao',
  'La Vega',
  'Baní',
  'Azua de Compostela',
  'Neyba',
  'Cotuí',
  'Nagua',
  'Dajabón'
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModality, setSelectedModality] = useState<string>('');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { courses, sections } = await fetchCourseData();
        setAllCourses(courses);
        setAllSections(sections);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = useCallback((query: string, campus: string) => {
    setSearchQuery(query);
    setSelectedCampus(campus);
    setCurrentPage(1);
  }, []);

  const filteredSections = useMemo(() => {
    const normalizedQuery = removeDiacritics(searchQuery.toLowerCase());
    
    return allSections.filter(section => {
      const course = allCourses.find(c => c.id === section.courseId);
      
      const matchesSearch = !normalizedQuery || 
        removeDiacritics(section.professor.toLowerCase()).includes(normalizedQuery) ||
        removeDiacritics(section.nrc.toLowerCase()).includes(normalizedQuery) ||
        (course && (
          removeDiacritics(course.name.toLowerCase()).includes(normalizedQuery) ||
          removeDiacritics(course.code.toLowerCase()).includes(normalizedQuery)
        ));

      const matchesCampus = !selectedCampus || section.campus === selectedCampus;
      
      const modalidad = section.modalidad.toLowerCase();
      const matchesModality = !selectedModality || 
        (selectedModality === 'virtual' && modalidad.includes('online')) ||
        (selectedModality === 'semipresencial' && (
          modalidad.includes('semi') || 
          modalidad.includes('semipresencial') || 
          modalidad.includes('semi presencial')
        ));

      return matchesSearch && matchesCampus && matchesModality;
    });
  }, [allSections, allCourses, searchQuery, selectedCampus, selectedModality]);

  const totalPages = Math.max(1, Math.ceil(filteredSections.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const currentSections = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSections.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSections, currentPage, itemsPerPage]);

  const currentCourses = useMemo(() => {
    const uniqueCourseIds = new Set(currentSections.map(section => section.courseId));
    return allCourses.filter(course => uniqueCourseIds.has(course.id));
  }, [currentSections, allCourses]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleModalityChange = (modality: string) => {
    setSelectedModality(modality === selectedModality ? '' : modality);
    setCurrentPage(1);
    setIsMenuOpen(false);
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
    setSearchQuery('');
    setSelectedCampus('');
    setSelectedModality('');
    setCurrentPage(1);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <Toaster position="top-center" />
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative">
          <div className="flex items-center">
            <GraduationCap size={48} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} mr-4`} />
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Programación Docente UASD 2024-20
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  darkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <LogIn size={20} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  <UserCircle size={20} />
                  <span className="hidden sm:inline">{user.displayName || 'Usuario'}</span>
                </button>
                {showProfileDropdown && (
                  <ProfileDropdown 
                    darkMode={darkMode} 
                    onClose={() => setShowProfileDropdown(false)}
                  />
                )}
              </div>
            )}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-600'} hover:opacity-80 transition-colors`}
              aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              {isMenuOpen ? (
                <X size={24} className={darkMode ? 'text-white' : ''} />
              ) : (
                <Menu size={24} className={darkMode ? 'text-white' : ''} />
              )}
            </button>
          </div>
          
          <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block absolute md:relative top-full right-0 w-48 md:w-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} md:bg-transparent shadow-md md:shadow-none z-10`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 md:flex md:space-x-4 md:space-y-0">
              <button 
                onClick={scrollToTop}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                  !selectedModality
                    ? darkMode 
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-blue-800'
                    : darkMode 
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                      : 'text-blue-600 hover:text-blue-800 hover:bg-gray-100'
                }`}
              >
                Inicio
              </button>
              <button 
                onClick={() => handleModalityChange('virtual')}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                  selectedModality === 'virtual'
                    ? darkMode 
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-blue-800'
                    : darkMode 
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                      : 'text-blue-600 hover:text-blue-800 hover:bg-gray-100'
                }`}
              >
                Virtual
              </button>
              <button 
                onClick={() => handleModalityChange('semipresencial')}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                  selectedModality === 'semipresencial'
                    ? darkMode 
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-blue-800'
                    : darkMode 
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700' 
                      : 'text-blue-600 hover:text-blue-800 hover:bg-gray-100'
                }`}
              >
                SemiPresencial
              </button>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center">
          <SearchBar 
            onSearch={handleSearch} 
            campuses={ALL_CAMPUSES} 
            selectedCampus={selectedCampus}
            darkMode={darkMode}
          />
          {isLoading ? (
            <LoadingSpinner darkMode={darkMode} />
          ) : currentSections.length > 0 ? (
            <>
              <CourseTable
                courses={currentCourses}
                sections={currentSections}
                onRateSection={() => {
                  if (!user) {
                    setIsAuthModalOpen(true);
                  }
                }}
                darkMode={darkMode}
              />
              <Pagination
                itemsPerPage={itemsPerPage}
                totalItems={filteredSections.length}
                paginate={handlePageChange}
                currentPage={currentPage}
                darkMode={darkMode}
              />
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
                Mostrando {currentSections.length} de {filteredSections.length} resultados
                {selectedCampus && ` en ${selectedCampus}`}
                {selectedModality && ` (${selectedModality})`}
              </p>
            </>
          ) : (
            <p className={`mt-8 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedCampus
                ? `No se encontraron asignaturas para el campus de ${selectedCampus}.`
                : "No se encontraron asignaturas que coincidan con la búsqueda."}
            </p>
          )}
        </div>
      </main>
      
      <footer className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md mt-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-gray-500">
          © 2024 Nicebott. Todos los derechos reservados.
        </div>
      </footer>

      <Chat darkMode={darkMode} />
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
}

export default App;
