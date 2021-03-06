import request from './request';
import config from './config.json';

/**
 * Gets the sub services for a service (Chilled Water has sub services of flow, supply temp, etc)
 * @param {String} service
 * @param {Function} callback
 */
const get_all_attributes = (service) => {
  return new Promise((resolve, reject) => {
    const url = '/webservice/CHaD.asmx';
    const headers = new Headers({
      SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDClassAttributesByName',
      ...config.headers,
    });
    const body =      `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetCHaDClassAttributesByName xmlns="http://instepsoftware.com/webservices">
              <ClassName>${service}</ClassName>
            </GetCHaDClassAttributesByName>
          </soap:Body>
        </soap:Envelope>`;
    request(url, body, headers, 'CHaDAttribute', resolve, reject);
  });
};

/**
 * Gets the sub services for each service (Chilled Water has sub services of flow, supply temp, etc)
 * @param {Object} service
 * @param {Function} callback
 */
const get_service_by_building = function (service) {
  return new Promise((resolve, reject) => {
    const url = '/webservice/CHaD.asmx';
    const headers = new Headers({
      SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDAttributeValueDataSet',
      ...config.headers,
    });
    const body = `<?xml version="1.0" encoding="utf-8"?>
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
    request(url, body, headers, 'CHaDInstanceAttributeValue', resolve, reject);
  });
};

/**
 * Gets all instances of services flow, supply temp, etc
 * @param {String} service_name
 * @param {Function} callback
 */
const get_all_services = (service_name) => {
  return new Promise((resolve, reject) => {
    const url = '/webservice/CHaD.asmx';
    const headers = new Headers({
      SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDAttributeValueDataSet',
      ...config.headers,
    });
    const body = `<?xml version="1.0" encoding="utf-8"?>
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
    request(url, body, headers, 'CHaDInstanceAttributeValue', resolve, reject);
  });
};

/**
 * Gets history of a single point
 * @param {String} pointId
 * @param {String} startTime
 * @param {String} endTime
 */
const get_history = (pointId, startTime, endTime) => {
  return new Promise((resolve, reject) => {
    const url = '/webservice/History.asmx';
    const headers = new Headers({
      SOAPAction: 'http://instepsoftware.com/webservices/GetHistory',
      ...config.headers,
    });
    const body = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetHistory xmlns="http://instepsoftware.com/webservices">
            <PointID>${pointId}</PointID>
            <HistoryType>RAW</HistoryType>
            <StartDate>${startTime}</StartDate>
            <EndDate>${endTime}</EndDate>
            <Period></Period>
          </GetHistory>
        </soap:Body>
      </soap:Envelope>`;
    request(url, body, headers, 'DNADataPoint', resolve, reject);
  });
};

export default {
  get_service_by_building,
  get_all_services,
  get_all_attributes,
  get_history,
};
