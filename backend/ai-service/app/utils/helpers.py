def safe_get(item, key, default=""):
    return item.get(key, default)


def combine_text(item):
    title = item.get("title", "")
    abstract = item.get("abstract", "")
    return f"{title} {abstract}"


def normalize_year(year, current_year):
    if not year:
        return 0.5
    return 1 / (1 + (current_year - year))