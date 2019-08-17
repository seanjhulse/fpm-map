import helpers from '../api/helpers';
import config from './config.json';
const parser = new DOMParser();

/**
 * Gets the sub services for a service (Chilled Water has sub services of flow, supply temp, etc)
 * @param {String} service
 * @param {Function} callback
 */
const get_all_attributes = function (service, callback) {
  let url = "/webservice/CHaD.asmx";
  let headers = new Headers({
    'SOAPAction': 'http://instepsoftware.com/webservices/GetCHaDClassAttributesByName',
    ...config.headers
  });
  let body =
    `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDClassAttributesByName xmlns="http://instepsoftware.com/webservices">
            <ClassName>${service}</ClassName>
          </GetCHaDClassAttributesByName>
        </soap:Body>
      </soap:Envelope>`;
  fetch(url, {
    headers: headers,
    method: 'POST',
    credentials: 'include',
    body: body
  })
    .then(response => response.text())
    .then(str => parser.parseFromString(str, 'text/xml'))
    .then(xml => xml.querySelectorAll('CHaDAttribute'))
    .then(xml => helpers.convertToJSON(xml))
    .then(json => callback(json))
    .catch(error => {
      console.error(error);
      callback(undefined);
    });
};

/**
 * Gets the sub services for each service (Chilled Water has sub services of flow, supply temp, etc)
 * @param {Object} service
 * @param {Function} callback
 */
const get_service_by_building = function (service, callback) {
  let url = "/webservice/CHaD.asmx";
  let headers = new Headers({
    'SOAPAction': 'http://instepsoftware.com/webservices/GetCHaDAttributeValueDataSet',
    ...config.headers
  });
  let body =
    `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDAttributeValueDataSet xmlns="http://instepsoftware.com/webservices">
            <InstanceSearch>${service.path}*</InstanceSearch>
            <ClassName>${service.name}</ClassName>
            <AttributeName>*</AttributeName>
            <FullValue>true</FullValue>
          </GetCHaDAttributeValueDataSet>
        </soap:Body>
      </soap:Envelope>`;
  fetch(url, {
    headers: headers,
    method: 'POST',
    credentials: 'include',
    body: body
  })
    .then(response => response.text())
    .then(str => parser.parseFromString(str, 'text/xml'))
    .then(xml => xml.querySelectorAll('CHaDInstanceAttributeValue'))
    .then(xml => helpers.convertToJSON(xml))
    .then(json => callback(json))
    .catch(error => {
      console.error(error);
      callback(undefined);
    });
};

/**
 * Gets all instances of services flow, supply temp, etc
 * @param {String} service_name
 * @param {Function} callback
 */
const get_all_services = function (service_name, callback) {
  let url = "/webservice/CHaD.asmx";
  let headers = new Headers({
    'SOAPAction': 'http://instepsoftware.com/webservices/GetCHaDAttributeValueDataSet',
    ...config.headers
  });
  let body =
    `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDAttributeValueDataSet xmlns="http://instepsoftware.com/webservices">
            <InstanceSearch>!Campus Distribution!*</InstanceSearch>
            <ClassName>*</ClassName>
            <AttributeName>${service_name}</AttributeName>
            <FullValue>true</FullValue>
          </GetCHaDAttributeValueDataSet>
        </soap:Body>
      </soap:Envelope>`;
  fetch(url, {
    headers: headers,
    method: 'POST',
    credentials: 'include',
    body: body
  })
    .then(response => response.text())
    .then(str => parser.parseFromString(str, 'text/xml'))
    .then(xml => xml.querySelectorAll('CHaDInstanceAttributeValue'))
    .then(xml => helpers.convertToJSON(xml))
    .then(json => callback(json))
    .catch(error => {
      console.error(error);
      callback(undefined);
    });
};


export default {
  get_service_by_building,
  get_all_services,
  get_all_attributes,
}