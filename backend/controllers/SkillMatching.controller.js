import { Profile } from '../models/Profile.model.js';

export const findMatches = async (req, res) => {
  try {
    const userId = req.user_id;

    const userProfile = await Profile.findOne({ userId });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please create a profile first.',
      });
    }

    const userSkillsOffered = userProfile.skillsOffered.map((skill) =>
      skill.name.toLowerCase()
    );
    const userSkillsRequired = userProfile.skillsRequired.map((skill) =>
      skill.name.toLowerCase()
    );

    const matchingProfiles = await Profile.aggregate([
      { $match: { userId: { $ne: userProfile.userId } } },
      {
        $addFields: {
          offeredMatchScore: {
            $size: {
              $setIntersection: [
                {
                  $map: {
                    input: '$skillsOffered',
                    as: 'skill',
                    in: { $toLower: '$$skill.name' },
                  },
                },
                userSkillsRequired,
              ],
            },
          },
          requiredMatchScore: {
            $size: {
              $setIntersection: [
                {
                  $map: {
                    input: '$skillsRequired',
                    as: 'skill',
                    in: { $toLower: '$$skill.name' },
                  },
                },
                userSkillsOffered,
              ],
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { offeredMatchScore: { $gt: 0 } },
            { requiredMatchScore: { $gt: 0 } },
          ],
        },
      },
      {
        $addFields: {
          totalMatchScore: { $add: ['$offeredMatchScore', '$requiredMatchScore'] },
        },
      },
      { $sort: { totalMatchScore: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          userId: 1,
          title: 1,
          bio: 1,
          location: 1,
          skillsOffered: 1,
          skillsRequired: 1,
          availability: 1,
          rating: 1,
          offeredMatchScore: 1,
          requiredMatchScore: 1,
          totalMatchScore: 1,
          'user.firstName': 1,
          'user.lastName': 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      matches: matchingProfiles,
    });
  } catch (error) {
    console.error('Find matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding matches',
      error: error.message,
    });
  }
};

export const searchBySkill = async (req, res) => {
  try {
    const { skill } = req.query;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill parameter is required',
      });
    }

    const skillLower = skill.toLowerCase();

    const profiles = await Profile.aggregate([
      {
        $match: {
          $or: [
            { 'skillsOffered.name': { $regex: skillLower, $options: 'i' } },
            { 'skillsRequired.name': { $regex: skillLower, $options: 'i' } },
          ],
        },
      },
      {
        $addFields: {
          offersSkill: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$skillsOffered',
                    as: 'skill',
                    cond: { $regexMatch: { input: { $toLower: '$$skill.name' }, regex: skillLower } },
                  },
                },
              },
              0,
            ],
          },
          requiresSkill: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$skillsRequired',
                    as: 'skill',
                    cond: { $regexMatch: { input: { $toLower: '$$skill.name' }, regex: skillLower } },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          userId: 1,
          title: 1,
          bio: 1,
          location: 1,
          skillsOffered: 1,
          skillsRequired: 1,
          availability: 1,
          rating: 1,
          offersSkill: 1,
          requiresSkill: 1,
          'user.firstName': 1,
          'user.lastName': 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error('Search by skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching profiles by skill',
      error: error.message,
    });
  }
};