const geolib = require('geolib');

function isWithinRange(userCoords, eventCoords, maxDistance = 100) {
  return geolib.getDistance(userCoords, eventCoords) <= maxDistance;
}

module.exports = { isWithinRange };
