const functions = require('firebase-functions');
const admin = require('firebase-admin');
const rp = require('request-promise');

admin.initializeApp(functions.config().firebase);


//const SENDGRID_API_KEY = functions.config().sendgrid.key

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('API_KEY');

exports.sendEmail = functions.database.ref('/participant/{participantID}').onCreate( (event)  => {
    
    const email = event.data.val().email;
    const name = event.data.val().name;
    const msg = {
        to:    email,
        from: 'events@cyberpeace.net',
        subject: 'Thank you for subscribing',
        
        templateId: 'd-0be03444181141f78b2279a547a189f8',
        substitutionWrappers: [ '{{',  '}}'],
        substitutions:{
            name: name
        }
    };
      return sgMail.send(msg);
    
});

exports.checkRecaptcha = functions.https.onRequest((req, res) => {
    const response = req.query.response
    console.log("recaptcha response", response)
    rp({
        uri: 'https://recaptcha.google.com/recaptcha/api/siteverify',
        method: 'POST',
        formData: {
            secret: '6LcXdHYUAAAAAFbwKRIqfM3fz4eIyG3r_uVGONo9',
            response: response
        },
        json: true
    }).then(result => {
        console.log("recaptcha result", result);
        if (result.success) {
            return res.send("You're good to go, human.");
        } else {
            return res.status(400).send("Recaptcha verification failed. Are you a robot?");
        }
    }).catch(reason => {
        console.log("Recaptcha request failure", reason)
        res.status(500).send("Recaptcha request failed.")
    })
})