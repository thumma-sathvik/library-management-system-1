'use client'
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Signup = () => {
  const [formData, setFormData] = useState({
    Library_name: '',
    address: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData(prev => ({
        ...prev,
        mobile: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.Library_name || !formData.address || !formData.email || !formData.mobile || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3002/adminsignup', formData);
      
      if (response.status === 201) {
        alert('Signup successful!');
        router.push('/adminlogin');
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        'An error occurred during signup'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            Create Admin Account
          </h2>
          <p className="text-center text-gray-500 text-sm">
            Register your library and start managing your books
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 text-sm text-center p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="rounded-md space-y-5">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Library Name
              </label>
              <input
                type="text"
                name="Library_name"
                value={formData.Library_name}
                onChange={handleChange}
                placeholder="Enter library name"
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black focus:outline-none sm:text-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter library address"
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black focus:outline-none sm:text-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black focus:outline-none sm:text-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleMobileChange}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black focus:outline-none sm:text-sm transition-all duration-200"
              />
              {formData.mobile && formData.mobile.length < 10 && (
                <p className="mt-1 text-sm text-gray-500">
                  Enter {10 - formData.mobile.length} more digits
                </p>
              )}
            </div>

            <div>
              <label className="text-gray-700 text-sm font-medium mb-1 block">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-black focus:border-black focus:outline-none sm:text-sm transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-black/30"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing up...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <a 
              href="/adminlogin" 
              className="text-black hover:text-gray-700 transition-colors duration-200"
            >
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
