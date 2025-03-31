import os
import json
import django
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dsp.settings')
django.setup()

from api.models import (
    Age, CarrierData, Environment, Exchange, Language, 
    Impression, DevicePrice, Device, DistinctInterest,
    BrandSafety, BuyType, Viewability
)

def load_json_data(model_class, json_file, field_mapping):
    """
    Load data from a JSON file into a Django model
    field_mapping: dict mapping JSON keys to model fields
    """
    file_path = os.path.join('data', json_file)
    print(f"Loading data from {json_file}...")
    
    try:
        with open(file_path, 'r') as f:
            json_data = json.load(f)
            
        # Handle different JSON structures
        if json_file == 'impression.json':
            # Special handling for impression.json
            data = json_data.get('data', {})
            if model_class == Impression:
                # Store the entire data object as JSON
                impression_data = {
                    'impression': data,
                    'label': 'Impression Data'
                }
                try:
                    obj, created = Impression.objects.get_or_create(**impression_data)
                    if created:
                        print(f"Created new Impression record")
                    else:
                        print(f"Updated existing Impression record")
                except Exception as e:
                    print(f"Error creating/updating Impression: {str(e)}")
                return
        else:
            # Handle standard structure with 'data' array
            if isinstance(json_data, dict) and 'data' in json_data:
                data = json_data['data']
            else:
                data = json_data
            
            if not isinstance(data, list):
                print(f"Warning: Expected list data in {json_file}, got {type(data)}")
                return
                
            print(f"Found {len(data)} records to process")
            
            for item in data:
                # Map JSON data to model fields
                model_data = {}
                for json_key, model_field in field_mapping.items():
                    if json_key in item:
                        model_data[model_field] = item[json_key]
                
                # Create or update the model instance
                try:
                    obj, created = model_class.objects.get_or_create(**model_data)
                    if created:
                        print(f"Created new {model_class.__name__}: {model_data}")
                    else:
                        print(f"Updated existing {model_class.__name__}: {model_data}")
                except Exception as e:
                    print(f"Error creating/updating {model_class.__name__} with data {model_data}: {str(e)}")
            
        print(f"Successfully loaded data from {json_file}")
    except Exception as e:
        print(f"Error loading {json_file}: {str(e)}")

def main():
    # Define field mappings for each model
    mappings = {
        'age.json': {
            'model': Age,
            'mapping': {
                'value': 'age',
                'label': 'label'
            }
        },
        'carrier-data.json': {
            'model': CarrierData,
            'mapping': {
                'value': 'carrier',
                'label': 'label'
            }
        },
        'environment.json': {
            'model': Environment,
            'mapping': {
                'value': 'value',
                'label': 'label'
            }
        },
        'exchange.json': {
            'model': Exchange,
            'mapping': {
                'value': 'exchange',
                'label': 'label'
            }
        },
        'language.json': {
            'model': Language,
            'mapping': {
                'value': 'value',
                'label': 'label'
            }
        },
        'impression.json': {
            'model': Impression,
            'mapping': {
                'value': 'impression',
                'label': 'label'
            }
        },
        'device-price.json': {
            'model': DevicePrice,
            'mapping': {
                'value': 'price',
                'label': 'label'
            }
        },
        'device.json': {
            'model': Device,
            'mapping': {
                'value': 'value',
                'label': 'label'
            }
        },
        'interest.json': {
            'model': DistinctInterest,
            'mapping': {
                'value': 'interest',
                'label': 'label'
            }
        },
        'brand_safety.json': {
            'model': BrandSafety,
            'mapping': {
                'value': 'value',
                'label': 'label'
            }
        },
        'buy_type.json': {
            'model': BuyType,
            'mapping': {
                'value': 'value',
                'label': 'label'
            }
        },
        'viewability.json': {
            'model': Viewability,
            'mapping': {
                'value': 'value',
                'label': 'label'
            }
        }
    }

    # Load data for each model
    for json_file, config in mappings.items():
        load_json_data(config['model'], json_file, config['mapping'])

if __name__ == '__main__':
    main() 