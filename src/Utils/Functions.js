export function validateEmail(email) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
}

export function calcCrow(lat1, lon1, lat2, lon2) {
  const radlat1 = Math.PI * lat1/180;
  const radlat2 = Math.PI * lat2/180;
  const theta = lon1-lon2;
  const radtheta = Math.PI * theta/180;
  const dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  const discCalOne = Math.acos(dist);
  const distCalTwo = discCalOne * 180/Math.PI;
  const finalDist = distCalTwo * 60 * 1.1515;
  return finalDist * 1.609344;
}