import React, { useState, useEffect, useContext } from 'react';
import { Search, MapPin, Calendar, Star, ArrowUpDown, Filter } from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';



const BrowsePage = () => {
  const { token } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [sortBy, setSortBy] = useState('matchScore');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let response;

        if (activeTab === 'matches') {
          response = await axios.get('http://localhost:5000/api/skill/matches', { headers: { token } });
          setProfiles(response.data.matches || []);
        } else if (activeTab === 'search' && searchQuery.trim().length > 2) {
          response = await axios.get(`http://localhost:5000/api/skill/search?skill=${searchQuery}`, { headers: { token } });
          setProfiles(response.data.profiles || []);
        } else if (activeTab === 'search') {
          setProfiles([]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles. Please try again later.');
        setIsLoading(false);
        setProfiles([]);
      }
    };

    fetchData();
  }, [activeTab, searchQuery, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length > 2) {
      setActiveTab('search');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'matches') {
      setSortBy('matchScore');
    }
  };



  const navigate = useNavigate();

  const handleContactClick =async  (profileId, userId) => {
    console.log('Contacting user:', profileId , userId);
    const res = await axios.post('http://localhost:5000/api/request/', { providerId:userId , terms:"Initial Contact Request" }, { headers: { token } });
    console.log(res);
    if(res.data.success){
      navigate(`/messages?userId=${userId}`);
    }
  };
  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return null;
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (isNaN(numRating)) return null;
    return numRating.toFixed(1);
  };

  const sortProfiles = (profilesToSort) => {
    if (!Array.isArray(profilesToSort)) {
      console.error('Expected profiles to be an array, got:', profilesToSort);
      return [];
    }

    return [...profilesToSort].sort((a, b) => {
      if (sortBy === 'matchScore') {
        return (b.totalMatchScore || 0) - (a.totalMatchScore || 0);
      } else if (sortBy === 'rating') {
        const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0);
        const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0);
        return ratingB - ratingA;
      } else if (sortBy === 'location') {
        const locationA = typeof a.location === 'object' ? `${a.location.city}, ${a.location.country}` : a.location || '';
        const locationB = typeof b.location === 'object' ? `${b.location.city}, ${b.location.country}` : b.location || '';
        return locationA.localeCompare(locationB);
      }
      return 0;
    });
  };

  const sortedProfiles = sortProfiles(profiles);

  const renderLocation = (location) => {
    if (typeof location === 'object' && location !== null) {
      return `${location.city}, ${location.country}`;
    }
    return location || 'Unknown location';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Find Skill Exchanges</h1>

        <div className="flex mb-6 border-b">
          <button
            className={`pb-2 px-4 ${activeTab === 'matches' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => handleTabChange('matches')}
          >
            Best Matches
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-blue-500 font-medium text-blue-600' : 'text-gray-500'}`}
            onClick={() => handleTabChange('search')}
          >
            Search
          </button>
        </div>

        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 pl-10 border rounded-lg"
                placeholder="Search by skill (e.g., React, Design, Writing...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600"
              >
                Search
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            >
              <Filter size={16} className="mr-1" />
              Filters
            </button>

            {filterMenuOpen && (
              <div className="absolute mt-32 bg-white shadow-lg rounded-lg p-4 z-10 border">
                <h3 className="font-medium mb-2">Filter by:</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Offering skills I need
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Needing skills I offer
                  </label>
                  <div className="pt-2">
                    <h4 className="text-sm font-medium mb-1">Availability:</h4>
                    <select className="w-full border rounded p-1">
                      <option>Any</option>
                      <option>Weekdays</option>
                      <option>Weekends</option>
                      <option>Evenings</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select
              className="border rounded p-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {activeTab === 'matches' && <option value="matchScore">Match Score</option>}
              <option value="rating">Rating</option>
              <option value="location">Location</option>
            </select>
            <ArrowUpDown size={16} className="ml-1 text-gray-500" />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedProfiles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              {activeTab === 'search' && searchQuery.trim().length <= 2
                ? "Enter at least 3 characters to search"
                : "No profiles found. Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProfiles.map((profile) => (
              <div key={profile._id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{profile.user?.firstName} {profile.user?.lastName}</h3>
                      <p className="text-sm text-gray-600">{profile.title}</p>
                    </div>
                    {activeTab === 'matches' && (
                      <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {profile.totalMatchScore || 0} Match{(profile.totalMatchScore !== 1) ? 'es' : ''}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">{profile.bio}</p>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin size={16} className="mr-1" />
                    <span>{renderLocation(profile.location)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar size={16} className="mr-1" />
                    <span>Available: {profile.availability}</span>
                  </div>

                  {profile.rating != null && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Star size={16} className="mr-1 text-yellow-500" />
                      <span>{formatRating(profile.rating) || 'N/A'}</span>
                    </div>
                  )}

                  <div className="mb-3">
                    <h4 className="text-sm font-medium mb-1">Offers:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(profile.skillsOffered || []).map((skill, index) => {
                        const skillName = typeof skill === 'object' ? skill.name : skill;
                        const isMatch = activeTab === 'matches' && (profile.requiredMatchScore > 0);

                        return (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs 
                              ${isMatch ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {skillName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Needs:</h4>
                    <div className="flex flex-wrap gap-1">
                      {(profile.skillsRequired || []).map((skill, index) => {
                        const skillName = typeof skill === 'object' ? skill.name : skill;
                        const isMatch = activeTab === 'matches' && (profile.offeredMatchScore > 0);

                        return (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs 
                              ${isMatch ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {skillName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t p-4 mt-auto">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors" onClick={() => handleContactClick(profile._id, profile.userId)}>
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;