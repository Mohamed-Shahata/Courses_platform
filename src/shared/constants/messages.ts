export const AUTH_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'This email already exists in the system',
  VERIFICATION_EMAIL_SENT:
    'Verification email sent successfully. Please check your inbox.',

  INVALID_TOKEN_FORMAT: 'Invalid token format',
  AUTHORIZATION_HEADER_MISSING: 'Authorization header missing',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',

  CHANGE_PASSWORD_SUCCESSFULL: 'Change password successfull',
  WE_HAVE_SENT_A_PASSWORD_CHANGE_LINK_TO_YOUR_EMAIL:
    'We have sent a password change link to your email; please check it.',

  INVALID_TOKEN: 'Invalid token',
  EMAIL_VERIFIED: 'Email verified successfully',

  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'This email is not verified. Check your inbox',

  EMAIL_OR_PASSWORD_IS_WRONG: 'Email or password is wrong',
  CURRENT_PASSWORD_INCORRECT: 'Current password incorrect',
  NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCHING:
    'New password and confirm password is not matching',

  LOGIN_SUCCESS: 'Login successful',

  ACCOUNT_NOT_FOUND: 'No account found with this email',

  ACCESS_DENIED: 'Access denied',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  NO_TOKEN_PROVIDER: 'no token provider',
  NO_REFRESH_TOKEN: 'No refresh token',

  ACCOUNT_VERIFIED: 'This email is already verified. You can log in now.',
  TOKEN_EXPORED: 'Token expired',

  USER_LOGOUT: 'Logout successful',
  NO_ROLE_DEFINED: 'Access denied: no roles defined',
  NO_PERMISSION:
    'Access denied: you do not have permission to access this resource',
  ACCOUNT_DELETE: 'Account deleted, check your email to restore',
  ACCOUNT_NOT_DELETED: 'Account not deleted',
  ACCOUNT_RESTORE: 'Account restore successful , can login now! ',

  CANNOT_USE_OLD_PASSWORD: 'You cannot use your old password',

  RESET_LINK: 'If this email exists, we sent a reset link',

  CREATE_ACCOUNT_SECCUSSFUL_BUT_NEED_ROLE:
    ' account create successful, choose ypur role',
};

export const USER_MESSAGES = {
  NOT_FOUND_ACCOUNT: 'No Account found',
  NOT_FOUND_STUDENT: 'No Found Student',
  NOT_FOUND_INST: 'No Found Instructor',
  DELETE_SUCCESSFUL: 'Delete User Successful',
  UPDATE_PROFILEIMAGE_SUCCESSFUL: 'Profile image updated successfully',
  DELETE_PROFILEIMAGE_SUCCESSFUL: 'Profile image deleted successfully',
  BAN_SUCCESSFUL: 'User has been banned successfully.',
  UNBAN_SUCCESSFUL: 'User has been unbanned successfully.',
  ALREADY_BANNED: 'This user is already banned.',
  NOT_BANNED: 'This user is not currently banned.',
  YOU_HAVE_NOT_PROFILE_IMAGE: 'You have not profile image',
  CANNOT_BAN_ADMIN: 'Admin accounts cannot be banned.',
};

export const COURSE_MESSAGE = {
  IMAGE_COURSE_EMPTY: 'Image course is empty',
  DELETE_SUCCESSFUL: 'Course delete successful ',
  NOT_FOUND_COURSE: 'Not Found Course',
};

export const SECTION_MESSAGE = {
  NOT_FOUND_SECTION: ' Not found section',
  DELETE_SECTION: 'Delete Section successful',
};

export const ENROLLMENT_MESSAGE = {
  ENROLL_ALREADY: 'Already enrolled',
  ENROLLMENT_NOT_FOUND: 'Enrollment not found',
  ENROLLMENT_CANCELED_SUCCESS: 'Enrollment canceled successfully',
};

export const CATEGORY_MESSAGE = {
  CATEGORY_ALREADY_IN_DB: 'Category already in DB',
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_DELETE_SUCCESSFUL: 'Category delete successful',
};

export const REVIEW_MESSAGE = {
  REVIEWED_ALREADY: 'You are reviewed already',
  NO_REVIEWS: 'There is no reviews',
  DELETE_SUCCESSFUL: 'Delete Review Successful',
};

export const LESSON_MESSAGE = {
  NO_LESSON: 'There is no lesson',
  DELETE_SUCCESSFUL: 'Delete Lesson Successful',
};

export const QUIZ_MESSAGE = {
  NO_QUIZ_FOR_LESSON: 'there is no quiz for this lesson',
  NO_QUIZ: ' there is no quiz',
  DELETE_QUIZ: 'Delete Quiz Successful',
};

export const QUESTION_MESSAGE = {
  NO_QUESTION_FOR_QUIZ: 'there is no question for this quiz',
  NO_QUESTION: 'there is no question',
};

export const NOTIFICATION_MESSAGES = {
  NOT_FOUND: 'Notification not found.',
  FORBIDDEN: 'You do not have permission to access this notification.',
  DELETED: 'Notification deleted successfully.',
  ALL_MARKED_READ: 'All notifications have been marked as read.',
};
