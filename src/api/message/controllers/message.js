'use strict';

/**
 *  message controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::message.message',({strapi}) => ({
    async create(ctx) {
        // some logic here
        ctx.request.body.data.status = 'pending';
        console.log(ctx.request.body.data);
        const response = await super.create(ctx);
        // some more logic
        try{
            //send the sms to gateway

        }catch(error){
            console.error(error);
        }
      
        return response;
      }
}));
