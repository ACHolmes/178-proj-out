import csv
import pandas as pd
import json
import os

class GiveMeUsefulData():
  def __init__(self):
    self.data_dir = "data"
    self.output_dir = "out"
    self.output_json_name = "data.json"

    # Keeping all the raw data here, these should never be modified outside of init
    self.routes_raw     = pd.read_csv(os.path.join(self.data_dir, "routes.txt"))
    self.trips_raw      = pd.read_csv(os.path.join(self.data_dir, "trips.txt"))
    self.shapes_raw     = pd.read_csv(os.path.join(self.data_dir, "shapes.txt"))
    self.stops_raw      = pd.read_csv(os.path.join(self.data_dir, "stops.txt"))
    self.stop_times_raw = pd.read_csv(os.path.join(self.data_dir, "stop_times.txt"))
    self.calendar_raw   = pd.read_csv(os.path.join(self.data_dir, "calendar.txt"))

    # Get rid of some meaningless data or empty columns
    self.trips_raw.drop(columns=[
      "wheelchair_accessible",
      "bikes_allowed",
      "direction_id",
      "block_id"
    ], inplace=True)
    self.stops_raw.drop(columns=[
      "stop_desc",
      "stop_url",
      "location_type",
      "stop_timezone",
      "wheelchair_boarding",
      "platform_code"
    ], inplace=True)
    self.routes_raw.drop(columns=[
      "agency_id",
      "route_type"
    ], inplace=True)
    self.stop_times_raw.drop(columns=[
      "stop_headsign",
      "pickup_type",
      "drop_off_type",
      "timepoint"
    ], inplace=True)

    # Replace NaNs with empty strings
    self.trips_raw["trip_short_name"] = self.trips_raw["trip_short_name"].fillna("")
    self.trips_raw["trip_headsign"]   = self.trips_raw["trip_headsign"].fillna("")

  # Currently the actual useful thing
  def create_json(self):

    # Just creating JSON with all the route data
    self.routes_raw.to_json(os.path.join(self.output_dir, "routes.json"), orient='records', lines=True)
    with open(os.path.join(self.output_dir, "routes.json"), "r") as f:
      data = [json.loads(line) for line in f]

    # Make sure every route has an empty shape, trying to help
    # ppl avoid errors later
    for route in data:
      route["shapes"] = {}

    # Unique route/shape pairs in trips
    route_shape_pairs = set((row["route_id"], row["shape_id"]) for _, row in self.trips_raw.iterrows())

    # Put the shape ids in for each shape found with a route id match
    # initialize with empty points for that shape id
    for route in data:
      for pair in route_shape_pairs:
        if (route["route_id"] == pair[0]):
          route["shapes"][pair[1]] = {
            "points": []
          }

    # Alright this will take a while but whatever
    # Add all shape points for each shape
    for _, row in self.shapes_raw.iterrows():
      for route in data:
        # Check shape id of this point is one of the shapes with this route
        if row["shape_id"] in route["shapes"].keys():
          # Convert to dictionary not to mess with original df
          r = dict(row)
          shape_id = r.pop("shape_id")
          # Put all the geographic data in the points info for appropriate shape id
          route["shapes"][shape_id]["points"].append(r)
          break

    # Dump what we have to json for now
    with open(os.path.join(self.output_dir, "data1.json"), "w") as f:
      json.dump(data, f)

    # Time to start adding stop data
    with open(os.path.join(self.output_dir, "data1.json"), "r") as f:
      data = json.load(f)

    for route in data:
      route["trips"] = {}

    for route in data:
      for _, trip in self.trips_raw.iterrows():
        if route["route_id"] == trip["route_id"]:
          t = dict(trip)
          t.pop("route_id")
          trip_id = t["trip_id"]
          route["trips"][trip_id] = t
    with open(os.path.join(self.output_dir, "data2.json"), "w") as f:
      json.dump(data, f)


    with open(os.path.join(self.output_dir, "data2.json"), "r") as f:
      data = json.load(f)

    for route in data:
      for trip_id in route["trips"].keys():
        route["trips"][trip_id]["stops"] = []
        route["trips"][trip_id]["days"] = []

    for route in data:
      for _, stop_time in self.stop_times_raw.iterrows():
        if str(stop_time["trip_id"]) in route["trips"].keys():
          stop_t = dict(stop_time)
          trip_id = str(stop_t.pop("trip_id"))
          route["trips"][trip_id]["stops"].append(stop_t)

    with open(os.path.join(self.output_dir, "data3.json"), "w") as f:
      json.dump(data, f)

    with open(os.path.join(self.output_dir, "data3.json"), "r") as f:
      data = json.load(f)


    # Python for loops are slow, this will be fun
    for route in data:
      for _, service in self.calendar_raw.iterrows():
        for trip_id, trip_data in route["trips"].items():
          if service["service_id"] == trip_data["service_id"]:
            for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
              if (service[day]):
                route["trips"][trip_id]["days"].append(day)

    with open(os.path.join(self.output_dir, "data4.json"), "w") as f:
      json.dump(data, f)


  def get_unique_service_ids(self):
    return self.trips_raw.service_id.unique()


  def show_unique_service_ids(self):
    uniques = self.trips_raw.service_id.unique()
    with pd.option_context('display.max_rows', None, 'display.max_columns', None):
      print(uniques)


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