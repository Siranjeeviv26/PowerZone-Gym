const spec = {
  openapi: '3.0.0',
  info: {
    title: 'PowerZone Gym API',
    version: '1.0.0',
    description: 'REST API for PowerZone Gym Management System',
  },
  servers: [
    { url: 'https://powerzone-gym-backend.onrender.com/api', description: 'Production' },
    { url: 'http://localhost:5000/api', description: 'Local' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Trainers' },
    { name: 'Plans' },
    { name: 'Offers' },
    { name: 'Gallery' },
    { name: 'Workouts' },
    { name: 'Diet' },
    { name: 'Branches' },
    { name: 'Activities' },
    { name: 'Testimonials' },
    { name: 'Contact' },
    { name: 'Notifications' },
    { name: 'Legal' },
    { name: 'Settings' },
    { name: 'Site Content' },
    { name: 'Admin' },
    { name: 'Payments' },
    { name: 'Master Data' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Server health check',
        responses: { 200: { description: 'OK' } },
      },
    },

    // AUTH
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'secret123' },
                  phone: { type: 'string', example: '+91 98765 43210' },
                  goal: { type: 'string', example: 'Build Muscle' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Account created — returns token + user' },
          400: { description: 'Validation error or email exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@powerzone.com' },
                  password: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful — returns token + user' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Current user data' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/auth/update-password': {
      put: {
        tags: ['Auth'],
        summary: 'Change own password',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Password updated' } },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Send password reset email',
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' } } },
            },
          },
        },
        responses: { 200: { description: 'Reset email sent' } },
      },
    },
    '/auth/reset-password/{token}': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using token (1-hour expiry)',
        parameters: [{ in: 'path', name: 'token', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { password: { type: 'string' } } },
            },
          },
        },
        responses: { 200: { description: 'Password reset — returns new token' }, 400: { description: 'Invalid/expired token' } },
      },
    },

    // USERS
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Get own full profile',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'User profile with membership, trainers, attendance, progress' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Update name / phone / goal',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' }, phone: { type: 'string' }, goal: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Profile updated' } },
      },
    },
    '/users/profile/avatar': {
      put: {
        tags: ['Users'],
        summary: 'Upload profile photo',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { avatar: { type: 'string', format: 'binary' } } },
            },
          },
        },
        responses: { 200: { description: 'Avatar uploaded — returns updated user' } },
      },
    },
    '/users/checkin': {
      post: {
        tags: ['Users'],
        summary: 'Log gym attendance',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  duration: { type: 'number', example: 60 },
                  workoutType: { type: 'string', example: 'Chest & Triceps' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Attendance logged' } },
      },
    },
    '/users/attendance': {
      get: {
        tags: ['Users'],
        summary: 'Get own attendance records',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Attendance list' } },
      },
    },
    '/users/weight': {
      post: {
        tags: ['Users'],
        summary: 'Log body measurement',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  weight: { type: 'number', example: 75.5 },
                  bodyFat: { type: 'number', example: 18.2 },
                  muscleMass: { type: 'number', example: 45.1 },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Progress entry created' } },
      },
    },
    '/users/progress': {
      get: {
        tags: ['Users'],
        summary: 'Get all progress records',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Progress list' } },
      },
    },
    '/users/progress/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Update progress entry notes',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { notes: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a progress entry',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/users/my-diet-plan': {
      get: {
        tags: ['Users'],
        summary: 'Get assigned diet plan',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Diet plan' } },
      },
    },
    '/users/my-workout-plan': {
      get: {
        tags: ['Users'],
        summary: 'Get assigned workout plan',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Workout plan' } },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'role', schema: { type: 'string' } },
          { in: 'query', name: 'branch', schema: { type: 'string' } },
          { in: 'query', name: 'status', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Users list' } },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user account (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/users/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Update any user (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // TRAINERS
    '/trainers': {
      get: {
        tags: ['Trainers'],
        summary: 'Get all active trainers',
        parameters: [
          { in: 'query', name: 'branch', schema: { type: 'string' } },
          { in: 'query', name: 'speciality', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Trainers list' } },
      },
      post: {
        tags: ['Trainers'],
        summary: 'Create trainer (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  speciality: { type: 'string' },
                  image: { type: 'string', format: 'binary' },
                  bio: { type: 'string' },
                  experience: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Trainer created' } },
      },
    },
    '/trainers/{id}': {
      get: {
        tags: ['Trainers'],
        summary: 'Get trainer by ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Trainer detail with reviews' } },
      },
      put: {
        tags: ['Trainers'],
        summary: 'Update trainer (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Trainers'],
        summary: 'Delete trainer (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/trainers/{id}/reviews': {
      post: {
        tags: ['Trainers'],
        summary: 'Add a review',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { rating: { type: 'number', example: 5 }, comment: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Review added' } },
      },
    },
    '/trainers/me/profile': {
      get: {
        tags: ['Trainers'],
        summary: 'Get own trainer profile',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Trainer profile' } },
      },
      put: {
        tags: ['Trainers'],
        summary: 'Update own bio / photo',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { bio: { type: 'string' }, phone: { type: 'string' }, image: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
    },
    '/trainers/me/clients': {
      get: {
        tags: ['Trainers'],
        summary: 'Get all assigned clients',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Clients list' } },
      },
    },
    '/trainers/me/clients/{userId}': {
      get: {
        tags: ['Trainers'],
        summary: 'Get client detail (profile + plans)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Client detail with diet and workout plans' } },
      },
    },
    '/trainers/me/clients/{userId}/attendance': {
      post: {
        tags: ['Trainers'],
        summary: 'Mark attendance for a client',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { duration: { type: 'number' }, workoutType: { type: 'string' }, notes: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Attendance marked' } },
      },
    },
    '/trainers/me/clients/{userId}/diet': {
      post: {
        tags: ['Trainers'],
        summary: 'Assign diet plan to client',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { planId: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Diet plan assigned' } },
      },
    },
    '/trainers/me/clients/{userId}/workout': {
      post: {
        tags: ['Trainers'],
        summary: 'Assign workout plan to client',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { planId: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Workout plan assigned' } },
      },
    },

    // PLANS
    '/plans': {
      get: {
        tags: ['Plans'],
        summary: 'Get all active membership plans',
        responses: { 200: { description: 'Plans list' } },
      },
      post: {
        tags: ['Plans'],
        summary: 'Create a plan (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Elite' },
                  description: { type: 'string' },
                  monthlyPrice: { type: 'number', example: 4999 },
                  quarterlyPrice: { type: 'number', example: 12999 },
                  halfYearlyPrice: { type: 'number', example: 23999 },
                  yearlyPrice: { type: 'number', example: 39999 },
                  features: { type: 'array', items: { type: 'string' } },
                  isPopular: { type: 'boolean' },
                  color: { type: 'string', example: '#8b5cf6' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Plan created' } },
      },
    },
    '/plans/{id}': {
      put: {
        tags: ['Plans'],
        summary: 'Update a plan (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Plans'],
        summary: 'Delete a plan (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/plans/purchase': {
      post: {
        tags: ['Plans'],
        summary: 'Purchase a membership plan',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['planId', 'billingCycle'],
                properties: {
                  planId: { type: 'string' },
                  billingCycle: { type: 'string', enum: ['monthly', 'quarterly', 'half-yearly', 'annual'] },
                  paymentMethod: { type: 'string', enum: ['card', 'upi', 'netbanking', 'cash', 'wallet'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Membership activated' } },
      },
    },

    // OFFERS
    '/offers': {
      get: {
        tags: ['Offers'],
        summary: 'Get all offers',
        responses: { 200: { description: 'Offers list' } },
      },
      post: {
        tags: ['Offers'],
        summary: 'Create an offer (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image', 'title'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' },
                  isActive: { type: 'string', example: 'true' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Offer created' } },
      },
    },
    '/offers/{id}': {
      put: {
        tags: ['Offers'],
        summary: 'Update offer (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Offers'],
        summary: 'Delete offer (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // GALLERY
    '/gallery': {
      get: {
        tags: ['Gallery'],
        summary: 'Get gallery images',
        parameters: [
          { in: 'query', name: 'category', schema: { type: 'string', enum: ['Gym Floor', 'Classes', 'Trainers', 'Members', 'Events'] } },
        ],
        responses: { 200: { description: 'Images list' } },
      },
      post: {
        tags: ['Gallery'],
        summary: 'Upload image (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { image: { type: 'string', format: 'binary' }, title: { type: 'string' }, category: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Image uploaded' } },
      },
    },
    '/gallery/{id}': {
      put: {
        tags: ['Gallery'],
        summary: 'Update image metadata (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Gallery'],
        summary: 'Delete image (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // WORKOUTS
    '/workouts': {
      get: {
        tags: ['Workouts'],
        summary: 'Get workout programs',
        parameters: [{ in: 'query', name: 'planType', schema: { type: 'string', enum: ['site', 'member'] } }],
        responses: { 200: { description: 'Workout programs' } },
      },
      post: {
        tags: ['Workouts'],
        summary: 'Create workout program (Admin/Trainer)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  planType: { type: 'string', enum: ['site', 'member'] },
                  category: { type: 'string' },
                  level: { type: 'string' },
                  days: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/workouts/{id}': {
      put: {
        tags: ['Workouts'],
        summary: 'Update workout (Admin/Trainer)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Workouts'],
        summary: 'Delete workout (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // DIET
    '/diet': {
      get: {
        tags: ['Diet'],
        summary: 'Get diet plans',
        parameters: [{ in: 'query', name: 'planType', schema: { type: 'string', enum: ['site', 'member'] } }],
        responses: { 200: { description: 'Diet plans' } },
      },
      post: {
        tags: ['Diet'],
        summary: 'Create diet plan (Admin/Trainer)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  goal: { type: 'string', enum: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Vegan'] },
                  meals: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/diet/{id}': {
      put: {
        tags: ['Diet'],
        summary: 'Update diet plan (Admin/Trainer)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Diet'],
        summary: 'Delete diet plan (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // BRANCHES
    '/branches': {
      get: {
        tags: ['Branches'],
        summary: 'Get all branches',
        responses: { 200: { description: 'Branches list' } },
      },
      post: {
        tags: ['Branches'],
        summary: 'Create branch (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  location: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  manager: { type: 'string' },
                  transferFee: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Branch created' } },
      },
    },
    '/branches/{id}': {
      put: {
        tags: ['Branches'],
        summary: 'Update branch (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Branches'],
        summary: 'Delete branch (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // ACTIVITIES
    '/activities': {
      get: {
        tags: ['Activities'],
        summary: 'Get all activities/events',
        responses: { 200: { description: 'Activities list' } },
      },
      post: {
        tags: ['Activities'],
        summary: 'Create activity (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  activityType: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  time: { type: 'string' },
                  maxParticipants: { type: 'number' },
                  trainers: { type: 'array', items: { type: 'string' } },
                  branch: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Activity created' } },
      },
    },
    '/activities/{id}': {
      put: {
        tags: ['Activities'],
        summary: 'Update activity (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Activities'],
        summary: 'Delete activity (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/activities/{id}/register': {
      post: {
        tags: ['Activities'],
        summary: 'Register for an activity',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Registered' } },
      },
    },
    '/activities/{id}/unregister': {
      post: {
        tags: ['Activities'],
        summary: 'Unregister from an activity',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Unregistered' } },
      },
    },

    // TESTIMONIALS
    '/testimonials': {
      get: {
        tags: ['Testimonials'],
        summary: 'Get active testimonials',
        responses: { 200: { description: 'Testimonials list' } },
      },
      post: {
        tags: ['Testimonials'],
        summary: 'Create testimonial (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  role: { type: 'string' },
                  text: { type: 'string' },
                  rating: { type: 'number' },
                  result: { type: 'string' },
                  featured: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/testimonials/admin/all': {
      get: {
        tags: ['Testimonials'],
        summary: 'Get all testimonials including inactive (Admin)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'All testimonials' } },
      },
    },
    '/testimonials/{id}': {
      put: {
        tags: ['Testimonials'],
        summary: 'Update testimonial (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Testimonials'],
        summary: 'Delete testimonial (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // CONTACT
    '/contact': {
      get: {
        tags: ['Contact'],
        summary: 'List all enquiries (Admin)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Enquiries' } },
      },
      post: {
        tags: ['Contact'],
        summary: 'Submit a contact enquiry',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Enquiry submitted' } },
      },
    },
    '/contact/{id}/reply': {
      put: {
        tags: ['Contact'],
        summary: 'Reply to an enquiry (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { reply: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Reply sent' } },
      },
    },

    // NOTIFICATIONS
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notifications for current user',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Notifications list' } },
      },
    },
    '/notifications/mark-all-read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark all as read',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'All marked read' } },
      },
    },
    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Mark one as read',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Marked read' } },
      },
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a notification',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },

    // LEGAL
    '/legal/{type}': {
      get: {
        tags: ['Legal'],
        summary: 'Get legal content (terms or privacy)',
        parameters: [{ in: 'path', name: 'type', required: true, schema: { type: 'string', enum: ['terms', 'privacy'] } }],
        responses: { 200: { description: 'Legal sections' } },
      },
      put: {
        tags: ['Legal'],
        summary: 'Update legal content (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'type', required: true, schema: { type: 'string', enum: ['terms', 'privacy'] } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { sections: { type: 'array', items: { type: 'object', properties: { heading: { type: 'string' }, body: { type: 'string' } } } } },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
    },

    // SETTINGS
    '/settings/footer': {
      get: {
        tags: ['Settings'],
        summary: 'Get footer configuration',
        responses: { 200: { description: 'Footer settings' } },
      },
      put: {
        tags: ['Settings'],
        summary: 'Update footer (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  weekdayHours: { type: 'string' },
                  weekendHours: { type: 'string' },
                  facebook: { type: 'string' },
                  instagram: { type: 'string' },
                  twitter: { type: 'string' },
                  youtube: { type: 'string' },
                  showFacebook: { type: 'boolean', default: true, description: 'Show Facebook icon on site footer' },
                  showInstagram: { type: 'boolean', default: true, description: 'Show Instagram icon on site footer' },
                  showTwitter: { type: 'boolean', default: true, description: 'Show Twitter/X icon on site footer' },
                  showYoutube: { type: 'boolean', default: true, description: 'Show YouTube icon on site footer' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Updated' } },
      },
    },

    // SITE CONTENT
    '/site-content': {
      get: {
        tags: ['Site Content'],
        summary: 'Get all content sections',
        responses: { 200: { description: 'All sections' } },
      },
    },
    '/site-content/{section}': {
      get: {
        tags: ['Site Content'],
        summary: 'Get a single content section',
        parameters: [{ in: 'path', name: 'section', required: true, schema: { type: 'string', example: 'home_hero' } }],
        responses: { 200: { description: 'Section data' } },
      },
      put: {
        tags: ['Site Content'],
        summary: 'Upsert content section (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'section', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', description: 'Any JSON matching the section shape' } } },
        },
        responses: { 200: { description: 'Saved' } },
      },
    },
    '/site-content/upload/image': {
      post: {
        tags: ['Site Content'],
        summary: 'Upload image for content (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } } },
        },
        responses: { 200: { description: 'Cloudinary URL returned' } },
      },
    },

    // ADMIN
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard stats',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Stats + recent users' } },
      },
    },
    '/admin/assign-trainer': {
      post: {
        tags: ['Admin'],
        summary: 'Assign trainer to member',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'string' },
                  trainerId: { type: 'string' },
                  role: { type: 'string', enum: ['Personal Trainer', 'Class Trainer'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Trainer assigned' } },
      },
    },
    '/admin/assign-workout': {
      post: {
        tags: ['Admin'],
        summary: 'Assign workout to member',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { userId: { type: 'string' }, planId: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Assigned' } },
      },
    },
    '/admin/assign-diet': {
      post: {
        tags: ['Admin'],
        summary: 'Assign diet plan to member',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { userId: { type: 'string' }, planId: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Assigned' } },
      },
    },
    '/admin/branch-transfer': {
      post: {
        tags: ['Admin'],
        summary: 'Transfer member to another branch',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { userId: { type: 'string' }, toBranch: { type: 'string' }, fee: { type: 'number' }, notes: { type: 'string' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Transferred' } },
      },
    },
    '/admin/transfers': {
      get: {
        tags: ['Admin'],
        summary: 'List all branch transfer records',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Transfer records' } },
      },
    },

    // PAYMENTS
    '/payments/my': {
      get: {
        tags: ['Payments'],
        summary: 'Get own payment history',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Payment records' } },
      },
    },
    '/payments': {
      get: {
        tags: ['Payments'],
        summary: 'Get all payments (Admin)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'All payments' } },
      },
    },

    // MASTER DATA
    '/v1/master': {
      get: {
        tags: ['Master Data'],
        summary: 'Get active dropdown options',
        parameters: [{ in: 'query', name: 'type', schema: { type: 'string', enum: ['plan', 'workout', 'diet'] } }],
        responses: { 200: { description: 'Options list' } },
      },
    },
    '/v1/admin/master': {
      get: {
        tags: ['Master Data'],
        summary: 'Get all options including inactive (Admin)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'All options' } },
      },
      post: {
        tags: ['Master Data'],
        summary: 'Create dropdown option (Admin)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'plan' },
                  code: { type: 'string', example: 'MONTHLY' },
                  label: { type: 'object', properties: { en: { type: 'string', example: 'Monthly' } } },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/v1/admin/master/{id}': {
      put: {
        tags: ['Master Data'],
        summary: 'Update option (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Master Data'],
        summary: 'Delete option (Admin)',
        security: [{ BearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
  },
}

module.exports = spec
