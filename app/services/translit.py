"""
Bidirectional transliteration for Uzbek (Cyrillic <-> Latin) and Russian phonetic mapping.
Enables seamless search regardless of script (e.g. 'буханка' <-> 'buxanka', 'нон' <-> 'non').
"""
import re

CYR_TO_LAT_MAP = {
    'ш': 'sh', 'ч': 'ch', 'ё': 'yo', 'ю': 'yu', 'я': 'ya', 'ц': 'ts',
    'ў': "o'", 'ғ': "g'", 'қ': 'q', 'ҳ': 'h', 'х': 'x', 'ж': 'j',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'э': 'e',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'ъ': "'", 'ь': '', 'ы': 'i', 'щ': 'sh'
}

LAT_TO_CYR_MULTI = [
    ("sh", "ш"), ("ch", "ч"), ("yo", "ё"), ("yu", "ю"), ("ya", "я"),
    ("ye", "е"), ("ts", "ц"),
    ("o'", "ў"), ("o‘", "ў"), ("o`", "ў"), ("o’", "ў"),
    ("g'", "ғ"), ("g‘", "ғ"), ("g`", "ғ"), ("g’", "ғ"),
]

LAT_TO_CYR_SINGLE = {
    'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е',
    'j': 'ж', 'z': 'з', 'i': 'и', 'y': 'й', 'k': 'к', 'l': 'л',
    'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с',
    't': 'т', 'u': 'у', 'f': 'ф', 'x': 'х', 'q': 'қ', 'h': 'ҳ',
    'w': 'в', 'c': 'к'
}

# Common grocery vocabulary synonyms across Russian and Uzbek
GROCERY_SYNONYMS = {
    "buxanka": ["буханка", "хлеб", "non", "нон"],
    "буханка": ["buxanka", "хлеб", "non", "нон"],
    "non": ["нон", "buxanka", "буханка", "lepeshka", "лепешка"],
    "нон": ["non", "buxanka", "буханка", "lepeshka", "лепешка"],
    "shakar": ["шакар", "сахар"],
    "шакар": ["shakar", "сахар"],
    "сахар": ["shakar", "шакар"],
    "kartoshka": ["картошка", "картофель"],
    "картошка": ["kartoshka", "картофель"],
    "piyoz": ["пиёз", "лук"],
    "пиёз": ["piyoz", "лук"],
    "лук": ["piyoz", "пиёз"],
    "tuxum": ["тухум", "яйца", "яйцо"],
    "тухум": ["tuxum", "яйца"],
    "sut": ["сут", "молоко"],
    "сут": ["sut", "молоко"],
    "yog'": ["ёғ", "масло"],
    "ёғ": ["yog'", "масло"],
    "maslo": ["масло", "yog'", "ёғ"],
    "suv": ["сув", "вода"],
    "сув": ["suv", "вода"],
    "un": ["ун", "мука"],
    "ун": ["un", "мука"],
    "choy": ["чой", "чай"],
    "чой": ["choy", "чай"],
}

def cyr_to_lat(text: str) -> str:
    """Converts Cyrillic text to Latin text."""
    if not text:
        return ""
    res = []
    low = text.lower()
    for ch in low:
        res.append(CYR_TO_LAT_MAP.get(ch, ch))
    return "".join(res)

def lat_to_cyr(text: str) -> str:
    """Converts Latin text to Cyrillic text."""
    if not text:
        return ""
    s = text.lower()
    for lat_pair, cyr_char in LAT_TO_CYR_MULTI:
        s = s.replace(lat_pair, cyr_char)
    res = []
    for ch in s:
        res.append(LAT_TO_CYR_SINGLE.get(ch, ch))
    return "".join(res)

def get_search_variants(query: str) -> list[str]:
    """Returns a list of search keyword variants for cross-script matching."""
    if not query:
        return []
    clean = query.strip().lower()
    variants = [clean]
    
    lat = cyr_to_lat(clean)
    if lat and lat not in variants:
        variants.append(lat)
        
    cyr = lat_to_cyr(clean)
    if cyr and cyr not in variants:
        variants.append(cyr)
        
    # Check grocery synonyms
    if clean in GROCERY_SYNONYMS:
        for syn in GROCERY_SYNONYMS[clean]:
            if syn not in variants:
                variants.append(syn)
    elif lat in GROCERY_SYNONYMS:
        for syn in GROCERY_SYNONYMS[lat]:
            if syn not in variants:
                variants.append(syn)
                
    return variants
