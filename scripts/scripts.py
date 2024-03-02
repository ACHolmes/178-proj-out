import csv
import pandas as pd
import json
import os

class GiveMeUsefulData():
  def __init__(self):
    self.data_dir = "data"
    self.output_dir = "out"
    self.intermediate_json_name = "temp.json"
    self.output_json_name = "data.json"
    self.routes = pd.read_csv(os.path.join(self.data_dir, "routes.txt"))
    self.trips = pd.read_csv(os.path.join(self.data_dir, "trips.txt"))
    self.shapes = pd.read_csv(os.path.join(self.data_dir, "shapes.txt"))

  # Currently the actual useful thing
  def create_json(self):

    # Just creating JSON with all the route data
    self.routes.to_json(os.path.join(self.output_dir, self.intermediate_json_name), orient='records', lines=True)
    with open(os.path.join(self.output_dir, self.intermediate_json_name), "r") as f:
      raw_data = [json.loads(line) for line in f]

    # Make sure every route has an empty shape, trying to help
    # ppl avoid errors later
    for route in raw_data:
      route["shapes"] = {}

    # Unique route/shape pairs in trips
    route_shape_pairs = set((row["route_id"], row["shape_id"]) for _, row in self.trips.iterrows())

    # Put the shape ids in for each shape found with a route id match
    # initialize with empty points for that shape id
    for route in raw_data:
      for pair in route_shape_pairs:
        if (route["route_id"] == pair[0]):
          route["shapes"][pair[1]] = {
            "points": []
          }

    # Alright this will take a while but whatever
    # Add all shape points for each shape
    for _, row in self.shapes.iterrows():
      for route in raw_data:
        # Check shape id of this point is one of the shapes with this route
        if row["shape_id"] in route["shapes"].keys():
          # Convert to dictionary not to mess with original df
          r = dict(row)
          shape_id = r.pop("shape_id")
          # Put all the geographic data in the points info for appropriate shape id
          route["shapes"][shape_id]["points"].append(r)
          break

    # Dump what we have to json for now
    with open(os.path.join(self.output_dir, self.output_json_name), "w") as f:
      json.dump(raw_data, f)

  # Initial testing thing, proven wrong since HUIT route has more than one shape
  # Can probably delete
  def show_route_shape_id_pairings(self):
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

GiveMeUsefulData().create_json()