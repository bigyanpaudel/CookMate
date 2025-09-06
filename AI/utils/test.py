import requests
import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

csv_file_name = "updatedRecipe.csv"
new_csv = "newinRecipeUpdate.csv"
image_list = []


def search_photos(query: str) -> str:
    chrome_options = Options()
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(options=chrome_options)
    search_url = f"https://www.google.com/search?tbm=isch&q={query.replace(' ', '+')}"
    driver.get(search_url)

    try:
        wait = WebDriverWait(driver, 10)

        browserClick = wait.until(
            EC.element_to_be_clickable(
                (
                    By.CSS_SELECTOR,
                    "#hdtb-sc > div > div.qogDvd > div.crJ18e > div > div:nth-child(2) > a > div",
                )
            )
        )
        browserClick.click()

        first_thumbnail = wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "/html/body/div[3]/div/div[15]/div/div[2]/div[2]/div/div/div/div/div[1]/div/div/div[2]/div[2]/h3/a/div/div/div/g-img/img",
                )
            )
        )
        first_thumbnail.click()

        img_url = wait.until(
            EC.presence_of_element_located(
                (
                    By.CSS_SELECTOR,
                    "#Sva75c > div.A8mJGd.NDuZHe > div.LrPjRb > div > div.BIB1wf.EIehLd.fHE6De.Emjfjd > c-wiz > div > div.v6bUne > div.p7sI2.PUxBg > a > img.sFlh5c.FyHeAf.iPVvYb",
                )
            )
        )
        src = img_url.get_attribute("src")
        return src if src else "No valid image found."

    except Exception as e:
        print(f"Error occurred while fetching image for '{query}': {e}")
        return "Error"

    finally:
        driver.quit()


def retry_search(query: str, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            return search_photos(query)
        except Exception as e:
            print(f"Attempt {attempt + 1} failed for '{query}': {e}")
            if attempt == retries - 1:
                return "Error"


# Process the CSV file
with open(csv_file_name, mode="r", encoding="utf-8") as file:
    csv_reader = csv.DictReader(file)
    fieldnames = csv_reader.fieldnames

    for row in csv_reader:
        if "Error" in row["Images"] or not row["Images"]:
            photo_url = retry_search(row["Name"])
            if photo_url:
                row["Images"] = photo_url
                print(f"Image URL added for {row['Name']}: {photo_url}")
            else:
                print(f"No image found for {row['Name']}.")
        image_list.append(row)

# Save the updated CSV
try:
    with open(new_csv, mode="w", encoding="utf-8-sig", newline="") as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        csv_writer.writeheader()
        csv_writer.writerows(image_list)

    print(f"Image URLs added successfully to '{new_csv}'.")

except Exception as e:
    print(f"An error occurred while writing to the file: {e}")
""