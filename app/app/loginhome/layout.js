'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Building2, 
  Book, 
  User, 
  ShoppingCart, 
  X, 
  Menu, 
  Search,
  Phone,
  Star,
  BookOpen,
  XCircle,
  CircleCheck,
  AlertCircle
} from 'lucide-react';
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
    <div className={`absolute top-full left-0 w-96 mt-2 rounded-xl shadow-lg overflow-hidden ${
      isScrolled ? 'bg-white' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-h-96 overflow-y-auto">
        {results.map((book, index) => (
          <div 
            key={book.id || index} 
            className="group hover:bg-gray-50 transition-colors duration-200"
            role="option"
            tabIndex={0}
            onClick={() => onSelect && onSelect(book)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect && onSelect(book)}
          >
            <div className="flex items-start p-4 space-x-4">
              <div className="flex-shrink-0">
                {book.image ? (
                  <img
                    src={getFullImagePath(book.image)}
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded-md shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-book.png';
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

const LibraryModal = ({ isOpen, onClose, libraries, selectedBook, onBorrowFromLibrary }) => {
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState({});
  const [activeLibrary, setActiveLibrary] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && libraries?.length > 0) {
      setActiveLibrary(libraries[0]);
      fetchLocations();
    }
  }, [isOpen, libraries]);

  const fetchLocations = async () => {
    if (!libraries?.length) return;
    
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
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load location information');
    }
  };

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
      color: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
      icon: <CircleCheck className="h-4 w-4 mr-1 animate-pulse" />,
      label: "Available",
      message: `${library.stock} copies available`
    };
    if (library.stock > 0) return {
      color: "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800",
      icon: <Clock className="h-4 w-4 mr-1 animate-spin animate-duration-[3000ms]" />,
      label: "Limited Stock",
      message: `${library.stock} copies left`
    };
    return {
      color: "bg-gradient-to-r from-red-100 to-red-200 text-red-800",
      icon: <AlertCircle className="h-4 w-4 mr-1 animate-pulse" />,
      label: "Unavailable",
      message: "Currently out of stock"
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white rounded-2xl w-full max-w-5xl shadow-2xl transform transition-all overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800 to-black">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedBook?.title}
            </h2>
            <p className="text-gray-300 mt-1">Available at {libraries?.length || 0} locations</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <XCircle className="w-6 h-6 text-white hover:text-gray-200" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Library List */}
          <div className="w-1/2 border-r overflow-y-auto bg-gray-50">
            {libraries?.map((library, index) => {
              const availability = getAvailabilityStatus(library);
              return (
                <div 
                  key={library._id || index}
                  onClick={() => setActiveLibrary(library)}
                  className={`p-6 border-b cursor-pointer transition-all duration-200 ${
                    activeLibrary?._id === library._id 
                      ? 'bg-gray-100 border-l-4 border-l-black' 
                      : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {library.adminId?.Library_name || 'Library Name Not Available'}
                      </h3>
                      <div className={`${availability.color} px-3 py-1 rounded-full flex items-center text-sm`}>
                        {availability.icon}
                        {availability.label}
                      </div>
                    </div>
                    
                    {/* Library Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                        <p className="text-sm">{library.adminId?.address || 'Address Not Available'}</p>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-3 text-blue-600" />
                        <p className="text-sm">9:00 AM - 6:00 PM</p>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Building2 className="w-5 h-5 mr-3 text-blue-600" />
                        <p className="text-sm">{availability.message}</p>
                      </div>
                    </div>

                    {/* Borrow Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBorrowFromLibrary(selectedBook, library._id, library.adminId);
                      }}
                      disabled={library.stock === 0}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                        library.stock === 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-900 text-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <BookOpen className="w-5 h-5" />
                      <span>{library.stock === 0 ? 'Not Available' : 'Reserve Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location Details */}
          <div className="w-1/2 p-6 bg-white">
            {activeLibrary && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Location Details</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {locations[activeLibrary.adminId?._id]?.distance 
                        ? `${(locations[activeLibrary.adminId?._id]?.distance).toFixed(1)} miles away`
                        : 'Distance information unavailable'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMapClick(activeLibrary.adminId?._id)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Open in Maps
                  </button>
                </div>

                {/* Detailed Information Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-md">
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Contact Information</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {activeLibrary.adminId?.phone || 'Phone not available'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activeLibrary.adminId?.email || 'Email not available'}
                        </p>
                      </div>
                    </div>

                    {/* Hours of Operation */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Operating Hours</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                          <div>Monday - Friday</div>
                          <div>9:00 AM - 6:00 PM</div>
                          <div>Saturday</div>
                          <div>10:00 AM - 4:00 PM</div>
                          <div>Sunday</div>
                          <div>Closed</div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          Free WiFi available
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          Study rooms available
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          Printing services
                        </li>
                      </ul>
                    </div>
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
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Detect client-side once mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside search results
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

  // Handle search with debounce
// Handle search with debounce
useEffect(() => {
  const searchTimeout = setTimeout(async () => {
    if (searchQuery) {
      setIsSearching(true);
      try {
        // You might need to update this URL to the correct endpoint
        const searchResponse = await axios.get('http://localhost:3002/bookquery', {
          withCredentials: true,
          params: { query: searchQuery },
        });
        setSearchResults(searchResponse.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
        // You could add more specific error handling here
        // For example, show a toast notification to the user
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, 300);
  return () => clearTimeout(searchTimeout);
}, [searchQuery]);

  // Updated handleBookSelect to pass the entire book object
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

  const handleBorrowFromLibrary = async (bookData, libraryId, adminData) => {
    try {
      // Log the received data for debugging
      console.log('Received data:', { bookData, libraryId, adminData });

      // Extract the required IDs with proper validation
      const bookId = bookData?.id || bookData?._id;
      const adminId = adminData?._id;

      // Validate all required fields
      if (!bookId || !libraryId || !adminId) {
        console.error('Missing data:', { bookId, libraryId, adminId });
        throw new Error(`Missing required information: ${!bookId ? 'bookId' : !libraryId ? 'libraryId' : 'adminId'}`);
      }

      // Make the borrow request
      const response = await axios.post(
        'http://localhost:3002/borrow',
        {
          bookId,
          libraryId,
          adminId
        },
        {
          withCredentials: true
        }
      );

      if (response.status === 200) {
        // Create notification after successful borrow
        try {
          const userResponse = await axios.get('http://localhost:3002/user', {
            withCredentials: true
          });

          const notificationData = {
            adminId,
            userId: userResponse.data._id,
            bookId,
            message: `${userResponse.data.name || 'A user'} has reserved "${bookData.title}"`,
            type: 'reserve'
          };

          await axios.post(
            'http://localhost:3002/adminnotification',
            notificationData,
            { withCredentials: true }
          );
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }

        // Update UI state
        setBorrowedBooks(prev => [...(Array.isArray(prev) ? prev : []), bookId]);
        setIsModalOpen(false);
        
        // Show success message
        alert('Book reserved successfully!');
      }
    } catch (error) {
      console.error('Error in handleBorrowFromLibrary:', error);
      
      alert(error.message || 'Failed to reserve book. Please try again.');
    }
  };

  const fetchLibraryInfo = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get('http://localhost:3002/user', { withCredentials: true });
    setUserInfo(response.data);
    console.log('userdata',response.data);
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
  // Fetch library info once component mounts
  useEffect(() => {
    fetchLibraryInfo();
  }, []);

  // Handle click outside of account popup to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAccountPopup && !event.target.closest('.account-popup') && !event.target.closest('.account-button')) {
        setShowAccountPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountPopup]);

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
            <div className="hidden lg:flex items-center space-x-10">
              <div className="flex space-x-8">
                {['Home', 'Catalog', 'About'].map((item) => (
                  <Link
                    key={item}
                    href={item === 'Catalog' 
                      ? '/loginhome/catalog' 
                      : item === 'About'
                      ? '/loginhome/about'
                      : '/loginhome'}
                    className={`font-medium text-sm tracking-wider transition-colors duration-200 ${
                      isScrolled ? 'text-gray-800 hover:text-black' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.toUpperCase()}
                  </Link>
                ))}
              </div>
              <div className="relative">
                <SearchInput 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isSearching={isSearching}
                  isScrolled={isScrolled}
                />
                <SearchResults 
                  results={searchResults}
                  isVisible={searchQuery.length > 0}
                  isScrolled={isScrolled}
                  onSelect={handleBookSelect}
                />
              </div>
              <div className="flex items-center space-x-6">
                <Link 
                  href="/loginhome/orders"
                  className="p-2 rounded-full hover:bg-gray-800/20 transition-colors duration-200"
                >
                  <ShoppingCart className={`w-5 h-5 ${isScrolled ? 'text-gray-800' : 'text-gray-300'}`} />
                </Link>
                <button
                  onClick={toggleAccountPopup}
                 className="account-button flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-200 bg-black text-white hover:bg-gray-900"
                  >
                <User className="w-4 h-4" />
               <span className="text-sm font-medium">Account</span>
               </button>
                <button
                  onClick={() => setMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-800/20"
                >
                  {isMenuOpen ? (
                    <X className={`w-6 h-6 ${isScrolled ? 'text-black' : 'text-white'}`} />
                  ) : (
                    <Menu className={`w-6 h-6 ${isScrolled ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              </div>
            </div>
            {isMenuOpen && (
              <div className="lg:hidden bg-white shadow-xl rounded-b-2xl">
                <div className="px-6 py-4 space-y-4">
                  {['Home', 'Catalog', 'About'].map((item) => (
                    <Link
                      key={item}
                      href={item === 'Catalog' 
                        ? '/loginhome/catalog' 
                        : item === 'About'
                        ? '/loginhome/about'
                        : '/loginhome'}
                      className="block px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  ))}
                  <div className="relative mt-4">
                    <SearchInput 
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      isSearching={isSearching}
                      isScrolled={true}
                    />
                    <SearchResults 
                      results={searchResults}
                      isVisible={searchQuery.length > 0}
                      isScrolled={true}
                      onSelect={handleBookSelect}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <Link href="/loginhome/orders" className="flex items-center space-x-2 px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Orders</span>
                    </Link>
                    <Link href="/account" className="flex items-center space-x-2 px-4 py-3 text-gray-800 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                      <User className="w-5 h-5" />
                      <span>Account</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          {showAccountPopup && (
  <div className="account-popup absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-40">
    <div className="p-4 border-b border-slate-200">
      <h3 className="font-bold text-lg text-slate-800">Account Information</h3>
    </div>
    {isLoading ? (
      <div className="p-4 text-center">
        <p className="text-sm text-slate-600">Loading account info...</p>
      </div>
    ) : error ? (
      <div className="p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button 
          onClick={fetchLibraryInfo}
          className="mt-2 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    ) : (
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-500">NAME</label>
          <p className="text-sm font-medium text-slate-800">{userInfo.name}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">EDUCATION</label>
          <p className="text-sm font-medium text-slate-800">{userInfo.education}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">EMAIL</label>
          <p className="text-sm font-medium text-slate-800">{userInfo.email}</p>
        </div>
      </div>
    )}
    <div className="p-4 border-t border-slate-200">
      <button 
        onClick={handleLogout}
        className="w-full py-2 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
      >
        <span>Sign Out</span>
      </button>
    </div>
  </div>
)}
        </div>
      </nav>
      <main className="flex-grow pt-24 pb-16">
        {children}
      </main>
      <footer className="bg-black">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Book className="w-6 h-6 text-white" />
                <span className="text-xl font-bold text-white">LibraryHub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Discover a world of knowledge through our comprehensive collection of books, research materials, and educational resources.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                {['Book Borrowing', 'Research Help', 'Study Spaces', 'Digital Library'].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase().replace(' ', '-')}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6">Contact</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center space-x-2">
                  <span>123 Library Street</span>
                </li>
                <li>City, State 12345</li>
                <li className="hover:text-white transition-colors duration-200">
                  <a href="tel:+15551234567">(555) 123-4567</a>
                </li>
                <li className="hover:text-white transition-colors duration-200">
                  <a href="mailto:info@libraryhub.com">info@libraryhub.com</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6">Hours</h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li>Monday - Friday: 8AM - 9PM</li>
                <li>Saturday: 9AM - 6PM</li>
                <li>Sunday: 11AM - 5PM</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800">
            <div className="text-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} LibraryHub. All rights reserved.</p>
            </div>
          </div>
        </div>
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