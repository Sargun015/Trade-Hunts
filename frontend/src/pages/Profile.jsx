import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const ProfilePage = () => {
  const { user, userProfile, token, setLoading } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    title: "",
    location: {
      country: "",
      city: "",
    },
    skillsOffered: [],
    skillsRequired: [],
    socialLinks: {
      linkedin: "",
      github: "",
      website: "",
      twitter: "",
    },
    portfolio: [],
  });

  const [newSkillOffered, setNewSkillOffered] = useState({
    name: "",
    level: "Beginner",
  });
  const [newSkillRequired, setNewSkillRequired] = useState({
    name: "",
    level: "Beginner",
  });
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    imageUrl: "",
    projectUrl: "",
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Initialize form data when user and profile are loaded
  useEffect(() => {
    if (user && userProfile) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: userProfile.bio || "",
        title: userProfile.title || "",
        location: {
          country: userProfile.location?.country || "",
          city: userProfile.location?.city || "",
        },
        skillsOffered: userProfile.skillsOffered || [],
        skillsRequired: userProfile.skillsRequired || [],
        socialLinks: {
          linkedin: userProfile.socialLinks?.linkedin || "",
          github: userProfile.socialLinks?.github || "",
          website: userProfile.socialLinks?.website || "",
          twitter: userProfile.socialLinks?.twitter || "",
        },
        portfolio: userProfile.portfolio || [],
      });
    }
  }, [user, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSkillOfferedChange = (e) => {
    const { name, value } = e.target;
    setNewSkillOffered({
      ...newSkillOffered,
      [name]: value,
    });
  };

  const handleSkillRequiredChange = (e) => {
    const { name, value } = e.target;
    setNewSkillRequired({
      ...newSkillRequired,
      [name]: value,
    });
  };

  const handlePortfolioItemChange = (e) => {
    const { name, value } = e.target;
    setNewPortfolioItem({
      ...newPortfolioItem,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setNewPortfolioItem({
          ...newPortfolioItem,
          imageUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkillOffered = () => {
    if (newSkillOffered.name.trim()) {
      setFormData({
        ...formData,
        skillsOffered: [...formData.skillsOffered, newSkillOffered],
      });
      setNewSkillOffered({ name: "", level: "Beginner" });
    }
  };

  const addSkillRequired = () => {
    if (newSkillRequired.name.trim()) {
      setFormData({
        ...formData,
        skillsRequired: [...formData.skillsRequired, newSkillRequired],
      });
      setNewSkillRequired({
        name: "",
        level: "Beginner",
      });
    }
  };

  const addPortfolioItem = () => {
    if (
      newPortfolioItem.title.trim() &&
      newPortfolioItem.description.trim() &&
      newPortfolioItem.imageUrl
    ) {
      setFormData({
        ...formData,
        portfolio: [...formData.portfolio, newPortfolioItem],
      });
      setNewPortfolioItem({
        title: "",
        description: "",
        imageUrl: "",
        projectUrl: "",
      });
      setPreviewImage(null);
    } else {
      alert("Please fill in all required fields (title, description, and image)");
    }
  };

  const removeSkillOffered = (index) => {
    const updatedSkills = [...formData.skillsOffered];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      skillsOffered: updatedSkills,
    });
  };

  const removeSkillRequired = (index) => {
    const updatedSkills = [...formData.skillsRequired];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      skillsRequired: updatedSkills,
    });
  };

  const removePortfolioItem = async (index, itemId) => {
    try {
      if (itemId) {
        // If item exists in database, delete it via API
        setLoading(true);
        await axios.delete(
          `http://localhost:5000/api/profile/portfolio/${itemId}`,
          { headers: { token } }
        );
        setLoading(false);
      }

      // Remove item from local state
      const updatedPortfolio = [...formData.portfolio];
      updatedPortfolio.splice(index, 1);
      setFormData({
        ...formData,
        portfolio: updatedPortfolio,
      });
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      alert("Failed to delete portfolio item. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user info (firstName, lastName)
      await axios.put(
        "http://localhost:5000/api/user/update",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
        },
        { headers: { token } }
      );
      // Update profile info including portfolio
      await axios.post(
        "http://localhost:5000/api/profile/",
        {
          bio: formData.bio,
          title: formData.title,
          location: formData.location,
          skillsOffered: formData.skillsOffered,
          skillsRequired: formData.skillsRequired,
          socialLinks: formData.socialLinks,
          portfolio: formData.portfolio,
        },
        { headers: { token } }
      );

      setIsEditing(false);
      // Reload user data to reflect changes
      window.location.reload();
    } catch (error) {
      console.error(error);
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Profile" : "Profile"}
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded ${
              isEditing ? "bg-gray-500 text-white" : "bg-blue-500 text-white"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Basic Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="e.g. Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Social Links</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="socialLinks.github"
                    value={formData.socialLinks.github}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Personal Website
                  </label>
                  <input
                    type="url"
                    name="socialLinks.website"
                    value={formData.socialLinks.website}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>

            {/* Skills Offered */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Skills I Offer</h2>

              <div className="space-y-2 mb-4">
                {formData.skillsOffered.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                  >
                    <span className="flex-1">
                      <strong>{skill.name}</strong> - {skill.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSkillOffered(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  name="name"
                  value={newSkillOffered.name}
                  onChange={handleSkillOfferedChange}
                  placeholder="Skill name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />

                <select
                  name="level"
                  value={newSkillOffered.level}
                  onChange={handleSkillOfferedChange}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>

                <button
                  type="button"
                  onClick={addSkillOffered}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Skills Required */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Skills I'm Looking For
              </h2>

              <div className="space-y-2 mb-4">
                {formData.skillsRequired.map((skill, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="flex justify-between">
                      <div>
                        <strong>{skill.name}</strong> - {skill.level}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSkillRequired(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  name="name"
                  value={newSkillRequired.name}
                  onChange={handleSkillRequiredChange}
                  placeholder="Skill name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />

                <select
                  name="level"
                  value={newSkillRequired.level}
                  onChange={handleSkillRequiredChange}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>

                <button
                  type="button"
                  onClick={addSkillRequired}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Portfolio</h2>

              {/* List existing portfolio items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {formData.portfolio.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      {item.projectUrl && (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                        >
                          Project URL: {item.projectUrl}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removePortfolioItem(index, item._id)}
                        className="mt-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new portfolio item */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Add Portfolio Item</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newPortfolioItem.title}
                      onChange={handlePortfolioItemChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Project title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={newPortfolioItem.description}
                      onChange={handlePortfolioItemChange}
                      rows="3"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="Project description"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Project URL
                    </label>
                    <input
                      type="url"
                      name="projectUrl"
                      value={newPortfolioItem.projectUrl}
                      onChange={handlePortfolioItemChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                      placeholder="https://example.com/project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-1 block w-full"
                    />
                    {previewImage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full max-h-40 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={addPortfolioItem}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    Add Portfolio Item
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Display mode - show user profile info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Basic Information
                </h2>
                <p className="text-2xl font-bold mb-2">
                  {user.firstName} {user.lastName}
                </p>
                {userProfile.title && (
                  <p className="text-lg text-gray-600 mb-4">
                    {userProfile.title}
                  </p>
                )}
                {userProfile.bio && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700">About</h3>
                    <p className="text-gray-600">{userProfile.bio}</p>
                  </div>
                )}
                {(userProfile.location?.country ||
                  userProfile.location?.city) && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700">Location</h3>
                    <p className="text-gray-600">
                      {userProfile.location?.city && userProfile.location.city}
                      {userProfile.location?.city &&
                        userProfile.location?.country &&
                        ", "}
                      {userProfile.location?.country &&
                        userProfile.location.country}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Social Links</h2>
                <div className="space-y-2">
                  {userProfile.socialLinks?.linkedin && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">
                        LinkedIn:
                      </span>
                      <a
                        href={userProfile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {userProfile.socialLinks.linkedin}
                      </a>
                    </div>
                  )}
                  {userProfile.socialLinks?.github && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">
                        GitHub:
                      </span>
                      <a
                        href={userProfile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {userProfile.socialLinks.github}
                      </a>
                    </div>
                  )}
                  {userProfile.socialLinks?.website && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">
                        Website:
                      </span>
                      <a
                        href={userProfile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {userProfile.socialLinks.website}
                      </a>
                    </div>
                  )}
                  {userProfile.socialLinks?.twitter && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">
                        Twitter:
                      </span>
                      <a
                        href={userProfile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {userProfile.socialLinks.twitter}
                      </a>
                    </div>
                  )}
                  {!userProfile.socialLinks?.linkedin &&
                    !userProfile.socialLinks?.github &&
                    !userProfile.socialLinks?.website &&
                    !userProfile.socialLinks?.twitter && (
                      <p className="text-gray-500 italic">
                        No social links added yet
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Skills I Offer</h2>
                {userProfile.skillsOffered &&
                userProfile.skillsOffered.length > 0 ? (
                  <div className="space-y-2">
                    {userProfile.skillsOffered.map((skill, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <span className="font-medium">{skill.name}</span>
                        <span className="ml-2 text-gray-600">
                          {" "}
                          - {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills offered yet</p>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Skills I'm Looking For
                </h2>
                {userProfile.skillsRequired &&
                userProfile.skillsRequired.length > 0 ? (
                  <div className="space-y-3">
                    {userProfile.skillsRequired.map((skill, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <span className="font-medium">{skill.name}</span>
                        <span className="ml-2 text-gray-600">
                          {" "}
                          - {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills required yet</p>
                )}
              </div>
            </div>

            {/* Portfolio section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
              {userProfile.portfolio && userProfile.portfolio.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userProfile.portfolio.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg overflow-hidden shadow-sm"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-bold">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm mt-2 inline-block hover:underline"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No portfolio items added yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;