const config = require('../config');

function authorize(req, res) {
  const key = req.body.authorizationKey;
  if (key === config.authorizationKey) {
    res.send({ status: 'success', message: 'Authorizing successful' });
  } else {
    res.send({ status: 'failure', message: 'Authorizing failed' });
  }
}

function isAuthorized(req, res) {

}