import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { BookOpen, User } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.id.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Create user object
    const userData = {
      id: formData.id.trim(),
      name: formData.name.trim(),
    };

    // Login user
    login(userData);
    toast.success(`Welcome back, ${userData.name}!`);
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-book-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-book-900">
            Welcome to BookBuddy
          </h2>
          <p className="mt-2 text-sm text-book-600">
            Sign in to manage your reading lists and get personalized recommendations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User ID */}
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-book-700 mb-2">
                User ID *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-book-400 w-5 h-5" />
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="Enter your unique user ID"
                  className="w-full pl-10 pr-3 py-2 input-field"
                />
              </div>
              <p className="mt-1 text-xs text-book-500">
                This will be your unique identifier in BookBuddy
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-book-700 mb-2">
                Display Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your display name"
                className="w-full px-3 py-2 input-field"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full btn-primary py-3 text-base font-medium"
              >
                Sign In
              </button>
            </div>

            {/* Demo Users */}
            <div className="mt-6">
              <p className="text-sm text-book-600 mb-3">Try these demo users:</p>
              <div className="space-y-2">
                {[
                  { id: 'demo1', name: 'Alice Johnson' },
                  { id: 'demo2', name: 'Bob Smith' },
                  { id: 'demo3', name: 'Carol Davis' },
                ].map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setFormData({
                        id: user.id,
                        name: user.name,
                      });
                    }}
                    className="w-full text-left p-2 rounded border border-book-200 hover:bg-book-50 transition-colors duration-200"
                  >
                    <div className="text-sm font-medium text-book-900">{user.name}</div>
                    <div className="text-xs text-book-500">ID: {user.id}</div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-book-600">
            Don't have an account?{' '}
            <span className="text-primary-600 hover:text-primary-700 font-medium">
              Just enter any ID and name to get started!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 