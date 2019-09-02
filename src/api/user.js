import config from './config.json';
import auth from './auth.json';

const login = function () {
  let url = "/webservice/utility.asmx";
  let headers = new Headers({
    'SOAPAction': 'http://instepsoftware.com/webservices/SetAuthUser',
    ...config.headers
  });
  const body = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <SetAuthUser xmlns="http://instepsoftware.com/webservices">
        <UserId>${auth.user}</UserId>
        <Password>${auth.pass}</Password>
      </SetAuthUser>
    </soap:Body>
  </soap:Envelope>`;
  fetch(url, {
    headers: headers,
    method: 'POST',
    credentials: 'include',
    body: body
  })
    .catch(error => {
      console.error(error);
    });
};

export default {
  login,
}