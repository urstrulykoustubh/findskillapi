exports.registerEmailParams=(email,token)=>{
return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `<html>
                    <h1>Verify your email address</h1>
                    <p>Please use the following link to complete your registration</p>
                    <p>${process.env.CLIENT_URL}/auth/activate/${token}}
                    </html>`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Complete your registration'
            }
        }
    };
}
exports.forgotPasswordEmailParams=(email,token)=>{
return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `<html>
                    <h1>Reset Your Password</h1>
                    <p>Please use the following link to reset your password</p>
                    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}
                    </html>`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Reset Your Password'
            }
        }
    };
}

exports.linkPublishedParams=(email,data)=>{
return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `<html>
                    <h1>New Link Published | findcourse.com</h1>
                    <p>A new link titled <b>${data.title}</b> has been just published in the following categories.</p>
                    
                    ${data.categories.map(c=>{
                        return `
                         <div>
                         <h2>${c.name}</h2>
                         <img src="${c.image.url}" alt="${c.name}" style="height:50px;"/>
                         <h3><a href="${process.env.CLIENT_URL}/links/${c.slug}">Check it Out</a></h3>
                         </div>
                        `
                    }).join('-------------')}
                    <br/>
                    <p>Do not want to recieve notifications?</p>
                    <p>Turn off notification by going to your <b>dashboard</b> <b>update profile</b> and <b>uncheck the categories</b></p>
                    <p>${process.env.CLIENT_URL}/user/profile/update
                    </html>`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Your Favorite Category Link Has been Published By Another User'
            }
        }
    };
}