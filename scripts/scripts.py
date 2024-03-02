import csv
import pandas as pd
import json

# Get the unique route_id/shape_id pairings from the trips
with open("data/trips.txt", "r") as trip_file:
  reader = csv.DictReader(trip_file)
  # Tuples for hashable even though it's a scruffy way
  all_trip_routes = set((row["route_id"], row["shape_id"]) for row in reader)

# Use the routes to check if a route matches a certain route
with open("data/routes.txt", "r") as route_file:
  reader = csv.DictReader(route_file)
  data = {}
  for row in reader:
    for trip in all_trip_routes:
      if row["route_id"] == trip[0]:
        # Put all shape id in with route data
        data[row["route_id"]] = row
        data[row["route_id"]]["shape_id"] = trip[1]


  for item in data.values():
    print(f"Route: {item['route_long_name']}, Shape: {item['shape_id']}")