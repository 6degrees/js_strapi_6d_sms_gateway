"use strict";
const config = require("./server/config");
module.exports = (plugin) => {
    plugin.config.jwt = config.jwt
    return plugin
    
};