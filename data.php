<?php

$meetings = json_decode(file_get_contents('data.json'));

$days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function format_address($address) {
	$address = explode(', ', $address);
	return array_shift($address);
}

function format_day($day) {
	global $days;
	if (array_key_exists($day, $days)) return $days[$day];
	return 'Appointment';
}

function format_location($location) {
	return $location;
}

function format_name($name) {
	return $name;
}

function format_region($region) {
	return $region;
}

function format_time($time) {
	return '9:00am';
}

