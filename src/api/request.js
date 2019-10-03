import helpers from './helpers';
const parser = new DOMParser();

export default function request(url, body, headers, selector, resolve, reject) {
  fetch(url, {
    headers: headers,
    method: 'POST',
    credentials: 'include',
    body: body
  })
    .then(response => response.text())
    .then(str => parser.parseFromString(str, 'text/xml'))
    .then(xml => xml.querySelectorAll(selector))
    .then(xml => helpers.convertToJSON(xml))
    .then(json => resolve(json))
    .catch(error => {
      resolve({});
    });
}