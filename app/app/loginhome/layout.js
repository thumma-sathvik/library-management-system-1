'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Building2, Book, User, ShoppingCart, X, Menu, Search, Star, BookOpen, CircleCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

// Helper function to get full image path
const getFullImagePath = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath; // Already a full URL
  return `http://localhost:3002/${imagePath.replace(/^\//, '')}`; // Adjust the base URL as needed
};

// Separated SearchResults component
const SearchResults = ({ results = [], isVisible, isScrolled, onSelect }) => {
  if (!isVisible || !Array.isArray(results) || results.length === 0) return null;

  return (
    <div
      className={`absolute top-full left-0 w-96 mt-2 rounded-xl shadow-lg overflow-hidden ${
        isScrolled ? 'bg-white' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-h-96 overflow-y-auto">
        {results.map((book, index) => (
          <div 
            key={book.id || index} 
            className="group hover:bg-gray-50 transition-colors duration-200"
            role="option"
            aria-selected={false} // Ensure aria-selected is defined
            tabIndex={0}
            onClick={() => onSelect && onSelect(book)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect && onSelect(book)}
          >
            <div className="flex items-start p-4 space-x-4">
              <div className="flex-shrink-0">
                {book.image ? (
                  <Image
                    src={getFullImagePath(book.image)}
                    alt={book.title}
                    width={64}
                    height={80}
                    className="object-cover rounded-md shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Fallback: use a placeholder image using next/image by setting src prop appropriately
                    }}
                  />
                ) : (
                  <div className="w-16 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                    <Book className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                  {book.title}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {book.author}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {results.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <Link href="/search" className="block w-full text-center text-sm text-gray-600 hover:text-gray-900">
            View all {results.length} results
          </Link>
        </div>
      )}
    </div>
  );
};

// Separated SearchInput component
const SearchInput = ({ searchQuery, setSearchQuery, isSearching, isScrolled }) => (
  <div className="relative">
    <Search
      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
        isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'
      }`}
    />
    <input
      type="text"
      placeholder="Search books..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`pl-10 pr-4 py-2.5 w-64 rounded-full transition-all duration-200 ${
        isScrolled ? 'bg-gray-100 focus:bg-white border-gray-200' : 'bg-white/10 focus:bg-white/20'
      } border border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm ${
        isScrolled ? 'text-black placeholder-gray-500' : 'text-white placeholder-gray-400'
      }`}
    />
    {isSearching && (
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}
  </div>
);

// Updated LibraryModal component
const LibraryModal = ({ isOpen, onClose, libraries, selectedBook, onBorrowFromLibrary }) => {
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const fetchLocations = async () => {
      if (libraries && libraries.length > 0) {
        try {
          const adminIds = libraries.map(lib => lib.adminId?._id).filter(Boolean);
          const response = await axios.get(
            `http://localhost:3002/locations?adminIds=${adminIds.join(',')}`,
            { withCredentials: true }
          );
          const locationMap = {};
          response.data.forEach(loc => {
            locationMap[loc.adminId] = loc;
          });
          setLocations(locationMap);
        } catch (err) {
          console.error('Error fetching locations:', err);
          setError('Failed to load location information');
        }
      }
    };
    fetchLocations();
    setError(null);
  }, [isOpen, libraries]);

  const handleMapClick = (adminId) => {
    const location = locations[adminId];
    if (location?.latitude && location?.longitude) {
      window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
    } else {
      alert('Location information not available');
    }
  };

  const getAvailabilityStatus = (library) => {
    if (!library) return null;
    if (library.stock > 5) return {
      color: "bg-green-100 text-green-800",
      icon: <CircleCheck className="h-4 w-4 mr-1" />,
      label: "Available",
      message: `${library.stock} copies available`
    };
    if (library.stock > 0) return {
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="h-4 w-4 mr-1 animate-spin" />,
      label: "Limited Stock",
      message: `${library.stock} copies left`
    };
    return {
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="h-4 w-4 mr-1" />,
      label: "Unavailable",
      message: "Currently out of stock"
    };
  };

  if (!isOpen || error || !libraries) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all animate-fadeIn">
        {/* Header with black background */}
        <div className="flex items-center justify-between p-6 bg-black">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedBook?.title} - Available Libraries
            </h2>
            <p className="text-gray-300 mt-1">{libraries.length} locations found</p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="text-white hover:text-gray-300 transition-colors text-3xl"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Library List */}
          <div className="md:w-1/2 border-b md:border-r overflow-y-auto bg-gray-50">
            {Array.isArray(libraries) && libraries.map((library, index) => {
              const availability = getAvailabilityStatus(library);
              return (
                <div 
                  key={library._id || index}
                  onClick={() => {}}
                  className={`p-6 border-b cursor-pointer transition-all duration-200 hover:bg-gray-100 border-l-4 ${
                    availability && availability.label === "Available" ? 'border-black bg-gray-100' : 'border-transparent'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {library.adminId?.Library_name || 'Library Name Not Available'}
                  </h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${availability.color} mb-2`}>
                    {availability.icon} {availability.label}
                  </div>
                  <p className="text-gray-600 text-sm">{library.adminId?.address || 'Address Not Available'}</p>
                  <p className="text-gray-500 text-xs mt-1">{availability.message}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBorrowFromLibrary(selectedBook, library._id, library.adminId);
                    }}
                    disabled={library.stock === 0}
                    className={`mt-3 w-full px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-md ${
                      library.stock === 0 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 mr-1" />
                    {library.stock === 0 ? 'Not Available' : 'Reserve Now'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Map Section */}
          <div className="md:w-1/2 p-6 bg-white flex flex-col">
            {selectedBook && (
              <div className="flex-1 flex flex-col">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Location Details</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {locations[selectedBook.adminId?._id]?.distance 
                        ? `${(locations[selectedBook.adminId?._id]?.distance).toFixed(1)} miles away`
                        : 'Distance information unavailable'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMapClick(selectedBook.adminId?._id)}
                    className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Open in Maps
                  </button>
                </div>
                <div className="bg-gray-100 rounded-xl p-6 shadow-md border border-gray-200 flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedBook.adminId?.Library_name || 'Library Branch'}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedBook.adminId?.address || 'Address Not Available'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Operating Hours</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Monday - Friday:</div>
                      <div>9:00 AM - 6:00 PM</div>
                      <div>Saturday:</div>
                      <div>10:00 AM - 4:00 PM</div>
                      <div>Sunday:</div>
                      <div>Closed</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <p className="text-sm text-gray-600">
                      {selectedBook.adminId?.phone || 'Phone not available'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedBook.adminId?.email || 'Email not available'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [libraries, setLibraries] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState([]);

  useEffect(() => {
    // Removed isClient as it was assigned but never used
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAccountPopup &&
        !event.target.closest('.account-popup') &&
        !event.target.closest('.account-button')
      ) {
        setShowAccountPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountPopup]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery) {
        setIsSearching(true);
        try {
          const searchResponse = await axios.get('http://localhost:3002/bookquery', {
            withCredentials: true,
            params: { query: searchQuery },
          });
          setSearchResults(searchResponse.data);
        } catch (error) {
          console.error('Error fetching search results:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleBookSelect = async (book) => {
    try {
      const response = await axios.get(`http://localhost:3002/libraries/${book.title}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setLibraries(response.data);
        setSelectedBook(book);
        setIsModalOpen(true);
      } else {
        throw new Error('No library information available');
      }
    } catch (error) {
      console.error('Error fetching libraries:', error);
      alert('Error fetching library information. Please try again.');
    }
  };

  const handleBorrowFromLibrary = async (selectedBook, libraryId, adminIdObj) => {
    try {
      const response = await axios.post(
        'http://localhost:3002/borrow',
        {
          bookId: selectedBook._id,
          libraryId,
          adminId: adminIdObj._id,
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        // Send notification and update UI
        alert('Book reserved successfully!');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error reserving book:', error);
      alert(
        (error.response?.data && error.response.data.message) ||
        'Failed to reserve book. Please try again.'
      );
    }
  };

  const fetchLibraryInfo = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3002/user', { withCredentials: true });
      setUserInfo(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching library data:', error);
      setError('Failed to load account information');
      setUserInfo({
        name: "Error loading",
        address: "Error loading",
        email: "Error loading"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryInfo();
  }, []);

  const toggleAccountPopup = () => {
    if (!showAccountPopup) {
      fetchLibraryInfo();
    }
    setShowAccountPopup(!showAccountPopup);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3002/logout', {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-black'}`}>
        {/* Navigation content */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center space-x-3">
              <Link href="/loginhome" className="flex items-center space-x-3">
                <Book className={`w-8 h-8 ${isScrolled ? 'text-black' : 'text-white'}`} />
                <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-black' : 'text-white'}`}>
                  LibraryHub
                </span>
              </Link>
            </div>
            {/* Other nav items */}
          </div>
        </div>
        {showAccountPopup && (
          <div className="account-popup absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-40">
            {/* Account Popup content */}
            <button onClick={handleLogout} className="w-full py-2 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </nav>
      <main className="flex-grow pt-24 pb-16">{children}</main>
      <footer className="bg-black">
        {/* Footer content */}
        <LibraryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          libraries={libraries}
          selectedBook={selectedBook}
          onBorrowFromLibrary={handleBorrowFromLibrary}
        />
      </footer>
    </div>
  );
};

export default Layout;