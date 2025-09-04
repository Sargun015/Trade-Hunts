import mongoose from 'mongoose';

const PortfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  projectUrl: {
    type: String,
  },
});




const ProfileSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
      },
      bio: {
        type: String,
      },
      title: {
        type: String,
        trim: true,
      },
      location: {
        country: {
          type: String,
        },
        city: {
          type: String,
        },
      },
      skillsOffered: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Expert'],
            required: true,
          },
        },
      ],
      skillsRequired: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Expert'],
            required: true,
          }
        },
      ],
      portfolio: {
        type: [PortfolioItemSchema],
        default: [],
      },
      socialLinks: {
        linkedin: String,
        github: String,
        website: String,
        twitter: String,
      },
      rating: {
        average: {
          type: Number,
          default: 0,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    },
    {
      timestamps: true,
    }
  );


export const Profile = mongoose.model('Profile', ProfileSchema);