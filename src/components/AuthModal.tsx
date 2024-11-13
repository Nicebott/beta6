import React, { useState } from 'react';
import { X } from 'lucide-react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('¡Inicio de sesión exitoso!');
      } else {
        if (!name.trim()) {
          toast.error('Por favor ingresa tu nombre');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        toast.success('¡Cuenta creada exitosamente!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <X size={24} />
        </button>
        
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500`}
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              required
            />
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500`}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>
        
        <p className={`mt-4 text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;