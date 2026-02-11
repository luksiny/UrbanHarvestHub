const { Op } = require('sequelize');

function toApi(row) {
  if (row == null) return row;
  const plain = row.get ? row.get({ plain: true }) : row;
  if (Array.isArray(plain)) return plain.map(toApi);
  if (plain.id !== undefined) plain._id = plain.id;
  return plain;
}

function buildSearchWhere(search, fields) {
  if (!search || !fields.length) return {};
  return {
    [Op.or]: fields.map(f => ({ [f]: { [Op.like]: `%${search}%` } })),
  };
}

function workshopBody(body) {
  const b = { ...body };
  if (b.coordinates) {
    b.coordLat = b.coordinates.lat;
    b.coordLng = b.coordinates.lng;
    delete b.coordinates;
  }
  delete b.id;
  delete b._id;
  delete b.createdAt;
  delete b.updatedAt;
  return b;
}

function eventBody(body) {
  const b = { ...body };
  if (b.coordinates) {
    b.coordLat = b.coordinates.lat;
    b.coordLng = b.coordinates.lng;
    delete b.coordinates;
  }
  delete b.id;
  delete b._id;
  delete b.createdAt;
  delete b.updatedAt;
  return b;
}

module.exports = { toApi, buildSearchWhere, workshopBody, eventBody };
module.exports.Op = Op;
