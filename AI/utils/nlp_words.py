import csv
import re

csv_file_name = "newRecipeUpdate.csv"
txt_file_name = "nlpWords2.txt"
nlpList = []

with open(csv_file_name, "r", encoding="utf-8") as file:
    csv_reader = csv.DictReader(file)

    for row in csv_reader:

        if "name" not in row:
            print("The 'name' column is missing in the CSV file.")
            break

        temp = row["name"]
        temp = re.sub(r"[^a-zA-Z0-9\s]", "", temp)
        print(temp.strip())

        nlpList.append(temp)

nlpList = list(set(nlpList))


with open(txt_file_name, "w", encoding="utf-8") as file:
    for word in nlpList:
        file.write(word + "\n")
