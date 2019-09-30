import savedBuildings from '../../data/real/buildings.json';
import savedGeojson from '../../data/real/geojson.json';
import request from './request';
import config from './config.json';

const load_buildings = () => new Promise((resolve, reject) => {
  fetch('https://map.wisc.edu/api/v1/map_objects.json', {
    method: 'GET',
    headers: {
      credentials: 'include',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      const buildings = {};
      json.forEach((building) => {
        buildings[building.id] = building;
      });
      return buildings;
    })
    .then((buildings) => resolve(buildings))
    .catch((error) => {
      // if we fail to get the data, grab it from a local instance
      try {
        resolve(savedBuildings);
      } catch (err) {
        reject(error);
      }
    });
});

const get_buildings_geojson = () => new Promise((resolve, reject) => {
  fetch('https://map.wisc.edu/api/v1/map_objects.geojson', {
    method: 'GET',
    headers: {
      credentials: 'include',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      const geojson = {
        type: 'FeatureCollection',
        features: [],
      };
      json.forEach((building) => {
        const feature = {
          type: 'Feature',
          properties: {
            name: building.meta.name,
            cname: building.meta.cname,
            sname: building.meta.sname,
            lname: building.meta.lname,
            id: building.id,
            picture: building.thumbnail,
            street_address: building.street_address,
          },
          geometry: {
            type: building.geojson.type,
            coordinates: building.geojson.coordinates,
          },
        };
        geojson.features.push(feature);
      });
      return geojson;
    })
    .then((geojson) => resolve(geojson))
    .catch((error) => {
      // if we fail to get the data, grab it from a local instance
      try {
        resolve(savedGeojson);
      } catch (err) {
        reject(error);
      }
    });
});

const get_chad_instances = (instance_id) => new Promise((resolve, reject) => {
  const url = '/webservice/CHaD.asmx';
  const headers = new Headers({
    SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDInstance',
    ...config.headers,
  });
  const body = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDInstance xmlns="http://instepsoftware.com/webservices">
            <InstanceID>${instance_id}</InstanceID>
          </GetCHaDInstance>
        </soap:Body>
      </soap:Envelope>`;
  request(url, body, headers, 'GetCHaDInstanceResult', resolve, reject);
});

/**
 * Gets CHaDInstance ID
 * @param {Integer} building_id the FPM building number
 * @param {Function} callback responds with the CHaDInstance or null
 */
const get_chad_instance_by_attribute_value = (building_id) => new Promise((resolve, reject) => {
  const url = '/webservice/CHaD.asmx';
  const headers = new Headers({
    SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDInstancesByAttributeValue',
    ...config.headers,
  });
  const body = `<?xml version="1.0" encoding="utf-8"?>
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

const get_chad_instance_data_points = (instance_id) => new Promise((resolve, reject) => {
  const url = '/webservice/CHaD.asmx';
  const headers = new Headers({
    SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDInstanceDataPoints',
    ...config.headers,
  });
  const body = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetCHaDInstanceDataPoints xmlns="http://instepsoftware.com/webservices">
          <InstanceID>${instance_id}</InstanceID>
        </GetCHaDInstanceDataPoints>
      </soap:Body>
    </soap:Envelope>`;
  request(url, body, headers, 'CHaDInstance', resolve, reject);
});

const get_chad_instance_by_parent_name = (parent_name) => new Promise((resolve, reject) => {
  const url = '/webservice/CHaD.asmx';
  const headers = new Headers({
    SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDInstanceByParentName',
    ...config.headers,
  });
  const body = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDInstanceByParentName xmlns="http://instepsoftware.com/webservices">
            <ParentName>${parent_name}</ParentName>
          </GetCHaDInstanceByParentName>
        </soap:Body>
      </soap:Envelope>`;
  request(url, body, headers, 'CHaDInstance', resolve, reject);
});

const get_chad_attribute_value_data_set = (path) => new Promise((resolve, reject) => {
  const url = '/webservice/CHaD.asmx';
  const headers = new Headers({
    SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDAttributeValueDataSet',
    ...config.headers,
  });
  const body = `<?xml version="1.0" encoding="utf-8"?>
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

const get_building_number = (building_path) => new Promise((resolve, reject) => {
  const url = '/webservice/CHaD.asmx';
  const headers = new Headers({
    SOAPAction: 'http://instepsoftware.com/webservices/GetCHaDAttributeValue',
    ...config.headers,
  });
  const body = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetCHaDAttributeValue xmlns="http://instepsoftware.com/webservices">
            <AttributeName>${building_path}.Building Number</AttributeName>
            <FullValue>true</FullValue>
          </GetCHaDAttributeValue>
        </soap:Body>
      </soap:Envelope>`;
  request(url, body, headers, 'CHaDAttributeValue', resolve, reject);
});

const get_building_services = (building_id) => new Promise((resolve, reject) => {
  get_chad_instance_by_attribute_value(building_id)
    .then((CHaDInstances) => {
      if (!CHaDInstances.length) {
        throw new Error(`No services found for this building. ${building_id}`);
      }
      get_chad_instance_by_parent_name(CHaDInstances[0].path)
        .then((services) => {
          resolve(services);
        });
    })
    .catch((error) => reject(error));
});

export default {
  get_chad_instances,
  get_chad_instance_by_attribute_value,
  get_chad_instance_data_points,
  get_chad_instance_by_parent_name,
  get_chad_attribute_value_data_set,
  get_building_number,
  get_building_services,
  get_buildings_geojson,
  load_buildings,
};
