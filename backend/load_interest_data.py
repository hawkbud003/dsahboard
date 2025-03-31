import os
import json
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dsp.settings')
django.setup()

from api.models import target_type

def load_interest_data():
    """
    Load interest data from interest.json into the TargetType model
    """
    file_path = os.path.join('data', 'interest.json')
    print("Loading interest data...")
    
    try:
        with open(file_path, 'r') as f:
            json_data = json.load(f)
            
        # Get the data array from the JSON
        if isinstance(json_data, dict) and 'data' in json_data:
            # The data is nested in an array, so we get the first element
            interests = json_data['data'][0]
        else:
            print("Error: Expected JSON data with 'data' array")
            return
            
        print(f"Found {len(interests)} interests to process")
        
        # Process each interest
        for interest in interests:
            try:
                # Create interest data dictionary
                interest_data = {
                    'targeting_type': interest.get('subcategory', ''),
                    'subcategory': interest.get('subcategory', ''),
                    'category': interest.get('category', '')
                }
                
                # Create or update the target type
                obj, created = target_type.objects.get_or_create(
                    targeting_type=interest_data['targeting_type'],
                    subcategory=interest_data['subcategory'],
                    category=interest_data['category'],
                    defaults=interest_data
                )
               
                
                if created:
                    print(f"Created new target type: {interest_data['value']}")
                else:
                    # Update existing target type
                    for key, value in interest_data.items():
                        setattr(obj, key, value)
                    obj.save()
                    print(f"Updated existing target type: {interest_data['value']}")
                    
            except Exception as e:
                print(f"Error processing interest {interest.get('subcategory', 'Unknown')}: {str(e)}")
                
        print("Successfully loaded interest data")
        
    except Exception as e:
        print(f"Error loading interest data: {str(e)}")

if __name__ == '__main__':
    load_interest_data() 