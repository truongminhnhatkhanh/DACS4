const config = require('./env');

function getIceServers() {
  return config.iceServers;
}

module.exports = { getIceServers };
