import React from 'react';
import { LogOut, User } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

interface ProfileDropdownProps {
  darkMode: boolean;
  onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ darkMode, onClose }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Sesión cerrada exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div
      className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } ring-1 ring-black ring-opacity-5`}
    >
      <div className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <div className="flex items-center gap-2">
          <User size={16} />
          <span>{auth.currentUser?.displayName || 'Usuario'}</span>
        </div>
      </div>
      <div className="border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className={`flex w-full items-center gap-2 px-4 py-2 text-sm ${
            darkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;