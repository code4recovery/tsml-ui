<?php 
include('data.php');
?>
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css" integrity="sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B" crossorigin="anonymous">
		<title>Meetings</title>
	</head>
	<body>
		<div class="container">
			<h1 class="mt-4">Meetings</h1>
			<div class="row mt-3">
				<div class="col-sm-6 col-lg-2 mb-3">
					<div class="input-group">
						<input type="search" class="form-control" placeholder="Search" aria-label="Search">
						<div class="input-group-append">
							<button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
							<div class="dropdown-menu dropdown-menu-right">
								<a class="dropdown-item active bg-secondary" href="#">Search</a>
								<a class="dropdown-item" href="#">Near Me</a>
								<a class="dropdown-item" href="#">Near Location</a>
							</div>
						</div>
					</div>
				</div>
				<div class="col-sm-6 col-lg-2 mb-3">
					<div class="dropdown">
						<button class="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Everywhere
						</button>
						<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a class="dropdown-item active bg-secondary" href="#">Everywhere</a>
							<div class="dropdown-divider"></div>
							<a class="dropdown-item" href="#">Campbell</a>
							<a class="dropdown-item" href="#">Cupertino</a>
							<a class="dropdown-item" href="#">Mountain View</a>
							<a class="dropdown-item" href="#">Palo Alto</a>
							<a class="dropdown-item" href="#">Saratoga</a>
						</div>
					</div>
				</div>
				<div class="col-sm-6 col-lg-2 mb-3">
					<div class="dropdown">
						<button class="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Any Day
						</button>
						<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a class="dropdown-item active bg-secondary" href="#">Any Day</a>
							<div class="dropdown-divider"></div>
							<a class="dropdown-item" href="#">Sunday</a>
							<a class="dropdown-item" href="#">Monday</a>
							<a class="dropdown-item" href="#">Tuesday</a>
							<a class="dropdown-item" href="#">Wednesday</a>
							<a class="dropdown-item" href="#">Thursday</a>
							<a class="dropdown-item" href="#">Friday</a>
							<a class="dropdown-item" href="#">Saturday</a>
						</div>
					</div>
				</div>
				<div class="col-sm-6 col-lg-2 mb-3">
					<div class="dropdown">
						<button class="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Any Time
						</button>
						<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a class="dropdown-item active bg-secondary" href="#">Any Time</a>
							<div class="dropdown-divider"></div>
							<a class="dropdown-item" href="#">Morning</a>
							<a class="dropdown-item" href="#">Midday</a>
							<a class="dropdown-item" href="#">Evening</a>
							<a class="dropdown-item" href="#">Night</a>
						</div>
					</div>
				</div>
				<div class="col-sm-6 col-lg-2 mb-3">
					<div class="dropdown">
						<button class="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Any Type
						</button>
						<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a class="dropdown-item active bg-secondary" href="#">Any Type</a>
							<div class="dropdown-divider"></div>
							<a class="dropdown-item" href="#">Big Book</a>
							<a class="dropdown-item" href="#">Closed</a>
							<a class="dropdown-item" href="#">LGBTQ</a>
							<a class="dropdown-item" href="#">Men</a>
							<a class="dropdown-item" href="#">Open</a>
							<a class="dropdown-item" href="#">Women</a>
						</div>
					</div>
				</div>
				<div class="col-sm-6 col-lg-2 mb-3">
					<div class="btn-group w-100" role="group" aria-label="Basic example">
						<button type="button" class="btn btn-outline-secondary w-100 active">List</button>
						<button type="button" class="btn btn-outline-secondary w-100">Map</button>
					</div>
				</div>					
			</div>

			<table class="table table-striped mt-2">
				<thead>
					<tr class="d-none d-sm-table-row">
						<th class="time">Time</th>
						<th class="name">Name</th>
						<th class="location">Location</th>
						<th class="address">Address</th>
						<th class="region">Region</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ($meetings as $meeting) {?>
					<tr>
						<td class="d-block d-sm-table-cell time"><?php echo format_time($meeting->time)?></td>
						<td class="d-block d-sm-table-cell name"><a href="<?php echo $meeting->url?>"><?php echo format_name($meeting->name)?></a></td>
						<td class="d-block d-sm-table-cell location"><?php echo format_location($meeting->location)?></td>
						<td class="d-block d-sm-table-cell address"><?php echo format_address($meeting->formatted_address)?></td>
						<td class="d-block d-sm-table-cell region"><?php echo format_region($meeting->region)?></td>
					</tr>
					<?php }?>
				</tbody>
			</table>
		</div>
		<script src="https://unpkg.com/react@16/umd/react.production.min.js" crossorigin="anonymous"></script>
		<script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js" crossorigin="anonymous"></script>		
		<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
		<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js" integrity="sha384-o+RDsa0aLu++PJvFqy8fFScvbHFLtbvScb8AjopnFD+iEQ7wo/CG0xlczd+2O/em" crossorigin="anonymous"></script>
	</body>
</html>