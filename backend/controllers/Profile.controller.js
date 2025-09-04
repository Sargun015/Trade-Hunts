import mongoose from 'mongoose';
import { Profile } from '../models/Profile.model.js';
import { User } from '../models/User.model.js';
import { uploadImage, deleteImage } from '../utils/Cloudinary.js';

export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      bio,
      title,
      location,
      skillsOffered,
      skillsRequired,
      portfolio,
      availability,
      socialLinks
    } = req.body;

    let profile = await Profile.findOne({ userId: req.user_id });

    const processedPortfolio = [];
    if (portfolio && portfolio.length > 0) {
      for (const item of portfolio) {
        if (item.imageUrl && item.imageUrl.startsWith('data:')) {
          const uploadResult = await uploadImage(item.imageUrl, 'portfolio');
          if (uploadResult.success) {
            processedPortfolio.push({
              ...item,
              imageUrl: uploadResult.url
            });
          } else {
            return res.status(500).json({
              success: false,
              message: 'Error uploading portfolio image',
              error: uploadResult.error
            });
          }
        } else {
          processedPortfolio.push(item);
        }
      }
    }

    const profileData = {
      userId: req.user_id,
      bio,
      title,
      location,
      skillsOffered,
      skillsRequired,
      portfolio: processedPortfolio.length > 0 ? processedPortfolio : portfolio,
      availability,
      socialLinks
    };

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { userId: req.user_id },
        { $set: profileData },
        { new: true }
      );
    } else {
      profile = new Profile(profileData);
      await profile.save();
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile creation/update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating/updating profile',
      error: error.message
    });
  }
};

export const getCurrentUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user_id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const user = await User.findById(userId).select('firstName lastName');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      profile,
      user: {
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Get profile by user ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

export const deletePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const profile = await Profile.findOne({ userId: req.user_id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    const portfolioItem = profile.portfolio.id(itemId);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    const imageUrl = portfolioItem.imageUrl;

    profile.portfolio.pull(itemId);
    await profile.save();

    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
      await deleteImage(publicId);
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting portfolio item',
      error: error.message
    });
  }
};