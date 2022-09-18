//get address from formatted_address
export function formatAddress(formatted_address = '') {
  const address = formatted_address.split(', ');
  return address.length > 3 ? address[0] : null;
}
