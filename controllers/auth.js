const AWS = require('aws-sdk');
const Link=require('../models/link')
const User=require('../models/user')
const jwt=require('jsonwebtoken');
const expressJwt=require('express-jwt')
const { registerEmailParams,forgotPasswordEmailParams} = require('../helpers/email');
const shortId=require('shortid')
const _=require('lodash')
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

exports.register = (req, res) => {
    // console.log('REGISTER CONTROLLER', req.body);
    const { name, email, password,categories } = req.body;
    User.findOne({email}).exec((err,user)=>{
     if(user){
        console.log(err);
       return res.status(400).json({
          error:'Email is taken'
       })
     }
    const token=jwt.sign({name,email,password,categories},process.env.JWT_ACCOUNT_ACTIVATION,{
       expiresIn:'10m'
    });
 
    const params=registerEmailParams(email,token);
    const sendEmailOnRegister = ses.sendEmail(params).promise();

    sendEmailOnRegister
        .then(data => {
            console.log('email submitted to SES', data);
            res.json({
               message:`Email has been sent to ${email},Follow the instructions to complete your registration`
            })
        })
        .catch(error => {
            console.log('ses email on register', error);
           res.json({
               message:`We could not able to confirm your email.Please try again`
            })
        });

    }) 
   
};


exports.registerActivate=(req,res)=>{
    const {token}=req.body;
    // console.log(token)
    jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION,function(err,decoded){
        if(err)
        {
            return res.status(401).json({
                error:'Expired Link.Try Again'
            })
        }

        const {name,email,password,categories}=jwt.decode(token);
        const username=shortId.generate();
        User.findOne({email}).exec((err,user)=>{
            if(user)
            {
                return res.status(401).json({
                    error:'Email is Taken'
                })
            }
           const newUser=new User({username,name,email,password,categories}) 
           newUser.save((err,result)=>{
               if(err){
                    return res.status(401).json({
                        error:'Error saving user in database. Try later'
                    })   
               }
               return res.json({
                   message:'Registration Success.Please Login'
               })
           }) 
        })

        

    })

}

exports.login=(req,res)=>{
    const {email,password}=req.body
    User.findOne({email}).exec((err,user)=>{
        if(err || !user)
        {
            return res.status(400).json({
                error:"user with that email does not exist"
            })
        }
        if(!user.authenticate(password))
        {
            return res.status(400).json({
                error:'Email and password do not match'
            })
        }
        const token=jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})  
        const {_id,name,email,role}=user
        return res.json({
            token,user:{_id,name,email,role}
        })
    })

}


// exports.requireSignin=expressJwt({secret:process.env.JWT_SECRET});

exports.requireSignin = expressJwt({ secret: process.env.JWT_SECRET,algorithms: ['HS256'] });

exports.authMiddleware=(req,res,next)=>{
    const authUserId=req.user._id;
    User.findOne({_id:authUserId}).exec((err,user)=>{
        if(err || !user)
        {
            console.log(err);
            return res.status(400).json({
                error:'User Not Found'
            })
        }
        req.profile=user;
        next()
    })
}
exports.adminMiddleware=(req,res,next)=>{
    const adminUserId=req.user._id;
    User.findOne({_id:adminUserId}).exec((err,user)=>{
        if(err || !user)
        {
            console.log(err);
            return res.status(400).json({
                error:'User Not Found'
            })
        }
        if(user.role !=='admin')
        {
            return res.status(400).json({
                error:'Admin Resource Access denied'
            })
        }
        req.profile=user;
        next()
    })
}

exports.forgotPassword=(req,res)=>{
  const {email}=req.body
  User.findOne({email}).exec((err,user)=>{
      if(err || !user)
      {
          return res.status(400).json({
              error:'User with that email does not exist'
          })
      }
      const token=jwt.sign({name:user.name},process.env.JWT_RESET_PASSWORD,{expiresIn:'10m'})
      const params=forgotPasswordEmailParams(email,token)
      console.log(token)
      return user.updateOne({resetPasswordLink:token},(err,success)=>{
          if(err)
          {
              return res.status(400).json({
                  error:"Password reset Failed.Try later"
              })
          }
          const sendEmail=ses.sendEmail(params).promise()
          sendEmail
          .then(data=>{
              console.log('ses reset pw success',data);
              return res.json({
                  message:`Email has been sent to ${email}.Click on link to reset the password`
              })
          })
          .catch(error=>{
            console.log('ses reset pw failed',error)
            return res.json({
                error:'password reset has been failed try later'
            })
          })
      })
  })
}

exports.resetPassword=(req,res)=>{
    const {resetPasswordLink,newPassword}=req.body;
    if(resetPasswordLink)
    {
        jwt.verify(resetPasswordLink,process.env.JWT_RESET_PASSWORD,(err,success)=>{
            if(err)
            {
                return res.status(400).json({
                    error:'Expired Link.Try Again.'
                })
            }
            User.findOne({resetPasswordLink}).exec((err,user)=>{
            if(err||!user)
            {
                return res.status(400).json({
                    error:'Invalid token.Please Try again'
                })
            }
           const updatedFields={
               password:newPassword,
               resetPasswordLink:''
           }
           user=_.extend(user,updatedFields)
           user.save((err,result)=>{
               if(err)
               {
                   return res.status(400).json({
                       error:'Password reset failed'
                   })
               }
               res.json({
                   message:'Great! Now you can login with new password'
               })
           })
        })
        })
     
    }

}

exports.canUpdateDeleteLink=(req,res,next)=>{
    const {id}=req.params;
    Link.findOne({_id:id}).exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:'Could not find link'
            })
        }
        let authorizedUser=data.postedBy._id.toString()===req.user._id.toString()
        if(!authorizedUser){
        return res.status(400).json({
            error:'You are not authorised'
        })
    }
        next();
    })
}