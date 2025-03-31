import os
import json
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dsp.settings')
django.setup()

from api.models import Location

def load_location_data():
    """
    Load location data from location.json into the Location model
    """
    file_path = os.path.join('data', 'location.json')
    print("Loading location data...")
    
    try:
        with open(file_path, 'r') as f:
            json_data = json.load(f)
            
        # Get the data array from the JSON
        if isinstance(json_data, dict) and 'data' in json_data:
            locations = json_data['data']
        else:
            print("Error: Expected JSON data with 'data' array")
            return
            
        print(f"Found {len(locations)} locations to process")
        
        # Process each location
        for location in locations:
            try:
                # Create location data dictionary
                location_data = {
                    'country': location.get('country', ''),
                    'state': location.get('state', ''),
                    'city': location.get('city', ''),
                    'tier': location.get('tier', ''),
                    'population': location.get('population', '')
                }
                
                # Create or update the location
                obj, created = Location.objects.get_or_create(
                    country=location_data['country'],
                    state=location_data['state'],
                    city=location_data['city'],
                    defaults=location_data
                )
                
                if created:
                    print(f"Created new location: {location_data['city']}, {location_data['state']}")
                else:
                    # Update existing location
                    for key, value in location_data.items():
                        setattr(obj, key, value)
                    obj.save()
                    print(f"Updated existing location: {location_data['city']}, {location_data['state']}")
                    
            except Exception as e:
                print(f"Error processing location {location.get('city', 'Unknown')}: {str(e)}")
                
        print("Successfully loaded location data")
        
    except Exception as e:
        print(f"Error loading location data: {str(e)}")

if __name__ == '__main__':
    load_location_data() 