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

  ACCOUNT_NOT_FOUND: 'No account found with this email',
  EMAIL_NOT_VERIFIED: 'This email is not verified. Check your inbox',

  INCORRECT_PASSWORD: 'Incorrect password',
  EMAIL_OR_PASSWORD_IS_WRONG: 'Email or password is wrong',
  CURRENT_PASSWORD_INCORRECT: 'Current password incorrect',
  NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCHING:
    'New password and confirm password is not matching',

  LOGIN_SUCCESS: 'Login successful',

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
};

export const USER_MESSAGES = {
  NOT_FOUND_ACCOUNT: 'No Account found',
};

export const COURSE_MESSAGE = {
  DELETE_SUCCESSFUL: 'Course delete successful ',
  NOT_FOUND_COURSE: 'Not Found Course',
};

export const ENROLLMENT_MESSAGE = {
  ENROLL_ALREADY: 'Already enrolled',
  ENROLLMENT_NOT_FOUND: "Enrollment not found",
  ENROLLMENT_CANCELED_SUCCESS:'Enrollment canceled successfully'
};
