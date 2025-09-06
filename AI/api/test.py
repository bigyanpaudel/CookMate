import re
import string
from difflib import get_close_matches
from nltk.stem import WordNetLemmatizer
import nltk

nltk.download("stopwords")
nltk.download("punkt")
nltk.download("wordnet")

turkish_stop_words = [
    "a", "acaba", "altı", "ama", "ancak", "bazen", "bazı", "belki", "ben",
    "benden", "beni", "benim", "bir", "biraz", "birçoğu", "biri", "birkaç", "biz",
    "bizden", "bize", "bizi", "bizim", "bu", "bunun", "bunu", "her", "herhangi", "hem",
    "hep", "için", "işte", "kadar", "karşı", "kendi", "kendine", "ki", "mı",
    "mi", "çok", "çünkü", "de", "den", "daha", "diğer", "ile", "ilgili",
    "gibi", "henüz", "hiç", "iç", "şu", "şöyle", "tüm", "tümü", "ya",
    "yani", "yok", "ve", "veya", "üzere",
]

stop_words = set(turkish_stop_words)
lemmatizer = WordNetLemmatizer()

food_related_words = []
try:
    with open("../utils/nlpWords.txt", "r", encoding="utf-8") as file:
        food_related_words = [line.strip().lower() for line in file if line.strip()]
except FileNotFoundError:
    print("FIle not found.")
    exit()
food_related_words = list(set(food_related_words))

def preprocess_text(text):
    phrases = [phrase.strip() for phrase in text.split(",")]

    results = []
    for phrase in phrases:
        original_phrase = phrase.lower()
        phrase = re.sub(r"\d+", "", original_phrase)
        phrase = phrase.translate(str.maketrans("", "", string.punctuation))

        words = phrase.split()
        processed_words = [
            lemmatizer.lemmatize(word) for word in words if word not in stop_words
        ]

        close_matches = get_close_matches(" ".join(processed_words), food_related_words, n=3, cutoff=0.65)

        if not close_matches:
            results.append(f"'{original_phrase}' yanlış yazılmış ancak yiyeceklerle ilgili öneri bulunamadı.")
        else:
            suggestion_text = f"'{original_phrase}' yanlış yazılmış. Yiyeceklerle ilgili öneriler: {', '.join(close_matches)}"
            results.append(suggestion_text)

    return "\n\n".join(results)

word = "limonlu turto,peynir rulalaro, bastırma"
print(preprocess_text(word))
