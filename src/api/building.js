import request from './request';
import config from './config.json';

/**
 * Gets CHaDInstance ID
 * @param {Integer} building_id the FPM building number
 * @param {Function} callback responds with the CHaDInstance or null
 */
const get_chad_instance_by_attribute_value = function (building_id) {
  return new Promise((resolve, reject) => {
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
    request(url, body, headers, 'CHaDInstance', resolve, reject);
  });
};

const get_chad_instance_data_points = function (instance_id) {
  return new Promise((resolve, reject) => {
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
    request(url, body, headers, 'CHaDInstance', resolve, reject);
  });
}

const get_chad_instance_by_parent_name = function (parent_name) {
  return new Promise((resolve, reject) => {
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
    request(url, body, headers, 'CHaDInstance', resolve, reject);
  });
}

const get_chad_attribute_value_data_set = function (path) {
  return new Promise((resolve, reject) => {
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
    request(url, body, headers, 'CHaDInstanceAttributeValue', resolve, reject);
  });
}

const get_building_number = function (building_path) {
  return new Promise((resolve, reject) => {
    let url = "/webservice/CHaD.asmx";
    let headers = new Headers({
      'SOAPAction': 'http://instepsoftware.com/webservices/GetCHaDAttributeValue',
      ...config.headers
    });
    let body =
      `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetCHaDAttributeValue xmlns="http://instepsoftware.com/webservices">
              <AttributeName>${building_path}</AttributeName>
              <FullValue>true</FullValue>
            </GetCHaDAttributeValue>
          </soap:Body>
        </soap:Envelope>`;
    request(url, body, headers, 'CHaDInstance', resolve, reject);
  });
}

const get_building_services = function (building_id) {
  return new Promise((resolve, reject) => {
    get_chad_instance_by_attribute_value(building_id)
      .then(CHaDInstances => {
        if (!CHaDInstances.length) {
          reject({ error: 'No services found for this building. ' + building_id });
        }
        get_chad_instance_by_parent_name(CHaDInstances[0].path)
          .then(services => {
            resolve(services);
          });
      });
  });
}

export default {
  get_chad_instance_by_attribute_value,
  get_building_number,
  get_chad_instance_data_points,
  get_chad_instance_by_parent_name,
  get_chad_attribute_value_data_set,
  get_building_services
};