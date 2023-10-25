"use strict";

/**
 *  message controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::message.message", ({ strapi }) => ({
  async create(ctx) {
    // Check Message Language and credits required
    const MESSAGE = ctx.request.body.data; // we didn't check if it exists or not
    let required_credit = 1;

    const english = /^[~`!@ #$%^&*()_+=[\]\\{}|;':",.\/<>?a-zA-Z0-9-]+$/;
    const isEnglish = english.test(MESSAGE.content);

    if (isEnglish) {
      required_credit =
        MESSAGE.content.length > 160
          ? Math.ceil(MESSAGE.content.length / 153)
          : 1;
    } else {
      required_credit =
        MESSAGE.content.length > 70
          ? Math.ceil(MESSAGE.content.length / 63)
          : 1;
    }
    let phoneNumber = MESSAGE.to.trim();
    let saudiNumber = true;
    if (!phoneNumber.startsWith("+966")) {
      saudiNumber = false;
    }
    const axios = require("axios");
    var options;
    if (saudiNumber) {
      console.log("sending from first value");
      options = {
        method: "POST",
        url: `${process.env.FIRST_VALUE_BASE_URL}/unified/v2/send`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FIRST_VALUE_TOKEN}`,
        },
        data: {
          apiver: "1.0",
          sms: {
            ver: "2.0",
            dlr: { url: "" },
            messages: [
              {
                udh: "0",
                text: MESSAGE.content,
                property: 0,
                id: "1",
                addresses: [
                  {
                    from: MESSAGE.sender ?? process.env.FIRST_VALUE_SENDER_NAME,
                    to: MESSAGE.to,
                    seq: "1",
                    tag: "",
                  },
                ],
              },
            ],
          },
        },
      };
    } else {
      console.log("sending from taqnyat");
      // asuming that phone number is +{country code}{phone number}
      const recipient = phoneNumber.replace("+", "");
      options = {
        method: "POST",
        url: `${process.env.TAQANYAT_BASE_URL}/v1/messages`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAQANYAT_TOKEN}`,
        },
        data: {
          recipients: [recipient],
          body: MESSAGE.content,
          sender: MESSAGE.sender ?? `${process.env.TAQANYAT_SENDER_NAME}`,
        },
      };
    }

    // Add to DB as pending
    ctx.request.body.data.status = "pending";
    let sms_response = await super.create(ctx);
    console.log("sending reuest");
    axios
      .request(options)
      .then(async function (response) {
        // if reached here then it is a success, update status, if not, put keep pending and add comment, and reduce the credit by 1
        ctx.request.body.data.status = "sent";
        console.log(response);
        sms_response = await strapi.entityService.update(
          "api::message.message",
          sms_response.data.id,
          { data: ctx.request.body.data }
        );
        const new_user_credits = ctx.state.user.credit - required_credit;
        //reduce user credit
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          ctx.state.user.id,
          { data: { credit: new_user_credits } }
        );

        sms_response.meta = {};
        sms_response.meta.gateway_response = data;

        sms_response.meta.additional_data = {
          "old user credits": ctx.state.user.credit,
          "new user credits": new_user_credits,
          "provider credits": 1, // if have make it constant becuase there's no endpoint to get the credits
          "message required credits": required_credit,
          isEnglish: isEnglish,
          "MESSAGE.length": MESSAGE.content.length,
        };
      })
      .catch(function (error) {
        return ctx.badRequest("Provider Did Not Accept the Message", error);
      });

    // if response var is empty
    if (!sms_response) {
      return ctx.badRequest("An Error occured", error);
    }

    return sms_response;
  },
}));
