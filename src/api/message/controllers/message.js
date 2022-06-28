'use strict';

/**
 *  message controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::message.message',({strapi}) => ({
    async create(ctx) {
        // some logic here
        // check if has credit
        // check message length
        // check api balance
        ctx.request.body.data.status = 'pending';
        const response = await super.create(ctx);
        // some more logic
        try{
            //send the sms to gateway
            const MSEGAT_USERNAME = process.env.MSEGAT_USERNAME;
            const MSEGAT_SENDER = process.env.MSEGAT_SENDER;
            const MSEGAT_API_KEY = process.env.MSEGAT_API_KEY;
            const MSEGAT_BALANCE_URL = 'https://www.msegat.com/gw/Credits.php';
            const MSEGAT_SEND_URL = 'https://www.msegat.com/gw/sendsms.php';
            const MESSAGE = response.data.attributes;
            console.log(MESSAGE);

            if(MSEGAT_API_KEY){
                const axios = require('axios');
                let { data } = await axios.post(MSEGAT_SEND_URL,{
                    userName: MSEGAT_USERNAME,
                    numbers: MESSAGE.to,
                    userSender:MSEGAT_SENDER,
                    apiKey:MSEGAT_API_KEY,
                    msg:MESSAGE.content
                  });

                // if success, update status, if not, put keep pending and add comment, and reduce the credit by 1

                response.meta.api_error = MSEGAT_API_KEY
                response.meta.gateway_response = data
                
            }
            else{
                response.meta.api_error = "Could not locate API Key"
            }


        }catch(error){
            console.error(error);
        }
      
        return response;
      }
}));
