const {check}=require('express-validator')

exports.userRegisterValidator=[
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
    check('email')
    .isEmail()
    .withMessage('Must be a valid Email'),
    check('password')
      .isLength({min:6})
      .withMessage('Password must be at least 6 characters long'),
    check('categories')
      .isLength({min:6})
      .withMessage('Pick atleast one category')  
];

exports.userLoginValidator=[
    check('email')
    .isEmail()
    .withMessage('Must be a valid Email'),
    check('password')
      .isLength({min:6})
      .withMessage('Password must be at least 6 characters long')
];


exports.forgotPasswordValidator=[
    check('email')
    .isEmail()
    .withMessage('Must be a valid Email'),
    
];

exports.resetPasswordValidator=[
    check('newPassword')
      .isLength({min:6})
      .withMessage('Password must be at least 6 characters long'),
    check('resetPasswordLink')
      .not()
      .isEmpty()
      .withMessage('Token is required')
];

exports.userUpdateValidator=[
    check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
     
];