import pandas as pd
import requests
import time
import random
import shutil
from urllib.parse import urlparse

# Fallback images from your API
# Use YOUR fallback image from API  
FALLBACK_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT27gTKHqKhHk3i-EiarE5Q9IND_awvKaKjxw&s"

def clean_url(raw_url):
    """Clean URL from CSV data"""
    if not isinstance(raw_url, str) or not raw_url.strip():
        return None
    
    # Remove common wrapper patterns
    url = raw_url.strip().replace("c(", "").replace(")", "").replace('"', "")
    
    # Take first URL if multiple
    if "," in url:
        url = url.split(",")[0].strip()
    
    # Basic validation - be more lenient
    if "http" in url and "." in url:
        return url
    
    return None

def validate_image_url(url, timeout=10):
    """Check if image URL is accessible - less strict validation"""
    if not url:
        return False
    
    try:
        # Set headers to mimic a browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Try HEAD request first (faster)
        response = requests.head(url, headers=headers, timeout=timeout, allow_redirects=True)
        
        # Accept more status codes - be less strict
        if response.status_code in [200, 301, 302, 403]:  # Sometimes 403 means accessible but blocked HEAD requests
            return True
        
        # If HEAD fails, try GET request (some servers block HEAD)
        if response.status_code == 405:  # Method not allowed
            try:
                response = requests.get(url, headers=headers, timeout=timeout, stream=True)
                if response.status_code in [200, 301, 302]:
                    return True
            except:
                pass
        
        return False
        
    except Exception:
        return False

def validate_and_fix_csv(csv_path):
    """Validate image URLs and fix broken ones with placeholders"""
    
    print(f"Loading CSV from {csv_path}...")
    
    # Load CSV
    try:
        df = pd.read_csv(csv_path, encoding='utf-8')
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return None
    
    # Handle BOM in column names
    if "\ufeffRecipeId" in df.columns:
        df = df.rename(columns={"﻿RecipeId": "RecipeId"})
    
    print(f"Found {len(df)} recipes")
    
    # Check if Images column exists
    if 'Images' not in df.columns:
        print("No 'Images' column found in CSV")
        return None
    
    # Track statistics
    total_recipes = len(df)
    valid_count = 0
    fixed_count = 0
    
    print(f"\nValidating image URLs with LENIENT validation...")
    print("Fixing broken images with placeholder images")
    print("-" * 60)
    
    for index, row in df.iterrows():
        recipe_name = row.get('Name', f'Recipe {index}')
        original_url = row.get('Images', '')
        
        # Clean the URL
        cleaned_url = clean_url(original_url)
        
        if not cleaned_url:
            df.at[index, 'Images'] = FALLBACK_IMAGE
            fixed_count += 1
            print(f"Row {index}: {recipe_name[:40]:<40} | NO URL -> FIXED")
        else:
            # Test if URL is accessible (with lenient validation)
            if validate_image_url(cleaned_url):
                # URL is working
                df.at[index, 'Images'] = cleaned_url
                valid_count += 1
                print(f"Row {index}: {recipe_name[:40]:<40} | VALID")
            else:
                # URL is broken, replace with YOUR fallback
                df.at[index, 'Images'] = FALLBACK_IMAGE
                fixed_count += 1
                print(f"Row {index}: {recipe_name[:40]:<40} | BROKEN -> FIXED")
        
        # Progress update
        if (index + 1) % 100 == 0:
            print(f"\nProgress: {index + 1}/{total_recipes} processed")
            print(f"Valid: {valid_count}, Fixed: {fixed_count}")
            print("-" * 60)
        
        # Minimal delay to be respectful to servers
        if index % 20 == 0:
            time.sleep(0.1)
    
    # Final statistics
    print(f"\n{'='*60}")
    print("VALIDATION COMPLETE")
    print(f"{'='*60}")
    print(f"Total recipes processed: {total_recipes}")
    print(f"Valid image URLs: {valid_count}")
    print(f"Fixed with placeholders: {fixed_count}")
    print(f"Success rate: {(valid_count/total_recipes)*100:.1f}% had working images")
    print(f"All {total_recipes} recipes preserved!")
    
    return df

if __name__ == "__main__":
    # Configuration
    CSV_FILE = "updatedRecipe.csv"  # Your CSV file name
    
    print("CSV Recipe Image Fixer")
    print("=" * 60)
    print("This script will FIX broken images with placeholders")
    print("All recipes will be preserved!")
    print("=" * 60)
    
    # Get confirmation
    confirmation = input("Type 'FIX' to fix broken images with placeholders: ")
    if confirmation != 'FIX':
        print("Operation cancelled.")
        exit()
    
    # Create backup
    backup_file = CSV_FILE.replace('.csv', '_backup.csv')
    try:
        shutil.copy2(CSV_FILE, backup_file)
        print(f"Backup created: {backup_file}")
    except Exception as e:
        print(f"Error creating backup: {e}")
        exit()
    
    # Process the CSV
    fixed_data = validate_and_fix_csv(CSV_FILE)
    
    if fixed_data is not None:
        # Save the fixed data back to original file
        try:
            fixed_data.to_csv(CSV_FILE, index=False, encoding='utf-8')
            print(f"\nFixed CSV saved to: {CSV_FILE}")
            print(f"Backup available at: {backup_file}")
            print("\nAll your recipes are preserved with working images!")
            print("Restart your API server to see the changes!")
        except Exception as e:
            print(f"Error saving fixed CSV: {e}")
    else:
        print("Failed to process CSV file")