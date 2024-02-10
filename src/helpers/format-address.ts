//get address from formatted_address
export function formatAddress(formatted_address = '') {
  return formatted_address.replace(/,.*/, '');
}
