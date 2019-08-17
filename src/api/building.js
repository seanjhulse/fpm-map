import helpers from './helpers';
import config from './config.json';
const parser = new DOMParser();

/**
 * GetCHaDInstancesByParent (get_chad_instance provides the CHaD parentId)
 */

/**
 * Gets CHaDInstance ID
 * @param {Integer} building_id the FPM building number
 * @param {Function} callback responds with the CHaDInstance or null
 */
const get_chad_instance = function (building_id, callback) {
  let url = "/webservice/CHaD.asmx";
  let headers = new Headers({
    'SOAPAction': 'http://instepsoftware.com/webservices/GetCHaDInstancesByAttributeValue',
    ...config.headers
  });
  let body =
    `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDInstancesByAttributeValue xmlns="http://instepsoftware.com/webservices">
            <ClassName>*</ClassName>
            <AttributeName>Building Number</AttributeName>
            <AttributeValue>${building_id}</AttributeValue>
          </GetCHaDInstancesByAttributeValue>
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
    .then(xml => xml.querySelectorAll('CHaDInstance'))
    .then(xml => helpers.convertToJSON(xml))
    .then(json => callback(json))
    .catch(error => {
      console.error(error);
      callback(undefined);
    });
};

const get_chad_instance_data_points = function (instance_id, callback) {
  let url = "/webservice/CHaD.asmx";
  let headers = new Headers({
    'SOAPAction': 'http://instepsoftware.com/webservices/GetCHaDInstanceDataPoints',
    ...config.headers
  });
  let body = 
  `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetCHaDInstanceDataPoints xmlns="http://instepsoftware.com/webservices">
          <InstanceID>${instance_id}</InstanceID>
        </GetCHaDInstanceDataPoints>
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
    .then(xml => xml.querySelectorAll('CHaDInstance'))
    .then(xml => helpers.convertToJSON(xml))
    .then(json => callback(json))
    .catch(error => {
      console.error(error);
      callback(undefined);
    });
}

const get_chad_instance_by_parent_name = function (parent_name, callback) {
  let url = "/webservice/CHaD.asmx";
  let headers = new Headers({
    'SOAPAction': 'http://instepsoftware.com/webservices/GetCHaDInstanceByParentName',
    ...config.headers
  });
  let body =
    `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDInstanceByParentName xmlns="http://instepsoftware.com/webservices">
            <ParentName>${parent_name}</ParentName>
          </GetCHaDInstanceByParentName>
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
    .then(xml => xml.querySelectorAll('CHaDInstance'))
    .then(xml => helpers.convertToJSON(xml))
    .then(json => callback(json))
    .catch(error => {
      console.error(error);
      callback(undefined);
    });
}

const get_chad_attribute_value_data_set = function (path, callback) {
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
            <InstanceSearch>${path}</InstanceSearch>
            <ClassName>*</ClassName>
            <AttributeName>*</AttributeName>
            <FullValue>1</FullValue>
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
}

const get_building_services = function (building_id, callback) {
  get_chad_instance(building_id, (CHaDInstances) => {
    if (!CHaDInstances.length) {
      console.error('No services found for this building.');
      return;
    }    
    get_chad_instance_by_parent_name(CHaDInstances[0].path, (services) => {
      callback(services);
    });
  });
}

export default {
  get_chad_instance,
  get_chad_instance_data_points,
  get_chad_instance_by_parent_name,
  get_chad_attribute_value_data_set,
  get_building_services
};